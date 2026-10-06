import Image from "next/image";
import Link from "next/link";
import ShaderCanvas from "./ShaderCanvas";

export default function Footer() {
  return (
    <footer id="contact" className="footer top-border">
      <div className="footer-glow" aria-hidden="true">
        <ShaderCanvas shader="aurora" speed={0.6} maxDpr={1} />
      </div>
      <div className="footer-inner">
        <div className="footer-top">
          <div data-reveal>
            <h2 className="footer-h2">
              Let&rsquo;s <span className="lit">talk.</span>
            </h2>
            <p className="footer-blurb">
              Speaking, press, podcast guests, Your Roster or Light-Lux, or
              just to say hi.
            </p>
            <a href="https://www.linkedin.com/in/savankong" target="_blank" rel="noopener noreferrer" className="pill-filled">
              Message me on LinkedIn →
            </a>
          </div>
          <div className="footer-photo" data-reveal="scale">
            <Image
              src="/savan-cutout.png"
              alt="Savan Kong"
              width={140}
              height={140}
            />
          </div>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <div className="footer-col-title">Building</div>
            <Link href="/your-roster">Your Roster</Link>
            <Link href="/light-lux">Light-Lux</Link>
            <Link href="/ventures">All ventures</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Hosting</div>
            <Link href="/lbt-podcast">Life Between Titles</Link>
            <a href="https://www.youtube.com/@LifeBetweenTitles" target="_blank" rel="noopener noreferrer">YouTube</a>
            <a href="https://open.spotify.com/show/1olZo0VDvHh9w0F2D2vEir" target="_blank" rel="noopener noreferrer">Spotify</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Writing</div>
            <Link href="/books">Books</Link>
            <Link href="/the-latest">The Journal</Link>
            <a href="https://lifebetweentitles.substack.com" target="_blank" rel="noopener noreferrer">Newsletter</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Me</div>
            <Link href="/about">About</Link>
            <Link href="/speaking">Speaking</Link>
            <a href="https://www.linkedin.com/in/savankong" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-made">Made in Longview, WA · © {new Date().getFullYear()} Savan Kong</span>
          <span className="footer-made">CEO &amp; Co-Founder, Your Roster · Creator, Light-Lux · Host, Life Between Titles</span>
        </div>
      </div>
    </footer>
  );
}
