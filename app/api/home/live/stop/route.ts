import { NextResponse, type NextRequest } from 'next/server'
import { queueCommand } from '@/lib/home/commands'

// Ends a live view early. Called on Stop and when the page is hidden or
// closed (fetch keepalive), so the camera isn't left streaming.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { deviceId?: string; session?: string } | null
  if (!body?.deviceId || !body.session) return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  await queueCommand(body.deviceId, 'live_stop', { session: body.session }).catch(() => {})
  return NextResponse.json({ ok: true })
}
