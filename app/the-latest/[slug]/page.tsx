import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { getPost } from '@/lib/posts'
import styles from '../the-latest.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} — Savan Kong`,
    description: post.excerpt,
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post || post.status !== 'published') notFound()

  const paragraphs = post.body.split(/\n\s*\n/).filter(Boolean)

  return (
    <>
      <Nav active="The Journal" />

      <section className={`${styles.postHero} glow-bg`}>
        <Link href="/the-latest" className="back-link">
          ← Journal
        </Link>
        <span className={styles.postDate}>
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            : ''}
        </span>
        <h1 className={styles.postTitle}>{post.title}</h1>
        <p className={styles.postExcerpt}>{post.excerpt}</p>
      </section>

      <section className={`${styles.postBody} black-bg`}>
        <div className={styles.postBodyPaper}>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      <Footer />
    </>
  )
}
