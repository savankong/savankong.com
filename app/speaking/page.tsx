import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import styles from "./speaking.module.css";

export const metadata: Metadata = {
  title: "Speaking Events — Savan Kong",
  description:
    "Savanrith \"Savan\" Kong speaks at conferences, industry panels, and podcasts on customer experience, digital transformation, career transitions, and identity after job loss.",
};

const engagements = [
  {
    format: "Panel",
    date: "December 2025",
    event: "GovExec Breakfast Buzz: DoD",
    session:
      "“Breaking Down IT Bottlenecks” — From Bottlenecks to Breakthroughs: Elevating User Experience in Defense IT",
    desc: "How cutting-edge digital tools are streamlining IT processes across the DoD, and how real-time data access improves decision-making and tactical response — alongside representatives from the Department of the Navy, DISA, and Riverbed.",
    href: "https://events.govexec.com/breakfast-buzz-dod/speakers/",
    cta: "View session →",
  },
  {
    format: "Featured Session",
    date: "March 2025",
    event: "Federal News Network — DoD Modernization Exchange",
    desc: "Building the Department of Defense’s first Customer Experience Office from the ground up — the strategy, alliances, and infrastructure it took to stand up a CXO function inside the Pentagon.",
    href: "https://federalnewsnetwork.com/defense-main/2025/03/dod-modernization-exchange-2025-savan-kong-on-building-first-pentagon-cx-office-from-the-ground-up/",
    cta: "Read / watch →",
  },
  {
    format: "Panel",
    date: "2025",
    event: "Federal Executive Forum",
    session:
      "Customer Experience Strategies in Government — Progress and Best Practices",
    desc: "How agencies use data, digital services, and cross-team strategy to improve customer experience — alongside CX leaders from CBP, VA, and the Federal EHR Modernization Office.",
    href: "https://federalnewsnetwork.com/cme-event/federal-executive-forum/federal-executive-forum-customer-experience-strategies-in-government-progress-and-best-practices-2025/",
    cta: "View event →",
  },
  {
    format: "Speaker",
    date: "2025",
    event: "AFCEA TechNet Indo-Pacific",
    desc: "Listed on the official AFCEA speaker roster for TechNet Indo-Pacific.",
    href: "https://events.afcea.org/tip25/Public/enter.aspx",
    cta: "View event →",
  },
  {
    format: "Podcast / Interview",
    date: "2025",
    event: "FedScoop — The Daily Scoop",
    session: "with Billy Mitchell",
    desc: "Reflecting on nearly 18 months as the Department of Defense’s first Customer Experience Officer — what got built, what’s next, and where AI fits into CX.",
    href: "https://fedscoop.com/radio/savan-kong-joins-the-podcast-to-discuss-the-pentagons-progress-in-digital-experience/",
    cta: "Listen →",
  },
  {
    format: "Podcast",
    date: "October 2025",
    event: "The 311 Podcast",
    session: "S2 E8 — “Design at Scale with Savan Kong”",
    desc: "Introducing design thinking into a massive, complex organization — building alliances with key stakeholders, finding organizational leverage points, and developing design infrastructure that scales.",
    href: "https://open.spotify.com/episode/2Cr5lf1BE3VHvYrLHqVx9C",
    cta: "Listen →",
  },
  {
    format: "Session",
    date: "June 2024 · Baltimore, MD",
    event: "AFCEA TechNet Cyber",
    session: "with Jason Pickart",
    desc: "The DoD’s approach to UX, the role of the CXO, and the DoD–VA integration case study — at the same conference where Fulcrum was unveiled.",
    href: "https://events.afcea.org/afceacyber25/Public/enter.aspx",
    cta: "View event →",
  },
  {
    format: "Panel",
    date: "March 2024",
    event: "DefenseTalks 2024",
    session: "“Building a Resilient Government with Secure Automation”",
    desc: "A panel on strengthening resilience in government through secure automation, at DefenseScoop’s DefenseTalks 2024.",
    href: "https://defensetalks.upgather.com/2024/",
    cta: "View event →",
    photo: "/speaking/defensetalks-2024.jpg",
  },
  {
    format: "Speaker",
    date: "2025",
    event: "ServiceNow Federal Forum",
    desc: "Speaker profile for the UX Portfolio Management Office role at the DoD CIO, at ServiceNow’s annual federal conference.",
    href: "https://www.nowfedforum.com/profile/savanrith-savan-kong/",
    cta: "View profile →",
  },
  {
    format: "Podcast",
    date: "",
    event: "Khmer Voices",
    session: "“Seeing the Power of Privilege at Play”",
    desc: "From South Seattle and the Khmer Rouge, to Lakeside School, to the Pentagon — on privilege, grit, and the resources that shape who gets to succeed.",
    href: "https://www.ivoox.com/en/seeing-the-power-of-privilege-at-play-with-audios-mp3_rf_146556782_1.html",
    cta: "Listen →",
  },
];

