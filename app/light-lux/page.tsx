import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ShaderCanvas from "@/components/ShaderCanvas";
import RiseWords from "@/components/RiseWords";
import Icon from "@/components/Icon";
import p from "../product.module.css";
import s from "./lux.module.css";

export const metadata: Metadata = {
  title: "Light-Lux — Savan Kong",
  description:
    "Light-Lux, created by Savan Kong, takes meeting notes with no bot in the call: live transcript, minutes with decisions and action items, briefs before your next meeting, and answers across every meeting. Audio is never kept.",
};

const APP = "https://www.light-lux.com";

const flow = [
  {
    when: "Before",
    title: "A brief that knows the goal",
    text: "About 20 minutes before a meeting with other people, Light-Lux reads the invite, your earlier meetings and the web, and writes what the meeting is for, who’s coming and what’s still open.",
  },
  {
    when: "During",
    title: "Capture with no bot",
    text: "One click records your microphone and the call’s sound on your own device. A live transcript follows along, with each voice in its own colour.",
  },
  {
    when: "After",
    title: "Minutes you can send",
    text: "Decisions first, then action items, with your own words highlighted and every point cited to the moment it was said. Check them, then press Send.",
  },
];

const features = [
  { icon: "mic", title: "No bot in your call", text: "Nothing joins your meeting. Light-Lux listens on your device to you and to the call, in a browser tab or in the room.", wide: true },
  { icon: "list", title: "Decisions and actions up top", text: "Minutes open with what was decided and who owes what. Ticked actions flow into one Action Register." },
  { icon: "template", title: "85 templates", text: "One-on-ones, sales calls, candidate interviews, team syncs, and 37 built for government. Or let it pick for you." },
  { icon: "ask", title: "Ask across every meeting", text: "“What did we promise Northwind?” Answers cite the meeting, and the minute when there’s a recording, kept as threads you can pick up later." },
  { icon: "calendar", title: "Calendars and briefs", text: "Google, Outlook and calendar links. Coming Up shows today’s meetings with one button each: Join, Record or Brief." },
  { icon: "send", title: "Send minutes, not attachments", text: "Each attendee gets the minutes by email with their own link, where they can tick off their own actions. No account needed." },
  { icon: "people", title: "A directory that fills itself", text: "People, organizations and terms from your meetings, named and filled in from briefs and minutes, shared with your team.", wide: true },
];

const platforms = [
  {
    icon: "globe",
    name: "Web",
    live: true,
    status: "Available now",
    text: "Everything, in Chrome, Edge, Safari or Firefox. Record calls in a browser tab or meetings in the room.",
    cta: { label: "Open Light-Lux", href: APP },
  },
  {
    icon: "phone",
    name: "Phone",
    live: true,
    status: "Available now",
    text: "Add Light-Lux to your home screen from your phone’s browser. On iPhone: Share, then Add to Home Screen.",
    cta: { label: "Open on your phone", href: APP },
  },
  {
    icon: "laptop",
    name: "Mac app",
    live: false,
    status: "Coming soon",
    text: "A native Mac app, built in Swift for speed: record from any app with one shortcut, Call Detected, and Hover over any window.",
  },
  {
    icon: "phone",
    name: "iPhone app",
    live: false,
    status: "Coming soon",
    text: "Native, with one round red Record button, a Live Activity on the Lock Screen, and import for calls recorded on your iPhone.",
  },
  {
    icon: "puzzle",
    name: "Chrome extension",
    live: false,
    status: "In review",
    text: "Asks to take notes when a Meet, Zoom or Teams call starts in a tab, and opens Hover over any site.",
  },
  {
    icon: "shield",
    name: "Government",
    live: true,
    status: "Free today",
    text: "Free with a .gov, .mil, state or local government address, no invite needed. 37 government templates and sharing kept to your own team.",
    cta: { label: "Sign in with your agency email", href: APP },
  },
];

const faqs = [
  {
    q: "Does Light-Lux keep my audio?",
    a: "Never. Audio goes to the speech provider to be transcribed and is then dropped. There is no audio file, no audio table and no audio in exports. Light-Lux keeps the transcript and the minutes.",
  },
  {
    q: "Does a bot join my meeting?",
    a: "No. Light-Lux records on your own device: your microphone, and the sound of the call in the tab or app you share. Nobody sees a bot in the attendee list.",
  },
  {
    q: "How do I sign up?",
    a: "Go to light-lux.com and continue with Google, Microsoft or an email code. Your first recording is one click after that.",
  },
  {
    q: "Who can see my notes?",
    a: "Only you, until you share them with your team or send the minutes. Teammates can read what you share; they can never edit your meeting.",
  },
  {
    q: "Can I use it for government work?",
    a: "Yes, for work without sensitive information. Government addresses get Light-Lux free with templates built for source selection, ATO reviews, congressional briefs and more. Keep classified information and CUI out.",
  },
];

