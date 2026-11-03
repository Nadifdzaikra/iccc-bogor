"use client";

import { useSyncExternalStore } from "react";
import { VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { HlsPlayer } from "./hls-player";

const TEMPLATE = process.env.NEXT_PUBLIC_CCTV_HLS_TEMPLATE?.trim();

const sub = (cb: () => void) => {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
};
const secKey = () => Math.floor(Date.now() / 1000);

function Timestamp() {
  const k = useSyncExternalStore(sub, secKey, () => null);
  if (k == null) return null;
  const d = new Date(k * 1000);
  const s = d.toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" });
  return <span className="font-mono text-[11px] text-white/85 [text-shadow:0_1px_2px_#000]">{s}</span>;
}

/** Feed kamera: HLS bila template URL tersedia, selain itu pratinjau demo. */
export function CameraFeed({ id, online, seed = 0, showTime = true }: { id: string; online: boolean; seed?: number; showTime?: boolean }) {
  if (!online) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#2a2c3a] text-xs text-ink-3">
        <VideoOff className="size-5" />
        Kamera offline
      </div>
    );
  }
  if (TEMPLATE) return <HlsPlayer src={TEMPLATE.replace("{id}", encodeURIComponent(id))} />;

  const hue = (seed * 47) % 360;
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: `radial-gradient(120% 80% at 50% 110%, hsl(${hue} 30% 30% / 0.9), transparent 60%), radial-gradient(60% 50% at ${30 + (seed % 5) * 10}% 30%, rgba(255,214,150,0.35), transparent 70%), linear-gradient(180deg, #0c0e16, #1c1d25 60%, #2a2a30)`,
      }}
    >
      <svg viewBox="0 0 160 90" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-60" aria-hidden>
        <path d={`M${60 + (seed % 3) * 6} 40 L10 90 M${100 - (seed % 4) * 4} 40 L150 90`} stroke="#ffffff22" strokeWidth="0.6" fill="none" />
        <path d="M80 42 L80 90" stroke="#ffffff30" strokeWidth="0.6" strokeDasharray="3 3" />
        {Array.from({ length: 5 }, (_, i) => (
          <circle key={i} cx={20 + ((seed * 13 + i * 31) % 120)} cy={18 + ((seed * 7 + i * 11) % 22)} r={1.4} fill="#ffe3a8" opacity={0.9} />
        ))}
      </svg>
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.025)_0_1px,transparent_1px_3px)]" />
      {showTime && (
        <div className="absolute right-2.5 bottom-2 hidden sm:block">
          <Timestamp />
        </div>
      )}
    </div>
  );
}

export function CamBadge({ children, tone = "dark", className }: { children: React.ReactNode; tone?: "dark" | "live" | "off"; className?: string }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-medium",
        tone === "live" && "bg-danger text-white",
        tone === "dark" && "bg-black/55 text-white/85",
        tone === "off" && "bg-black/40 text-white/70",
        className,
      )}
    >
      {children}
    </span>
  );
}
