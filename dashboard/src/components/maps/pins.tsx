import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconTile } from "@/components/ui/primitives";
import type { Tone } from "@/data/bogor";

export function PinDot({ color, size = 14, pulse, ring = "#fff" }: { color: string; size?: number; pulse?: boolean; ring?: string }) {
  return (
    <span className="relative block" style={{ width: size, height: size }}>
      {pulse && <span className="animate-ping-soft absolute inset-0 rounded-full" style={{ background: color }} />}
      <span className="absolute inset-0 rounded-full border-2 shadow-md" style={{ background: color, borderColor: ring }} />
    </span>
  );
}

export function PinDiamond({ color, size = 12 }: { color: string; size?: number }) {
  return <span className="block rotate-45 rounded-[2px] border-2 border-white shadow-md" style={{ width: size, height: size, background: color }} />;
}

export function PinSquare({ color, size = 16 }: { color: string; size?: number }) {
  return <span className="block rounded-[4px] border-2 border-[#16172a] shadow-md" style={{ width: size, height: size, background: color }} />;
}

/** Label kecil (mis. nama kecamatan) dengan titik di bawahnya. */
export function PinLabel({ label, color = "#9b51ff" }: { label: string; color?: string }) {
  return (
    <span className="flex flex-col items-center gap-2">
      <span className="rounded-md border border-line bg-panel/90 px-2 py-1 text-xs whitespace-nowrap text-ink backdrop-blur">{label}</span>
      <PinDot color={color} size={12} />
    </span>
  );
}

/** Kartu insiden mengambang dengan ekor segitiga. */
export function CalloutCard({ icon, tone = "danger", title, sub, className }: { icon: LucideIcon; tone?: Tone; title: string; sub: string; className?: string }) {
  return (
    <span className={cn("flex flex-col items-center", className)}>
      <span className="flex items-center gap-3 rounded-lg border border-danger/40 bg-panel/95 py-2 pr-6 pl-2 shadow-xl backdrop-blur">
        <IconTile icon={icon} tone={tone} size="md" />
        <span className="leading-tight">
          <span className="block text-[13px] font-medium whitespace-nowrap text-ink">{title}</span>
          <span className="block text-xs whitespace-nowrap text-ink-2">{sub}</span>
        </span>
      </span>
      <span className="mt-1 size-0 border-x-[7px] border-t-[9px] border-x-transparent border-t-danger" />
    </span>
  );
}
