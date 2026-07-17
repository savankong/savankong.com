import Link from 'next/link'
import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { getPublishedPosts } from '@/lib/posts'
import styles from './the-latest.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'The Journal — Savan Kong',
  description: 'Journal entries on identity, leadership, and the space between titles, from Savanrith "Savan" Kong.',
}

export default async function TheLatest() {
  const posts = await getPublishedPosts()

  return (
    <>
      <Nav active="The Journal" />

      <section className={`${styles.hero} glow-bg`}>
        <h1 className={styles.h1}>Journal.</h1>
        <p className={styles.intro}>
          Writing on identity, leadership, and the space between titles — from
          the Pentagon to the podcast mic.
        </p>
      </section>

      <section className="section black-bg top-border">
        <div className={styles.listPaper}>
          <div className={styles.list}>
            {posts.length === 0 && <p className={styles.empty}>No entries yet.</p>}
            {posts.map((post) => (
              <div key={post.slug} className={styles.entry}>
                <div className={styles.entryDate}>
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : ''}
                </div>
                <div>
                  <div className={styles.entryTitle}>{post.title}</div>
                  <p className={styles.entryExcerpt}>{post.excerpt}</p>
                  <Link href={`/the-latest/${post.slug}`} className={styles.entryLink}>
                    Continue reading →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
