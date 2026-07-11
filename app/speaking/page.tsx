import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import styles from "./speaking.module.css";

export const metadata: Metadata = {
  title: "Speaking — Savan Kong",
  description:
    "Panels, sessions, and interviews with Savanrith \"Savan\" Kong on customer experience, digital transformation, and building CX programs inside government.",
};

const engagements = [
  {
    format: "Panel",
    date: "December 2025",
    event: "GovExec Breakfast Buzz: DoD",
    session:
      "“Breaking Down IT Bottlenecks” — From Bottlenecks to Breakthroughs: Elevating User Experience in Defense IT",
    desc: "A panel on how cutting-edge digital tools are streamlining IT processes across the DoD, and how real-time data access improves decision-making and tactical response — alongside representatives from the Department of the Navy, DISA, and Riverbed.",
    href: "https://events.govexec.com/breakfast-buzz-dod/speakers/",
    cta: "View session →",
  },
  {
    format: "Panel",
    date: "2025",
    event: "Federal Executive Forum",
    session:
      "Customer Experience Strategies in Government — Progress and Best Practices",
    desc: "A Federal News Network forum on how agencies use data, digital services, and cross-team strategy to improve customer experience — alongside CX leaders from CBP, VA, and the Federal EHR Modernization Office.",
    href: "https://federalnewsnetwork.com/cme-event/federal-executive-forum/federal-executive-forum-customer-experience-strategies-in-government-progress-and-best-practices-2025/",
    cta: "View event →",
  },
  {
    format: "Featured Session",
    date: "March 2025",
    event: "Federal News Network — DoD Modernization Exchange",
    desc: "On building the Department of Defense’s first Customer Experience Office from the ground up — the strategy, alliances, and infrastructure it took to stand up a CXO function inside the Pentagon.",
    href: "https://federalnewsnetwork.com/defense-main/2025/03/dod-modernization-exchange-2025-savan-kong-on-building-first-pentagon-cx-office-from-the-ground-up/",
    cta: "Read / watch →",
  },
  {
    format: "Speaker",
    date: "February 2025 · National Harbor, MD",
    event: "ServiceNow Federal Forum",
    desc: "Speaker profile for the UX Portfolio Management Office role at the DoD CIO, at ServiceNow’s annual federal conference.",
    href: "https://www.nowfedforum.com/profile/savanrith-savan-kong/",
    cta: "View profile →",
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
    format: "Session",
    date: "June 2024 · Baltimore, MD",
    event: "AFCEA TechNet Cyber",
    session: "with Jason Pickart",
    desc: "On the DoD’s approach to UX, the role of the CXO, and the DoD–VA integration case study — at the same conference where Fulcrum was unveiled.",
    href: "https://events.afcea.org/afceacyber25/Public/enter.aspx",
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
    desc: "On introducing design thinking into a massive, complex organization — building alliances with key stakeholders, finding organizational leverage points, and developing design infrastructure that scales.",
    href: "https://open.spotify.com/episode/2Cr5lf1BE3VHvYrLHqVx9C",
    cta: "Listen →",
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
        <h1 className={styles.h1}>Speaking.</h1>
        <p className={styles.intro}>
          Panels, sessions, and interviews on customer experience, digital
          transformation, and building CX programs inside government —
          drawn from AFCEA, Federal News Network, GovExec, and podcast
          appearances.
        </p>
      </section>

      <section className="section black-bg top-border">
        <div className={styles.body}>
          <div className={styles.list}>
            {engagements.map((item) => (
              <div key={`${item.event}-${item.date}`} className={styles.card}>
                <div className={styles.meta}>
                  <span className={styles.format}>{item.format}</span>
                  {item.date && (
                    <>
                      <span className={styles.dot}>·</span>
                      <span className={styles.date}>{item.date}</span>
                    </>
                  )}
                </div>
                <h2 className={styles.event}>{item.event}</h2>
                {item.session && (
                  <p className={styles.session}>{item.session}</p>
                )}
                <p className={styles.desc}>{item.desc}</p>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {item.cta}
                </a>
              </div>
            ))}
          </div>

          <p className={styles.note}>
            This list is pulled from public event archives and press
            coverage, so it may not be complete — reach out if you&rsquo;re
            organizing an event and want to add one.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
