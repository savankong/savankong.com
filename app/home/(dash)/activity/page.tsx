import Link from 'next/link'
import type { Metadata } from 'next'
import { getActivity, type Activity } from '@/lib/home/data'
import { homeHref } from '@/lib/home/paths'
import { Timeline } from '../../parts'
import { AutoRefresh } from '../../ui'
import styles from '../../home.module.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Activity' }

const FILTERS = [
  { key: '', label: 'Everything' },
  { key: 'motion', label: 'Motion' },
  { key: 'ding', label: 'Doorbell' },
  { key: 'manual', label: 'Recorded by you' },
  { key: 'changes', label: 'Changes' },
  { key: 'failed', label: 'Problems' },
]

type Search = { show?: string; before?: string }

function link(q: Search) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(q)) if (v) p.set(k, v)
  const s = p.toString()
  return homeHref(`/activity${s ? `?${s}` : ''}`)
}

export default async function ActivityPage({ searchParams }: { searchParams: Promise<Search> }) {
  const q = await searchParams
  const before = q.before ? new Date(q.before) : undefined
  let items: Activity[] = []
  let more = false
  let dbOk = true
  try {
    ;({ items, more } = await getActivity({
      show: q.show,
      before: before && !Number.isNaN(before.getTime()) ? before : undefined,
      limit: 50,
    }))
  } catch {
    dbOk = false
  }

  return (
    <>
      {!q.before ? <AutoRefresh seconds={20} /> : null}
      <div className={styles.head}>
        <div className={styles.eyebrow}>Activity</div>
        <h1 className={styles.title}>What happened at home</h1>
        <p className={styles.summary}>Motion, doorbell rings and every change made from Home, newest first.</p>
      </div>
      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={link({ show: f.key })}
            className={`${styles.chip} ${(q.show ?? '') === f.key ? styles.chipOn : ''}`}
          >
            {f.label}
          </Link>
        ))}
      </div>
      {!dbOk ? <div className={styles.alert}>Can&rsquo;t read activity from the database right now.</div> : null}
      {dbOk && !items.length ? <div className={styles.empty}>Nothing here yet.</div> : null}
      <div className={styles.activityWrap}>
        <Timeline items={items} />
      </div>
      {more ? (
        <div className={styles.more}>
          <Link className={styles.btnGhost} href={link({ show: q.show, before: items[items.length - 1].at.toISOString() })}>
            Older
          </Link>
        </div>
      ) : null}
    </>
  )
}
