// Server-rendered building blocks shared by the dashboard pages.
/* eslint-disable @next/next/no-img-element -- thumbnails are signed Spaces URLs behind a redirect */
import Link from 'next/link'
import type { Clip, Device, RecorderStatus } from '@/lib/home/data'
import { dayLabel, seconds, time, triggerLabel, when } from '@/lib/home/format'
import { homeHref } from '@/lib/home/paths'
import { Battery, Bell, Bulb, Camera, Plug, Record, Siren } from './icons'
import { CommandButton } from './ui'
import styles from './home.module.css'

export const thumbSrc = (id: number) => `/api/home/media/${id}?kind=thumb`

export function RecorderPill({ status }: { status: RecorderStatus | null }) {
  const ok = status?.online
  return (
    <span className={styles.pill} title={status?.note ?? undefined}>
      <span className={`${styles.dot} ${ok ? styles.dotOk : styles.dotBad}`} />
      <span className={styles.barStatusText}>{ok ? 'Recording on' : 'Recorder offline'}</span>
    </span>
  )
}

export function ClipThumb({ clip }: { clip: Clip }) {
  return (
    <div className={styles.thumb}>
      {clip.hasThumb ? (
        <img src={thumbSrc(clip.id)} alt="" loading="lazy" />
      ) : (
        <div className={styles.frameEmpty}>
          {clip.status === 'recording' ? (
            <span className={styles.badge}>
              <span className={`${styles.dot} ${styles.dotLive}`} /> Recording
            </span>
          ) : clip.status === 'failed' ? (
            <span className={styles.failed}>Failed</span>
          ) : (
            <Camera />
          )}
        </div>
      )}
      {clip.durationSeconds ? <span className={styles.thumbDur}>{seconds(clip.durationSeconds)}</span> : null}
    </div>
  )
}

export function CameraTile({
  device,
  live,
  pending,
}: {
  device: Device
  live: boolean
  pending: Set<string>
}) {
  const can = (c: string) => device.capabilities.includes(c)
  const lightOn = Boolean(device.meta.light)
  const lowBattery = device.battery != null && device.battery < 20
  const href = homeHref(`/clips?camera=${encodeURIComponent(device.id)}`)
  return (
    <article className={styles.cam}>
      <Link href={href} className={styles.frame} aria-label={`${device.name} clips`}>
        {device.latestThumbClipId ? (
          <img src={thumbSrc(device.latestThumbClipId)} alt="" />
        ) : (
          <div className={styles.frameEmpty}>
            <div>
              {device.kind === 'doorbell' ? <Bell /> : <Camera />}
              No clips yet
            </div>
          </div>
        )}
        <div className={styles.frameShade} />
        <div className={styles.frameTop}>
          <span className={styles.badge}>
            <span className={`${styles.dot} ${device.online ? styles.dotOk : styles.dotBad}`} />
            {device.online ? 'Online' : 'Offline'}
          </span>
          {live ? (
            <span className={`${styles.badge} ${styles.badgeLive}`}>
              <span className={`${styles.dot} ${styles.dotLive}`} /> Recording
            </span>
          ) : null}
        </div>
        <div className={styles.frameBottom}>
          <div>
            <div className={styles.camName}>{device.name}</div>
            <div className={styles.camSub}>
              {device.lastEventAt ? `Last activity ${when(device.lastEventAt)}` : 'No activity yet'}
            </div>
          </div>
        </div>
      </Link>
      <div className={styles.camFoot}>
        <div className={styles.meta}>
          {device.battery != null ? (
            <span className={`${styles.metaItem} ${lowBattery ? styles.low : ''}`}>
              <Battery /> {device.battery}%
            </span>
          ) : (
            <span className={styles.metaItem}>
              <Plug /> Wired
            </span>
          )}
          <span className={styles.metaItem}>{device.clipsToday} today</span>
        </div>
        {can('light') ? (
          <CommandButton
            deviceId={device.id}
            action={lightOn ? 'light_off' : 'light_on'}
            className={`${styles.btnGhost} ${styles.btnIcon} ${lightOn ? styles.btnOn : ''}`}
            label={lightOn ? 'Turn light off' : 'Turn light on'}
            busy={<Bulb />}
          >
            <Bulb />
          </CommandButton>
        ) : null}
        {can('siren') ? (
          device.meta.siren ? (
            <CommandButton deviceId={device.id} action="siren_off" className={styles.btnDanger} busy="Stopping…">
              <Siren /> Stop siren
            </CommandButton>
          ) : (
            <CommandButton
              deviceId={device.id}
              action="siren_on"
              className={`${styles.btnGhost} ${styles.btnIcon}`}
              label="Sound siren"
              confirmText={`Sound the siren on ${device.name}?`}
              busy={<Siren />}
            >
              <Siren />
            </CommandButton>
          )
        ) : null}
        <CommandButton
          deviceId={device.id}
          action="record"
          className={styles.btn}
          busy={
            <>
              <Record /> Starting…
            </>
          }
        >
          {live || pending.has(`${device.id}:record`) ? (
            <>
              <Record /> Recording…
            </>
          ) : (
            <>
              <Record /> Record
            </>
          )}
        </CommandButton>
      </div>
    </article>
  )
}

export function ClipRow({ clip }: { clip: Clip }) {
  return (
    <Link href={homeHref(`/clips/${clip.id}`)} className={styles.rowLink}>
      <ClipThumb clip={clip} />
      <div>
        <div className={styles.rowTitle}>{triggerLabel(clip.trigger, clip.detail)}</div>
        <div className={`${styles.rowSub} ${clip.status === 'failed' ? styles.failed : ''}`}>
          {clip.deviceName}
          {clip.status === 'failed' ? ' · not saved' : ''}
        </div>
      </div>
      <div className={styles.rowTime}>
        {time(clip.startedAt)}
        <br />
        <span>
          {Date.now() - clip.startedAt.getTime() < 6 * 3600_000 ? when(clip.startedAt) : dayLabel(clip.startedAt)}
        </span>
      </div>
    </Link>
  )
}

export function SetupChecklist({
  db,
  storage,
  recorder,
  devices,
}: {
  db: boolean
  storage: boolean
  recorder: RecorderStatus | null
  devices: number
}) {
  const steps = [
    {
      done: db,
      title: 'Database',
      text: (
        <>
          Apply <code>db/migrations/*_create_home</code> to the app&rsquo;s Postgres.
        </>
      ),
    },
    {
      done: storage,
      title: 'Clip storage',
      text: (
        <>
          Create a private Spaces bucket and set <code>SPACES_KEY</code>, <code>SPACES_SECRET</code>,{' '}
          <code>SPACES_BUCKET</code>.
        </>
      ),
    },
    {
      done: Boolean(recorder?.online),
      title: 'Ring recorder',
      text: recorder?.note ? (
        recorder.note
      ) : (
        <>
          Run <code>npm run ring:auth</code> on your computer, save the token as <code>RING_REFRESH_TOKEN</code>,
          and deploy the <code>home-recorder</code> worker.
        </>
      ),
    },
    {
      done: devices > 0,
      title: 'Cameras',
      text: 'They appear here once the recorder signs in to Ring.',
    },
  ]
  return (
    <div className={styles.setup}>
      <div className={styles.setupTitle}>Finish setting up</div>
      <ol className={styles.steps}>
        {steps.map((s) => (
          <li key={s.title} className={styles.step}>
            <span className={`${styles.check} ${s.done ? styles.checkOn : ''}`}>{s.done ? '✓' : ''}</span>
            <div>
              <div className={styles.stepTitle}>{s.title}</div>
              <div className={styles.stepText}>{s.text}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
