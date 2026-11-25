"""
home.savankong.com integrations host.

Runs every integration folder under integrations/ (except ones starting with
"_" or "."), each in its own thread:

- registers it in home_integrations, so the dashboard's Settings page lists it
- connects, then polls its devices into home_devices ("<id>:<device id>")
- runs dashboard commands for its devices (woken at once by pg NOTIFY)
- stops when it's turned off on the Settings page, and resumes when turned on

Ring is not here; it's built in (worker/home-recorder.mts).

Run: python host.py   (DigitalOcean App Platform worker "home-integrations")
Env: DATABASE_URL, plus each integration's settings (e.g. DREAME_USERNAME).
     HOME_INTEGRATIONS=a,b limits which folders load (default: all).
     HOME_INTEGRATIONS_DIR points at another folder of integrations (tests).
"""

from __future__ import annotations

import importlib.util
import inspect
import json
import logging
import os
import select
import signal
import sys
import threading
import time
import traceback
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlsplit, urlunsplit

import psycopg

from sdk import ACTIONS, Context, Device, Integration, NeedsSetup

HERE = Path(__file__).resolve().parent
# Where integration folders live; overridable for tests.
ROOT = Path(os.environ.get("HOME_INTEGRATIONS_DIR") or HERE)
COMMAND_TTL_SECONDS = 120
log = logging.getLogger("home.host")
stop = threading.Event()


# ---------- Database ----------
def connect_db() -> psycopg.Connection:
    """Same DATABASE_URL as the Node app; sslmode=require without CA checks, like lib/db.ts."""
    parts = urlsplit(os.environ["DATABASE_URL"])
    query = parse_qs(parts.query)
    mode = (query.pop("sslmode", ["require"]) or ["require"])[0]
    url = urlunsplit(parts._replace(query=urlencode(query, doseq=True)))
    return psycopg.connect(url, sslmode="disable" if mode == "disable" else "require", autocommit=True)


# ---------- Discovery ----------
def discover() -> dict[str, type[Integration] | Exception]:
    """integrations/<id>/integration.py -> its Integration subclass (or the import error)."""
    only = {s.strip() for s in os.environ.get("HOME_INTEGRATIONS", "").split(",") if s.strip()}
    found: dict[str, type[Integration] | Exception] = {}
    for folder in sorted(ROOT.iterdir()):
        iid = folder.name
        if not folder.is_dir() or iid.startswith(("_", ".")) or not (folder / "integration.py").exists():
            continue
        if only and iid not in only:
            continue
        try:
            sys.path.insert(0, str(folder))  # so the integration can import its own vendored packages
            spec = importlib.util.spec_from_file_location(f"integration_{iid}", folder / "integration.py")
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            classes = [
                c for _, c in inspect.getmembers(module, inspect.isclass)
                if issubclass(c, Integration) and c is not Integration and c.__module__ == module.__name__
            ]
            if len(classes) != 1:
                raise RuntimeError(f"integration.py must define exactly one Integration subclass, found {len(classes)}")
            found[iid] = classes[0]
        except Exception as e:
            log.error("%s: couldn't load: %s", iid, e)
            found[iid] = e
    return found


