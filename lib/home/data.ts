// Reads for the home dashboard. The recorder worker writes these tables.
import { sql } from '../db'
import { isCamera, stateOf } from './kinds'

export { isCamera }

export type Device = {
  id: string
  provider: string
  kind: string
  name: string
  model: string | null
  online: boolean
  battery: number | null
  capabilities: string[]
  meta: { light?: boolean; siren?: boolean; ringEdge?: boolean; hasBattery?: boolean; charging?: boolean }
  lastEventAt: Date | null
  updatedAt: Date
  latestThumbClipId: number | null
  clipsToday: number
}

export type Clip = {
  id: number
  deviceId: string
  deviceName: string
  trigger: string
  detail: string | null
  status: string
  startedAt: Date
  durationSeconds: number | null
  hasThumb: boolean
  hasVideo: boolean
  sizeBytes: number | null
  error: string | null
}

export type RecorderStatus = { online: boolean; lastBeat: Date | null; note: string | null }

const RECORDER_STALE_MS = 2 * 60_000

function toDevice(r: Record<string, unknown>): Device {
  return {
    id: String(r.id),
    provider: String(r.provider),
    kind: String(r.kind),
    name: String(r.name),
    model: (r.model as string) ?? null,
    online: Boolean(r.online),
    battery: r.battery == null ? null : Number(r.battery),
    capabilities: Array.isArray(r.capabilities) ? (r.capabilities as string[]) : [],
    meta: (r.meta as Device['meta']) ?? {},
    lastEventAt: r.last_event_at ? new Date(r.last_event_at as string) : null,
    updatedAt: new Date(r.updated_at as string),
    latestThumbClipId: r.latest_thumb_clip_id == null ? null : Number(r.latest_thumb_clip_id),
    clipsToday: Number(r.clips_today ?? 0),
  }
}

function toClip(r: Record<string, unknown>): Clip {
  return {
    id: Number(r.id),
    deviceId: String(r.device_id),
    deviceName: String(r.device_name ?? r.device_id),
    trigger: String(r.trigger),
    detail: (r.detail as string) ?? null,
    status: String(r.status),
    startedAt: new Date(r.started_at as string),
    durationSeconds: r.duration_seconds == null ? null : Number(r.duration_seconds),
    hasThumb: Boolean(r.thumb_key),
    hasVideo: Boolean(r.video_key),
    sizeBytes: r.size_bytes == null ? null : Number(r.size_bytes),
    error: (r.error as string) ?? null,
  }
}

export async function getDevices(): Promise<Device[]> {
  const rows = await sql`
    SELECT d.*,
      (SELECT c.id FROM home_clips c
         WHERE c.device_id = d.id AND c.thumb_key IS NOT NULL
         ORDER BY c.started_at DESC LIMIT 1) AS latest_thumb_clip_id,
      (SELECT count(*) FROM home_clips c
         WHERE c.device_id = d.id AND c.started_at > now() - interval '24 hours') AS clips_today
    FROM home_devices d
    WHERE NOT EXISTS (
      SELECT 1 FROM home_integrations i WHERE i.id = split_part(d.id, ':', 1) AND NOT i.enabled)
    ORDER BY CASE d.kind WHEN 'doorbell' THEN 0 WHEN 'camera' THEN 1 ELSE 2 END, d.name`
  return rows.map(toDevice)
}

export async function getDevice(id: string): Promise<Device | null> {
  const rows = await sql`
    SELECT d.*, NULL AS latest_thumb_clip_id, 0 AS clips_today FROM home_devices d WHERE d.id = ${id}`
  return rows[0] ? toDevice(rows[0]) : null
}

export async function getClips(opts: { deviceId?: string; trigger?: string; limit?: number; before?: Date } = {}) {
  const limit = Math.min(opts.limit ?? 60, 200)
  const rows = await sql`
    SELECT c.*, d.name AS device_name
    FROM home_clips c JOIN home_devices d ON d.id = c.device_id
    WHERE (${opts.deviceId ?? null}::text IS NULL OR c.device_id = ${opts.deviceId ?? null})
      AND (${opts.trigger ?? null}::text IS NULL OR c.trigger = ${opts.trigger ?? null})
      AND (${opts.before?.toISOString() ?? null}::timestamptz IS NULL OR c.started_at < ${opts.before?.toISOString() ?? null})
    ORDER BY c.started_at DESC
    LIMIT ${limit + 1}`
  const clips = rows.map(toClip)
  return { clips: clips.slice(0, limit), more: clips.length > limit }
}

export async function getClip(id: number): Promise<(Clip & { videoKey: string | null; thumbKey: string | null }) | null> {
  const rows = await sql`
    SELECT c.*, d.name AS device_name FROM home_clips c JOIN home_devices d ON d.id = c.device_id
    WHERE c.id = ${id}`
  if (!rows[0]) return null
  return { ...toClip(rows[0]), videoKey: (rows[0].video_key as string) ?? null, thumbKey: (rows[0].thumb_key as string) ?? null }
}

