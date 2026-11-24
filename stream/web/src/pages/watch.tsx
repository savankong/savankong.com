import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { episodeLabel, TICKS_PER_SECOND } from "../api";
import type { Item, VideoPlayback } from "../api";
import { useJellyfin, useMusic } from "../app";
import { Icon, Message } from "../ui";

/** Full-window video player. Uses the browser's own controls so fullscreen,
 *  AirPlay and picture-in-picture work the way each device expects. */
export function Watch() {
  const jf = useJellyfin();
  const music = useMusic();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const fromStart = params.get("start") === "0";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [playback, setPlayback] = useState<VideoPlayback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nextEpisode, setNextEpisode] = useState<Item | null>(null);
  const [ended, setEnded] = useState(false);

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
    const onEnded = () => setEnded(true);
    const onError = () => {
      if (!hls) setError("The browser could not play this file.");
    };

    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", progress);
    video.addEventListener("seeked", progress);
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
      video.removeEventListener("pause", progress);
      video.removeEventListener("seeked", progress);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
      if (started) jf.report("stop", { ...meta, positionSeconds: video.currentTime });
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [jf, playback, item, fromStart]);

  const backTo = item ? `/item/${item.Type === "Episode" && item.SeriesId ? item.SeriesId : item.Id}` : "/";
  const title = item
    ? item.Type === "Episode"
      ? `${item.SeriesName ?? ""} · ${episodeLabel(item)} · ${item.Name}`
      : item.Name
    : "";

  return (
    <div className="watch">
      <div className="watch-bar">
        <Link className="icon-btn" to={backTo} aria-label="Back">
          <Icon name="back" size={24} />
        </Link>
        <span className="watch-title">{title}</span>
      </div>
      {error ? (
        <Message title="Could not play this title" action={<button className="btn" onClick={() => navigate(0)}>Try Again</button>}>
          {error}
        </Message>
      ) : (
        <video ref={videoRef} className="watch-video" controls playsInline crossOrigin="anonymous">
          {playback?.subtitles.map((s) => (
            <track key={s.url} kind="subtitles" label={s.label} srcLang={s.lang} src={s.url} />
          ))}
        </video>
      )}
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
