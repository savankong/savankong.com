// Cam: web app for ring-recorder. No build step, no dependencies.

const $ = (sel) => document.querySelector(sel)
const KIND = {
  ding: { label: 'Ring', cls: 'k-ding' },
  person: { label: 'Person', cls: 'k-person' },
  motion: { label: 'Motion', cls: 'k-motion' },
}
const kindInfo = (k) => KIND[k] ?? { label: k ?? 'Event', cls: '' }

const state = {
  cameras: [],
  items: [],
  hasMore: false,
  kind: '',
  camera: '',
  selected: null,
}

// ---------- api ----------
class AuthError extends Error {}
async function api(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers ?? {}) },
    credentials: 'same-origin',
  })
  if (res.status === 401 && path !== '/api/login') throw new AuthError()
  const body = res.headers.get('content-type')?.includes('json') ? await res.json() : await res.text()
  if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`)
  return body
}

// ---------- formatting ----------
const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
const timeSecFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' })
const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
function dayLabel(d) {
  const today = new Date()
  const y = new Date(today)
  y.setDate(today.getDate() - 1)
  if (dayKey(d) === dayKey(today)) return 'Today'
  if (dayKey(d) === dayKey(y)) return 'Yesterday'
  return dayFmt.format(d)
}
const dur = (s) => (s == null ? '' : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`)
function ago(iso) {
  const s = Math.round((Date.now() - Date.parse(iso)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue
    if (k === 'class') node.className = v
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v)
    else if (k === 'style') node.style.cssText = v
    else node.setAttribute(k, v === true ? '' : v)
  }
  for (const c of children.flat()) if (c != null) node.append(c.nodeType ? c : String(c))
  return node
}

// ---------- login ----------
function showLogin() {
  $('#app').hidden = true
  $('#login').hidden = false
  $('#password').focus()
}
$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  $('#login-error').textContent = ''
  try {
    await api('/api/login', { method: 'POST', body: JSON.stringify({ password: $('#password').value }) })
    $('#password').value = ''
    start()
  } catch (err) {
    $('#login-error').textContent = err.message
  }
})
$('#logout').addEventListener('click', async () => {
  await api('/api/logout', { method: 'POST' }).catch(() => {})
  stream?.close()
  showLogin()
})

// ---------- cameras ----------
function renderCameras() {
  const strip = $('#cameras')
  strip.replaceChildren(
    ...state.cameras.map((c) => {
      const status = c.recording
        ? el('span', { class: 'badge badge-rec' }, 'Recording')
        : c.isOffline
          ? el('span', { class: 'badge' }, 'Offline')
          : null
      const battery = c.hasBattery && c.batteryLevel != null ? el('span', { class: 'badge' }, `${c.batteryLevel}%`) : null
      const card = el(
        'div',
        {
          class: 'cam',
          role: 'button',
          tabindex: '0',
          'aria-label': `${c.name}: show recordings`,
          style: c.latest?.poster ? `background-image:url("${c.latest.poster}")` : null,
          onclick: () => setCamera(String(c.id)),
          onkeydown: (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setCamera(String(c.id))),
        },
        c.latest?.poster ? null : el('div', { class: 'cam-empty' }, 'No recordings yet'),
        el('div', { class: 'cam-top' }, status ?? el('span'), battery),
        el(
          'div',
          { class: 'cam-bottom' },
          el(
            'div',
            {},
            el('div', { class: 'cam-name' }, c.name),
            el('div', { class: 'cam-sub' }, c.latest ? `${kindInfo(c.latest.kind).label} · ${ago(c.latest.startedAt)}` : c.model),
          ),
          el(
            'button',
            {
              class: 'btn btn-live',
              type: 'button',
              disabled: c.isOffline,
              onclick: (e) => {
                e.stopPropagation()
                openLive(c)
              },
            },
            'Live',
          ),
        ),
      )
      return card
    }),
  )

  const sel = $('#camera-filter')
  const current = sel.value
  sel.replaceChildren(
    el('option', { value: '' }, 'All cameras'),
    ...state.cameras.map((c) => el('option', { value: String(c.id) }, c.name)),
  )
  sel.value = current
}

function setCamera(id) {
  state.camera = state.camera === id ? '' : id
  $('#camera-filter').value = state.camera
  loadRecordings()
}
$('#camera-filter').addEventListener('change', (e) => {
  state.camera = e.target.value
  loadRecordings()
})
$('#chips').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip')
  if (!chip) return
  state.kind = chip.dataset.kind
  for (const c of document.querySelectorAll('.chip')) c.setAttribute('aria-selected', String(c === chip))
  loadRecordings()
})

// ---------- list ----------
function matches(item) {
  return (!state.kind || item.kind === state.kind) && (!state.camera || String(item.cameraId) === state.camera)
}

