import { execFileSync } from 'child_process'
import { SEED_POSTS } from '../lib/seed-data'

function sqlLiteral(v: string | null): string {
  if (v === null) return 'NULL'
  return `'${v.replace(/'/g, "''")}'`
}

function seed() {
  for (const p of SEED_POSTS) {
    const statement = `INSERT INTO posts (slug, title, excerpt, body, status, published_at) VALUES (${sqlLiteral(p.slug)}, ${sqlLiteral(p.title)}, ${sqlLiteral(p.excerpt)}, ${sqlLiteral(p.body)}, ${sqlLiteral(p.status)}, ${sqlLiteral(p.publishedAt)}) ON CONFLICT (slug) DO NOTHING RETURNING slug;`

    const out = execFileSync('netlify', ['database', 'connect', '--query', statement], {
      encoding: 'utf-8',
    })
    console.log(out)
  }
  console.log(`Seeded ${SEED_POSTS.length} posts.`)
}

seed()
