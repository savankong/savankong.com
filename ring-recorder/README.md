# ring-recorder

Records your Ring doorbells **without a Ring Protect subscription**. When a doorbell is
pressed or detects motion, it opens a live stream and saves it as an MP4. It can then upload
each clip to Nextcloud, and the Nextcloud desktop app backs it up to your PC.

```
Ring push event (ring / motion / person)
  → live stream → ffmpeg → recordings/Front Door/2026-11-23/14-32-05_ding.mp4 (+ .json)
  → Nextcloud: Ring/Front Door/2026-11-23/...          (optional)
  → your PC via Nextcloud desktop sync
```

Built on the community library [`ring-client-api`](https://github.com/dgreif/ring). Ring has
no official API, so a Ring update can break it for a while.

## Requirements

- Node.js 20+ and `ffmpeg` (`sudo apt install -y nodejs ffmpeg`)
- **End-to-end encryption turned off** in the Ring app (Control Center → Video Encryption).
  If it's on, the video can't be read.

## Setup

```bash
cd ring-recorder
npm install
npm run auth          # Ring email, password, 2FA code → prints a refresh token
cp .env.example .env  # paste the token into RING_REFRESH_TOKEN, fill in Nextcloud details
npm start
```

After the first start, the token is kept in `data/token.json` and refreshed automatically.
**Keep `data/` private**, because it is a login to your Ring account.

Test it: press a doorbell. Within a few seconds you should see
`[Front Door] ding → recording 60s`, then `saved ...` and `uploaded ...`.

## Settings (`.env`)

| Setting | Default | What it does |
|---|---|---|
| `RECORD_DINGS` / `RECORD_MOTION` | `true` | Which events start a recording |
| `DING_SECONDS` / `MOTION_SECONDS` | `60` / `30` | Clip length |
| `CAMERAS` | all | Comma-separated camera names to include |
| `MAX_CONCURRENT` | `4` | Max simultaneous recordings |
| `TIMEZONE` | system | Timezone for folder and file names |
| `NEXTCLOUD_*` | off | Upload to Nextcloud over WebDAV (use an app password) |
| `DELETE_LOCAL_AFTER_UPLOAD` | `false` | Remove the local copy once it's on Nextcloud (keep `false` for the web app) |
| `CAM_PASSWORD` | off | Turns on the web app; 8+ characters |
| `RETENTION_DAYS` | `30` | Days of clips kept on the server (only deleted once on Nextcloud) |

Each clip has a `.json` next to it with the camera, start time, and every event that happened
during the clip. If a doorbell is pressed while a motion clip is already recording, the ring is
added to that clip and the file is named `_ding`.

Failed uploads stay on disk and are retried every 5 minutes.

## Run it on the server (systemd)

```bash
sudo useradd --system --create-home ringrec
sudo mkdir -p /opt/ring-recorder && sudo cp -r . /opt/ring-recorder
sudo chown -R ringrec: /opt/ring-recorder
cd /opt/ring-recorder && sudo -u ringrec npm ci --omit=dev
sudo cp ring-recorder.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now ring-recorder
journalctl -u ring-recorder -f
```

## Web app: cam.savankong.com

Set `CAM_PASSWORD` and the recorder also serves a web app on `127.0.0.1:8080`:

- **Cameras** across the top with their latest snapshot, battery, and a red *Recording* badge
  while a clip is being captured. Tap a camera to show only its clips.
- **Clips** grouped by day, filterable by Rings / People / Motion. New clips appear instantly.
- **Player** with markers for every event in the clip (click to jump), ↑/↓ to step through,
  and Download.
- **Live** view in the browser (WebRTC straight from Ring), up to 10 minutes per session.
- Works on phones; *Add to Home Screen* gives it an app icon.

Sign-in is a single password, with a 30-day cookie and lockout after 10 wrong tries in 15 minutes.

### One-command install (DigitalOcean Droplet Console, as root)

```bash
curl -fsSL https://raw.githubusercontent.com/savankong/savankong.com/claude/trusting-cerf-mkkb87/ring-recorder/deploy/install.sh \
  | CAM_PASSWORD='your password' bash
cam-login   # Ring email, password, 2FA code; starts the recorder
```

Re-run the same install command any time to update; it keeps your settings, Ring login and
recordings. It turns on HTTPS automatically once `cam.savankong.com` points at the server.

### Putting it online (manual)

1. **DNS:** add an `A` record `cam` → `165.227.112.116` (the Nextcloud droplet) wherever
   savankong.com's DNS is managed.
2. **nginx + HTTPS** on the droplet:
   ```bash
   sudo cp nginx-cam.savankong.com.conf /etc/nginx/sites-available/cam.savankong.com
   sudo ln -s /etc/nginx/sites-available/cam.savankong.com /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d cam.savankong.com
   ```
3. Set `CAM_PASSWORD` in `.env` and `sudo systemctl restart ring-recorder`.

## Limitations of recording without Ring Protect

- **The first 2–5 seconds are missed**, because the stream starts after Ring sends the event.
- **Battery doorbells drain faster**, because each clip is a live-view session. Consider
  `RECORD_MOTION=false` for battery doorbells, or limit them with `CAMERAS`.
- Clips only, no continuous recording.
- A ring that arrives during a motion clip doesn't make that clip longer.

## Backup to your PC

Install the [Nextcloud desktop client](https://nextcloud.com/install/#install-clients), sign in,
and sync the `Ring` folder. Every new clip will land on your PC automatically.
