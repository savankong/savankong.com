import { NextResponse } from 'next/server'
import { getPosts, createPost } from '@/lib/posts'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const posts = await getPosts()
    return NextResponse.json(posts)
  } catch (err) {
    console.error('GET /api/posts', err)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const post = await createPost(body)
    return NextResponse.json(post, { status: 201 })
  } catch (err) {
    console.error('POST /api/posts', err)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
