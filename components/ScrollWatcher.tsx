'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * One listener for the whole site: marks the body as scrolled (the banner
 * folds away), reveals [data-reveal] elements as they enter the viewport,
 * tilts [data-tilt] cards toward the pointer, and writes scroll progress to
 * --scroll on the root for CSS parallax.
 */
export default function ScrollWatcher() {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.documentElement
    // Fallback for a fast scroll the observer never sampled: anything whose
    // top has reached the viewport is revealed.
    let checking = false
    const sweep = () => {
      checking = false
      const limit = window.innerHeight
      document.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => {
        if (el.getBoundingClientRect().top < limit) el.classList.add('in')
      })
    }
    const update = () => {
      document.body.classList.toggle('scrolled', window.scrollY > 10)
      root.style.setProperty('--scroll', String(window.scrollY))
      if (!checking) {
        checking = true
        setTimeout(sweep, 200)
      }
    }
    window.addEventListener('scroll', update, { passive: true })
    update()

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // Also reveal anything already scrolled past, so a fast jump
          // (an anchor link, a slow frame) never leaves a section hidden.
          if (e.isIntersecting || e.boundingClientRect.bottom < 0) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    // Pages stream in after this mounts, so watch for reveals added later too.
    const scan = () => document.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => io.observe(el))
    scan()
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

    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.('[data-tilt]') as HTMLElement | null
      document.querySelectorAll<HTMLElement>('[data-tilt].tilting').forEach((el) => {
        if (el !== card) {
          el.classList.remove('tilting')
          el.style.removeProperty('--rx')
          el.style.removeProperty('--ry')
        }
      })
      if (!card) return
      const r = card.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      card.classList.add('tilting')
      card.style.setProperty('--rx', `${(0.5 - y) * 8}deg`)
      card.style.setProperty('--ry', `${(x - 0.5) * 10}deg`)
      card.style.setProperty('--mx', `${x * 100}%`)
      card.style.setProperty('--my', `${y * 100}%`)
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('pointermove', onMove)
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])

  return null
}
