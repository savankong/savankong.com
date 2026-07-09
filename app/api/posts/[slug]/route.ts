import { NextResponse } from 'next/server'
import { getPost, updatePost, deletePost } from '@/lib/posts'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const post = await getPost(slug)
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(post)
  } catch (err) {
    console.error('GET /api/posts/[slug]', err)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const body = await req.json()
    const post = await updatePost(slug, body)
    return NextResponse.json(post)
  } catch (err) {
    console.error('PUT /api/posts/[slug]', err)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    await deletePost(slug)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/posts/[slug]', err)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
