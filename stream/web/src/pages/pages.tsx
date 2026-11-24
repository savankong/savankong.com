import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ApiError, clock, episodeLabel, normalizeServer, runtime, signIn, timeLeft, TICKS_PER_SECOND } from "../api";
import type { Item } from "../api";
import { useAuth, useJellyfin, useLoad, useMusic } from "../app";
import { Art, Card, Grid, Icon, Message, Row } from "../ui";

// ---------- Sign in ----------

export function SignIn() {
  const { setSession } = useAuth();
  const [server, setServer] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setSession(await signIn(server, name, password));
    } catch (err) {
      const status = err instanceof ApiError ? err.status : -1;
      if (status === 401) setError("That name or password is not right.");
      else if (status === 0) {
        const target = normalizeServer(server);
        const blocked = location.protocol === "https:" && target.startsWith("http://");
        setError(
          blocked
            ? "This page is secure (https) and your server address is not, so the browser blocks the connection. Use an https address for the server, or open Stream from an http address on your home network."
            : `Could not reach ${target}. Check the address, that Jellyfin is running, and that this device is on the same network.`,
        );
      } else setError("The server could not sign you in. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="signin">
      <form className="signin-card" onSubmit={submit}>
        <div className="wordmark wordmark-lg">
          <span className="dot" aria-hidden="true" />
          Stream
        </div>
        <p className="lede">Sign in to your Jellyfin server.</p>
        <label className="field">
          <span>Server Address</span>
          <input
            value={server}
            onChange={(e) => setServer(e.target.value)}
            placeholder="192.168.1.20:8096"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />
        </label>
        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoCapitalize="none" autoComplete="username" required />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Signing In" : "Sign In"}
        </button>
      </form>
    </div>
  );
}

// ---------- Home ----------

export function Home() {
  const jf = useJellyfin();
  const resume = useLoad(() => jf.resume(), [jf]);
  const nextUp = useLoad(() => jf.nextUp(), [jf]);
  const movies = useLoad(() => jf.latest("Movie"), [jf]);
  const shows = useLoad(() => jf.latest("Series"), [jf]);
  const albums = useLoad(() => jf.latest("MusicAlbum"), [jf]);

  const failed = resume.error && movies.error && shows.error;
  if (failed) {
    return (
      <Message title="Could not load your library" action={<button className="btn" onClick={() => location.reload()}>Try Again</button>}>
        {movies.error}
      </Message>
    );
  }

  const hero = resume.data?.[0] ?? nextUp.data?.[0] ?? movies.data?.[0] ?? shows.data?.[0] ?? null;
  const resumeIds = new Set((resume.data ?? []).map((i) => i.Id));
  const upNext = (nextUp.data ?? []).filter((i) => !resumeIds.has(i.Id));
  const empty =
    resume.data && movies.data && shows.data && albums.data &&
    !resume.data.length && !movies.data.length && !shows.data.length && !albums.data.length;

  if (empty) {
    return (
      <Message title="Your library is empty">
        Add movie, show or music folders in Jellyfin's dashboard and they will appear here.
      </Message>
    );
  }

  return (
    <>
      {hero && <Hero item={hero} />}
      <Row title="Continue Watching" items={resume.data} wide />
      {upNext.length > 0 && <Row title="Next Up" items={upNext} wide />}
      <Row title="Recently Added Movies" items={movies.data} more="/library/movies" />
      <Row title="Recently Added Shows" items={shows.data} more="/library/shows" />
      <Row title="Recently Added Albums" items={albums.data} more="/library/music" />
    </>
  );
}

