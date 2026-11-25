# Integrations

Everything Home controls apart from Ring lives here, one folder per service. Ring is built in (`worker/home-recorder.mts`). Integrations aren't: you can add or delete them without touching the dashboard.

One worker, `home-integrations` (`python host.py`), runs every folder in this directory. Folders whose names start with `_` or `.` are skipped. For each integration the host:

- lists it on the dashboard's **Settings** page, with its status and an on/off switch
- polls its devices into the `home_devices` table as `<folder>:<device id>`
- runs the dashboard's commands for those devices

The dashboard draws every device from three fields alone: its **kind**, its **capabilities** and its **state**. It never needs to know the brand.

## Add a service

1. Copy `_template/` to a new folder named after the service, in lowercase, for example `hue/`. Its name becomes the integration's id and the prefix of its settings.
2. In `integration.py`, write the four methods:
   - `connect()`: sign in, find the devices, return them as `Device`s. Raise `NeedsSetup("…")` for bad or missing settings.
   - `poll()`: return every device with fresh state. Runs every `poll_seconds`.
   - `act(device_id, action, params)`: do one action. Only actions in the device's `capabilities` get here.
   - `close()` (optional): clean up when it's turned off.
3. Put the packages it needs, pinned, in its `requirements.txt`. Add a line `-r <folder>/requirements.txt` to `integrations/requirements.txt`.
4. List its settings in `settings` (for example `["api_key"]`). Add them to the `home-integrations` worker in DigitalOcean as `<FOLDER>_<NAME>` (for example `HUE_API_KEY`). Mark passwords and keys as secrets.
5. Deploy. It appears on the Settings page, and its devices appear on the Home tab.

Copy `_template` to a folder called `demo` to see every kind of device and control. Delete `demo` when you're done.

## Remove a service

Delete its folder and its line in `integrations/requirements.txt`, then deploy. The Settings page then shows it as "Removed from the code"; press **Remove** there to delete its devices and history. To pause a service without deleting it, use its switch on the Settings page; its devices are hidden until you turn it back on.

## Device kinds, state and actions

| kind | shown under | state the dashboard reads | actions it can offer |
| --- | --- | --- | --- |
| `light` | Lights | `on`, `brightness` (0–100) | `turn_on`, `turn_off`, `set_brightness` {level} |
| `switch`, `fan` | Switches and plugs | `on` | `turn_on`, `turn_off` |
| `thermostat` | Climate | `current`, `target`, `mode`, `unit` (e.g. `"°F"`) | `set_target` {target} |
| `vacuum` | Cleaning | `status` (see `sdk.VACUUM_STATUSES`), `error`, `charging`, `cleanMinutes`, `cleanedArea` | `start`, `pause`, `stop`, `dock`, `locate` |
| `lock` | Locks | `locked` | `lock`, `unlock` |
| `sensor` | Sensors | `readings`: `[{label, value, unit}]` | none |
| anything else | Other | `on` if it has `turn_on`/`turn_off` | any of the above |

Every device also has `name`, `model`, `online` and `battery` (a percentage or `None`). Devices that report an `error`, go offline, or have a battery under 20% show up under "needs attention" on the Home tab.

Other rules:

- `capabilities` is the source of truth. The dashboard only shows those buttons, and the host rejects anything else.
- Keep secrets in settings (environment variables), never in code.
- To keep a value between restarts (for example a rotating refresh token), use `self.ctx.save(key, value)` and `self.ctx.load(key)`.
- `self.ctx.log` is a logger. Its output shows in the worker's runtime logs.
- When something fails, raise an exception. The host shows its message on the Settings page and reconnects with backoff (1 to 10 minutes).

## What's here

- `host.py`: discovers and runs the integrations.
- `sdk.py`: the contract (`Integration`, `Device`, `Context`, `NeedsSetup`, kinds and actions). It mirrors `lib/home/kinds.ts` in the dashboard.
- `dreame/`: Dreame robot vacuums through the DreameHome cloud. Settings: `DREAME_USERNAME`, `DREAME_PASSWORD`, `DREAME_COUNTRY`.
- `_template/`: the starting point for a new one.