# ---------- One integration ----------
class Runner(threading.Thread):
    def __init__(self, iid: str, cls: type[Integration], wake: threading.Event) -> None:
        super().__init__(name=f"integration-{iid}", daemon=True)
        self.iid = iid
        self.cls = cls
        self.wake = wake
        self.log = logging.getLogger(f"home.{iid}")
        self.db: psycopg.Connection | None = None
        self.inst: Integration | None = None
        self.known: dict[str, Device] = {}

    # status row on the Settings page
    def status(self, status: str, note: str | None = None) -> None:
        self.db.execute(
            """UPDATE home_integrations SET status = %s, note = %s, last_seen_at = now(),
                 device_count = (SELECT count(*) FROM home_devices WHERE id LIKE %s)
               WHERE id = %s""",
            (status, note, f"{self.iid}:%", self.iid),
        )

    def enabled(self) -> bool:
        row = self.db.execute("SELECT enabled FROM home_integrations WHERE id = %s", (self.iid,)).fetchone()
        return bool(row and row[0])

    def kv_get(self, key: str) -> str | None:
        row = self.db.execute("SELECT value FROM home_kv WHERE key = %s", (key,)).fetchone()
        return row[0] if row else None

    def kv_set(self, key: str, value: str) -> None:
        self.db.execute(
            """INSERT INTO home_kv (key, value, updated_at) VALUES (%s, %s, now())
               ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()""",
            (key, value),
        )

    def save(self, devices: list[Device]) -> None:
        seen = set()
        for d in devices:
            if d.kind == "camera" or d.kind == "doorbell":
                continue  # cameras are Ring's; keep the Security tab honest
            caps = [c for c in d.capabilities if c in ACTIONS]
            full_id = f"{self.iid}:{d.id}"
            seen.add(full_id)
            self.known[full_id] = d
            self.db.execute(
                """INSERT INTO home_devices (id, provider, kind, name, model, online, battery, capabilities, meta, updated_at)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb, now())
                   ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, kind = EXCLUDED.kind, model = EXCLUDED.model,
                     online = EXCLUDED.online, battery = COALESCE(EXCLUDED.battery, home_devices.battery),
                     capabilities = EXCLUDED.capabilities, meta = EXCLUDED.meta, updated_at = now()""",
                (full_id, self.iid, d.kind, d.name, d.model, d.online, d.battery, json.dumps(caps), json.dumps(d.state, default=str)),
            )
        # Devices the integration stopped reporting are shown as offline, not deleted.
        self.db.execute(
            "UPDATE home_devices SET online = false, updated_at = now() WHERE id LIKE %s AND NOT (id = ANY(%s))",
            (f"{self.iid}:%", list(seen)),
        )

    def run_commands(self) -> None:
        ran = 0
        while not stop.is_set():
            row = self.db.execute(
                """UPDATE home_commands SET status = 'running'
                   WHERE id = (SELECT id FROM home_commands
                               WHERE status = 'pending' AND device_id LIKE %s
                               ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1)
                   RETURNING id, device_id, action, payload, extract(epoch FROM now() - created_at)""",
                (f"{self.iid}:%",),
            ).fetchone()
            if not row:
                break
            cid, device_id, action, payload, age = row
            error = None
            try:
                caps = self.db.execute("SELECT capabilities FROM home_devices WHERE id = %s", (device_id,)).fetchone()
                if age > COMMAND_TTL_SECONDS:
                    raise RuntimeError("Expired")
                if not caps or action not in (caps[0] or []):
                    raise RuntimeError(f"{action} isn't something this device can do")
                self.inst.act(device_id.split(":", 1)[1], action, payload or {})
                self.log.info("%s: %s %s", device_id, action, payload or "")
                ran += 1
            except Exception as e:
                error = str(e)[:500] or e.__class__.__name__
            self.db.execute(
                "UPDATE home_commands SET status = %s, error = %s, finished_at = now() WHERE id = %s",
                ("failed" if error else "done", error, cid),
            )
        if ran:
            time.sleep(1.5)  # let the devices report their new state, once per batch
            self.save(self.inst.poll())

    def connect_integration(self) -> bool:
        ctx = Context(self.iid, dict(os.environ), self.kv_get, self.kv_set)
        missing = [s for s in self.cls.settings if ctx.setting(s) is None]
        if missing:
            names = ", ".join(f"{self.iid.upper()}_{s.upper()}" for s in missing)
            self.status("needs_setup", f"Set {names} on the home-integrations worker.")
            return False
        try:
            self.inst = self.cls(ctx)
            self.save(self.inst.connect())
            self.status("connected")
            self.log.info("connected: %s", ", ".join(d.name for d in self.known.values()) or "no devices")
            return True
        except NeedsSetup as e:
            self.status("needs_setup", str(e))
        except Exception as e:
            self.log.error("connect failed: %s", e)
            self.status("error", f"Can't connect: {e}"[:500])
        self.inst = None
        return False

    def run(self) -> None:
        self.db = connect_db()
        attempt = 0
        next_poll = 0.0
        while not stop.is_set():
            try:
                if not self.enabled():
                    if self.inst:
                        self.inst.close()
                        self.inst = None
                    self.status("disabled")
                    stop.wait(10)
                    continue
                if self.inst is None:
                    attempt += 1
                    if not self.connect_integration():
                        # Back off (1 min, 2 min, ... 10 min), but notice being turned off sooner.
                        until = time.time() + min(10, attempt) * 60
                        while time.time() < until and not stop.is_set() and self.enabled():
                            stop.wait(10)
                        continue
                    attempt = 0
                    next_poll = time.time() + self.cls.poll_seconds
                if time.time() >= next_poll:
                    self.save(self.inst.poll())
                    self.status("connected")
                    next_poll = time.time() + self.cls.poll_seconds
                self.run_commands()
                self.wake.wait(timeout=2)  # NOTIFY wakes us at once
                self.wake.clear()
            except Exception as e:
                self.log.error("error: %s\n%s", e, traceback.format_exc(limit=3))
                try:
                    self.status("error", f"{e}"[:500])
                except Exception:
                    self.db = connect_db()  # lost the database connection
                if self.inst:
                    try:
                        self.inst.close()
                    except Exception:
                        pass
                    self.inst = None
                stop.wait(30)
        if self.inst:
            self.inst.close()