export default function Speaking() {
  return (
    <>
      <Nav active="Speaking" />

      <section className={`${styles.hero} glow-bg`}>
        <h1 className={styles.h1}>Speaking Events.</h1>
        <div className={styles.openItems}>
          <div className={styles.openItemsLabel}>Open Item</div>
          <p className={styles.openItemsText}>
            I have two photos from a panel on November 15, 2024 in Crystal
            City / Arlington, VA that I haven&rsquo;t identified yet. If you
            recognize the event, let me know and I&rsquo;ll add it below.
          </p>
        </div>
        <p className={styles.intro}>
          I speak at conferences, industry panels, and podcasts on customer
          experience, digital transformation, and what it takes to build a CX
          function inside a large, complex organization. I also speak on
          career transitions and reinvention — the focus of my podcast,{" "}
          <strong>Life Between Titles</strong> — and on themes from the two
          books I&rsquo;m writing: <strong>Laid Off and Lost</strong>, a
          narrative nonfiction book on identity and rebuilding after job
          loss, drawn from a year of interviews with 29 people alongside my
          own story of being laid off from a decade at the Department of
          Defense; and <strong>Halfway Light</strong>, a memoir breaking my
          family&rsquo;s decades-long silence about surviving the Khmer
          Rouge genocide.
        </p>
        <div className={styles.orgsLabel}>Recent Engagements With</div>
        <p className={styles.orgsList}>
          <strong>AFCEA</strong> (TechNet Cyber, TechNet Indo-Pacific),{" "}
          <strong>Federal News Network</strong> (DoD Modernization Exchange,
          Federal Executive Forum), <strong>GovExec</strong> (Breakfast
          Buzz), <strong>DefenseScoop</strong> (DefenseTalks), the{" "}
          <strong>ServiceNow Federal Forum</strong>, and{" "}
          <strong>FedScoop</strong>.
        </p>
      </section>

      <div className={styles.list}>
        {engagements.map((item, i) => (
          <div
            key={`${item.event}-${item.date}`}
            className={
              item.photo
                ? i % 2 === 1
                  ? `${styles.entry} ${styles.entryReverse}`
                  : styles.entry
                : styles.entrySolo
            }
          >
            {item.photo && (
              <div className={styles.entryPhotoCol}>
                <div className={styles.entryPhoto}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.photo} alt={`${item.event} — Savan Kong speaking`} />
                </div>
              </div>
            )}
            <div>
              <div className={styles.entryMeta}>
                <span className={styles.format}>{item.format}</span>
                {item.date && (
                  <>
                    <span className={styles.dot}>·</span>
                    <span className={styles.date}>{item.date}</span>
                  </>
                )}
              </div>
              <h2 className={styles.event}>{item.event}</h2>
              {item.session && <p className={styles.session}>{item.session}</p>}
              <p className={styles.quote}>{item.desc}</p>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {item.cta}
              </a>
            </div>
          </div>
        ))}

        <p className={styles.note}>
          This list is pulled from public event archives and press coverage,
          so it may not be complete.
        </p>
      </div>

      <section className={`${styles.bookingSection} section black-bg top-border`}>
        <h2 className={styles.bookingTitle}>Have an Event in Mind?</h2>
        <p className={styles.bookingBody}>
          If you&rsquo;re interested in having me speak at your event,
          conference, or panel, reach out on LinkedIn with a brief summary
          of what you have in mind.
        </p>
        <a
          href="https://www.linkedin.com/in/savankong"
          target="_blank"
          rel="noopener noreferrer"
          className="pill-filled"
        >
          Message on LinkedIn →
        </a>
      </section>

      <Footer />
    </>
  );
}
