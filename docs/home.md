# home.savankong.com

A private dashboard for running the house. It has three tabs:

- **Home**: whether anything needs attention (an offline camera, a low battery, a clip that wasn't saved), the house mode (Home / Away / Disarmed), one tile for each part of the house, and the latest activity.
- **Security**: the cameras, live view and recordings. This replaces the Ring Protect subscription: the Ring cameras stay, but recordings go to our own DigitalOcean storage.
- **Activity**: one feed of motion, doorbell rings and every change made from Home.

Cleaning (the Dreame robot vacuum) is connected: status, Start, Pause, Send home, Stop and Find it. Lights shows the floodlights on the Ring cameras. Climate and locks have tiles ready to be connected later.

## How it works

```
Ring camera ──motion / ring──▶ Ring cloud ──push alert──▶ home-recorder (DO worker)
                                    ▲                          │ opens a live stream (free on any plan)
                                    └──────── live video ──────┘ saves 30 s to MP4 + a thumbnail
                                                               ▼
                         DigitalOcean Spaces (private)  ◀── upload      Postgres: devices, clips, commands
                                                               ▲
                     home.savankong.com (Next.js, password) ── signed links to play and download
```

- **Recorder** (`worker/home-recorder.mts`): signs in to Ring with a refresh token and listens for motion and doorbell alerts. For each alert it starts a live view, copies 30 seconds of video (no re-encoding) to MP4, takes a thumbnail and uploads both to Spaces. It also runs the dashboard's requests (Record now, floodlight on or off, siren) and deletes clips older than 30 days.
- **Live view** (`app/home/LiveView.tsx`, `/live/<camera>`): the browser makes a WebRTC offer and sends it to `/api/home/live`. That queues a `live_start` request, and Postgres `NOTIFY` wakes the recorder at once. The recorder passes the offer to Ring and returns Ring's answer. From then on, video flows **directly from Ring to the browser**, not through DigitalOcean. Each view stops after `HOME_LIVE_SECONDS` (120 by default). It also stops when you press Stop, switch tabs or leave the page, to spare battery cameras.
- **Vacuum bridge** (`worker/dreame/bridge.py`, a Python worker named `home-dreame`): signs in to DreameHome with the app's account. Every 30 seconds it saves each vacuum's state, battery, errors and last clean to `home_devices`. It runs the dashboard's vacuum requests (`vacuum_start`, `vacuum_pause`, `vacuum_dock`, `vacuum_stop`, `vacuum_locate`), woken by the same `NOTIFY` as the recorder. Each worker only takes requests for its own devices (`ring…` or `dreame:…`). The DreameHome protocol itself is copied unchanged from [Tasshack/dreame-vacuum](https://github.com/Tasshack/dreame-vacuum) (MIT) at a pinned commit, in `worker/dreame/dreame_vacuum/`.
- **House mode**: Ring Modes (Home / Away / Disarmed) for the Ring location. The recorder stores the location as a `house` device. The switch on the Home tab queues a `mode_set` request, and changes made in the Ring app show up within a minute. What each mode does to each camera is still set in the Ring app.
- **Dashboard** (`app/home`): the same Next.js app as savankong.com. On the `home.` hostname, `middleware.ts` serves the `/home` pages at the site root and requires a login for every page and API route. Videos stay private in Spaces; the dashboard gives out signed links that expire after one hour.
- **Data** (`db/migrations/*_create_home`): `home_devices` (all devices, so new kinds can be added later), `home_clips`, `home_commands` (requests from the dashboard to the recorder) and `home_kv` (Ring's rotating refresh token and the recorder's heartbeat).

## Setup

1. **Database.** Apply the two home migrations to the app's Postgres, in order:
   ```bash
   psql "$DATABASE_URL" -f db/migrations/20261124031307_create_home/migration.sql
   ```
   ```bash
   psql "$DATABASE_URL" -f db/migrations/20261124033843_home_live/migration.sql
   ```
2. **Storage.** In DigitalOcean, create a Spaces bucket named `kong-home` in `nyc3`. Keep it private, with the CDN off. Create a Spaces access key and secret for it.
3. **Ring login.** On your own computer, in this repository:
   ```bash
   npm install
   ```
   ```bash
   npm run ring:auth
   ```
   Enter the Ring email, password and 2FA code. Copy the refresh token it prints. The recorder saves each new token Ring issues, so you only do this once. Do it again only if the dashboard reports a login failure.
4. **App settings.** Set the secrets in the DigitalOcean app (`.do/app.yaml` lists them all):
   - web: `HOME_PASSWORD` (the dashboard password), `HOME_SESSION_SECRET` (any random string of 32 or more characters, for example from `openssl rand -base64 48`), `SPACES_KEY`, `SPACES_SECRET`
   - home-recorder: `RING_REFRESH_TOKEN`, `SPACES_KEY`, `SPACES_SECRET`

   Apply the spec (`doctl apps update <app id> --spec .do/app.yaml`) or add the `home-recorder` worker in the console. **The spec has no `domains` section.** If you apply it with doctl, check afterwards that savankong.com is still attached.
5. **Domain.** In the app's Settings → Domains, add `home.savankong.com`. In GoDaddy, add a `CNAME` record for `home` that points to the app's `ondigitalocean.app` hostname.
6. **Dreame.** Set `DREAME_USERNAME` and `DREAME_PASSWORD` on the `home-dreame` worker: the email and password you use in the DreameHome app. Set `DREAME_COUNTRY` to your account's region (`us`, `eu`, `cn`, `ru`, `sg` or `kr`; it's `us` in the spec). The vacuum appears on the Home tab within a minute. If the sign-in fails, the Cleaning page shows the reason.
7. **Ring app.** For each camera:
   - Turn on Motion Alerts. The recorder only hears about events Ring would notify you about.
   - Turn off End-to-End Encryption, and turn off Ring Edge if the camera has it. With either one on, a third-party stream gets no video.
   - The recorder appears under Control Center → Authorized Client Devices as "home.savankong.com".
   - For the house-mode switch, turn on Modes in the Ring app (Settings → Modes) and choose what each camera does in Home, Away and Disarmed. Without Modes, the switch doesn't appear.
