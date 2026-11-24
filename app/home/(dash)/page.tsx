import Link from 'next/link'
import {
  getClips,
  getDevices,
  getPendingCommands,
  getRecorderStatus,
  getStats,
  type Clip,
  type Device,
  type RecorderStatus,
} from '@/lib/home/data'
import { greeting, longDate } from '@/lib/home/format'
import { homeHref } from '@/lib/home/paths'
import { storageConfigured } from '@/lib/home/storage'
import { CameraTile, SetupChecklist, SoonTiles, StatusTiles, Timeline } from '../parts'
import { AutoRefresh } from '../ui'
import styles from '../home.module.css'

export const dynamic = 'force-dynamic'

const RETENTION_DAYS = Number(process.env.HOME_RETENTION_DAYS || 30)

export default async function Overview() {
  let devices: Device[] = []
  let recent: Clip[] = []
  let stats = { clipsToday: 0, clipsTotal: 0, bytesTotal: 0, oldest: null as Date | null }
  let recorder: RecorderStatus | null = null
  let pending: { deviceId: string; action: string }[] = []
  let dbOk = true
  try {
    ;[devices, { clips: recent }, stats, recorder, pending] = await Promise.all([
      getDevices(),
      getClips({ limit: 10 }),
      getStats(),
      getRecorderStatus(),
      getPendingCommands(),
    ])
  } catch {
    dbOk = false
  }

  const storage = storageConfigured()
  const live = new Set(recent.filter((c) => c.status === 'recording').map((c) => c.deviceId))
  const pendingSet = new Set(pending.map((p) => `${p.deviceId}:${p.action}`))
  const online = devices.filter((d) => d.online).length
  const ready = dbOk && storage && recorder?.online && devices.length > 0

  return (
    <>
      <AutoRefresh seconds={live.size || pending.length ? 4 : 15} />
      <div className={styles.head}>
        <div className={styles.eyebrow}>{longDate()}</div>
        <h1 className={styles.title}>{greeting()}.</h1>
        <p className={styles.summary}>
          {!devices.length
            ? 'Your Ring cameras will show up here once the recorder is connected.'
            : recorder?.online
              ? 'Every motion and doorbell ring is being saved.'
              : 'The recorder is offline, so nothing new is being saved.'}
        </p>
      </div>
      {devices.length ? (
        <StatusTiles
          online={online}
          total={devices.length}
          clipsToday={stats.clipsToday}
          recorder={recorder}
          bytesTotal={stats.bytesTotal}
          retentionDays={RETENTION_DAYS}
        />
      ) : null}

      {!dbOk ? (
        <div className={styles.alert}>
          Can&rsquo;t read the home tables. Check <code>DATABASE_URL</code> and apply the home migration.
        </div>
      ) : null}
      {dbOk && devices.length && recorder && !recorder.online && recorder.note ? (
        <div className={styles.alert}>{recorder.note}</div>
      ) : null}

      {!ready && !devices.length ? (
        <section className={styles.section}>
          <SetupChecklist db={dbOk} storage={storage} recorder={recorder} devices={devices.length} />
        </section>
      ) : null}

      {devices.length ? (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Cameras</h2>
            <Link href={homeHref('/clips')} className={styles.sectionLink}>
              All clips →
            </Link>
          </div>
          <div className={styles.cams}>
            {devices
              .filter((d) => d.kind === 'camera' || d.kind === 'doorbell')
              .map((d) => (
                <CameraTile key={d.id} device={d} live={live.has(d.id)} pending={pendingSet} />
              ))}
          </div>
        </section>
      ) : null}

      {recent.length ? (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Recent activity</h2>
            <Link href={homeHref('/clips')} className={styles.sectionLink}>
              See everything →
            </Link>
          </div>
          <Timeline clips={recent} />
        </section>
      ) : null}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Coming to Home</h2>
        </div>
        <SoonTiles />
      </section>

      <footer className={styles.foot}>
        <span>Clips are saved to our own DigitalOcean storage, not Ring&rsquo;s.</span>
        <span>Deleted automatically after {RETENTION_DAYS} days.</span>
      </footer>
    </>
  )
}
