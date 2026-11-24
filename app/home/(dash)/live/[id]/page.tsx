import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { clipActivity, getClips, getDevice, getRecorderStatus } from '@/lib/home/data'
import { when } from '@/lib/home/format'
import { homeHref } from '@/lib/home/paths'
import { Battery, Bulb, Left, Plug, Record, Siren } from '../../../icons'
import LiveView from '../../../LiveView'
import { Timeline, thumbSrc } from '../../../parts'
import { CommandButton } from '../../../ui'
import styles from '../../../home.module.css'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const device = await getDevice(decodeURIComponent((await params).id)).catch(() => null)
  return { title: device ? `${device.name} live` : 'Live' }
}

export default async function LivePage({ params }: Props) {
  const device = await getDevice(decodeURIComponent((await params).id))
  if (!device || !device.capabilities.includes('record')) notFound()
  const [{ clips }, recorder] = await Promise.all([getClips({ deviceId: device.id, limit: 6 }), getRecorderStatus()])
  const poster = clips.find((c) => c.hasThumb)
  const can = (c: string) => device.capabilities.includes(c)

  return (
    <>
      <div className={styles.head}>
        <Link href={homeHref('/security')} className={styles.back}>
          <Left className={styles.brandMark} /> Security
        </Link>
        <div className={styles.eyebrow}>
          {device.online ? 'Online' : 'Offline'}
          {device.lastEventAt ? ` · last activity ${when(device.lastEventAt)}` : ''}
        </div>
        <h1 className={styles.title}>{device.name}</h1>
      </div>

      <div className={styles.player}>
        <div>
          {recorder.online ? (
            <LiveView deviceId={device.id} name={device.name} poster={poster ? thumbSrc(poster.id) : undefined} />
          ) : (
            <div className={styles.notice}>
              <p>Live view needs the recorder, and it is offline right now.</p>
            </div>
          )}
          <p className={styles.stepText} style={{ marginTop: 10 }}>
            Live video comes straight from Ring to this browser and isn&rsquo;t saved. Use Record to keep a clip.
          </p>
        </div>

        <aside className={styles.side}>
          <div className={styles.controls}>
            <CommandButton
              deviceId={device.id}
              action="record"
              className={`${styles.btn} ${styles.btnLg}`}
              busy={
                <>
                  <Record /> Starting…
                </>
              }
            >
              <Record /> Record a clip
            </CommandButton>
            {can('light') ? (
              <CommandButton
                deviceId={device.id}
                action={device.meta.light ? 'light_off' : 'light_on'}
                className={`${styles.btnGhost} ${styles.btnLg} ${device.meta.light ? styles.btnOn : ''}`}
              >
                <Bulb /> {device.meta.light ? 'Light on' : 'Light off'}
              </CommandButton>
            ) : null}
            {can('siren') ? (
              device.meta.siren ? (
                <CommandButton deviceId={device.id} action="siren_off" className={`${styles.btnDanger} ${styles.btnLg}`}>
                  <Siren /> Stop siren
                </CommandButton>
              ) : (
                <CommandButton
                  deviceId={device.id}
                  action="siren_on"
                  className={`${styles.btnGhost} ${styles.btnLg}`}
                  confirmText={`Sound the siren on ${device.name}?`}
                >
                  <Siren /> Siren
                </CommandButton>
              )
            ) : null}
          </div>
          <dl className={styles.facts}>
            <dt>Power</dt>
            <dd>
              {device.battery != null ? (
                <span className={`${styles.metaItem} ${device.battery < 20 ? styles.low : ''}`}>
                  <Battery /> {device.battery}%
                </span>
              ) : (
                <span className={styles.metaItem}>
                  <Plug /> Wired
                </span>
              )}
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

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Recent clips</h2>
          <Link href={homeHref(`/clips?camera=${encodeURIComponent(device.id)}`)} className={styles.sectionLink}>
            All from {device.name} →
          </Link>
        </div>
        {clips.length ? <Timeline items={clipActivity(clips)} /> : <div className={styles.empty}>No clips yet.</div>}
      </section>
    </>
  )
}
