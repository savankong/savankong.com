import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { clock, episodeLabel, timeLeft, TICKS_PER_SECOND } from "./api";
import type { Item } from "./api";
import { useAuth, useJellyfin, useMusic } from "./app";

// ---------- Icons (24 grid) ----------

const paths: Record<string, ReactNode> = {
  play: <path d="M7 4l13 8-13 8z" fill="currentColor" stroke="none" />,
  pause: <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" stroke="none" />,
  next: <path d="M16 5h2v14h-2zM4 5l11 7-11 7z" fill="currentColor" stroke="none" />,
  previous: <path d="M6 5h2v14H6zM20 5v14L9 12z" fill="currentColor" stroke="none" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
  home: <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  film: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <path d="M8 4v16M16 4v16M3 12h18" />
    </>
  ),
  tv: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="1" />
      <path d="M8 2l4 4 4-4" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </>
  ),
  back: <path d="M15 5l-7 7 7 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 12l5 5 9-10" />,
  heart: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.500-7 10-7 10z" />,
  restart: <path d="M4 12a8 8 0 1 0 3-6.200M4 4v4h4" />,
  forward: <path d="M20 12a8 8 0 1 1-3-6.200M20 4v4h-4" />,
  eye: (
    <>
      <path d="M2 12s3.500-7 10-7 10 7 10 7-3.500 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M4 4l16 16M10 6a9 9 0 0 1 2-.200c6.500 0 10 6.200 10 6.200a17 17 0 0 1-3 3.800M6.500 7.500A17 17 0 0 0 2 12s3.500 7 10 7a9 9 0 0 0 4-.900" />
    </>
  ),
  shuffle: <path d="M3 7h3l10 10h5M3 17h3l3-3M13 10l3-3h5M18 4l3 3-3 3M18 14l3 3-3 3" />,
  volume: <path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.500 6.500a8 8 0 0 1 0 11" />,
  mute: <path d="M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6" />,
  fullscreen: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  captions: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M7 12h3M7 15h6M14 12h3" />
    </>
  ),
};

