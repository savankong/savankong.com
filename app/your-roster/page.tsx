import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ShaderCanvas from "@/components/ShaderCanvas";
import RiseWords from "@/components/RiseWords";
import Icon from "@/components/Icon";
import p from "../product.module.css";
import s from "./roster.module.css";

export const metadata: Metadata = {
  title: "Your Roster — Savan Kong",
  description:
    "Your Roster, where Savan Kong is CEO and co-founder, crosses your LinkedIn connections against companies hiring right now and shows exactly who to ask for a warm intro. Then your verified record opens paid expert work.",
};

const SITE = "https://yourrosterapp.com";

const steps = [
  {
    title: "Bring in your history",
    text: "Export your connections from LinkedIn’s own data tool and drop in the file. Add a résumé if you like. The file is read in memory and never kept.",
  },
  {
    title: "We map your way in",
    text: "Every connection’s employer is matched to a company, and every company is checked for a live careers page: Greenhouse, Lever, Ashby or its own.",
  },
  {
    title: "Two scores, one feed",
    text: "Each open role is scored on whether it fits you and whether the person you know there is worth asking. The two combine into one ranked feed.",
  },
  {
    title: "You send the ask",
    text: "Every match comes with an intro request drafted for you. Edit it, copy it and send it yourself. Your Roster never messages anyone for you.",
  },
];

const features = [
  {
    icon: "network",
    title: "Your network, mapped",
    text: "See who you already know at the companies you’re targeting, across every connection you’ve made, not the ten you remember.",
    wide: true,
  },
  {
    icon: "draft",
    title: "Warm intros, drafted",
    text: "A specific, editable request for every match, written so the person can say yes in one reply.",
  },
  {
    icon: "rank",
    title: "Ranked, not listed",
    text: "Relevance and connection strength, scored separately and weighted 60/40, so the best asks rise first.",
  },
  {
    icon: "eye",
    title: "A watchlist that watches",
    text: "Follow 20 to 30 companies. Every six hours we check SEC filings and news for new leaders, funding and expansion, and email you a digest.",
  },
  {
    icon: "path",
    title: "Friend-of-a-friend paths",
    text: "Optional. Reach a company through someone your connection knows, only when that person has opted in to being a path.",
  },
  {
    icon: "briefcase",
    title: "Paid expert work",
    text: "Your verified record puts you in front of AI-lab evaluation, advisory and expert-cell engagements, on the strength of the people who vouch for you.",
    wide: true,
  },
];

const promises = [
  {
    title: "It never sends a message for you.",
    text: "There is no send button anywhere in the product, by design. Drafts are always copied and sent by you.",
  },
  {
    title: "Your file is never stored.",
    text: "The connections CSV is parsed in memory. Only name, company, title and connected-on date are kept, and an email address is never stored.",
  },
  {
    title: "No company where you know nobody.",
    text: "If you have no one inside, we don’t show it. That would just be a list of openings, and those already exist.",
  },
  {
    title: "No claim your file can’t back up.",
    text: "Every relationship we describe comes from what you uploaded. We never invent a “last spoke in May.”",
  },
  {
    title: "Consent is yours to give.",
    text: "Appearing in someone else’s export grants nothing. Being a path, getting messages and more each need a registered person to opt in.",
  },
];

const roles = [
  "Program managers",
  "Contracting & procurement officers",
  "Policy analysts",
  "IT specialists",
  "Congressional staffers",
  "Compliance & regulatory affairs",
  "Federal employees in transition",
  "GovCon contractors",
  "Cleared professionals",
];

const team = [
  { name: "Savan Kong", role: "CEO & Co-Founder", text: "20 years of 0-to-1 product: Redfin, Amazon Kindle, Tebra, Defense Digital Service, and the DoD’s first Customer Experience Officer." },
  { name: "Matt Kelly", role: "Co-Founder, Growth", text: "Leads growth at Your Roster." },
  { name: "Dave Spellman", role: "Co-Founder, COO", text: "20+ years scaling service delivery at Extensiv and Accruent." },
  { name: "Christan Johnson", role: "Co-Founder, Experience & Community", text: "20+ years of executive recruiting." },
];

const advisors = [
  "Morgan Audino · Head of Strategic Projects, Handshake AI",
  "Jason Pickart · Office of the DoD CIO; President, NCMA Dayton",
  "Philip Reiman · former Lead Attorney, DoD CDAO; former General Counsel, DDS",
];

const faqs = [
  {
    q: "Will you contact my connections?",
    a: "Never. There is no way for the product to send a message. You copy the draft and send it from your own account.",
  },
  {
    q: "What happens to my LinkedIn file?",
    a: "It’s read in memory and thrown away. We keep only what matching needs: each connection’s name, company, title and the date you connected.",
  },
  {
    q: "Is it open to everyone?",
    a: "Access is opening in waves. Request access with your email and we’ll let you in as seats open.",
  },
  {
    q: "How does paid expert work happen?",
    a: "Organizations such as AI labs, federal integrators and program offices book a verified expert cell. We match people whose record and references fit, run the engagement and pay the expert.",
  },
  {
    q: "I’m a current federal employee. Can I take part?",
    a: "Yes, within your agency’s rules. Unpaid work needs nothing on file. Paid work needs your agency ethics office’s written approval recorded with us first.",
  },
];

