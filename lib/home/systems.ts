// Groups of devices on the Home tab, by kind (never by brand).
import type { Device } from './data'
import { isCamera, isRingFloodlight } from './kinds'

export type SystemKey = 'security' | 'lights' | 'switches' | 'climate' | 'cleaning' | 'locks' | 'sensors' | 'other'

const KNOWN = new Set(['camera', 'doorbell', 'house', 'light', 'switch', 'fan', 'thermostat', 'vacuum', 'lock', 'sensor'])

export const SYSTEMS: { key: SystemKey; name: string; match: (d: Device) => boolean }[] = [
  { key: 'security', name: 'Security', match: isCamera },
  { key: 'lights', name: 'Lights', match: (d) => d.kind === 'light' || isRingFloodlight(d) },
  { key: 'switches', name: 'Switches and plugs', match: (d) => d.kind === 'switch' || d.kind === 'fan' },
  { key: 'climate', name: 'Climate', match: (d) => d.kind === 'thermostat' },
  { key: 'cleaning', name: 'Cleaning', match: (d) => d.kind === 'vacuum' },
  { key: 'locks', name: 'Locks', match: (d) => d.kind === 'lock' },
  { key: 'sensors', name: 'Sensors', match: (d) => d.kind === 'sensor' },
  { key: 'other', name: 'Other', match: (d) => !KNOWN.has(d.kind) },
]
