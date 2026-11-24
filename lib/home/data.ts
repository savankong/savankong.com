// Reads for the home dashboard. The recorder worker writes these tables.
import { sql } from '../db'

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

export async function getPendingCommands(): Promise<{ deviceId: string; action: string }[]> {
  const rows = await sql`
    SELECT device_id, action FROM home_commands
    WHERE status IN ('pending', 'running') AND created_at > now() - interval '2 minutes'`
  return rows.map((r) => ({ deviceId: String(r.device_id), action: String(r.action) }))
}
