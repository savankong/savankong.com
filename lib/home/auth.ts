// Session cookie for home.savankong.com. Uses Web Crypto so the same code
// runs in middleware (edge) and in server components / actions (node).

export const SESSION_COOKIE = 'home_session'
export const SESSION_DAYS = 30

const enc = new TextEncoder()

function secret(): string {
  const s = process.env.HOME_SESSION_SECRET
  if (!s || s.length < 32) throw new Error('HOME_SESSION_SECRET must be set (32+ characters)')
  return s
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ])
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)))
  // base64url without Buffer, which the edge runtime doesn't guarantee
  let bin = ''
  for (const b of sig) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Cookie value: "<expires ms>.<signature>". */
export async function createSession(): Promise<{ value: string; expires: Date }> {
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000)
  const payload = String(expires.getTime())
  return { value: `${payload}.${await hmac(payload)}`, expires }
}

export async function verifySession(value: string | undefined): Promise<boolean> {
  if (!value) return false
  const [payload, sig] = value.split('.')
  if (!payload || !sig) return false
  const exp = Number(payload)
  if (!Number.isFinite(exp) || exp < Date.now()) return false
  try {
    return safeEqual(sig, await hmac(payload))
  } catch {
    return false
  }
}

/** Compares against HOME_PASSWORD by hashing both, so length doesn't leak. */
export async function checkPassword(input: string): Promise<boolean> {
  const expected = process.env.HOME_PASSWORD
  if (!expected) return false
  const [a, b] = await Promise.all([hmac(`pw:${input}`), hmac(`pw:${expected}`)])
  return safeEqual(a, b)
}
