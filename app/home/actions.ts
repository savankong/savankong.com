'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/db'
import { SESSION_COOKIE, checkPassword, createSession, verifySession } from '@/lib/home/auth'
import { homeHref } from '@/lib/home/paths'
import { deleteObjects, storageConfigured } from '@/lib/home/storage'

const ACTIONS = new Set(['record', 'light_on', 'light_off', 'siren_on', 'siren_off'])

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
  if (!deviceId || !ACTIONS.has(action)) return
  await sql`INSERT INTO home_commands (device_id, action) VALUES (${deviceId}, ${action})`
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
