// Server-rendered building blocks shared by the dashboard pages.
/* eslint-disable @next/next/no-img-element -- thumbnails are signed Spaces URLs behind a redirect */
import Link from 'next/link'
import type { Clip, Device, RecorderStatus } from '@/lib/home/data'
import { bytes, groupByDay, seconds, time, triggerLabel, when } from '@/lib/home/format'
import { homeHref } from '@/lib/home/paths'
import { Battery, Bell, Bulb, Camera, Cloud, Film, Lock, Plug, Record, Siren, Thermo, TriggerIcon, Vacuum } from './icons'
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

/** Activity grouped by day on a vertical rail, one node per clip. */
export function Timeline({ clips }: { clips: Clip[] }) {
  return (
    <div className={styles.timeline}>
      {groupByDay(clips).map((g) => (
        <section key={g.label + g.items[0].id}>
          <h3 className={styles.tlDay}>{g.label}</h3>
          <ol className={styles.tl}>
            {g.items.map((c) => (
              <li key={c.id} className={styles.tlItem}>
                <span className={`${styles.tlNode} ${styles[`tl_${tone(c)}`]}`}>
                  <TriggerIcon trigger={c.trigger} detail={c.detail} />
                </span>
                <Link href={homeHref(`/clips/${c.id}`)} className={styles.tlCard}>
                  <div className={styles.tlText}>
                    <div className={styles.tlTime}>
                      {time(c.startedAt)}
                      {Date.now() - c.startedAt.getTime() < 3 * 3600_000 ? ` · ${when(c.startedAt)}` : ''}
                    </div>
                    <div className={styles.rowTitle}>{triggerLabel(c.trigger, c.detail)}</div>
                    <div className={`${styles.rowSub} ${c.status === 'failed' ? styles.failed : ''}`}>
                      {c.deviceName}
                      {c.status === 'failed' ? ' · not saved' : c.durationSeconds ? ` · ${seconds(c.durationSeconds)}` : ''}
                    </div>
                  </div>
                  <ClipThumb clip={c} />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}

function tone(c: Clip): 'ding' | 'person' | 'manual' | 'failed' | 'motion' {
  if (c.status === 'failed') return 'failed'
  if (c.trigger === 'ding') return 'ding'
  if (c.trigger === 'manual') return 'manual'
  return c.detail === 'human' || c.detail === 'loitering' ? 'person' : 'motion'
}

/** The at-a-glance row under the greeting. */
export function StatusTiles({
  online,
  total,
  clipsToday,
  recorder,
  bytesTotal,
  retentionDays,
}: {
  online: number
  total: number
  clipsToday: number
  recorder: RecorderStatus | null
  bytesTotal: number
  retentionDays: number
}) {
  const tiles = [
    { icon: <Camera />, value: total ? `${online}/${total}` : '—', label: 'Cameras online', bad: total > 0 && online < total },
    { icon: <Film />, value: String(clipsToday), label: 'Clips, last 24 h', bad: false },
    {
      icon: <Record />,
      value: recorder?.online ? 'On' : 'Off',
      label: 'Recorder',
      bad: !recorder?.online,
    },
    { icon: <Cloud />, value: bytes(bytesTotal), label: `Kept ${retentionDays} days`, bad: false },
  ]
  return (
    <div className={styles.tiles}>
      {tiles.map((t) => (
        <div key={t.label} className={`${styles.tile} ${t.bad ? styles.tileBad : ''}`}>
          <span className={styles.tileIcon}>{t.icon}</span>
          <div>
            <div className={styles.tileValue}>{t.value}</div>
            <div className={styles.tileLabel}>{t.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

const SOON = [
  { name: 'Vacuum', status: 'Start, pause, send home', icon: <Vacuum />, tint: 'vac' },
  { name: 'Lights', status: 'Rooms and scenes', icon: <Bulb />, tint: 'light' },
  { name: 'Climate', status: 'Thermostat', icon: <Thermo />, tint: 'climate' },
  { name: 'Locks', status: 'Front and back door', icon: <Lock />, tint: 'lock' },
] as const

/** Placeholder tiles for the devices Home will control next. */
export function SoonTiles() {
  return (
    <div className={styles.soon}>
      {SOON.map((s) => (
        <div key={s.name} className={`${styles.soonTile} ${styles[`soon_${s.tint}`]}`}>
          <div>
            <div className={styles.soonName}>{s.name}</div>
            <div className={styles.soonSub}>{s.status}</div>
          </div>
          <div className={styles.soonFoot}>
            <span className={styles.soonTag}>Not connected</span>
            <span className={styles.soonBtn} aria-hidden>
              {s.icon}
            </span>
          </div>
        </div>
      ))}
    </div>
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
