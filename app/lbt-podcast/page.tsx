import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import styles from "./lbt-podcast.module.css";

export const metadata: Metadata = {
  title: "Life Between Titles — Savan Kong",
  description:
    "Life Between Titles is a podcast network for career transitions — raw, unscripted conversations with people navigating layoffs, burnout, and identity shifts, hosted by Savan Kong.",
};

const shows = [
  {
    flagship: true,
    label: "Flagship Show",
    title: "Life Between Titles.",
    tagline: "Raw, unscripted conversations with people navigating layoffs, burnout, and career identity shifts.",
    desc: "33 episodes across Season 1. Long-form conversations with people mid-transition — a USAID humanitarian worker, a DoD executive, a veterans advocate, a UX designer, and more.",
  },
  {
    label: "Unusual Careers",
    title: "Work Unscripted.",
    tagline: "Deep dives into unusual professional paths rarely discussed elsewhere.",
    desc: "12 episodes in Season 2. Guests include a professional disc golfer, a pediatric surgeon, a Marine general, a CIO, and an insect-protein scientist.",
  },
  {
    label: "Expert Conversations",
    title: "Office Hours.",
    tagline: "Structured conversations with coaches, consultants, and experts.",
    desc: "Shorter and more focused than the other shows — each episode addresses a specific question, from giving and receiving feedback to job searching and leadership.",
  },
];

export default function LbtPodcast() {
  return (
    <>
      <Nav active="LBT Podcast" />

      <section className={`${styles.hero} glow-bg`}>
        <h1 className={styles.h1}>Life Between Titles.</h1>
        <p className={styles.tagline}>
          Where one title ends &amp; the real story begins.
        </p>
        <p className={styles.intro}>
          Nobody wants to sit in the part where you don&rsquo;t yet know who
          you are without the title. Life Between Titles is a podcast network
          built for exactly that space — honest, unscripted stories from
          people navigating layoffs, career pivots, burnout, and identity
          shifts. Three shows. 40+ conversations and counting, free
          everywhere you listen.
        </p>
        <p className={styles.intro}>
          I founded and host the network, drawing on my own year of
          unemployment after leaving the Department of Defense and an ADHD
          diagnosis at 46 — the same uncertain in-between space I ask my
          guests about.
        </p>
        <div className={styles.links}>
          <a
            href="https://open.spotify.com/show/1olZo0VDvHh9w0F2D2vEir"
            target="_blank"
            rel="noopener noreferrer"
            className="pill-filled"
          >
            Spotify
          </a>
          <a
            href="https://podcasts.apple.com/us/podcast/life-between-titles/id1844748787"
            target="_blank"
            rel="noopener noreferrer"
            className="pill-outline"
          >
            Apple
          </a>
          <a
            href="https://www.youtube.com/@LifeBetweenTitles"
            target="_blank"
            rel="noopener noreferrer"
            className="pill-outline"
          >
            YouTube
          </a>
        </div>
      </section>

      <section className="section black-bg top-border">
        <div className="eyebrow">
          <span className="eyebrow-rule" />
          <span className="eyebrow-label">Three Shows</span>
        </div>
        <div className={styles.showsGrid}>
          {shows.map((show) => (
            <div
              key={show.title}
              className={`${styles.showCard} ${show.flagship ? styles.showFlagship : ""}`}
            >
              <div className={styles.showLabel}>{show.label}</div>
              <h2 className={styles.showTitle}>{show.title}</h2>
              <p className={styles.showTagline}>{show.tagline}</p>
              <p className={styles.showDesc}>{show.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.ctaSection} section glow-bg top-border`}>
        <h2 className="h2">Catch Up on Every Episode.</h2>
        <p className={styles.ctaBody}>
          The full archive — every guest, every show, every conversation —
          lives on lifebetweentitles.com.
        </p>
        <a
          href="https://www.lifebetweentitles.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="pill-filled"
        >
          Visit Life Between Titles →
        </a>
      </section>

      <Footer />
    </>
  );
}
