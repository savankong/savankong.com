import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ShaderCanvas from "@/components/ShaderCanvas";
import p from "../product.module.css";

export const metadata: Metadata = {
  title: "Light-Lux — Savan Kong",
  description:
    "Light-Lux, created by Savan Kong, takes meeting notes with no bot in the call: a live transcript, minutes that open with decisions and action items, briefs before the next meeting, and answers across every meeting. Audio is never kept.",
};

const APP = "https://www.light-lux.com";

const flow = [
  {
    when: "Before",
    title: "A brief that knows the goal",
    text: "About 20 minutes before a meeting with other people, it reads the invite, your earlier meetings and the web, and writes what the meeting is for and what’s still open.",
  },
  {
    when: "During",
    title: "One click, no bot",
    text: "Records your microphone and the call’s sound on your own device, with a live transcript and each voice in its own colour.",
  },
  {
    when: "After",
    title: "Minutes you can send",
    text: "Decisions first, then who owes what, each point linked to the moment it was said. Check them, press Send.",
  },
];

const features = [
  { title: "Minutes that lead with decisions", text: "Decisions and action items up top. Ticked actions flow into one Action Register, and a Monday email lists what you owe." },
  { title: "85 templates", text: "One-on-ones, sales calls, interviews, team syncs, and 37 for government work. Or let it pick." },
  { title: "Ask across every meeting", text: "“What did we promise Northwind?” Answers cite the meeting, and the minute when there’s a recording, kept as threads." },
  { title: "Calendars", text: "Google, Outlook and calendar links. Today’s meetings with one button each: Join, Record or Brief." },
  { title: "Send with a link each", text: "Every attendee gets the minutes by email with their own link, where they tick off their own actions. No account needed." },
];

const devices = [
  { name: "Web", text: "Chrome, Edge, Safari or Firefox. Calls in a browser tab or meetings in the room.", action: { label: "Open Light-Lux", primary: true } },
  { name: "Phone", text: "Add it to your home screen from your phone’s browser.", action: { label: "Open on your phone" } },
  { name: "Mac app", text: "Native, built in Swift. Record from any app with one shortcut.", soon: "Coming soon" },
  { name: "iPhone app", text: "One Record button, and import for calls recorded on your iPhone.", soon: "Coming soon" },
  { name: "Chrome extension", text: "Offers to take notes when a Meet, Zoom or Teams call starts in a tab.", soon: "In review" },
  { name: "Government", text: "Free with a .gov, .mil, state or local address. Sharing stays inside your team.", action: { label: "Use your agency email" } },
];

