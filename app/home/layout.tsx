import type { Metadata, Viewport } from 'next'
import styles from './home.module.css'

export const metadata: Metadata = {
  title: { default: 'Home', template: '%s · Home' },
  description: 'Private dashboard for the house.',
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: 'Home', statusBarStyle: 'black-translucent' },
}

export const viewport: Viewport = { themeColor: '#0d0e10' }

export default function HomeRoot({ children }: { children: React.ReactNode }) {
  return <div className={styles.shell}>{children}</div>
}
