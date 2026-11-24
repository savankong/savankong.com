// home.savankong.com serves the dashboard at its root. Everywhere else
// (localhost, the main domain) it lives under /home. Set HOME_HOST to the
// dashboard's own hostname in production.

export const HOME_HOST = process.env.HOME_HOST || process.env.NEXT_PUBLIC_HOME_HOST || ''

export function isHomeHost(host: string | null | undefined): boolean {
  if (!host) return false
  const h = host.split(':')[0].toLowerCase()
  return (HOME_HOST !== '' && h === HOME_HOST.toLowerCase()) || h.startsWith('home.')
}

/** Link to a dashboard page, e.g. homeHref('/clips'). */
export function homeHref(path = '/'): string {
  const base = process.env.NEXT_PUBLIC_HOME_HOST ? '' : '/home'
  const p = path.startsWith('/') ? path : `/${path}`
  if (base === '') return p
  return p === '/' ? base : `${base}${p}`
}
