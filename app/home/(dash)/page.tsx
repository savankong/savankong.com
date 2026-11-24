import Link from 'next/link'
import {
  attentionItems,
  getActivity,
  getDevices,
  getFailedToday,
  getPendingCommands,
  getRecorderStatus,
  getStats,
  houseOf,
  isCamera,
  type Activity,
  type Device,
  type Pending,
  type RecorderStatus,
} from '@/lib/home/data'
import { greeting, longDate } from '@/lib/home/format'
import { homeHref } from '@/lib/home/paths'
import { storageConfigured } from '@/lib/home/storage'
import { AttentionList, ModeSwitch, SetupChecklist, SystemsGrid, Timeline } from '../parts'
import { AutoRefresh } from '../ui'
import styles from '../home.module.css'

export const dynamic = 'force-dynamic'

/** The hub: is the house OK, what mode is it in, and what's going on. */
export default async function HomeHub() {
  let devices: Device[] = []
  let activity: Activity[] = []
  let recorder: RecorderStatus | null = null
  let pending: Pending[] = []
  let clipsToday = 0
  let failedToday = 0
  let dbOk = true
  try {
    let stats
    ;[devices, { items: activity }, recorder, pending, stats, failedToday] = await Promise.all([
      getDevices(),
      getActivity({ limit: 7 }),
      getRecorderStatus(),
      getPendingCommands(),
      getStats(),
      getFailedToday(),
    ])
    clipsToday = stats.clipsToday
  } catch {
    dbOk = false
  }

  const house = houseOf(devices)
  const attention = dbOk ? attentionItems(devices, recorder, failedToday) : []
  const pendingMode = (house && pending.find((p) => p.deviceId === house.id && p.action === 'mode_set')?.mode) || null
  const cameras = devices.filter(isCamera)
  const allGood = dbOk && cameras.length > 0 && attention.length === 0

  return (
    <>
      <AutoRefresh seconds={pending.length ? 3 : 20} />
      <div className={styles.head}>
        <div className={styles.eyebrow}>{longDate()}</div>
        <h1 className={styles.title}>{greeting()}.</h1>
        <p className={styles.status}>
          <span
            className={`${styles.dot} ${
              allGood ? styles.dotOk : attention.some((a) => a.tone === 'bad') ? styles.dotBad : attention.length ? styles.dotWarn : ''
            }`}
          />
          {!dbOk
            ? 'Home can’t reach its database.'
            : !cameras.length
              ? 'Nothing is connected yet.'
              : allGood
                ? 'All good at home.'
                : `${attention.length} ${attention.length === 1 ? 'thing needs' : 'things need'} a look.`}
        </p>
      </div>

      {!dbOk ? (
        <div className={styles.alert}>
          Can&rsquo;t read the home tables. Check <code>DATABASE_URL</code> and apply the home migrations.
        </div>
      ) : null}

      <div className={styles.hub}>
        <div className={styles.hubMain}>
          {house ? <ModeSwitch house={house} pending={pendingMode} /> : null}
          <AttentionList items={attention} />
          {!cameras.length && dbOk ? (
            <SetupChecklist db={dbOk} storage={storageConfigured()} recorder={recorder} devices={0} />
          ) : null}
          <section>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Around the house</h2>
            </div>
            <SystemsGrid devices={devices} recorder={recorder} clipsToday={clipsToday} />
          </section>
        </div>

        <aside className={styles.hubSide}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Latest</h2>
            <Link href={homeHref('/activity')} className={styles.sectionLink}>
              All activity →
            </Link>
          </div>
          {activity.length ? <Timeline items={activity} compact /> : <div className={styles.empty}>Nothing yet.</div>}
        </aside>
      </div>
    </>
  )
}