export default function LightLux() {
  return (
    <div className={p.page} style={{ "--accent": "var(--lux)" } as React.CSSProperties}>
      <Nav active="Light-Lux" cta={{ label: "Start free", href: APP }} />

      <section className={p.hero}>
        <ShaderCanvas shader="voices" />
        <div className={p.heroScrim} />
        <div className={`wrap stack ${p.heroInner} ${p.split}`} style={{ alignItems: "center", gap: 56 }}>
          <div>
            <p className={`kicker ${p.byline}`} data-reveal>
              Light-Lux · created by Savan Kong
            </p>
            <h1 className={`display ${p.h1}`} style={{ fontSize: "clamp(54px, 7vw, 104px)", "--d": 1 } as React.CSSProperties} data-reveal>
              Be in the meeting. It takes the minutes.
            </h1>
            <p className={`lede ${p.heroLede}`} data-reveal style={{ "--d": 2 } as React.CSSProperties}>
              Light-Lux takes your meeting notes with no bot in the call. It
              transcribes as you talk, writes minutes that open with decisions
              and action items, briefs you before the next meeting, and answers
              questions across every meeting you&rsquo;ve had.
            </p>
            <div className="btn-row" data-reveal style={{ "--d": 3 } as React.CSSProperties}>
              <a href={APP} target="_blank" rel="noopener noreferrer" className={`btn ${p.accentBtn}`}>
                Start free
              </a>
              <a href="#download" className="pill-outline">
                Devices and downloads
              </a>
            </div>
            <p className={p.note} data-reveal style={{ "--d": 4 } as React.CSSProperties}>
              Sign up with Google, Microsoft or an email code.
            </p>
          </div>
          <div className={p.minutes} data-reveal style={{ "--d": 2 } as React.CSSProperties}>
            <div className={p.minutesTop}>
              <span className={p.rec}>
                <span className={p.recDot} />
                Recording
              </span>
              <span className={p.clock}>12:48</span>
              <span className={p.mini} aria-hidden="true">
                {Array.from({ length: 22 }).map((_, i) => (
                  <i key={i} style={{ "--i": i } as React.CSSProperties} />
                ))}
              </span>
            </div>
            <div className={p.mTitle}>Pilot Planning with Northwind</div>
            <div className={p.mMeta}>Today · 32 min · With Dana and Jo</div>
            <div className={p.mHead}>Decisions</div>
            <div className={p.mLine} style={{ "--i": 0 } as React.CSSProperties}>
              Ship the pilot to two program offices in November. <span className={p.cite}>04:12</span>
            </div>
            <div className={p.mHead}>Action items</div>
            <div className={p.mLine} style={{ "--i": 1 } as React.CSSProperties}>
              &#9745; Dana: send the pilot plan by Friday
            </div>
            <div className={p.mLine} style={{ "--i": 2 } as React.CSSProperties}>
              &#9744; Jo: book the security review
            </div>
            <div className={p.mLine} style={{ "--i": 3 } as React.CSSProperties}>
              <span className={p.mine}>&#9744; Me: draft the onboarding email</span>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <h2 className="h2" style={{ marginBottom: 56 }} data-reveal>
            Before, during and after.
          </h2>
          <div className="cols stack" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            {flow.map((f, i) => (
              <div key={f.when} data-reveal style={{ "--d": i } as React.CSSProperties}>
                <div style={{ color: "var(--lux)", fontSize: 15, marginBottom: 14 }}>{f.when}</div>
                <div className={p.colTitle} style={{ fontSize: 30 }}>{f.title}</div>
                <div className={p.colText} style={{ fontSize: 17 }}>{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band band-tint">
        <div className="wrap">
          <h2 className="h2" style={{ marginBottom: 48 }} data-reveal>
            What&rsquo;s in it.
          </h2>
          <div className="rows">
            {features.map((f, i) => (
              <div key={f.title} className={`row stack ${p.twoCol}`} data-reveal style={{ "--d": i } as React.CSSProperties}>
                <span className="row-title">{f.title}</span>
                <span className="row-text">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <p className="statement" data-reveal>
            Light-Lux never keeps your audio.{" "}
            <span className="quiet">
              It goes to the speech provider, becomes words, and is dropped. Your
              notes stay yours until you share them.
            </span>
          </p>
        </div>
      </section>

      <section className="band" id="download">
        <div className="wrap">
          <h2 className="h2" style={{ marginBottom: 16 }} data-reveal>
            Devices and downloads.
          </h2>
          <p className="row-text" style={{ marginBottom: 48, maxWidth: 560 }} data-reveal>
            The web app has everything and works on your phone. Native apps are
            on the way.
          </p>
          <div className="rows">
            {devices.map((d, i) => (
              <div key={d.name} className={`row stack ${p.deviceRow}`} data-reveal style={{ "--d": i } as React.CSSProperties}>
                <span className="row-title">{d.name}</span>
                <span className="row-text">{d.text}</span>
                {d.action ? (
                  <a
                    href={APP}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={d.action.primary ? `btn ${p.accentBtn}` : "pill-outline"}
                    style={{ height: 48 }}
                  >
                    {d.action.label}
                  </a>
                ) : (
                  <span className={p.soon}>{d.soon}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={p.closing}>
        <div className="wrap">
          <h2 className={`display ${p.closingH2}`} data-reveal>
            Your next meeting, already written up.
          </h2>
          <a href={APP} target="_blank" rel="noopener noreferrer" className={`btn ${p.accentBtn}`} data-reveal style={{ "--d": 1 } as React.CSSProperties}>
            Start free at light-lux.com
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