8. **Check, then cancel.** Walk past each camera and press the doorbell. Within about a minute the clip should appear on the dashboard and play. When every camera works, cancel Ring Protect.

## What changes compared with Ring Protect

- **Clips start a few seconds late.** Ring records from the moment of motion. Here the clip starts when the push alert arrives and the live stream connects, typically 3–8 seconds later.
- **One clip per event, 30 seconds long** (`HOME_CLIP_SECONDS`). A second alert during a recording is folded into the clip already running. At most 3 clips record at once (`HOME_MAX_PARALLEL`).
- **Battery cameras** use more battery: each clip is a live view, as if you had opened the camera in the Ring app.
- **Clips are kept for 30 days** (`HOME_RETENTION_DAYS`). At roughly 1–2 Mbps, a 30-second clip is about 4–8 MB.
- **The Ring app no longer shows history.** Live view, two-way talk and alerts in the Ring app still work. Home has its own live view, without talk.
- **Live view takes a few seconds to start**, as in the Ring app. It turns on Live View in Ring's sense, so a camera with Live View disabled by a Ring mode shows that error instead of video.
- **This uses Ring's unofficial API** (the `ring-client-api` library, also used by Homebridge and Home Assistant). Ring can change that API. Watch the "Recording on" indicator in the dashboard header.

## Risks to check on deploy

- **Outbound UDP from App Platform.** The recorder receives Ring's video over WebRTC to make clips. If the worker logs `Stream did not finish in time` for every clip, App Platform is blocking the media connection. Live view on the dashboard is not affected, because its video never touches the worker. In that case, run the same command on a small Droplet or on the home mini PC instead. Give it the same environment variables, and do not run it in two places at once.
- **Dreame is unofficial too.** DreameHome has no public API. The vendored protocol copies how the DreameHome app talks to Dreame's servers, including its TLS handshake. Dreame has changed this before, and the bridge stops working until the copied files are updated from a newer upstream commit (see `worker/dreame/dreame_vacuum/__init__.py`).
- **Ring login.** If the refresh token stops working, the header shows "Recorder offline" with the reason. Run `npm run ring:auth` again and update `RING_REFRESH_TOKEN`. A changed value takes priority over the saved token.

## Running it locally

`.env.local` needs `DATABASE_URL`, `HOME_PASSWORD`, `HOME_SESSION_SECRET` and the `SPACES_*` settings. Without `NEXT_PUBLIC_HOME_HOST`, the dashboard is at `http://localhost:3000/home`.

```bash
npm run dev
```

```bash
npm run home:recorder
```

## Adding the next device

1. Add a provider to the recorder: sign in, upsert each device into `home_devices` with its `kind` and `capabilities`, and handle the new actions in `pollCommands`.
2. The Home tab finds the device through `lib/home/systems.ts`, which maps kinds to systems (`light` → Lights, `thermostat` → Climate, `vacuum` → Cleaning, `lock` → Locks). Its tile switches from "Not connected" to connected.
3. Give the system its own page with controls, as Security has. Add the new actions to `changeLabel` in `lib/home/format.ts` so they read well in the Activity feed.
