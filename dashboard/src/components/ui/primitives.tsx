import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/data/bogor";

/* ── Tone helpers ────────────────────────────────────────────────────── */
export const TONE_BG: Record<Tone, string> = {
  brand: "bg-brand",
  ok: "bg-ok",
  warn: "bg-warn",
  danger: "bg-danger",
  violet: "bg-violet",
  amber: "bg-amber",
  sky: "bg-sky",
  muted: "bg-white/10",
};
export const TONE_TEXT: Record<Tone, string> = {
  brand: "text-brand-soft",
  ok: "text-ok",
  warn: "text-warn",
  danger: "text-danger",
  violet: "text-violet",
  amber: "text-amber",
  sky: "text-sky",
  muted: "text-ink-2",
};
const TONE_SOFT: Record<Tone, string> = {
  brand: "bg-brand/18 text-brand-soft",
  ok: "bg-ok/12 text-ok",
  warn: "bg-warn/14 text-warn",
  danger: "bg-danger/14 text-danger",
  violet: "bg-violet/16 text-violet",
  amber: "bg-amber/14 text-amber",
  sky: "bg-sky/14 text-sky",
  muted: "bg-white/7 text-ink-2",
};

/* ── Panel ───────────────────────────────────────────────────────────── */
export function Panel({ className, children, ...rest }: React.ComponentProps<"section">) {
  return (
    <section className={cn("panel p-5", className)} {...rest}>
      {children}
    </section>
  );
}

export function PanelHeader({ title, aside, className }: { title: React.ReactNode; aside?: React.ReactNode; className?: string }) {
  return (
    <header className={cn("mb-4 flex items-center justify-between gap-3", className)}>
      <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
      {aside != null && <div className="shrink-0 text-xs text-ink-2">{aside}</div>}
    </header>
  );
}

/* ── Icon tile ───────────────────────────────────────────────────────── */
export function IconTile({ icon: Icon, tone = "brand", size = "md", className }: { icon: LucideIcon; tone?: Tone; size?: "sm" | "md" | "lg"; className?: string }) {
  const s = size === "sm" ? "size-7 rounded-md [&_svg]:size-3.5" : size === "lg" ? "size-12 rounded-xl [&_svg]:size-5" : "size-9 rounded-lg [&_svg]:size-4";
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center text-white", TONE_BG[tone], tone === "muted" && "text-ink-2", s, className)}>
      <Icon strokeWidth={2} />
    </span>
  );
}

/* ── Pill / badge ────────────────────────────────────────────────────── */
export function Pill({ tone = "muted", dot, className, children }: { tone?: Tone; dot?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium", TONE_SOFT[tone], className)}>
      {dot && <span className={cn("size-1.5 rounded-full", TONE_BG[tone])} />}
      {children}
    </span>
  );
}

/* ── Progress bar ────────────────────────────────────────────────────── */
export function Bar({ value, max = 100, tone = "brand", className, thick }: { value: number; max?: number; tone?: Tone; className?: string; thick?: boolean }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-white/8", thick ? "h-5 rounded-md" : "h-1", className)} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className={cn("h-full rounded-[inherit] transition-[width] duration-700", TONE_BG[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ── Delta (▲ / ▼) ───────────────────────────────────────────────────── */
export function Delta({ up = true, good = true, children, className }: { up?: boolean; good?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", good ? "text-ok" : "text-danger", className)}>
      <span className="text-[9px]">{up ? "▲" : "▼"}</span>
      {children}
    </span>
  );
}

/* ── Stat (angka besar + unit) ───────────────────────────────────────── */
export function Stat({ value, unit, className }: { value: React.ReactNode; unit?: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-1 font-semibold tracking-tight", className)}>
      {value}
      {unit != null && <span className="text-xs font-normal text-ink-2">{unit}</span>}
    </span>
  );
}

/* ── Map legend chip ─────────────────────────────────────────────────── */
export function Legend({ items, className }: { items: { label: string; swatch: React.ReactNode }[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 rounded-full bg-canvas/85 px-4 py-2 text-xs text-ink-2 backdrop-blur", className)}>
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          {i.swatch}
          {i.label}
        </span>
      ))}
    </div>
  );
}
export const Dot = ({ color, shape = "circle" }: { color: string; shape?: "circle" | "diamond" | "square" | "dash" | "ring" }) =>
  shape === "dash" ? (
    <span className="inline-block h-0.5 w-4 border-t-2 border-dashed" style={{ borderColor: color }} />
  ) : shape === "ring" ? (
    <span className="inline-block size-2.5 rounded-full border-2" style={{ borderColor: color }} />
  ) : (
    <span
      className={cn("inline-block size-2", shape === "circle" && "rounded-full", shape === "diamond" && "rotate-45 rounded-[2px]", shape === "square" && "rounded-[2px]")}
      style={{ background: color }}
    />
  );
