"use client";

import { useMemo, useState } from "react";
import { BedDouble, ChevronDown, Download, Droplet, FileText, GraduationCap, HeartPulse, FileCheck2, TrendingUp, UsersRound, type LucideIcon } from "lucide-react";
import { cn, fmt } from "@/lib/utils";
import { Bar, Delta, IconTile, Panel, PanelHeader, Pill } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/segmented";
import { AreaTrend } from "@/components/charts/area-trend";
import { BaseMap, MapMarker } from "@/components/maps/base-map";
import { DATASETS, HEALTH, KEC_CENTER, KECAMATAN, KEY_INDICATORS, PERMITS, POP_TREND, STAT_CATEGORIES, type KecamatanId } from "@/data/bogor";

const CAT_ICON: Record<string, LucideIcon> = { penduduk: UsersRound, ekonomi: TrendingUp, kesehatan: HeartPulse, perizinan: FileCheck2, pendidikan: GraduationCap };
const HEALTH_ICON: Record<string, LucideIcon> = { heart: HeartPulse, bed: BedDouble, drop: Droplet };
const YEARS = POP_TREND.map((p) => p.year);
const CITY_TOTAL = KECAMATAN.reduce((s, k) => s + k.penduduk, 0);

export function StatistikView() {
  const [year, setYear] = useState(YEARS.at(-1)!);
  const [region, setRegion] = useState<KecamatanId | "all">("all");
  const [cat, setCat] = useState<string>("penduduk");
  const [mode, setMode] = useState<"Grafik" | "Tabel">("Grafik");

  const share = region === "all" ? 1 : KECAMATAN.find((k) => k.id === region)!.penduduk / CITY_TOTAL;
  const series = useMemo(
    () => POP_TREND.filter((p) => p.year <= year).map((p) => ({ year: p.year, v: Math.round(p.v * share * 1_000_000) })),
    [year, share],
  );
  const last = series.at(-1)!.v;
  const prev = series.at(-2)?.v ?? last;
  const growth = ((last - prev) / prev) * 100;
  const sorted = [...KECAMATAN].sort((a, b) => b.penduduk - a.penduduk);
  const maxPop = sorted[0].penduduk;

  const exportCsv = () => {
    const csv = ["tahun,penduduk", ...series.map((s) => `${s.year},${s.v}`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `penduduk-${region}-${year}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr_420px]">
      {/* ── kiri ── */}
      <div className="flex flex-col gap-5">
        <Panel>
          <PanelHeader
            title="Filter"
            aside={
              <button type="button" onClick={() => { setYear(YEARS.at(-1)!); setRegion("all"); }} className="text-brand-soft hover:underline">
                Atur ulang
              </button>
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tahun" value={year} onChange={setYear} options={[...YEARS].reverse().map((y) => ({ value: y, label: y }))} />
            <Select
              label="Wilayah"
              value={region}
              onChange={(v) => setRegion(v as KecamatanId | "all")}
              options={[{ value: "all", label: "Seluruh kota" }, ...KECAMATAN.map((k) => ({ value: k.id, label: k.name }))]}
            />
          </div>
        </Panel>

        <Panel className="flex-1">
          <PanelHeader title="Kategori statistik" />
          <ul className="space-y-3">
            {STAT_CATEGORIES.map((c) => {
              const Icon = CAT_ICON[c.id];
              const active = cat === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setCat(c.id)}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors",
                      active ? "border-brand/70 bg-brand/15" : "border-transparent bg-panel-2 hover:border-line",
                    )}
                  >
                    <IconTile icon={Icon} tone={c.tone} />
                    <span className="leading-tight">
                      <span className="block text-[13px] text-ink-2">{c.label}</span>
                      <span className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-2xl font-semibold">{c.value}</span>
                        <span className="text-xs text-ink-2">{c.unit}</span>
                      </span>
                      <Delta className="mt-1">{c.delta}</Delta>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      {/* ── tengah ── */}
      <Panel className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[19px] font-semibold">Tren pertumbuhan penduduk 10 tahun</h2>
            <p className="text-[13px] text-ink-2">Sumber Disdukcapil, semester I {year}</p>
          </div>
          <div className="flex items-center gap-3">
            <Segmented options={["Grafik", "Tabel"] as const} value={mode} onChange={setMode} size="sm" />
            <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel-2 px-4 py-2 text-sm hover:bg-white/10">
              <Download className="size-4" /> Ekspor
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-5xl font-semibold tracking-tight">{region === "all" ? (last / 1_000_000).toFixed(2).replace(".", ",") : fmt(last)}</span>
          <span className="text-sm text-ink-2">{region === "all" ? "juta jiwa" : "jiwa"}</span>
          <Delta up={growth >= 0}>{Math.abs(growth).toFixed(1).replace(".", ",")}% dari {prev === last ? year : Number(year) - 1}</Delta>
        </div>

        <div className="mt-2 h-[260px] flex-1 xl:h-auto xl:min-h-[220px]">
          {mode === "Grafik" ? (
            <AreaTrend data={series} xKey="year" series={[{ key: "v", color: "#6d7cf0", name: "Penduduk" }]} height="100%" showXAxis grid yDomain={["dataMin - 20000", "dataMax + 5000"]} />
          ) : (
            <div className="h-full max-h-[300px] overflow-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-panel text-left text-xs text-ink-2">
                  <tr>
                    <th className="py-2 font-medium">Tahun</th>
                    <th className="py-2 text-right font-medium">Penduduk</th>
                    <th className="py-2 text-right font-medium">Pertumbuhan</th>
                  </tr>
                </thead>
                <tbody>
                  {[...series].reverse().map((s, i, arr) => {
                    const p = arr[i + 1]?.v;
                    return (
                      <tr key={s.year} className="border-t border-line">
                        <td className="py-2">{s.year}</td>
                        <td className="py-2 text-right tabular-nums">{fmt(s.v)}</td>
                        <td className="py-2 text-right text-ink-2 tabular-nums">{p ? `${(((s.v - p) / p) * 100).toFixed(2).replace(".", ",")}%` : "–"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="relative h-[280px] overflow-hidden rounded-xl">
            <BaseMap styleKey="dark" center={[106.7952, -6.5935]} zoom={11.6} interactive={false}>
              {KECAMATAN.map((k) => {
                const d = k.penduduk / k.luas;
                const sel = region === k.id;
                return (
                  <MapMarker key={k.id} at={KEC_CENTER[k.id]} onClick={() => setRegion(sel ? "all" : k.id)}>
                    <span
                      title={`${k.name}: ${fmt(Math.round(d))} jiwa/km²`}
                      className={cn("block rounded-full border-2 transition-all", sel ? "border-white" : "border-white/30")}
                      style={{ width: 18 + d / 700, height: 18 + d / 700, background: `rgba(76,95,230,${0.25 + Math.min(0.6, d / 22000)})` }}
                    />
                  </MapMarker>
                );
              })}
            </BaseMap>
            <span className="absolute top-3 left-3 rounded-md bg-canvas/85 px-2.5 py-1 text-xs backdrop-blur">Kepadatan per kecamatan</span>
            <span className="absolute right-3 bottom-3 flex items-center gap-2 rounded-md bg-canvas/85 px-2.5 py-1 text-[11px] text-ink-2 backdrop-blur">
              Rendah <span className="h-1.5 w-16 rounded-full bg-gradient-to-r from-brand/20 to-brand" /> Tinggi
            </span>
          </div>

          <ul className="flex flex-col justify-center gap-4">
            {sorted.map((k) => (
              <li key={k.id}>
                <button type="button" onClick={() => setRegion(region === k.id ? "all" : k.id)} className={cn("w-full text-left transition-opacity", region !== "all" && region !== k.id && "opacity-40")}>
                  <span className="flex justify-between text-sm">
                    <span>{k.name}</span>
                    <span className="text-ink-2 tabular-nums">{fmt(k.penduduk)}</span>
                  </span>
                  <Bar value={k.penduduk} max={maxPop} className="mt-1.5 h-1.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      {/* ── kanan ── */}
      <div className="flex flex-col gap-5">
        <Panel>
          <PanelHeader title="Indikator utama" />
          <div className="grid grid-cols-2 gap-3">
            {KEY_INDICATORS.map((k) => (
              <div key={k.label} className="tile px-3 py-3">
                <p className="text-xs text-ink-2">{k.label}</p>
                <p className="mt-0.5 flex items-baseline gap-1">
                  <span className="text-[22px] font-semibold">{k.value}</span>
                  <Delta up={k.up} good={k.good} className="text-[11px]">{k.delta}</Delta>
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Kesehatan" aside="Dinas Kesehatan" />
          <ul className="divide-y divide-line">
            {HEALTH.map((h) => (
              <li key={h.label} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <IconTile icon={HEALTH_ICON[h.icon]} tone={h.tone} size="sm" />
                <span className="flex-1 text-sm">{h.label}</span>
                <span className="font-semibold tabular-nums">{h.value}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="flex-1">
          <PanelHeader title="Perizinan" aside="Oktober 2026" />
          <ul className="space-y-3">
            {PERMITS.map((p) => (
              <li key={p.label} className="grid grid-cols-[92px_1fr_40px] items-center gap-3 text-sm">
                <span className="text-ink-2">{p.label}</span>
                <Bar value={p.value} max={PERMITS[0].value} tone={p.tone} thick />
                <span className="text-right tabular-nums">{p.value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] text-ink-2">Rata-rata penyelesaian 2,4 hari</p>
        </Panel>
      </div>

      {/* ── bawah ── */}
      <div className="grid gap-5 md:grid-cols-2 xl:col-span-3 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
        <Panel className="md:col-span-2 xl:col-span-1">
          <PanelHeader title="Linimasa data" aside={<span className="text-sm text-ink">Tahun {year}</span>} />
          <input
            type="range"
            min={0}
            max={YEARS.length - 1}
            value={YEARS.indexOf(year)}
            onChange={(e) => setYear(YEARS[Number(e.target.value)])}
            aria-label="Pilih tahun"
            className="w-full accent-brand"
          />
          <div className="mt-2 flex justify-between text-xs text-ink-2">
            {["2017", "2020", "2023", "2026"].map((y) => (
              <span key={y}>{y}</span>
            ))}
          </div>
        </Panel>
        {DATASETS.map((d) => (
          <Panel key={d.title} className="transition-colors hover:border-white/15">
            <div className="flex items-start justify-between">
              <IconTile icon={FileText} tone={d.tone} />
              <Pill tone={d.tone}>{d.badge}</Pill>
            </div>
            <p className="mt-4 text-sm font-medium">{d.title}</p>
            <p className="mt-1 text-xs text-ink-2">{d.meta}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function Select<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <label className="block">
      <span className="text-xs text-ink-2">{label}</span>
      <span className="relative mt-1.5 block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="w-full appearance-none rounded-lg border border-line bg-panel-2 py-2.5 pr-9 pl-3 text-sm outline-none focus:border-brand"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-2" />
      </span>
    </label>
  );
}
