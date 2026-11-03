"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  AlertTriangle, BarChart3, Building2, Camera, Car, CloudRain, Droplet, Headphones, Landmark, Map as MapIcon,
  Sparkles, Thermometer, TrendingUp, TriangleAlert, UsersRound, Video, Waves, Wind, type LucideIcon,
} from "lucide-react";
import { cn, fmt } from "@/lib/utils";
import { Bar, Dot, IconTile, Pill, TONE_BG, TONE_TEXT } from "@/components/ui/primitives";
import { AreaTrend } from "@/components/charts/area-trend";
import { BaseMap, MapLines, MapMarker, MapPolygons, ellipse } from "@/components/maps/base-map";
import { CalloutCard, PinDot } from "@/components/maps/pins";
import {
  BALAI_KOTA, CITY_CENTER, FLOOD_PROB_SERIES, HOME_MAP, KEBUN_RAYA, KEC_CENTER, KECAMATAN, MODULE_STATUS, REALTIME_ALERTS, RIVERS, SUMMARY, TMA_SERIES, type KecamatanId,
} from "@/data/bogor";

const MODULE_ICON: Record<string, LucideIcon> = {
  "/data-statistik": BarChart3,
  "/call-center": Headphones,
  "/surveillance": Video,
  "/geospasial": MapIcon,
  "/city-operation": Building2,
  "/ews-ai": TriangleAlert,
};
const ALERT_ICON: Record<string, LucideIcon> = { flood: Waves, accident: AlertTriangle, traffic: Car, rain: CloudRain };

const LAYERS = [
  { id: "insiden", label: "Insiden", color: "#ff3d63" },
  { id: "macet", label: "Kemacetan", color: "#ff8a2a" },
  { id: "cctv", label: "CCTV", color: "#9b51ff" },
  { id: "sungai", label: "Sungai & sorotan", color: "#4c5fe6" },
  { id: "hijau", label: "Ruang hijau", color: "#3dd4a0" },
] as const;
type LayerId = (typeof LAYERS)[number]["id"];

