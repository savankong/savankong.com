import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getActivity, getDevice, getIntegrations, type Activity } from '@/lib/home/data'
import { when } from '@/lib/home/format'
import { stateOf, statusLine, toneOf } from '@/lib/home/kinds'
import { homeHref } from '@/lib/home/paths'
import { Battery, Left } from '../../../icons'
import { DeviceControls, DeviceIcon, Timeline } from '../../../parts'
import { AutoRefresh } from '../../../ui'
import styles from '../../../home.module.css'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await getDevice(decodeURIComponent((await params).id)).catch(() => null)
  return { title: d?.name ?? 'Device' }
}

/** Any device from an integration: what it's doing, its controls, recent changes. */
export default async function DevicePage({ params }: Props) {
  const device = await getDevice(decodeURIComponent((await params).id))
  if (!device || device.kind === 'camera' || device.kind === 'doorbell' || device.kind === 'house') notFound()
  const integrationId = device.id.split(':')[0]
  const [{ items }, integrations] = await Promise.all([
    getActivity({ show: 'changes', limit: 60 }),
    getIntegrations(),
  ])
  const integration = integrations.list.find((i) => i.id === integrationId)
  const history: Activity[] = items.filter((a) => a.kind === 'change' && a.change.deviceId === device.id).slice(0, 10)
  const s = stateOf(device)
  const tone = toneOf(device)

  return (
    <>
      <AutoRefresh seconds={tone === 'active' ? 10 : 30} />
      <div className={styles.head}>
        <Link href={homeHref('/')} className={styles.back}>
          <Left className={styles.brandMark} /> Home
        </Link>
        <div className={styles.eyebrow}>
          {integration?.name ?? integrationId} · {device.kind}
        </div>
        <h1 className={styles.title}>{device.name}</h1>
      </div>

      <div className={styles.player}>
        <div className={styles.vacHero}>
          <span className={`${styles.vacOrb} ${tone === 'active' ? styles.vacOrbOn : ''}`}>
            <DeviceIcon device={device} />
          </span>
          <div className={styles.vacState}>{statusLine(device)}</div>
          {s.error ? <div className={styles.failed}>{s.error}</div> : null}
          {s.readings?.length ? (
            <div className={styles.readings}>
              {s.readings.map((r) => (
                <div key={r.label} className={styles.reading}>
                  <span className={styles.readingVal}>
                    {r.value}
                    {r.unit}
                  </span>
                  <span className={styles.cardSub}>{r.label}</span>
                </div>
              ))}
            </div>
          ) : null}
          <div className={styles.cardSub}>Updated {when(device.updatedAt)}</div>
        </div>
        <aside className={styles.side}>
          <DeviceControls device={device} />
          <dl className={styles.facts}>
            {device.battery != null ? (
              <>
                <dt>Battery</dt>
                <dd>
                  <span className={`${styles.metaItem} ${device.battery < 20 ? styles.low : ''}`}>
                    <Battery /> {device.battery}%{s.charging ? ' · charging' : ''}
                  </span>
                </dd>
              </>
            ) : null}
            {s.cleanMinutes != null ? (
              <>
                <dt>Last clean</dt>
                <dd>
                  {s.cleanMinutes} min{s.cleanedArea != null ? ` · ${s.cleanedArea} m²` : ''}
                </dd>
              </>
            ) : null}
            <dt>From</dt>
            <dd>
              <Link href={homeHref('/settings')}>{integration?.name ?? integrationId}</Link>
            </dd>
            {device.model ? (
              <>
                <dt>Model</dt>
                <dd>{device.model}</dd>
              </>
            ) : null}
          </dl>
        </aside>
      </div>

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
