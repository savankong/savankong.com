import Link from "next/link";

const LINKEDIN = "https://www.linkedin.com/in/savankong";

export default function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="wrap">
        <h2 className="footer-h2" data-reveal>Get in touch.</h2>
        <p className="footer-blurb" data-reveal>Speaking, press, podcast guests, Your Roster or Light-Lux.</p>
        <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="pill-filled" data-reveal>
          Message me on LinkedIn
        </a>
        <div className="footer-cols">
          <div>
            <Link href="/your-roster">Your Roster</Link>
            <Link href="/light-lux">Light-Lux</Link>
            <Link href="/ventures">War Room and other ventures</Link>
          </div>
          <div>
            <Link href="/lbt-podcast">Life Between Titles</Link>
            <a href="https://www.youtube.com/@LifeBetweenTitles" target="_blank" rel="noopener noreferrer">YouTube</a>
            <a href="https://open.spotify.com/show/1olZo0VDvHh9w0F2D2vEir" target="_blank" rel="noopener noreferrer">Spotify</a>
          </div>
          <div>
            <Link href="/books">Books</Link>
            <Link href="/the-latest">Journal</Link>
            <a href="https://lifebetweentitles.substack.com" target="_blank" rel="noopener noreferrer">Newsletter</a>
          </div>
          <div>
            <Link href="/about">About</Link>
            <Link href="/speaking">Speaking</Link>
            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
        <p className="footer-made">Made in Longview, Washington.</p>
      </div>
    </footer>
  );
}
