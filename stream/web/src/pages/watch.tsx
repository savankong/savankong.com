import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { clock, episodeLabel, TICKS_PER_SECOND } from "../api";
import type { Item, VideoPlayback } from "../api";
import { useJellyfin, useMusic } from "../app";
import { Icon, Message } from "../ui";

type WebkitVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

/** Full-window video player with its own controls: title top left, a seek
 *  bar with time elapsed and left, skip 10 seconds either way, next episode,
 *  subtitles and fullscreen. Controls fade while a video plays untouched. */
export function Watch() {
  const jf = useJellyfin();
  const music = useMusic();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const fromStart = params.get("start") === "0";
  const videoRef = useRef<WebkitVideo | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef(0);
  const [item, setItem] = useState<Item | null>(null);
  const [playback, setPlayback] = useState<VideoPlayback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nextEpisode, setNextEpisode] = useState<Item | null>(null);
  const [ended, setEnded] = useState(false);
  const [paused, setPaused] = useState(true);
  const [ready, setReady] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [captions, setCaptions] = useState(false);
  const [visible, setVisible] = useState(true);

  // Music and video never play over each other.
  useEffect(() => {
    music.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Ask the server how to play this title, and find the episode after it.
  useEffect(() => {
    let live = true;
    setItem(null);
    setPlayback(null);
    setError(null);
    setEnded(false);
    setNextEpisode(null);
    setReady(false);
    setTime(0);
    setDuration(0);
    (async () => {
      try {
        const it = await jf.item(id);
        if (!live) return;
        setItem(it);
        const probe = document.createElement("video");
        const canHls = Hls.isSupported() || probe.canPlayType("application/vnd.apple.mpegurl") !== "";
        const pb = await jf.videoPlayback(id, canHls);
        if (!live) return;
        setPlayback(pb);
        if (it.Type === "Episode" && it.SeriesId) {
          const all = await jf.episodes(it.SeriesId);
          const at = all.findIndex((e) => e.Id === it.Id);
          if (live && at >= 0 && at < all.length - 1) setNextEpisode(all[at + 1]);
        }
      } catch (e) {
        if (live) setError((e as Error).message || "This title could not be played.");
      }
    })();
    return () => {
      live = false;
    };
  }, [jf, id]);

  // Attach the stream, resume, and keep the server told where we are.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playback || !item) return;
    const resumeAt = fromStart ? 0 : (item.UserData?.PlaybackPositionTicks ?? 0) / TICKS_PER_SECOND;
    const meta = {
      itemId: item.Id,
      mediaSourceId: playback.mediaSourceId,
      playSessionId: playback.playSessionId,
      method: playback.method,
    };
    let hls: Hls | null = null;
    let started = false;

    const onReady = () => {
      if (resumeAt > 0 && isFinite(video.duration) && resumeAt < video.duration - 5) video.currentTime = resumeAt;
      setDuration(isFinite(video.duration) ? video.duration : 0);
      setReady(true);
      video.play().catch(() => undefined);
    };
    const onPlaying = () => {
      if (started) return;
      started = true;
      jf.report("start", { ...meta, positionSeconds: video.currentTime });
    };
    const progress = () => {
      if (started) jf.report("progress", { ...meta, positionSeconds: video.currentTime, paused: video.paused });
    };
    const onPlay = () => {
      setPaused(false);
      setEnded(false);
    };
    const onPause = () => {
      setPaused(true);
      progress();
    };
    const onTime = () => setTime(video.currentTime);
    const onDuration = () => setDuration(isFinite(video.duration) ? video.duration : 0);
    const onVolume = () => setMuted(video.muted);
    const onEnded = () => setEnded(true);
    const onError = () => {
      if (!hls) setError("The browser could not play this file.");
    };

    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("seeked", progress);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("durationchange", onDuration);
    video.addEventListener("volumechange", onVolume);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);
    const timer = window.setInterval(progress, 10_000);

    if (playback.isHls && !video.canPlayType("application/vnd.apple.mpegurl") && Hls.isSupported()) {
      hls = new Hls();
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setError("The stream stopped. Check the connection to your server and try again.");
      });
      hls.loadSource(playback.url);
      hls.attachMedia(video);
    } else {
      video.src = playback.url;
    }

    return () => {
      window.clearInterval(timer);
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("seeked", progress);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("durationchange", onDuration);
      video.removeEventListener("volumechange", onVolume);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
      if (started) jf.report("stop", { ...meta, positionSeconds: video.currentTime });
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [jf, playback, item, fromStart]);

  // ---------- Controls ----------

  const wake = useCallback(() => {
    setVisible(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      const v = videoRef.current;
      if (v && !v.paused) setVisible(false);
    }, 3000);
  }, []);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => undefined);
    else v.pause();
  }, []);

  const skip = useCallback((seconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    const max = isFinite(v.duration) ? v.duration : Infinity;
    v.currentTime = Math.min(Math.max(0, v.currentTime + seconds), max);
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (v) v.muted = !v.muted;
  }, []);

  const fullscreen = useCallback(() => {
    const shell = shellRef.current;
    const v = videoRef.current;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    else if (shell?.requestFullscreen) shell.requestFullscreen().catch(() => undefined);
    else v?.webkitEnterFullscreen?.(); // iPhone: only the video itself can go fullscreen
  }, []);

  // A control clicked with the mouse gives focus back, so Space and the
  // arrow keys keep driving the player. Keyboard activation has detail 0.
  const releaseFocus = (e: { detail: number }) => {
    if (e.detail > 0 && document.activeElement instanceof HTMLElement) document.activeElement.blur();
  };

  const toggleCaptions = () => {
    const v = videoRef.current;
    if (!v || !v.textTracks.length) return;
    const on = !captions;
    for (let i = 0; i < v.textTracks.length; i++) v.textTracks[i].mode = on && i === 0 ? "showing" : "hidden";
    setCaptions(on);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // A control reached with the keyboard keeps its own keys.
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT") return;
      if ((tag === "BUTTON" || tag === "A") && (e.key === " " || e.key === "Enter")) return;
      if (e.key === " " || e.key === "k") toggle();
      else if (e.key === "ArrowLeft") skip(-10);
      else if (e.key === "ArrowRight") skip(10);
      else if (e.key === "f") fullscreen();
      else if (e.key === "m") toggleMute();
      else return;
      e.preventDefault();
      wake();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, skip, fullscreen, toggleMute, wake]);

  const backTo = item ? `/item/${item.Type === "Episode" && item.SeriesId ? item.SeriesId : item.Id}` : "/";
  const isEpisode = item?.Type === "Episode";
  const title = item ? (isEpisode ? item.SeriesName ?? item.Name : item.Name) : "";
  const subtitle = item && isEpisode ? `${episodeLabel(item)} · ${item.Name}` : "";
  const shown = visible || paused || !ready;
  const total = duration || (item?.RunTimeTicks ?? 0) / TICKS_PER_SECOND;

  if (error) {
    return (
      <div className="watch">
        <div className="watch-top">
          <Link className="icon-btn" to={backTo} aria-label="Back">
            <Icon name="back" size={24} />
          </Link>
          <span className="watch-title">{title}</span>
        </div>
        <Message title="Could not play this title" action={<button className="btn" onClick={() => navigate(0)}>Try Again</button>}>
          {error}
        </Message>
      </div>
    );
  }

  return (
    <div ref={shellRef} className={`watch ${shown ? "" : "watch-idle"}`} onPointerMove={wake} onPointerDown={wake} onClick={releaseFocus}>
      <video ref={videoRef} className="watch-video" playsInline crossOrigin="anonymous" onClick={toggle}>
        {playback?.subtitles.map((s) => (
          <track key={s.url} kind="subtitles" label={s.label} srcLang={s.lang} src={s.url} />
        ))}
      </video>

      {!ready && <p className="watch-loading">Loading</p>}

      <div className="watch-top watch-overlay">
        <Link className="icon-btn" to={backTo} aria-label="Back">
          <Icon name="back" size={24} />
        </Link>
        <div className="watch-heading">
          <span className="watch-title">{title}</span>
          {subtitle && <span className="watch-subtitle">{subtitle}</span>}
        </div>
      </div>

      <div className="watch-bottom watch-overlay">
        <div className="watch-seek">
          <span>{clock(time)}</span>
          <input
            type="range"
            aria-label="Seek"
            min={0}
            max={Math.max(total, 1)}
            step={1}
            value={Math.min(time, Math.max(total, 1))}
            onChange={(e) => {
              const v = videoRef.current;
              if (v) v.currentTime = Number(e.target.value);
            }}
          />
          <span>-{clock(Math.max(total - time, 0))}</span>
        </div>
        <div className="watch-controls">
          <button className="icon-btn icon-btn-lg" aria-label={paused ? "Play" : "Pause"} onClick={toggle}>
            <Icon name={paused ? "play" : "pause"} size={28} />
          </button>
          <button className="icon-btn skip" aria-label="Back 10 seconds" onClick={() => skip(-10)}>
            <Icon name="restart" size={26} />
            <span aria-hidden="true">10</span>
          </button>
          <button className="icon-btn skip" aria-label="Forward 10 seconds" onClick={() => skip(10)}>
            <Icon name="forward" size={26} />
            <span aria-hidden="true">10</span>
          </button>
          <button className="icon-btn" aria-label={muted ? "Unmute" : "Mute"} onClick={toggleMute}>
            <Icon name={muted ? "mute" : "volume"} size={24} />
          </button>
          <span className="watch-spacer" />
          {playback && playback.subtitles.length > 0 && (
            <button className="icon-btn" aria-label="Subtitles" aria-pressed={captions} onClick={toggleCaptions}>
              <Icon name="captions" size={24} />
            </button>
          )}
          {nextEpisode && (
            <Link className="icon-btn" to={`/watch/${nextEpisode.Id}?start=0`} replace aria-label={`Next episode: ${nextEpisode.Name}`}>
              <Icon name="next" size={24} />
            </Link>
          )}
          <button className="icon-btn" aria-label="Fullscreen" onClick={fullscreen}>
            <Icon name="fullscreen" size={24} />
          </button>
        </div>
      </div>

      {ended && nextEpisode && (
        <div className="watch-next">
          <span>
            Next: {episodeLabel(nextEpisode)} · {nextEpisode.Name}
          </span>
          <Link className="btn btn-primary" to={`/watch/${nextEpisode.Id}?start=0`} replace>
            <Icon name="play" size={18} />
            Play Next
          </Link>
        </div>
      )}
    </div>
  );
}
