"""
home.savankong.com: Dreame robot vacuum bridge.

Signs in to the DreameHome cloud (the same account as the DreameHome app),
keeps each vacuum's status in home_devices, and runs the dashboard's
vacuum requests from home_commands (start, pause, send home, stop, locate).

The DreameHome protocol comes from the vendored dreame_vacuum package
(Tasshack/dreame-vacuum, MIT); see dreame_vacuum/__init__.py.

Run: python bridge.py   (DigitalOcean App Platform worker "home-dreame")
"""

from __future__ import annotations

import json
import logging
import os
import select
import signal
import threading
import time
from urllib.parse import parse_qs, urlencode, urlsplit, urlunsplit

import psycopg

log = logging.getLogger("home.dreame")

POLL_SECONDS = int(os.environ.get("DREAME_POLL_SECONDS", "30"))
COMMAND_TTL_SECONDS = 120

# MIoT service/property ids for Dreame vacuums (dreame_vacuum/types.py,
# DreameVacuumPropertyMapping and DreameVacuumActionMapping).
PROPS = {
    "state": (2, 1),
    "error": (2, 2),
    "battery": (3, 1),
    "charging": (3, 2),
    "cleanMinutes": (4, 2),
    "cleanedArea": (4, 3),
}
ACTIONS = {
    "vacuum_start": (2, 1),
    "vacuum_pause": (2, 2),
    "vacuum_dock": (3, 1),
    "vacuum_stop": (4, 2),
    "vacuum_locate": (7, 1),
}
# DreameVacuumState, folded into what the dashboard needs to say.
STATES = {
    1: "cleaning",
    2: "idle",
    3: "paused",
    4: "error",
    5: "returning",
    6: "charging",
    7: "cleaning",  # mopping
    8: "drying",
    9: "washing",
    10: "returning",  # to wash the mop
    11: "mapping",
    12: "cleaning",  # sweeping and mopping
    13: "docked",  # charging completed
    14: "updating",
    15: "cleaning",  # summoned clean
    16: "station",
    17: "returning",
    18: "returning",
    19: "station",
    20: "station",
    21: "paused",
    22: "emptying",
    23: "remote",
}
# DreameVacuumErrorCode, plain words for the common ones.
ERRORS = {
    1: "Wheels lifted",
    2: "Cliff sensor",
    3: "Bumper stuck",
    5: "Bumper stuck",
    6: "Wheels lifted",
    8: "Dust bin missing",
    9: "Water tank missing",
    10: "Water tank empty",
    11: "Dust bin full",
    12: "Main brush tangled",
    13: "Side brush tangled",
    14: "Fan problem",
    15: "Left wheel stuck",
    16: "Right wheel stuck",
    17: "Stuck",
    18: "Stuck",
    19: "Can't find the dock",
    20: "Battery low",
    21: "Charging problem",
}

stop = threading.Event()


# ---------- Database ----------
def connect_db() -> psycopg.Connection:
    """Same DATABASE_URL as the Node app; sslmode=require without CA checks, like lib/db.ts."""
    raw = os.environ["DATABASE_URL"]
    parts = urlsplit(raw)
    query = parse_qs(parts.query)
    mode = (query.pop("sslmode", ["require"]) or ["require"])[0]
    url = urlunsplit(parts._replace(query=urlencode(query, doseq=True)))
    return psycopg.connect(url, sslmode="disable" if mode == "disable" else "require", autocommit=True)


def kv_get(db, key: str) -> str | None:
    row = db.execute("SELECT value FROM home_kv WHERE key = %s", (key,)).fetchone()
    return row[0] if row else None


def kv_set(db, key: str, value: str) -> None:
    db.execute(
        """INSERT INTO home_kv (key, value, updated_at) VALUES (%s, %s, now())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()""",
        (key, value),
    )


def note(db, msg: str | None) -> None:
    if msg:
        kv_set(db, "dreame_note", msg)
    else:
        db.execute("DELETE FROM home_kv WHERE key = 'dreame_note'")


