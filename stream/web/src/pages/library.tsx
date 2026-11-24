import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import type { Item } from "../api";
import { useJellyfin, useLoad } from "../app";
import { Grid, Message } from "../ui";

const libraries: Record<string, { title: string; types: string; watchable: boolean }> = {
  movies: { title: "Movies", types: "Movie", watchable: true },
  shows: { title: "Shows", types: "Series", watchable: true },
  music: { title: "Albums", types: "MusicAlbum", watchable: false },
  playlists: { title: "Playlists", types: "Playlist", watchable: false },
};

const PAGE = 60;

/** A library grid with a row of genre chips to narrow it and a sort menu. */
export function Library() {
  const jf = useJellyfin();
  const { kind = "movies" } = useParams();
  const lib = libraries[kind] ?? libraries.movies;
  const [sort, setSort] = useState("SortName");
  const [genre, setGenre] = useState<string | null>(null);
  const [unwatched, setUnwatched] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const genres = useLoad(() => jf.genres(lib.types), [jf, lib.types]);

  const load = async (start: number) => {
    setBusy(true);
    try {
      const r = await jf.items({
        includeItemTypes: lib.types,
        sortBy: sort,
        sortOrder: sort === "SortName" ? "Ascending" : "Descending",
        genres: genre ?? undefined,
        filters: unwatched && lib.watchable ? "IsUnplayed" : undefined,
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

  // A different library starts with no filters.
  useEffect(() => {
    setGenre(null);
    setUnwatched(false);
  }, [kind]);

  useEffect(() => {
    setItems([]);
    setTotal(null);
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, sort, genre, unwatched, jf]);

  const filtered = genre !== null || unwatched;

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
      {(kind === "music" || kind === "playlists") && (
        <nav className="chips" aria-label="Music">
          <NavLink className="chip" to="/library/music">
            Albums
          </NavLink>
          <NavLink className="chip" to="/library/playlists">
            Playlists
          </NavLink>
          <NavLink className="chip" to="/downloads">
            Downloads
          </NavLink>
        </nav>
      )}
      {kind !== "playlists" && ((genres.data && genres.data.length > 0) || lib.watchable) && (
        <div className="chips" role="group" aria-label="Filter">
          <button className="chip" aria-pressed={!filtered} onClick={() => { setGenre(null); setUnwatched(false); }}>
            All
          </button>
          {lib.watchable && (
            <button className="chip" aria-pressed={unwatched} onClick={() => setUnwatched((v) => !v)}>
              Unwatched
            </button>
          )}
          {(genres.data ?? []).map((g) => (
            <button key={g} className="chip" aria-pressed={genre === g} onClick={() => setGenre(genre === g ? null : g)}>
              {g}
            </button>
          ))}
        </div>
      )}
      {error && (
        <Message title="Could not load this library" action={<button className="btn" onClick={() => load(0)}>Try Again</button>}>
          {error}
        </Message>
      )}
      {!error && total === 0 && !filtered && (
        <Message title={`No ${lib.title.toLowerCase()} yet`}>
          {kind === "playlists"
            ? "Open an album and use Add to Playlist to start one."
            : "Add a folder for them in Jellyfin's dashboard."}
        </Message>
      )}
      {!error && total === 0 && filtered && (
        <Message title="Nothing matches these filters" action={<button className="btn" onClick={() => { setGenre(null); setUnwatched(false); }}>Clear Filters</button>} />
      )}
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
