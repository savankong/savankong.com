import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { clock, TICKS_PER_SECOND } from "../api";
import type { Item } from "../api";
import { useJellyfin, useLoad, useMusic } from "../app";
import { Icon } from "../ui";

export function shuffled<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** A numbered song table shared by albums, playlists and downloads. */
export function TrackList({
  tracks,
  hideArtist,
  numbered = "track",
  action,
}: {
  tracks: Item[];
  /** An artist name not worth repeating on every row (the album's own artist). */
  hideArtist?: string;
  /** "track" uses each song's album number, "order" counts from one. */
  numbered?: "track" | "order";
  action?: (track: Item, index: number) => ReactNode;
}) {
  const music = useMusic();
  return (
    <div>
      <div className="track-row track-head" aria-hidden="true">
        <span className="track">
          <span className="track-no">#</span>
          <span className="track-name">Title</span>
          <span className="track-time">Time</span>
        </span>
        {action && <span className="track-action" />}
      </div>
      <ol className="tracks">
        {tracks.map((t, i) => {
          const playing = music.current?.Id === t.Id;
          const artist = t.Artists?.join(", ") || t.AlbumArtist;
          return (
            <li key={(t.PlaylistItemId ?? t.Id) + i} className="track-row">
              <button className={`track ${playing ? "track-on" : ""}`} onClick={() => music.play(tracks, i)} aria-current={playing}>
                <span className="track-no">
                  {playing ? <Icon name="music" size={16} /> : numbered === "track" ? t.IndexNumber ?? i + 1 : i + 1}
                </span>
                <span className="track-name">
                  <span className="track-title">{t.Name}</span>
                  {artist && artist !== hideArtist && <span className="card-sub">{artist}</span>}
                </span>
                <span className="track-time">{clock((t.RunTimeTicks ?? 0) / TICKS_PER_SECOND)}</span>
              </button>
              {action && <span className="track-action">{action(t, i)}</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** A dialog that adds songs to an existing playlist or to a new one. */
export function PlaylistPicker({ ids, label, onClose }: { ids: string[]; label: string; onClose: (message?: string) => void }) {
  const jf = useJellyfin();
  const ref = useRef<HTMLDialogElement | null>(null);
  const playlists = useLoad(() => jf.playlists(), [jf]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const add = async (playlist: Item) => {
    setBusy(true);
    setError(null);
    try {
      await jf.addToPlaylist(playlist.Id, ids);
      onClose(`Added to ${playlist.Name}.`);
    } catch {
      setError("Could not add to that playlist. Try again.");
      setBusy(false);
    }
  };

  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await jf.createPlaylist(name.trim(), ids);
      onClose(`Created ${name.trim()}.`);
    } catch {
      setError("Could not create the playlist. Try again.");
      setBusy(false);
    }
  };

  return (
    <dialog ref={ref} className="dialog" onClose={() => onClose()} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="dialog-body">
        <div className="row-head">
          <h2>Add to Playlist</h2>
          <button className="icon-btn" aria-label="Close" onClick={() => onClose()}>
            <Icon name="close" size={20} />
          </button>
        </div>
        <p className="card-sub">{label}</p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <form className="dialog-new" onSubmit={create}>
          <label className="sr-only" htmlFor="new-playlist">
            New playlist name
          </label>
          <input id="new-playlist" placeholder="New playlist name" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn btn-primary" disabled={busy || !name.trim()}>
            Create
          </button>
        </form>
        {playlists.error && <p className="error">Could not load your playlists.</p>}
        {playlists.data && playlists.data.length === 0 && <p className="card-sub">No playlists yet. Name one above to start.</p>}
        <ul className="dialog-list">
          {(playlists.data ?? []).map((p) => (
            <li key={p.Id}>
              <button className="tracks-option" disabled={busy} onClick={() => add(p)}>
                {p.Name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
