"use client";

import { cn } from "@/lib/utils";

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: {
  options: readonly T[] | readonly { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o as T, label: o as React.ReactNode } : o));
  return (
    <div role="tablist" className={cn("inline-flex items-center gap-0.5 rounded-full border border-line bg-canvas/80 p-1 backdrop-blur", className)}>
      {opts.map((o) => (
        <button
          key={o.value}
          role="tab"
          type="button"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full font-medium whitespace-nowrap transition-colors",
            size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-[13px]",
            o.value === value ? "bg-brand text-white shadow-[0_4px_14px_-4px] shadow-brand/60" : "text-ink-2 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", checked ? "bg-brand" : "bg-white/12")}
    >
      <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-[left]", checked ? "left-[18px]" : "left-0.5")} />
    </button>
  );
}
