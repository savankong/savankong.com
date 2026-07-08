import Image from "next/image";
import styles from "./page.module.css";

const navLinks = [
  { label: "Home", href: "#", active: true },
  { label: "The Latest", href: "#journal" },
  { label: "Podcast", href: "#podcast" },
  { label: "Book", href: "#book" },
  { label: "About", href: "#about" },
];

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

const journalEntries = [
  {
    num: "04",
    title: "The Compliance Gap That's Costing Us the Mission",
    excerpt:
      "The hardest part of running customer experience for the Department of Defense wasn't the scale of the mission. It was trying to hear from the people doing it — with tools that weren't cleared to hold what they said.",
  },
  {
    num: "03",
    title: "The Silence Between Jobs: Finding Voice in the Search",
    excerpt:
      "Every job search carries a story. Behind every resume, application, or unanswered email is a person navigating hope, uncertainty, and the daily challenge of staying resilient.",
  },
  {
    num: "02",
    title:
      "If You Want to Become a Better Leader, AI Cannot Teach You the Skills That Matter Most",
    excerpt:
      "Machines can scan résumés in seconds and evaluate communication patterns. But they cannot fully grasp how a leader builds trust during moments of crisis.",
  },
  {
    num: "01",
    title: "Translating DoD Experience into Private Sector Success",
    excerpt:
      "I recently stepped away from my role as the Department of Defense's first Customer Experience Officer, and like many who have spent years in public service, I am now navigating what comes next.",
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

export default function Home() {
  return (
    <>
      <nav className={styles.nav}>
        <span className={styles.navLogo}>Savan Kong</span>
        <div className={styles.navLinks}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`${styles.navLink} ${
                link.active ? styles.navLinkActive : ""
              }`}
            >
              {link.label}
            </a>
          ))}
          <a href="#podcast" className={styles.navCta}>
            Listen
          </a>
        </div>
      </nav>

      <section className={`${styles.hero} ${styles.glowBg}`}>
        <div className={styles.heroText}>
          <h1 className={styles.heroH1}>
            Savanrith <span className={styles.glitch}>&ldquo;Savan&rdquo;</span> Kong
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
          <div className={styles.heroCtas}>
            <a
              href="#podcast"
              className={`${styles.pillFilled} ${styles.heroCtaListen}`}
            >
              ▶ Listen to the Podcast
            </a>
            <a href="#book" className={styles.pillOutline}>
              Get the Book
            </a>
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

      <section
        id="podcast"
        className={`${styles.section} ${styles.blackBg} ${styles.topBorder}`}
      >
        <div className={styles.podcastGrid}>
          <div>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowRule} />
              <span className={styles.eyebrowLabel}>
                A Podcast Network for Career Transitions
              </span>
            </div>
            <h2 className={styles.podcastH2}>
              Life Between
              <br />
              <span className={styles.glitch}>Titles.</span>
            </h2>
            <p className={styles.podcastBody}>
              Honest, unscripted stories from people navigating layoffs, career
              pivots, burnout, and identity shifts. Three shows. 40+
              conversations and counting — free everywhere you listen.
            </p>
            <div className={styles.podcastLinks}>
              <a
                href="https://open.spotify.com"
                className={`${styles.pillFilled} ${styles.podcastLinkFilled}`}
              >
                Spotify
              </a>
              <a
                href="https://podcasts.apple.com"
                className={`${styles.pillOutline} ${styles.podcastLinkOutline}`}
              >
                Apple
              </a>
              <a
                href="https://youtube.com"
                className={`${styles.pillOutline} ${styles.podcastLinkOutline}`}
              >
                YouTube
              </a>
            </div>
          </div>
          <div className={styles.episodeCards}>
            <div className={styles.episodeCard}>
              <div className={styles.episodeMeta}>Latest · S03 E01</div>
              <div className={styles.episodeTitle}>
                The &lsquo;F*** Yes&rsquo; Philosophy
              </div>
            </div>
            <div className={styles.episodeCard}>
              <div className={styles.episodeMeta}>Work, Unscripted</div>
              <div className={styles.episodeTitle}>
                He Booked Kim Kardashian at 15
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="book" className={`${styles.section} ${styles.glowBg}`}>
        <div className={styles.bookGrid}>
          <div className={styles.bookCoverWrap}>
            <div className={styles.bookCover}>
              <Image
                src="https://www.lifebetweentitles.com/Cover-LaidOff.jpg"
                alt="Laid Off and Lost book cover"
                width={280}
                height={420}
              />
            </div>
          </div>
          <div>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowRule} />
              <span className={styles.eyebrowLabel}>New Book · Now Available</span>
            </div>
            <h2 className={styles.bookH2}>
              Laid Off <span className={styles.glitch}>and Lost.</span>
            </h2>
            <p className={styles.bookBody}>
              The whole truth about what happens when the career ends and nobody
              talks about it: the identity crisis, the isolation, and the
              process of clarifying what you&rsquo;re actually trying to
              rebuild.
            </p>
            <p className={styles.bookBody}>
              Written from inside the transition itself. Savan was unemployed
              for a year after leaving the DoD, received an ADHD diagnosis at
              46, and wrote every page while still figuring it out. Each
              chapter ends with a <strong>Try This</strong> section.
            </p>
            <div className={styles.bookCtas}>
              <a href="#" className={styles.pillFilled}>
                Kindle →
              </a>
              <a href="#" className={styles.pillOutline}>
                Paperback →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.blackBg} ${styles.topBorder}`}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowRule} />
          <span className={styles.eyebrowLabel}>In the Press</span>
        </div>
        <h2 className={styles.h2} style={{ marginBottom: 46 }}>
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

      <section id="journal" className={`${styles.section} ${styles.glowBg}`}>
        <div className={styles.sectionHeadRow}>
          <div>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowRule} />
              <span className={styles.eyebrowLabel}>The Latest</span>
            </div>
            <h2 className={styles.h2}>Journal.</h2>
          </div>
          <a href="#" className={styles.viewAll}>
            View all entries →
          </a>
        </div>
        <div className={styles.journalList}>
          {journalEntries.map((entry, i) => (
            <div
              key={entry.num}
              className={`${styles.entry} ${i === 0 ? styles.entryFirst : ""}`}
            >
              <div className={styles.entryNum}>Entry No. {entry.num}</div>
              <div>
                <div className={styles.entryTitle}>{entry.title}</div>
                <p className={styles.entryExcerpt}>{entry.excerpt}</p>
                <a href="#" className={styles.entryLink}>
                  Continue reading →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.blackBg} ${styles.topBorder}`}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowRule} />
          <span className={styles.eyebrowLabel}>What People Say</span>
        </div>
        <h2 className={styles.h2} style={{ marginBottom: 46 }}>
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

      <footer
        id="about"
        className={`${styles.footer} ${styles.glowBg} ${styles.topBorder}`}
      >
        <div className={styles.footerTop}>
          <div>
            <h2 className={styles.footerH2}>
              Let&rsquo;s <span className={styles.glitch}>connect.</span>
            </h2>
            <p className={styles.footerBlurb}>
              Reach out about speaking, press, sponsorships, or just to say hi.
            </p>
          </div>
          <div className={styles.footerPhoto}>
            <Image
              src="https://images.squarespace-cdn.com/content/v1/67d45a59e5abd35cf0bf7d15/1750d3c6-517b-4d55-9972-7e34ab46cdcb/9999396F-17FA-4133-B6F1-B99D197B02D7_1_105_c.jpeg"
              alt="Savan Kong"
              width={110}
              height={110}
            />
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span className={styles.footerMade}>Made with ❤️ in Longview, WA</span>
          <div className={styles.footerLinks}>
            <a href="https://linkedin.com" className={styles.footerLink}>
              LinkedIn
            </a>
            <a
              href="https://lifebetweentitles.com"
              className={styles.footerLink}
            >
              Life Between Titles
            </a>
            <a href="#journal" className={styles.footerLink}>
              The Latest
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
