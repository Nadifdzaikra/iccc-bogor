"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCw, VideoOff } from "lucide-react";
import type Hls from "hls.js";

type State = "loading" | "playing" | "error";

/** Pemutar HLS ringan dengan reconnect otomatis. Hanya memuat saat terlihat. */
export function HlsPlayer({ src, className = "" }: { src: string; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<State>("loading");
  const [visible, setVisible] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !visible) return;
    let hls: Hls | null = null;
    let cancelled = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const onPlaying = () => setState("playing");
    video.addEventListener("playing", onPlaying);

    const fail = () => {
      if (cancelled) return;
      setState("error");
      retry = setTimeout(() => setAttempt((a) => a + 1), 10_000);
    };

    (async () => {
      const { default: HlsLib } = await import("hls.js");
      if (cancelled) return;
      if (!HlsLib.isSupported()) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          video.onerror = fail;
          video.play().catch(() => {});
        } else fail();
        return;
      }
      hls = new HlsLib({ enableWorker: true, liveSyncDurationCount: 3, backBufferLength: 30 });
      hls.on(HlsLib.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      hls.on(HlsLib.Events.ERROR, (_e, data) => {
        if (!data.fatal || !hls) return;
        if (data.type === HlsLib.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
        else {
          hls.destroy();
          hls = null;
          fail();
        }
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    })();

    return () => {
      cancelled = true;
      clearTimeout(retry);
      video.removeEventListener("playing", onPlaying);
      video.onerror = null;
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, visible, attempt]);

  return (
    <div ref={wrapRef} className={`relative h-full w-full bg-black ${className}`}>
      <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
      {state === "loading" && (
        <div className="absolute inset-0 grid place-items-center text-xs text-white/60">
          <RotateCw className="size-5 animate-spin" />
        </div>
      )}
      {state === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/70 text-xs text-white/60">
          <VideoOff className="size-5" />
          Stream tidak tersedia
        </div>
      )}
    </div>
  );
}
