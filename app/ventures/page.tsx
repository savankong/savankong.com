import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import styles from "./ventures.module.css";

export const metadata: Metadata = {
  title: "Ventures — Savan Kong",
  description:
    "Your Roster, War Room, Cambo, and Light-Lux — the ventures, platforms, and communities built by Savan Kong.",
};

const ventures = [
  {
    id: "your-roster",
    logo: "/logos/your-roster.svg",
    badge: "Network-Powered Job Search",
    title: "Your Roster.",
    tagline: "The first thing people tell you when you lose a job: network.",
    desc: [
      "Losing my job taught me something I wish I'd known sooner.",
      "The jobs that actually came through weren't from applications I sent into a black hole. They came from people. Someone I'd worked with three jobs ago. A former teammate who remembered my work before I even had to explain it. The network I already had, sitting right there the whole time, was more powerful than any job board I scrolled through at 2am.",
      "So I started building something.",
      "It's called Roster, and the idea is simple: your job search shouldn't be a solo climb through hundreds of applications, hoping an algorithm notices you. It should start with the people who already know you, already trust you, and might be exactly the warm connection that gets your foot in the door somewhere new.",
      "It surfaces who in your existing network — friends, former teammates, old managers — is already connected to a company you want in at, and makes it easy to ask them for the intro that actually gets you the interview.",
    ],
    pillars: [
      { label: "Your Network, Mapped", text: "See who you already know at the companies you're targeting." },
      { label: "Warm Intros", text: "Leads sourced from people who already know your work, not a black-hole application queue." },
      { label: "Easy to Ask", text: "Makes it simple to ask friends and former teammates for the intro, without the awkwardness." },
      { label: "Built From It", text: "Built while living the job search firsthand, not theorized from the outside." },
    ],
    ctas: [
      { href: "https://yourrosterapp.com", label: "Visit Your Roster →", style: "pill-filled" },
      {
        href: "https://docs.google.com/document/d/1QIGYNCbGhlpM0EvIFalWzWlm7UgMSmVt0nnOSznv6K4/edit?usp=sharing",
        label: "Read the Manifesto →",
        style: "pill-outline",
      },
    ],
  },
  {
    id: "war-room",
    logo: "/logos/war-room.svg",
    badge: "Defense Intelligence Platform",
    title: "War Room.",
    tagline: "Know who controls the money.",
    desc: "War Room consolidates DoD program offices, contracting officers, and active solicitations into a single searchable system — connecting organizational hierarchies with key stakeholders and live procurement signals pulled daily from SAM.gov. Business development teams go from scattered spreadsheets to a targeted outreach plan in minutes, not weeks.",
    pillars: [
      { label: "Full Org Map", text: "575+ DoD organizations mapped with complete hierarchy." },
      { label: "Real Contacts", text: "6,700+ stakeholders with contact info and LinkedIn profiles." },
      { label: "Live Signals", text: "8,100+ contract awards and solicitations, synced daily." },
      { label: "Export Ready", text: "One-click CSV export straight into your CRM." },
    ],
    screenshots: [
      {
        src: "/screenshots/war-room/signals.png",
        url: "warroomusa.com/signals",
        label: "Signals",
        desc: "8,300+ live contract signals — awards, solicitations, and budget shifts, synced daily from SAM.gov.",
      },
      {
        src: "/screenshots/war-room/people.png",
        url: "warroomusa.com/people",
        label: "People",
        desc: "7,000+ verified DoD leadership profiles, searchable by focus area and seniority.",
      },
      {
        src: "/screenshots/war-room/organizations.png",
        url: "warroomusa.com/org/nuaxis",
        label: "Organizations",
        desc: "Deep dives on primes and subcontractors — awards, contacts, and featured projects.",
      },
      {
        src: "/screenshots/war-room/org-chart.png",
        url: "warroomusa.com/org/arcyber",
        label: "Org Charts",
        desc: "Full command hierarchy mapped — see exactly who reports to whom.",
      },
    ],
    ctas: [{ href: "https://warroomusa.com", label: "Visit War Room →", style: "pill-filled" }],
  },
  {
    id: "cambo",
    logo: "/logos/cambo.svg",
    badge: "AI Compliance Test Prep",
    title: "Cambo.",
    tagline: "Pass your compliance exams faster.",
    desc: "Cambo is an AI-powered compliance test prep tool built for the certifications that gate access to real work — DoD Cyber Awareness, OPSEC, CUI, HIPAA, and more. It surfaces the concepts you're actually weak on and turns study time into exam-ready confidence, for individuals and teams alike.",
    pillars: [
      { label: "Compliance Coverage", text: "DoD Cyber Awareness, OPSEC, CUI, HIPAA, and more certification tracks." },
      { label: "AI-Guided Prep", text: "Adaptive practice that focuses on what you actually need to review." },
      { label: "Individuals or Teams", text: "Built for solo learners and compliance teams tracking certs at scale." },
      { label: "Faster Pass Rates", text: "Structured prep that cuts study time without cutting corners." },
    ],
    ctas: [{ href: "https://www.camboapp.com", label: "Try Cambo →", style: "pill-filled" }],
  },
  {
    id: "light-lux",
    logo: "/logos/light-lux.svg",
    badge: "B2B Sales Intelligence",
    title: "Light-Lux.",
    tagline: "Turn buying signals into real pipeline.",
    desc: "Light-Lux turns a flat contact list into automated, signal-triggered campaigns — scoring every prospect across contract history, spending trajectory, organizational fit, and engagement recency. It blends federal procurement data with your CRM to hand sales and marketing teams a ranked, ready-to-work pipeline.",
    pillars: [
      { label: "Intent Scoring", text: "Every prospect ranked across four signal dimensions." },
      { label: "Live Feed", text: "Buying signals surfaced the moment they happen." },
      { label: "Dual Market", text: "Built for federal and commercial targeting alike." },
      { label: "Auto Outreach", text: "Signal-triggered sequences, no manual triggers." },
    ],
    ctas: [
      { href: "https://www.light-lux.com", label: "Learn More →", style: "pill-filled" },
      {
        href: "https://savankong.gumroad.com/l/groundwork",
        label: "Buy the Tutorial →",
        style: "pill-outline",
      },
    ],
  },
];