# ---------- Dreame cloud ----------
class Vacuum:
    """One vacuum on the DreameHome cloud."""

    def __init__(self, did: str, name: str, model: str, proto) -> None:
        self.did = did
        self.name = name
        self.model = model
        self.proto = proto
        self.lock = threading.Lock()  # the protocol object isn't thread-safe

    @property
    def device_id(self) -> str:
        return f"dreame:{self.did}"

    def read(self) -> dict:
        keys = [{"did": self.did, "siid": s, "piid": p} for s, p in PROPS.values()]
        with self.lock:
            result = self.proto.get_properties(keys) or []
        values = {}
        for item in result:
            if item.get("code", 0) != 0:
                continue
            for name, (s, p) in PROPS.items():
                if item.get("siid") == s and item.get("piid") == p:
                    values[name] = item.get("value")
        return values

    def act(self, action: str) -> None:
        s, a = ACTIONS[action]
        with self.lock:
            self.proto.action(s, a)


class DreameCloud:
    """Thin wrapper so tests can swap in a fake without loading the vendored code."""

    def __init__(self, username: str, password: str, country: str, refresh_token: str | None) -> None:
        # Imported here so the bridge's own logic can be tested without it.
        from dreame_vacuum.protocol import DreameVacuumDreameHomeCloudProtocol, DreameVacuumProtocol

        self._Protocol = DreameVacuumProtocol
        self.username, self.password, self.country = username, password, country
        self.cloud = DreameVacuumDreameHomeCloudProtocol(username, password, "dreame", country, refresh_token)

    def login(self) -> bool:
        return bool(self.cloud.login())

    @property
    def refresh_token(self) -> str | None:
        return self.cloud.auth_key

    def vacuums(self) -> list[Vacuum]:
        data = self.cloud.get_devices() or {}
        out = []
        for d in (data.get("page") or {}).get("records", []):
            model = str(d.get("model", ""))
            if ".vacuum." not in model:
                continue
            did = str(d["did"])
            name = d.get("customName") or (d.get("deviceInfo") or {}).get("displayName") or "Vacuum"
            proto = self._Protocol(
                username=self.username,
                password=self.password,
                country=self.country,
                prefer_cloud=True,
                account_type="dreame",
                device_id=did,
                auth_key=self.refresh_token,
            )
            proto.cloud.login()  # connect() needs a signed-in session
            if not proto.connect():  # looks up the device's command host; no MQTT without a callback
                log.warning("%s: couldn't reach the device through DreameHome", name)
                continue
            out.append(Vacuum(did, name, model, proto))
        return out


# ---------- Sync ----------
def save_status(db, v: Vacuum, values: dict | None) -> None:
    online = values is not None
    values = values or {}
    state_code = values.get("state")
    error_code = values.get("error") or 0
    meta = {
        "state": STATES.get(state_code, "unknown") if online else "offline",
        "stateCode": state_code,
        "error": ERRORS.get(error_code, f"Error {error_code}") if error_code else None,
        "charging": values.get("charging") in (1, 3),
        "cleanMinutes": values.get("cleanMinutes"),
        "cleanedArea": values.get("cleanedArea"),
    }
    db.execute(
        """INSERT INTO home_devices (id, provider, kind, name, model, online, battery, capabilities, meta, updated_at)
           VALUES (%s, 'dreame', 'vacuum', %s, %s, %s, %s, %s::jsonb, %s::jsonb, now())
           ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, model = EXCLUDED.model, online = EXCLUDED.online,
             battery = COALESCE(EXCLUDED.battery, home_devices.battery), capabilities = EXCLUDED.capabilities,
             meta = EXCLUDED.meta, updated_at = now()""",
        (
            v.device_id,
            v.name,
            v.model,
            online,
            values.get("battery"),
            json.dumps(list(ACTIONS)),
            json.dumps(meta),
        ),
    )


def poll_status(db, vacuums: list[Vacuum]) -> None:
    for v in vacuums:
        try:
            save_status(db, v, v.read())
        except Exception as e:  # one bad read shouldn't stop the loop
            log.warning("%s: status read failed: %s", v.name, e)
            save_status(db, v, None)


