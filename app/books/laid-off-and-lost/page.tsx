import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import styles from "../detail.module.css";

export const metadata: Metadata = {
  title: "Laid Off and Lost — Savan Kong",
  description:
    "How to Survive a Job Loss, Rediscover Your Identity, and Rebuild Yourself After Being Let Go — by Savanrith \"Savan\" Kong.",
};

const parts = [
  {
    label: "Part One — Who Are You Without the Title?",
    chapters: [
      { num: "1", title: "The Badge Was Doing the Talking" },
      { num: "2", title: "The Armor Comes Off" },
    ],
  },
  {
    label: "Part Two — You're Going Through It Alone",
    chapters: [
      { num: "3", title: "Everyone's Fine (Except You)" },
      { num: "4", title: "The People Who Actually Help" },
    ],
  },
  {
    label: "Part Three — What Are You Rebuilding Toward?",
    chapters: [
      { num: "5", title: "Go Back to Get Forward" },
      { num: "6", title: "Your Wound Is Your Map" },
      { num: "7", title: "Move Before You Know" },
    ],
  },
];

const problems = [
  {
    num: "Problem 1",
    title: "You're Lost Without the Title",
    desc: "We've outsourced our identities to our careers for years. Without the title, we see just how much of ourselves was outsourced into it.",
  },
  {
    num: "Problem 2",
    title: "You're Doing This Alone",
    desc: "The job search is public optimism with private brutality. Isolation makes you believe something's wrong with you. There isn't.",
  },
  {
    num: "Problem 3",
    title: "You Don't Know What You're Rebuilding",
    desc: "Career advice teaches you how to find the next job. That's not the right place to start until you know where you're going.",
  },
];

export default function LaidOffAndLost() {
  return (
    <>
      <Nav active="Books" />

      <section className={`${styles.heroGrid} glow-bg`}>
        <div className={styles.coverWrap}>
          <Image
            src="https://www.lifebetweentitles.com/Cover-LaidOff.jpg"
            alt="Laid Off and Lost book cover"
            width={300}
            height={450}
          />
        </div>
        <div>
          <div className={styles.status}>Available Now · A Life Between Titles Book</div>
          <h1 className={styles.title}>
            Laid Off <span className="glitch">and Lost.</span>
          </h1>
          <p className={styles.subtitle}>
            How to Survive a Job Loss, Rediscover Your Identity, and Rebuild
            Yourself After Being Let Go
          </p>
          <div className={styles.authorLine}>
            By Savanrith &ldquo;Savan&rdquo; Kong · Host, Life Between Titles
          </div>
          <p className={styles.desc}>
            Most career books teach you how to craft a new resume. This one
            tells you the whole truth about what happens when the career ends
            and nobody talks about it: the identity crisis, the isolation,
            and the process of clarifying what you&rsquo;re actually trying to
            rebuild.
          </p>
          <div className={styles.ctas}>
            <a
              href="https://www.amazon.com/dp/B0H7P4DGHX?tag=lifebetweenti-20"
              target="_blank"
              rel="noopener noreferrer"
              className="pill-filled"
            >
              Buy on Amazon →
            </a>
            <Link href="/#podcast" className="pill-outline">
              Listen to the Podcast
            </Link>
          </div>
        </div>
      </section>

      <section className={`${styles.pullQuoteWrap} black-bg top-border`}>
        <p className={styles.pullQuote}>
          &ldquo;No title, no job, no house, no citizenship. Nothing, no one
          can take that away from me.&rdquo;
          <span className={styles.pullQuoteAttr}>— Mike Lee, executive and investor</span>
        </p>
      </section>

      <section className="section glow-bg">
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          <span className="eyebrow-rule" />
          <span className="eyebrow-label">What This Book Is About</span>
        </div>
        <div className={styles.proseSection}>
          <p className={styles.proseP}>
            It took a year of interviews with 29 people to write it. A
            Pentagon executive who lost two identities within one morning. A
            USAID employee who watched her agency collapse. A professional
            disc golf player whose career was never part of the plan. A
            single mother who returned to school at 52, finally able to
            pursue the thing she&rsquo;d always loved. Different backgrounds,
            different titles, different reasons for leaving. The same core
            problems underneath.
          </p>
          <p className={styles.proseP}>
            Savan wrote it while living the transition himself — unemployed
            for a year after leaving the Department of Defense, diagnosed
            with ADHD at 46, figuring it out in real time as he wrote each
            chapter. Every chapter ends with a <strong>Try This</strong>{" "}
            section: concrete steps you can start this week, not someday
            advice.
          </p>
          <p className={styles.proseP}>
            If you just lost a job and don&rsquo;t know who you are without
            it, this is for you. If you&rsquo;re still searching and feel
            alone in it, this is for you too. If you&rsquo;ve got the next
            job lined up but can&rsquo;t clarify what you&rsquo;re actually
            rebuilding, this is for you as well.
          </p>
        </div>
      </section>

      <section className="section black-bg top-border">
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          <span className="eyebrow-rule" />
          <span className="eyebrow-label">Three Problems Nobody Warned You About</span>
        </div>
        <div className={styles.problemsGrid}>
          {problems.map((p) => (
            <div key={p.num} className={styles.problemCard}>
              <span className={styles.problemNum}>{p.num}</span>
              <div className={styles.problemTitle}>{p.title}</div>
              <p className={styles.problemDesc}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section glow-bg">
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          <span className="eyebrow-rule" />
          <span className="eyebrow-label">Inside the Book</span>
        </div>
        <div className={styles.chapterList}>
          {parts.map((part) => (
            <div key={part.label}>
              <div className={styles.partLabel}>{part.label}</div>
              {part.chapters.map((ch) => (
                <div key={ch.num} className={styles.chapterRow}>
                  <span className={styles.chapterNum}>{ch.num}</span>
                  <span className={styles.chapterTitle}>{ch.title}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.pullQuoteWrap} black-bg top-border`}>
        <p className={styles.pullQuote} style={{ fontSize: 28 }}>
          &ldquo;You&rsquo;re not behind. You&rsquo;re not broken. Let&rsquo;s
          get into it.&rdquo;
        </p>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a
            href="https://www.amazon.com/dp/B0H7P4DGHX?tag=lifebetweenti-20"
            target="_blank"
            rel="noopener noreferrer"
            className="pill-filled"
          >
            Buy on Amazon →
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