/** The clips just before and after this one, for prev/next navigation. */
export async function getNeighbours(clip: Clip): Promise<{ newer: number | null; older: number | null }> {
  const at = clip.startedAt.toISOString()
  const [newer, older] = await Promise.all([
    sql`SELECT id FROM home_clips WHERE (started_at, id) > (${at}::timestamptz, ${clip.id}) ORDER BY started_at, id LIMIT 1`,
    sql`SELECT id FROM home_clips WHERE (started_at, id) < (${at}::timestamptz, ${clip.id}) ORDER BY started_at DESC, id DESC LIMIT 1`,
  ])
  return { newer: newer[0] ? Number(newer[0].id) : null, older: older[0] ? Number(older[0].id) : null }
}

export async function getStats(): Promise<{ clipsToday: number; clipsTotal: number; bytesTotal: number; oldest: Date | null }> {
  const rows = await sql`
    SELECT
      count(*) FILTER (WHERE started_at > now() - interval '24 hours') AS today,
      count(*) AS total,
      coalesce(sum(size_bytes), 0) AS bytes,
      min(started_at) AS oldest
    FROM home_clips`
  const r = rows[0] ?? {}
  return {
    clipsToday: Number(r.today ?? 0),
    clipsTotal: Number(r.total ?? 0),
    bytesTotal: Number(r.bytes ?? 0),
    oldest: r.oldest ? new Date(r.oldest as string) : null,
  }
}

export async function getRecorderStatus(): Promise<RecorderStatus> {
  const rows = await sql`SELECT key, value, updated_at FROM home_kv WHERE key IN ('recorder_heartbeat', 'recorder_note')`
  const beat = rows.find((r) => r.key === 'recorder_heartbeat')
  const note = rows.find((r) => r.key === 'recorder_note')
  const lastBeat = beat ? new Date(beat.updated_at as string) : null
  return {
    online: Boolean(lastBeat && Date.now() - lastBeat.getTime() < RECORDER_STALE_MS),
    lastBeat,
    note: note ? String(note.value) : null,
  }
}

export type Pending = { deviceId: string; action: string; mode: string | null }

export async function getPendingCommands(): Promise<Pending[]> {
  const rows = await sql`
    SELECT device_id, action, payload->>'mode' AS mode FROM home_commands
    WHERE status IN ('pending', 'running') AND created_at > now() - interval '2 minutes'
      AND action NOT IN ('live_start', 'live_stop')
    ORDER BY id DESC`
  return rows.map((r) => ({ deviceId: String(r.device_id), action: String(r.action), mode: (r.mode as string) ?? null }))
}

// ---------- Whole-home views ----------

export type House = { id: string; name: string; mode: string }

/** The Ring location whose mode (Home / Away / Disarmed) the hub switches. */
export function houseOf(devices: Device[]): House | null {
  const d = devices.find((x) => x.kind === 'house')
  if (!d) return null
  return { id: d.id, name: d.name, mode: String((d.meta as { mode?: string }).mode ?? 'unset') }
}

export type Attention = { tone: 'bad' | 'warn'; title: string; text: string; href?: string }

export type Integration = {
  id: string
  name: string
  enabled: boolean
  status: string // starting | connected | needs_setup | error | disabled | missing
  note: string | null
  deviceCount: number
  lastSeenAt: Date | null
  online: boolean // the host has checked in recently
}

/** Integrations other than Ring, as registered by integrations/host.py. */
export async function getIntegrations(): Promise<{ list: Integration[]; hostOnline: boolean }> {
  const [rows, beat] = await Promise.all([
    sql`SELECT * FROM home_integrations ORDER BY name`,
    sql`SELECT updated_at FROM home_kv WHERE key = 'integrations_heartbeat'`,
  ])
  const hostOnline = Boolean(beat[0] && Date.now() - new Date(beat[0].updated_at as string).getTime() < 3 * 60_000)
  return {
    hostOnline,
    list: rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      enabled: Boolean(r.enabled),
      status: String(r.status),
      note: (r.note as string) ?? null,
      deviceCount: Number(r.device_count ?? 0),
      lastSeenAt: r.last_seen_at ? new Date(r.last_seen_at as string) : null,
      online: hostOnline,
    })),
  }
}

