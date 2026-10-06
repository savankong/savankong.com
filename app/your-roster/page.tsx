import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ShaderCanvas from "@/components/ShaderCanvas";
import p from "../product.module.css";
import s from "./roster.module.css";

export const metadata: Metadata = {
  title: "Your Roster — Savan Kong",
  description:
    "Your Roster, where Savan Kong is CEO and co-founder, is building the largest network of government experts to give AI models the human feedback that makes them work for government.",
};

const SITE = "https://yourrosterapp.com";
const JOIN = `${SITE}/experts`;
const BUYERS = `${SITE}/organizations`;

const work = [
  {
    title: "Write the questions",
    text: "Real tasks from your field, the kind a model will be asked on the job: a contract clause, a program decision, a policy memo.",
  },
  {
    title: "Judge the answers",
    text: "Grade what models produce against a rubric written for your domain. Where you are unsure, say so: unknown is a valid answer.",
  },
  {
    title: "Explain why",
    text: "The reasoning behind a judgment is what teaches a model. You talk it through; Your Roster records how you got there.",
  },
];

const roles = [
  "Program managers",
  "Contracting and procurement officers",
  "Policy analysts",
  "IT specialists",
  "Congressional staffers",
  "Compliance and regulatory affairs",
];

const steps = [
  { title: "Join", text: "Tell us your field, your agencies and the work you’ve done." },
  { title: "Get verified", text: "Employment and credentials checked, and colleagues who worked beside you vouch for it." },
  { title: "Get matched", text: "We invite you to engagements that fit your domain, after a conflict check." },
  { title: "Do the work", text: "Write, judge and explain, remotely, on your schedule. Paid where your rules allow." },
];

const team = [
  { name: "Savan Kong", role: "CEO & Co-Founder", text: "DoD’s first Customer Experience Officer; Defense Digital Service; Redfin, Amazon Kindle." },
  { name: "Matt Kelly", role: "Co-Founder, Growth", text: "" },
  { name: "Dave Spellman", role: "Co-Founder, COO", text: "20+ years scaling service delivery at Extensiv and Accruent." },
  { name: "Christan Johnson", role: "Co-Founder, Experience & Community", text: "20+ years of executive recruiting." },
];

const advisors = [
  { name: "Morgan Audino", text: "Head of Strategic Projects, Handshake AI" },
  { name: "Jason Pickart", text: "Office of the DoD CIO; President, NCMA Dayton" },
  { name: "Philip Reiman", text: "Former Lead Attorney, DoD CDAO; former General Counsel, Defense Digital Service" },
];

const faqs = [
  { q: "Do I need AI experience?", a: "No. You need experience in your field. We show you how the work is done." },
  {
    q: "I’m a current federal employee. Can I join?",
    a: "Yes. Unpaid work needs nothing on file. For paid work, record your agency ethics office’s written approval with us first.",
  },
  { q: "Will I work with sensitive information?", a: "No. Nothing classified, no CUI. The work draws on your judgment, not your access." },
];

