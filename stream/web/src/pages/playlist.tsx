import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { runtime } from "../api";
import type { Item } from "../api";
import { useAmbient, useJellyfin, useLoad, useMusic } from "../app";
import { listDownloads, offlineArt, onDownloadsChange, removeDownload } from "../offline";
import type { Download } from "../offline";
import { Art, Icon, Message, tileColor } from "../ui";
import { shuffled, TrackList } from "./tracks";

/** A playlist: play, shuffle, remove songs, or delete the whole list. */
export function Playlist({ item }: { item: Item }) {
  const jf = useJellyfin();
  const music = useMusic();
  const navigate = useNavigate();
  const entries = useLoad(() => jf.playlistItems(item.Id), [jf, item.Id]);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useAmbient(jf.poster(item, 320), tileColor(item.Id));

  const all = entries.data ?? [];
  const songs = all.filter((t) => t.Type === "Audio");
  const videos = all.filter((t) => t.Type !== "Audio");
  const total = songs.reduce((sum, t) => sum + (t.RunTimeTicks ?? 0), 0);

  const remove = async (t: Item) => {
    if (!t.PlaylistItemId) return;
    setError(null);
    try {
      await jf.removeFromPlaylist(item.Id, [t.PlaylistItemId]);
      entries.reload();
    } catch {
      setError("Could not remove that song. Try again.");
    }
  };

  const destroy = async () => {
    setError(null);
    try {
      await jf.deleteItem(item.Id);
      navigate("/library/playlists", { replace: true });
    } catch {
      setError("Could not delete this playlist. Your account may not be allowed to.");
      setConfirming(false);
    }
  };

  return (
    <section className="album">
      <div className="album-head">
        <div className="album-art">
          <Art item={item} shape="square" width={600} />
        </div>
        <div className="detail-text">
          <p className="kicker">Playlist</p>
          <h1>{item.Name}</h1>
          <p className="meta">
            {songs.length} {songs.length === 1 ? "song" : "songs"}
            {total ? ` · ${runtime(total)}` : ""}
          </p>
          <div className="actions">
            <button className="btn btn-primary" disabled={!songs.length} onClick={() => music.play(songs, 0)}>
              <Icon name="play" size={18} />
              Play
            </button>
            <button className="btn" disabled={songs.length < 2} onClick={() => music.play(shuffled(songs), 0)}>
              <Icon name="shuffle" size={18} />
              Shuffle
            </button>
            {confirming ? (
              <>
                <button className="btn btn-danger" onClick={destroy}>
                  Delete Playlist
                </button>
                <button className="btn" onClick={() => setConfirming(false)}>
                  Keep
                </button>
              </>
            ) : (
              <button className="btn" onClick={() => setConfirming(true)}>
                <Icon name="trash" size={18} />
                Delete
              </button>
            )}
          </div>
          {confirming && <p className="notice">This deletes the playlist for good. The songs stay in your library.</p>}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
      {entries.error && <Message title="Could not load this playlist">{entries.error}</Message>}
      {entries.data && all.length === 0 && (
        <Message title="This playlist is empty">Open an album and use Add to Playlist, or the plus beside any song.</Message>
      )}
      {songs.length > 0 && (
        <TrackList
          tracks={songs}
          numbered="order"
          action={(t) => (
            <button className="icon-btn" aria-label={`Remove ${t.Name} from this playlist`} onClick={() => remove(t)}>
              <Icon name="close" size={18} />
            </button>
          )}
        />
      )}
      {videos.length > 0 && (
        <ul className="dialog-list">
          {videos.map((v) => (
            <li key={v.PlaylistItemId ?? v.Id}>
              <Link className="tracks-option video-entry" to={`/watch/${v.Id}`}>
                <Icon name="play" size={16} /> {v.SeriesName ? `${v.SeriesName} · ` : ""}
                {v.Name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Albums saved on this device. Everything here works with no connection. */
export function Downloads() {
  const [list, setList] = useState<Download[]>(() => listDownloads());
  useEffect(() => onDownloadsChange(() => setList(listDownloads())), []);

  return (
    <>
      <div className="page-head">
        <h1>Downloads</h1>
        <span className="count">{list.length}</span>
      </div>
      {list.length === 0 && (
        <Message title="Nothing saved on this device yet">
          Open an album and choose Download. Saved albums play here with no connection.
        </Message>
      )}
      {list.map((d) => (
        <SavedAlbum key={d.album.Id} download={d} />
      ))}
    </>
  );
}

function SavedAlbum({ download }: { download: Download }) {
  const music = useMusic();
  const { album, tracks } = download;
  const [cover, setCover] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;
    let live = true;
    offlineArt(album.Id).then((u) => {
      if (live) {
        url = u;
        setCover(u);
      } else if (u) URL.revokeObjectURL(u);
    });
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [album.Id]);

  return (
    <section className="album saved-album">
      <div className="saved-head">
        <div className="saved-art art art-square" style={{ background: tileColor(album.Id) }}>
          {cover ? <img src={cover} alt="" /> : <span className="art-title">{album.Name}</span>}
        </div>
        <div className="detail-text">
          <h2>{album.Name}</h2>
          <p className="meta">
            {[album.AlbumArtist, `${tracks.length} ${tracks.length === 1 ? "song" : "songs"}`].filter(Boolean).join(" · ")}
          </p>
          <div className="actions">
            <button className="btn btn-primary" onClick={() => music.play(tracks, 0)}>
              <Icon name="play" size={18} />
              Play
            </button>
            <button className="btn" disabled={tracks.length < 2} onClick={() => music.play(shuffled(tracks), 0)}>
              <Icon name="shuffle" size={18} />
              Shuffle
            </button>
            <button className="btn" onClick={() => removeDownload(album.Id)}>
              <Icon name="trash" size={18} />
              Remove
            </button>
          </div>
        </div>
      </div>
      <TrackList tracks={tracks} hideArtist={album.AlbumArtist} />
    </section>
  );
}