function Hero({ item }: { item: Item }) {
  const jf = useJellyfin();
  const backdrop = jf.backdrop(item, 1600);
  const started = (item.UserData?.PlaybackPositionTicks ?? 0) > 0;
  const playable = item.Type === "Movie" || item.Type === "Episode";
  const title = item.Type === "Episode" ? item.SeriesName ?? item.Name : item.Name;
  const meta = [
    item.Type === "Episode" ? `${episodeLabel(item)} · ${item.Name}` : item.ProductionYear,
    runtime(item.RunTimeTicks),
    item.Genres?.[0],
  ].filter(Boolean);
  return (
    <section className="hero" aria-label={started ? "Pick up where you left off" : "Featured"}>
      <div className="hero-text">
        <p className="kicker">{started ? "Pick Up Where You Left Off" : "From Your Library"}</p>
        <h1>{title}</h1>
        <p className="meta">{meta.join(" · ")}</p>
        {started && <ProgressLine item={item} />}
        <div className="actions">
          {playable ? (
            <Link className="btn btn-primary" to={`/watch/${item.Id}`}>
              <Icon name="play" size={18} />
              {started ? "Resume" : "Play"}
            </Link>
          ) : null}
          <Link className="btn" to={`/item/${item.Id}`}>
            Details
          </Link>
        </div>
      </div>
      <div className="hero-art" style={backdrop ? { backgroundImage: `url("${backdrop}")` } : undefined}>
        {!backdrop && <Art item={item} shape="wide" width={1280} />}
      </div>
    </section>
  );
}

function ProgressLine({ item }: { item: Item }) {
  const pct = item.UserData?.PlayedPercentage ?? 0;
  return (
    <div className="progress-line">
      <div className="progress" role="img" aria-label={`${Math.round(pct)} percent watched`}>
        <div style={{ width: `${pct}%` }} />
      </div>
      <span>{timeLeft(item)}</span>
    </div>
  );
}

// ---------- Library ----------

const libraries: Record<string, { title: string; types: string }> = {
  movies: { title: "Movies", types: "Movie" },
  shows: { title: "Shows", types: "Series" },
  music: { title: "Albums", types: "MusicAlbum" },
};

const PAGE = 60;

export function Library() {
  const jf = useJellyfin();
  const { kind = "movies" } = useParams();
  const lib = libraries[kind] ?? libraries.movies;
  const [sort, setSort] = useState("SortName");
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async (start: number) => {
    setBusy(true);
    try {
      const r = await jf.items({
        includeItemTypes: lib.types,
        sortBy: sort,
        sortOrder: sort === "SortName" ? "Ascending" : "Descending",
        startIndex: start,
        limit: PAGE,
      });
      setItems((prev) => (start === 0 ? r.Items : [...prev, ...r.Items]));
      setTotal(r.TotalRecordCount);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    setItems([]);
    setTotal(null);
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, sort, jf]);

  return (
    <>
      <div className="page-head">
        <h1>{lib.title}</h1>
        {total !== null && <span className="count">{total}</span>}
        <label className="sort">
          <span className="sr-only">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="SortName">Name</option>
            <option value="DateCreated">Date Added</option>
            <option value="ProductionYear,SortName">Year</option>
          </select>
        </label>
      </div>
      {error && <Message title="Could not load this library" action={<button className="btn" onClick={() => load(0)}>Try Again</button>}>{error}</Message>}
      {!error && total === 0 && <Message title={`No ${lib.title.toLowerCase()} yet`}>Add a folder for them in Jellyfin's dashboard.</Message>}
      <Grid items={items} />
      {total !== null && items.length < total && (
        <div className="more">
          <button className="btn" disabled={busy} onClick={() => load(items.length)}>
            {busy ? "Loading" : "Show More"}
          </button>
        </div>
      )}
    </>
  );
}

// ---------- Search ----------

export function Search() {
  const jf = useJellyfin();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [term, setTerm] = useState(q);
  const results = useLoad(() => (q ? jf.search(q) : Promise.resolve([] as Item[])), [jf, q]);

  useEffect(() => setTerm(q), [q]);

  const groups: [string, string[]][] = [
    ["Movies", ["Movie"]],
    ["Shows", ["Series"]],
    ["Episodes", ["Episode"]],
    ["Albums", ["MusicAlbum"]],
    ["Artists", ["MusicArtist"]],
    ["Songs", ["Audio"]],
  ];

  return (
    <>
      <form
        className="searchbox searchbox-page"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setParams(term.trim() ? { q: term.trim() } : {});
        }}
      >
        <Icon name="search" size={20} />
        <label className="sr-only" htmlFor="q2">
          Search your library
        </label>
        <input id="q2" type="search" placeholder="Search your library" value={term} onChange={(e) => setTerm(e.target.value)} autoFocus />
      </form>
      {results.error && <Message title="Search did not work">{results.error}</Message>}
      {q && results.data && results.data.length === 0 && <Message title={`Nothing found for "${q}"`}>Try a shorter or different word.</Message>}
      {!q && <Message title="Search your library">Movies, shows, episodes, albums, artists and songs.</Message>}
      {groups.map(([title, types]) => {
        const found = (results.data ?? []).filter((i) => types.includes(i.Type));
        return found.length ? (
          <section className="row" key={title}>
            <div className="row-head">
              <h2>{title}</h2>
            </div>
            <Grid items={found} />
          </section>
        ) : null;
      })}
    </>
  );
}

