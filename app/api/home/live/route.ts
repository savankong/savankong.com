import { NextResponse, type NextRequest } from 'next/server'
import { queueCommand, waitForCommand } from '@/lib/home/commands'
import { getDevice } from '@/lib/home/data'

// Starts a live view. Middleware has already checked the session.
// Body: { deviceId, sdp } where sdp is the browser's complete WebRTC offer.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { deviceId?: string; sdp?: string } | null
  if (!body?.deviceId || typeof body.sdp !== 'string' || body.sdp.length > 20_000) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  const device = await getDevice(body.deviceId)
  if (!device?.capabilities.includes('record')) return NextResponse.json({ error: 'No such camera' }, { status: 404 })

  const id = await queueCommand(device.id, 'live_start', { sdp: body.sdp })
  const done = await waitForCommand(id, 15_000)
  if (!done) {
    return NextResponse.json({ error: 'The recorder did not answer. Is it running?' }, { status: 504 })
  }
  if (done.status !== 'done') return NextResponse.json({ error: done.error ?? 'Ring refused the live view' }, { status: 502 })
  return NextResponse.json(done.result)
}
