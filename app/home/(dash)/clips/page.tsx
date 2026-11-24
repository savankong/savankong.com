import Link from 'next/link'
import type { Metadata } from 'next'
import { getClips, getDevices, type Clip, type Device } from '@/lib/home/data'
import { groupByDay, time, triggerLabel } from '@/lib/home/format'
import { homeHref } from '@/lib/home/paths'
import { ClipThumb } from '../../parts'
import { AutoRefresh } from '../../ui'
import styles from '../../home.module.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Clips' }

const TRIGGERS = [
  { key: '', label: 'Everything' },
  { key: 'motion', label: 'Motion' },
  { key: 'ding', label: 'Doorbell' },
  { key: 'manual', label: 'Recorded by you' },
]

type Search = { camera?: string; trigger?: string; before?: string }

function link(q: Search) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(q)) if (v) p.set(k, v)
  const s = p.toString()
  return homeHref(`/clips${s ? `?${s}` : ''}`)
}

export default async function Clips({ searchParams }: { searchParams: Promise<Search> }) {
  const q = await searchParams
  const before = q.before ? new Date(q.before) : undefined
  let devices: Device[] = []
  let clips: Clip[] = []
  let more = false
  let dbOk = true
  try {
    ;[devices, { clips, more }] = await Promise.all([
      getDevices(),
      getClips({
        deviceId: q.camera || undefined,
        trigger: q.trigger || undefined,
        before: before && !Number.isNaN(before.getTime()) ? before : undefined,
        limit: 48,
      }),
    ])
  } catch {
    dbOk = false
  }
  const camName = devices.find((d) => d.id === q.camera)?.name

  return (
    <>
      {!q.before ? <AutoRefresh seconds={20} /> : null}
      <div className={styles.head}>
        <div className={styles.eyebrow}>Clips</div>
        <h1 className={styles.title}>{camName ?? 'Everything that happened'}</h1>
      </div>

      <div className={styles.filters}>
        {TRIGGERS.map((t) => (
          <Link
            key={t.key}
            href={link({ camera: q.camera, trigger: t.key })}
            className={`${styles.chip} ${(q.trigger ?? '') === t.key ? styles.chipOn : ''}`}
          >
            {t.label}
          </Link>
        ))}
        {devices.length > 1 ? (
          <>
            <span className={styles.chipGap} />
            <Link href={link({ trigger: q.trigger })} className={`${styles.chip} ${!q.camera ? styles.chipOn : ''}`}>
              All cameras
            </Link>
            {devices.map((d) => (
              <Link
                key={d.id}
                href={link({ camera: d.id, trigger: q.trigger })}
                className={`${styles.chip} ${q.camera === d.id ? styles.chipOn : ''}`}
              >
                {d.name}
              </Link>
            ))}
          </>
        ) : null}
      </div>

      {!dbOk ? <div className={styles.alert}>Can&rsquo;t read clips from the database right now.</div> : null}
      {dbOk && !clips.length ? <div className={styles.empty}>No clips here yet.</div> : null}

      {groupByDay(clips).map((g) => (
        <section key={g.label + g.items[0].id} className={styles.day}>
          <h2 className={styles.dayLabel}>
            {g.label} <span className={styles.dayCount}>{g.items.length}</span>
          </h2>
          <div className={styles.grid}>
            {g.items.map((c) => (
              <Link key={c.id} href={homeHref(`/clips/${c.id}`)} className={styles.card}>
                <ClipThumb clip={c} />
                <div className={styles.cardLine}>
                  <span className={styles.cardTitle}>{triggerLabel(c.trigger, c.detail)}</span>
                  <span className={styles.cardTime}>{time(c.startedAt)}</span>
                </div>
                <div className={`${styles.cardSub} ${c.status === 'failed' ? styles.failed : ''}`}>
                  {c.deviceName}
                  {c.status === 'failed' ? ' · not saved' : ''}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {more ? (
        <div className={styles.more}>
          <Link
            className={styles.btnGhost}
            href={link({ ...q, before: clips[clips.length - 1].startedAt.toISOString() })}
          >
            Older clips
          </Link>
        </div>
      ) : null}
    </>
  )
}
