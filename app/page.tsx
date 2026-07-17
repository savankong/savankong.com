import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getPublishedPosts } from "@/lib/posts";
import { getFeaturedShow } from "@/lib/lbt-spotlight";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const pressItems = [
  {
    source: "Defense Scoop",
    headline:
      "Reflections from Savan Kong, DoD's First Ever Customer Experience Officer (CXO)",
    desc: "An interview with Defense Scoop, reflecting on the journey as the Department of Defense's first Chief Customer Experience Officer.",
    cta: "Watch the interview →",
  },
  {
    source: "311 Public Service Podcast",
    headline: "Design at Scale with Savan Kong",
    desc: "Bringing a design mindset to pioneering the CXO role at the DoD.",
    cta: "Listen on Spotify →",
  },
  {
    source: "Khmer Voices",
    headline: "Seeing the Power of Privilege at Play",
    desc: "From South Seattle and the Khmer Rouge, to Redfin's first hire, to the Pentagon.",
    cta: "Full episode →",
  },
  {
    source: "Federal News Network",
    headline:
      "CX Exchange 2025: Savan Kong on Building First Pentagon CX Office from the Ground Up",
    desc: "Building the first Pentagon customer experience office from the ground up.",
    cta: "Read / watch →",
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
      "He is an energy-giver who is absolutely one of the most innovative thinkers — and doers — with whom I've ever served.",
    name: "John Sherman",
    role: "Dean, Bush School, Texas A&M",
    photo:
      "https://images.squarespace-cdn.com/content/v1/67d45a59e5abd35cf0bf7d15/2d8a37e4-301f-4959-a952-9078320e4f33/1718256736673.jpeg",
  },
  {
    quote:
      "Savan is one of my favorite people and an incredible teammate — a leader, mentor, and source of strength through a leadership transition.",
    name: "Katie Savage",
    role: "Secretary, Maryland Dept. of IT",
    photo:
      "https://images.squarespace-cdn.com/content/v1/67d45a59e5abd35cf0bf7d15/d6febe68-45ae-49da-a62f-c66a0d381b3d/1693429869562.jpeg",
  },
  {
    quote:
      "Quite simply, Savan is one of the best user experience and design experts I've ever had the pleasure to work with.",
    name: "Dan Rodrigues",
    role: "Co-Founder & CEO, Tebra",
    photo:
      "https://images.squarespace-cdn.com/content/v1/67d45a59e5abd35cf0bf7d15/32bd3edf-2468-4d99-9648-a581a355de56/1666042614022+%281%29.jpeg",
  },
];

const bookTeasers = [
  {
    status: "Available Now",
    title: "Laid Off and Lost.",
    desc: "The whole truth about what happens when the career ends and nobody talks about it.",
    href: "/books/laid-off-and-lost",
  },
  {
    status: "In Progress",
    title: "Halfway Light.",
    desc: "A standalone memoir tracing his family's survival of the Khmer Rouge genocide and resettlement in America.",
    href: "/books/halfway-light",
  },
  {
    status: "Coming Soon",
    title: "Right-Sized.",
    desc: "A corporate jargon coloring book, part of the Life Between Titles book series.",
    href: "/books/right-sized",
  },
];

