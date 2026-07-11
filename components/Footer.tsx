import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer id="about" className="footer glow-bg top-border">
      <div className="footer-top">
        <div>
          <h2 className="footer-h2">
            Let&rsquo;s <span className="glitch">connect.</span>
          </h2>
          <p className="footer-blurb">
            Reach out about speaking, press, sponsorships, or just to say hi.
          </p>
        </div>
        <div className="footer-photo">
          <Image
            src="https://images.squarespace-cdn.com/content/v1/67d45a59e5abd35cf0bf7d15/1750d3c6-517b-4d55-9972-7e34ab46cdcb/9999396F-17FA-4133-B6F1-B99D197B02D7_1_105_c.jpeg"
            alt="Savan Kong"
            width={110}
            height={110}
          />
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-made">Made with ❤️ in Longview, WA</span>
        <div className="footer-links">
          <a href="https://linkedin.com" className="footer-link">
            LinkedIn
          </a>
          <a href="https://lifebetweentitles.com" className="footer-link">
            Life Between Titles
          </a>
          <Link href="/the-latest" className="footer-link">
            The Journal
          </Link>
          <Link href="/speaking" className="footer-link">
            Speaking
          </Link>
          <Link href="/apps" className="footer-link">
            Apps
          </Link>
        </div>
      </div>
    </footer>
  );
}