export default function Ventures() {
  return (
    <>
      <Nav active="Ventures" />

      <section className={`${styles.hero} glow-bg`}>
        <div className={styles.container}>
          <h1 className={styles.h1}>Ventures.</h1>
          <p className={styles.intro}>
            These aren&rsquo;t just apps — they&rsquo;re places and
            communities built to solve problems I&rsquo;ve lived myself.{" "}
            <strong>Your Roster</strong> turns your job search into warm
            introductions instead of a black hole of applications.{" "}
            <strong>War Room</strong> maps the Department of Defense so
            business development teams stop guessing. <strong>Cambo</strong>{" "}
            helps people and teams pass required compliance certifications
            faster. <strong>Light-Lux</strong> turns buying signals into a
            real pipeline. Every one of them started as a way to solve my own
            problem first.
          </p>
        </div>
      </section>

      {ventures.map((venture, i) => (
        <section
          key={venture.title}
          id={venture.id}
          className={`section ${i % 2 === 0 ? "black-bg" : "glow-bg"} top-border`}
        >
          <div className={styles.container}>
            <div className={styles.appHero}>
              <div className="eyebrow">
                <span className="eyebrow-rule" />
                <span className="eyebrow-label">{venture.badge}</span>
              </div>
              <div className={styles.titleRow}>
                <span className={styles.logoBadge}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={venture.logo} alt={`${venture.title} logo`} />
                </span>
                <h2 className={styles.appTitle}>{venture.title}</h2>
              </div>
              <p className={styles.appTagline}>{venture.tagline}</p>
              {Array.isArray(venture.desc) ? (
                venture.desc.map((p, idx) => (
                  <p key={idx} className={styles.appDesc}>
                    {p}
                  </p>
                ))
              ) : (
                <p className={styles.appDesc}>{venture.desc}</p>
              )}
              <div className={styles.appCtaRow}>
                {venture.ctas.map((cta) => (
                  <a
                    key={cta.href}
                    href={cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cta.style}
                  >
                    {cta.label}
                  </a>
                ))}
              </div>
            </div>

            <div className={styles.pillarsRow}>
              {venture.pillars.map((pillar, idx) => (
                <div key={pillar.label} className={styles.pillar}>
                  <div className={styles.pillarNum}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className={styles.pillarLabel}>{pillar.label}</div>
                  <p className={styles.pillarText}>{pillar.text}</p>
                </div>
              ))}
            </div>

            {venture.screenshots && (
              <div className={styles.screenshotsRow}>
                {venture.screenshots.map((shot) => (
                  <div key={shot.label}>
                    <div className={styles.browserFrame}>
                      <div className={styles.browserChrome}>
                        <span className={styles.browserDots}>
                          <span className={`${styles.browserDot} ${styles.dotRed}`} />
                          <span className={`${styles.browserDot} ${styles.dotYellow}`} />
                          <span className={`${styles.browserDot} ${styles.dotGreen}`} />
                        </span>
                        <span className={styles.browserUrl}>{shot.url}</span>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={shot.src} alt={`War Room — ${shot.label}`} />
                    </div>
                    <div className={styles.screenshotLabel}>{shot.label}</div>
                    <p className={styles.screenshotDesc}>{shot.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}

      <Footer />
    </>
  );
}
