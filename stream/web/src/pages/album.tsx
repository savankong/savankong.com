import { Link } from "react-router-dom";
import { clock, runtime, TICKS_PER_SECOND } from "../api";
import type { Item } from "../api";
import { useAmbient, useJellyfin, useLoad, useMusic } from "../app";
import { Art, Icon, Message, tileColor } from "../ui";

function shuffled<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** An album: cover, title, Play and Shuffle, then a numbered track table
 *  with a header row and a closing line of totals. */
export function Album({ item }: { item: Item }) {
  const jf = useJellyfin();
  const music = useMusic();
  const tracks = useLoad(() => jf.tracks(item.Id), [jf, item.Id]);
  const list = tracks.data ?? [];
  const total = list.reduce((sum, t) => sum + (t.RunTimeTicks ?? 0), 0);
  useAmbient(jf.poster(item, 320), tileColor(item.Id));
  const artistId = (item as Item & { AlbumArtists?: { Id: string }[] }).AlbumArtists?.[0]?.Id;

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
            {artistId ? (
              <Link className="text-link" to={`/item/${artistId}`}>
                {item.AlbumArtist}
              </Link>
            ) : (
              item.AlbumArtist
            )}
            {[item.ProductionYear, item.Genres?.[0]].filter(Boolean).map((x) => ` · ${x}`)}
          </p>
          <div className="actions">
            <button className="btn btn-primary" disabled={!list.length} onClick={() => music.play(list, 0)}>
              <Icon name="play" size={18} />
              Play
            </button>
            <button className="btn" disabled={list.length < 2} onClick={() => music.play(shuffled(list), 0)}>
              <Icon name="shuffle" size={18} />
              Shuffle
            </button>
          </div>
        </div>
      </div>
      {tracks.error && <Message title="Could not load the songs">{tracks.error}</Message>}
      {list.length > 0 && (
        <div>
          <div className="track track-head" aria-hidden="true">
            <span className="track-no">#</span>
            <span className="track-name">Title</span>
            <span className="track-time">Time</span>
          </div>
          <ol className="tracks">
            {list.map((t, i) => {
              const playing = music.current?.Id === t.Id;
              const artist = t.Artists?.join(", ");
              return (
                <li key={t.Id}>
                  <button className={`track ${playing ? "track-on" : ""}`} onClick={() => music.play(list, i)} aria-current={playing}>
                    <span className="track-no">{playing ? <Icon name="music" size={16} /> : t.IndexNumber ?? i + 1}</span>
                    <span className="track-name">
                      <span className="track-title">{t.Name}</span>
                      {artist && artist !== item.AlbumArtist && <span className="card-sub">{artist}</span>}
                    </span>
                    <span className="track-time">{clock((t.RunTimeTicks ?? 0) / TICKS_PER_SECOND)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="album-foot">
            {list.length} {list.length === 1 ? "song" : "songs"}, {runtime(total) || "under a minute"}
          </p>
        </div>
      )}
    </section>
  );
}
