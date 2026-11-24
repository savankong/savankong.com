// A small client for the Jellyfin server API. Stream is only a player:
// the server does the scanning, metadata and transcoding.

export const TICKS_PER_SECOND = 10_000_000;

export type Item = {
  Id: string;
  Name: string;
  Type: string; // Movie, Series, Season, Episode, MusicAlbum, Audio, MusicArtist, CollectionFolder
  CollectionType?: string;
  Overview?: string;
  ProductionYear?: number;
  RunTimeTicks?: number;
  OfficialRating?: string;
  Genres?: string[];
  SeriesId?: string;
  SeriesName?: string;
  SeasonId?: string;
  ParentIndexNumber?: number;
  IndexNumber?: number;
  AlbumId?: string;
  Album?: string;
  AlbumArtist?: string;
  AlbumPrimaryImageTag?: string;
  Artists?: string[];
  ChildCount?: number;
  ImageTags?: Record<string, string>;
  BackdropImageTags?: string[];
  ParentBackdropItemId?: string;
  ParentBackdropImageTags?: string[];
  SeriesPrimaryImageTag?: string;
  UserData?: {
    PlaybackPositionTicks?: number;
    PlayedPercentage?: number;
    Played?: boolean;
    IsFavorite?: boolean;
    UnplayedItemCount?: number;
  };
};

export type MediaStream = {
  Type: string;
  Index: number;
  DisplayTitle?: string;
  Language?: string;
  DeliveryMethod?: string;
  DeliveryUrl?: string;
  IsDefault?: boolean;
};

export type MediaSource = {
  Id: string;
  Container?: string;
  SupportsDirectPlay?: boolean;
  SupportsDirectStream?: boolean;
  SupportsTranscoding?: boolean;
  TranscodingUrl?: string;
  MediaStreams?: MediaStream[];
};

export type Session = {
  server: string;
  token: string;
  userId: string;
  userName: string;
};

export type VideoPlayback = {
  url: string;
  isHls: boolean;
  method: "DirectPlay" | "DirectStream" | "Transcode";
  mediaSourceId: string;
  playSessionId: string;
  subtitles: { label: string; lang: string; url: string }[];
};

const SESSION_KEY = "stream.session";
const DEVICE_KEY = "stream.deviceId";
const FIELDS = "Overview,Genres,PrimaryImageAspectRatio,ChildCount";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* private mode: the session just lasts for this tab */
  }
}

export function deviceId(): string {
  let id = read(DEVICE_KEY);
  if (!id) {
    id = "stream-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    write(DEVICE_KEY, id);
  }
  return id;
}

function authHeader(token?: string): string {
  const parts = [
    'Client="Stream"',
    'Device="Web"',
    `DeviceId="${deviceId()}"`,
    'Version="0.1.0"',
  ];
  if (token) parts.push(`Token="${token}"`);
  return "MediaBrowser " + parts.join(", ");
}

