import Link from "next/link";
import SubscribeBanner from "./SubscribeBanner";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Your Roster", href: "/your-roster", color: "#7b9cff" },
  { label: "Light-Lux", href: "/light-lux", color: "#7bafd4" },
  { label: "Podcast", href: "/lbt-podcast", color: "#f2c46d" },
  { label: "Books", href: "/books" },
  { label: "Speaking", href: "/speaking" },
  { label: "Journal", href: "/the-latest" },
];

function Links({ active }: { active: string }) {
  return (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className={`nav-link ${link.color ? "nav-link-product" : ""} ${link.label === active ? "nav-link-active" : ""}`}
          style={link.color ? ({ "--c": link.color } as React.CSSProperties) : undefined}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}

/** `overlay` lets a full-bleed hero run under the bar instead of below it. */
export default function Nav({ active = "Home", overlay = false }: { active?: string; overlay?: boolean }) {
  return (
    <>
      <SubscribeBanner />
      <nav className="nav">
        <Link href="/" className="nav-logo">
          <span className="nav-logo-dot" aria-hidden="true" />
          Savan Kong
        </Link>
        <div className="nav-links">
          <Links active={active} />
        </div>
        <details className="nav-menu">
          <summary>Menu</summary>
          <div className="nav-menu-panel">
            <Links active={active} />
          </div>
        </details>
      </nav>
      <div className={`nav-spacer ${overlay ? "overlay" : ""}`} aria-hidden="true" />
    </>
  );
}
