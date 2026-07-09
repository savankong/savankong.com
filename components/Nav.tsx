import Link from "next/link";
import SubscribeBanner from "./SubscribeBanner";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "LBT Podcast", href: "/#podcast" },
  { label: "Books", href: "/books" },
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
    </>
  );
}
