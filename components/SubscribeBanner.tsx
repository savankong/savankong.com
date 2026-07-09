'use client'
import { useState } from 'react'

export default function SubscribeBanner() {
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
    <div className="subscribe-banner">
      <div className="subscribe-banner-inner">
        <div className="subscribe-copy">
          <span className="subscribe-icon" aria-hidden="true">◎</span>
          <div>
            <p className="subscribe-headline">New writing. Real stories. Delivered to your inbox.</p>
            <p className="subscribe-sub">Updates on the podcast, the books, and everything between.</p>
          </div>
        </div>

        {status === 'success' ? (
          <p className="subscribe-success">Check the new tab to confirm your subscription!</p>
        ) : (
          <form className="subscribe-form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="subscribe-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address"
            />
            <button type="submit" className="subscribe-btn">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
