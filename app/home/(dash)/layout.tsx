import Link from 'next/link'
import { getRecorderStatus } from '@/lib/home/data'
import { homeHref } from '@/lib/home/paths'
import { logout } from '../actions'
import { HouseMark } from '../icons'
import { RecorderPill } from '../parts'
import { NavLinks } from '../ui'
import styles from '../home.module.css'

export const dynamic = 'force-dynamic'

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const status = await getRecorderStatus().catch(() => null)
  return (
    <>
      <header className={styles.bar}>
        <div className={`${styles.wrap} ${styles.barInner}`}>
          <Link href={homeHref('/')} className={styles.brand}>
            <HouseMark className={styles.brandMark} />
            Home <span className={styles.brandSub}>· Kong</span>
          </Link>
          <NavLinks
            links={[
              { href: homeHref('/'), label: 'Overview' },
              { href: homeHref('/clips'), label: 'Clips' },
            ]}
          />
          <div className={styles.barEnd}>
            <RecorderPill status={status} />
            <form action={logout}>
              <button type="submit" className={styles.signOut}>
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className={styles.wrap}>{children}</main>
    </>
  )
}
