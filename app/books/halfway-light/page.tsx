import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import styles from "../detail.module.css";

export const metadata: Metadata = {
  title: "Halfway Light — Savan Kong",
  description:
    "A forthcoming memoir by Savanrith \"Savan\" Kong, tracing his family's survival of the Khmer Rouge genocide and resettlement in America.",
};

const chapters = [
  "The Lie of Three Days (1975)",
  "The Disappearance of Names",
  "The Crossing (1979)",
  "Khao-I-Dang (1980)",
  "First Snow (Lynnwood, 1981)",
  "Park Lake Homes (1985–1991)",
  "What My Mother Carried",
  "The Summer of Two Worlds",
  "Pioneer Square (2004)",
  "Taquitos in Queen Anne",
  "The Call to Serve",
  "Between Code and Conflict (Afghanistan, 2019)",
  "The Hotel Room War Room (August 2021)",
  "The Light We Carry Forward",
];

export default function HalfwayLight() {
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
          <div className={styles.status}>In Progress · A Standalone Memoir</div>
          <h1 className={styles.title}>
            Halfway <span className="glitch">Light.</span>
          </h1>
          <p className={styles.subtitle}>A Memoir</p>
          <div className={styles.authorLine}>By Savanrith &ldquo;Savan&rdquo; Kong</div>
          <p className={styles.desc}>
            At 46, Savan sat down to ask his parents the questions
            he&rsquo;d spent a lifetime avoiding — not because he
            didn&rsquo;t want to know, but because he was afraid of what
            asking would cost him. Halfway Light traces his family&rsquo;s
            survival of the Khmer Rouge genocide, the three-day walk that
            became a four-year exile, and the silence they carried across an
            ocean into a two-bedroom apartment in Lynnwood, Washington. It is
            an attempt, four decades later, to finally name what they never
            said out loud.
          </p>
          <div className={styles.ctas}>
            <a
              href="https://substack.com/@lifebetweentitles"
              target="_blank"
              rel="noopener noreferrer"
              className="pill-filled"
            >
              Follow Updates on Substack →
            </a>
          </div>
        </div>
      </section>

      <section className={`${styles.pullQuoteWrap} black-bg top-border`}>
        <p className={styles.pullQuote}>
          &ldquo;They didn&rsquo;t talk about Cambodia because they&rsquo;d
          once survived by not talking about Cambodia.&rdquo;
          <span className={styles.pullQuoteAttr}>— Halfway Light, Prologue</span>
        </p>
      </section>

      <section className="section glow-bg">
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          <span className="eyebrow-rule" />
          <span className="eyebrow-label">What&rsquo;s Inside</span>
        </div>
        <div className={styles.chapterList}>
          {chapters.map((title, i) => (
            <div key={title} className={styles.chapterRow}>
              <span className={styles.chapterNum}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.chapterTitle}>{title}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section black-bg top-border">
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          <span className="eyebrow-rule" />
          <span className="eyebrow-label">In Their Own Words</span>
        </div>
        <div className={styles.voicesGrid}>
          <div className={styles.voiceCard}>
            <p className={styles.voiceQuote}>
              &ldquo;We never ate until we were full. We ate to stay
              upright.&rdquo;
            </p>
            <div className={styles.voiceAttr}>— Im, his mother</div>
          </div>
          <div className={styles.voiceCard}>
            <p className={styles.voiceQuote}>
              &ldquo;To survive, you had to forget who you were. You had to
              forget that you remembered.&rdquo;
            </p>
            <div className={styles.voiceAttr}>— Saroeun, his father</div>
          </div>
        </div>
      </section>

      <section className={`${styles.pullQuoteWrap} glow-bg top-border`}>
        <p className={styles.pullQuote} style={{ fontSize: 28 }}>
          &ldquo;We didn&rsquo;t wait for permission. We just started
          walking.&rdquo;
          <span className={styles.pullQuoteAttr}>— Saroeun, his father</span>
        </p>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a
            href="https://substack.com/@lifebetweentitles"
            target="_blank"
            rel="noopener noreferrer"
            className="pill-filled"
          >
            Follow Updates on Substack →
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
