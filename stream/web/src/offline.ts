// Albums saved on this device so they play with no connection.
// Audio and covers go in the browser's Cache Storage; the album and track
// details go in local storage so the Downloads page works offline.

import type { Item, Jellyfin } from "./api";

const CACHE = "stream-offline-v1";
const KEY = "stream.downloads";
const EVENT = "stream-downloads";

export type Download = { album: Item; tracks: Item[]; savedAt: number };

/** Cache Storage only exists on secure pages (https, or localhost). */
export const offlineSupported = typeof window !== "undefined" && "caches" in window;

const audioKey = (id: string) => `/__offline/audio/${id}`;
const artKey = (id: string) => `/__offline/art/${id}`;

function read(): Record<string, Download> {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

function write(all: Record<string, Download>) {
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(EVENT));
}

export function listDownloads(): Download[] {
  return Object.values(read()).sort((a, b) => b.savedAt - a.savedAt);
}

export function isDownloaded(albumId: string): boolean {
  return albumId in read();
}

export function onDownloadsChange(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export async function downloadAlbum(
  jf: Jellyfin,
  album: Item,
  tracks: Item[],
  onProgress: (done: number, total: number) => void,
): Promise<void> {
  const cache = await caches.open(CACHE);
  let done = 0;
  onProgress(done, tracks.length);
  try {
    for (const t of tracks) {
      // "no-store" keeps this separate from the copy the player may be
      // streaming right now; sharing it makes the browser fail the download.
      const res = await fetch(jf.audioUrl(t.Id), { cache: "no-store" });
      if (!res.ok) throw new Error(`"${t.Name}" could not be downloaded.`);
      await cache.put(audioKey(t.Id), res);
      onProgress(++done, tracks.length);
    }
  } catch (e) {
    // Leave nothing half-saved behind.
    await Promise.all(tracks.map((t) => cache.delete(audioKey(t.Id))));
    throw e;
  }
  const cover = jf.poster(album, 600);
  if (cover) {
    try {
      const res = await fetch(cover, { cache: "no-store" });
      if (res.ok) await cache.put(artKey(album.Id), res);
    } catch {
      /* the album still plays without its cover */
    }
  }
  const all = read();
  all[album.Id] = { album, tracks, savedAt: Date.now() };
  write(all);
}

export async function removeDownload(albumId: string): Promise<void> {
  const all = read();
  const entry = all[albumId];
  if (!entry) return;
  // A song can be in two saved albums' lists only if they share it; keep those.
  const stillNeeded = new Set(
    Object.entries(all)
      .filter(([id]) => id !== albumId)
      .flatMap(([, d]) => d.tracks.map((t) => t.Id)),
  );
  if (offlineSupported) {
    const cache = await caches.open(CACHE);
    await Promise.all([
      ...entry.tracks.filter((t) => !stillNeeded.has(t.Id)).map((t) => cache.delete(audioKey(t.Id))),
      cache.delete(artKey(albumId)),
    ]);
  }
  delete all[albumId];
  write(all);
}

async function blobUrl(key: string): Promise<string | null> {
  if (!offlineSupported) return null;
  try {
    const cache = await caches.open(CACHE);
    const res = await cache.match(key);
    if (!res) return null;
    return URL.createObjectURL(await res.blob());
  } catch {
    return null;
  }
}

/** A playable address for a saved song, or null when it is not saved. */
export const offlineAudio = (trackId: string) => blobUrl(audioKey(trackId));

/** The saved cover of a downloaded album, or null. */
export const offlineArt = (albumId: string) => blobUrl(artKey(albumId));
