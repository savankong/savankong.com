import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { runtime } from "../api";
import type { Item } from "../api";
import { useAmbient, useJellyfin, useLoad, useMusic } from "../app";
import { downloadAlbum, isDownloaded, offlineSupported, onDownloadsChange, removeDownload } from "../offline";
import { Art, Icon, Message, tileColor } from "../ui";
import { PlaylistPicker, shuffled, TrackList } from "./tracks";

/** An album: cover, title, Play and Shuffle, saving for offline, adding to a
 *  playlist, then a numbered track table and a closing line of totals. */
export function Album({ item }: { item: Item }) {
  const jf = useJellyfin();
  const music = useMusic();
  const tracks = useLoad(() => jf.tracks(item.Id), [jf, item.Id]);
  const list = tracks.data ?? [];
  const total = list.reduce((sum, t) => sum + (t.RunTimeTicks ?? 0), 0);
  useAmbient(jf.poster(item, 320), tileColor(item.Id));
  const artistId = (item as Item & { AlbumArtists?: { Id: string }[] }).AlbumArtists?.[0]?.Id;

  const [saved, setSaved] = useState(() => isDownloaded(item.Id));
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [picking, setPicking] = useState<{ ids: string[]; label: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setSaved(isDownloaded(item.Id));
    return onDownloadsChange(() => setSaved(isDownloaded(item.Id)));
  }, [item.Id]);

  const toggleDownload = async () => {
    setNotice(null);
    if (saved) {
      await removeDownload(item.Id);
      setNotice("Removed from this device.");
      return;
    }
    try {
      await downloadAlbum(jf, item, list, (done, all) => setProgress([done, all]));
      setNotice("Saved on this device. It is in Downloads.");
    } catch (e) {
      setNotice((e as Error).message || "The download did not finish. Try again.");
    } finally {
      setProgress(null);
    }
  };

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
            {offlineSupported && (
              <button className="btn" disabled={!list.length || progress !== null} aria-pressed={saved} onClick={toggleDownload}>
                <Icon name={saved ? "check" : "download"} size={18} />
                {progress ? `Saving ${progress[0]} of ${progress[1]}` : saved ? "Downloaded" : "Download"}
              </button>
            )}
            <button
              className="btn"
              disabled={!list.length}
              onClick={() => setPicking({ ids: list.map((t) => t.Id), label: `${item.Name}, ${list.length} songs` })}
            >
              <Icon name="plus" size={18} />
              Add to Playlist
            </button>
          </div>
          {notice && (
            <p className="notice" role="status">
              {notice}
            </p>
          )}
        </div>
      </div>
      {tracks.error && <Message title="Could not load the songs">{tracks.error}</Message>}
      {list.length > 0 && (
        <div>
          <TrackList
            tracks={list}
            hideArtist={item.AlbumArtist}
            action={(t) => (
              <button className="icon-btn" aria-label={`Add ${t.Name} to a playlist`} onClick={() => setPicking({ ids: [t.Id], label: t.Name })}>
                <Icon name="plus" size={18} />
              </button>
            )}
          />
          <p className="album-foot">
            {list.length} {list.length === 1 ? "song" : "songs"}, {runtime(total) || "under a minute"}
          </p>
        </div>
      )}
      {picking && (
        <PlaylistPicker
          ids={picking.ids}
          label={picking.label}
          onClose={(message) => {
            setPicking(null);
            if (message) setNotice(message);
          }}
        />
      )}
    </section>
  );
}
