import fs from 'node:fs/promises'
import path from 'node:path'
import { PushNotificationAction, RingApi } from 'ring-client-api'
import { loadConfig } from './config.js'
import { TokenStore } from './token-store.js'
import { Recorder } from './recorder.js'
import { NextcloudUploader } from './uploader.js'

const log = (...args) => console.log(new Date().toISOString(), ...args)

function classify(notification) {
  const category = notification.android_config?.category
  const ding = notification.data?.event?.ding ?? {}
  if (category === PushNotificationAction.Ding) return 'ding'
  if (category === PushNotificationAction.Motion) {
    const type = ding.detection_type ?? ding.subtype
    return type === 'human' || type === 'loitering' ? 'person' : 'motion'
  }
  return null // intercom, alarm, etc.
}

async function main() {
  const config = loadConfig()
  const tokens = new TokenStore(config.dataDir)
  const refreshToken = (await tokens.load()) || config.refreshToken
  if (!refreshToken) {
    console.error('No Ring login yet. Run `npm run auth`, then put the token in RING_REFRESH_TOKEN in .env')
    process.exit(1)
  }

  await fs.mkdir(config.recordingsDir, { recursive: true })
  await fs.rm(path.join(config.recordingsDir, '.partial'), { recursive: true, force: true })

  const uploader = config.nextcloud
    ? new NextcloudUploader(config.nextcloud, config.recordingsDir, config.dataDir)
    : null
  const recorder = new Recorder(config, (files) => uploader?.enqueue(files))

  const ring = new RingApi({
    refreshToken,
    controlCenterDisplayName: 'ring-recorder',
    ffmpegPath: config.ffmpegPath,
    debug: config.debug,
    // Snapshots aren't needed; don't wake battery cameras for them.
    avoidSnapshotBatteryDrain: true,
  })

  ring.onRefreshTokenUpdated.subscribe(async ({ newRefreshToken }) => {
    try {
      await tokens.save(newRefreshToken)
      log('Ring login token refreshed and saved')
    } catch (err) {
      log(`could not save refreshed token: ${err.message}`)
    }
  })

  const all = await ring.getCameras()
  const cameras = config.cameras.length
    ? all.filter((c) => config.cameras.includes(c.name.toLowerCase()))
    : all
  if (!cameras.length) {
    console.error(`No matching cameras. Found: ${all.map((c) => c.name).join(', ') || 'none'}`)
    process.exit(1)
  }

  for (const camera of cameras) {
    const power = camera.hasBattery ? `battery ${camera.batteryLevel ?? '?'}%` : 'wired'
    log(`watching "${camera.name}" (${camera.model}, ${power})`)

    camera.onNewNotification.subscribe((notification) => {
      const kind = classify(notification)
      if (!kind) return
      if (notification.data?.device?.e2ee_enabled) {
        log(`[${camera.name}] ${kind} ignored: end-to-end encryption is on, video can't be recorded`)
        return
      }
      if (kind === 'ding' && !config.recordDings) return
      if (kind !== 'ding' && !config.recordMotion) return
      recorder.record(camera, {
        kind,
        subtype: notification.data?.event?.ding?.subtype,
        dingId: notification.data?.event?.ding?.id,
        at: new Date().toISOString(),
      })
    })
  }

  await uploader?.start()
  log(
    `ready: ${cameras.length} camera(s), dings=${config.recordDings} motion=${config.recordMotion}, ` +
      `saving to ${config.recordingsDir}${uploader ? ` and Nextcloud (${config.nextcloud.folder}/)` : ''}`,
  )

  const shutdown = () => {
    log('shutting down')
    uploader?.stop()
    recorder.stopAll()
    ring.disconnect()
    setTimeout(() => process.exit(0), 1000).unref()
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
