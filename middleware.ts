import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySession } from '@/lib/home/auth'
import { homeHref, isHomeHost } from '@/lib/home/paths'

// home.savankong.com: the private home dashboard (cameras today, vacuum and
// lights later). It is the same Next.js app as savankong.com; this maps the
// subdomain onto the /home routes and keeps every page behind a login.
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const onHomeHost = isHomeHost(req.headers.get('host'))
  const homeHost = process.env.NEXT_PUBLIC_HOME_HOST

  let internal: string
  if (onHomeHost) {
    if (pathname.startsWith('/api/')) {
      if (!pathname.startsWith('/api/home/')) return new NextResponse('Not found', { status: 404 })
      internal = pathname
    } else {
      internal = pathname === '/' ? '/home' : pathname.startsWith('/home') ? pathname : `/home${pathname}`
    }
  } else {
    const isHome = pathname === '/home' || pathname.startsWith('/home/') || pathname.startsWith('/api/home/')
    if (!isHome) return NextResponse.next()
    // In production the dashboard lives only on its own subdomain.
    if (homeHost) {
      const rest = pathname.startsWith('/api/') ? pathname : pathname.replace(/^\/home/, '') || '/'
      return NextResponse.redirect(new URL(`https://${homeHost}${rest}${search}`))
    }
    internal = pathname
  }

  const isLogin = internal === '/home/login'
  const authed = await verifySession(req.cookies.get(SESSION_COOKIE)?.value)

  if (!authed && !isLogin) {
    if (internal.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const login = new URL(homeHref('/login'), req.url)
    const back = homeHref(internal.replace(/^\/home/, '') || '/')
    if (back !== homeHref('/')) login.searchParams.set('next', back + search)
    return NextResponse.redirect(login)
  }
  if (authed && isLogin) return NextResponse.redirect(new URL(homeHref('/'), req.url))

  const res =
    onHomeHost && internal !== pathname
      ? NextResponse.rewrite(new URL(`${internal}${search}`, req.url))
      : NextResponse.next()
  res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  res.headers.set('Cache-Control', 'private, no-store')
  return res
}

export const config = {
  // Skip Next internals and static files (anything with a dot in the last segment).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)'],
}
