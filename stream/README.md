# Kong

A personal streaming app for movies, shows and music, formerly called Stream
(the folder keeps that name). Kong is the player; a
Jellyfin server does the library scanning, metadata and video conversion.

```
stream/
  web/                  the Kong app (browser and iPhone)
  deploy/Caddyfile      serves Kong and Jellyfin from one https address
  jellyfin-theme.css    Kong's look for Jellyfin's own apps (used on the TV)
```

## Run it on the home network

You need Node 20 or newer and a running Jellyfin server.

```
cd stream/web
npm install
npm run dev
```

Open the address it prints (`http://localhost:5173`, or the "Network" address
from another device on the same Wi-Fi). Sign in with your Jellyfin server
address, for example `192.168.1.20:8096`, and your Jellyfin name and password.

## Put it on stream.savankong.com

Once the server is reachable over https, Kong is served from the same
address as Jellyfin, which is what lets a secure page talk to it.

1. Build the app: `cd stream/web && npm install && npm run build`.
2. Copy the contents of `stream/web/dist` to `S:\Server\Kong\app` on the
   server.
3. Replace the `stream.savankong.com` block in `S:\Server\Caddy\Caddyfile`
   with the one in `deploy/Caddyfile`, then restart the Caddy service.
4. Open `https://stream.savankong.com`. The server address is filled in; sign
   in with your Jellyfin name and password.

Jellyfin's own apps (the TVs) keep using `https://stream.savankong.com`
unchanged. To update Kong later, repeat steps 1 and 2.

On an iPhone, open the address in Safari, then Share > Add to Home Screen to
get a full-screen app icon.

## What it does

- Home: pick up where you left off, next episodes, recently added.
- Movies, Shows and Albums libraries with sorting, genre and unwatched filters.
- Search as you type, with recent searches.
- Video: its own player controls (skip 10 seconds, next episode, fullscreen,
  keyboard shortcuts) with a choice of subtitles and audio track. Files play
  directly when the browser can, and the server converts them when it cannot.
  Resume position is saved on the server.
- Shows: seasons, episodes, and a prompt for the next episode.
- Music: album and song playback with a queue, shuffle, a player bar that
  stays while you browse, and lock-screen controls.
- Playlists: create, add songs or whole albums, remove songs, delete.
- Downloads: save an album on the device and play it with no connection.

## Limits

- **Downloads need https.** Browsers only allow saving for offline use on a
  secure address (or `localhost`). The Download button is hidden otherwise,
  so it appears once Kong is on `https://stream.savankong.com`.
- **Downloads are music only.** Films are too large for a browser's storage.
- **https and http do not mix.** A copy of Kong on an https address cannot
  talk to a Jellyfin server on a plain `http://` address. Serving both from
  one address, as above, avoids this.
- **Picture subtitles** (Blu-ray and DVD styles) are not offered; text
  subtitles are.
- **Samsung TV (2017).** That TV's browser is too old to run this app. Use
  the Jellyfin TV app with `jellyfin-theme.css` there.

## Brand

Kong uses Your Roster's One Roster brand for type and colour: the Your Roster
typeface (in `web/public/fonts`) and One Roster's dark colour set with the
blue as the one action colour. The logo is the gorilla mark from Kong Reviews
(`web/public/kong-logo.svg`). Two things are Kong's own and differ from
One Roster's rules: it is dark throughout, and it keeps large rounded and
pill shapes for the glass look where One Roster uses a single 4px corner.

## The Jellyfin theme

`jellyfin-theme.css` gives Jellyfin's own interface Kong's colours, type and
shapes. Paste the whole file into Jellyfin: Dashboard > General > Custom CSS
code, then Save. To undo it, clear that box.

## How it talks to Jellyfin

Everything goes through `web/src/api.ts`. Sign-in uses
`/Users/AuthenticateByName`; the token is kept in the browser's local storage
and sent in the `Authorization` header. Media addresses that cannot carry a
header (video, audio) pass it as the `ApiKey` query parameter.
