import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Item } from "../api";
import { useJellyfin, useLoad } from "../app";
import { Grid, Icon, Message, Row } from "../ui";

const RECENT = "stream.recentSearches";

function readRecent(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 6) : [];
  } catch {
    return [];
  }
}

function writeRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT, JSON.stringify(list));
  } catch {
    /* not remembered in private mode */
  }
}

const groups: [string, string[]][] = [
  ["Movies", ["Movie"]],
  ["Shows", ["Series"]],
  ["Episodes", ["Episode"]],
  ["Albums", ["MusicAlbum"]],
  ["Artists", ["MusicArtist"]],
  ["Songs", ["Audio"]],
];

/** Search as you type. Before a search it offers recent searches and
 *  recently added titles, so the page is never blank. */
export function Search() {
  const jf = useJellyfin();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [term, setTerm] = useState(q);
  const [recent, setRecent] = useState<string[]>(readRecent);
  const results = useLoad(() => (q ? jf.search(q) : Promise.resolve([] as Item[])), [jf, q]);
  const suggestions = useLoad(() => jf.latest("Movie,Series", 12), [jf]);

  // The address follows what is typed, a moment after typing stops.
  useEffect(() => {
    const next = term.trim();
    if (next === q) return;
    const t = window.setTimeout(() => setParams(next ? { q: next } : {}, { replace: true }), 300);
    return () => window.clearTimeout(t);
  }, [term, q, setParams]);

  // Coming here from the header's search box.
  useEffect(() => {
    setTerm((t) => (t.trim() === q ? t : q));
  }, [q]);

  // A search that found something is worth remembering.
  useEffect(() => {
    if (!q || !results.data?.length) return;
    const t = window.setTimeout(() => {
      setRecent((list) => {
        const next = [q, ...list.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6);
        writeRecent(next);
        return next;
      });
    }, 1500);
    return () => window.clearTimeout(t);
  }, [q, results.data]);

  const clearRecent = () => {
    setRecent([]);
    writeRecent([]);
  };

  const count = results.data?.length ?? 0;

  return (
    <>
      <form className="searchbox searchbox-page" role="search" onSubmit={(e) => e.preventDefault()}>
        <Icon name="search" size={20} />
        <label className="sr-only" htmlFor="q2">
          Search your library
        </label>
        <input
          id="q2"
          type="text"
          inputMode="search"
          placeholder="Movies, shows, albums, artists, songs"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          autoFocus
        />
        {term && (
          <button type="button" className="icon-btn" aria-label="Clear search" onClick={() => setTerm("")}>
            <Icon name="close" size={18} />
          </button>
        )}
      </form>

      {!q && recent.length > 0 && (
        <section className="row">
          <div className="row-head">
            <h2>Recent Searches</h2>
            <button className="quiet-link link-btn" onClick={clearRecent}>
              Clear
            </button>
          </div>
          <div className="chips">
            {recent.map((r) => (
              <button key={r} className="chip" onClick={() => setTerm(r)}>
                {r}
              </button>
            ))}
          </div>
        </section>
      )}
      {!q && <Row title="Recently Added" items={suggestions.data} />}

      {results.error && <Message title="Search did not work">{results.error}</Message>}
      {q && results.data && count === 0 && (
        <Message title={`Nothing found for "${q}"`}>Try a shorter or different word.</Message>
      )}
      {q && count > 0 && (
        <p className="count" role="status">
          {count} {count === 1 ? "Result" : "Results"}
        </p>
      )}
      {q &&
        groups.map(([title, types]) => {
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
