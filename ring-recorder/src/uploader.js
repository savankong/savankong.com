import fs from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'

const log = (...args) => console.log(new Date().toISOString(), ...args)
const SWEEP_MS = 5 * 60 * 1000

/**
 * Uploads finished recordings to Nextcloud over WebDAV.
 * Anything that fails (Nextcloud down, network blip) stays on disk and is
 * retried by a sweep every 5 minutes, so nothing is lost.
 */
export class NextcloudUploader {
  constructor(nc, recordingsDir, dataDir) {
    this.nc = nc
    this.recordingsDir = recordingsDir
    this.uploadedLog = path.join(dataDir, 'uploaded.txt')
    this.uploaded = new Set()
    this.knownDirs = new Set()
    this.queue = Promise.resolve()
    this.auth = 'Basic ' + Buffer.from(`${nc.user}:${nc.password}`).toString('base64')
    this.base = `${nc.url}/remote.php/dav/files/${encodeURIComponent(nc.user)}`
  }

  async start() {
    try {
      const text = await fs.readFile(this.uploadedLog, 'utf8')
      for (const line of text.split('\n')) if (line) this.uploaded.add(line)
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
    }
    this.sweep()
    this.timer = setInterval(() => this.sweep(), SWEEP_MS)
  }

  stop() {
    clearInterval(this.timer)
  }

  /** Queue specific files (relative to recordingsDir). Video first, then metadata. */
  enqueue(relPaths) {
    this.queue = this.queue.then(async () => {
      for (const rel of relPaths) {
        if (this.uploaded.has(rel)) continue
        try {
          await this.uploadOne(rel)
        } catch (err) {
          log(`upload failed for ${rel}: ${err.message} (will retry)`)
          return // keep order: don't upload the .json without its .mp4
        }
      }
    })
    return this.queue
  }

  async sweep() {
    const pending = []
    const walk = async (dir) => {
      let entries
      try {
        entries = await fs.readdir(dir, { withFileTypes: true })
      } catch {
        return
      }
      for (const e of entries) {
        if (e.name.startsWith('.')) continue // skips .partial
        const full = path.join(dir, e.name)
        if (e.isDirectory()) await walk(full)
        else pending.push(path.relative(this.recordingsDir, full).split(path.sep).join('/'))
      }
    }
    await walk(this.recordingsDir)
    const todo = pending.filter((p) => !this.uploaded.has(p)).sort((a, b) => {
      // .mp4 before its .json
      const [ba, bb] = [a.replace(/\.\w+$/, ''), b.replace(/\.\w+$/, '')]
      return ba === bb ? (a.endsWith('.mp4') ? -1 : 1) : ba.localeCompare(bb)
    })
    if (todo.length) {
      log(`sweep: ${todo.length} file(s) waiting for upload`)
      await this.enqueue(todo)
    }
  }

  url(rel) {
    const segments = [this.nc.folder, ...rel.split('/')].filter(Boolean)
    return `${this.base}/${segments.map(encodeURIComponent).join('/')}`
  }

  async ensureDirs(rel) {
    const dirs = [this.nc.folder, ...rel.split('/').slice(0, -1)].filter(Boolean)
    let current = ''
    for (const d of dirs) {
      current = current ? `${current}/${d}` : d
      if (this.knownDirs.has(current)) continue
      const res = await fetch(`${this.base}/${current.split('/').map(encodeURIComponent).join('/')}`, {
        method: 'MKCOL',
        headers: { Authorization: this.auth },
      })
      // 201 created, 405 already exists
      if (res.status !== 201 && res.status !== 405) {
        throw new Error(`MKCOL ${current} → HTTP ${res.status}`)
      }
      this.knownDirs.add(current)
    }
  }

  async uploadOne(rel) {
    const full = path.join(this.recordingsDir, ...rel.split('/'))
    const { size } = await fs.stat(full)
    await this.ensureDirs(rel)
    const res = await fetch(this.url(rel), {
      method: 'PUT',
      headers: {
        Authorization: this.auth,
        'Content-Length': String(size),
        'Content-Type': rel.endsWith('.mp4') ? 'video/mp4' : 'application/json',
      },
      body: Readable.toWeb(createReadStream(full)),
      duplex: 'half',
    })
    if (res.status < 200 || res.status >= 300) throw new Error(`PUT → HTTP ${res.status}`)

    if (this.nc.deleteLocal) {
      await fs.rm(full, { force: true })
      await this.pruneEmptyDirs(path.dirname(full))
    } else {
      this.uploaded.add(rel)
      await fs.appendFile(this.uploadedLog, rel + '\n')
    }
    log(`uploaded ${rel} to Nextcloud`)
  }

  async pruneEmptyDirs(dir) {
    while (dir.startsWith(this.recordingsDir) && dir !== this.recordingsDir) {
      const left = await fs.readdir(dir).catch(() => ['x'])
      if (left.length) return
      await fs.rmdir(dir).catch(() => {})
      dir = path.dirname(dir)
    }
  }
}
