'use client'
import { useState } from 'react'
import styles from './NewsletterSignup.module.css'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'success') return
    // Substack blocks server-side subscribe requests via Cloudflare, so we
    // open their subscribe page with the email pre-filled in a new tab.
    window.open(
      `https://lifebetweentitles.substack.com/subscribe?email=${encodeURIComponent(email)}`,
      '_blank',
      'noopener,noreferrer'
    )
    setStatus('success')
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.headline}>Join the Newsletter.</h2>
      <p className={styles.sub}>
        New episodes, new writing, and updates on Halfway Light — straight to your inbox.
      </p>
      {status === 'success' ? (
        <p className={styles.success}>Check the new tab to confirm your subscription!</p>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="email"
            className={styles.input}
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            aria-label="Email address"
          />
          <button type="submit" className="pill-filled" style={{ border: 'none', cursor: 'pointer' }}>
            Subscribe
          </button>
        </form>
      )}
    </div>
  )
}