def run_commands(db, vacuums: dict[str, Vacuum]) -> int:
    """Claims vacuum commands only; Ring ones belong to the Node recorder."""
    done = 0
    while not stop.is_set():
        row = db.execute(
            """UPDATE home_commands SET status = 'running'
               WHERE id = (SELECT id FROM home_commands
                           WHERE status = 'pending' AND device_id LIKE 'dreame:%%'
                           ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1)
               RETURNING id, device_id, action, extract(epoch FROM now() - created_at)"""
        ).fetchone()
        if not row:
            return done
        cid, device_id, action, age = row
        error = None
        try:
            v = vacuums.get(device_id)
            if age > COMMAND_TTL_SECONDS:
                raise RuntimeError("Expired")
            if v is None:
                raise RuntimeError("Vacuum is not connected to the bridge")
            if action not in ACTIONS:
                raise RuntimeError(f"Unknown action {action}")
            v.act(action)
            log.info("%s: %s", v.name, action)
            time.sleep(2)  # let the robot report its new state
            save_status(db, v, v.read())
        except Exception as e:
            error = str(e)[:500] or e.__class__.__name__
        db.execute(
            """UPDATE home_commands SET status = %s, error = %s, finished_at = now() WHERE id = %s""",
            ("failed" if error else "done", error, cid),
        )
        done += 1
    return done


def listen(stop_event: threading.Event, wake: threading.Event) -> None:
    """Sets `wake` on every pg NOTIFY home_commands, so requests run at once."""
    while not stop_event.is_set():
        try:
            with connect_db() as conn:
                conn.execute("LISTEN home_commands")
                while not stop_event.is_set():
                    if select.select([conn.fileno()], [], [], 5)[0]:
                        for _ in conn.notifies(timeout=0):
                            wake.set()
        except Exception as e:
            log.warning("command listener lost (%s), retrying in 5 s", e)
            stop_event.wait(5)


def sign_in(db, make_cloud) -> tuple[object, list[Vacuum]]:
    """Signs in, keeps Dreame's rotating refresh token, lists the vacuums. Backs off on failure."""
    attempt = 0
    while not stop.is_set():
        attempt += 1
        try:
            cloud = make_cloud(kv_get(db, "dreame_refresh_token"))
            if not cloud.login():
                raise RuntimeError("DreameHome sign-in failed. Check DREAME_USERNAME, DREAME_PASSWORD and DREAME_COUNTRY.")
            if cloud.refresh_token:
                kv_set(db, "dreame_refresh_token", cloud.refresh_token)
            vacuums = cloud.vacuums()
            note(db, None if vacuums else "Signed in to DreameHome, but the account has no vacuums.")
            log.info("connected: %s", ", ".join(v.name for v in vacuums) or "no vacuums")
            return cloud, vacuums
        except Exception as e:
            log.error("sign-in failed: %s", e)
            note(db, f"Vacuum bridge can't sign in: {e}")
            stop.wait(min(10, attempt) * 60)  # don't hammer Dreame's login
    raise SystemExit(0)


def main(make_cloud=None) -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [dreame] %(message)s")
    if make_cloud is None:
        username = os.environ.get("DREAME_USERNAME", "")
        password = os.environ.get("DREAME_PASSWORD", "")
        country = os.environ.get("DREAME_COUNTRY", "us")

        def make_cloud(token):
            return DreameCloud(username, password, country, token)

    db = connect_db()
    _, vacuums = sign_in(db, make_cloud)
    by_id = {v.device_id: v for v in vacuums}

    wake = threading.Event()
    threading.Thread(target=listen, args=(stop, wake), daemon=True).start()

    next_poll = 0.0
    while not stop.is_set():
        now = time.time()
        if now >= next_poll:
            poll_status(db, vacuums)
            kv_set(db, "dreame_heartbeat", json.dumps({"vacuums": len(vacuums)}))
            next_poll = now + POLL_SECONDS
        run_commands(db, by_id)
        wake.wait(timeout=2)  # NOTIFY wakes us at once; 2 s fallback
        wake.clear()


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, lambda *_: stop.set())
    signal.signal(signal.SIGINT, lambda *_: stop.set())
    main()