const minutesLines = [
  { k: "h", t: "Decisions" },
  { k: "d", t: "Ship the pilot to two program offices in November." },
  { k: "d", t: "Keep audio off the server, always." },
  { k: "h", t: "Action items" },
  { k: "a", t: "Dana: send the pilot plan by Friday" },
  { k: "a", t: "Jo: book the security review" },
  { k: "a", t: "Me: draft the onboarding email", mine: true },
];

export default function LightLux() {
  return (
    <div className={p.page} style={{ "--accent": "#7bafd4", "--accent-2": "#f2c46d" } as React.CSSProperties}>
      <Nav active="Light-Lux" overlay />

      <section className={p.hero}>
        <ShaderCanvas shader="lightshafts" />
        <div className={p.heroShade} />
        <div className={p.heroInner}>
          <div className={p.crumb} data-reveal>
            <span className={p.crumbTag}>Light-Lux</span> I created it
          </div>
          <h1 className={p.h1}>
            <RiseWords text="Meetings, notes, conversations." />{" "}
            <RiseWords text="Illuminated." start={3} className="lit" />
          </h1>
          <p className={p.lede} data-reveal style={{ "--d": 4 } as React.CSSProperties}>
            Light-Lux takes your meeting notes with no bot in the call. It
            transcribes as you talk, writes the minutes with decisions and
            action items, briefs you before the next one, and answers anything
            across every meeting you&rsquo;ve had.
          </p>
          <div className={p.ctaRow} data-reveal style={{ "--d": 5 } as React.CSSProperties}>
            <a href={APP} target="_blank" rel="noopener noreferrer" className={`pill-filled ${p.accentBtn}`}>
              Start free →
            </a>
            <a href="#download" className="pill-outline">
              Download &amp; devices
            </a>
          </div>
          <p className={p.micro} data-reveal style={{ "--d": 6 } as React.CSSProperties}>
            Sign up with Google, Microsoft or an email code. Audio is never kept.
          </p>
        </div>
      </section>

      <section className={p.section}>
        <div className={`${p.wrap} ${p.split}`}>
          <div data-reveal>
            <div className={p.kicker}>One click to record</div>
            <h2 className={p.h2}>Be in the meeting. Light-Lux takes the minutes.</h2>
            <p className={p.body}>
              Light-Lux sits in the background and comes forward when you need
              it. From signing in, recording a meeting takes one click. When
              the call ends, the minutes write themselves.
            </p>
            <p className={p.body}>
              Light-Lux is made by Your Roster, Inc. I designed it and lead
              its build, for our own team first.
            </p>
          </div>
          <div className={s.doc} data-reveal="scale" data-tilt>
            <div className={s.docTop}>
              <span className={s.rec}>
                <span /> Recording
              </span>
              <span className={s.clock}>12:48</span>
              <span className={s.wave} aria-hidden="true">
                {Array.from({ length: 22 }).map((_, i) => (
                  <i key={i} style={{ "--i": i } as React.CSSProperties} />
                ))}
              </span>
            </div>
            <div className={s.docTitle}>Pilot Planning with Northwind</div>
            <div className={s.docMeta}>Today · 32 min · With Dana and Jo</div>
            <div className={s.lines}>
              {minutesLines.map((l, i) =>
                l.k === "h" ? (
                  <div key={i} className={s.lineHead} style={{ "--i": i } as React.CSSProperties}>
                    {l.t}
                  </div>
                ) : l.k === "d" ? (
                  <div key={i} className={s.lineDecision} style={{ "--i": i } as React.CSSProperties}>
                    {l.t} <span className={s.cite}>[04:12]</span>
                  </div>
                ) : (
                  <div key={i} className={s.lineAction} style={{ "--i": i } as React.CSSProperties}>
                    <span className={s.box} />
                    <span className={l.mine ? s.mine : undefined}>{l.t}</span>
                  </div>
                ),
              )}
            </div>
            <div className={s.transcript}>
              <div className={s.tLine}>
                <b className={s.v0}>You</b> So November for both offices?
              </div>
              <div className={s.tLine}>
                <b className={s.v1}>Dana</b> November works. I&rsquo;ll send the plan Friday.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={p.section}>
        <div className={p.wrap}>
          <div className={p.kicker} data-reveal>Before, during, after</div>
          <h2 className={p.h2} data-reveal>The whole meeting, start to finish.</h2>
          <div className={s.flow}>
            {flow.map((f, i) => (
              <div key={f.when} className={s.flowStep} data-reveal style={{ "--d": i * 2 } as React.CSSProperties}>
                <div className={s.flowWhen}>
                  <span className={s.flowDot} />
                  {f.when}
                </div>
                <div className={p.stepTitle}>{f.title}</div>
                <p className={p.stepText}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={p.section}>
        <div className={p.wrap}>
          <div className={p.kicker} data-reveal>Everything in it</div>
          <h2 className={p.h2} data-reveal>Capture during the call. Wrap up after. Find it later.</h2>
          <div className={p.features}>
            {features.map((f, i) => (
              <div key={f.title} className={`${p.feature} ${f.wide ? p.featureWide : ""}`} data-tilt data-reveal style={{ "--d": i % 3 } as React.CSSProperties}>
                <div className={p.featureIcon}>
                  <Icon name={f.icon} />
                </div>
                <div className={p.featureTitle}>{f.title}</div>
                <p className={p.featureText}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${p.section} ${s.privacy}`}>
        <div className={s.privacyGlow} aria-hidden="true">
          <ShaderCanvas shader="lightshafts" speed={0.4} maxDpr={1} />
        </div>
        <div className={`${p.wrap} ${s.privacyInner}`}>
          <div className={p.featureIcon} data-reveal>
            <Icon name="lock" />
          </div>
          <p className={p.statement} data-reveal>
            Light-Lux <em>never keeps your audio.</em>{" "}
            <span className={p.dim}>It goes to the speech provider, becomes words, and is dropped.</span>
          </p>
          <div className={p.chips} data-reveal>
            <span className={p.chip}>No audio files</span>
            <span className={p.chip}>Your notes are yours until you share</span>
            <span className={p.chip}>Teammates can never edit your meeting</span>
            <span className={p.chip}>Delete a note, its transcript goes too</span>
          </div>
        </div>
      </section>

      <section id="download" className={p.section}>
        <div className={p.wrap}>
          <div className={p.kicker} data-reveal>Download &amp; devices</div>
          <h2 className={p.h2} data-reveal>Start in your browser today.</h2>
          <p className={p.body} data-reveal>
            The web app has everything and works on your phone too. Native
            apps for the Mac and iPhone are on the way.
          </p>
          <div className={p.platforms}>
            {platforms.map((pl, i) => (
              <div key={pl.name} className={`${p.platform} ${pl.live ? p.platformLive : ""}`} data-reveal data-tilt style={{ "--d": i % 3 } as React.CSSProperties}>
                <div className={p.platformIcon}>
                  <Icon name={pl.icon} />
                </div>
                <span className={`${p.status} ${pl.live ? p.statusLive : ""}`}>{pl.status}</span>
                <div className={p.platformName}>{pl.name}</div>
                <p className={p.platformText}>{pl.text}</p>
                {pl.cta ? (
                  <a href={pl.cta.href} target="_blank" rel="noopener noreferrer" className={`pill-filled ${p.accentBtn}`}>
                    {pl.cta.label} →
                  </a>
                ) : (
                  <span className="pill-disabled">{pl.status}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={p.section}>
        <div className={p.wrap}>
          <figure className={p.note} data-reveal="scale">
            <blockquote className={p.noteQuote}>
              &ldquo;Light-Lux is built on two rules. It sits in the
              background until you need it, and capturing a meeting is never
              more than one or two clicks away.&rdquo;
            </blockquote>
            <figcaption className={p.noteBy}>
              <Image src="/savan-cutout.png" alt="" width={52} height={52} />
              <span>
                <strong>Savan Kong</strong>
                Creator of Light-Lux
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className={p.section}>
        <div className={p.wrap}>
          <div className={p.kicker} data-reveal>Questions</div>
          <h2 className={p.h2} data-reveal>Good to know.</h2>
          <div className={p.faq} data-reveal>
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={p.closing}>
        <ShaderCanvas shader="lightshafts" speed={0.8} maxDpr={1} />
        <div className={p.closingShade} />
        <div className={p.closingInner} data-reveal>
          <h2 className={p.h2}>Your next meeting, already written up.</h2>
          <p className={p.lede}>Sign up free, press Record, and get your minutes when the call ends.</p>
          <div className={p.ctaRow}>
            <a href={APP} target="_blank" rel="noopener noreferrer" className={`pill-filled ${p.accentBtn}`}>
              Start free at light-lux.com →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
