// Server-rendered building blocks shared by the dashboard pages.
/* eslint-disable @next/next/no-img-element -- thumbnails are signed Spaces URLs behind a redirect */
import Link from 'next/link'
import { isLight, vacuumMeta, type Activity, type Attention, type Change, type Clip, type Device, type House, type RecorderStatus } from '@/lib/home/data'
import { SYSTEMS, type SystemKey } from '@/lib/home/systems'
import { MODE_LABEL, VACUUM_STATE, bytes, changeLabel, groupByDay, seconds, time, triggerLabel, when } from '@/lib/home/format'
import { homeHref } from '@/lib/home/paths'
import {
  Alert,
  Away,
  Battery,
  Bell,
  Bulb,
  Camera,
  Cloud,
  Film,
  HouseMark,
  Home as HomeIcon,
  Lock,
  Pause,
  Play,
  Plug,
  Power,
  Record,
  Right,
  Shield,
  Siren,
  Speaker,
  Thermo,
  TriggerIcon,
  Vacuum,
} from './icons'
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
  const href = homeHref(`/live/${encodeURIComponent(device.id)}`)
  const clipsHref = homeHref(`/clips?camera=${encodeURIComponent(device.id)}`)
  return (
    <article className={styles.cam}>
      <Link href={href} className={styles.frame} aria-label={`Watch ${device.name} live`}>
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
          ) : (
            <span className={styles.badge}>
              <Play className={styles.badgeIcon} /> Live
            </span>
          )}
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
          <Link href={clipsHref} className={`${styles.metaItem} ${styles.metaLink}`}>
            {device.clipsToday} today
          </Link>
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

/** Activity grouped by day on a vertical rail, one node per event. */
export function Timeline({ items, compact = false }: { items: Activity[]; compact?: boolean }) {
  return (
    <div className={`${styles.timeline} ${compact ? styles.timelineCompact : ''}`}>
      {groupByDay(items.map((i) => ({ ...i, startedAt: i.at }))).map((g) => (
        <section key={g.label + g.items[0].at.getTime()}>
          <h3 className={styles.tlDay}>{g.label}</h3>
          <ol className={styles.tl}>
            {g.items.map((i) =>
              i.kind === 'clip' ? (
                <ClipItem key={`c${i.clip.id}`} c={i.clip} compact={compact} />
              ) : (
                <ChangeItem key={`m${i.change.id}`} m={i.change} />
              ),
            )}
          </ol>
        </section>
      ))}
    </div>
  )
}

function ClipItem({ c, compact }: { c: Clip; compact: boolean }) {
  return (
    <li className={styles.tlItem}>
      <span className={`${styles.tlNode} ${styles[`tl_${tone(c)}`]}`}>
        <TriggerIcon trigger={c.trigger} detail={c.detail} />
      </span>
      <Link href={homeHref(`/clips/${c.id}`)} className={styles.tlCard}>
        <div className={styles.tlText}>
          <div className={styles.tlTime}>
            {time(c.startedAt)}
            {!compact && Date.now() - c.startedAt.getTime() < 3 * 3600_000 ? ` · ${when(c.startedAt)}` : ''}
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
  )
}

function ChangeIcon({ action }: { action: string }) {
  if (action.startsWith('light')) return <Bulb />
  if (action.startsWith('siren')) return <Siren />
  if (action === 'mode_set') return <HouseMark />
  if (action === 'live_start') return <Play />
  if (action.startsWith('vacuum')) return <Vacuum />
  return <Record />
}

function ChangeItem({ m }: { m: Change }) {
  return (
    <li className={styles.tlItem}>
      <span className={`${styles.tlNode} ${m.status === 'failed' ? styles.tl_failed : styles.tl_change}`}>
        <ChangeIcon action={m.action} />
      </span>
      <div className={`${styles.tlCard} ${styles.tlPlain}`}>
        <div className={styles.tlText}>
          <div className={styles.tlTime}>{time(m.at)}</div>
          <div className={styles.rowTitle}>{changeLabel(m.action, m.mode)}</div>
          <div className={`${styles.rowSub} ${m.status === 'failed' ? styles.failed : ''}`}>
            {m.deviceName}
            {m.status === 'failed' ? ` · didn’t work${m.error ? `: ${m.error}` : ''}` : ' · from Home'}
          </div>
        </div>
      </div>
    </li>
  )
}

const MODE_HELP: Record<string, string> = {
  home: 'Someone’s in. Cameras follow your Home settings in Ring.',
  away: 'Nobody’s home. Cameras follow your Away settings in Ring.',
  disarmed: 'Cameras follow your Disarmed settings in Ring.',
}

