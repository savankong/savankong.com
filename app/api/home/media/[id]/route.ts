import { NextResponse, type NextRequest } from 'next/server'
import { getClip } from '@/lib/home/data'
import { signedUrl, storageConfigured } from '@/lib/home/storage'

// Middleware has already checked the session. This swaps a clip id for a
// short-lived signed Spaces URL, so the bucket itself stays private.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  const kind = req.nextUrl.searchParams.get('kind') ?? 'thumb'
  if (!Number.isInteger(id) || !storageConfigured()) return new NextResponse('Not found', { status: 404 })

  const clip = await getClip(id).catch(() => null)
  const key = kind === 'thumb' ? clip?.thumbKey : clip?.videoKey
  if (!clip || !key) return new NextResponse('Not found', { status: 404 })

  const stamp = clip.startedAt.toISOString().slice(0, 16).replace(':', '')
  const name = kind === 'download' ? `${clip.deviceName.replace(/[^\w-]+/g, '-')}-${stamp}.mp4` : undefined
  const url = await signedUrl(key, 3600, name)
  return NextResponse.redirect(url, {
    status: 302,
    headers: { 'Cache-Control': kind === 'thumb' ? 'private, max-age=3000' : 'private, no-store' },
  })
}
