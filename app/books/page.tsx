import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import NewsletterSignup from "@/components/NewsletterSignup";
import styles from "./books.module.css";
import detailStyles from "./detail.module.css";

export const metadata: Metadata = {
  title: "Books — Savan Kong",
  description:
    "Laid Off and Lost, Halfway Light, and Right-Sized: A Corporate Jargon Coloring Book — books by Savanrith \"Savan\" Kong.",
};

const seriesBooks = [
  {
    status: "Available Now",
    title: "Laid Off and Lost.",
    desc: "The identity crisis, the isolation, and the process of rebuilding after a layoff.",
    href: "/books/laid-off-and-lost",
    cover: "https://www.lifebetweentitles.com/Cover-LaidOff.jpg",
  },
  {
    status: "Coming Soon",
    title: "Right-Sized.",
    desc: "A corporate jargon coloring book.",
    href: "/books/right-sized",
    cover: null,
  },
];

export default function BooksHub() {
  return (
    <>
      <Nav active="Books" />

      <section className={`${styles.hero} glow-bg`}>
        <h1 className={styles.h1}>Books.</h1>
        <p className={styles.intro}>
          Savanrith &ldquo;Savan&rdquo; Kong writes from inside the
          transitions he covers. <strong>Laid Off and Lost</strong> turned a
          year of unemployment and 29 interviews into a practical guide for
          identity after a layoff. <strong>Right-Sized: A Corporate Jargon
          Coloring Book</strong> takes a lighter, satirical turn at the same
          material. And his next book, <strong>Halfway Light</strong>, moves
          the lens to his own family — three generations carrying the Khmer
          Rouge genocide in silence, and what it costs to finally speak it.
        </p>
      </section>

      <section className="section black-bg top-border">
        <div className="eyebrow">
          <span className="eyebrow-rule" />
          <span className="eyebrow-label">Now Available</span>
        </div>
        <div className={styles.featuredGrid}>
          <div className={styles.featuredCoverWrap}>
            <Image
              src="https://www.lifebetweentitles.com/Cover-LaidOff.jpg"
              alt="Laid Off and Lost book cover"
              width={300}
              height={450}
            />
          </div>
          <div>
            <h2 className={styles.featuredTitle}>
              Laid Off <span className="glitch">and Lost.</span>
            </h2>
            <p className={styles.featuredTagline}>
              Titles are temporary. Identity is not.
            </p>
            <p className={styles.featuredDesc}>
              The whole truth about what happens when the career ends and
              nobody talks about it: the identity crisis, the isolation, and
              the process of clarifying what you&rsquo;re actually trying to
              rebuild.
            </p>
            <div className={styles.featuredCtas}>
              <a
                href="https://www.amazon.com/dp/B0H7P4DGHX?tag=lifebetweenti-20"
                target="_blank"
                rel="noopener noreferrer"
                className="pill-filled"
              >
                Buy on Amazon →
              </a>
              <Link href="/books/laid-off-and-lost" className="pill-outline">
                Read More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section glow-bg">
        <div className={styles.seriesLabelRow}>
          <span className={styles.seriesLabelLine} />
          <span className={styles.seriesLabel}>A Life Between Titles Book</span>
          <span className={styles.seriesLabelLine} />
        </div>
        <div className={styles.seriesBox}>
          <div className={styles.seriesGrid}>
            {seriesBooks.map((book) => (
              <div key={book.title} className={styles.seriesCard}>
                {book.cover ? (
                  <div className={styles.seriesCoverWrap}>
                    <Image src={book.cover} alt={`${book.title} cover`} width={110} height={165} />
                  </div>
                ) : (
                  <div className={styles.seriesCoverPlaceholder}>
                    <span className={styles.seriesCoverPlaceholderText}>
                      Cover
                      <br />
                      Coming Soon
                    </span>
                  </div>
                )}
                <div>
                  <div className={styles.seriesCardStatus}>{book.status}</div>
                  <div className={styles.seriesCardTitle}>{book.title}</div>
                  <p className={styles.seriesCardDesc}>{book.desc}</p>
                  <Link href={book.href} className={styles.seriesCardLink}>
                    Learn more →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section black-bg top-border">
        <div className={styles.standaloneLabelRow}>
          <div className="eyebrow" style={{ marginBottom: 0 }}>
            <span className="eyebrow-rule" />
            <span className="eyebrow-label">A Standalone Memoir</span>
          </div>
        </div>
        <div className={styles.list}>
          <div className={styles.row}>
            <div className={styles.coverPlaceholder}>
              <span className={styles.coverPlaceholderText}>
                Cover
                <br />
                Coming Soon
              </span>
            </div>
            <div>
              <div className={styles.status}>In Progress</div>
              <div className={styles.rowTitle}>Halfway Light.</div>
              <p className={styles.rowDesc}>
                Tracing his family&rsquo;s survival of the Khmer Rouge
                genocide, their resettlement in America, and the silence
                passed down between generations.
              </p>
              <Link href="/books/halfway-light" className="pill-outline">
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`${detailStyles.pullQuoteWrap} glow-bg top-border`}>
        <p className={detailStyles.pullQuote}>
          &ldquo;They didn&rsquo;t talk about Cambodia because they&rsquo;d
          once survived by not talking about Cambodia.&rdquo;
          <span className={detailStyles.pullQuoteAttr}>— Halfway Light, Prologue</span>
        </p>
      </section>

      <section className="section black-bg top-border">
        <NewsletterSignup />
      </section>

      <Footer />
    </>
  );
}
