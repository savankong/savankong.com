import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import styles from "./apps.module.css";

export const metadata: Metadata = {
  title: "Apps — Savan Kong",
  description:
    "War Room and Light-Lux — defense intelligence and B2B sales tools built by Savan Kong.",
};

const apps = [
  {
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
    href: "https://warroomusa.com",
    cta: "Visit War Room →",
  },
  {
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
    href: "https://light-lux.com",
    cta: "Visit Light-Lux →",
  },
];

export default function Apps() {
  return (
    <>
      <Nav active="Apps" />

      <section className={`${styles.hero} glow-bg`}>
        <div className={styles.container}>
          <h1 className={styles.h1}>Apps.</h1>
          <p className={styles.intro}>
            Tools born out of the same problem the podcast talks about — too
            much noise, not enough signal. <strong>War Room</strong> maps the
            Department of Defense so business development teams stop
            guessing. <strong>Light-Lux</strong> turns buying signals into a
            real pipeline. Both started as ways to solve my own problem
            first.
          </p>
        </div>
      </section>

      {apps.map((app, i) => (
        <section
          key={app.title}
          className={`section ${i % 2 === 0 ? "black-bg" : "glow-bg"} top-border`}
        >
          <div className={styles.container}>
            <div className={styles.appHero}>
              <div className="eyebrow">
                <span className="eyebrow-rule" />
                <span className="eyebrow-label">{app.badge}</span>
              </div>
              <div className={styles.titleRow}>
                <span className={styles.logoBadge}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={app.logo} alt={`${app.title} logo`} />
                </span>
                <h2 className={styles.appTitle}>{app.title}</h2>
              </div>
              <p className={styles.appTagline}>{app.tagline}</p>
              <p className={styles.appDesc}>{app.desc}</p>
              <div className={styles.appCtaRow}>
                <a
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-filled"
                >
                  {app.cta}
                </a>
              </div>
            </div>

            <div className={styles.pillarsRow}>
              {app.pillars.map((pillar, idx) => (
                <div key={pillar.label} className={styles.pillar}>
                  <div className={styles.pillarNum}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className={styles.pillarLabel}>{pillar.label}</div>
                  <p className={styles.pillarText}>{pillar.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <Footer />
    </>
  );
}
