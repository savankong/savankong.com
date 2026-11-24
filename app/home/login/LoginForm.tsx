'use client'

import { useActionState } from 'react'
import { login } from '../actions'
import { HouseMark } from '../icons'
import styles from '../home.module.css'

export default function LoginForm({ next }: { next: string }) {
  const [error, action, pending] = useActionState(login, null)
  return (
    <div className={styles.login}>
      <form action={action} className={styles.loginCard}>
        <div className={styles.loginBrand}>
          <HouseMark className={styles.brandMark} /> Home
        </div>
        <p className={styles.loginText}>Cameras and the rest of the house, in one place.</p>
        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <input
            className={styles.input}
            type="password"
            name="password"
            autoComplete="current-password"
            autoFocus
            required
          />
        </label>
        <input type="hidden" name="next" value={next} />
        {error ? <p className={styles.error}>{error}</p> : null}
        <button type="submit" className={`${styles.btn} ${styles.btnLg}`} disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
