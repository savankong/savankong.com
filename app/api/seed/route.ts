import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { SEED_POSTS } from '@/lib/seed-data'

export const dynamic = 'force-dynamic'

export async function POST() {
  const results = []
  for (const p of SEED_POSTS) {
    const rows = await sql`
      INSERT INTO posts (slug, title, excerpt, body, status, published_at)
      VALUES (${p.slug}, ${p.title}, ${p.excerpt}, ${p.body}, ${p.status}, ${p.publishedAt})
      ON CONFLICT (slug) DO NOTHING
      RETURNING slug
    `
    results.push({ slug: p.slug, inserted: rows.length > 0 })
  }
  return NextResponse.json({ results })
}