export default async function Home() {
  const latestPosts = (await getPublishedPosts()).slice(0, 4);
  const featuredShow = await getFeaturedShow();

  return (
    <>
      <Nav active="Home" />

      <section className={`${styles.hero} glow-bg`}>
        <div className={styles.heroText}>
          <h1 className={styles.heroH1}>
            Savanrith <span className="glitch">&ldquo;Savan&rdquo;</span> Kong
          </h1>
          <div className={styles.heroTagline}>
            <span className={styles.heroTaglineItem}>
              First CXO, Department of War
            </span>
            <span className={styles.heroTaglineDot}>·</span>
            <span className={styles.heroTaglineItem}>
              Product, Design &amp; CX Executive
            </span>
            <span className={styles.heroTaglineDot}>·</span>
            <span className={styles.heroTaglineItem}>Author</span>
            <span className={styles.heroTaglineDot}>·</span>
            <span className={styles.heroTaglineItem}>
              Host — Life Between Titles
            </span>
          </div>
          <p className={styles.heroBio}>
            Savanrith &ldquo;Savan&rdquo; Kong is an award-winning executive and the
            Department of Defense&rsquo;s first Customer Experience Officer, leading
            enterprise-wide customer experience transformation. After being laid
            off, he founded <strong>War Room</strong> and{" "}
            <strong>Light-Lux</strong>. He is the author of{" "}
            <strong>
              Laid Off and Lost: How to Survive a Job Loss, Rediscover Your
              Identity, and Rebuild Yourself After Being Let Go
            </strong>
            , with an upcoming memoir, <strong>Halfway Light</strong>, tracing his
            family&rsquo;s survival of the Khmer Rouge genocide and their
            resettlement in America, and the silence passed down between
            generations. He also hosts the podcast{" "}
            <strong>Life Between Titles</strong>, a show exploring identity,
            purpose, and the uncertain space between titles and jobs.
          </p>
          <div className={styles.bookHighlight}>
            <Image
              src="https://www.lifebetweentitles.com/Cover-LaidOff.jpg"
              alt="Laid Off and Lost book cover"
              width={84}
              height={126}
              className={styles.bookHighlightCover}
            />
            <div>
              <div className={styles.bookHighlightLabel}>Now Available</div>
              <div className={styles.bookHighlightTitle}>
                Laid Off and Lost.
              </div>
              <div className={styles.bookHighlightCtas}>
                <a
                  href="https://www.amazon.com/dp/B0H7P4DGHX?tag=lifebetweenti-20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-filled"
                >
                  Buy the Book
                </a>
                <Link href="/books/laid-off-and-lost" className="pill-outline">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.heroImageWrap}>
          <Image
            src="/savan-cutout.png"
            alt="Savan Kong"
            width={353}
            height={755}
            className={styles.heroImage}
            priority
          />
        </div>
      </section>

      <section id="podcast" className="section black-bg top-border">
        <div className={styles.podcastGrid}>
          <div>
            <div className="eyebrow">
              <span className="eyebrow-rule" />
              <span className="eyebrow-label">
                A Podcast Network for Career Transitions
              </span>
            </div>
            <h2 className={styles.podcastH2}>
              Life Between
              <br />
              <span className="glitch">Titles.</span>
            </h2>
            <p className={styles.podcastBody}>
              Honest, unscripted stories from people navigating layoffs, career
              pivots, burnout, and identity shifts. Three shows. 40+
              conversations and counting — free everywhere you listen.
            </p>
          </div>
          <div className={styles.episodeCards}>
            {featuredShow ? (
              <a
                href={`https://www.lifebetweentitles.com/shows/${featuredShow.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.spotlightCard}
              >
                <div className={styles.spotlightPhotoWrap}>
                  <Image
                    src={`https://www.lifebetweentitles.com${featuredShow.photo}`}
                    alt={featuredShow.guest}
                    fill
                    sizes="160px"
                    className={styles.spotlightPhoto}
                  />
                </div>
                <div className={styles.spotlightContent}>
                  <div className={styles.spotlightMeta}>
                    <span className={styles.spotlightBadge}>Spotlight</span>
                    <span className={styles.spotlightShow}>
                      {featuredShow.show}
                      {featuredShow.season && featuredShow.episode
                        ? ` · S${String(featuredShow.season).padStart(2, "0")} E${String(featuredShow.episode).padStart(2, "0")}`
                        : ""}
                    </span>
                  </div>
                  <div className={styles.spotlightTitle}>
                    {featuredShow.youtubeTitle}
                  </div>
                  <div className={styles.spotlightGuest}>
                    With {featuredShow.guest}
                  </div>
                </div>
              </a>
            ) : (
              <div className={styles.episodeCard}>
                <div className={styles.episodeMeta}>Life Between Titles</div>
                <div className={styles.episodeTitle}>
                  New episodes every week.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="books" className="section glow-bg">
        <div className="section-head-row">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-rule" />
              <span className="eyebrow-label">Authorship</span>
            </div>
            <h2 className="h2">Books.</h2>
          </div>
          <Link href="/books" className="view-all">
            See all books →
          </Link>
        </div>
        <p className={styles.authorshipIntro}>
          A book series under the Life Between Titles name — starting with the
          practical guide for surviving a layoff, and expanding into a
          standalone memoir and a coloring book for the same in-between space.
        </p>
        <div className={styles.booksTeaserGrid}>
          {bookTeasers.map((book) => (
            <Link key={book.title} href={book.href} className={styles.bookTeaserCard}>
              <div className={styles.bookTeaserStatus}>{book.status}</div>
              <div className={styles.bookTeaserTitle}>{book.title}</div>
              <p className={styles.bookTeaserDesc}>{book.desc}</p>
              <span className={styles.bookTeaserLink}>Learn more →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section black-bg top-border">
        <div className="eyebrow">
          <span className="eyebrow-rule" />
          <span className="eyebrow-label">In the Press</span>
        </div>
        <h2 className="h2" style={{ marginBottom: 46 }}>
          Featured conversations.
        </h2>
        <div className={styles.pressGrid}>
          {pressItems.map((item) => (
            <div key={item.source} className={styles.pressCard}>
              <div className={styles.pressSource}>{item.source}</div>
              <div className={styles.pressHeadline}>{item.headline}</div>
              <p className={styles.pressDesc}>{item.desc}</p>
              <a href="#" className={styles.pressLink}>
                {item.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section id="journal" className="section glow-bg">
        <div className={styles.journalPaper}>
          <div className={styles.journalHeadRow}>
            <div>
              <div className="eyebrow">
                <span className="eyebrow-rule" />
                <span className="eyebrow-label">The Journal</span>
              </div>
              <h2 className="h2">Journal.</h2>
            </div>
            <Link href="/the-latest" className="view-all">
              View all entries →
            </Link>
          </div>
          <div className={styles.journalList}>
            {latestPosts.map((post, i) => (
              <div key={post.slug} className={styles.entry}>
                <div className={styles.entryNum}>
                  Entry No. {String(latestPosts.length - i).padStart(2, "0")}
                </div>
                <div>
                  <div className={styles.entryTitle}>{post.title}</div>
                  <p className={styles.entryExcerpt}>{post.excerpt}</p>
                  <Link href={`/the-latest/${post.slug}`} className={styles.entryLink}>
                    Continue reading →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section black-bg top-border">
        <div className="eyebrow">
          <span className="eyebrow-rule" />
          <span className="eyebrow-label">What People Say</span>
        </div>
        <h2 className="h2" style={{ marginBottom: 46 }}>
          Trusted by leaders.
        </h2>
        <div className={styles.testimonialsGrid}>
          {testimonials.map((t) => (
            <div key={t.name} className={styles.testimonial}>
              <Image
                src={t.photo}
                alt={t.name}
                width={60}
                height={60}
                className={styles.testimonialPhoto}
              />
              <div>
                <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
                <div className={styles.testimonialName}>
                  {t.name}{" "}
                  <span className={styles.testimonialRole}>— {t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
