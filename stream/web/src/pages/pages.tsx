import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { episodeLabel, runtime, timeLeft } from "../api";
import type { Item } from "../api";
import { useAmbient, useJellyfin, useLoad } from "../app";
import { Art, Card, Icon, Message, Row, tileColor } from "../ui";
import { Album } from "./album";
import { Seasons } from "./show";

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
  useAmbient(jf.backdrop(item, 480) ?? jf.poster(item, 320), tileColor(item.Id));
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

export function ProgressLine({ item }: { item: Item }) {
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
  useAmbient(jf.backdrop(item, 480) ?? jf.poster(item, 320), tileColor(item.Id));
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