const XL = "(min-width: 1280px)";
const subscribeXl = (cb: () => void) => {
  const mq = window.matchMedia(XL);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function BerandaView() {
  const wide = useSyncExternalStore(subscribeXl, () => window.matchMedia(XL).matches, () => false);
  const [region, setRegion] = useState<KecamatanId | "all">("all");
  const [layers, setLayers] = useState<Record<LayerId, boolean>>({ insiden: true, macet: true, cctv: true, sungai: true, hijau: true });
  const a = SUMMARY.aduan;
  const regionName = region === "all" ? "Seluruh Kota Bogor" : KECAMATAN.find((k) => k.id === region)!.name;

  return (
    <div className="relative grid gap-6 px-4 pt-44 pb-8 sm:px-8 lg:px-12 xl:h-svh xl:min-h-[860px] xl:grid-cols-[400px_1fr_400px] xl:pt-[132px] xl:pb-6 2xl:pt-[132px]">
      {/* ── PETA (latar penuh pada layar lebar) ────────────────────────── */}
      <div className="relative -mx-4 h-[70vh] min-h-[460px] sm:-mx-8 lg:-mx-12 xl:absolute xl:inset-0 xl:m-0 xl:h-auto">
        <BaseMap styleKey="dark" center={region === "all" ? CITY_CENTER : KEC_CENTER[region]} zoom={region === "all" ? (wide ? 12.75 : 12.1) : 14} padding={wide ? { top: 190, bottom: 290, left: 450, right: 470 } : undefined}>
          {layers.hijau && <MapPolygons id="kebun-raya" polygons={[ellipse(KEBUN_RAYA, 620, 520)]} fill="#3dd4a0" fillOpacity={0.2} line="#3dd4a0" />}
          {layers.sungai && (
            <>
              <MapLines id="ciliwung" lines={[RIVERS.ciliwung, RIVERS.cisadane]} color="#5b6cff" width={2.5} glow />
              <MapMarker at={RIVERS.ciliwung[7]}>
                <span className="ml-24 text-xs whitespace-nowrap text-[#8f9cff] italic">Sungai Ciliwung</span>
              </MapMarker>
              <MapMarker at={RIVERS.cisadane[3]}>
                <span className="mr-20 text-xs whitespace-nowrap text-[#8f9cff] italic">Cisadane</span>
              </MapMarker>
            </>
          )}
          {layers.cctv &&
            HOME_MAP.cctv.map((p) => (
              <MapMarker key={p.join()} at={p}>
                <PinDot color="#9b51ff" size={11} ring="rgba(255,255,255,0.8)" />
              </MapMarker>
            ))}
          {KECAMATAN.map((k) => {
            const dim = region !== "all" && region !== k.id;
            return (
              <MapMarker key={k.id} at={KEC_CENTER[k.id]} anchor="bottom" onClick={() => setRegion(region === k.id ? "all" : k.id)}>
                <span className={cn("flex flex-col items-center gap-2 transition-opacity", dim && "opacity-30")}>
                  <span className={cn("rounded-md border px-2 py-1 text-xs whitespace-nowrap backdrop-blur", region === k.id ? "border-brand bg-brand text-white" : "border-line bg-panel/90 text-ink")}>
                    {k.name}
                  </span>
                  <PinDot color="#9b51ff" size={12} />
                </span>
              </MapMarker>
            );
          })}
          <MapMarker at={BALAI_KOTA} anchor="right" zIndex={2}>
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-lg border border-line bg-panel/95 py-1.5 pr-3 pl-1.5 shadow-lg">
                <IconTile icon={Landmark} size="sm" />
                <span className="leading-tight">
                  <span className="block text-xs font-medium whitespace-nowrap">Balai Kota Bogor</span>
                  <span className="block text-[10px] text-ink-2">Pusat kendali</span>
                </span>
              </span>
              <span className="size-4 rounded-[4px] border-2 border-white bg-brand" />
            </span>
          </MapMarker>
          {layers.macet && (
            <MapMarker at={HOME_MAP.traffic.at} anchor="bottom">
              <span className="flex flex-col items-center gap-2">
                <span className="rounded bg-warn px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-[#1b1206]">{HOME_MAP.traffic.label}</span>
                <PinDot color="#ff8a2a" size={16} pulse />
              </span>
            </MapMarker>
          )}
          {layers.insiden &&
            HOME_MAP.incidents.map((i) => (
              <MapMarker key={i.title} at={i.at} anchor="bottom" zIndex={3}>
                <CalloutCard icon={i.kind === "flood" ? Waves : Car} title={i.title} sub={i.sub} />
              </MapMarker>
            ))}
        </BaseMap>
        {/* gradasi tepi agar panel tetap terbaca */}
        <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(20,22,42,0.92)_0%,rgba(20,22,42,0.55)_22%,transparent_34%,transparent_68%,rgba(20,22,42,0.55)_78%,rgba(20,22,42,0.92)_100%)] xl:block" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#14162a] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-56 bg-gradient-to-t from-[#14162a] to-transparent xl:block" />

        {/* filter wilayah vertikal */}
        <div className="absolute top-[14%] right-4 z-10 flex flex-col items-center gap-2 xl:right-[calc(400px+80px)]">
          <button type="button" onClick={() => setRegion("all")} className={cn("rounded-full px-4 py-2 text-xs font-medium", region === "all" ? "bg-brand text-white" : "bg-panel text-ink-2")}>
            Semua
          </button>
          <div className="flex flex-col rounded-full border border-line bg-panel/70 py-2 backdrop-blur">
            {KECAMATAN.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setRegion(k.id)}
                className={cn("px-3 py-2.5 text-[13px] transition-colors", region === k.id ? "font-semibold text-white" : "text-ink-2 hover:text-ink")}
              >
                {k.short}
              </button>
            ))}
          </div>
        </div>

        {/* legenda layer */}
        <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center px-4 xl:bottom-[200px]">
          <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 rounded-full border border-line bg-canvas/85 px-3 py-1.5 text-[13px] backdrop-blur">
            {LAYERS.map((l) => (
              <button
                key={l.id}
                type="button"
                aria-pressed={layers[l.id]}
                onClick={() => setLayers((s) => ({ ...s, [l.id]: !s[l.id] }))}
                className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-opacity hover:bg-white/5", !layers[l.id] && "opacity-40")}
              >
                <Dot color={l.color} shape={l.id === "sungai" || l.id === "hijau" ? "square" : "circle"} />
                {l.label}
              </button>
            ))}
            <span className="mx-2 hidden h-4 w-px bg-line sm:block" />
            <span className="px-2 text-ink-2">Menampilkan {regionName}</span>
          </div>
        </div>
      </div>

      {/* ── KOLOM KIRI ──────────────────────────────────────────────── */}
      <aside className="relative z-10 flex min-h-0 flex-col gap-5 xl:overflow-y-auto xl:pr-1 scrollbar-thin">
        <div className="grid grid-cols-3 gap-3">
          <CounterChip label="Insiden aktif" value={SUMMARY.insidenAktif} tone="danger" />
          <CounterChip label="Peringatan dini" value={SUMMARY.peringatanDini} tone="warn" />
          <CounterChip label="Kamera offline" value={SUMMARY.kameraOffline} tone="muted" />
        </div>

        <section>
          <h2 className="text-[17px] font-semibold">Aduan warga hari ini</h2>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-[64px] leading-none font-bold tracking-tight">{a.total}</span>
            <span className="mb-2 text-sm text-ok">▲ {a.delta} sejak {a.sejak}</span>
          </div>
          <div className="mt-4 flex h-1.5 gap-1">
            <span className="rounded-full bg-brand" style={{ flex: a.selesai }} />
            <span className="rounded-full bg-ok" style={{ flex: a.diproses }} />
            <span className="rounded-full bg-danger" style={{ flex: a.lewatSla }} />
          </div>
          <ul className="mt-3 space-y-1.5 text-sm">
            {[
              { l: "Selesai", v: a.selesai, c: "border-brand" },
              { l: "Diproses", v: a.diproses, c: "border-ok" },
              { l: "Lewat SLA", v: a.lewatSla, c: "border-danger" },
            ].map((r) => (
              <li key={r.l} className="grid grid-cols-[1fr_auto_3rem] items-center gap-3">
                <span className="flex items-center gap-2">
                  <span className={cn("size-3 rounded-full border-2", r.c)} />
                  {r.l}
                </span>
                <span className="tabular-nums">{r.v}</span>
                <span className="text-right text-ink-2 tabular-nums">{Math.round((r.v / a.total) * 100)}%</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-[17px] font-semibold">Kondisi kota</h2>
          <div className="grid grid-cols-2 gap-3">
            <CondTile icon={Car} tone="ok" value={SUMMARY.lalinIndex} of={100} label="Indeks lalu lintas" />
            <CondTile icon={Camera} tone="violet" value={SUMMARY.cctvOnline} of={SUMMARY.cctvTotal} label="CCTV online" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[17px] font-semibold">Cuaca & kualitas udara</h2>
          <div className="grid grid-cols-3 gap-3">
            <WeatherTile icon={Thermometer} value={SUMMARY.cuaca.suhu} unit="°C" label="Suhu" tone="ok" />
            <WeatherTile icon={Droplet} value={SUMMARY.cuaca.kelembapan} unit="%" label="Kelembapan" tone="warn" />
            <WeatherTile icon={Wind} value={SUMMARY.cuaca.ispu} unit="ISPU" label="Udara baik" tone="ok" />
          </div>
        </section>

        <Link href="/city-operation" className="panel block overflow-hidden px-5 pt-4 transition-colors hover:border-white/15">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-semibold">Siaga banjir</h2>
            <Pill tone="ok">{SUMMARY.banjir.status}</Pill>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold">{SUMMARY.banjir.tma}</span>
              <span className="text-xs text-ink-2">cm · {SUMMARY.banjir.lokasi}</span>
            </span>
            <span className="text-xs text-warn">▲ {SUMMARY.banjir.delta} cm</span>
          </div>
          <div className="-mx-5 mt-2">
            <AreaTrend data={TMA_SERIES} xKey="t" series={[{ key: "v", color: "#6d7cf0", name: "TMA" }]} height={64} unit=" cm" />
          </div>
        </Link>
      </aside>

      {/* ── KOLOM TENGAH (KPI bawah) ────────────────────────────────── */}
      <div className="relative z-10 flex flex-col justify-end xl:pointer-events-none xl:px-6">
        <div className="pointer-events-auto grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard icon={UsersRound} label="Total Penduduk" value={fmt(SUMMARY.populasi.total)} unit="Jiwa" />
          <KpiCard icon={UsersRound} label="Kepadatan/km²" value={fmt(SUMMARY.populasi.kepadatan)} unit="Jiwa" />
          <KpiCard icon={TrendingUp} label="Tumbuh /Tahun" value={`${SUMMARY.populasi.tumbuh.toString().replace(".", ",")}%`} />
          <KpiCard icon={Building2} label="IPM Kota" value={SUMMARY.populasi.ipm.toString().replace(".", ",")} />
        </div>
        <p className="mt-3 text-[11px] text-ink-3">Peta skematis dan angka pada layar ini adalah ilustrasi untuk keperluan desain.</p>
      </div>

      {/* ── KOLOM KANAN ─────────────────────────────────────────────── */}
      <aside className="relative z-10 flex min-h-0 flex-col gap-4 xl:overflow-y-auto xl:pl-1 scrollbar-thin">
        <section>
          <h2 className="mb-3 text-[17px] font-semibold">Status modul</h2>
          <div className="grid grid-cols-2 gap-3">
            {MODULE_STATUS.map((m) => (
              <Link key={m.href} href={m.href} className="panel block p-4 transition-colors hover:border-white/15 hover:bg-panel-2">
                <div className="flex items-center gap-2.5">
                  <IconTile icon={MODULE_ICON[m.href]} tone={m.tone} />
                  <span className="text-sm font-medium">{m.label}</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <span className={cn("text-[22px] font-semibold", m.tone === "danger" && "text-ink")}>{m.value}</span>
                  <span className="truncate text-xs text-ink-2">{m.unit}</span>
                </div>
                <Bar value={m.progress} tone={m.tone} className="mt-2" />
              </Link>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-semibold">Peringatan realtime</h2>
            <Link href="/ews-ai" className="text-xs text-brand-soft hover:underline">
              Lihat semua
            </Link>
          </header>
          <ul className="space-y-4">
            {REALTIME_ALERTS.map((r) => (
              <li key={r.title} className="flex items-center gap-3">
                <IconTile icon={ALERT_ICON[r.kind]} tone={r.tone} />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-sm">{r.title}</p>
                  <p className="truncate text-xs text-ink-2">{r.place}</p>
                </div>
                <span className="text-xs text-ink-2 tabular-nums">{r.time}</span>
              </li>
            ))}
          </ul>
        </section>

        <Link href="/ews-ai" className="panel block overflow-hidden px-5 pt-4 transition-colors hover:border-white/15">
          <div className="flex items-start gap-3">
            <IconTile icon={Sparkles} tone="warn" />
            <div className="flex-1 leading-tight">
              <p className="text-xl font-semibold">{SUMMARY.peluangBanjir6j}%</p>
              <p className="text-xs text-ink-2">Peluang banjir 6 jam ke depan</p>
            </div>
            <span className="text-xs text-warn">▲ {SUMMARY.peluangDelta}%</span>
          </div>
          <div className="-mx-5 mt-1">
            <AreaTrend data={FLOOD_PROB_SERIES} xKey="t" series={[{ key: "v", color: "#f6a33b", name: "Peluang" }]} height={70} marker={{ index: 9, key: "v" }} unit="%" />
          </div>
        </Link>
      </aside>
    </div>
  );
}

function CounterChip({ label, value, tone }: { label: string; value: number; tone: "danger" | "warn" | "muted" }) {
  return (
    <div className="panel flex items-center justify-between gap-2 py-2.5 pr-2.5 pl-3.5">
      <span className="text-[13px] leading-tight">{label}</span>
      <span className={cn("grid h-8 min-w-8 place-items-center rounded-md px-1.5 text-[15px] font-semibold text-white", tone === "muted" ? "bg-white/15" : TONE_BG[tone])}>
        {value}
      </span>
    </div>
  );
}

function CondTile({ icon, tone, value, of, label }: { icon: LucideIcon; tone: "ok" | "violet"; value: number; of: number; label: string }) {
  return (
    <div className="panel flex items-center gap-3 p-4">
      <IconTile icon={icon} tone={tone} size="lg" />
      <div className="leading-tight">
        <p>
          <span className="text-2xl font-semibold">{value}</span>
          <span className="text-xs text-ink-2">/{of}</span>
        </p>
        <p className="text-xs text-ink-2">{label}</p>
      </div>
    </div>
  );
}

function WeatherTile({ icon: Icon, value, unit, label, tone }: { icon: LucideIcon; value: number; unit: string; label: string; tone: "ok" | "warn" }) {
  return (
    <div className="panel relative p-4">
      <Icon className="size-5 text-ink-2" />
      <span className={cn("absolute top-4 right-4 size-2 rounded-full", TONE_BG[tone])} />
      <p className="mt-4">
        <span className="text-[28px] font-semibold">{value}</span>
        <span className="ml-0.5 text-xs text-ink-2">{unit}</span>
      </p>
      <p className={cn("text-xs", label === "Udara baik" ? TONE_TEXT.muted : "text-ink-2")}>{label}</p>
    </div>
  );
}

function KpiCard({ icon, label, value, unit }: { icon: LucideIcon; label: string; value: string; unit?: string }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2.5">
        <IconTile icon={icon} />
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-3 flex items-baseline justify-between">
        <span className="text-[22px] font-semibold">{value}</span>
        {unit && <span className="text-xs text-ink-2">{unit}</span>}
      </p>
    </div>
  );
}
