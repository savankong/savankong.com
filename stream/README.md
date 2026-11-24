# Stream

A personal streaming app for movies, shows and music. Stream is the player; a
Jellyfin server does the library scanning, metadata and video conversion.

```
stream/
  web/                  the Stream app (browser and iPhone)
  jellyfin-theme.css    Stream colours for Jellyfin's own apps (used on the TV)
```

## Run it

You need Node 20 or newer and a running Jellyfin server.

```
cd stream/web
npm install
npm run dev
```

Open the address it prints (`http://localhost:5173`, or the "Network" address
from another device on the same Wi-Fi). Sign in with your Jellyfin server
address, for example `192.168.1.20:8096`, and your Jellyfin name and password.

On an iPhone, open the Network address in Safari, then Share > Add to Home
Screen to get a full-screen app icon.

`npm run build` writes a static site to `web/dist` that any web host can serve.

## What it does

- Home: pick up where you left off, next episodes, recently added.
- Movies, Shows and Albums libraries with sorting, plus search.
- Video: plays files directly when the browser can, and asks the server to
  convert them when it cannot. Resume position is saved on the server.
- Shows: seasons, episodes, and a prompt for the next episode.
- Music: album and song playback with a queue, a player bar that stays while
  you browse, and lock-screen controls.

## Limits

- **https and http do not mix.** A copy of Stream served over https (such as
  `stream.savankong.com`) cannot talk to a Jellyfin server on a plain `http://`
  home address; browsers block it. Until the server has an https address, run
  Stream on the home network as above.
- **Samsung TV (2017).** That TV's browser is too old to run this app. Use the
  Jellyfin TV app with `jellyfin-theme.css` there for now.
- Not built yet: offline downloads, subtitle and audio-track pickers, playlists.

## How it talks to Jellyfin

Everything goes through `web/src/api.ts`. Sign-in uses
`/Users/AuthenticateByName`; the token is kept in the browser's local storage
and sent in the `Authorization` header. Stream addresses that cannot carry a
header (video, audio) pass it as the `ApiKey` query parameter.
