import fs from 'node:fs/promises'
import path from 'node:path'
import { firstValueFrom } from 'rxjs'
import { recordingBase } from './paths.js'

const log = (...args) => console.log(new Date().toISOString(), ...args)

/**
 * Starts a live stream on a camera and writes it to an MP4.
 * One recording per camera at a time; events that arrive while a camera is
 * already recording are added to that recording's metadata instead.
 */
export class Recorder {
  constructor(config, onFinished) {
    this.config = config
    this.onFinished = onFinished
    this.active = new Map() // camera.id -> { meta }
  }

  get busyCount() {
    return this.active.size
  }

  async record(camera, event) {
    const current = this.active.get(camera.id)
    if (current) {
      current.meta.events.push(event)
      // A ring during a motion clip upgrades the file name on finish.
      if (event.kind === 'ding') current.meta.kind = 'ding'
      log(`[${camera.name}] ${event.kind} during an active recording, added to it`)
      return
    }
    if (this.active.size >= this.config.maxConcurrent) {
      log(`[${camera.name}] skipped ${event.kind}: ${this.active.size} recordings already running (MAX_CONCURRENT)`)
      return
    }

    const seconds = event.kind === 'ding' ? this.config.dingSeconds : this.config.motionSeconds
    const startedAt = new Date()
    const meta = {
      camera: { id: camera.id, name: camera.name, model: camera.model },
      kind: event.kind,
      startedAt: startedAt.toISOString(),
      requestedSeconds: seconds,
      events: [event],
    }
    this.active.set(camera.id, { meta })

    const tmpDir = path.join(this.config.recordingsDir, '.partial')
    await fs.mkdir(tmpDir, { recursive: true })
    const tmpFile = path.join(tmpDir, `${camera.id}-${startedAt.getTime()}.mp4`)

    log(`[${camera.name}] ${event.kind} → recording ${seconds}s`)
    let session
    try {
      session = await camera.streamVideo({
        output: [
          '-t', String(seconds),
          '-movflags', '+faststart', // playable in browsers / Nextcloud before fully downloaded
          '-y',
          tmpFile,
        ],
      })
      // Safety net: if ffmpeg/the call hangs, stop it shortly after the clip length.
      const guard = setTimeout(() => {
        log(`[${camera.name}] stream did not end on time, stopping it`)
        session.stop()
      }, (seconds + 30) * 1000)
      await firstValueFrom(session.onCallEnded)
      clearTimeout(guard)

      const stat = await fs.stat(tmpFile).catch(() => null)
      if (!stat || stat.size === 0) throw new Error('stream ended without any video (camera offline, or end-to-end encryption on?)')

      const base = recordingBase({
        cameraName: camera.name,
        date: startedAt,
        kind: meta.kind,
        timeZone: this.config.timezone,
      })
      const mp4 = path.join(this.config.recordingsDir, `${base}.mp4`)
      const json = path.join(this.config.recordingsDir, `${base}.json`)
      await fs.mkdir(path.dirname(mp4), { recursive: true })
      await fs.rename(tmpFile, mp4)
      meta.endedAt = new Date().toISOString()
      meta.bytes = stat.size
      await fs.writeFile(json, JSON.stringify(meta, null, 2))
      log(`[${camera.name}] saved ${base}.mp4 (${(stat.size / 1e6).toFixed(1)} MB)`)

      this.onFinished?.([`${base}.mp4`, `${base}.json`])
    } catch (err) {
      log(`[${camera.name}] recording failed: ${err.message}`)
      session?.stop()
      await fs.rm(tmpFile, { force: true })
    } finally {
      this.active.delete(camera.id)
    }
  }

  stopAll() {
    // Sessions end themselves; nothing to keep. Partial files are cleaned on next start.
    this.active.clear()
  }
}
