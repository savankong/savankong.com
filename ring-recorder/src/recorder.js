import { EventEmitter } from 'node:events'
import { spawn } from 'node:child_process'
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
export class Recorder extends EventEmitter {
  constructor(config) {
    super()
    this.config = config
    this.active = new Map() // camera.id -> { meta }
  }

  isRecording(cameraId) {
    return this.active.has(cameraId)
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
    this.emit('started', { cameraId: camera.id, kind: event.kind })
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
      const hasPoster = await this.makePoster(mp4, path.join(this.config.recordingsDir, `${base}.jpg`))
      meta.poster = hasPoster
      await fs.writeFile(json, JSON.stringify(meta, null, 2))
      log(`[${camera.name}] saved ${base}.mp4 (${(stat.size / 1e6).toFixed(1)} MB)`)

      const files = [`${base}.mp4`, ...(hasPoster ? [`${base}.jpg`] : []), `${base}.json`]
      this.emit('finished', { cameraId: camera.id, base, files })
    } catch (err) {
      log(`[${camera.name}] recording failed: ${err.message}`)
      session?.stop()
      await fs.rm(tmpFile, { force: true })
    } finally {
      if (this.active.get(camera.id)?.meta === meta) this.active.delete(camera.id)
      this.emit('idle', { cameraId: camera.id })
    }
  }

  /** Grab a frame ~1s in as a thumbnail. Failure is not fatal. */
  makePoster(mp4, jpg) {
    return new Promise((resolve) => {
      const ff = spawn(this.config.ffmpegPath, [
        '-loglevel', 'error', '-y', '-ss', '1', '-i', mp4,
        '-frames:v', '1', '-vf', 'scale=640:-2', '-q:v', '5', jpg,
      ])
      ff.on('error', () => resolve(false))
      ff.on('exit', (code) => resolve(code === 0))
    })
  }

  stopAll() {
    // Sessions end themselves; nothing to keep. Partial files are cleaned on next start.
    this.active.clear()
  }
}
