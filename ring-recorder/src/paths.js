// Builds "Front Door/2026-11-23/14-32-05_ding" style paths in the configured timezone.

export function safeName(name) {
  const cleaned = String(name)
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned || 'Unknown camera'
}

function parts(date, timeZone) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  return Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]))
}

/** Relative path (no extension) for a recording. */
export function recordingBase({ cameraName, date, kind, timeZone }) {
  const p = parts(date, timeZone)
  return `${safeName(cameraName)}/${p.year}-${p.month}-${p.day}/${p.hour}-${p.minute}-${p.second}_${kind}`
}
