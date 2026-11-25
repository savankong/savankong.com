"""
The contract between home.savankong.com and an integration.

An integration is a folder under integrations/ with an integration.py that
defines one subclass of Integration. The host (host.py) finds it, gives it a
Context, and calls connect() / poll() / act(). The dashboard never needs to
know which brand a device is: it draws controls from each device's `kind`,
`capabilities` and `state`. See integrations/README.md.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any, Callable

# ---------------------------------------------------------------------------
# Device kinds and the actions (capabilities) the dashboard knows how to draw.
# A device lists the actions it supports in `capabilities`; the dashboard
# only shows those, and the host only accepts those.
# ---------------------------------------------------------------------------
KINDS = {
    "light": "Lights",  # state: on (bool), brightness (0-100)
    "switch": "Switches and plugs",  # state: on (bool)
    "fan": "Fans",  # state: on (bool)
    "vacuum": "Cleaning",  # state: status, error, charging, cleanMinutes, cleanedArea
    "thermostat": "Climate",  # state: current, target (°F or °C as `unit`), mode, unit
    "lock": "Locks",  # state: locked (bool)
    "sensor": "Sensors",  # state: readings: [{label, value, unit}]
}

ACTIONS = {
    "turn_on": "Turn on",
    "turn_off": "Turn off",
    "set_brightness": "Set brightness",  # params: level (0-100)
    "start": "Start",
    "pause": "Pause",
    "stop": "Stop",
    "dock": "Send home",
    "locate": "Find (beep)",
    "set_target": "Set temperature",  # params: target (number)
    "lock": "Lock",
    "unlock": "Unlock",
}

# Vacuum `status` values the dashboard has words for.
VACUUM_STATUSES = (
    "cleaning", "idle", "paused", "error", "returning", "charging", "docked",
    "drying", "washing", "mapping", "updating", "station", "emptying", "remote",
)


@dataclass
class Device:
    """One thing the house can show or control."""

    id: str  # unique within the integration (the host adds the "<integration>:" prefix)
    name: str
    kind: str  # one of KINDS (anything else shows under "Other")
    capabilities: list[str] = field(default_factory=list)  # subset of ACTIONS
    state: dict[str, Any] = field(default_factory=dict)
    model: str | None = None
    online: bool = True
    battery: int | None = None


class Context:
    """What the host gives an integration: settings, a small store, a logger."""

    def __init__(self, integration_id: str, env: dict[str, str], kv_get: Callable, kv_set: Callable) -> None:
        self.id = integration_id
        self._env = env
        self._kv_get = kv_get
        self._kv_set = kv_set
        self.log = logging.getLogger(f"home.{integration_id}")

    def setting(self, name: str, default: str | None = None) -> str | None:
        """Environment variable <ID>_<NAME>, e.g. setting("username") reads DREAME_USERNAME."""
        value = self._env.get(f"{self.id.upper()}_{name.upper()}")
        return value if value not in (None, "") else default

    def load(self, key: str) -> str | None:
        """Persistent value (e.g. a rotating refresh token), namespaced to this integration."""
        return self._kv_get(f"{self.id}:{key}")

    def save(self, key: str, value: str) -> None:
        self._kv_set(f"{self.id}:{key}", value)


class NeedsSetup(Exception):
    """Raise from connect() when settings are missing; the dashboard shows the message."""


class Integration:
    """Subclass this in integrations/<id>/integration.py."""

    name = "Unnamed"  # shown on the Settings page
    settings: list[str] = []  # required settings, e.g. ["username", "password"]
    poll_seconds = 30

    def __init__(self, ctx: Context) -> None:
        self.ctx = ctx

    def connect(self) -> list[Device]:
        """Sign in and return the devices. Raise NeedsSetup or any error; the host retries with backoff."""
        raise NotImplementedError

    def poll(self) -> list[Device]:
        """Return every device with fresh state. Called every poll_seconds."""
        raise NotImplementedError

    def act(self, device_id: str, action: str, params: dict[str, Any]) -> None:
        """Do `action` (one of the device's capabilities) on `device_id` (without the prefix)."""
        raise NotImplementedError

    def close(self) -> None:
        """Called when the integration is turned off or the host stops."""