export default function YourRoster() {
  return (
    <div className={p.page} style={{ "--accent": "var(--roster)" } as React.CSSProperties}>
      <Nav active="Your Roster" cta={{ label: "Join as an expert", href: JOIN }} />

      <section className={p.hero}>
        <ShaderCanvas shader="experts" />
        <div className={p.heroScrim} />
        <div className={`wrap ${p.heroInner}`}>
          <p className={`kicker ${p.byline}`} data-reveal>
            Your Roster · Savan Kong, CEO &amp; Co-Founder
          </p>
          <h1 className={`display ${p.h1}`} data-reveal style={{ "--d": 1 } as React.CSSProperties}>
            Government experts, making AI work for government.
          </h1>
          <p className={`lede ${p.heroLede}`} data-reveal style={{ "--d": 2 } as React.CSSProperties}>
            Your Roster is building the largest network of government experts
            to give AI models the human feedback they need. People who have run
            the programs, written the contracts and briefed the Hill judge what
            models get right, what they get wrong, and why.
          </p>
          <div className="btn-row" data-reveal style={{ "--d": 3 } as React.CSSProperties}>
            <a href={JOIN} target="_blank" rel="noopener noreferrer" className={`btn ${p.accentBtn}`}>
              Join as an expert
            </a>
            <a href="#labs" className="pill-outline">
              Work with our experts
            </a>
          </div>
        </div>
        <div className={`hide-s ${s.answer}`} data-reveal style={{ "--d": 4 } as React.CSSProperties}>
          <div className={s.answerLabel}>Model answer under review</div>
          <div className={s.answerText}>&ldquo;A sole-source justification can cite urgency alone if&hellip;&rdquo;</div>
          <div className={s.answerMeta}>
            <span>Experts judging</span>
            <span>Reasoning recorded</span>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <p className="statement" data-reveal>
            <span className="quiet">A model can pass a benchmark and still get a contracting question wrong.</span>{" "}
            The people who can tell are the ones who have done the work.
          </p>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <h2 className="h2" style={{ marginBottom: 48 }} data-reveal>
            What experts do.
          </h2>
          <div className="rows">
            {work.map((w, i) => (
              <div key={w.title} className={`row stack ${p.numbered}`} data-reveal style={{ "--d": i } as React.CSSProperties}>
                <span className={p.num}>{i + 1}</span>
                <span className="row-title">{w.title}</span>
                <span className="row-text">{w.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band band-tint">
        <div className={`wrap stack ${p.split}`}>
          <div data-reveal>
            <h2 className="h2" style={{ marginBottom: 24 }}>
              Who we&rsquo;re looking for.
            </h2>
            <p className="lede" style={{ marginBottom: 20 }}>
              Mid-career public-sector and regulated-domain professionals with a
              real track record, in government now or recently.
            </p>
            <p className={p.colText} style={{ maxWidth: 520 }}>
              Current federal employees can take part within their agency&rsquo;s
              rules. Unpaid work needs nothing on file. Paid work needs your
              agency ethics office&rsquo;s written approval, recorded with us first.
            </p>
          </div>
          <div className={p.list}>
            {roles.map((r, i) => (
              <div key={r} data-reveal style={{ "--d": i } as React.CSSProperties}>
                {r}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <h2 className="h2" style={{ marginBottom: 56 }} data-reveal>
            How joining works.
          </h2>
          <div className="cols stack" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
            {steps.map((st, i) => (
              <div key={st.title} data-reveal style={{ "--d": i } as React.CSSProperties}>
                <div className={p.colTitle}>{st.title}</div>
                <div className={p.colText}>{st.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="labs">
        <div className={`wrap stack ${p.split}`}>
          <div data-reveal>
            <h2 className="h2" style={{ marginBottom: 24 }}>
              For AI labs, integrators and program offices.
            </h2>
            <p className="lede" style={{ marginBottom: 24 }}>
              Book a verified expert cell: five to twenty professionals matched
              to your domain, screened for conflicts, working to a rubric you
              agree on. Sold as a cell, never as headcount.
            </p>
            <p className={p.pull}>
              Any network can say an expert passed its assessment. Your Roster
              can tell you who worked alongside them.
            </p>
            <a href={BUYERS} target="_blank" rel="noopener noreferrer" className="btn">
              Request an introduction
            </a>
          </div>
          <div className={p.evidence} data-reveal style={{ "--d": 2 } as React.CSSProperties}>
            <div className={p.evidenceTitle}>Every result comes with its evidence</div>
            <div className={p.evidenceGrid}>
              <span>Request</span>
              <span>What the model was asked</span>
              <span>Response</span>
              <span>What it said</span>
              <span>Judgments</span>
              <span>Each expert&rsquo;s call and reasoning</span>
              <span>Not evaluated</span>
              <span>Shown as such, never as a pass</span>
              <span>Hash</span>
              <span>SHA-256 of the whole record</span>
            </div>
            <p className={p.colText} style={{ marginTop: 18 }}>
              Run on Aegis Eval, our evaluation engine. No single trust score
              stands in for the evidence.
            </p>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <h2 className="h2" style={{ marginBottom: 48 }} data-reveal>
            Who&rsquo;s building it.
          </h2>
          <div className={p.team}>
            {team.map((t, i) => (
              <div key={t.name} data-reveal style={{ "--d": i } as React.CSSProperties}>
                <div className={p.personName}>{t.name}</div>
                <div className={p.personRole}>{t.role}</div>
                {t.text && <div className={p.colText}>{t.text}</div>}
              </div>
            ))}
          </div>
          <div className="rows" style={{ marginTop: 56, borderTopColor: "var(--line)" }}>
            {advisors.map((a, i) => (
              <div key={a.name} className={`row stack ${p.advisorRow}`} data-reveal style={{ "--d": i } as React.CSSProperties}>
                <span>{a.name}</span>
                <span className="row-text">Advisor. {a.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <h2 className="h2" style={{ marginBottom: 40 }} data-reveal>
            Questions.
          </h2>
          <div className="rows">
            {faqs.map((f, i) => (
              <div key={f.q} className={`row stack ${p.faqRow}`} data-reveal style={{ "--d": i } as React.CSSProperties}>
                <span className={p.faqQ}>{f.q}</span>
                <span className="row-text">{f.a}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={p.closing}>
        <div className="wrap">
          <h2 className={`display ${p.closingH2}`} data-reveal>
            Your judgment, on the record.
          </h2>
          <div className="btn-row" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
            <a href={JOIN} target="_blank" rel="noopener noreferrer" className={`btn ${p.accentBtn}`}>
              Join as an expert
            </a>
            <a href={SITE} target="_blank" rel="noopener noreferrer" className="pill-outline">
              yourrosterapp.com
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
