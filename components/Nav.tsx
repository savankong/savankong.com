import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "The Latest", href: "/the-latest" },
  { label: "Podcast", href: "/#podcast" },
  { label: "Books", href: "/books" },
  { label: "About", href: "/about" },
];

export default function Nav({ active = "Home" }: { active?: string }) {
  return (
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
        <Link href="/#podcast" className="nav-cta">
          Listen
        </Link>
      </div>
    </nav>
  );
}