/** Home / Away / Disarmed for the whole house (Ring Modes). */
export function ModeSwitch({ house, pending }: { house: House; pending: string | null }) {
  const current = pending ?? house.mode
  return (
    <div className={styles.modeCard}>
      <div className={styles.modeHead}>
        <div>
          <div className={styles.cardTitle}>House mode</div>
          <div className={styles.cardSub}>
            {pending ? `Switching to ${MODE_LABEL[pending]}…` : (MODE_HELP[house.mode] ?? 'Ring Modes are off.')}
          </div>
        </div>
      </div>
      <div className={styles.segment} role="group" aria-label="House mode">
        {(['home', 'away', 'disarmed'] as const).map((m) => (
          <CommandButton
            key={m}
            deviceId={house.id}
            action="mode_set"
            fields={{ mode: m }}
            pressed={current === m}
            className={`${styles.segBtn} ${current === m ? styles.segOn : ''}`}
            busy={MODE_LABEL[m]}
          >
            {m === 'home' ? <HouseMark /> : m === 'away' ? <Away /> : <Power />}
            {MODE_LABEL[m]}
          </CommandButton>
        ))}
      </div>
    </div>
  )
}

export function vacuumLine(v: Device): string {
  const m = vacuumMeta(v)
  if (!v.online) return 'Offline'
  const state = VACUUM_STATE[m.state ?? 'unknown'] ?? m.state
  const parts = [m.error ? `${state}: ${m.error}` : state]
  if (v.battery != null) parts.push(`${v.battery}%`)
  return parts.join(' · ')
}

function vacuumTone(v: Device): string {
  const m = vacuumMeta(v)
  if (!v.online || m.error || m.state === 'error') return styles.sysIconBad
  if (m.state === 'cleaning' || m.state === 'returning' || m.state === 'mapping') return styles.sysIconActive
  return ''
}

/** The one or two buttons that make sense for what the vacuum is doing now. */
export function VacuumControls({ device, full = false }: { device: Device; full?: boolean }) {
  const state = vacuumMeta(device).state ?? 'unknown'
  const busy = state === 'cleaning' || state === 'mapping'
  const atHome = ['charging', 'docked', 'station', 'drying', 'washing', 'emptying'].includes(state)
  const big = full ? ` ${styles.btnLg}` : ''
  if (!device.online) return null
  return (
    <div className={full ? styles.controls : styles.vacButtons}>
      {busy ? (
        <CommandButton deviceId={device.id} action="vacuum_pause" className={`${styles.btn}${big}`}>
          <Pause /> Pause
        </CommandButton>
      ) : (
        <CommandButton deviceId={device.id} action="vacuum_start" className={`${styles.btn}${big}`}>
          <Play /> {state === 'paused' ? 'Resume' : 'Start cleaning'}
        </CommandButton>
      )}
      {!atHome ? (
        <CommandButton deviceId={device.id} action="vacuum_dock" className={`${styles.btnGhost}${big}`}>
          <HomeIcon /> Send home
        </CommandButton>
      ) : null}
      {full && busy ? (
        <CommandButton
          deviceId={device.id}
          action="vacuum_stop"
          className={`${styles.btnGhost}${big}`}
          confirmText="Stop this clean? It won't resume where it left off."
        >
          Stop
        </CommandButton>
      ) : null}
      {full ? (
        <CommandButton deviceId={device.id} action="vacuum_locate" className={`${styles.btnGhost}${big}`}>
          <Speaker /> Find it (beep)
        </CommandButton>
      ) : null}
    </div>
  )
}

export function AttentionList({ items }: { items: Attention[] }) {
  if (!items.length) return null
  return (
    <div className={styles.attention}>
      {items.map((a) => {
        const body = (
          <>
            <span className={`${styles.attIcon} ${a.tone === 'bad' ? styles.attBad : styles.attWarn}`}>
              <Alert />
            </span>
            <div className={styles.tlText}>
              <div className={styles.rowTitle}>{a.title}</div>
              <div className={styles.rowSub}>{a.text}</div>
            </div>
            {a.href ? <Right className={styles.attGo} /> : null}
          </>
        )
        return a.href ? (
          <Link key={a.title} href={homeHref(a.href)} className={styles.attItem}>
            {body}
          </Link>
        ) : (
          <div key={a.title} className={styles.attItem}>
            {body}
          </div>
        )
      })}
    </div>
  )
}

