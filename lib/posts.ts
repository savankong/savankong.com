import { sql } from './db'

export type PostStatus = 'draft' | 'published'

export interface Post {
  slug: string
  title: string
  excerpt: string
  body: string
  status: PostStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

function rowToPost(r: Record<string, unknown>): Post {
  return {
    slug: r.slug as string,
    title: r.title as string,
    excerpt: r.excerpt as string,
    body: r.body as string,
    status: r.status as PostStatus,
    publishedAt: (r.published_at as string | null) ?? null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }
}

export async function getPosts(): Promise<Post[]> {
  const rows = await sql`SELECT * FROM posts ORDER BY COALESCE(published_at, created_at) DESC`
  return rows.map(rowToPost)
}

export async function getPublishedPosts(): Promise<Post[]> {
  const rows = await sql`
    SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC
  `
  return rows.map(rowToPost)
}

export async function getPost(slug: string): Promise<Post | null> {
  const rows = await sql`SELECT * FROM posts WHERE slug = ${slug} LIMIT 1`
  return rows[0] ? rowToPost(rows[0]) : null
}

export async function createPost(p: Post): Promise<Post> {
  const rows = await sql`
    INSERT INTO posts (slug, title, excerpt, body, status, published_at)
    VALUES (
      ${p.slug}, ${p.title}, ${p.excerpt}, ${p.body}, ${p.status},
      ${p.status === 'published' ? (p.publishedAt ?? new Date().toISOString()) : null}
    )
    RETURNING *
  `
  return rowToPost(rows[0])
}

export async function updatePost(slug: string, p: Post): Promise<Post> {
  const rows = await sql`
    UPDATE posts SET
      slug         = ${p.slug},
      title        = ${p.title},
      excerpt      = ${p.excerpt},
      body         = ${p.body},
      status       = ${p.status},
      published_at = ${p.status === 'published' ? (p.publishedAt ?? new Date().toISOString()) : null},
      updated_at   = NOW()
    WHERE slug = ${slug}
    RETURNING *
  `
  return rowToPost(rows[0])
}

export async function deletePost(slug: string): Promise<void> {
  await sql`DELETE FROM posts WHERE slug = ${slug}`
}
