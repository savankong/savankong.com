/**
 * home.savankong.com recorder.
 *
 * Replaces Ring Protect: keeps the Ring cameras, but every motion alert,
 * doorbell press or "record now" from the dashboard opens a live stream
 * (free on any Ring plan), saves N seconds to MP4, makes a thumbnail and
 * uploads both to DigitalOcean Spaces. Metadata goes to Postgres.
 *
 * Runs as a long-lived DigitalOcean App Platform worker: `npm run home:recorder`.
 */
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import pg from 'pg'
import {
  PushNotificationAction,
  RingApi,
  type Location,
  type PushNotificationDingV2,
  type RingCamera,
} from 'ring-client-api'
import { pgConfig, sql } from '../lib/db.ts'
import { deleteObjects, putObject, storageConfigured } from '../lib/home/storage.ts'

const int = (v: string | undefined, d: number) => (v && Number.isFinite(Number(v)) ? Number(v) : d)
const CLIP_SECONDS = int(process.env.HOME_CLIP_SECONDS, 30)
const RETENTION_DAYS = int(process.env.HOME_RETENTION_DAYS, 30)
const MAX_PARALLEL = int(process.env.HOME_MAX_PARALLEL, 3)
// ffmpeg-static is CommonJS; its default export is the binary's path.
const ffmpegStatic = createRequire(import.meta.url)('ffmpeg-static') as string | null
const FFMPEG = process.env.FFMPEG_PATH || ffmpegStatic || 'ffmpeg'
const LIVE_SECONDS = int(process.env.HOME_LIVE_SECONDS, 120)
const COMMAND_TTL_MS = 2 * 60_000
const LIVE_TTL_MS = 20_000 // the browser stops waiting for an answer after ~15 s

const cameras = new Map<string, RingCamera>()
const locations = new Map<string, Location>() // house modes live on Ring locations
const MODES = new Set(['home', 'away', 'disarmed'])
const recording = new Set<string>()
let api: RingApi | null = null
let stopping = false

const log = (...a: unknown[]) => console.log(new Date().toISOString(), '[home]', ...a)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const deviceId = (c: RingCamera) => `ring:${c.id}`

async function kvSet(key: string, value: string) {
  await sql`INSERT INTO home_kv (key, value, updated_at) VALUES (${key}, ${value}, now())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`
}
async function kvGet(key: string): Promise<string | null> {
  const rows = await sql`SELECT value FROM home_kv WHERE key = ${key}`
  return rows[0] ? String(rows[0].value) : null
}
const note = (msg: string | null) => (msg ? kvSet('recorder_note', msg) : sql`DELETE FROM home_kv WHERE key = 'recorder_note'`)

// ---------- Ring login ----------
// Ring rotates the refresh token. The newest one is kept in home_kv; the
// RING_REFRESH_TOKEN env var only seeds it (and wins again if you change it).
async function refreshToken(): Promise<string> {
  const env = process.env.RING_REFRESH_TOKEN?.trim()
  const stored = await kvGet('ring_refresh_token')
  if (env) {
    const seed = createHash('sha256').update(env).digest('hex')
    if (!stored || (await kvGet('ring_refresh_token_seed')) !== seed) {
      await kvSet('ring_refresh_token_seed', seed)
      await kvSet('ring_refresh_token', env)
      return env
    }
  }
  if (stored) return stored
  throw new Error('No Ring login yet. Run `npm run ring:auth` and set RING_REFRESH_TOKEN.')
}

// ---------- Devices ----------
const lastState = new Map<string, string>()

async function syncCamera(c: RingCamera) {
  const caps = ['record', ...(c.hasLight ? ['light'] : []), ...(c.hasSiren ? ['siren'] : [])]
  const data = c.data as { led_status?: string; siren_status?: { seconds_remaining?: number } }
  const light = c.hasLight ? data.led_status === 'on' : undefined
  const siren = c.hasSiren ? (data.siren_status?.seconds_remaining ?? 0) > 0 : undefined
  const state = JSON.stringify([c.name, c.isOffline, c.batteryLevel, caps, light, siren])
  if (lastState.get(deviceId(c)) === state) return
  lastState.set(deviceId(c), state)
  const meta = { ringEdge: c.isRingEdgeEnabled, hasBattery: c.hasBattery, charging: c.isCharging, light, siren }
  await sql`
    INSERT INTO home_devices (id, provider, kind, name, model, online, battery, capabilities, meta, updated_at)
    VALUES (${deviceId(c)}, 'ring', ${c.isDoorbot ? 'doorbell' : 'camera'}, ${c.name}, ${c.model},
            ${!c.isOffline}, ${c.batteryLevel}, ${JSON.stringify(caps)}::jsonb, ${JSON.stringify(meta)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, kind = EXCLUDED.kind, model = EXCLUDED.model,
      online = EXCLUDED.online, battery = EXCLUDED.battery, capabilities = EXCLUDED.capabilities,
      meta = EXCLUDED.meta, updated_at = now()`
}

