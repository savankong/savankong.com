'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Expand, Muted, Play, Speaker } from './icons'
import styles from './home.module.css'

type State = 'connecting' | 'live' | 'ended' | 'error'

function sendStop(deviceId: string, session: string) {
  // keepalive lets this go out even while the page is closing.
  fetch('/api/home/live/stop', {
    method: 'POST',
    keepalive: true,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ deviceId, session }),
  }).catch(() => {})
}

/** Ring doesn't take trickled candidates, so the offer must carry all of them. */
function iceComplete(pc: RTCPeerConnection, maxMs: number): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve()
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(t)
      pc.removeEventListener('icegatheringstatechange', check)
      resolve()
    }
    const check = () => pc.iceGatheringState === 'complete' && done()
    const t = setTimeout(done, maxMs)
    pc.addEventListener('icegatheringstatechange', check)
  })
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function LiveView({ deviceId, name, poster }: { deviceId: string; name: string; poster?: string }) {
  const frame = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const session = useRef<string | null>(null)
  const pc = useRef<RTCPeerConnection | null>(null)
  const [state, setState] = useState<State>('connecting')
  const [error, setError] = useState<string | null>(null)
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [left, setLeft] = useState<number | null>(null)
  const [muted, setMuted] = useState(true)
  const [attempt, setAttempt] = useState(0)

  const end = useCallback(
    (next: State = 'ended') => {
      if (session.current) sendStop(deviceId, session.current)
      session.current = null
      pc.current?.close()
      pc.current = null
      if (video.current) video.current.srcObject = null
      setEndsAt(null)
      setState((s) => (s === 'error' ? s : next))
    },
    [deviceId],
  )

  useEffect(() => {
    let cancelled = false
    setState('connecting')
    setError(null)
    const conn = new RTCPeerConnection({ iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] })
    pc.current = conn
    conn.addTransceiver('video', { direction: 'recvonly' })
    conn.addTransceiver('audio', { direction: 'recvonly' })
    conn.ontrack = (e) => {
      const v = video.current
      if (!v) return
      const stream = (v.srcObject as MediaStream | null) ?? e.streams[0] ?? new MediaStream()
      if (!stream.getTracks().includes(e.track)) stream.addTrack(e.track)
      v.srcObject = stream
      v.play().catch(() => {})
    }
    conn.onconnectionstatechange = () => {
      if (cancelled) return
      if (conn.connectionState === 'failed') {
        setError('The video connection dropped.')
        setState('error')
        end('error')
      }
    }

    ;(async () => {
      try {
        await conn.setLocalDescription(await conn.createOffer())
        await iceComplete(conn, 2500)
        const res = await fetch('/api/home/live', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ deviceId, sdp: conn.localDescription?.sdp }),
        })
        const data = await res.json().catch(() => ({}))
        if (cancelled) {
          if (data.session) sendStop(deviceId, data.session)
          return
        }
        if (!res.ok) throw new Error(data.error || 'Live view failed')
        session.current = data.session
        await conn.setRemoteDescription({ type: 'answer', sdp: data.sdp })
        setEndsAt(Date.now() + Number(data.seconds || 120) * 1000)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
        setState('error')
        end('error')
      }
    })()

    return () => {
      cancelled = true
      end()
    }
  }, [deviceId, attempt, end])

  // Countdown to Ring's cut-off; stop when it runs out.
  useEffect(() => {
    if (!endsAt) return setLeft(null)
    const tick = () => {
      const s = Math.max(0, Math.round((endsAt - Date.now()) / 1000))
      setLeft(s)
      if (s === 0) end()
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAt, end])

  // Leaving the tab or the page ends the view, to spare battery cameras.
  useEffect(() => {
    const hide = () => document.visibilityState === 'hidden' && end()
    const leave = () => end()
    document.addEventListener('visibilitychange', hide)
    window.addEventListener('pagehide', leave)
    return () => {
      document.removeEventListener('visibilitychange', hide)
      window.removeEventListener('pagehide', leave)
    }
  }, [end])

  const again = () => setAttempt((n) => n + 1)
  const fullscreen = () => {
    const el = frame.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else if (el.requestFullscreen) el.requestFullscreen().catch(() => {})
    else (video.current as HTMLVideoElement & { webkitEnterFullscreen?: () => void })?.webkitEnterFullscreen?.()
  }

  return (
    <div ref={frame} className={styles.liveFrame}>
      <video
        ref={video}
        className={styles.liveVideo}
        poster={poster}
        muted={muted}
        autoPlay
        playsInline
        onPlaying={() => setState((s) => (s === 'connecting' ? 'live' : s))}
        aria-label={`${name} live view`}
      />
      <div className={styles.liveTop}>
        {state === 'live' ? (
          <span className={`${styles.badge} ${styles.badgeLive}`}>
            <span className={`${styles.dot} ${styles.dotLive}`} /> Live{left != null ? ` · ${clock(left)}` : ''}
          </span>
        ) : state === 'connecting' ? (
          <span className={styles.badge}>
            <span className={styles.spinner} /> Connecting to {name}…
          </span>
        ) : null}
      </div>

      {state === 'ended' || state === 'error' ? (
        <div className={styles.liveCover}>
          <p className={state === 'error' ? styles.failed : undefined}>
            {state === 'error' ? error ?? 'Live view failed.' : 'Live view ended.'}
          </p>
          <button type="button" className={`${styles.btn} ${styles.btnLg}`} onClick={again}>
            <Play /> {state === 'error' ? 'Try again' : 'Watch again'}
          </button>
        </div>
      ) : null}

      <div className={styles.liveBar}>
        {state === 'live' || state === 'connecting' ? (
          <button type="button" className={styles.liveCtl} onClick={() => end()}>
            Stop
          </button>
        ) : null}
        <span className={styles.liveSpacer} />
        <button
          type="button"
          className={styles.liveCtlIcon}
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          title={muted ? 'Turn sound on' : 'Turn sound off'}
        >
          {muted ? <Muted /> : <Speaker />}
        </button>
        <button type="button" className={styles.liveCtlIcon} onClick={fullscreen} aria-label="Full screen" title="Full screen">
          <Expand />
        </button>
      </div>
    </div>
  )
}
