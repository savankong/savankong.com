import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ShaderCanvas from "@/components/ShaderCanvas";
import RiseWords from "@/components/RiseWords";
import { getFeaturedShow } from "@/lib/lbt-spotlight";
import p from "../product.module.css";
import styles from "./lbt-podcast.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Life Between Titles — hosted by Savan Kong",
  description:
    "Life Between Titles is a podcast network for career transitions, founded and hosted by Savan Kong: raw, unscripted conversations with people navigating layoffs, burnout and identity shifts.",
};

const shows = [
  {
    label: "Flagship show",
    title: "Life Between Titles",
    tagline: "Raw, unscripted conversations with people navigating layoffs, burnout and career identity shifts.",
    desc: "33 episodes in Season 1. A USAID humanitarian worker, a DoD executive, a veterans advocate, a UX designer, and more.",
  },
  {
    label: "Unusual careers",
    title: "Work Unscripted",
    tagline: "Deep dives into professional paths rarely talked about.",
    desc: "12 episodes in Season 2. A professional disc golfer, a pediatric surgeon, a Marine general, a CIO and an insect-protein scientist.",
  },
  {
    label: "Expert conversations",
    title: "Office Hours",
    tagline: "Structured conversations with coaches, consultants and experts.",
    desc: "Shorter and focused: each episode takes one question, from giving feedback to job searching and leadership.",
  },
];

const listen = [
  { label: "Spotify", href: "https://open.spotify.com/show/1olZo0VDvHh9w0F2D2vEir" },
  { label: "Apple Podcasts", href: "https://podcasts.apple.com/us/podcast/life-between-titles/id1844748787" },
  { label: "YouTube", href: "https://www.youtube.com/@LifeBetweenTitles" },
];

export default async function LbtPodcast() {
  const featured = await getFeaturedShow();

  return (
    <div className={p.page} style={{ "--accent": "#f2c46d", "--accent-2": "#8c7bff" } as React.CSSProperties}>
      <Nav active="Podcast" overlay />

      <section className={`${p.hero} ${styles.hero}`}>
        <ShaderCanvas shader="waveform" />
        <div className={p.heroShade} />
        <div className={`${p.heroInner} ${styles.heroGrid}`}>
          <div>
            <div className={p.crumb} data-reveal>
              <span className={p.crumbTag}>Podcast</span> Founded &amp; hosted by Savan Kong
            </div>
            <h1 className={p.h1}>
              <RiseWords text="Life Between" /> <RiseWords text="Titles." start={2} className="lit" />
            </h1>
            <p className={p.lede} data-reveal style={{ "--d": 3 } as React.CSSProperties}>
              Where one title ends and the real story begins. Honest,
              unscripted stories from people navigating layoffs, career
              pivots, burnout and identity shifts. Three shows, 40+
              conversations, free everywhere you listen.
            </p>
            <div className={p.ctaRow} data-reveal style={{ "--d": 4 } as React.CSSProperties}>
              {listen.map((l, i) => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={i === 0 ? `pill-filled ${p.accentBtn}` : "pill-outline"}>
                  {i === 0 ? "▶ " : ""}
                  {l.label}
                </a>
              ))}
            </div>
          </div>
          <div className={styles.hostCard} data-reveal="scale" data-tilt>
            <div className={styles.micRing} aria-hidden="true" />
            <Image
              src="/savan-cutout.png"
              alt="Savan Kong, host of Life Between Titles"
              width={240}
              height={240}
              className={styles.hostPhoto}
            />
            <div className={styles.onAir}>
              <span /> On air
            </div>
            <div className={styles.hostName}>Savan Kong</div>
            <div className={styles.hostRole}>Founder &amp; host</div>
          </div>
        </div>
      </section>

      <section className={p.section}>
        <div className={`${p.wrap} ${p.split}`}>
          <div data-reveal>
            <div className={p.kicker}>Why I host it</div>
            <h2 className={p.h2}>Nobody wants to sit in the part where you don&rsquo;t know who you are yet.</h2>
          </div>
          <div data-reveal style={{ "--d": 2 } as React.CSSProperties}>
            <p className={p.body}>
              I started Life Between Titles from my home office in Longview,
              Washington, in the middle of my own job search: a year out of
              work after leaving the Department of Defense, and an ADHD
              diagnosis at 46.
            </p>
            <p className={p.body}>
              That uncertain in-between space is what I ask every guest about.
              Not the career highlights, but what it felt like when the title
              was gone and what they found underneath it.
            </p>
          </div>
        </div>
      </section>

      {featured && (
        <section className={p.section}>
          <div className={p.wrap}>
            <div className={p.kicker} data-reveal>Latest spotlight</div>
            <a
              href={`https://www.lifebetweentitles.com/shows/${featured.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.spotlight}
              data-reveal="scale"
              data-tilt
            >
              <div className={styles.spotlightPhoto}>
                <Image src={`https://www.lifebetweentitles.com${featured.photo}`} alt={featured.guest} fill sizes="(max-width: 860px) 100vw, 50vw" />
                <span className={styles.play} aria-hidden="true">▶</span>
              </div>
              <div className={styles.spotlightBody}>
                <div className={styles.spotlightShow}>
                  {featured.show}
                  {featured.season && featured.episode
                    ? ` · S${String(featured.season).padStart(2, "0")} E${String(featured.episode).padStart(2, "0")}`
                    : ""}
                </div>
                <div className={styles.spotlightTitle}>{featured.youtubeTitle}</div>
                <div className={styles.spotlightGuest}>With {featured.guest}</div>
                <span className="pill-outline">Watch the episode →</span>
              </div>
            </a>
          </div>
        </section>
      )}

      <section className={p.section}>
        <div className={p.wrap}>
          <div className={p.kicker} data-reveal>The network</div>
          <h2 className={p.h2} data-reveal>Three shows, one in-between.</h2>
          <div className={styles.showsGrid}>
            {shows.map((show, i) => (
              <div key={show.title} className={`${styles.showCard} ${i === 0 ? styles.showFlagship : ""}`} data-reveal data-tilt style={{ "--d": i } as React.CSSProperties}>
                <div className={styles.showLabel}>{show.label}</div>
                <h3 className={styles.showTitle}>{show.title}</h3>
                <p className={styles.showTagline}>{show.tagline}</p>
                <p className={styles.showDesc}>{show.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={p.closing}>
        <ShaderCanvas shader="waveform" speed={0.7} maxDpr={1} />
        <div className={p.closingShade} />
        <div className={p.closingInner} data-reveal>
          <h2 className={p.h2}>Catch up on every episode.</h2>
          <p className={p.lede}>Every guest, every show, every conversation lives on lifebetweentitles.com.</p>
          <div className={p.ctaRow}>
            <a href="https://www.lifebetweentitles.com/" target="_blank" rel="noopener noreferrer" className={`pill-filled ${p.accentBtn}`}>
              Visit Life Between Titles →
            </a>
            <a href="https://lifebetweentitles.substack.com" target="_blank" rel="noopener noreferrer" className="pill-outline">
              Get the newsletter
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
