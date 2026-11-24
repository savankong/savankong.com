import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getClip, getNeighbours } from '@/lib/home/data'
import { bytes, dayLabel, seconds, time, triggerLabel } from '@/lib/home/format'
import { homeHref } from '@/lib/home/paths'
import { deleteClip } from '../../../actions'
import { Download, Left, Right, Trash } from '../../../icons'
import { thumbSrc } from '../../../parts'
import { AutoRefresh, ConfirmSubmit } from '../../../ui'
import styles from '../../../home.module.css'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

const RETENTION_DAYS = Number(process.env.HOME_RETENTION_DAYS || 30)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const clip = await getClip(Number((await params).id)).catch(() => null)
  return { title: clip ? `${clip.deviceName}, ${time(clip.startedAt)}` : 'Clip' }
}

export default async function ClipPage({ params }: Props) {
  const id = Number((await params).id)
  if (!Number.isInteger(id)) notFound()
  const clip = await getClip(id)
  if (!clip) notFound()
  const { newer, older } = await getNeighbours(clip)
  const src = `/api/home/media/${clip.id}?kind=video`
  const daysLeft = Math.max(0, Math.ceil(RETENTION_DAYS - (Date.now() - clip.startedAt.getTime()) / 86400_000))

  return (
    <>
      {clip.status === 'recording' ? <AutoRefresh seconds={4} /> : null}
      <div className={styles.head}>
        <Link href={homeHref('/clips')} className={styles.back}>
          <Left className={styles.brandMark} /> All clips
        </Link>
        <div className={styles.eyebrow}>
          {clip.deviceName} · {dayLabel(clip.startedAt)}, {time(clip.startedAt)}
        </div>
        <h1 className={styles.title}>{triggerLabel(clip.trigger, clip.detail)}</h1>
      </div>

      <div className={styles.player}>
        {clip.status === 'ready' && clip.hasVideo ? (
          <video
            className={styles.video}
            src={src}
            poster={clip.hasThumb ? thumbSrc(clip.id) : undefined}
            controls
            autoPlay
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <div className={styles.notice}>
            {clip.status === 'recording' ? (
              <div>
                <span className={`${styles.badge} ${styles.badgeLive}`}>
                  <span className={`${styles.dot} ${styles.dotLive}`} /> Recording
                </span>
                <p style={{ marginTop: 12 }}>This clip is still being saved. It will play here in a moment.</p>
              </div>
            ) : (
              <div>
                <p className={styles.failed}>This clip wasn&rsquo;t saved.</p>
                {clip.error ? <p style={{ marginTop: 8, fontSize: 13 }}>{clip.error}</p> : null}
              </div>
            )}
          </div>
        )}

        <aside className={styles.side}>
          <dl className={styles.facts}>
            <dt>Camera</dt>
            <dd>{clip.deviceName}</dd>
            <dt>Started</dt>
            <dd>
              {dayLabel(clip.startedAt)}, {time(clip.startedAt)}
            </dd>
            <dt>Length</dt>
            <dd>{seconds(clip.durationSeconds) || '—'}</dd>
            <dt>Size</dt>
            <dd>{clip.sizeBytes ? bytes(clip.sizeBytes) : '—'}</dd>
            <dt>Kept for</dt>
            <dd className={daysLeft <= 3 ? styles.low : undefined}>
              {daysLeft === 0 ? 'Deleted today' : `${daysLeft} more ${daysLeft === 1 ? 'day' : 'days'}`}
            </dd>
          </dl>
          {clip.hasVideo && daysLeft <= 7 ? (
            <p className={styles.stepText}>Download it to keep it past {RETENTION_DAYS} days.</p>
          ) : null}
          <div className={styles.actions}>
            {clip.hasVideo ? (
              <a className={styles.btn} href={`/api/home/media/${clip.id}?kind=download`}>
                <Download /> Download
              </a>
            ) : null}
            <form action={deleteClip}>
              <input type="hidden" name="id" value={clip.id} />
              <ConfirmSubmit className={styles.btnDanger} message="Delete this clip for good?">
                <Trash /> Delete
              </ConfirmSubmit>
            </form>
          </div>
          <div className={styles.stepper}>
            {newer ? (
              <Link className={styles.btnGhost} href={homeHref(`/clips/${newer}`)}>
                <Left /> Newer
              </Link>
            ) : (
              <span />
            )}
            {older ? (
              <Link className={styles.btnGhost} href={homeHref(`/clips/${older}`)}>
                Older <Right />
              </Link>
            ) : (
              <span />
            )}
          </div>
        </aside>
      </div>
    </>
  )
}
