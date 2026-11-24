'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { sendCommand } from './actions'
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

export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname()
  // On home.savankong.com the browser path has no /home prefix; compare both ways.
  const norm = (p: string) => p.replace(/^\/home(?=\/|$)/, '') || '/'
  const here = norm(pathname)
  return (
    <nav className={styles.nav} aria-label="Home">
      {links.map((l) => {
        const target = norm(l.href)
        const on = target === '/' ? here === '/' : here === target || here.startsWith(`${target}/`)
        return (
          <Link key={l.href} href={l.href} className={`${styles.navLink} ${on ? styles.navLinkOn : ''}`}>
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}

function Submit({
  className,
  children,
  busy,
  label,
  confirmText,
}: {
  className: string
  children: React.ReactNode
  busy: React.ReactNode
  label?: string
  confirmText?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      aria-label={label}
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
}: {
  deviceId: string
  action: string
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
      <Submit className={className} busy={busy} label={label} confirmText={confirmText}>
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
