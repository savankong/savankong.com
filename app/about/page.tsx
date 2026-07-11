import Link from "next/link";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About — Savan Kong",
  description:
    "Savanrith \"Savan\" Kong is an award-winning executive, author, and podcast host writing about identity, leadership, and the space between titles.",
};

export default function About() {
  return (
    <>
      <Nav active="About" />

      <section className={`${styles.hero} glow-bg`}>
        <div className={styles.intro}>
          <h1 className={styles.h1}>Hi, I&rsquo;m Savan.</h1>
          <p className={styles.lede}>
            I&rsquo;m an award-winning executive, the Department of
            Defense&rsquo;s first Customer Experience Officer, the author of{" "}
            <strong>Laid Off and Lost</strong>, and the host of the{" "}
            <strong>Life Between Titles</strong> podcast network. Most of what
            I write and talk about comes from the same place: figuring out
            who you are when the title, the role, or the certainty you built
            your identity on is suddenly gone.
          </p>
        </div>
      </section>

      <section className="section black-bg top-border">
        <div className={styles.body}>
          <h2 className={styles.h2}>How My Work Will Benefit You</h2>
          <p className={styles.question}>
            How do you know who you are when the title is gone?
          </p>
          <p className={styles.p}>
            That question sits underneath almost everything I make. I write
            and talk about:
          </p>
          <ul className={styles.list}>
            <li>Surviving a layoff without losing your sense of self</li>
            <li>Rebuilding identity and purpose after a career ends</li>
            <li>The leadership skills that no algorithm can replace</li>
            <li>
              Translating government, military, and public-sector experience
              into private-sector success
            </li>
            <li>
              The family history and inherited silence that shape who we
              become, long before any job title does
            </li>
          </ul>
          <p className={styles.p}>
            I don&rsquo;t come at any of this as a theorist. I write from
            inside the transitions I cover &mdash; I was unemployed for a
            year after leaving the DoD, received an ADHD diagnosis at 46, and
            wrote my first book while still figuring it out. The podcast
            exists because I went looking for other people going through the
            same thing and couldn&rsquo;t find enough honest conversations
            about it.
          </p>
          <p className={styles.disclaimer}>
            I don&rsquo;t claim to have all the answers. What I can offer is
            what I&rsquo;ve lived, what nearly thirty guests have told me on
            the record, and what I&rsquo;m still learning in real time.
          </p>
        </div>
      </section>

      <section className="section glow-bg">
        <div className={styles.body}>
          <h2 className={styles.h2}>About Me</h2>

          <h3 className={styles.h3}>Executive &amp; Public Servant</h3>
          <ul className={styles.bulletList}>
            <li>
              First Customer Experience Officer in the history of the U.S.
              Department of Defense
            </li>
            <li>
              Led enterprise-wide customer experience transformation across
              the Pentagon
            </li>
            <li>
              Served almost a decade in federal government across three
              administrations
            </li>
            <li>
              Early team member at Redfin, helping build trust in a real
              estate model that didn&rsquo;t exist yet
            </li>
          </ul>

          <h3 className={styles.h3}>Author</h3>
          <ul className={styles.bulletList}>
            <li>
              Author of{" "}
              <Link href="/books/laid-off-and-lost" className={styles.inlineLink}>
                Laid Off and Lost: How to Survive a Job Loss, Rediscover Your
                Identity, and Rebuild Yourself After Being Let Go
              </Link>
            </li>
            <li>Interviewed 29 people over a year of reporting to write it</li>
            <li>
              Currently writing{" "}
              <Link href="/books/halfway-light" className={styles.inlineLink}>
                Halfway Light
              </Link>
              , a memoir tracing his family&rsquo;s survival of the Khmer
              Rouge genocide and their resettlement in America
            </li>
            <li>
              Also working on{" "}
              <Link href="/books/right-sized" className={styles.inlineLink}>
                Right-Sized: A Corporate Jargon Coloring Book
              </Link>
              , part of the Life Between Titles book series
            </li>
          </ul>

          <h3 className={styles.h3}>Podcast Host</h3>
          <ul className={styles.bulletList}>
            <li>
              Hosts Life Between Titles, a podcast network of three shows:
              Life Between Titles, Work Unscripted, and Office Hours
            </li>
            <li>40+ conversations and counting, free everywhere you listen</li>
            <li>
              Launched the show from his home office in Longview, Washington,
              in the middle of his own job search
            </li>
          </ul>

          <h3 className={styles.h3}>Founder</h3>
          <ul className={styles.bulletList}>
            <li>Founded War Room after leaving the Department of Defense</li>
            <li>Founded Light-Lux</li>
          </ul>
        </div>
      </section>

      <section className="section glow-bg top-border">
        <div className={styles.body}>
          <h2 className={styles.h2}>Speaking Engagements</h2>
          <p className={styles.p}>
            A running list of panels, sessions, and interviews on customer
            experience, digital transformation, and building CX programs
            inside government.
          </p>
          <div className={styles.speakingList}>
            <div className={styles.speakingCard}>
              <div className={styles.speakingMeta}>
                <span className={styles.speakingFormat}>Panel</span>
                <span className={styles.speakingDot}>·</span>
                <span className={styles.speakingDate}>December 2025</span>
              </div>
              <h3 className={styles.speakingEvent}>
                GovExec Breakfast Buzz: DoD
              </h3>
              <p className={styles.speakingSession}>
                &ldquo;Breaking Down IT Bottlenecks&rdquo; — From Bottlenecks
                to Breakthroughs: Elevating User Experience in Defense IT
              </p>
              <p className={styles.speakingDesc}>
                A panel on how cutting-edge digital tools are streamlining IT
                processes across the DoD, and how real-time data access
                improves decision-making and tactical response — alongside
                representatives from the Department of the Navy, DISA, and
                Riverbed.
              </p>
              <a
                href="https://events.govexec.com/breakfast-buzz-dod/speakers/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.speakingLink}
              >
                View session →
              </a>
            </div>

            <div className={styles.speakingCard}>
              <div className={styles.speakingMeta}>
                <span className={styles.speakingFormat}>Featured Session</span>
                <span className={styles.speakingDot}>·</span>
                <span className={styles.speakingDate}>March 2025</span>
              </div>
              <h3 className={styles.speakingEvent}>
                Federal News Network — DoD Modernization Exchange
              </h3>
              <p className={styles.speakingDesc}>
                On building the Department of Defense&rsquo;s first Customer
                Experience Office from the ground up — the strategy,
                alliances, and infrastructure it took to stand up a CXO
                function inside the Pentagon.
              </p>
              <a
                href="https://federalnewsnetwork.com/defense-main/2025/03/dod-modernization-exchange-2025-savan-kong-on-building-first-pentagon-cx-office-from-the-ground-up/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.speakingLink}
              >
                Read / watch →
              </a>
            </div>

            <div className={styles.speakingCard}>
              <div className={styles.speakingMeta}>
                <span className={styles.speakingFormat}>Podcast</span>
                <span className={styles.speakingDot}>·</span>
                <span className={styles.speakingDate}>October 2025</span>
              </div>
              <h3 className={styles.speakingEvent}>The 311 Podcast</h3>
              <p className={styles.speakingSession}>
                S2 E8 — &ldquo;Design at Scale with Savan Kong&rdquo;
              </p>
              <p className={styles.speakingDesc}>
                On introducing design thinking into a massive, complex
                organization — building alliances with key stakeholders,
                finding organizational leverage points, and developing design
                infrastructure that scales.
              </p>
              <a
                href="https://open.spotify.com/episode/2Cr5lf1BE3VHvYrLHqVx9C"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.speakingLink}
              >
                Listen →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section black-bg top-border">
        <div className={styles.body}>
          <h2 className={styles.h2}>Other Interests</h2>

          <h3 className={styles.h3}>Family &amp; Heritage</h3>
          <p className={styles.p}>
            I&rsquo;m Cambodian-American. My parents survived the Khmer Rouge
            genocide and rebuilt a life in Washington state after
            resettlement. That history stayed mostly unspoken for most of my
            life &mdash; it&rsquo;s the subject of Halfway Light, the memoir
            I&rsquo;m currently writing.
          </p>

          <h3 className={styles.h3}>Longview, Washington</h3>
          <p className={styles.p}>
            I live and work in Longview, where the podcast is recorded and
            most of what I write gets its first draft.
          </p>

          <h3 className={styles.h3}>Building Community for People in Transition</h3>
          <p className={styles.p}>
            A lot of what I do outside of writing and hosting is informal
            &mdash; checking in on people mid-search, making introductions,
            being the person who picks up the phone. It&rsquo;s the same
            instinct that started the podcast in the first place.
          </p>
        </div>
      </section>

      <section className="section glow-bg top-border">
        <div className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Start Here.</h2>
          <p className={styles.ctaBody}>
            The fastest way to get a feel for the work is to listen to an
            episode, read the book, or catch up on the journal.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/#podcast" className="pill-filled">
              ▶ Listen to the Podcast
            </Link>
            <Link href="/books/laid-off-and-lost" className="pill-outline">
              Get the Book
            </Link>
            <Link href="/the-latest" className="pill-outline">
              Read the Journal
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
