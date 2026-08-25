import Link from "next/link";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About — Savan Kong",
  description:
    "Savan Kong is a product, UX, and CX executive with 20+ years of experience building and scaling customer-facing platforms across government and private sector organizations.",
};

export default function About() {
  return (
    <>
      <Nav active="About" />

      <section className={`${styles.hero} glow-bg`}>
        <div className={styles.intro}>
          <h1 className={styles.h1}>Hi, I&rsquo;m Savan.</h1>
          <p className={styles.lede}>
            I&rsquo;m a product, UX, and CX executive with 20+ years scaling
            customer-facing platforms across government and the private
            sector — including a run as the Department of Defense&rsquo;s
            first Customer Experience Officer, work that earned me the 2024
            DefenseScoop Industry Leadership Award. I&rsquo;m also the author
            of <strong>Laid Off and Lost</strong>, and the host of the{" "}
            <strong>Life Between Titles</strong> podcast network. Most of what
            I write and talk about comes from the same place: figuring out
            who you are when the title, the role, or the certainty you built
            your identity on is suddenly gone.
          </p>
        </div>
      </section>

      <section className="section glow-bg">
        <div className={styles.body}>
          <h2 className={styles.h2}>About Me</h2>

          <h3 className={styles.h3}>Executive &amp; Product Leader</h3>
          <p className={styles.p}>
            Savan Kong is a product, UX, and CX executive with 20+ years of
            experience building and scaling customer-facing platforms across
            government and private sector organizations.
          </p>
          <p className={styles.p}>
            He served as the inaugural Customer Experience Officer (CXO) for
            the U.S. Department of Defense, work that earned him the 2024
            DefenseScoop Industry Leadership Award. Prior to that, he was
            General Manager at Rebellion Defense, a venture-backed defense AI
            company, where he owned product strategy for IRIS, an AI-driven
            ISR platform, and led the launch of Dispatch, an autonomous
            readiness platform, from concept to shipped product.
          </p>

          <h3 className={styles.h3}>Defense Digital Service</h3>
          <p className={styles.p}>
            Before Rebellion Defense, he spent over three years as a Digital
            Service Expert at the Defense Digital Service (DDS), a posting
            worth explaining on its own. DDS was established by the Secretary
            of Defense in November 2015 as a small, handpicked team of
            designers, engineers, and data scientists pulled in from
            industry, and it reports directly to the secretary of defense
            rather than through the normal DoD IT chain of command. It became
            known, including in coverage by the U.S. Army&rsquo;s own news
            service, as the &ldquo;swat team of nerds&rdquo; brought in to
            work on some of the hardest problems in the Defense Department.
            Being selected into DDS means being pulled into one of the most
            elite, fast-moving technical units in the federal government.
          </p>
          <p className={styles.p}>
            While there, Savan designed BOBA, a biometric data collection
            platform deployed across 10+ field sites including Afghanistan.
            During Operation Allies Refuge in August 2021, he led design and
            delivery for Project Oscar, building interfaces under extreme
            time pressure that helped support the evacuation of 120,000+
            Afghan allies. He also designed Project Rabbit, a data matching
            system for Special Immigrant Visa processing that replaced a
            manual, error-prone workflow and helped clear a backlog of
            10,000+ cases, and co-authored the DoD Digital Hiring Playbook,
            later adopted across 15+ federal agencies to modernize technical
            recruiting.
          </p>

          <h3 className={styles.h3}>Private Sector</h3>
          <p className={styles.p}>
            In the private sector, he was a founding employee at Redfin,
            where he co-invented the company&rsquo;s map-based search
            technology (US Patent 9436945B2). He later led design for Kindle
            at Amazon and served as Director of UX and Product at Kareo.
          </p>

          <h3 className={styles.h3}>Founder</h3>
          <p className={styles.p}>
            He&rsquo;s also built a portfolio of his own ventures, each
            solving a concrete problem for its users:
          </p>
          <ul className={styles.bulletList}>
            <li>
              <Link href="/ventures#your-roster" className={styles.inlineLink}>
                Your Roster
              </Link>
              : a job search platform pivoting into a verified talent
              pipeline, giving job seekers access to vetted opportunities and
              helping employers cut through resume noise to find qualified
              candidates faster.
            </li>
            <li>
              <Link href="/ventures#war-room" className={styles.inlineLink}>
                WarRoom USA
              </Link>
              : a federal business development intelligence platform mapping
              DoD program offices, helping contractors and consultants target
              the right offices and decision makers and shorten federal BD
              cycles.
            </li>
            <li>
              <Link href="/ventures#cambo" className={styles.inlineLink}>
                Cambo
              </Link>
              : an AI-powered compliance test prep tool covering DoD Cyber
              Awareness, OPSEC, CUI, HIPAA, and other certifications, helping
              individuals and teams pass required exams more efficiently.
            </li>
            <li>
              <Link href="/ventures#light-lux" className={styles.inlineLink}>
                Light-Lux
              </Link>
              : a B2B sales consultancy and playbook run under his personal
              site, savankong.com, helping companies build and execute
              repeatable outbound sales strategies.
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
              , released in July 2026 across paperback, hardcover, and Kindle
              editions
            </li>
            <li>Interviewed 29 people over a year of reporting to write it</li>
            <li>
              Currently writing{" "}
              <Link href="/books/halfway-light" className={styles.inlineLink}>
                Halfway Light
              </Link>
              , a memoir tracing his path from a refugee camp in Thailand —
              where his family survived the Khmer Rouge genocide — to the
              executive suite
            </li>
          </ul>

          <h3 className={styles.h3}>Podcast Host</h3>
          <ul className={styles.bulletList}>
            <li>
              Hosts Life Between Titles, a podcast and platform on career
              reinvention, with a network of three shows: Life Between
              Titles, Work Unscripted, and Office Hours
            </li>
            <li>40+ conversations and counting, free everywhere you listen</li>
            <li>
              Launched the show from his home office in Longview, Washington,
              in the middle of his own job search
            </li>
          </ul>

          <h3 className={styles.h3}>Advisor</h3>
          <p className={styles.p}>
            He currently serves as a Principal at Deep Water Point &amp;
            Associates (DWPA), a PE-backed GovCon advisory firm, and as a
            Strategic Advisor to{" "}
            <a
              href="https://deepfathom.ai"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.inlineLink}
            >
              Deep Fathom
            </a>
            , an AI compliance platform for the Defense Industrial Base.
          </p>
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
