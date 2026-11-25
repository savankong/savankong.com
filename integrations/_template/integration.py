"""
Template for a new integration. Copy this folder to integrations/<your id>/
(lowercase, no leading "_"), then replace the fake devices below with calls to
the real service. Full guide: integrations/README.md.

As written it simulates one device of each kind, so a copy named "demo" shows
every control the dashboard knows how to draw.

Settings come from environment variables named <ID>_<NAME>; list the
required ones in `settings`, read them with self.ctx.setting("name").
"""

from __future__ import annotations

from typing import Any

from sdk import Device, Integration


class Template(Integration):
    name = "Template"  # shown on the Settings page
    settings: list[str] = []  # e.g. ["api_key"] -> TEMPLATE_API_KEY must be set
    poll_seconds = 30

    def connect(self) -> list[Device]:
        # Sign in here. Raise NeedsSetup("...") for bad settings; any other
        # error is shown on the Settings page and retried with backoff.
        self.devices = {
            "kitchen": Device(
                id="kitchen", name="Kitchen", kind="light",
                capabilities=["turn_on", "turn_off", "set_brightness"],
                state={"on": True, "brightness": 70},
            ),
            "porch": Device(
                id="porch", name="Porch", kind="light",
                capabilities=["turn_on", "turn_off"], state={"on": False},
            ),
            "tree": Device(
                id="tree", name="Christmas tree", kind="switch",
                capabilities=["turn_on", "turn_off"], state={"on": False},
            ),
            "hall": Device(
                id="hall", name="Hallway", kind="thermostat", capabilities=["set_target"],
                state={"current": 68, "target": 70, "mode": "heat", "unit": "°F"},
            ),
            "front": Device(
                id="front", name="Front door", kind="lock", battery=74,
                capabilities=["lock", "unlock"], state={"locked": True},
            ),
            "robot": Device(
                id="robot", name="Downstairs", kind="vacuum", battery=100,
                capabilities=["start", "pause", "stop", "dock", "locate"],
                state={"status": "docked", "error": None, "cleanMinutes": 24, "cleanedArea": 31},
            ),
            "garage": Device(
                id="garage", name="Garage", kind="sensor",
                state={"readings": [{"label": "Temperature", "value": 51, "unit": "°F"},
                                    {"label": "Humidity", "value": 62, "unit": "%"}]},
            ),
        }
        return self.poll()

    def poll(self) -> list[Device]:
        # Read every device's current state from the service.
        return list(self.devices.values())

    def act(self, device_id: str, action: str, params: dict[str, Any]) -> None:
        # Only actions listed in the device's capabilities reach here.
        d = self.devices[device_id]
        if action in ("turn_on", "turn_off"):
            d.state["on"] = action == "turn_on"
        elif action == "set_brightness":
            d.state["brightness"] = max(0, min(100, int(params["level"])))
            d.state["on"] = d.state["brightness"] > 0
        elif action == "set_target":
            d.state["target"] = float(params["target"])
        elif action in ("lock", "unlock"):
            d.state["locked"] = action == "lock"
        elif action in ("start", "pause", "stop", "dock"):
            d.state["status"] = {"start": "cleaning", "pause": "paused", "stop": "idle", "dock": "returning"}[action]