/** Accepts "192.168.1.20", "192.168.1.20:8096" or a full URL. */
export function normalizeServer(input: string): string {
  let s = input.trim().replace(/\/+$/, "");
  if (!s) return s;
  if (!/^https?:\/\//i.test(s)) {
    const hasPort = /:\d+$/.test(s);
    s = "http://" + s + (hasPort ? "" : ":8096");
  }
  return s;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  server: string,
  path: string,
  opts: { method?: string; body?: unknown; token?: string; params?: Record<string, unknown> } = {},
): Promise<T> {
  const url = new URL(server + path);
  for (const [k, v] of Object.entries(opts.params ?? {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? "GET",
      headers: {
        Authorization: authHeader(opts.token),
        ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError("Could not reach the server.", 0);
  }
  if (!res.ok) throw new ApiError(`The server answered with an error (${res.status}).`, res.status);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function loadSession(): Session | null {
  const raw = read(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function saveSession(s: Session | null) {
  write(SESSION_KEY, s ? JSON.stringify(s) : null);
}

export async function signIn(serverInput: string, username: string, password: string): Promise<Session> {
  const server = normalizeServer(serverInput);
  await request(server, "/System/Info/Public");
  const res = await request<{ AccessToken: string; User: { Id: string; Name: string } }>(
    server,
    "/Users/AuthenticateByName",
    { method: "POST", body: { Username: username, Pw: password } },
  );
  return { server, token: res.AccessToken, userId: res.User.Id, userName: res.User.Name };
}

export class Jellyfin {
  constructor(public session: Session) {}

  private get<T>(path: string, params?: Record<string, unknown>) {
    return request<T>(this.session.server, path, { token: this.session.token, params });
  }

  private send<T>(method: string, path: string, body?: unknown, params?: Record<string, unknown>) {
    return request<T>(this.session.server, path, { method, body, token: this.session.token, params });
  }

  async signOut() {
    try {
      await this.send("POST", "/Sessions/Logout");
    } catch {
      /* the local session is cleared either way */
    }
  }

  // ---------- Browsing ----------

  async views(): Promise<Item[]> {
    const r = await this.get<{ Items: Item[] }>("/UserViews", { userId: this.session.userId });
    return r.Items;
  }

  async resume(limit = 12): Promise<Item[]> {
    const r = await this.get<{ Items: Item[] }>("/UserItems/Resume", {
      userId: this.session.userId,
      mediaTypes: "Video",
      limit,
      fields: FIELDS,
      enableImageTypes: "Primary,Backdrop,Thumb",
    });
    return r.Items;
  }

  async nextUp(limit = 12): Promise<Item[]> {
    const r = await this.get<{ Items: Item[] }>("/Shows/NextUp", {
      userId: this.session.userId,
      limit,
      fields: FIELDS,
    });
    return r.Items;
  }

  /** The episode to play for a show: the next unwatched one, else the first. */
  async nextEpisode(seriesId: string): Promise<Item | null> {
    const r = await this.get<{ Items: Item[] }>("/Shows/NextUp", {
      userId: this.session.userId,
      seriesId,
      limit: 1,
    });
    if (r.Items[0]) return r.Items[0];
    const all = await this.episodes(seriesId);
    return all[0] ?? null;
  }

  latest(types: string, limit = 16): Promise<Item[]> {
    return this.get<Item[]>("/Items/Latest", {
      userId: this.session.userId,
      includeItemTypes: types,
      limit,
      fields: FIELDS,
    });
  }

  async items(params: Record<string, unknown>): Promise<{ Items: Item[]; TotalRecordCount: number }> {
    return this.get("/Items", {
      userId: this.session.userId,
      recursive: true,
      fields: FIELDS,
      ...params,
    });
  }

  item(id: string): Promise<Item> {
    return this.get<Item>(`/Items/${id}`, { userId: this.session.userId });
  }

  async seasons(seriesId: string): Promise<Item[]> {
    const r = await this.get<{ Items: Item[] }>(`/Shows/${seriesId}/Seasons`, {
      userId: this.session.userId,
    });
    return r.Items;
  }

  async episodes(seriesId: string, seasonId?: string): Promise<Item[]> {
    const r = await this.get<{ Items: Item[] }>(`/Shows/${seriesId}/Episodes`, {
      userId: this.session.userId,
      seasonId,
      fields: FIELDS,
    });
    return r.Items;
  }

  async tracks(albumId: string): Promise<Item[]> {
    const r = await this.items({
      parentId: albumId,
      includeItemTypes: "Audio",
      sortBy: "ParentIndexNumber,IndexNumber,SortName",
    });
    return r.Items;
  }

  async search(term: string): Promise<Item[]> {
    const r = await this.items({
      searchTerm: term,
      includeItemTypes: "Movie,Series,Episode,MusicAlbum,Audio,MusicArtist",
      limit: 60,
    });
    return r.Items;
  }

  // ---------- User state ----------

  setFavorite(id: string, on: boolean) {
    return this.send(on ? "POST" : "DELETE", `/UserFavoriteItems/${id}`, undefined, {
      userId: this.session.userId,
    });
  }

  setPlayed(id: string, on: boolean) {
    return this.send(on ? "POST" : "DELETE", `/UserPlayedItems/${id}`, undefined, {
      userId: this.session.userId,
    });
  }

  // ---------- Images ----------

  /** Poster or cover for an item, falling back to its album or series. */
  poster(item: Item, width = 400): string | null {
    const s = this.session.server;
    const q = `fillWidth=${width}&quality=90`;
    if (item.ImageTags?.Primary) return `${s}/Items/${item.Id}/Images/Primary?${q}&tag=${item.ImageTags.Primary}`;
    if (item.AlbumId && item.AlbumPrimaryImageTag)
      return `${s}/Items/${item.AlbumId}/Images/Primary?${q}&tag=${item.AlbumPrimaryImageTag}`;
    if (item.SeriesId && item.SeriesPrimaryImageTag)
      return `${s}/Items/${item.SeriesId}/Images/Primary?${q}&tag=${item.SeriesPrimaryImageTag}`;
    return null;
  }

  /** Wide artwork: the item's backdrop, else its series', else a thumb. */
  backdrop(item: Item, width = 1280): string | null {
    const s = this.session.server;
    const q = `fillWidth=${width}&quality=85`;
    if (item.BackdropImageTags?.length)
      return `${s}/Items/${item.Id}/Images/Backdrop/0?${q}&tag=${item.BackdropImageTags[0]}`;
    if (item.ParentBackdropItemId && item.ParentBackdropImageTags?.length)
      return `${s}/Items/${item.ParentBackdropItemId}/Images/Backdrop/0?${q}&tag=${item.ParentBackdropImageTags[0]}`;
    if (item.ImageTags?.Thumb) return `${s}/Items/${item.Id}/Images/Thumb?${q}&tag=${item.ImageTags.Thumb}`;
    if (item.Type === "Episode" && item.ImageTags?.Primary)
      return `${s}/Items/${item.Id}/Images/Primary?${q}&tag=${item.ImageTags.Primary}`;
    return null;
  }

  // ---------- Playback ----------

  /** Asks the server how this browser should play a video: as-is or converted. */
  async videoPlayback(itemId: string, canPlayHls: boolean): Promise<VideoPlayback> {
    const profile = {
      MaxStreamingBitrate: 120_000_000,
      DirectPlayProfiles: [
        { Container: "mp4,m4v", Type: "Video", VideoCodec: "h264", AudioCodec: "aac,mp3" },
        { Container: "webm", Type: "Video", VideoCodec: "vp8,vp9,av1", AudioCodec: "opus,vorbis" },
      ],
      TranscodingProfiles: canPlayHls
        ? [
            {
              Container: "ts",
              Type: "Video",
              VideoCodec: "h264",
              AudioCodec: "aac",
              Protocol: "hls",
              Context: "Streaming",
              MaxAudioChannels: "2",
              MinSegments: 1,
              BreakOnNonKeyFrames: true,
            },
          ]
        : [
            {
              Container: "mp4",
              Type: "Video",
              VideoCodec: "h264",
              AudioCodec: "aac",
              Protocol: "http",
              Context: "Streaming",
              MaxAudioChannels: "2",
            },
          ],
      SubtitleProfiles: [{ Format: "vtt", Method: "External" }],
    };
    const info = await this.send<{ MediaSources: MediaSource[]; PlaySessionId: string }>(
      "POST",
      `/Items/${itemId}/PlaybackInfo`,
      {
        UserId: this.session.userId,
        DeviceProfile: profile,
        MaxStreamingBitrate: profile.MaxStreamingBitrate,
        AutoOpenLiveStream: true,
        EnableDirectPlay: true,
        EnableDirectStream: true,
        EnableTranscoding: true,
      },
      { userId: this.session.userId },
    );
    const source = info.MediaSources?.[0];
    if (!source) throw new ApiError("The server has no playable file for this title.", 0);

    const s = this.session.server;
    const subtitles = (source.MediaStreams ?? [])
      .filter((m) => m.Type === "Subtitle" && m.DeliveryMethod === "External" && m.DeliveryUrl)
      .map((m) => ({
        label: m.DisplayTitle || m.Language || "Subtitles",
        lang: m.Language || "und",
        url: s + m.DeliveryUrl,
      }));

    const base = { mediaSourceId: source.Id, playSessionId: info.PlaySessionId, subtitles };
    if (source.SupportsDirectPlay) {
      const ext = (source.Container || "mp4").split(",")[0];
      const url =
        `${s}/Videos/${itemId}/stream.${ext}?static=true&mediaSourceId=${source.Id}` +
        `&deviceId=${encodeURIComponent(deviceId())}&ApiKey=${this.session.token}`;
      return { ...base, url, isHls: false, method: "DirectPlay" };
    }
    if (source.TranscodingUrl) {
      return {
        ...base,
        url: s + source.TranscodingUrl,
        isHls: /\.m3u8/i.test(source.TranscodingUrl),
        method: source.SupportsDirectStream ? "DirectStream" : "Transcode",
      };
    }
    throw new ApiError("This title cannot be played in this browser.", 0);
  }

  /** One address the browser can play a song from; the server converts if needed. */
  audioUrl(itemId: string): string {
    const p = new URLSearchParams({
      userId: this.session.userId,
      deviceId: deviceId(),
      maxStreamingBitrate: "320000",
      container: "mp3,aac,m4a|aac,m4b|aac,flac,opus,webm|opus,ogg,wav",
      transcodingContainer: "mp3",
      transcodingProtocol: "http",
      audioCodec: "mp3",
      ApiKey: this.session.token,
    });
    return `${this.session.server}/Audio/${itemId}/universal?${p.toString()}`;
  }

  /** Tells the server where playback is, so every device can resume. */
  report(
    kind: "start" | "progress" | "stop",
    data: { itemId: string; positionSeconds: number; paused?: boolean; mediaSourceId?: string; playSessionId?: string; method?: string },
  ) {
    const path = kind === "start" ? "/Sessions/Playing" : kind === "progress" ? "/Sessions/Playing/Progress" : "/Sessions/Playing/Stopped";
    return this.send("POST", path, {
      ItemId: data.itemId,
      MediaSourceId: data.mediaSourceId ?? data.itemId,
      PlaySessionId: data.playSessionId,
      PositionTicks: Math.max(0, Math.round(data.positionSeconds * TICKS_PER_SECOND)),
      IsPaused: data.paused ?? false,
      PlayMethod: data.method ?? "DirectPlay",
      CanSeek: true,
    }).catch(() => undefined);
  }
}

// ---------- Formatting ----------

export function runtime(ticks?: number): string {
  if (!ticks) return "";
  const mins = Math.round(ticks / TICKS_PER_SECOND / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

export function clock(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) seconds = 0;
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function timeLeft(item: Item): string {
  const pos = item.UserData?.PlaybackPositionTicks ?? 0;
  if (!item.RunTimeTicks || !pos) return "";
  const left = runtime(item.RunTimeTicks - pos);
  return left ? `${left} left` : "";
}

export function episodeLabel(item: Item): string {
  if (item.Type !== "Episode") return "";
  const s = item.ParentIndexNumber;
  const e = item.IndexNumber;
  if (s == null || e == null) return "";
  return `S${s} · E${e}`;
}
