import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import styles from "./books.module.css";

export const metadata: Metadata = {
  title: "Books — Savan Kong",
  description:
    "Laid Off and Lost, Halfway Light, and Right/Sized. — books by Savanrith \"Savan\" Kong.",
};

const books = [
  {
    status: "Available Now",
    title: "Laid Off and Lost.",
    series: "A Life Between Titles Book",
    desc: "The whole truth about what happens when the career ends and nobody talks about it: the identity crisis, the isolation, and the process of clarifying what you're actually trying to rebuild.",
    href: "/books/laid-off-and-lost",
    cover: "https://www.lifebetweentitles.com/Cover-LaidOff.jpg",
  },
  {
    status: "In Progress",
    title: "Halfway Light.",
    series: "A Standalone Memoir",
    desc: "Tracing his family's survival of the Khmer Rouge genocide, their resettlement in America, and the silence passed down between generations.",
    href: "/books/halfway-light",
    cover: null,
  },
  {
    status: "Coming Soon",
    title: "Right/Sized.",
    series: "A Life Between Titles Book",
    desc: "Details coming soon.",
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
          Every book carries the same question forward: who are you when the
          title is gone? <strong>Laid Off and Lost</strong> answers it for the
          job search. <strong>Halfway Light</strong> answers it across
          generations. <strong>Right/Sized.</strong> answers it with a
          coloring pencil in hand.
        </p>
      </section>

      <section className="section black-bg top-border">
        <div className={styles.list}>
          {books.map((book, i) => (
            <div key={book.title} className={`${styles.row} ${i === 0 ? styles.rowFirst : ""}`}>
              {book.cover ? (
                <div className={styles.coverWrap}>
                  <Image src={book.cover} alt={`${book.title} cover`} width={180} height={270} />
                </div>
              ) : (
                <div className={styles.coverPlaceholder}>
                  <span className={styles.coverPlaceholderText}>
                    Cover
                    <br />
                    Coming Soon
                  </span>
                </div>
              )}
              <div>
                <div className={styles.status}>{book.status}</div>
                <div className={styles.rowTitle}>{book.title}</div>
                <div className={styles.rowSeries}>{book.series}</div>
                <p className={styles.rowDesc}>{book.desc}</p>
                <Link href={book.href} className="pill-outline">
                  Learn more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
