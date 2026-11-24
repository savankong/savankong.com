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