// ---------- Detail ----------

export function Detail() {
  const jf = useJellyfin();
  const { id = "" } = useParams();
  const { data: item, error, reload } = useLoad(() => jf.item(id), [jf, id]);

  if (error) return <Message title="Could not open this title" action={<button className="btn" onClick={reload}>Try Again</button>}>{error}</Message>;
  if (!item) return <div className="loading">Loading</div>;

  if (item.Type === "MusicAlbum") return <Album item={item} />;
  if (item.Type === "MusicArtist") return <Artist item={item} />;
  if (item.Type === "Season" && item.SeriesId) return <Redirect to={`/item/${item.SeriesId}`} />;
  return <Title item={item} reload={reload} />;
}

function Redirect({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => navigate(to, { replace: true }), [navigate, to]);
  return null;
}

function Title({ item, reload }: { item: Item; reload: () => void }) {
  const jf = useJellyfin();
  const isSeries = item.Type === "Series";
  const playable = item.Type === "Movie" || item.Type === "Episode";
  const started = (item.UserData?.PlaybackPositionTicks ?? 0) > 0;
  const backdrop = jf.backdrop(item, 1600);
  const [busy, setBusy] = useState(false);
  const upNext = useLoad(() => (isSeries ? jf.nextEpisode(item.Id) : Promise.resolve(null)), [jf, item.Id, isSeries]);

  const toggle = async (what: "played" | "favorite") => {
    setBusy(true);
    try {
      if (what === "played") await jf.setPlayed(item.Id, !item.UserData?.Played);
      else await jf.setFavorite(item.Id, !item.UserData?.IsFavorite);
      reload();
    } finally {
      setBusy(false);
    }
  };

  const meta = [
    item.Type === "Episode" ? episodeLabel(item) : null,
    item.ProductionYear,
    runtime(item.RunTimeTicks),
    item.OfficialRating,
    item.Genres?.slice(0, 2).join(", "),
  ].filter(Boolean);

  return (
    <>
      <section className="detail">
        {backdrop && <div className="detail-backdrop" style={{ backgroundImage: `url("${backdrop}")` }} />}
        <div className="detail-body">
          <div className="detail-poster">
            <Art item={item} shape={item.Type === "Episode" ? "wide" : "poster"} width={600} />
          </div>
          <div className="detail-text">
            {item.Type === "Episode" && item.SeriesId && (
              <Link className="quiet-link" to={`/item/${item.SeriesId}`}>
                {item.SeriesName}
              </Link>
            )}
            <h1>{item.Name}</h1>
            <p className="meta">{meta.join(" · ")}</p>
            {started && playable && <ProgressLine item={item} />}
            <div className="actions">
              {playable && (
                <Link className="btn btn-primary" to={`/watch/${item.Id}`}>
                  <Icon name="play" size={18} />
                  {started ? "Resume" : "Play"}
                </Link>
              )}
              {isSeries && upNext.data && (
                <Link className="btn btn-primary" to={`/watch/${upNext.data.Id}`}>
                  <Icon name="play" size={18} />
                  Play {episodeLabel(upNext.data)}
                </Link>
              )}
              {playable && started && (
                <Link className="btn" to={`/watch/${item.Id}?start=0`}>
                  <Icon name="restart" size={18} />
                  Start Over
                </Link>
              )}
              <button className="btn" disabled={busy} aria-pressed={!!item.UserData?.Played} onClick={() => toggle("played")}>
                <Icon name="check" size={18} />
                {item.UserData?.Played ? "Watched" : "Mark Watched"}
              </button>
              <button className="btn" disabled={busy} aria-pressed={!!item.UserData?.IsFavorite} onClick={() => toggle("favorite")}>
                <Icon name="heart" size={18} />
                {item.UserData?.IsFavorite ? "Favorited" : "Favorite"}
              </button>
            </div>
            {item.Overview && <p className="overview">{item.Overview}</p>}
          </div>
        </div>
      </section>
      {isSeries && <Seasons series={item} />}
    </>
  );
}

