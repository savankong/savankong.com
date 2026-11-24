'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { sendCommand } from './actions'
import { Grid, Pulse, Shield } from './icons'
import styles from './home.module.css'

/** Re-renders the server page every `seconds` while the tab is visible. */
export function AutoRefresh({ seconds = 10 }: { seconds?: number }) {
  const router = useRouter()
  useEffect(() => {
    const tick = () => document.visibilityState === 'visible' && router.refresh()
    const id = setInterval(tick, seconds * 1000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [router, seconds])
  return null
}

const NAV_ICONS: Record<string, React.ReactNode> = { Home: <Grid />, Security: <Shield />, Activity: <Pulse /> }

type NavLink = { href: string; label: string; also?: string[] }

/** Top links on wide screens; a bottom tab bar on phones (see .tabs). */
export function NavLinks({ links, variant = 'top' }: { links: NavLink[]; variant?: 'top' | 'tabs' }) {
  const pathname = usePathname()
  // On home.savankong.com the browser path has no /home prefix; compare both ways.
  const norm = (p: string) => p.replace(/^\/home(?=\/|$)/, '') || '/'
  const here = norm(pathname)
  const under = (target: string) => here === target || here.startsWith(`${target}/`)
  const isOn = (l: NavLink) => {
    const target = norm(l.href)
    return target === '/' ? here === '/' : under(target) || (l.also ?? []).some(under)
  }
  if (variant === 'tabs') {
    return (
      <nav className={styles.tabs} aria-label="Home">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`${styles.tab} ${isOn(l) ? styles.tabOn : ''}`}>
            {NAV_ICONS[l.label]}
            <span>{l.label}</span>
          </Link>
        ))}
      </nav>
    )
  }
  return (
    <nav className={styles.nav} aria-label="Home">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={`${styles.navLink} ${isOn(l) ? styles.navLinkOn : ''}`}>
          {l.label}
        </Link>
      ))}
    </nav>
  )
}

function Submit({
  className,
  children,
  busy,
  label,
  confirmText,
  pressed,
}: {
  className: string
  children: React.ReactNode
  busy: React.ReactNode
  label?: string
  confirmText?: string
  pressed?: boolean
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={(e) => {
        if (confirmText && !confirm(confirmText)) e.preventDefault()
      }}
    >
      {pending ? busy : children}
    </button>
  )
}

/** One button that queues a command (record, light_on, ...) for the recorder. */
export function CommandButton({
  deviceId,
  action,
  className,
  children,
  busy = 'Sending…',
  label,
  confirmText,
  fields,
  pressed,
}: {
  deviceId: string
  action: string
  /** Extra form fields, e.g. { mode: 'away' }. */
  fields?: Record<string, string>
  /** For toggle-style buttons (segmented controls). */
  pressed?: boolean
  className: string
  children: React.ReactNode
  busy?: React.ReactNode
  /** Accessible name, for icon-only buttons. */
  label?: string
  /** Ask before sending, for actions the neighbours would hear. */
  confirmText?: string
}) {
  return (
    <form action={sendCommand}>
      <input type="hidden" name="deviceId" value={deviceId} />
      <input type="hidden" name="action" value={action} />
      {Object.entries(fields ?? {}).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <Submit className={className} busy={busy} label={label} confirmText={confirmText} pressed={pressed}>
        {children}
      </Submit>
    </form>
  )
}

export function ConfirmSubmit({ className, children, message }: { className: string; children: React.ReactNode; message: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault()
      }}
    >
      {pending ? 'Deleting…' : children}
    </button>
  )
}
