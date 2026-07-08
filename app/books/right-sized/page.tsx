import Link from "next/link";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import styles from "../detail.module.css";

export const metadata: Metadata = {
  title: "Right-Sized: A Corporate Jargon Coloring Book — Savan Kong",
  description: "A corporate jargon coloring book, part of the Life Between Titles book series. Coming soon.",
};

export default function RightSized() {
  return (
    <>
      <Nav active="Books" />

      <section className={`${styles.heroGrid} glow-bg`}>
        <div className={styles.coverPlaceholder}>
          <span className={styles.coverPlaceholderText}>
            Cover
            <br />
            Coming Soon
          </span>
        </div>
        <div>
          <div className={styles.status}>Coming Soon · A Life Between Titles Book</div>
          <h1 className={styles.title}>
            Right-<span className="glitch">Sized.</span>
          </h1>
          <p className={styles.subtitle}>A Corporate Jargon Coloring Book</p>
          <p className={styles.desc}>Details coming soon.</p>
          <div className={styles.ctas}>
            <Link href="/books" className="pill-outline">
              ← Back to Books
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
