import { useState } from "react";
import { Link } from "react-router-dom";
import { runtime, timeLeft } from "../api";
import type { Item } from "../api";
import { useJellyfin, useLoad } from "../app";
import { Art, Icon, Message } from "../ui";

/** Seasons and episodes of a show. A few seasons are tabs; many become a
 *  menu. Each episode is a thumbnail with a play mark, then number, title,
 *  length and a two-line summary. */
export function Seasons({ series }: { series: Item }) {
  const jf = useJellyfin();
  const seasons = useLoad(() => jf.seasons(series.Id), [jf, series.Id]);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const list = seasons.data ?? [];
  const active = seasonId ?? list[0]?.Id ?? null;
  const episodes = useLoad(
    () => (active ? jf.episodes(series.Id, active) : Promise.resolve([] as Item[])),
    [jf, series.Id, active],
  );

  if (seasons.error) return <Message title="Could not load the episodes">{seasons.error}</Message>;

  const count = episodes.data?.length ?? 0;

  return (
    <section className="row">
      <div className="row-head">
        {list.length > 5 ? (
          <label className="sort">
            <span className="sr-only">Season</span>
            <select value={active ?? ""} onChange={(e) => setSeasonId(e.target.value)}>
              {list.map((s) => (
                <option key={s.Id} value={s.Id}>
                  {s.Name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="tabs" role="tablist" aria-label="Seasons">
            {list.map((s) => (
              <button key={s.Id} role="tab" aria-selected={s.Id === active} className="tab" onClick={() => setSeasonId(s.Id)}>
                {s.Name}
              </button>
            ))}
          </div>
        )}
        {episodes.data && (
          <span className="count">
            {count} {count === 1 ? "Episode" : "Episodes"}
          </span>
        )}
      </div>
      {episodes.error && <Message title="Could not load this season">{episodes.error}</Message>}
      <ul className="episodes">
        {(episodes.data ?? []).map((ep) => (
          <li key={ep.Id}>
            <Link to={`/watch/${ep.Id}`} className="episode" aria-label={`Play episode ${ep.IndexNumber ?? ""}: ${ep.Name}`}>
              <span className="episode-art">
                <Art item={ep} shape="wide" width={480} />
                <span className="play-mark" aria-hidden="true">
                  <Icon name="play" size={18} />
                </span>
              </span>
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
