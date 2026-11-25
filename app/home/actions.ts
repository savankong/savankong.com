'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/db'
import { queueCommand } from '@/lib/home/commands'
import { getDevice } from '@/lib/home/data'
import { DEVICE_ACTIONS } from '@/lib/home/kinds'
import { SESSION_COOKIE, checkPassword, createSession, verifySession } from '@/lib/home/auth'
import { homeHref } from '@/lib/home/paths'
import { deleteObjects, storageConfigured } from '@/lib/home/storage'

const MODES = new Set(['home', 'away', 'disarmed'])
// Ring's own buttons, and the capability each one needs. Live view goes through /api/home/live.
const RING_BUTTONS: Record<string, string> = {
  record: 'record',
  light_on: 'light',
  light_off: 'light',
  siren_on: 'siren',
  siren_off: 'siren',
  mode_set: 'mode',
}

async function requireSession() {
  const jar = await cookies()
  if (!(await verifySession(jar.get(SESSION_COOKIE)?.value))) redirect(homeHref('/login'))
}

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  const password = String(form.get('password') ?? '')
  if (!process.env.HOME_PASSWORD || !process.env.HOME_SESSION_SECRET) {
    return 'HOME_PASSWORD and HOME_SESSION_SECRET are not set on the server.'
  }
  if (!(await checkPassword(password))) {
    await new Promise((r) => setTimeout(r, 800)) // slow down guessing
    return 'That password is not right.'
  }
  const { value, expires } = await createSession()
  const jar = await cookies()
  jar.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires,
  })
  const next = String(form.get('next') ?? '')
  // Only same-site paths, never "//evil.com".
  redirect(next.startsWith('/') && !next.startsWith('//') ? next : homeHref('/'))
}

export async function logout() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
  redirect(homeHref('/login'))
}

export async function sendCommand(form: FormData) {
  await requireSession()
  const deviceId = String(form.get('deviceId') ?? '')
  const action = String(form.get('action') ?? '')
  const device = deviceId ? await getDevice(deviceId) : null
  if (!device) return

  // Only what the device says it can do, so a button can't send anything else.
  const needs = RING_BUTTONS[action] ?? (DEVICE_ACTIONS.includes(action) ? action : null)
  if (!needs || !device.capabilities.includes(needs)) return

  let payload: Record<string, unknown> | null = null
  if (action === 'mode_set') {
    const mode = String(form.get('mode') ?? '')
    if (!MODES.has(mode)) return
    payload = { mode }
  } else if (action === 'set_brightness') {
    const level = Math.round(Number(form.get('level')))
    if (!Number.isFinite(level)) return
    payload = { level: Math.max(0, Math.min(100, level)) }
  } else if (action === 'set_target') {
    const target = Number(form.get('target'))
    if (!Number.isFinite(target) || target < 30 || target > 100) return
    payload = { target }
  }
  await queueCommand(deviceId, action, payload)
  revalidatePath('/home', 'layout')
}

/** Settings page: turn an integration on or off (its devices hide while off). */
export async function setIntegrationEnabled(form: FormData) {
  await requireSession()
  const id = String(form.get('id') ?? '')
  const enabled = form.get('enabled') === 'true'
  if (!id) return
  await sql`UPDATE home_integrations SET enabled = ${enabled}, status = ${enabled ? 'starting' : 'disabled'} WHERE id = ${id}`
  revalidatePath('/home', 'layout')
}

/** Settings page: forget an integration whose folder is gone, with its devices and their history. */
export async function removeIntegration(form: FormData) {
  await requireSession()
  const id = String(form.get('id') ?? '')
  if (!id) return
  await sql`DELETE FROM home_devices WHERE id LIKE ${`${id}:%`}` // commands go with them (cascade)
  await sql`DELETE FROM home_integrations WHERE id = ${id} AND status = 'missing'`
  await sql`DELETE FROM home_kv WHERE key LIKE ${`${id}:%`}`
  revalidatePath('/home', 'layout')
}

export async function deleteClip(form: FormData) {
  await requireSession()
  const id = Number(form.get('id'))
  if (!Number.isInteger(id)) return
  const rows = await sql`DELETE FROM home_clips WHERE id = ${id} RETURNING video_key, thumb_key`
  if (rows[0] && storageConfigured()) {
    await deleteObjects([rows[0].video_key as string, rows[0].thumb_key as string]).catch(() => {})
  }
  revalidatePath('/home', 'layout')
  redirect(homeHref('/clips'))
}
