import Link from "next/link";
import SubscribeBanner from "./SubscribeBanner";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Speaking", href: "/speaking" },
  { label: "LBT Podcast", href: "/lbt-podcast" },
  { label: "Books", href: "/books" },
  { label: "The Journal", href: "/the-latest" },
  { label: "Apps", href: "/apps" },
];

export default function Nav({ active = "Home" }: { active?: string }) {
  return (
    <>
      <SubscribeBanner />
      <nav className="nav">
        <Link href="/" className="nav-logo">
          Savan Kong
        </Link>
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`nav-link ${link.label === active ? "nav-link-active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className="nav-spacer" aria-hidden="true" />
    </>
  );
}
