import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ShaderCanvas from "@/components/ShaderCanvas";
import RiseWords from "@/components/RiseWords";
import { getPublishedPosts } from "@/lib/posts";
import { getFeaturedShow } from "@/lib/lbt-spotlight";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const credentials = [
  "CEO & Co-Founder, Your Roster",
  "Creator of Light-Lux",
  "Host, Life Between Titles",
  "DoD’s first Customer Experience Officer",
  "2024 DefenseScoop Industry Leadership Award",
  "Defense Digital Service",
  "Founding team, Redfin",
  "Design lead, Amazon Kindle",
  "Author, Laid Off and Lost",
];

const pressItems = [
  {
    source: "Defense Scoop",
    headline: "Reflections from Savan Kong, DoD’s First Ever Customer Experience Officer",
  },
  {
    source: "311 Public Service Podcast",
    headline: "Design at Scale with Savan Kong",
  },
  {
    source: "Khmer Voices",
    headline: "Seeing the Power of Privilege at Play",
  },
  {
    source: "Federal News Network",
    headline: "Building the First Pentagon CX Office from the Ground Up",
    href: "https://federalnewsnetwork.com/defense-main/2025/03/dod-modernization-exchange-2025-savan-kong-on-building-first-pentagon-cx-office-from-the-ground-up/",
  },
];

const testimonials = [
  {
    quote:
      "The Department is incredibly fortunate that Savan chose to share his expertise with us. His quiet strength, generosity, and deep expertise made a lasting impact.",
    name: "Leslie Beavers",
    role: "CIO, Department of Defense",
    photo:
      "https://images.squarespace-cdn.com/content/v1/67d45a59e5abd35cf0bf7d15/3e9e1522-ed68-4b63-884c-3da9d34c3245/leslie.jpeg",
  },
  {
    quote:
      "He is an energy-giver who is absolutely one of the most innovative thinkers, and doers, with whom I’ve ever served.",
    name: "John Sherman",
    role: "Dean, Bush School, Texas A&M",
    photo:
      "https://images.squarespace-cdn.com/content/v1/67d45a59e5abd35cf0bf7d15/2d8a37e4-301f-4959-a952-9078320e4f33/1718256736673.jpeg",
  },
  {
    quote:
      "Savan is one of my favorite people and an incredible teammate: a leader, mentor, and source of strength through a leadership transition.",
    name: "Katie Savage",
    role: "Secretary, Maryland Dept. of IT",
    photo:
      "https://images.squarespace-cdn.com/content/v1/67d45a59e5abd35cf0bf7d15/d6febe68-45ae-49da-a62f-c66a0d381b3d/1693429869562.jpeg",
  },
  {
    quote:
      "Quite simply, Savan is one of the best user experience and design experts I’ve ever had the pleasure to work with.",
    name: "Dan Rodrigues",
    role: "Co-Founder & CEO, Tebra",
    photo:
      "https://images.squarespace-cdn.com/content/v1/67d45a59e5abd35cf0bf7d15/32bd3edf-2468-4d99-9648-a581a355de56/1666042614022+%281%29.jpeg",
  },
];

const shows = [
  { name: "Life Between Titles", note: "The flagship. Long, unscripted conversations with people mid-transition." },
  { name: "Work Unscripted", note: "Unusual careers, from a pro disc golfer to a Marine general." },
  { name: "Office Hours", note: "Short, focused answers from coaches and experts." },
];

