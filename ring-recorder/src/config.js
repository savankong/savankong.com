import path from 'node:path'

function bool(name, fallback) {
  const v = process.env[name]
  if (v === undefined || v.trim() === '') return fallback
  return ['1', 'true', 'yes', 'on'].includes(v.trim().toLowerCase())
}

function int(name, fallback) {
  const v = process.env[name]
  if (v === undefined || v.trim() === '') return fallback
  const n = Number.parseInt(v, 10)
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${name} must be a positive number, got "${v}"`)
  return n
}

function str(name, fallback = '') {
  const v = process.env[name]
  return v === undefined || v.trim() === '' ? fallback : v.trim()
}

export function loadConfig() {
  const nextcloudUrl = str('NEXTCLOUD_URL').replace(/\/+$/, '')
  const config = {
    refreshToken: str('RING_REFRESH_TOKEN'),
    recordDings: bool('RECORD_DINGS', true),
    recordMotion: bool('RECORD_MOTION', true),
    dingSeconds: int('DING_SECONDS', 60),
    motionSeconds: int('MOTION_SECONDS', 30),
    maxConcurrent: int('MAX_CONCURRENT', 4),
    cameras: str('CAMERAS')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
    recordingsDir: path.resolve(str('RECORDINGS_DIR', './recordings')),
    dataDir: path.resolve(str('DATA_DIR', './data')),
    timezone: str('TIMEZONE', Intl.DateTimeFormat().resolvedOptions().timeZone),
    ffmpegPath: str('FFMPEG_PATH', 'ffmpeg'),
    debug: bool('DEBUG', false),
    retentionDays: int('RETENTION_DAYS', 30),
    web: str('CAM_PASSWORD')
      ? {
          password: str('CAM_PASSWORD'),
          port: int('WEB_PORT', 8080),
          host: str('WEB_HOST', '127.0.0.1'),
          publicUrl: str('PUBLIC_URL', 'https://cam.savankong.com'),
          trustProxy: bool('TRUST_PROXY', true),
        }
      : null,
    nextcloud: nextcloudUrl
      ? {
          url: nextcloudUrl,
          user: str('NEXTCLOUD_USER'),
          password: str('NEXTCLOUD_APP_PASSWORD'),
          folder: str('NEXTCLOUD_FOLDER', 'Ring').replace(/^\/+|\/+$/g, ''),
          deleteLocal: bool('DELETE_LOCAL_AFTER_UPLOAD', false),
        }
      : null,
  }

  if (config.nextcloud && (!config.nextcloud.user || !config.nextcloud.password)) {
    throw new Error('NEXTCLOUD_URL is set, so NEXTCLOUD_USER and NEXTCLOUD_APP_PASSWORD are required')
  }
  if (config.web && config.web.password.length < 12) {
    throw new Error('CAM_PASSWORD must be at least 12 characters (the app is on the public internet)')
  }
  if (config.web && config.nextcloud?.deleteLocal) {
    throw new Error('The web app plays recordings from local disk: set DELETE_LOCAL_AFTER_UPLOAD=false (RETENTION_DAYS controls disk use)')
  }
  // Validate the timezone early instead of failing on the first event.
  new Intl.DateTimeFormat('en-US', { timeZone: config.timezone })

  return config
}
