import Link from 'next/link'
import type { Metadata } from 'next'
import { getActivity, getBridgeStatus, getDevices, vacuumMeta, type Activity, type Device } from '@/lib/home/data'
import { VACUUM_STATE, when } from '@/lib/home/format'
import { homeHref } from '@/lib/home/paths'
import { Battery, Left, Vacuum } from '../../icons'
import { Timeline, VacuumControls } from '../../parts'
import { AutoRefresh } from '../../ui'
import styles from '../../home.module.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Cleaning' }

export default async function Cleaning() {
  let vacuums: Device[] = []
  let history: Activity[] = []
  let bridge = null
  try {
    ;[vacuums, bridge, { items: history }] = await Promise.all([
      getDevices().then((d) => d.filter((x) => x.kind === 'vacuum')),
      getBridgeStatus('dreame'),
      getActivity({ show: 'changes', limit: 30 }),
    ])
  } catch {}
  const ids = new Set(vacuums.map((v) => v.id))
  history = history.filter((a) => a.kind === 'change' && ids.has(a.change.deviceId)).slice(0, 8)

  return (
    <>
      <AutoRefresh seconds={vacuums.some((v) => vacuumMeta(v).state === 'cleaning') ? 10 : 30} />
      <div className={styles.head}>
        <Link href={homeHref('/')} className={styles.back}>
          <Left className={styles.brandMark} /> Home
        </Link>
        <div className={styles.eyebrow}>Cleaning</div>
        <h1 className={styles.title}>{vacuums.length === 1 ? vacuums[0].name : 'Vacuums'}</h1>
      </div>

      {bridge && !bridge.online && vacuums.length ? (
        <div className={styles.alert}>{bridge.note ?? 'The vacuum bridge is offline, so status may be old.'}</div>
      ) : null}

      {!vacuums.length ? (
        <div className={styles.setup}>
          <div className={styles.setupTitle}>Connect the vacuum</div>
          <p className={styles.stepText}>
            {bridge?.note ??
              'Set DREAME_USERNAME, DREAME_PASSWORD and DREAME_COUNTRY on the home-dreame worker. Use the same account as the DreameHome app.'}
          </p>
        </div>
      ) : null}

      {vacuums.map((v) => {
        const m = vacuumMeta(v)
        const state = VACUUM_STATE[m.state ?? 'unknown'] ?? m.state
        return (
          <div key={v.id} className={styles.player}>
            <div className={styles.vacHero}>
              <span className={`${styles.vacOrb} ${m.state === 'cleaning' ? styles.vacOrbOn : ''}`}>
                <Vacuum />
              </span>
              <div className={styles.vacState}>{v.online ? state : 'Offline'}</div>
              {m.error ? <div className={styles.failed}>{m.error}</div> : null}
              <div className={styles.cardSub}>Updated {when(v.updatedAt)}</div>
            </div>
            <aside className={styles.side}>
              <VacuumControls device={v} full />
              <dl className={styles.facts}>
                <dt>Battery</dt>
                <dd>
                  <span className={`${styles.metaItem} ${v.battery != null && v.battery < 20 ? styles.low : ''}`}>
                    <Battery /> {v.battery ?? '—'}%{m.charging ? ' · charging' : ''}
                  </span>
                </dd>
                <dt>Last clean</dt>
                <dd>
                  {m.cleanMinutes != null ? `${m.cleanMinutes} min` : '—'}
                  {m.cleanedArea != null ? ` · ${m.cleanedArea} m²` : ''}
                </dd>
                {v.model ? (
                  <>
                    <dt>Model</dt>
                    <dd>{v.model}</dd>
                  </>
                ) : null}
              </dl>
            </aside>
          </div>
        )
      })}

      {history.length ? (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Recent</h2>
            <Link href={homeHref('/activity?show=changes')} className={styles.sectionLink}>
              All changes →
            </Link>
          </div>
          <Timeline items={history} />
        </section>
      ) : null}
    </>
  )
}
