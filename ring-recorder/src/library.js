import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'

const log = (...args) => console.log(new Date().toISOString(), ...args)

/**
 * Index of recordings on disk, built from the .json sidecars.
 * Rescans lazily when marked dirty (new recording / cleanup) or every minute.
 */
export class Library {
  constructor(recordingsDir) {
    this.dir = recordingsDir
    this.items = []
    this.scannedAt = 0
    this.dirty = true
    this.scanning = null
  }

  markDirty() {
    this.dirty = true
  }

  async all() {
    if (this.dirty || Date.now() - this.scannedAt > 60_000) {
      this.scanning ??= this.scan().finally(() => (this.scanning = null))
      await this.scanning
    }
    return this.items
  }

  async get(id) {
    return (await this.all()).find((i) => i.id === id) ?? null
  }

  async scan() {
    this.dirty = false
    const found = []
    const walk = async (dir) => {
      let entries
      try {
        entries = await fs.readdir(dir, { withFileTypes: true })
      } catch {
        return
      }
      for (const e of entries) {
        if (e.name.startsWith('.')) continue
        const full = path.join(dir, e.name)
        if (e.isDirectory()) await walk(full)
        else if (e.name.endsWith('.json')) found.push(full)
      }
    }
    await walk(this.dir)

    const items = []
    for (const file of found) {
      try {
        const meta = JSON.parse(await fs.readFile(file, 'utf8'))
        const rel = path.relative(this.dir, file).split(path.sep).join('/').replace(/\.json$/, '')
        const started = Date.parse(meta.startedAt)
        const ended = Date.parse(meta.endedAt)
        items.push({
          id: rel,
          cameraId: meta.camera?.id,
          cameraName: meta.camera?.name ?? rel.split('/')[0],
          kind: meta.kind,
          startedAt: meta.startedAt,
          durationSeconds: Number.isFinite(ended - started) ? Math.round((ended - started) / 1000) : meta.requestedSeconds,
          bytes: meta.bytes ?? null,
          events: (meta.events ?? []).map((e) => ({
            kind: e.kind,
            offsetSeconds: Math.max(0, Math.round((Date.parse(e.at) - started) / 1000)),
          })),
          video: `/media/${encodePath(rel)}.mp4`,
          poster: meta.poster ? `/media/${encodePath(rel)}.jpg` : null,
        })
      } catch {
        // half-written or hand-edited file: skip it
      }
    }
    items.sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
    this.items = items
    this.scannedAt = Date.now()
    return items
  }

  /** Delete local recordings older than `days`. `canDelete(relPath)` guards un-uploaded files. */
  async cleanup(days, canDelete = () => true) {
    if (!days) return
    const cutoff = Date.now() - days * 86_400_000
    let removed = 0
    for (const item of await this.scan()) {
      if (Date.parse(item.startedAt) >= cutoff) continue
      const files = ['.mp4', '.jpg', '.json'].map((ext) => item.id + ext)
      if (!files.every((f) => canDelete(f) || !existsSync(path.join(this.dir, f)))) continue
      for (const f of files) await fs.rm(path.join(this.dir, f), { force: true })
      removed++
    }
    if (removed) {
      log(`cleanup: removed ${removed} local recording(s) older than ${days} days`)
      await pruneEmpty(this.dir)
      this.markDirty()
    }
  }
}

function encodePath(rel) {
  return rel.split('/').map(encodeURIComponent).join('/')
}

async function pruneEmpty(dir, root = dir) {
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of entries) if (e.isDirectory() && !e.name.startsWith('.')) await pruneEmpty(path.join(dir, e.name), root)
  if (dir !== root && (await fs.readdir(dir)).length === 0) await fs.rmdir(dir).catch(() => {})
}
