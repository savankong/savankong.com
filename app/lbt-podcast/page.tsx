import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ShaderCanvas from "@/components/ShaderCanvas";
import { getFeaturedShow } from "@/lib/lbt-spotlight";
import p from "../product.module.css";
import s from "./lbt-podcast.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Life Between Titles — hosted by Savan Kong",
  description:
    "Life Between Titles is a podcast network for career transitions, founded and hosted by Savan Kong: unscripted conversations with people navigating layoffs, burnout and identity shifts.",
};

const SPOTIFY = "https://open.spotify.com/show/1olZo0VDvHh9w0F2D2vEir";

const shows = [
  {
    title: "Life Between Titles",
    desc: "The flagship. 33 episodes in Season 1: a USAID humanitarian worker, a DoD executive, a veterans advocate, a UX designer and more.",
  },
  {
    title: "Work Unscripted",
    desc: "Unusual careers: a professional disc golfer, a pediatric surgeon, a Marine general, a CIO and an insect-protein scientist.",
  },
  {
    title: "Office Hours",
    desc: "Short and focused. Each episode takes one question, from giving feedback to job searching and leadership.",
  },
];

export default async function LbtPodcast() {
  const episode = await getFeaturedShow();

  return (
    <div className={p.page} style={{ "--accent": "var(--lbt)" } as React.CSSProperties}>
      <Nav active="Podcast" cta={{ label: "Listen", href: SPOTIFY }} />

      <section className={s.hero}>
        <div className={`wrap stack ${s.heroGrid}`}>
          <div>
            <p className={`kicker ${p.byline}`} data-reveal>
              A podcast network for career transitions
            </p>
            <h1 className={`display ${s.h1}`} data-reveal style={{ "--d": 1 } as React.CSSProperties}>
              Life Between Titles
            </h1>
            <p className={`lede ${p.heroLede}`} data-reveal style={{ "--d": 2 } as React.CSSProperties}>
              Where one title ends and the real story begins. Honest, unscripted
              conversations with people navigating layoffs, pivots, burnout and
              identity shifts. Three shows, 40+ episodes, free everywhere you
              listen.
            </p>
            <div className="btn-row" data-reveal style={{ "--d": 3 } as React.CSSProperties}>
              <a href={SPOTIFY} target="_blank" rel="noopener noreferrer" className={`btn ${p.accentBtn}`}>
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
          <figure className={s.host} data-reveal style={{ "--d": 2 } as React.CSSProperties}>
            <div className={s.hostPhoto}>
              <Image src="/savan-cutout.png" alt="Savan Kong" width={353} height={755} className={s.hostImg} />
            </div>
            <figcaption>
              <div className={p.personName} style={{ fontSize: 28 }}>Savan Kong</div>
              <div className={p.personRole}>Founder and host</div>
            </figcaption>
          </figure>
        </div>
        <div className={s.wave}>
          <ShaderCanvas shader="waveform" />
        </div>
      </section>

      <section className="band">
        <div className={`wrap stack ${p.split}`}>
          <h2 className="h2" style={{ fontSize: "clamp(36px, 4.4vw, 60px)" }} data-reveal>
            Nobody wants to sit in the part where you don&rsquo;t know who you
            are yet. That&rsquo;s the part I ask about.
          </h2>
          <div data-reveal style={{ "--d": 2 } as React.CSSProperties}>
            <p className="lede" style={{ marginBottom: 20 }}>
              I started the show from my home office in Longview, Washington, in
              the middle of my own job search: a year out of work after leaving
              the Department of Defense, and an ADHD diagnosis at 46.
            </p>
            <p className="lede">
              Every guest gets the same question underneath the career story.
              Not the highlights, but what it felt like when the title was gone,
              and what they found underneath it.
            </p>
          </div>
        </div>
      </section>

      {episode && (
        <section className="band band-tint">
          <div className={`wrap stack ${p.split}`} style={{ alignItems: "center", gap: 56 }}>
            <a href={`https://www.lifebetweentitles.com/shows/${episode.slug}`} target="_blank" rel="noopener noreferrer" className={s.thumb} data-reveal>
              <Image src={`https://www.lifebetweentitles.com${episode.photo}`} alt={episode.guest} fill sizes="(max-width: 960px) 100vw, 640px" />
            </a>
            <div data-reveal style={{ "--d": 1 } as React.CSSProperties}>
              <div style={{ color: "var(--lbt)", fontSize: 15, marginBottom: 12 }}>
                Latest · {episode.show}
                {episode.season && episode.episode
                  ? ` · S${String(episode.season).padStart(2, "0")} E${String(episode.episode).padStart(2, "0")}`
                  : ""}
              </div>
              <div className={s.episodeTitle}>{episode.youtubeTitle}</div>
              <div className="row-text" style={{ marginBottom: 28 }}>With {episode.guest}</div>
              <a href={`https://www.lifebetweentitles.com/shows/${episode.slug}`} target="_blank" rel="noopener noreferrer" className="pill-outline">
                Watch the episode
              </a>
            </div>
          </div>
        </section>
      )}

      <section className="band">
        <div className="wrap">
          <h2 className="h2" style={{ marginBottom: 48 }} data-reveal>
            Three shows.
          </h2>
          <div className="rows">
            {shows.map((sh, i) => (
              <div key={sh.title} className={`row stack ${s.showRow}`} data-reveal style={{ "--d": i } as React.CSSProperties}>
                <span className="row-title" style={{ fontSize: "clamp(26px, 2.6vw, 36px)" }}>{sh.title}</span>
                <span className="row-text">{sh.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={p.closing}>
        <div className="wrap">
          <h2 className={`display ${p.closingH2}`} style={{ fontSize: "clamp(52px, 7.4vw, 112px)" }} data-reveal>
            Every episode lives on lifebetweentitles.com.
          </h2>
          <div className="btn-row" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
            <a href="https://www.lifebetweentitles.com/" target="_blank" rel="noopener noreferrer" className={`btn ${p.accentBtn}`}>
              Visit the site
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
