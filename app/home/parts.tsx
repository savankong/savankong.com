// Server-rendered building blocks shared by the dashboard pages.
/* eslint-disable @next/next/no-img-element -- thumbnails are signed Spaces URLs behind a redirect */
import Link from 'next/link'
import type { Activity, Attention, Change, Clip, Device, House, RecorderStatus } from '@/lib/home/data'
import { can, isRingFloodlight, stateOf, statusLine, toneOf } from '@/lib/home/kinds'
import { SYSTEMS, type SystemKey } from '@/lib/home/systems'
import { MODE_LABEL, bytes, changeLabel, groupByDay, seconds, time, triggerLabel, when } from '@/lib/home/format'
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
  Gauge,
  Grid,
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
import { Brightness, CommandButton } from './ui'
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
  if (action.startsWith('light') || action.startsWith('turn_') || action === 'set_brightness') return <Bulb />
  if (action.startsWith('siren')) return <Siren />
  if (action === 'mode_set') return <HouseMark />
  if (action === 'live_start') return <Play />
  if (action === 'lock' || action === 'unlock') return <Lock />
  if (action === 'set_target') return <Thermo />
  if (['start', 'pause', 'stop', 'dock', 'locate'].includes(action)) return <Vacuum />
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
          <div className={styles.rowTitle}>{changeLabel(m.action, m.mode, m.params)}</div>
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
  switches: <Plug />,
  climate: <Thermo />,
  cleaning: <Vacuum />,
  locks: <Lock />,
  sensors: <Gauge />,
  other: <Grid />,
}

/** Icon for one device, by kind. */
export function DeviceIcon({ device }: { device: Device }) {
  if (isRingFloodlight(device)) return <Bulb />
  switch (device.kind) {
    case 'light':
      return <Bulb />
    case 'switch':
    case 'fan':
      return <Plug />
    case 'thermostat':
      return <Thermo />
    case 'vacuum':
      return <Vacuum />
    case 'lock':
      return <Lock />
    case 'sensor':
      return <Gauge />
    default:
      return <Grid />
  }
}

const TONE: Record<string, string> = { active: styles.sysIconActive, bad: styles.sysIconBad, warn: styles.sysIconWarn, '': '' }

/**
 * The one control that fits a device in a list: a toggle, lock button,
 * temperature stepper or the vacuum's next step. Drawn from capabilities.
 */
export function QuickControl({ device }: { device: Device }) {
  if (!device.online) return null
  const s = stateOf(device)
  if (isRingFloodlight(device)) {
    return <Toggle device={device} on={Boolean(s.light)} onAction="light_on" offAction="light_off" />
  }
  if (can(device, 'turn_on') && can(device, 'turn_off')) {
    return <Toggle device={device} on={Boolean(s.on)} onAction="turn_on" offAction="turn_off" />
  }
  if (can(device, 'lock') && can(device, 'unlock')) {
    return s.locked ? (
      <CommandButton
        deviceId={device.id}
        action="unlock"
        className={styles.btnGhost}
        confirmText={`Unlock ${device.name}?`}
      >
        <Lock /> Unlock
      </CommandButton>
    ) : (
      <CommandButton deviceId={device.id} action="lock" className={styles.btn}>
        <Lock /> Lock
      </CommandButton>
    )
  }
  if (can(device, 'set_target') && s.target != null) return <Stepper device={device} target={s.target} />
  if (device.kind === 'vacuum') return <VacuumButtons device={device} compact />
  return null
}

function Toggle({ device, on, onAction, offAction }: { device: Device; on: boolean; onAction: string; offAction: string }) {
  return (
    <CommandButton
      deviceId={device.id}
      action={on ? offAction : onAction}
      pressed={on}
      className={`${styles.switch} ${on ? styles.switchOn : ''}`}
      label={`${device.name}: ${on ? 'on, turn off' : 'off, turn on'}`}
      busy={<span className={styles.switchKnob} />}
    >
      <span className={styles.switchKnob} />
    </CommandButton>
  )
}

function Stepper({ device, target }: { device: Device; target: number }) {
  const unit = stateOf(device).unit ?? '°'
  return (
    <div className={styles.stepperCtl}>
      <CommandButton deviceId={device.id} action="set_target" fields={{ target: String(target - 1) }} className={styles.btnGhost} label="Lower">
        −
      </CommandButton>
      <span className={styles.stepperVal}>
        {target}
        {unit}
      </span>
      <CommandButton deviceId={device.id} action="set_target" fields={{ target: String(target + 1) }} className={styles.btnGhost} label="Raise">
        +
      </CommandButton>
    </div>
  )
}