export function Icon({ name, size = 20 }: { name: keyof typeof paths | string; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

// ---------- Cards ----------

const tiles = ["#26333d", "#4a2f2a", "#2f4a3c", "#473a5c", "#5a4a2a", "#26444d", "#5a2f3f", "#3a3f52"];

function tileColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return tiles[h % tiles.length];
}

export function Art({ item, shape, width = 400 }: { item: Item; shape: "poster" | "square" | "wide"; width?: number }) {
  const jf = useJellyfin();
  const [failed, setFailed] = useState(false);
  const src = shape === "wide" ? jf.backdrop(item, width) ?? jf.poster(item, width) : jf.poster(item, width);
  const pct = item.UserData?.PlayedPercentage;
  return (
    <div className={`art art-${shape}`} style={{ background: tileColor(item.Id) }}>
      {src && !failed ? (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span className="art-title">{item.SeriesName && shape === "wide" ? item.SeriesName : item.Name}</span>
      )}
      {item.UserData?.Played && !pct && <span className="badge" aria-label="Watched"><Icon name="check" size={14} /></span>}
      {pct ? (
        <div className="progress progress-flush" role="img" aria-label={`${Math.round(pct)} percent watched`}>
          <div style={{ width: `${pct}%` }} />
        </div>
      ) : null}
    </div>
  );
}

function shapeFor(item: Item): "poster" | "square" {
  return item.Type === "MusicAlbum" || item.Type === "Audio" || item.Type === "MusicArtist" ? "square" : "poster";
}

function subtitle(item: Item): string {
  switch (item.Type) {
    case "Movie":
      return item.ProductionYear ? String(item.ProductionYear) : "";
    case "Series":
      return item.ProductionYear ? String(item.ProductionYear) : "";
    case "MusicAlbum":
      return item.AlbumArtist ?? "";
    case "Audio":
      return item.Artists?.join(", ") ?? item.AlbumArtist ?? "";
    case "Episode":
      return [item.SeriesName, episodeLabel(item)].filter(Boolean).join(" · ");
    default:
      return "";
  }
}

/** A tile for any library item. Songs play in place; everything else opens its page. */
export function Card({ item, wide = false }: { item: Item; wide?: boolean }) {
  const music = useMusic();
  const shape = wide ? "wide" : shapeFor(item);
  const body = (
    <>
      <Art item={item} shape={shape} width={wide ? 640 : 400} />
      <span className="card-text">
        <span className="card-title">{wide && item.Type === "Episode" ? item.SeriesName ?? item.Name : item.Name}</span>
        <span className="card-sub">
          {wide
            ? [item.Type === "Episode" ? episodeLabel(item) : "", timeLeft(item)].filter(Boolean).join(" · ")
            : subtitle(item)}
        </span>
      </span>
    </>
  );
  if (item.Type === "Audio") {
    return (
      <button className="card" onClick={() => music.play([item], 0)}>
        {body}
      </button>
    );
  }
  return (
    <Link className="card" to={`/item/${item.Id}`}>
      {body}
    </Link>
  );
}

export function Row({ title, items, wide = false, more }: { title: string; items: Item[] | null; wide?: boolean; more?: string }) {
  if (items && items.length === 0) return null;
  return (
    <section className="row">
      <div className="row-head">
        <h2>{title}</h2>
        {more && (
          <Link className="quiet-link" to={more}>
            See All
          </Link>
        )}
      </div>
      <div className={`scroller ${wide ? "scroller-wide" : ""}`}>
        {items
          ? items.map((it) => <Card key={it.Id} item={it} wide={wide} />)
          : Array.from({ length: 6 }, (_, i) => <div key={i} className={`skeleton ${wide ? "skeleton-wide" : ""}`} />)}
      </div>
    </section>
  );
}

export function Grid({ items }: { items: Item[] }) {
  return (
    <div className="grid">
      {items.map((it) => (
        <Card key={it.Id} item={it} />
      ))}
    </div>
  );
}

export function Message({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="message">
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

// ---------- Shell ----------

const sections = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/library/movies", label: "Movies", icon: "film" },
  { to: "/library/shows", label: "Shows", icon: "tv" },
  { to: "/library/music", label: "Music", icon: "music" },
];

export function Shell({ children }: { children: ReactNode }) {
  const { jf, setSession } = useAuth();
  const music = useMusic();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [menu, setMenu] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (term.trim()) navigate(`/search?q=${encodeURIComponent(term.trim())}`);
  };

  const signOut = async () => {
    // Let the player tell the server it stopped before the sign-in is revoked.
    music.stop();
    await new Promise((r) => setTimeout(r, 150));
    await jf?.signOut();
    setSession(null);
  };

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="wordmark">
          <span className="dot" aria-hidden="true" />
          Stream
        </Link>
        <nav className="topnav" aria-label="Library">
          {sections.map((s) => (
            <NavLink key={s.to} to={s.to} end={s.to === "/"}>
              {s.label}
            </NavLink>
          ))}
        </nav>
        <form className="searchbox" role="search" onSubmit={submit}>
          <Icon name="search" size={18} />
          <label className="sr-only" htmlFor="q">
            Search your library
          </label>
          <input id="q" type="search" placeholder="Search your library" value={term} onChange={(e) => setTerm(e.target.value)} />
        </form>
        <div className="account">
          <button className="avatar" aria-label="Account" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
            {(jf?.session.userName ?? "?").slice(0, 1).toUpperCase()}
          </button>
          {menu && (
            <div className="menu">
              <p>
                Signed in as <strong>{jf?.session.userName}</strong>
              </p>
              <p className="menu-server">{jf?.session.server}</p>
              <button className="btn" onClick={signOut}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="page">{children}</main>
      <MusicBar />
      <nav className="tabbar" aria-label="Main">
        {sections.map((s) => (
          <NavLink key={s.to} to={s.to} end={s.to === "/"}>
            <Icon name={s.icon} size={24} />
            {s.label}
          </NavLink>
        ))}
        <NavLink to="/search">
          <Icon name="search" size={24} />
          Search
        </NavLink>
      </nav>
    </div>
  );
}

// ---------- Now playing bar ----------

export function MusicBar() {
  const jf = useJellyfin();
  const m = useMusic();
  if (!m.current) return null;
  const total =
    isFinite(m.duration) && m.duration > 0 ? m.duration : (m.current.RunTimeTicks ?? 0) / TICKS_PER_SECOND;
  const art = jf.poster(m.current, 120);
  return (
    <footer className="musicbar" aria-label="Now playing">
      <div className="musicbar-track">
        {art ? <img src={art} alt="" /> : <span className="musicbar-art" />}
        <div className="musicbar-text">
          <div className="card-title">{m.current.Name}</div>
          <div className="card-sub">{m.current.Artists?.join(", ") || m.current.AlbumArtist}</div>
        </div>
      </div>
      <div className="musicbar-controls">
        <button className="icon-btn" aria-label="Previous track" onClick={m.previous}>
          <Icon name="previous" size={22} />
        </button>
        <button className="icon-btn icon-btn-solid" aria-label={m.playing ? "Pause" : "Play"} onClick={m.toggle}>
          <Icon name={m.playing ? "pause" : "play"} size={20} />
        </button>
        <button className="icon-btn" aria-label="Next track" onClick={m.next} disabled={m.index >= m.queue.length - 1}>
          <Icon name="next" size={22} />
        </button>
      </div>
      <div className="musicbar-seek">
        <span>{clock(m.position)}</span>
        <input
          type="range"
          aria-label="Seek"
          min={0}
          max={Math.max(total, 1)}
          step={1}
          value={Math.min(m.position, Math.max(total, 1))}
          onChange={(e) => m.seek(Number(e.target.value))}
        />
        <span>{clock(total)}</span>
      </div>
      <button className="icon-btn" aria-label="Stop and close player" onClick={m.stop}>
        <Icon name="close" size={20} />
      </button>
    </footer>
  );
}