const feed = [
  { co: "A company you’re watching", role: "Senior Program Manager", who: "Former teammate, 6 yrs", fit: 92, tie: 88 },
  { co: "A hiring agency partner", role: "Director, Customer Experience", who: "Your old manager", fit: 86, tie: 95 },
  { co: "A systems integrator", role: "Capture Lead", who: "Friend of a friend · opted in", fit: 81, tie: 64 },
];

export default function YourRoster() {
  return (
    <div className={p.page} style={{ "--accent": "#8fb0ff", "--accent-2": "#ffcbbd" } as React.CSSProperties}>
      <Nav active="Your Roster" overlay />

      <section className={p.hero}>
        <ShaderCanvas shader="network" />
        <div className={p.heroShade} />
        <div className={p.heroInner}>
          <div className={p.crumb} data-reveal>
            <span className={p.crumbTag}>Your Roster</span> I&rsquo;m CEO &amp; Co-Founder
          </div>
          <h1 className={p.h1}>
            <RiseWords text="Your next role arrives with" />{" "}
            <RiseWords text="someone who can vouch for you." start={5} className={p.accentWord} />
          </h1>
          <p className={p.lede} data-reveal style={{ "--d": 4 } as React.CSSProperties}>
            Your Roster crosses your LinkedIn connections against the
            companies hiring right now and shows you exactly who to ask for a
            warm intro, instead of applying cold into a pile of hundreds.
          </p>
          <div className={p.ctaRow} data-reveal style={{ "--d": 5 } as React.CSSProperties}>
            <a href={`${SITE}/waitlist`} target="_blank" rel="noopener noreferrer" className={`pill-filled ${p.accentBtn}`}>
              Request access →
            </a>
            <a href={`${SITE}/organizations`} target="_blank" rel="noopener noreferrer" className="pill-outline">
              I&rsquo;m hiring experts
            </a>
          </div>
          <p className={p.micro} data-reveal style={{ "--d": 6 } as React.CSSProperties}>
            Import takes about two minutes. We never message your contacts for you.
          </p>
        </div>
      </section>

      <section className={p.section}>
        <div className={p.wrap}>
          <p className={p.statement} data-reveal>
            <span className={p.dim}>The old way sent your application into a queue.</span>{" "}
            Now it arrives with <em>someone who can vouch for it.</em>
          </p>
        </div>
      </section>

      <section className={p.section}>
        <div className={`${p.wrap} ${p.split}`}>
          <div data-reveal>
            <div className={p.kicker}>The problem</div>
            <h2 className={p.h2}>You have more leverage than you can see.</h2>
            <p className={p.body}>
              Everyone tells you to network after a layoff. Nobody tells you
              how. Matching every company with open roles against 500+ people
              you already know is a job no one does by hand.
            </p>
            <p className={p.body}>
              When I lost my job, the offers that came through didn&rsquo;t
              come from applications. They came from a teammate from three jobs
              ago and a manager who remembered my work. Your Roster does that
              cross-reference for you.
            </p>
          </div>
          <div className={s.feed} data-reveal="scale" data-tilt>
            <div className={s.feedHead}>
              <span className={s.feedDot} />
              Your ranked feed
              <span className={s.feedCount}>Live</span>
            </div>
            {feed.map((f, i) => (
              <div key={f.role} className={s.feedRow} style={{ "--i": i } as React.CSSProperties}>
                <div className={s.feedAvatar}>{f.role[0]}</div>
                <div className={s.feedMain}>
                  <div className={s.feedRole}>{f.role}</div>
                  <div className={s.feedCo}>{f.co}</div>
                  <div className={s.feedWho}>
                    <Icon name="people" /> {f.who}
                  </div>
                  <div className={s.bars}>
                    <span>Fit</span>
                    <i style={{ "--w": `${f.fit}%` } as React.CSSProperties} />
                    <span>Tie</span>
                    <i className={s.tie} style={{ "--w": `${f.tie}%` } as React.CSSProperties} />
                  </div>
                </div>
                <div className={s.feedAsk}>Draft intro</div>
              </div>
            ))}
            <div className={s.draft}>
              <div className={s.draftLabel}>Draft · you send it</div>
              <p className={s.typing}>
                Hi, it&rsquo;s been a while since we shipped that launch together. I saw
                your team is hiring a Senior Program Manager and I&rsquo;d love an intro…
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={p.section}>
        <div className={p.wrap}>
          <div className={p.kicker} data-reveal>How it works</div>
          <h2 className={p.h2} data-reveal>Four steps from file to first intro.</h2>
          <ol className={p.steps}>
            {steps.map((st, i) => (
              <li key={st.title} className={p.step} data-reveal style={{ "--d": i } as React.CSSProperties}>
                <div className={p.stepTitle}>{st.title}</div>
                <p className={p.stepText}>{st.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={p.section}>
        <div className={p.wrap}>
          <div className={p.kicker} data-reveal>What you get</div>
          <h2 className={p.h2} data-reveal>A professional network that works for you, not a list of openings.</h2>
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

      <section className={p.section}>
        <div className={p.wrap}>
          <div className={p.kicker} data-reveal>What it refuses to do</div>
          <h2 className={p.h2} data-reveal>Promises kept by what the product can&rsquo;t do.</h2>
          <p className={p.body} data-reveal>
            Each of these is enforced by a capability that doesn&rsquo;t exist,
            not by a policy someone could change.
          </p>
          <ol className={p.promises}>
            {promises.map((pr, i) => (
              <li key={pr.title} className={p.promise} data-reveal="left" style={{ "--d": i } as React.CSSProperties}>
                <span className={p.promiseNo}>{String(i + 1).padStart(2, "0")}</span>
                <span className={p.promiseTitle}>{pr.title}</span>
                <span className={p.promiseText}>{pr.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={p.section}>
        <div className={`${p.wrap} ${p.split}`}>
          <div data-reveal>
            <div className={p.kicker}>For experts</div>
            <h2 className={p.h2}>Built for people with a real record.</h2>
            <p className={p.body}>
              Mid-career public-sector and regulated-domain professionals, with
              dense agency networks and work that speaks for itself. Your
              record and the people who&rsquo;ve worked beside you open two
              doors: your next job, and paid expert work.
            </p>
            <div className={p.chips}>
              {roles.map((r) => (
                <span key={r} className={p.chip}>
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className={s.orgCard} data-reveal="scale" data-tilt>
            <div className={p.kicker}>For organizations</div>
            <div className={s.orgTitle}>Verified expert cells.</div>
            <p className={p.body}>
              AI labs, federal integrators and program offices book five to
              twenty professionals with relationship-backed provenance,
              conflict screening and a domain rubric. Sold as a cell, never as
              headcount.
            </p>
            <p className={s.orgQuote}>
              Every network can say &ldquo;passed our assessment.&rdquo; Only one can
              say &ldquo;vouched for by the people who worked with them.&rdquo;
            </p>
            <a href={`${SITE}/organizations`} target="_blank" rel="noopener noreferrer" className="pill-outline">
              Request an introduction →
            </a>
          </div>
        </div>
      </section>

      <section className={p.section}>
        <div className={p.wrap}>
          <div className={p.kicker} data-reveal>The team</div>
          <h2 className={p.h2} data-reveal>Four co-founders who&rsquo;ve hired, been hired and been let go.</h2>
          <div className={p.people}>
            {team.map((t, i) => (
              <div key={t.name} className={p.person} data-reveal data-tilt style={{ "--d": i } as React.CSSProperties}>
                <div className={p.personMark}>{t.name[0]}</div>
                <div className={p.personName}>{t.name}</div>
                <div className={p.personRole}>{t.role}</div>
                <p className={p.personText}>{t.text}</p>
              </div>
            ))}
          </div>
          <div className={p.chips} data-reveal>
            {advisors.map((a) => (
              <span key={a} className={p.chip}>
                Advisor · {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className={p.section}>
        <div className={p.wrap}>
          <figure className={p.note} data-reveal="scale">
            <blockquote className={p.noteQuote}>
              &ldquo;The network I already had, sitting right there the whole
              time, was more powerful than any listing I scrolled through at
              2am. So I started building something.&rdquo;
            </blockquote>
            <figcaption className={p.noteBy}>
              <Image src="/savan-cutout.png" alt="" width={52} height={52} />
              <span>
                <strong>Savan Kong</strong>
                CEO &amp; Co-Founder, Your Roster
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className={p.section}>
        <div className={p.wrap}>
          <div className={p.kicker} data-reveal>Questions</div>
          <h2 className={p.h2} data-reveal>Before you sign up.</h2>
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
        <ShaderCanvas shader="network" speed={0.7} maxDpr={1} />
        <div className={p.closingShade} />
        <div className={p.closingInner} data-reveal>
          <h2 className={p.h2}>Find out who&rsquo;s already in your corner.</h2>
          <p className={p.lede}>Request access, bring in your connections, and see who can get you in.</p>
          <div className={p.ctaRow}>
            <a href={`${SITE}/waitlist`} target="_blank" rel="noopener noreferrer" className={`pill-filled ${p.accentBtn}`}>
              Request access →
            </a>
            <a href={SITE} target="_blank" rel="noopener noreferrer" className="pill-outline">
              Visit yourrosterapp.com
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
