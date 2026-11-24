// Small line icons, drawn on a 24px grid at 1.75 stroke, in currentColor.
type P = { className?: string }
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const HouseMark = ({ className }: P) => (
  <svg {...base} className={className} strokeWidth={1.6}>
    <path d="M3.5 10.5 12 3.5l8.5 7" />
    <path d="M5.5 9v10.5h13V9" />
    <circle cx="12" cy="14" r="2.6" />
  </svg>
)
export const Camera = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="3" y="6" width="13" height="12" rx="2.5" />
    <path d="m16 10.5 5-3v9l-5-3" />
  </svg>
)
export const Bell = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15Z" />
    <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
  </svg>
)
export const Record = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />
  </svg>
)
export const Bulb = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M9 17.5h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2v1.5h5V16c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3Z" />
  </svg>
)
export const Siren = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M6 18v-5a6 6 0 0 1 12 0v5" />
    <path d="M4 18h16v2.5H4zM12 3v2M4.2 6.2l1.4 1.4M19.8 6.2l-1.4 1.4" />
  </svg>
)
export const Battery = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="2.5" y="7.5" width="17" height="9" rx="2" />
    <path d="M22 11v2" />
  </svg>
)
export const Plug = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M8 3v5M16 3v5M6 8h12v3a6 6 0 0 1-12 0Z" />
    <path d="M12 17v4" />
  </svg>
)
export const Vacuum = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="3" />
    <path d="M7 6.5h10" />
  </svg>
)
export const Thermo = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M10 13.5V5a2 2 0 0 1 4 0v8.5a4 4 0 1 1-4 0Z" />
  </svg>
)
export const Lock = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </svg>
)
export const Download = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 4v11M7.5 11 12 15.5 16.5 11M5 19.5h14" />
  </svg>
)
export const Trash = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />
  </svg>
)
export const Left = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M14.5 6 8.5 12l6 6" />
  </svg>
)
export const Right = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="m9.5 6 6 6-6 6" />
  </svg>
)
export const Person = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="7.5" r="3.5" />
    <path d="M5 20.5a7 7 0 0 1 14 0" />
  </svg>
)
export const Waves = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.5 5.5a9.2 9.2 0 0 0 0 13M18.5 5.5a9.2 9.2 0 0 1 0 13" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </svg>
)
export const Car = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 16.5v-4l2-5.5h12l2 5.5v4M3 12.5h18M4 16.5h16v2.5h-3v-2.5M4 16.5v2.5h3v-2.5" />
    <circle cx="7.5" cy="14.5" r=".6" fill="currentColor" />
    <circle cx="16.5" cy="14.5" r=".6" fill="currentColor" />
  </svg>
)
export const Box = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4Z" />
    <path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9" />
  </svg>
)
export const Grid = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </svg>
)
export const Film = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <path d="M7.5 4.5v15M16.5 4.5v15M3.5 9.5h4M3.5 14.5h4M16.5 9.5h4M16.5 14.5h4" />
  </svg>
)
export const Cloud = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M7 18.5a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 10a4.3 4.3 0 0 1-.5 8.5Z" />
  </svg>
)

/** The icon that stands for a clip's trigger on the activity timeline. */
export function TriggerIcon({ trigger, detail, className }: { trigger: string; detail: string | null; className?: string }) {
  if (trigger === 'ding') return <Bell className={className} />
  if (trigger === 'manual') return <Record className={className} />
  if (detail === 'human' || detail === 'loitering') return <Person className={className} />
  if (detail === 'vehicle') return <Car className={className} />
  if (detail?.startsWith('package')) return <Box className={className} />
  return <Waves className={className} />
}
export const Play = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M8 5.5v13l10.5-6.5Z" fill="currentColor" />
  </svg>
)
export const Speaker = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4Z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
)
export const Muted = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4Z" />
    <path d="m16 9.5 5 5M21 9.5l-5 5" />
  </svg>
)
export const Expand = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
  </svg>
)