export default async function Home() {
  const latestPosts = (await getPublishedPosts()).slice(0, 3);
  const featuredShow = await getFeaturedShow();

  return (
    <>
      <Nav active="Home" overlay />

      {/* ---------- Hero ---------- */}
      <section className={styles.hero}>
        <ShaderCanvas shader="aurora" />
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <div className={styles.heroKicker} data-reveal>
              <span className={styles.liveDot} /> Building in Longview, WA
            </div>
            <h1 className={styles.heroH1}>
              <RiseWords text="Savan" />
              <br />
              <RiseWords text="Kong" start={1} className="lit" />
            </h1>
            <ul className={styles.roles}>
              <li data-reveal style={{ "--d": 3 } as React.CSSProperties}>
                <Link href="/your-roster">
                  <span className={styles.roleKey}>CEO &amp; Co-Founder</span>
                  <span className={styles.roleVal}>Your Roster</span>
                </Link>
              </li>
              <li data-reveal style={{ "--d": 4 } as React.CSSProperties}>
                <Link href="/light-lux">
                  <span className={styles.roleKey}>Creator</span>
                  <span className={styles.roleVal}>Light-Lux</span>
                </Link>
              </li>
              <li data-reveal style={{ "--d": 5 } as React.CSSProperties}>
                <Link href="/lbt-podcast">
                  <span className={styles.roleKey}>Host</span>
                  <span className={styles.roleVal}>Life Between Titles</span>
                </Link>
              </li>
            </ul>
            <p className={styles.heroBio} data-reveal style={{ "--d": 6 } as React.CSSProperties}>
              I build products for the moments when work changes. Your Roster
              turns the people who already know your work into your way in.
              Light-Lux takes your meeting notes so you can be in the room.
              And every week on Life Between Titles, I talk with people about
              who they are between jobs. Before this, I was the Department of
              Defense&rsquo;s first Customer Experience Officer.
            </p>
            <div className={styles.heroCtas} data-reveal style={{ "--d": 7 } as React.CSSProperties}>
              <a href="#building" className="pill-filled">
                See what I&rsquo;m building ↓
              </a>
              <Link href="/lbt-podcast" className="pill-outline">
                ▶ Listen to the podcast
              </Link>
            </div>
          </div>
          <div className={styles.heroPortrait} data-reveal="scale">
            <div className={styles.portraitHalo} aria-hidden="true" />
            <Image
              src="/savan-cutout.png"
              alt="Savan Kong"
              width={353}
              height={755}
              className={styles.heroImage}
              priority
            />
          </div>
        </div>
        <div className={styles.scrollCue} aria-hidden="true">
          <span />
        </div>
      </section>

      {/* ---------- Credentials marquee ---------- */}
      <div className={styles.marquee} aria-label="Credentials">
        <div className={styles.marqueeTrack}>
          {[...credentials, ...credentials].map((c, i) => (
            <span key={i} className={styles.marqueeItem} aria-hidden={i >= credentials.length}>
              {c}
              <span className={styles.marqueeStar}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ---------- What I'm building ---------- */}
      <section id="building" className={`section ${styles.building}`}>
        <div className={styles.sectionHead} data-reveal>
          <div className="eyebrow">
            <span className="eyebrow-rule" />
            <span className="eyebrow-label">What I&rsquo;m building</span>
          </div>
          <h2 className="h2">
            Two products. <span className="lit">One idea:</span>
            <br />
            the people around your work matter most.
          </h2>
        </div>

        <div className={styles.productGrid}>
          <article className={`${styles.productCard} ${styles.cardRoster}`} data-tilt data-reveal>
            <div className={styles.productCanvas}>
              <ShaderCanvas shader="network" maxDpr={1.25} />
            </div>
            <div className={styles.productBody}>
              <div className={styles.productTop}>
                <span className={styles.productLogo}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logos/your-roster.svg" alt="" />
                </span>
                <span className={styles.productRole}>CEO &amp; Co-Founder</span>
              </div>
              <h3 className={styles.productName}>Your Roster</h3>
              <p className={styles.productPitch}>
                Your next role arrives with someone who can vouch for you.
              </p>
              <p className={styles.productDesc}>
                Bring in your LinkedIn connections and see who you already
                know inside the companies hiring right now, with an intro
                drafted for you to send yourself. Your verified record then
                opens the door to paid expert work.
              </p>
              <div className={styles.productCtas}>
                <Link href="/your-roster" className="pill-filled">
                  Explore Your Roster →
                </Link>
                <a href="https://www.yourrosterapp.com/waitlist" target="_blank" rel="noopener noreferrer" className="pill-outline">
                  Request access
                </a>
              </div>
            </div>
          </article>

          <article className={`${styles.productCard} ${styles.cardLux}`} data-tilt data-reveal style={{ "--d": 2 } as React.CSSProperties}>
            <div className={styles.productCanvas}>
              <ShaderCanvas shader="lightshafts" maxDpr={1.25} />
            </div>
            <div className={styles.productBody}>
              <div className={styles.productTop}>
                <span className={`${styles.productLogo} ${styles.luxLogo}`}>
                  <span />
                  <span />
                  <span />
                </span>
                <span className={styles.productRole}>Creator</span>
              </div>
              <h3 className={styles.productName}>Light-Lux</h3>
              <p className={styles.productPitch}>
                Meetings, notes, conversations. Illuminated.
              </p>
              <p className={styles.productDesc}>
                Meeting notes with no bot in your call. Light-Lux transcribes
                as you talk, writes the minutes with decisions and action
                items, briefs you before the next meeting, and answers
                questions across everything you&rsquo;ve discussed.
              </p>
              <div className={styles.productCtas}>
                <Link href="/light-lux" className="pill-filled">
                  Explore Light-Lux →
                </Link>
                <a href="https://www.light-lux.com" target="_blank" rel="noopener noreferrer" className="pill-outline">
                  Start free
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ---------- Host: Life Between Titles ---------- */}
      <section id="podcast" className={styles.host}>
        <div className={styles.hostCanvas}>
          <ShaderCanvas shader="waveform" />
        </div>
        <div className={styles.hostInner}>
          <div className={styles.hostText} data-reveal>
            <div className="eyebrow">
              <span className="eyebrow-rule" />
              <span className="eyebrow-label">Your host</span>
            </div>
            <h2 className={styles.hostH2}>
              Life Between <span className="lit">Titles.</span>
            </h2>
            <p className={styles.hostBody}>
              I started this show from my home office in the middle of my own
              job search. Every week I sit down with people navigating
              layoffs, pivots, burnout and the question underneath all of
              them: who am I without the title? Three shows, 40+ honest
              conversations, free everywhere you listen.
            </p>
            <div className={styles.listenRow}>
              <a href="https://open.spotify.com/show/1olZo0VDvHh9w0F2D2vEir" target="_blank" rel="noopener noreferrer" className="pill-filled">
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

          <div className={styles.hostSide}>
            {featuredShow ? (
              <a
                href={`https://www.lifebetweentitles.com/shows/${featuredShow.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.spotlight}
                data-tilt
                data-reveal="scale"
              >
                <div className={styles.spotlightPhoto}>
                  <Image
                    src={`https://www.lifebetweentitles.com${featuredShow.photo}`}
                    alt={featuredShow.guest}
                    fill
                    sizes="(max-width: 900px) 100vw, 420px"
                  />
                  <span className={styles.playBtn} aria-hidden="true">▶</span>
                </div>
                <div className={styles.spotlightMeta}>
                  <span className={styles.badge}>Latest spotlight</span>
                  <span>
                    {featuredShow.show}
                    {featuredShow.season && featuredShow.episode
                      ? ` · S${String(featuredShow.season).padStart(2, "0")} E${String(featuredShow.episode).padStart(2, "0")}`
                      : ""}
                  </span>
                </div>
                <div className={styles.spotlightTitle}>{featuredShow.youtubeTitle}</div>
                <div className={styles.spotlightGuest}>With {featuredShow.guest}</div>
              </a>
            ) : (
              <Link href="/lbt-podcast" className={styles.spotlight} data-tilt data-reveal="scale">
                <div className={styles.spotlightTitle}>New conversations every week.</div>
                <div className={styles.spotlightGuest}>See every show →</div>
              </Link>
            )}
            <ol className={styles.showList}>
              {shows.map((s, i) => (
                <li key={s.name} data-reveal style={{ "--d": i + 1 } as React.CSSProperties}>
                  <span className={styles.showNum}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <div className={styles.showName}>{s.name}</div>
                    <div className={styles.showNote}>{s.note}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------- Book ---------- */}
      <section id="books" className={`section ${styles.bookBand}`}>
        <div className={styles.bookGrid}>
          <div className={styles.bookCoverWrap} data-reveal="scale">
            <Image
              src="https://m.media-amazon.com/images/I/61fs-JDYw8L._SL1499_.jpg"
              alt="Laid Off and Lost book cover"
              width={300}
              height={450}
              className={styles.bookCover}
            />
          </div>
          <div data-reveal>
            <div className="eyebrow">
              <span className="eyebrow-rule" />
              <span className="eyebrow-label">The book</span>
            </div>
            <h2 className="h2">Laid Off and Lost.</h2>
            <p className={styles.bookDesc}>
              How to survive a job loss, rediscover your identity, and rebuild
              yourself after being let go. Written from my own year out of
              work and 29 interviews with people who lived it. Next up:{" "}
              <Link href="/books/halfway-light" className={styles.inline}>
                Halfway Light
              </Link>
              , a memoir of my family&rsquo;s path from a refugee camp in
              Thailand to here.
            </p>
            <div className={styles.heroCtas}>
              <a href="https://www.amazon.com/dp/B0H7P4DGHX?tag=lifebetweenti-20" target="_blank" rel="noopener noreferrer" className="pill-filled">
                Buy the book
              </a>
              <Link href="/books" className="pill-outline">
                All books
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Press ---------- */}
      <section className={`section top-border ${styles.press}`}>
        <div className="section-head-row" data-reveal>
          <div>
            <div className="eyebrow">
              <span className="eyebrow-rule" />
              <span className="eyebrow-label">In the press</span>
            </div>
            <h2 className="h2">Featured conversations.</h2>
          </div>
          <Link href="/speaking" className="view-all">
            Speaking &amp; press →
          </Link>
        </div>
        <div className={styles.pressGrid}>
          {pressItems.map((item, i) => {
            const inner = (
              <>
                <div className={styles.pressSource}>{item.source}</div>
                <div className={styles.pressHeadline}>{item.headline}</div>
                {item.href && <span className={styles.pressGo}>Read / watch →</span>}
              </>
            );
            return item.href ? (
              <a key={item.source} href={item.href} target="_blank" rel="noopener noreferrer" className={styles.pressCard} data-reveal style={{ "--d": i } as React.CSSProperties}>
                {inner}
              </a>
            ) : (
              <div key={item.source} className={styles.pressCard} data-reveal style={{ "--d": i } as React.CSSProperties}>
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- Journal ---------- */}
      {latestPosts.length > 0 && (
        <section id="journal" className="section top-border">
          <div className="section-head-row" data-reveal>
            <div>
              <div className="eyebrow">
                <span className="eyebrow-rule" />
                <span className="eyebrow-label">The journal</span>
              </div>
              <h2 className="h2">Notes from the in-between.</h2>
            </div>
            <Link href="/the-latest" className="view-all">
              All entries →
            </Link>
          </div>
          <div className={styles.journalList}>
            {latestPosts.map((post, i) => (
              <Link key={post.slug} href={`/the-latest/${post.slug}`} className={styles.entry} data-reveal style={{ "--d": i } as React.CSSProperties}>
                <span className={styles.entryNum}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.entryTitle}>{post.title}</span>
                <span className={styles.entryExcerpt}>{post.excerpt}</span>
                <span className={styles.entryArrow}>→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Testimonials ---------- */}
      <section className="section top-border">
        <div className="eyebrow" data-reveal>
          <span className="eyebrow-rule" />
          <span className="eyebrow-label">What people say</span>
        </div>
        <h2 className="h2" style={{ marginBottom: 56 }} data-reveal>
          Trusted by leaders.
        </h2>
        <div className={styles.testimonialsGrid}>
          {testimonials.map((t, i) => (
            <figure key={t.name} className={styles.testimonial} data-tilt data-reveal style={{ "--d": i } as React.CSSProperties}>
              <blockquote className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className={styles.testimonialWho}>
                <Image src={t.photo} alt={t.name} width={44} height={44} className={styles.testimonialPhoto} />
                <span>
                  <span className={styles.testimonialName}>{t.name}</span>
                  <span className={styles.testimonialRole}>{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
