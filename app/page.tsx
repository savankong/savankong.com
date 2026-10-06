import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ShaderCanvas from "@/components/ShaderCanvas";
import { getPublishedPosts } from "@/lib/posts";
import { getFeaturedShow } from "@/lib/lbt-spotlight";
import s from "./page.module.css";

export const dynamic = "force-dynamic";

const roles = [
  { role: "CEO & Co-Founder", name: "Your Roster", href: "/your-roster", color: "var(--roster)" },
  { role: "Creator", name: "Light-Lux", href: "/light-lux", color: "var(--lux)" },
  { role: "Host", name: "Life Between Titles", href: "/lbt-podcast", color: "var(--lbt)" },
];

const products = [
  {
    no: "01",
    name: "Your Roster",
    role: "CEO & Co-Founder",
    color: "var(--roster)",
    text: "The largest network of government experts, giving human feedback that makes AI models better at government work. Program managers, contracting officers and policy analysts judge what models get right and wrong, and why.",
    primary: { label: "See Your Roster", href: "/your-roster" },
    secondary: { label: "Join as an expert", href: "https://yourrosterapp.com/experts" },
    shader: "expertsCentred" as const,
    caption: "Model answer · experts judging",
  },
  {
    no: "02",
    name: "Light-Lux",
    role: "Creator",
    color: "var(--lux)",
    text: "Meeting notes with no bot in the call. It transcribes as you talk, writes minutes that open with decisions and action items, and briefs you before the next meeting. Audio is never kept.",
    primary: { label: "See Light-Lux", href: "/light-lux" },
    secondary: { label: "Start free", href: "https://www.light-lux.com" },
    shader: "voices" as const,
  },
  {
    no: "03",
    name: "Life Between Titles",
    role: "Host",
    color: "var(--lbt)",
    text: "A podcast network for career transitions. Three shows and 40+ unscripted conversations with people navigating layoffs, pivots and burnout.",
    primary: { label: "Listen", href: "/lbt-podcast" },
    secondary: { label: "Every episode", href: "https://www.lifebetweentitles.com" },
    shader: "waveform" as const,
  },
];

const shows = [
  { name: "Life Between Titles", note: "The flagship. Long conversations with people mid-transition." },
  { name: "Work Unscripted", note: "Unusual careers, from a pro disc golfer to a Marine general." },
  { name: "Office Hours", note: "Short, focused answers from coaches and experts." },
];

const career = [
  { title: "First Customer Experience Officer, U.S. Department of Defense", note: "2023 to 2025. 2024 DefenseScoop Industry Leadership Award." },
  { title: "General Manager, Rebellion Defense", note: "Product for IRIS; launched Dispatch from concept to shipped." },
  { title: "Digital Service Expert, Defense Digital Service", note: "Project Oscar during the 2021 Afghan evacuation; the DoD Digital Hiring Playbook." },
  { title: "Design lead, Kindle at Amazon", note: "Then Director of UX and Product at Kareo." },
  { title: "Founding employee, Redfin", note: "Co-inventor of its map-based search, US Patent 9,436,945." },
];

const press = [
  { source: "Federal News Network", headline: "Building the first Pentagon CX office from the ground up", href: "https://federalnewsnetwork.com/defense-main/2025/03/dod-modernization-exchange-2025-savan-kong-on-building-first-pentagon-cx-office-from-the-ground-up/" },
  { source: "Defense Scoop", headline: "Reflections from DoD’s first Customer Experience Officer" },
  { source: "311 Public Service Podcast", headline: "Design at scale" },
  { source: "Khmer Voices", headline: "Seeing the power of privilege at play" },
];

const quotes = [
  { quote: "The Department is incredibly fortunate that Savan chose to share his expertise with us.", who: "Leslie Beavers, CIO, Department of Defense" },
  { quote: "One of the most innovative thinkers, and doers, with whom I’ve ever served.", who: "John Sherman, Dean, Bush School, Texas A&M" },
];

