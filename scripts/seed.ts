import { sql } from '../lib/db'
import { SEED_POSTS } from '../lib/seed-data'

async function seed() {
  for (const p of SEED_POSTS) {
    await sql`
      INSERT INTO posts (slug, title, excerpt, body, status, published_at)
      VALUES (${p.slug}, ${p.title}, ${p.excerpt}, ${p.body}, ${p.status}, ${p.publishedAt})
      ON CONFLICT (slug) DO NOTHING
    `
  }
  console.log(`Seeded ${SEED_POSTS.length} posts.`)
  process.exit(0)
}

seed()