function renderList(newId) {
  const list = $('#list')
  if (!state.items.length) {
    list.replaceChildren(
      el('div', { class: 'list-empty' }, state.kind || state.camera ? 'Nothing matches these filters.' : 'No recordings yet. Ring a doorbell to test.'),
    )
  } else {
    const nodes = []
    let lastDay = ''
    for (const item of state.items) {
      const d = new Date(item.startedAt)
      if (dayKey(d) !== lastDay) {
        lastDay = dayKey(d)
        nodes.push(el('div', { class: 'day' }, dayLabel(d)))
      }
      const k = kindInfo(item.kind)
      nodes.push(
        el(
          'button',
          {
            class: `row${item.id === newId ? ' is-new' : ''}`,
            type: 'button',
            'data-id': item.id,
            'aria-current': item.id === state.selected?.id ? 'true' : null,
            onclick: () => select(item),
          },
          el(
            'div',
            { class: 'thumb' },
            item.poster ? el('img', { src: item.poster, alt: '', loading: 'lazy' }) : null,
            el('span', { class: 'dur' }, dur(item.durationSeconds)),
          ),
          el(
            'div',
            { class: 'row-main' },
            el(
              'div',
              { class: 'row-top' },
              el('span', { class: `kind ${k.cls}` }, el('span', { class: 'kind-dot' }), k.label),
              el('span', { class: 'row-time' }, timeFmt.format(d)),
            ),
            el('div', { class: 'row-cam' }, item.cameraName),
          ),
        ),
      )
    }
    list.replaceChildren(...nodes)
  }
  $('#more').hidden = !state.hasMore
}

async function loadRecordings({ append = false } = {}) {
  const q = new URLSearchParams({ limit: '60' })
  if (state.kind) q.set('kind', state.kind)
  if (state.camera) q.set('camera', state.camera)
  if (append && state.items.length) q.set('before', state.items.at(-1).startedAt)
  const { items, hasMore } = await api(`/api/recordings?${q}`)
  state.items = append ? state.items.concat(items) : items
  state.hasMore = hasMore
  renderList()
  if (!append && !state.selected && items.length && matchMedia('(min-width: 901px)').matches) select(items[0], { autoplay: false })
}
$('#more').addEventListener('click', () => loadRecordings({ append: true }).catch(handleError))

// ---------- player ----------
function select(item, { autoplay = true } = {}) {
  state.selected = item
  const k = kindInfo(item.kind)
  const d = new Date(item.startedAt)
  $('#player').classList.remove('is-empty')
  $('#player-empty').hidden = true
  $('#player-body').hidden = false

  const video = $('#video')
  video.poster = item.poster ?? ''
  video.src = item.video
  if (autoplay) video.play().catch(() => {})

  $('#p-title').textContent = `${k.label} · ${item.cameraName}`
  $('#p-sub').textContent = `${dayLabel(d)}, ${timeSecFmt.format(d)} · ${dur(item.durationSeconds)}`
  const dl = $('#download')
  dl.href = item.video
  dl.download = `${item.cameraName} ${item.startedAt.replace(/[:.]/g, '-')}.mp4`

  const total = Math.max(item.durationSeconds || 1, 1)
  $('#markers').replaceChildren(
    ...item.events.map((ev) => {
      const ki = kindInfo(ev.kind)
      return el('button', {
        class: `marker ${ki.cls}`,
        type: 'button',
        title: `${ki.label} at ${dur(ev.offsetSeconds)}`,
        'aria-label': `${ki.label} at ${dur(ev.offsetSeconds)}`,
        style: `left:${Math.min(100, (ev.offsetSeconds / total) * 100)}%`,
        onclick: () => {
          video.currentTime = ev.offsetSeconds
          video.play().catch(() => {})
        },
      })
    }),
  )

  for (const row of document.querySelectorAll('.row')) row.setAttribute('aria-current', String(row.dataset.id === item.id))
  if (matchMedia('(max-width: 900px)').matches) window.scrollTo({ top: 0, behavior: 'smooth' })
}

function step(delta) {
  if (!state.items.length) return
  const i = state.items.findIndex((x) => x.id === state.selected?.id)
  const next = state.items[Math.max(0, Math.min(state.items.length - 1, i + delta))]
  if (next && next !== state.selected) {
    select(next)
    document.querySelector(`.row[data-id="${CSS.escape(next.id)}"]`)?.scrollIntoView({ block: 'nearest' })
  }
}
$('#prev').addEventListener('click', () => step(-1))
$('#next').addEventListener('click', () => step(1))
document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, select, textarea') || !$('#live').hidden) return
  if (e.key === 'ArrowDown' || e.key === 'j') (e.preventDefault(), step(1))
  if (e.key === 'ArrowUp' || e.key === 'k') (e.preventDefault(), step(-1))
})