# ---------- Host ----------
def listen(wakes: list[threading.Event]) -> None:
    """Wakes every runner on pg NOTIFY home_commands."""
    while not stop.is_set():
        try:
            with connect_db() as conn:
                conn.execute("LISTEN home_commands")
                while not stop.is_set():
                    if select.select([conn.fileno()], [], [], 5)[0]:
                        for _ in conn.notifies(timeout=0):
                            for w in wakes:
                                w.set()
        except Exception as e:
            log.warning("command listener lost (%s), retrying in 5 s", e)
            stop.wait(5)


def register(db, found: dict) -> None:
    for iid, cls in found.items():
        name = cls.name if inspect.isclass(cls) else iid
        db.execute(
            """INSERT INTO home_integrations (id, name, status, note, last_seen_at) VALUES (%s, %s, %s, %s, now())
               ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status,
                 note = EXCLUDED.note, last_seen_at = now()""",
            (iid, name, "starting" if inspect.isclass(cls) else "error",
             None if inspect.isclass(cls) else f"Couldn't load: {cls}"[:500]),
        )
    # Folders that were removed: say so, and take their devices offline.
    gone = db.execute("SELECT id FROM home_integrations WHERE NOT (id = ANY(%s))", (list(found),)).fetchall()
    for (iid,) in gone:
        db.execute("UPDATE home_integrations SET status = 'missing', note = %s WHERE id = %s",
                   ("Its folder isn't in integrations/ any more. Remove it on the Settings page.", iid))
        db.execute("UPDATE home_devices SET online = false WHERE id LIKE %s", (f"{iid}:%",))


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
    found = discover()
    db = connect_db()
    register(db, found)
    runners = [Runner(iid, cls, threading.Event()) for iid, cls in found.items() if inspect.isclass(cls)]
    log.info("integrations: %s", ", ".join(found) or "none")
    for r in runners:
        r.start()
    threading.Thread(target=listen, args=([r.wake for r in runners],), daemon=True).start()
    while not stop.is_set():
        db.execute("INSERT INTO home_kv (key, value, updated_at) VALUES ('integrations_heartbeat', %s, now()) "
                   "ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()",
                   (json.dumps(sorted(found)),))
        stop.wait(30)
    for r in runners:
        r.join(timeout=10)


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, lambda *_: stop.set())
    signal.signal(signal.SIGINT, lambda *_: stop.set())
    main()
