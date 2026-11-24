// Display helpers. Times show in the house's time zone, not the server's.
export const HOME_TZ = process.env.HOME_TIMEZONE || 'America/Los_Angeles'

const dayKey = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: HOME_TZ })

export function time(d: Date): string {
  return d.toLocaleTimeString('en-US', { timeZone: HOME_TZ, hour: 'numeric', minute: '2-digit' })
}

export function dayLabel(d: Date, now = new Date()): string {
  const k = dayKey(d)
  if (k === dayKey(now)) return 'Today'
  if (k === dayKey(new Date(now.getTime() - 86400_000))) return 'Yesterday'
  return d.toLocaleDateString('en-US', { timeZone: HOME_TZ, weekday: 'long', month: 'short', day: 'numeric' })
}

export function when(d: Date, now = new Date()): string {
  const s = Math.round((now.getTime() - d.getTime()) / 1000)
  if (s < 45) return 'just now'
  if (s < 3600) return `${Math.round(s / 60)} min ago`
  if (s < 6 * 3600) return `${Math.round(s / 3600)} h ago`
  const label = dayLabel(d, now)
  return `${label === 'Today' ? '' : `${label}, `}${time(d)}`
}

export function greeting(now = new Date()): string {
  const h = Number(now.toLocaleString('en-US', { timeZone: HOME_TZ, hour: 'numeric', hour12: false }))
  return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export function longDate(now = new Date()): string {
  return now.toLocaleDateString('en-US', { timeZone: HOME_TZ, weekday: 'long', month: 'long', day: 'numeric' })
}

export function bytes(n: number): string {
  if (n < 1e6) return `${Math.round(n / 1e3)} KB`
  if (n < 1e9) return `${(n / 1e6).toFixed(n < 1e7 ? 1 : 0)} MB`
  return `${(n / 1e9).toFixed(1)} GB`
}

export function seconds(n: number | null): string {
  if (n == null) return ''
  return n < 60 ? `${n}s` : `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`
}

const DETAIL: Record<string, string> = {
  human: 'Person',
  loitering: 'Loitering',
  vehicle: 'Vehicle',
  package_delivery: 'Package',
  package_pickup: 'Package pickup',
  animal: 'Animal',
}

export function triggerLabel(trigger: string, detail: string | null): string {
  const base = trigger === 'ding' ? 'Doorbell' : trigger === 'manual' ? 'Recorded by you' : 'Motion'
  const d = detail ? DETAIL[detail] ?? detail.replaceAll('_', ' ') : null
  return trigger === 'motion' && d ? d : d ? `${base} · ${d}` : base
}

export function groupByDay<T extends { startedAt: Date }>(items: T[]): { label: string; items: T[] }[] {
  const out: { label: string; items: T[] }[] = []
  for (const it of items) {
    const label = dayLabel(it.startedAt)
    const last = out[out.length - 1]
    if (last && last.label === label) last.items.push(it)
    else out.push({ label, items: [it] })
  }
  return out
}

export const MODE_LABEL: Record<string, string> = { home: 'Home', away: 'Away', disarmed: 'Disarmed' }

/** "Light turned on", "House set to Away", ... for the activity feed. */
export function changeLabel(action: string, mode: string | null): string {
  switch (action) {
    case 'light_on':
      return 'Light turned on'
    case 'light_off':
      return 'Light turned off'
    case 'siren_on':
      return 'Siren sounded'
    case 'siren_off':
      return 'Siren stopped'
    case 'live_start':
      return 'Watched live'
    case 'mode_set':
      return `House set to ${MODE_LABEL[mode ?? ''] ?? mode}`
    case 'vacuum_start':
      return 'Vacuum started'
    case 'vacuum_pause':
      return 'Vacuum paused'
    case 'vacuum_dock':
      return 'Vacuum sent home'
    case 'vacuum_stop':
      return 'Vacuum stopped'
    case 'vacuum_locate':
      return 'Vacuum asked to beep'
    default:
      return action.replaceAll('_', ' ')
  }
}

/** What the vacuum is doing, in words (see worker/dreame/bridge.py STATES). */
export const VACUUM_STATE: Record<string, string> = {
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
  offline: 'Offline',
  unknown: 'Unknown',
}