function Seasons({ series }: { series: Item }) {
  const jf = useJellyfin();
  const seasons = useLoad(() => jf.seasons(series.Id), [jf, series.Id]);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const active = seasonId ?? seasons.data?.[0]?.Id ?? null;
  const episodes = useLoad(
    () => (active ? jf.episodes(series.Id, active) : Promise.resolve([] as Item[])),
    [jf, series.Id, active],
  );

  if (seasons.error) return <Message title="Could not load the episodes">{seasons.error}</Message>;

  return (
    <section className="row">
      <div className="tabs" role="tablist" aria-label="Seasons">
        {(seasons.data ?? []).map((s) => (
          <button key={s.Id} role="tab" aria-selected={s.Id === active} className="tab" onClick={() => setSeasonId(s.Id)}>
            {s.Name}
          </button>
        ))}
      </div>
      <ul className="episodes">
        {(episodes.data ?? []).map((ep) => (
          <li key={ep.Id}>
            <Link to={`/watch/${ep.Id}`} className="episode">
              <Art item={ep} shape="wide" width={480} />
              <span className="episode-text">
                <span className="card-title">
                  {ep.IndexNumber != null ? `${ep.IndexNumber}. ` : ""}
                  {ep.Name}
                </span>
                <span className="card-sub">{[runtime(ep.RunTimeTicks), timeLeft(ep)].filter(Boolean).join(" · ")}</span>
                {ep.Overview && <span className="episode-overview">{ep.Overview}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Album({ item }: { item: Item }) {
  const jf = useJellyfin();
  const music = useMusic();
  const tracks = useLoad(() => jf.tracks(item.Id), [jf, item.Id]);
  const list = tracks.data ?? [];
  const total = list.reduce((sum, t) => sum + (t.RunTimeTicks ?? 0), 0);

  return (
    <section className="album">
      <div className="album-head">
        <div className="album-art">
          <Art item={item} shape="square" width={600} />
        </div>
        <div className="detail-text">
          <p className="kicker">Album</p>
          <h1>{item.Name}</h1>
          <p className="meta">
            {[item.AlbumArtist, item.ProductionYear, list.length ? `${list.length} songs` : null, runtime(total)].filter(Boolean).join(" · ")}
          </p>
          <div className="actions">
            <button className="btn btn-primary" disabled={!list.length} onClick={() => music.play(list, 0)}>
              <Icon name="play" size={18} />
              Play
            </button>
          </div>
        </div>
      </div>
      {tracks.error && <Message title="Could not load the songs">{tracks.error}</Message>}
      <ol className="tracks">
        {list.map((t, i) => {
          const playing = music.current?.Id === t.Id;
          return (
            <li key={t.Id}>
              <button className={`track ${playing ? "track-on" : ""}`} onClick={() => music.play(list, i)} aria-current={playing}>
                <span className="track-no">{playing ? <Icon name="music" size={16} /> : t.IndexNumber ?? i + 1}</span>
                <span className="track-name">{t.Name}</span>
                <span className="track-time">{clock((t.RunTimeTicks ?? 0) / TICKS_PER_SECOND)}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Artist({ item }: { item: Item }) {
  const jf = useJellyfin();
  const albums = useLoad(
    () => jf.items({ albumArtistIds: item.Id, includeItemTypes: "MusicAlbum", sortBy: "ProductionYear,SortName", sortOrder: "Descending" }),
    [jf, item.Id],
  );
  return (
    <>
      <div className="page-head">
        <h1>{item.Name}</h1>
      </div>
      {albums.error && <Message title="Could not load the albums">{albums.error}</Message>}
      {albums.data && albums.data.Items.length === 0 && <Message title="No albums for this artist" />}
      <div className="grid">{(albums.data?.Items ?? []).map((a) => <Card key={a.Id} item={a} />)}</div>
    </>
  );
}
