import Link from "next/link";
import SubscribeBanner from "./SubscribeBanner";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Your Roster", href: "/your-roster" },
  { label: "Light-Lux", href: "/light-lux" },
  { label: "Podcast", href: "/lbt-podcast" },
  { label: "Books", href: "/books" },
  { label: "Speaking", href: "/speaking" },
  { label: "Journal", href: "/the-latest" },
];

type Cta = { label: string; href: string };

function Links({ active }: { active: string }) {
  return (
    <>
      {navLinks.map((link) => (
        <Link key={link.label} href={link.href} className={`nav-link ${link.label === active ? "nav-link-active" : ""}`}>
          {link.label}
        </Link>
      ))}
    </>
  );
}

/** `cta` swaps the Contact button for a product's own action. */
export default function Nav({ active = "Home", cta }: { active?: string; cta?: Cta }) {
  const action = cta ?? { label: "Contact", href: "#contact" };
  const external = action.href.startsWith("http");
  return (
    <>
      <SubscribeBanner />
      <nav className="nav">
        <div className="wrap nav-inner">
          <Link href="/" className="nav-logo">
            Savan Kong
          </Link>
          <div className="nav-links">
            <Links active={active} />
          </div>
          <a
            href={action.href}
            className={`nav-cta ${cta ? "btn btn-sm" : "pill-outline btn-sm"}`}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            {action.label}
          </a>
          <details className="nav-menu">
            <summary>Menu</summary>
            <div className="nav-menu-panel">
              <Link href="/" className="nav-link">Home</Link>
              <Links active={active} />
              <a href="#contact" className="nav-link">Contact</a>
            </div>
          </details>
        </div>
      </nav>
      <div className="nav-spacer" aria-hidden="true" />
    </>
  );
}
