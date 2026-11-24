// The parts of the house the hub manages. Each maps to device kinds in
// home_devices; a system with no devices yet shows as "not connected".
export type SystemKey = 'security' | 'lights' | 'climate' | 'cleaning' | 'locks'

export const SYSTEMS: { key: SystemKey; name: string; kinds: string[]; href?: string; idle: string }[] = [
  { key: 'security', name: 'Security', kinds: ['camera', 'doorbell'], href: '/security', idle: 'Cameras and doorbell' },
  { key: 'lights', name: 'Lights', kinds: ['light'], idle: 'Rooms and scenes' },
  { key: 'climate', name: 'Climate', kinds: ['thermostat'], idle: 'Thermostat' },
  { key: 'cleaning', name: 'Cleaning', kinds: ['vacuum'], href: '/cleaning', idle: 'Robot vacuum' },
  { key: 'locks', name: 'Locks', kinds: ['lock'], idle: 'Front and back door' },
]
