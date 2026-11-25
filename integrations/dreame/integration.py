"""
Dreame robot vacuums, through the DreameHome cloud (same account as the
DreameHome app).

Settings (on the home-integrations worker):
  DREAME_USERNAME, DREAME_PASSWORD   DreameHome app login
  DREAME_COUNTRY                     account region: us (default), eu, cn, ru, sg, kr

The DreameHome protocol is vendored, unmodified, in ./dreame_vacuum from
Tasshack/dreame-vacuum (MIT); see dreame_vacuum/__init__.py for the commit.
To remove this integration, delete this folder (and its line in
integrations/requirements.txt), then press Remove on the Settings page.
"""

from __future__ import annotations

import threading
from typing import Any

from sdk import Device, Integration, NeedsSetup

# MIoT ids (dreame_vacuum/types.py: DreameVacuumPropertyMapping / ActionMapping)
PROPS = {
    "state": (2, 1),
    "error": (2, 2),
    "battery": (3, 1),
    "charging": (3, 2),
    "cleanMinutes": (4, 2),
    "cleanedArea": (4, 3),
}
ACTIONS = {"start": (2, 1), "pause": (2, 2), "dock": (3, 1), "stop": (4, 2), "locate": (7, 1)}

# DreameVacuumState -> the dashboard's vacuum statuses (sdk.VACUUM_STATUSES)
STATES = {
    1: "cleaning", 2: "idle", 3: "paused", 4: "error", 5: "returning", 6: "charging", 7: "cleaning",
    8: "drying", 9: "washing", 10: "returning", 11: "mapping", 12: "cleaning", 13: "docked", 14: "updating",
    15: "cleaning", 16: "station", 17: "returning", 18: "returning", 19: "station", 20: "station",
    21: "paused", 22: "emptying", 23: "remote",
}
# DreameVacuumErrorCode, plain words for the common ones
ERRORS = {
    1: "Wheels lifted", 2: "Cliff sensor", 3: "Bumper stuck", 5: "Bumper stuck", 6: "Wheels lifted",
    8: "Dust bin missing", 9: "Water tank missing", 10: "Water tank empty", 11: "Dust bin full",
    12: "Main brush tangled", 13: "Side brush tangled", 14: "Fan problem", 15: "Left wheel stuck",
    16: "Right wheel stuck", 17: "Stuck", 18: "Stuck", 19: "Can't find the dock", 20: "Battery low",
    21: "Charging problem",
}


class Dreame(Integration):
    name = "Dreame"
    settings = ["username", "password"]
    poll_seconds = 30

    def connect(self) -> list[Device]:
        # Imported here so the host can list this integration even if the
        # vendored protocol's packages aren't installed.
        from dreame_vacuum.protocol import DreameVacuumDreameHomeCloudProtocol, DreameVacuumProtocol

        username = self.ctx.setting("username")
        password = self.ctx.setting("password")
        country = self.ctx.setting("country", "us")
        cloud = DreameVacuumDreameHomeCloudProtocol(username, password, "dreame", country, self.ctx.load("refresh_token"))
        if not cloud.login():
            raise NeedsSetup("DreameHome sign-in failed. Check DREAME_USERNAME, DREAME_PASSWORD and DREAME_COUNTRY.")
        if cloud.auth_key:
            self.ctx.save("refresh_token", cloud.auth_key)  # Dreame rotates it

        self.vacuums: dict[str, dict[str, Any]] = {}
        for d in ((cloud.get_devices() or {}).get("page") or {}).get("records", []):
            model = str(d.get("model", ""))
            if ".vacuum." not in model:
                continue
            did = str(d["did"])
            proto = DreameVacuumProtocol(
                username=username, password=password, country=country, prefer_cloud=True,
                account_type="dreame", device_id=did, auth_key=cloud.auth_key,
            )
            proto.cloud.login()
            if not proto.connect():  # looks up the device's command host; no MQTT without a callback
                self.ctx.log.warning("%s: couldn't reach it through DreameHome", did)
                continue
            name = d.get("customName") or (d.get("deviceInfo") or {}).get("displayName") or "Vacuum"
            self.vacuums[did] = {"proto": proto, "name": name, "model": model, "lock": threading.Lock()}
        return self.poll()

    def _read(self, v: dict[str, Any], did: str) -> dict[str, Any] | None:
        keys = [{"did": did, "siid": s, "piid": p} for s, p in PROPS.values()]
        try:
            with v["lock"]:
                result = v["proto"].get_properties(keys) or []
        except Exception as e:
            self.ctx.log.warning("%s: status read failed: %s", v["name"], e)
            return None
        values = {}
        for item in result:
            if item.get("code", 0) == 0:
                for name, (s, p) in PROPS.items():
                    if item.get("siid") == s and item.get("piid") == p:
                        values[name] = item.get("value")
        return values

    def poll(self) -> list[Device]:
        out = []
        for did, v in self.vacuums.items():
            values = self._read(v, did)
            err = (values or {}).get("error") or 0
            out.append(
                Device(
                    id=did,
                    name=v["name"],
                    kind="vacuum",
                    model=v["model"],
                    online=values is not None,
                    battery=(values or {}).get("battery"),
                    capabilities=list(ACTIONS),
                    state={
                        "status": STATES.get((values or {}).get("state"), "unknown"),
                        "error": ERRORS.get(err, f"Error {err}") if err else None,
                        "charging": (values or {}).get("charging") in (1, 3),
                        "cleanMinutes": (values or {}).get("cleanMinutes"),
                        "cleanedArea": (values or {}).get("cleanedArea"),
                    },
                )
            )
        return out

    def act(self, device_id: str, action: str, params: dict[str, Any]) -> None:
        v = self.vacuums[device_id]
        siid, aiid = ACTIONS[action]
        with v["lock"]:
            v["proto"].action(siid, aiid)

    def close(self) -> None:
        for v in getattr(self, "vacuums", {}).values():
            try:
                v["proto"].disconnect()
            except Exception:
                pass