function external(href: string) {
  return href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

export default async function Home() {
  const posts = (await getPublishedPosts()).slice(0, 3);
  const episode = await getFeaturedShow();

  return (
    <>
      <Nav active="Home" />

      <section className={s.hero}>
        <ShaderCanvas shader="field" />
        <div className={`wrap stack ${s.heroGrid}`}>
          <div className={s.heroText}>
            <h1 className={`display ${s.name}`} data-reveal>
              Savan
              <br />
              Kong
            </h1>
            <div className="rows" style={{ borderTopColor: "var(--line-2)" }}>
              {roles.map((r, i) => (
                <Link key={r.name} href={r.href} className={s.role} data-reveal style={{ "--d": i + 1 } as React.CSSProperties}>
                  <span className={s.roleKey}>{r.role}</span>
                  <span className={s.roleName}>{r.name}</span>
                  <span className={s.arrow} style={{ color: r.color }}>→</span>
                </Link>
              ))}
            </div>
            <p className={`lede ${s.bio}`} data-reveal style={{ "--d": 4 } as React.CSSProperties}>
              I&rsquo;m building Your Roster, the largest network of government
              experts giving the human feedback that makes AI models work for
              government. I created Light-Lux, meeting notes with no bot in the
              call. And every week I host Life Between Titles, conversations
              about who we are between jobs. Before this, I was the Department
              of Defense&rsquo;s first Customer Experience Officer.
            </p>
          </div>
          <div className={`hide-s ${s.portrait}`} data-reveal style={{ "--d": 2 } as React.CSSProperties}>
            <Image src="/savan-cutout.png" alt="Savan Kong" width={353} height={755} priority className={s.portraitImg} />
          </div>
        </div>
      </section>

      <section className={s.work}>
        <div className="wrap">
          <h2 className="h2" style={{ marginBottom: 64 }} data-reveal>
            What I&rsquo;m working on.
          </h2>
          {products.map((p) => (
            <article key={p.name} className={`stack ${s.product}`} style={{ "--c": p.color } as React.CSSProperties}>
              <div className={`hide-s ${s.productNo}`}>{p.no}</div>
              <div data-reveal>
                <h3 className={s.productName}>{p.name}</h3>
                <p className={s.productRole}>{p.role}</p>
                <p className={s.productText}>{p.text}</p>
                <div className="btn-row">
                  <Link href={p.primary.href} className="btn">
                    {p.primary.label}
                  </Link>
                  <a href={p.secondary.href} className="pill-outline" {...external(p.secondary.href)}>
                    {p.secondary.label}
                  </a>
                </div>
              </div>
              <div className={s.strip} data-reveal style={{ "--d": 2 } as React.CSSProperties}>
                <ShaderCanvas shader={p.shader} maxDpr={1.5} />
                {p.caption && <span className={s.stripCaption}>{p.caption}</span>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={`band ${s.host}`} id="podcast">
        <div className="wrap stack" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 64 }}>
          <div data-reveal>
            <h2 className={`display ${s.hostH2}`}>I host Life Between Titles.</h2>
            <p className="lede" style={{ marginBottom: 32 }}>
              I started the show from my home office in Longview, Washington,
              in the middle of my own job search. Every guest gets the same
              question underneath the career story: who are you without the
              title?
            </p>
            <div className="btn-row">
              <a href="https://open.spotify.com/show/1olZo0VDvHh9w0F2D2vEir" target="_blank" rel="noopener noreferrer" className="btn" style={{ background: "var(--lbt)" }}>
                Spotify
              </a>
              <a href="https://podcasts.apple.com/us/podcast/life-between-titles/id1844748787" target="_blank" rel="noopener noreferrer" className="pill-outline">
                Apple Podcasts
              </a>
              <a href="https://www.youtube.com/@LifeBetweenTitles" target="_blank" rel="noopener noreferrer" className="pill-outline">
                YouTube
              </a>
            </div>
          </div>
          <div className="rows" data-reveal style={{ "--d": 2 } as React.CSSProperties}>
            {episode ? (
              <a href={`https://www.lifebetweentitles.com/shows/${episode.slug}`} target="_blank" rel="noopener noreferrer" className={s.episode}>
                <div className={s.episodePhoto}>
                  <Image src={`https://www.lifebetweentitles.com${episode.photo}`} alt={episode.guest} fill sizes="(max-width: 960px) 100vw, 600px" />
                </div>
                <div className={s.episodeMeta}>
                  Latest · {episode.show}
                  {episode.season && episode.episode
                    ? ` · S${String(episode.season).padStart(2, "0")} E${String(episode.episode).padStart(2, "0")}`
                    : ""}
                </div>
                <div className={s.episodeTitle}>{episode.youtubeTitle}</div>
                <div className="row-text">With {episode.guest}</div>
              </a>
            ) : null}
            {shows.map((sh) => (
              <div key={sh.name} className={`row ${s.showRow}`}>
                <span>{sh.name}</span>
                <span className="row-text">{sh.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <h2 className="h2" style={{ marginBottom: 48 }} data-reveal>
            Before this.
          </h2>
          <div className="rows">
            {career.map((c, i) => (
              <div key={c.title} className={`row stack ${s.careerRow}`} data-reveal style={{ "--d": i } as React.CSSProperties}>
                <span className="row-title">{c.title}</span>
                <span className="row-text">{c.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="books">
        <div className={`wrap stack ${s.book}`}>
          <div className={s.coverWrap} data-reveal>
            <Image src="https://m.media-amazon.com/images/I/61fs-JDYw8L._SL1499_.jpg" alt="Laid Off and Lost book cover" width={300} height={450} className={s.cover} />
          </div>
          <div data-reveal style={{ "--d": 1 } as React.CSSProperties}>
            <h2 className="display" style={{ fontSize: "clamp(44px, 5vw, 72px)", lineHeight: 0.98, marginBottom: 20 }}>
              Laid Off and Lost.
            </h2>
            <p className="lede" style={{ marginBottom: 28 }}>
              How to survive a job loss, rediscover your identity, and rebuild
              yourself after being let go. Written from my own year out of work
              and 29 interviews. Next:{" "}
              <Link href="/books/halfway-light" className={s.inline}>
                Halfway Light
              </Link>
              , a memoir of my family&rsquo;s path from a refugee camp in
              Thailand.
            </p>
            <div className="btn-row">
              <a href="https://www.amazon.com/dp/B0H7P4DGHX?tag=lifebetweenti-20" target="_blank" rel="noopener noreferrer" className="btn">
                Buy the book
              </a>
              <Link href="/books" className="pill-outline">
                All books
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className={`stack ${s.quotes}`}>
            {quotes.map((q, i) => (
              <figure key={q.who} data-reveal style={{ "--d": i } as React.CSSProperties}>
                <blockquote className={s.quote}>&ldquo;{q.quote}&rdquo;</blockquote>
                <figcaption className="row-text">{q.who}</figcaption>
              </figure>
            ))}
          </div>
          <div className="rows" style={{ marginTop: 64 }}>
            {press.map((p, i) => {
              const inner = (
                <>
                  <span className="row-text">{p.source}</span>
                  <span>{p.headline}</span>
                  <span className={s.go}>{p.href ? "→" : ""}</span>
                </>
              );
              return p.href ? (
                <a key={p.source} href={p.href} target="_blank" rel="noopener noreferrer" className={`row stack ${s.pressRow}`} data-reveal style={{ "--d": i } as React.CSSProperties}>
                  {inner}
                </a>
              ) : (
                <div key={p.source} className={`row stack ${s.pressRow}`} data-reveal style={{ "--d": i } as React.CSSProperties}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="band" id="journal">
          <div className="wrap">
            <div className="section-head-row">
              <h2 className="h2">From the journal.</h2>
              <Link href="/the-latest" className="view-all">
                All entries →
              </Link>
            </div>
            <div className="rows">
              {posts.map((post, i) => (
                <Link key={post.slug} href={`/the-latest/${post.slug}`} className={`row stack ${s.careerRow}`} data-reveal style={{ "--d": i } as React.CSSProperties}>
                  <span className="row-title">{post.title}</span>
                  <span className="row-text">{post.excerpt}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
