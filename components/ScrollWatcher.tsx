'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * One listener for the whole site: folds the banner away once the page
 * scrolls, and reveals [data-reveal] elements as they enter the viewport.
 */
export default function ScrollWatcher() {
  const pathname = usePathname()

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // Also reveal anything already scrolled past, so a fast jump never
          // leaves a section hidden.
          if (e.isIntersecting || e.boundingClientRect.bottom < 0) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    const scan = () => document.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => io.observe(el))
    scan()

    // Pages stream in after this mounts, so watch for reveals added later too.
    let queued = false
    const mo = new MutationObserver(() => {
      if (queued) return
      queued = true
      requestAnimationFrame(() => {
        queued = false
        scan()
      })
    })
    mo.observe(document.body, { childList: true, subtree: true })

    // Fallback for a scroll the observer never sampled.
    let sweeping = false
    const sweep = () => {
      sweeping = false
      const limit = window.innerHeight
      document.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => {
        if (el.getBoundingClientRect().top < limit) el.classList.add('in')
      })
    }
    const onScroll = () => {
      document.body.classList.toggle('scrolled', window.scrollY > 10)
      if (!sweeping) {
        sweeping = true
        setTimeout(sweep, 200)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])

  return null
}