/**
 * A Ring location with Modes turned on becomes a "house" device, so the
 * dashboard can show and switch Home / Away / Disarmed.
 */
async function syncLocation(loc: Location) {
  if (!(await loc.supportsLocationModeSwitching().catch(() => false))) return
  const id = `ring-location:${loc.id}`
  locations.set(id, loc)
  const save = (mode: string) =>
    sql`
      INSERT INTO home_devices (id, provider, kind, name, capabilities, meta, updated_at)
      VALUES (${id}, 'ring', 'house', ${loc.name}, '["mode"]'::jsonb, ${JSON.stringify({ mode })}::jsonb, now())
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, meta = EXCLUDED.meta, updated_at = now()`.catch((e) =>
      log('mode sync error', e),
    )
  loc.onLocationMode.subscribe((mode) => save(String(mode)))
  await save(String((await loc.getLocationMode()).mode))
}

// ---------- Recording ----------
function run(args: string[]): Promise<{ code: number | null; log: string }> {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, ['-hide_banner', ...args])
    let log = ''
    p.stderr.on('data', (d) => (log += d))
    p.on('error', reject)
    p.on('close', (code) => resolve({ code, log }))
  })
}

async function ffmpeg(args: string[]): Promise<void> {
  const { code, log } = await run(args)
  if (code !== 0) throw new Error(`ffmpeg exited ${code}: ${log.slice(-400)}`)
}

async function duration(file: string): Promise<number | null> {
  // `ffmpeg -i` with no output exits non-zero but prints the duration first.
  const { log } = await run(['-i', file])
  const m = /Duration: (\d+):(\d+):(\d+\.?\d*)/.exec(log)
  return m ? Math.round(Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])) : null
}

/** Streams the camera for CLIP_SECONDS into an MP4 (video copied, audio to AAC). */
async function capture(c: RingCamera, file: string) {
  const call = await c.streamVideo({
    output: ['-t', String(CLIP_SECONDS), '-movflags', '+faststart', '-f', 'mp4', file],
  })
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      call.stop()
      reject(new Error('Stream did not finish in time'))
    }, (CLIP_SECONDS + 60) * 1000)
    call.onCallEnded.subscribe(() => {
      clearTimeout(timer)
      resolve()
    })
  })
}

async function record(c: RingCamera, trigger: 'motion' | 'ding' | 'manual', detail: string | null, sourceId: string | null) {
  const id = deviceId(c)
  if (stopping) return
  if (recording.has(id)) return log(`${c.name}: already recording, ${trigger} folded into current clip`)
  if (recording.size >= MAX_PARALLEL) return log(`${c.name}: ${MAX_PARALLEL} clips already recording, skipped`)

  const rows = await sql`
    INSERT INTO home_clips (device_id, trigger, detail, source_event_id)
    VALUES (${id}, ${trigger}, ${detail}, ${sourceId})
    ON CONFLICT (source_event_id) DO NOTHING
    RETURNING id, started_at`
  if (!rows[0]) return // same Ring event delivered twice
  const clipId = Number(rows[0].id)
  const at = new Date(rows[0].started_at as string)
  recording.add(id)
  await sql`UPDATE home_devices SET last_event_at = now() WHERE id = ${id}`
  log(`${c.name}: recording clip ${clipId} (${trigger}${detail ? `, ${detail}` : ''})`)

  const dir = await mkdtemp(path.join(tmpdir(), 'home-clip-'))
  try {
    const video = path.join(dir, 'clip.mp4')
    const thumb = path.join(dir, 'thumb.jpg')
    await capture(c, video)
    const size = (await stat(video).catch(() => ({ size: 0 }))).size
    if (size < 10_000) throw new Error('Camera returned no video (is Ring Edge or end-to-end encryption on?)')

    const seconds = await duration(video)
    await ffmpeg(['-y', '-ss', '2', '-i', video, '-frames:v', '1', '-vf', 'scale=640:-2', '-q:v', '4', thumb]).catch(() =>
      ffmpeg(['-y', '-i', video, '-frames:v', '1', '-vf', 'scale=640:-2', '-q:v', '4', thumb]),
    )

    const day = at.toISOString().slice(0, 10).replaceAll('-', '/')
    const base = `home/clips/${day}/${clipId}-${c.id}`
    await putObject(`${base}.mp4`, await readFile(video), 'video/mp4')
    const thumbKey = await readFile(thumb)
      .then((b) => putObject(`${base}.jpg`, b, 'image/jpeg').then(() => `${base}.jpg`))
      .catch(() => null)

    await sql`UPDATE home_clips SET status = 'ready', video_key = ${`${base}.mp4`}, thumb_key = ${thumbKey},
              size_bytes = ${size}, duration_seconds = ${seconds} WHERE id = ${clipId}`
    log(`${c.name}: clip ${clipId} saved (${(size / 1e6).toFixed(1)} MB, ${seconds ?? '?'}s)`)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    log(`${c.name}: clip ${clipId} failed: ${msg}`)
    await sql`UPDATE home_clips SET status = 'failed', error = ${msg.slice(0, 500)} WHERE id = ${clipId}`
  } finally {
    recording.delete(id)
    await rm(dir, { recursive: true, force: true })
  }
}