const SYSTEM_ICON: Record<SystemKey, React.ReactNode> = {
  security: <Shield />,
  lights: <Bulb />,
  climate: <Thermo />,
  cleaning: <Vacuum />,
  locks: <Lock />,
}

/** One tile per part of the house; connected ones lead. */
export function SystemsGrid({
  devices,
  recorder,
  clipsToday,
}: {
  devices: Device[]
  recorder: RecorderStatus | null
  clipsToday: number
}) {
  const systems = SYSTEMS.map((s) => ({
    ...s,
    devices: devices.filter((d) => (s.key === 'lights' ? isLight(d) : s.kinds.includes(d.kind))),
  })).sort((a, b) => Number(b.devices.length > 0) - Number(a.devices.length > 0))
  return (
    <div className={styles.systems}>
      {systems.map((s) => {
        if (s.key === 'security' && s.devices.length) {
          const online = s.devices.filter((d) => d.online).length
          const thumbs = s.devices.filter((d) => d.latestThumbClipId).slice(0, 3)
          return (
            <Link key={s.key} href={homeHref('/security')} className={`${styles.sys} ${styles.sysWide}`}>
              <div className={styles.sysHead}>
                <span className={styles.sysIcon}>{SYSTEM_ICON[s.key]}</span>
                <div>
                  <div className={styles.cardTitle}>{s.name}</div>
                  <div className={styles.cardSub}>
                    {online}/{s.devices.length} cameras online · {clipsToday} {clipsToday === 1 ? 'clip' : 'clips'} today
                  </div>
                </div>
                <span className={styles.sysState}>
                  <span className={`${styles.dot} ${recorder?.online ? styles.dotOk : styles.dotBad}`} />
                  {recorder?.online ? 'Recording' : 'Not recording'}
                </span>
              </div>
              {thumbs.length ? (
                <div className={styles.mosaic}>
                  {thumbs.map((d) => (
                    <div key={d.id} className={styles.mosaicCell}>
                      <img src={thumbSrc(d.latestThumbClipId!)} alt="" />
                      <span className={styles.mosaicName}>{d.name}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </Link>
          )
        }
        if (s.key === 'cleaning' && s.devices.length) {
          return (
            <div key={s.key} className={styles.sys}>
              {s.devices.map((v) => (
                <div key={v.id} className={styles.sysBlock}>
                  <Link href={homeHref('/cleaning')} className={styles.sysHead}>
                    <span className={`${styles.sysIcon} ${vacuumTone(v)}`}>{SYSTEM_ICON.cleaning}</span>
                    <div>
                      <div className={styles.cardTitle}>{v.name}</div>
                      <div className={styles.cardSub}>{vacuumLine(v)}</div>
                    </div>
                  </Link>
                  <VacuumControls device={v} />
                </div>
              ))}
            </div>
          )
        }
        if (s.key === 'lights' && s.devices.length) {
          return (
            <div key={s.key} className={styles.sys}>
              <div className={styles.sysHead}>
                <span className={styles.sysIcon}>{SYSTEM_ICON.lights}</span>
                <div>
                  <div className={styles.cardTitle}>{s.name}</div>
                  <div className={styles.cardSub}>
                    {s.devices.filter((d) => d.meta.light).length} of {s.devices.length} on
                  </div>
                </div>
              </div>
              <div className={styles.lightList}>
                {s.devices.map((d) => (
                  <CommandButton
                    key={d.id}
                    deviceId={d.id}
                    action={d.meta.light ? 'light_off' : 'light_on'}
                    pressed={Boolean(d.meta.light)}
                    className={`${styles.lightBtn} ${d.meta.light ? styles.lightOn : ''}`}
                    label={`${d.name} light ${d.meta.light ? 'on, turn off' : 'off, turn on'}`}
                  >
                    <Bulb />
                    <span>{d.kind === 'light' ? d.name : `${d.name} floodlight`}</span>
                    <span className={styles.lightState}>{d.meta.light ? 'On' : 'Off'}</span>
                  </CommandButton>
                ))}
              </div>
            </div>
          )
        }
        const connected = s.devices.length > 0
        return (
          <div key={s.key} className={`${styles.sys} ${connected ? '' : styles.sysIdle}`}>
            <div className={styles.sysHead}>
              <span className={styles.sysIcon}>{SYSTEM_ICON[s.key]}</span>
              <div>
                <div className={styles.cardTitle}>{s.name}</div>
                <div className={styles.cardSub}>{connected ? `${s.devices.length} connected` : s.idle}</div>
              </div>
            </div>
            <div className={styles.sysFoot}>{connected ? 'Connected' : 'Not connected'}</div>
          </div>
        )
      })}
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
