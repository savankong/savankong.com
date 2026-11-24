import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Jellyfin, loadSession, saveSession } from "./api";
import type { Item, Session } from "./api";

// ---------- Session ----------

type Auth = {
  jf: Jellyfin | null;
  setSession: (s: Session | null) => void;
};

const AuthContext = createContext<Auth>({ jf: null, setSession: () => undefined });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(() => loadSession());
  const jf = useMemo(() => (session ? new Jellyfin(session) : null), [session]);
  const setSession = useCallback((s: Session | null) => {
    saveSession(s);
    setSessionState(s);
  }, []);
  return <AuthContext.Provider value={{ jf, setSession }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

/** The signed-in client. Only call inside pages shown after sign-in. */
export function useJellyfin(): Jellyfin {
  const { jf } = useContext(AuthContext);
  if (!jf) throw new Error("Not signed in");
  return jf;
}

// ---------- Ambient artwork ----------
// The glass surfaces need colour behind them. Each page hands over its main
// artwork, which is shown heavily blurred behind everything.

type Ambient = { image: string | null; color: string | null };
const NO_AMBIENT: Ambient = { image: null, color: null };

const AmbientContext = createContext<{ ambient: Ambient; setAmbient: (a: Ambient) => void }>({
  ambient: NO_AMBIENT,
  setAmbient: () => undefined,
});

export function AmbientProvider({ children }: { children: ReactNode }) {
  const [ambient, setAmbient] = useState<Ambient>(NO_AMBIENT);
  const value = useMemo(() => ({ ambient, setAmbient }), [ambient]);
  return <AmbientContext.Provider value={value}>{children}</AmbientContext.Provider>;
}

/** Sets the page's ambient artwork while the calling component is shown. */
export function useAmbient(image: string | null | undefined, color?: string | null) {
  const { setAmbient } = useContext(AmbientContext);
  useEffect(() => {
    setAmbient({ image: image ?? null, color: color ?? null });
    return () => setAmbient(NO_AMBIENT);
  }, [image, color, setAmbient]);
}

export function AmbientLayer() {
  const { ambient } = useContext(AmbientContext);
  const custom = ambient.image || ambient.color;
  return (
    <div className="ambient" aria-hidden="true">
      {custom && (
        <div
          className="ambient-art"
          key={ambient.image ?? ambient.color ?? ""}
          style={{
            backgroundColor: ambient.color ?? undefined,
            backgroundImage: ambient.image ? `url("${ambient.image}")` : undefined,
          }}
        />
      )}
    </div>
  );
}

// ---------- Data loading ----------

export function useLoad<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    setError(null);
    load()
      .then((d) => live && setData(d))
      .catch((e: Error) => live && setError(e.message || "Something went wrong."));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { data, error, reload: () => setTick((t) => t + 1) };
}

// ---------- Music player ----------

type Music = {
  queue: Item[];
  index: number;
  current: Item | null;
  playing: boolean;
  position: number;
  duration: number;
  play: (items: Item[], startAt?: number) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  stop: () => void;
};

const MusicContext = createContext<Music | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const { jf } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const current = queue[index] ?? null;
  const lastReport = useRef(0);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.removeAttribute("src");
      a.load();
    }
    setQueue([]);
    setIndex(0);
    setPlaying(false);
    setPosition(0);
    setDuration(0);
  }, []);

  // Signing out stops the music.
  useEffect(() => {
    if (!jf) stop();
  }, [jf, stop]);

  // Load and start whichever track is current.
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !jf || !current) return;
    a.src = jf.audioUrl(current.Id);
    setPosition(0);
    a.play().catch(() => setPlaying(false));
    jf.report("start", { itemId: current.Id, positionSeconds: 0 });
    lastReport.current = 0;
    const id = current.Id;
    return () => {
      jf.report("stop", { itemId: id, positionSeconds: a.currentTime || 0 });
    };
  }, [jf, current]);

  const play = useCallback((items: Item[], startAt = 0) => {
    setQueue(items);
    setIndex(startAt);
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => undefined);
    else a.pause();
  }, []);

  const next = useCallback(() => {
    setIndex((i) => (i < queue.length - 1 ? i + 1 : i));
  }, [queue.length]);

  const previous = useCallback(() => {
    const a = audioRef.current;
    if (a && a.currentTime > 3) {
      a.currentTime = 0;
      return;
    }
    setIndex((i) => (i > 0 ? i - 1 : 0));
  }, []);

  const seek = useCallback((seconds: number) => {
    const a = audioRef.current;
    if (a) a.currentTime = seconds;
  }, []);

  // Lock screen and headphone controls.
  useEffect(() => {
    if (!("mediaSession" in navigator) || !jf) return;
    if (!current) {
      navigator.mediaSession.metadata = null;
      return;
    }
    const art = jf.poster(current, 512);
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.Name,
      artist: current.Artists?.join(", ") || current.AlbumArtist || "",
      album: current.Album || "",
      artwork: art ? [{ src: art, sizes: "512x512" }] : [],
    });
    navigator.mediaSession.setActionHandler("play", toggle);
    navigator.mediaSession.setActionHandler("pause", toggle);
    navigator.mediaSession.setActionHandler("nexttrack", next);
    navigator.mediaSession.setActionHandler("previoustrack", previous);
  }, [jf, current, toggle, next, previous]);

  const onTime = () => {
    const a = audioRef.current;
    if (!a) return;
    setPosition(a.currentTime);
    if (jf && current && Math.abs(a.currentTime - lastReport.current) >= 10) {
      lastReport.current = a.currentTime;
      jf.report("progress", { itemId: current.Id, positionSeconds: a.currentTime });
    }
  };

  const onEnded = () => {
    if (index < queue.length - 1) setIndex(index + 1);
    else setPlaying(false);
  };

  const value: Music = { queue, index, current, playing, position, duration, play, toggle, next, previous, seek, stop };

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={onTime}
        onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
        onEnded={onEnded}
      />
    </MusicContext.Provider>
  );
}

export function useMusic(): Music {
  const m = useContext(MusicContext);
  if (!m) throw new Error("MusicProvider is missing");
  return m;
}
