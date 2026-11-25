// Requests from the dashboard to the recorder worker, through home_commands.
import { sql } from '../db'
import { DEVICE_ACTIONS, RING_ACTIONS } from './kinds'

export const ACTIONS = new Set([...RING_ACTIONS, ...DEVICE_ACTIONS])

export async function queueCommand(deviceId: string, action: string, payload: unknown = null): Promise<number> {
  if (!ACTIONS.has(action)) throw new Error(`Unknown action ${action}`)
  const rows = await sql`
    INSERT INTO home_commands (device_id, action, payload)
    VALUES (${deviceId}, ${action}, ${payload === null ? null : JSON.stringify(payload)}::jsonb)
    RETURNING id`
  await sql`SELECT pg_notify('home_commands', ${String(rows[0].id)})` // wakes the recorder at once
  return Number(rows[0].id)
}

/** Waits for the recorder to finish a command. Null means it didn't answer in time. */
export async function waitForCommand(
  id: number,
  timeoutMs: number,
): Promise<{ status: string; error: string | null; result: unknown } | null> {
  const until = Date.now() + timeoutMs
  while (Date.now() < until) {
    const rows = await sql`SELECT status, error, result FROM home_commands WHERE id = ${id}`
    const r = rows[0]
    if (r && (r.status === 'done' || r.status === 'failed')) {
      return { status: String(r.status), error: (r.error as string) ?? null, result: r.result ?? null }
    }
    await new Promise((res) => setTimeout(res, 250))
  }
  return null
}