function onNotification(c: RingCamera, n: PushNotificationDingV2) {
  const cat = n.android_config?.category
  const trigger = cat === PushNotificationAction.Ding ? 'ding' : cat === PushNotificationAction.Motion ? 'motion' : null
  if (!trigger) return
  const ding = n.data?.event?.ding
  const type = ding?.detection_type ?? ding?.subtype ?? null
  const detail = type && !['motion', 'ding', 'null', 'other_motion'].includes(type) ? type : null
  record(c, trigger, detail, ding?.id ? `ring:${ding.id}` : null).catch((e) => log('record error', e))
}

// ---------- Live view ----------
// The browser sends a WebRTC offer; Ring answers it and then streams straight
// to the browser. The recorder only relays the offer and answer, so live video
// never passes through DigitalOcean.
type LiveSession = ReturnType<RingCamera['createSimpleWebRtcSession']>
const live = new Map<string, { session: LiveSession; timer: NodeJS.Timeout }>()

async function startLive(c: RingCamera, sdp: unknown) {
  if (typeof sdp !== 'string' || !sdp.startsWith('v=')) throw new Error('No WebRTC offer')
  const session = c.createSimpleWebRtcSession()
  const answer = await session.start(sdp)
  // Cap every view so a closed tab can't drain a battery camera.
  const timer = setTimeout(() => endLive(session.sessionId), LIVE_SECONDS * 1000)
  live.set(session.sessionId, { session, timer })
  log(`${c.name}: live view started (${LIVE_SECONDS}s max)`)
  return { sdp: answer, session: session.sessionId, seconds: LIVE_SECONDS }
}

async function endLive(id: string) {
  const s = live.get(id)
  if (!s) return
  live.delete(id)
  clearTimeout(s.timer)
  await s.session.end().catch((e: unknown) => log('live end error', e))
}

// ---------- Commands from the dashboard ----------
let polling = false
async function pollCommands() {
  if (polling || stopping) return
  polling = true
  try {
    for (;;) {
      const rows = await sql`
        UPDATE home_commands SET status = 'running'
        WHERE id = (SELECT id FROM home_commands WHERE status = 'pending' ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1)
        RETURNING id, device_id, action, payload, created_at`
      const cmd = rows[0]
      if (!cmd) break
      const payload = (cmd.payload ?? {}) as Record<string, unknown>
      let result: unknown = null
      const finish = (error: string | null) =>
        sql`UPDATE home_commands SET status = ${error ? 'failed' : 'done'}, error = ${error},
            result = ${result === null ? null : JSON.stringify(result)}::jsonb, finished_at = now()
            WHERE id = ${cmd.id}`
      const c = cameras.get(String(cmd.device_id))
      try {
        const age = Date.now() - new Date(cmd.created_at as string).getTime()
        if (age > (cmd.action === 'live_start' ? LIVE_TTL_MS : COMMAND_TTL_MS)) throw new Error('Expired')
        if (cmd.action === 'live_stop') {
          await endLive(String(payload.session ?? ''))
          await finish(null)
          continue
        }
        if (cmd.action === 'mode_set') {
          const loc = locations.get(String(cmd.device_id))
          const mode = String(payload.mode ?? '')
          if (!loc) throw new Error('Ring Modes are not available for this location')
          if (!MODES.has(mode)) throw new Error(`Unknown mode ${mode}`)
          await loc.setLocationMode(mode as 'home' | 'away' | 'disarmed')
          log(`${loc.name}: mode set to ${mode}`)
          await finish(null)
          continue
        }
        if (!c) throw new Error('Device is not connected to the recorder')
        switch (cmd.action) {
          case 'live_start':
            result = await startLive(c, payload.sdp)
            break
          case 'record':
            record(c, 'manual', null, null).catch((e) => log('record error', e))
            break
          case 'light_on':
          case 'light_off':
            await c.setLight(cmd.action === 'light_on')
            c.requestUpdate() // refresh led_status so the dashboard toggle flips
            break
          case 'siren_on':
          case 'siren_off':
            await c.setSiren(cmd.action === 'siren_on')
            c.requestUpdate()
            break
          default:
            throw new Error(`Unknown action ${cmd.action}`)
        }
        await finish(null)
      } catch (e) {
        await finish(e instanceof Error ? e.message : String(e))
      }
    }
  } catch (e) {
    log('command poll error', e)
  } finally {
    polling = false
  }
}

