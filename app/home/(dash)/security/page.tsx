import Link from 'next/link'
import type { Metadata } from 'next'
import {
  clipActivity,
  getClips,
  getDevices,
  getPendingCommands,
  getRecorderStatus,
  getStats,
  isCamera,
  type Clip,
  type Device,
  type RecorderStatus,
} from '@/lib/home/data'
import { homeHref } from '@/lib/home/paths'
import { storageConfigured } from '@/lib/home/storage'
import { CameraTile, SetupChecklist, StatusTiles, Timeline } from '../../parts'
import { AutoRefresh } from '../../ui'
import styles from '../../home.module.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Security' }

const RETENTION_DAYS = Number(process.env.HOME_RETENTION_DAYS || 30)

export default async function Security() {
  let devices: Device[] = []
  let recent: Clip[] = []
  let stats = { clipsToday: 0, clipsTotal: 0, bytesTotal: 0, oldest: null as Date | null }
  let recorder: RecorderStatus | null = null
  let pending: { deviceId: string; action: string }[] = []
  let dbOk = true
  try {
    ;[devices, { clips: recent }, stats, recorder, pending] = await Promise.all([
      getDevices().then((d) => d.filter(isCamera)),
      getClips({ limit: 8 }),
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

  return (
    <>
      <AutoRefresh seconds={live.size || pending.length ? 4 : 15} />
      <div className={styles.head}>
        <div className={styles.eyebrow}>Security</div>
        <h1 className={styles.title}>Cameras</h1>
        <p className={styles.summary}>
          {!devices.length
            ? 'Your Ring cameras will show up here once the recorder is connected.'
            : recorder?.online
              ? 'Every motion and doorbell ring is being saved to our own storage.'
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
          Can&rsquo;t read the home tables. Check <code>DATABASE_URL</code> and apply the home migrations.
        </div>
      ) : null}

      {!devices.length ? (
        <section className={styles.section}>
          <SetupChecklist db={dbOk} storage={storage} recorder={recorder} devices={devices.length} />
        </section>
      ) : (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Live and latest</h2>
            <span className={styles.sectionLink}>Tap a camera to watch live</span>
          </div>
          <div className={styles.cams}>
            {devices.map((d) => (
              <CameraTile key={d.id} device={d} live={live.has(d.id)} pending={pendingSet} />
            ))}
          </div>
        </section>
      )}

      {recent.length ? (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Recordings</h2>
            <Link href={homeHref('/clips')} className={styles.sectionLink}>
              All recordings →
            </Link>
          </div>
          <Timeline items={clipActivity(recent)} />
        </section>
      ) : null}

      <footer className={styles.foot}>
        <span>Clips are saved to our own DigitalOcean storage, not Ring&rsquo;s.</span>
        <span>Deleted automatically after {RETENTION_DAYS} days.</span>
      </footer>
    </>
  )
}
