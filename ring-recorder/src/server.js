import http from 'node:http'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const log = (...args) => console.log(new Date().toISOString(), ...args)
const WEB_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'web')
const SESSION_DAYS = 30
const LIVE_MAX_MS = 10 * 60 * 1000

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.mp4': 'video/mp4',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
}

/**
 * Web app + API for cam.savankong.com. Meant to sit behind nginx (TLS).
 *
 * cameras(): [{ id, name, model, hasBattery, batteryLevel, isOffline, camera }]
 */
export async function startServer({ config, library, recorder, cameras }) {
  const secret = await loadSecret(config.dataDir)
  const password = config.web.password
  const clients = new Set() // SSE responses
  const live = new Map() // sessionId -> { session, timer, cameraId }
  const attempts = new Map() // ip -> { count, resetAt }

  // ---------- auth ----------
  const sign = (value) => crypto.createHmac('sha256', secret).update(value).digest('base64url')
  const makeToken = () => {
    const exp = String(Date.now() + SESSION_DAYS * 86_400_000)
    return `${exp}.${sign(exp)}`
  }
  const validToken = (token) => {
    if (!token) return false
    const [exp, mac] = token.split('.')
    if (!exp || !mac || Number(exp) < Date.now()) return false
    const expected = Buffer.from(sign(exp))
    const given = Buffer.from(mac)
    return expected.length === given.length && crypto.timingSafeEqual(expected, given)
  }
  const cookies = (req) =>
    Object.fromEntries(
      (req.headers.cookie ?? '').split(';').map((c) => {
        const i = c.indexOf('=')
        return [c.slice(0, i).trim(), decodeURIComponent(c.slice(i + 1).trim())]
      }),
    )
  const authed = (req) => validToken(cookies(req).cam_session)
  const secureCookie = config.web.publicUrl.startsWith('https://')
  const setSession = (res, token, maxAge) =>
    res.setHeader(
      'Set-Cookie',
      `cam_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secureCookie ? '; Secure' : ''}`,
    )
  const clientIp = (req) =>
    (config.web.trustProxy && req.headers['x-forwarded-for']?.split(',')[0].trim()) || req.socket.remoteAddress

  // ---------- helpers ----------
  const send = (res, status, body, headers = {}) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body)
    res.writeHead(status, {
      'Content-Type': typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json',
      'Cache-Control': 'no-store',
      ...headers,
    })
    res.end(data)
  }
  const readJson = (req, limit = 64 * 1024) =>
    new Promise((resolve, reject) => {
      let size = 0
      const chunks = []
      req.on('data', (c) => {
        size += c.length
        if (size > limit) {
          reject(new Error('body too large'))
          req.destroy()
        } else chunks.push(c)
      })
      req.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'))
        } catch {
          reject(new Error('invalid JSON'))
        }
      })
      req.on('error', reject)
    })

  const broadcast = (type, data) => {
    const msg = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`
    for (const res of clients) res.write(msg)
  }

  const cameraView = async () => {
    const items = await library.all()
    return cameras().map((c) => {
      const latest = items.find((i) => i.cameraId === c.id || i.cameraName === c.name)
      return {
        id: c.id,
        name: c.name,
        model: c.model,
        hasBattery: c.hasBattery,
        batteryLevel: c.batteryLevel,
        isOffline: c.isOffline,
        recording: recorder.isRecording(c.id),
        latest: latest ? { id: latest.id, kind: latest.kind, startedAt: latest.startedAt, poster: latest.poster } : null,
      }
    })
  }

  recorder.on('started', ({ cameraId, kind }) => broadcast('recording-started', { cameraId, kind }))
  recorder.on('idle', ({ cameraId }) => broadcast('recording-stopped', { cameraId }))
  recorder.on('finished', async ({ base }) => {
    library.markDirty()
    const item = await library.get(base)
    if (item) broadcast('recording', item)
  })

  // ---------- static + media ----------
  async function serveFile(req, res, file, { cache }) {
    let stat
    try {
      stat = await fs.stat(file)
      if (!stat.isFile()) throw new Error()
    } catch {
      return send(res, 404, 'Not found')
    }
    const type = TYPES[path.extname(file)] ?? 'application/octet-stream'
    const headers = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': cache }
    const range = req.headers.range?.match(/^bytes=(\d*)-(\d*)$/)
    if (range) {
      let start = range[1] === '' ? stat.size - Number(range[2]) : Number(range[1])
      let end = range[1] !== '' && range[2] !== '' ? Number(range[2]) : stat.size - 1
      end = Math.min(end, stat.size - 1)
      if (start < 0) start = 0
      if (start > end) {
        res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` })
        return res.end()
      }
      res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': end - start + 1 })
      if (req.method === 'HEAD') return res.end()
      return createReadStream(file, { start, end }).pipe(res)
    }
    res.writeHead(200, { ...headers, 'Content-Length': stat.size })
    if (req.method === 'HEAD') return res.end()
    createReadStream(file).pipe(res)
  }

  /** Resolve a URL path inside `root`, refusing anything that escapes it. */
  function within(root, urlPath) {
    let decoded
    try {
      decoded = decodeURIComponent(urlPath)
    } catch {
      return null
    }
    if (decoded.includes('\0')) return null
    const full = path.resolve(root, '.' + path.posix.normalize('/' + decoded))
    return full === root || full.startsWith(root + path.sep) ? full : null
  }

  // ---------- routes ----------
  async function handle(req, res) {
    const url = new URL(req.url, 'http://local')
    const p = url.pathname
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'no-referrer')
    res.setHeader('X-Frame-Options', 'DENY')

    if (p === '/api/login' && req.method === 'POST') {
      const ip = clientIp(req)
      const a = attempts.get(ip) ?? { count: 0, resetAt: Date.now() + 15 * 60_000 }
      if (a.resetAt < Date.now()) Object.assign(a, { count: 0, resetAt: Date.now() + 15 * 60_000 })
      if (a.count >= 10) return send(res, 429, { error: 'Too many attempts. Try again in 15 minutes.' })
      const body = await readJson(req).catch(() => ({}))
      const given = Buffer.from(String(body.password ?? ''))
      const expected = Buffer.from(password)
      const ok = given.length === expected.length && crypto.timingSafeEqual(given, expected)
      if (!ok) {
        a.count++
        attempts.set(ip, a)
        log(`web: failed login from ${ip}`)
        return send(res, 401, { error: 'Wrong password' })
      }
      attempts.delete(ip)
      setSession(res, makeToken(), SESSION_DAYS * 86_400)
      return send(res, 200, { ok: true })
    }
    if (p === '/api/logout' && req.method === 'POST') {
      setSession(res, '', 0)
      return send(res, 200, { ok: true })
    }

    // Public: the app shell (it shows the login form when the API says 401).
    if (!p.startsWith('/api/') && !p.startsWith('/media/')) {
      const file = p === '/' ? path.join(WEB_DIR, 'index.html') : within(WEB_DIR, p)
      if (!file) return send(res, 400, 'Bad path')
      return serveFile(req, res, file, { cache: p === '/' ? 'no-cache' : 'public, max-age=300' })
    }

    if (!authed(req)) return send(res, 401, { error: 'Not signed in' })

    if (p.startsWith('/media/')) {
      const file = within(library.dir, p.slice('/media/'.length))
      if (!file || !/\.(mp4|jpg)$/.test(file)) return send(res, 404, 'Not found')
      return serveFile(req, res, file, { cache: 'private, max-age=86400' })
    }

    if (p === '/api/cameras' && req.method === 'GET') return send(res, 200, await cameraView())

    if (p === '/api/recordings' && req.method === 'GET') {
      const camera = url.searchParams.get('camera')
      const kind = url.searchParams.get('kind')
      const before = url.searchParams.get('before')
      const limit = Math.min(Number(url.searchParams.get('limit')) || 60, 200)
      let items = await library.all()
      if (camera) items = items.filter((i) => String(i.cameraId) === camera)
      if (kind) items = items.filter((i) => i.kind === kind)
      if (before) items = items.filter((i) => i.startedAt < before)
      const page = items.slice(0, limit)
      return send(res, 200, { items: page, hasMore: items.length > limit })
    }

    if (p === '/api/stream' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // nginx: don't buffer
      })
      res.write('retry: 5000\n\n')
      clients.add(res)
      const ping = setInterval(() => res.write(': ping\n\n'), 25_000)
      req.on('close', () => {
        clearInterval(ping)
        clients.delete(res)
      })
      return
    }

    // Live view: the browser sends a WebRTC offer, Ring answers; video flows Ring → browser directly.
    let m = p.match(/^\/api\/cameras\/(\d+)\/live$/)
    if (m && req.method === 'POST') {
      const entry = cameras().find((c) => String(c.id) === m[1])
      if (!entry) return send(res, 404, { error: 'Unknown camera' })
      const { sdp } = await readJson(req, 256 * 1024)
      if (typeof sdp !== 'string' || !sdp.startsWith('v=')) return send(res, 400, { error: 'Missing SDP offer' })
      const session = entry.camera.createSimpleWebRtcSession()
      try {
        const answer = await session.start(sdp)
        const timer = setTimeout(() => endLive(session.sessionId), LIVE_MAX_MS)
        live.set(session.sessionId, { session, timer, cameraId: entry.id })
        log(`web: live view started on "${entry.name}"`)
        return send(res, 200, { sessionId: session.sessionId, sdp: answer, maxSeconds: LIVE_MAX_MS / 1000 })
      } catch (err) {
        return send(res, 502, { error: err.message })
      }
    }
    m = p.match(/^\/api\/live\/([\w-]+)\/(end|speaker)$/)
    if (m && req.method === 'POST') {
      const entry = live.get(m[1])
      if (!entry) return send(res, 404, { error: 'No such live session' })
      if (m[2] === 'speaker') {
        await entry.session.activateCameraSpeaker().catch(() => {})
        return send(res, 200, { ok: true })
      }
      await endLive(m[1])
      return send(res, 200, { ok: true })
    }

    return send(res, 404, { error: 'Not found' })
  }

  async function endLive(id) {
    const entry = live.get(id)
    if (!entry) return
    live.delete(id)
    clearTimeout(entry.timer)
    await entry.session.end().catch(() => {})
  }

  const server = http.createServer((req, res) => {
    handle(req, res).catch((err) => {
      log(`web: ${req.method} ${req.url} failed: ${err.message}`)
      if (!res.headersSent) send(res, 500, { error: 'Server error' })
      else res.end()
    })
  })
  await new Promise((resolve) => server.listen(config.web.port, config.web.host, resolve))
  log(`web app on http://${config.web.host}:${config.web.port} (public: ${config.web.publicUrl})`)

  return {
    close: async () => {
      for (const id of [...live.keys()]) await endLive(id)
      for (const res of clients) res.end()
      server.close()
    },
  }
}

async function loadSecret(dataDir) {
  const file = path.join(dataDir, 'session-secret')
  try {
    return await fs.readFile(file, 'utf8')
  } catch {
    const s = crypto.randomBytes(32).toString('hex')
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(file, s, { mode: 0o600 })
    return s
  }
}
