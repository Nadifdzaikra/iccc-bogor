"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Bell, CloudSun, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUMMARY } from "@/data/bogor";

export const NAV = [
  { href: "/", label: "Beranda" },
  { href: "/data-statistik", label: "Data & Statistik" },
  { href: "/call-center", label: "Call Center" },
  { href: "/surveillance", label: "Surveillance" },
  { href: "/geospasial", label: "GeoSpasial" },
  { href: "/city-operation", label: "City Operation" },
  { href: "/ews-ai", label: "EWS & AI" },
] as const;

/* Jam realtime tanpa hydration mismatch: server merender null. */
function subscribe(cb: () => void) {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
}
const minuteKey = () => Math.floor(Date.now() / 60_000);

function Clock() {
  const key = useSyncExternalStore(subscribe, minuteKey, () => null);
  if (key == null) return <div className="h-[42px] w-[150px]" aria-hidden />;
  const now = new Date(key * 60_000);
  const time = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
  const date = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
  return (
    <div className="text-right leading-tight">
      <div className="text-[26px] font-medium tracking-tight tabular-nums">{time}</div>
      <div className="text-xs text-ink-2">{date}</div>
    </div>
  );
}

export function TopBar({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname() ?? "/";
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "relative z-30 flex flex-wrap items-center gap-x-6 gap-y-3 px-4 pt-6 pb-2 sm:px-8 lg:px-12",
        overlay && "pointer-events-none [&>*]:pointer-events-auto",
      )}
    >
      <Link href="/" className="flex items-center gap-3">
        <Image src="/logo-kota-bogor.svg" alt="Lambang Kota Bogor" width={36} height={44} priority />
        <div className="leading-tight">
          <div className="text-[22px] font-semibold tracking-tight">Bogor Command Center</div>
          <div className="text-[13px] text-ink-2">Pemerintah Kota Bogor</div>
        </div>
      </Link>

      <nav aria-label="Modul" className="order-last w-full overflow-x-auto scrollbar-thin 2xl:order-none 2xl:mx-auto 2xl:w-auto">
        <ul className="mx-auto flex w-max items-center gap-1 rounded-full border border-line bg-panel/80 p-1 backdrop-blur-md">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link
                href={n.href}
                aria-current={isActive(n.href) ? "page" : undefined}
                className={cn(
                  "block rounded-full px-5 py-2.5 text-[15px] whitespace-nowrap transition-colors",
                  isActive(n.href) ? "bg-brand font-semibold text-white shadow-[0_6px_20px_-6px] shadow-brand/70" : "text-ink-2 hover:bg-white/5 hover:text-ink",
                )}
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="ml-auto flex items-center gap-5 2xl:ml-0">
        <div className="hidden sm:block">
          <Clock />
        </div>
        <div className="hidden h-9 w-px bg-line sm:block" />
        <div className="flex items-center gap-2 text-[26px] font-medium">
          <CloudSun className="size-7 text-amber" />
          {SUMMARY.cuaca.suhu}°C
        </div>
        <button type="button" aria-label="Notifikasi" className="relative grid size-12 place-items-center rounded-full bg-panel-2 text-ink-2 hover:text-ink">
          <Bell className="size-5" />
          <span className="absolute top-3 right-3.5 size-2 rounded-full bg-danger ring-2 ring-panel-2" />
        </button>
        <button type="button" aria-label="Akun" className="grid size-12 place-items-center rounded-full bg-brand text-white">
          <UserRound className="size-5" />
        </button>
      </div>
    </header>
  );
}
