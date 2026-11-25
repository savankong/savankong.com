// Device kinds and actions the dashboard understands. Integrations (see
// integrations/sdk.py, which mirrors this) report devices with a kind,
// capabilities (actions) and state; the UI is drawn from those alone, so
// adding a brand never needs dashboard changes.
import type { Device } from './data'

/** Built into Ring (worker/home-recorder.mts). */
export const RING_ACTIONS = ['record', 'light_on', 'light_off', 'siren_on', 'siren_off', 'mode_set', 'live_start', 'live_stop']

/** What any integration's device can offer, by listing them in `capabilities`. */
export const DEVICE_ACTIONS = [
  'turn_on',
  'turn_off',
  'set_brightness', // payload { level: 0-100 }
  'start',
  'pause',
  'stop',
  'dock',
  'locate',
  'set_target', // payload { target: number }
  'lock',
  'unlock',
]

export type DeviceState = {
  on?: boolean
  brightness?: number
  status?: string // vacuums
  error?: string | null
  charging?: boolean
  cleanMinutes?: number | null
  cleanedArea?: number | null
  current?: number // thermostats
  target?: number
  mode?: string
  unit?: string
  locked?: boolean // locks
  readings?: { label: string; value: number | string; unit?: string }[] // sensors
  light?: boolean // Ring floodlight
}

export const stateOf = (d: Device) => d.meta as DeviceState
export const can = (d: Device, action: string) => d.capabilities.includes(action)
export const isCamera = (d: Pick<Device, 'kind'>) => d.kind === 'camera' || d.kind === 'doorbell'
/** Ring floodlights count as lights alongside any connected ones. */
export const isRingFloodlight = (d: Device) => isCamera(d) && can(d, 'light')

export const VACUUM_STATUS: Record<string, string> = {
  cleaning: 'Cleaning',
  idle: 'Idle',
  paused: 'Paused',
  error: 'Needs help',
  returning: 'Heading home',
  charging: 'Charging',
  docked: 'Docked',
  drying: 'Drying the mop',
  washing: 'Washing the mop',
  mapping: 'Mapping',
  updating: 'Updating',
  station: 'At the station',
  emptying: 'Emptying the bin',
  remote: 'Remote control',
  unknown: 'Unknown',
}

const fmt = (n: number | undefined, unit = '') => (n == null ? '—' : `${Math.round(n * 10) / 10}${unit}`)

/** One short line describing the device right now, e.g. "On · 70%". */
export function statusLine(d: Device): string {
  if (!d.online) return 'Offline'
  const s = stateOf(d)
  if (isRingFloodlight(d)) return s.light ? 'On' : 'Off'
  const battery = d.battery != null ? ` · ${d.battery}%` : ''
  switch (d.kind) {
    case 'light':
      return s.on ? `On${s.brightness != null ? ` · ${s.brightness}%` : ''}` : 'Off'
    case 'switch':
    case 'fan':
      return s.on ? 'On' : 'Off'
    case 'vacuum': {
      const status = VACUUM_STATUS[s.status ?? 'unknown'] ?? s.status
      return `${s.error ? `${status}: ${s.error}` : status}${battery}`
    }
    case 'thermostat':
      return `${fmt(s.current, s.unit ?? '°')} now${s.mode ? ` · ${s.mode}` : ''}`
    case 'lock':
      return `${s.locked ? 'Locked' : 'Unlocked'}${battery}`
    case 'sensor':
      return (s.readings ?? []).map((r) => `${r.value}${r.unit ?? ''}`).join(' · ') || 'No readings'
    default:
      return can(d, 'turn_on') ? (s.on ? 'On' : 'Off') : 'Online'
  }
}

/** Highlight devices that are on, running or unlocked; flag problems. */
export function toneOf(d: Device): 'active' | 'bad' | 'warn' | '' {
  const s = stateOf(d)
  if (!d.online || s.error || s.status === 'error') return 'bad'
  if (d.kind === 'lock' && s.locked === false) return 'warn'
  if (s.on || s.light || s.status === 'cleaning' || s.status === 'returning') return 'active'
  return ''
}