/** Wakes pollCommands the moment the dashboard queues something (pg NOTIFY). */
function listenForCommands() {
  const client = new pg.Client(pgConfig())
  const retry = (e: unknown) => {
    log('command listener lost, retrying in 5 s', e instanceof Error ? e.message : e)
    client.removeAllListeners()
    client.end().catch(() => {})
    if (!stopping) setTimeout(listenForCommands, 5000)
  }
  client.on('notification', () => pollCommands())
  client.on('error', retry)
  client
    .connect()
    .then(() => client.query('LISTEN home_commands'))
    .catch(retry)
}

// ---------- Housekeeping ----------
async function heartbeat() {
  await kvSet('recorder_heartbeat', JSON.stringify({ cameras: cameras.size, recording: recording.size }))
}

async function prune() {
  const old = await sql`
    SELECT id, video_key, thumb_key FROM home_clips
    WHERE started_at < now() - make_interval(days => ${RETENTION_DAYS}) LIMIT 1000`
  if (old.length) {
    await deleteObjects(old.flatMap((r) => [r.video_key as string, r.thumb_key as string]))
    await sql`DELETE FROM home_clips WHERE id = ANY(${old.map((r) => Number(r.id))}::int[])`
    log(`pruned ${old.length} clips older than ${RETENTION_DAYS} days`)
  }
  await sql`DELETE FROM home_commands WHERE created_at < now() - interval '7 days'`
}

// ---------- Main ----------
async function connect() {
  if (!storageConfigured()) throw new Error('Spaces is not configured (SPACES_KEY, SPACES_SECRET, SPACES_BUCKET).')
  const token = await refreshToken()
  api = new RingApi({
    refreshToken: token,
    controlCenterDisplayName: 'home.savankong.com',
    cameraStatusPollingSeconds: 60,
    locationModePollingSeconds: 60, // picks up mode changes made in the Ring app
    avoidSnapshotBatteryDrain: true,
    ffmpegPath: FFMPEG,
  })
  api.onRefreshTokenUpdated.subscribe(({ newRefreshToken }) => {
    kvSet('ring_refresh_token', newRefreshToken).catch((e) => log('could not save refresh token', e))
  })

  const list = await api.getCameras()
  for (const c of list) {
    cameras.set(deviceId(c), c)
    await syncCamera(c)
    c.onData.subscribe(() => syncCamera(c).catch((e) => log('sync error', e)))
    c.onNewNotification.subscribe((n) => onNotification(c, n))
  }
  for (const loc of await api.getLocations()) await syncLocation(loc).catch((e) => log('location error', e))
  log(`connected: ${list.map((c) => c.name).join(', ') || 'no cameras'}; ${locations.size} location(s) with Modes`)
  await note(list.length ? null : 'Ring login works, but the account has no cameras.')
}

async function main() {
  log(`starting (clips ${CLIP_SECONDS}s, keep ${RETENTION_DAYS} days, ffmpeg ${FFMPEG})`)
  await sql`UPDATE home_clips SET status = 'failed', error = 'Recorder restarted while recording'
            WHERE status = 'recording'`

  for (let attempt = 1; !stopping; attempt++) {
    try {
      await connect()
      break
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      log(`connect failed: ${msg}`)
      await note(`Recorder can't start: ${msg}`).catch(() => {})
      api?.disconnect()
      api = null
      // Back off so a bad token doesn't hammer Ring's login.
      await sleep(Math.min(10, attempt) * 60_000)
    }
  }

  await heartbeat()
  setInterval(() => heartbeat().catch((e) => log('heartbeat error', e)), 30_000)
  listenForCommands()
  setInterval(() => pollCommands(), 2_000) // fallback if a notification is missed
  setInterval(() => prune().catch((e) => log('prune error', e)), 6 * 3600_000)
  prune().catch((e) => log('prune error', e))
}

async function shutdown() {
  if (stopping) return
  stopping = true
  log('stopping')
  await Promise.all([...live.keys()].map(endLive))
  for (let i = 0; i < 40 && recording.size; i++) await sleep(500)
  api?.disconnect()
  process.exit(0)
}
// Exported for tests; only starts when run directly (npm run home:recorder).
export { cameras, endLive, listenForCommands, live, pollCommands, prune, record, startLive, syncCamera }

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