/** The vacuum buttons that make sense for what it's doing now. */
function VacuumButtons({ device, full = false, compact = false }: { device: Device; full?: boolean; compact?: boolean }) {
  const status = stateOf(device).status ?? 'unknown'
  const busy = status === 'cleaning' || status === 'mapping'
  const atHome = ['charging', 'docked', 'station', 'drying', 'washing', 'emptying'].includes(status)
  const big = full ? ` ${styles.btnLg}` : ''
  return (
    <div className={full ? styles.controls : styles.vacButtons}>
      {busy && can(device, 'pause') ? (
        <CommandButton deviceId={device.id} action="pause" className={`${styles.btn}${big}`}>
          <Pause /> Pause
        </CommandButton>
      ) : !busy && can(device, 'start') ? (
        <CommandButton deviceId={device.id} action="start" className={`${styles.btn}${big}`}>
          <Play /> {status === 'paused' ? 'Resume' : 'Start'}
        </CommandButton>
      ) : null}
      {!compact && !atHome && can(device, 'dock') ? (
        <CommandButton deviceId={device.id} action="dock" className={`${styles.btnGhost}${big}`}>
          <HomeIcon /> Send home
        </CommandButton>
      ) : null}
      {full && busy && can(device, 'stop') ? (
        <CommandButton
          deviceId={device.id}
          action="stop"
          className={`${styles.btnGhost}${big}`}
          confirmText="Stop? It won't resume where it left off."
        >
          Stop
        </CommandButton>
      ) : null}
      {full && can(device, 'locate') ? (
        <CommandButton deviceId={device.id} action="locate" className={`${styles.btnGhost}${big}`}>
          <Speaker /> Find it (beep)
        </CommandButton>
      ) : null}
    </div>
  )
}

/** Every control a device offers, for its own page. */
export function DeviceControls({ device }: { device: Device }) {
  const s = stateOf(device)
  if (!device.online) return <p className={styles.stepText}>Controls come back when it reports in again.</p>
  if (device.kind === 'vacuum') return <VacuumButtons device={device} full />
  return (
    <div className={styles.controls}>
      {isRingFloodlight(device) || (can(device, 'turn_on') && can(device, 'turn_off')) ? (
        <div className={styles.ctlRow}>
          <span>Power</span>
          <QuickControl device={device} />
        </div>
      ) : null}
      {can(device, 'set_brightness') ? (
        <div className={styles.ctlRow}>
          <span>Brightness</span>
          <Brightness deviceId={device.id} level={s.brightness ?? 0} />
        </div>
      ) : null}
      {can(device, 'set_target') && s.target != null ? (
        <div className={styles.ctlRow}>
          <span>Target</span>
          <Stepper device={device} target={s.target} />
        </div>
      ) : null}
      {can(device, 'lock') ? (
        <div className={styles.ctlRow}>
          <span>{s.locked ? 'Locked' : 'Unlocked'}</span>
          <QuickControl device={device} />
        </div>
      ) : null}
    </div>
  )
}

/** A device in a system tile: icon, name, what it's doing, one control. */
export function DeviceRow({ device }: { device: Device }) {
  const href = isRingFloodlight(device)
    ? homeHref(`/live/${encodeURIComponent(device.id)}`)
    : homeHref(`/devices/${encodeURIComponent(device.id)}`)
  const name = isRingFloodlight(device) ? `${device.name} floodlight` : device.name
  return (
    <div className={styles.devRow}>
      <span className={`${styles.devIcon} ${TONE[toneOf(device)]}`}>
        <DeviceIcon device={device} />
      </span>
      <Link href={href} className={styles.devText}>
        <span className={styles.devName}>{name}</span>
        <span className={styles.devSub}>{statusLine(device)}</span>
      </Link>
      <div className={styles.devCtl}>
        <QuickControl device={device} />
      </div>
    </div>
  )
}

/** One tile per kind of thing in the house, from whatever is connected. */
export function SystemsGrid({
  devices,
  recorder,
  clipsToday,
}: {
  devices: Device[]
  recorder: RecorderStatus | null
  clipsToday: number
}) {
  const systems = SYSTEMS.map((s) => ({ ...s, devices: devices.filter((d) => d.kind !== 'house' && s.match(d)) })).filter(
    (s) => s.devices.length > 0,
  )
  return (
    <div className={styles.systems}>
      {systems.map((s) => {
        if (s.key === 'security') {
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
        const on = s.devices.filter((d) => ['active'].includes(toneOf(d))).length
        return (
          <div key={s.key} className={`${styles.sys} ${styles.sysList}`}>
            <div className={styles.sysHead}>
              <span className={styles.sysIcon}>{SYSTEM_ICON[s.key]}</span>
              <div>
                <div className={styles.cardTitle}>{s.name}</div>
                <div className={styles.cardSub}>
                  {s.devices.length} {s.devices.length === 1 ? 'device' : 'devices'}
                  {on && (s.key === 'lights' || s.key === 'switches') ? ` · ${on} on` : ''}
                </div>
              </div>
            </div>
            <div className={styles.devList}>
              {s.devices.map((d) => (
                <DeviceRow key={d.id} device={d} />
              ))}
            </div>
          </div>
        )
      })}
      <Link href={homeHref('/settings')} className={`${styles.sys} ${styles.sysIdle} ${styles.sysAdd}`}>
        <div className={styles.sysHead}>
          <span className={styles.sysIcon}>+</span>
          <div>
            <div className={styles.cardTitle}>Add or remove</div>
            <div className={styles.cardSub}>Lights, plugs, climate, locks and more</div>
          </div>
        </div>
      </Link>
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