// ---------- live updates (SSE) ----------
let stream
function connectStream() {
  stream?.close()
  const conn = $('#conn')
  stream = new EventSource('/api/stream')
  stream.onopen = () => {
    conn.className = 'conn ok'
    conn.querySelector('.conn-label').textContent = 'Live'
  }
  stream.onerror = () => {
    conn.className = 'conn bad'
    conn.querySelector('.conn-label').textContent = 'Reconnecting'
    // A 401 closes the stream for good; check whether we were signed out.
    if (stream.readyState === EventSource.CLOSED) api('/api/cameras').catch(handleError)
  }
  stream.addEventListener('recording-started', (e) => {
    const { cameraId, kind } = JSON.parse(e.data)
    const cam = state.cameras.find((c) => c.id === cameraId)
    if (!cam) return
    cam.recording = true
    renderCameras()
    toast(`${kindInfo(kind).label} at ${cam.name}`, () => openLive(cam))
  })
  stream.addEventListener('recording-stopped', (e) => {
    const cam = state.cameras.find((c) => c.id === JSON.parse(e.data).cameraId)
    if (cam) (cam.recording = false), renderCameras()
  })
  stream.addEventListener('recording', (e) => {
    const item = JSON.parse(e.data)
    const cam = state.cameras.find((c) => c.id === item.cameraId)
    if (cam) cam.latest = { id: item.id, kind: item.kind, startedAt: item.startedAt, poster: item.poster }
    renderCameras()
    if (matches(item) && !state.items.some((x) => x.id === item.id)) {
      state.items.unshift(item)
      renderList(item.id)
    }
  })
}

function toast(text, onClick) {
  const t = el('div', { class: 'toast', role: 'status', onclick: () => (t.remove(), onClick?.()) }, el('span', { class: 'badge badge-rec' }, 'Now'), text)
  $('#toasts').append(t)
  setTimeout(() => t.remove(), 8000)
}

// ---------- live view (WebRTC straight from Ring to the browser) ----------
let liveSession = null
async function openLive(cam) {
  closeLive()
  const dialog = $('#live')
  const video = $('#live-video')
  const status = $('#live-status')
  $('#live-title').textContent = cam.name
  $('#live-timer').textContent = ''
  status.textContent = 'Connecting…'
  status.hidden = false
  video.muted = true
  $('#live-mute').textContent = 'Unmute'
  dialog.hidden = false
  $('#live-end').focus()

  const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
  const session = { pc, id: null, timer: null }
  liveSession = session
  pc.addTransceiver('video', { direction: 'recvonly' })
  pc.addTransceiver('audio', { direction: 'recvonly' })
  pc.ontrack = (e) => {
    video.srcObject = e.streams[0] ?? new MediaStream([e.track])
    status.hidden = true
  }
  pc.onconnectionstatechange = () => {
    if (['failed', 'disconnected'].includes(pc.connectionState) && liveSession === session) {
      status.hidden = false
      status.textContent = 'Connection lost'
    }
  }

  try {
    await pc.setLocalDescription(await pc.createOffer())
    await waitForIce(pc)
    if (liveSession !== session) return
    const answer = await api(`/api/cameras/${cam.id}/live`, {
      method: 'POST',
      body: JSON.stringify({ sdp: pc.localDescription.sdp }),
    })
    session.id = answer.sessionId
    if (liveSession !== session) return endRemote(session.id)
    await pc.setRemoteDescription({ type: 'answer', sdp: answer.sdp })
    const endsAt = Date.now() + answer.maxSeconds * 1000
    session.timer = setInterval(() => {
      const left = Math.max(0, Math.round((endsAt - Date.now()) / 1000))
      $('#live-timer').textContent = `ends in ${dur(left)}`
      if (!left) closeLive()
    }, 1000)
  } catch (err) {
    if (err instanceof AuthError) return closeLive(), showLogin()
    status.hidden = false
    status.textContent = `Couldn't start live view: ${err.message}`
  }
}

function waitForIce(pc) {
  if (pc.iceGatheringState === 'complete') return Promise.resolve()
  return new Promise((resolve) => {
    const done = () => (clearTimeout(t), resolve())
    const t = setTimeout(resolve, 2500)
    pc.addEventListener('icegatheringstatechange', () => pc.iceGatheringState === 'complete' && done())
  })
}

function endRemote(id) {
  if (!id) return
  const url = `/api/live/${encodeURIComponent(id)}/end`
  if (!navigator.sendBeacon?.(url)) fetch(url, { method: 'POST', keepalive: true }).catch(() => {})
}

function closeLive() {
  const s = liveSession
  liveSession = null
  if (s) {
    clearInterval(s.timer)
    s.pc.close()
    endRemote(s.id)
  }
  $('#live-video').srcObject = null
  $('#live').hidden = true
}
$('#live-end').addEventListener('click', closeLive)
$('#live-mute').addEventListener('click', () => {
  const v = $('#live-video')
  v.muted = !v.muted
  $('#live-mute').textContent = v.muted ? 'Unmute' : 'Mute'
})
document.addEventListener('keydown', (e) => e.key === 'Escape' && !$('#live').hidden && closeLive())
addEventListener('pagehide', closeLive)

// ---------- boot ----------
function handleError(err) {
  if (err instanceof AuthError) return showLogin()
  console.error(err)
  toast(err.message)
}

async function start() {
  try {
    state.cameras = await api('/api/cameras')
  } catch (err) {
    return handleError(err)
  }
  $('#login').hidden = true
  $('#app').hidden = false
  $('#player').classList.add('is-empty')
  renderCameras()
  await loadRecordings().catch(handleError)
  connectStream()
}

// Keep "5m ago" labels fresh.
setInterval(() => !$('#app').hidden && renderCameras(), 60_000)

start()