/** Things worth a look, worst first. Empty means all good. */
export function attentionItems(
  devices: Device[],
  recorder: RecorderStatus | null,
  failedToday: number,
  integrations: { list: Integration[]; hostOnline: boolean } | null = null,
): Attention[] {
  const out: Attention[] = []
  const live = integrations?.list.filter((i) => i.enabled) ?? []
  if (integrations && live.length && !integrations.hostOnline) {
    out.push({ tone: 'bad', title: 'Integrations offline', text: 'Lights, vacuum and other devices can’t be controlled.', href: '/settings' })
  }
  for (const i of live) {
    if (i.status === 'error' || i.status === 'needs_setup' || i.status === 'missing')
      out.push({ tone: i.status === 'error' ? 'bad' : 'warn', title: `${i.name} isn’t connected`, text: i.note ?? 'See Settings.', href: '/settings' })
  }
  for (const d of devices.filter((x) => !isCamera(x) && x.kind !== 'house')) {
    const s = stateOf(d)
    const href = `/devices/${encodeURIComponent(d.id)}`
    if (!d.online) out.push({ tone: 'warn', title: `${d.name} is offline`, text: 'It hasn’t reported in.', href })
    else if (s.error || s.status === 'error') out.push({ tone: 'bad', title: `${d.name} needs help`, text: s.error ?? 'Check it in its app.', href })
    else if (d.battery != null && d.battery < 20) out.push({ tone: 'warn', title: `${d.name} battery at ${d.battery}%`, text: 'Charge it soon.', href })
  }
  if (recorder && !recorder.online && devices.some(isCamera)) {
    out.push({ tone: 'bad', title: 'Recorder offline', text: recorder.note ?? 'New motion and rings aren’t being saved.' })
  }
  for (const d of devices.filter(isCamera)) {
    if (!d.online) out.push({ tone: 'bad', title: `${d.name} is offline`, text: 'Check its power and Wi-Fi.', href: `/live/${encodeURIComponent(d.id)}` })
    else if (d.battery != null && d.battery < 20)
      out.push({ tone: 'warn', title: `${d.name} battery at ${d.battery}%`, text: 'Charge it soon.', href: `/live/${encodeURIComponent(d.id)}` })
  }
  if (failedToday > 0) {
    out.push({
      tone: 'warn',
      title: `${failedToday} ${failedToday === 1 ? 'clip' : 'clips'} not saved today`,
      text: 'Open one to see why.',
      href: '/activity?show=failed',
    })
  }
  return out.sort((x, y) => Number(y.tone === 'bad') - Number(x.tone === 'bad'))
}

export async function getFailedToday(): Promise<number> {
  const rows = await sql`SELECT count(*) AS n FROM home_clips WHERE status = 'failed' AND started_at > now() - interval '24 hours'`
  return Number(rows[0]?.n ?? 0)
}

export type Change = {
  id: number
  deviceId: string
  deviceName: string
  action: string
  mode: string | null
  params: Record<string, unknown> | null
  status: string
  error: string | null
  at: Date
}

export type Activity = { kind: 'clip'; at: Date; clip: Clip } | { kind: 'change'; at: Date; change: Change }

export const clipActivity = (clips: Clip[]): Activity[] => clips.map((clip) => ({ kind: 'clip', at: clip.startedAt, clip }))

/**
 * Everything that happened, newest first: recorded clips plus changes made
 * from the dashboard (lights, siren, house mode, live views).
 */
export async function getActivity(opts: { show?: string; limit?: number; before?: Date } = {}) {
  const limit = Math.min(opts.limit ?? 60, 200)
  const show = opts.show ?? ''
  const before = opts.before?.toISOString() ?? null
  const wantClips = show !== 'changes'
  const wantChanges = show === '' || show === 'changes'
  const trigger = ['motion', 'ding', 'manual'].includes(show) ? show : null
  const failed = show === 'failed'

  const [clipRows, changeRows] = await Promise.all([
    wantClips
      ? sql`
        SELECT c.*, d.name AS device_name FROM home_clips c JOIN home_devices d ON d.id = c.device_id
        WHERE (${trigger}::text IS NULL OR c.trigger = ${trigger})
          AND (${failed} = false OR c.status = 'failed')
          AND (${before}::timestamptz IS NULL OR c.started_at < ${before})
        ORDER BY c.started_at DESC LIMIT ${limit + 1}`
      : Promise.resolve([]),
    wantChanges
      ? sql`
        SELECT m.id, m.device_id, d.name AS device_name, m.action, m.payload->>'mode' AS mode,
               CASE WHEN m.action = 'live_start' THEN NULL ELSE m.payload END AS params, m.status, m.error,
               coalesce(m.finished_at, m.created_at) AS at
        FROM home_commands m JOIN home_devices d ON d.id = m.device_id
        WHERE m.action NOT IN ('record', 'live_stop') AND m.status IN ('done', 'failed')
          AND (${before}::timestamptz IS NULL OR coalesce(m.finished_at, m.created_at) < ${before})
        ORDER BY at DESC LIMIT ${limit + 1}`
      : Promise.resolve([]),
  ])

  const items: Activity[] = [
    ...clipActivity(clipRows.map(toClip)),
    ...changeRows.map(
      (r): Activity => ({
        kind: 'change',
        at: new Date(r.at as string),
        change: {
          id: Number(r.id),
          deviceId: String(r.device_id),
          deviceName: String(r.device_name),
          action: String(r.action),
          mode: (r.mode as string) ?? null,
          params: (r.params as Record<string, unknown>) ?? null,
          status: String(r.status),
          error: (r.error as string) ?? null,
          at: new Date(r.at as string),
        },
      }),
    ),
  ].sort((a, b) => b.at.getTime() - a.at.getTime())

  return { items: items.slice(0, limit), more: items.length > limit }
}
