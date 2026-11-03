"use client";

import { useState } from "react";
import { CloudRain, DoorOpen, Droplets, Lightbulb, Trash2, Waves, type LucideIcon } from "lucide-react";
import { cn, fmt } from "@/lib/utils";
import { Bar, Dot, IconTile, Legend, Panel, PanelHeader, Pill, TONE_TEXT } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/segmented";
import { AreaTrend } from "@/components/charts/area-trend";
import { Ring } from "@/components/charts/ring";
import { BaseMap, MapLines, MapMarker } from "@/components/maps/base-map";
import { PinDiamond, PinSquare } from "@/components/maps/pins";
import { CITYOPS_KPI, CITYOPS_MAP, HYDRO, OPS_LOG, PJU, TMA_SERIES, WASTE, WATER_ASSETS } from "@/data/bogor";

const ICON: Record<string, LucideIcon> = { wave: Waves, gate: DoorOpen, pump: Droplets, rain: CloudRain, bulb: Lightbulb, trash: Trash2 };
const FILTERS = ["Semua", "Hidrologi", "PJU", "Persampahan"] as const;
type Filter = (typeof FILTERS)[number];

export function CityOperationView() {
  const [filter, setFilter] = useState<Filter>("Semua");
  const [showAllLog, setShowAllLog] = useState(false);
  const show = (f: Filter) => filter === "Semua" || filter === f;
  const tmaData = TMA_SERIES.map((d) => ({ ...d }));

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr_420px]">
      {/* ── hidrologi ── */}
      <Panel>
        <PanelHeader title="Hidrologi" aside={<Pill tone="ok">{HYDRO.status}</Pill>} />
        <div className="flex items-start gap-4">
          <IconTile icon={Waves} size="lg" />
          <div className="flex-1">
            <p className="flex items-baseline gap-1">
              <span className="text-4xl font-semibold">{HYDRO.tma}</span>
              <span className="text-sm text-ink-2">cm</span>
            </p>
            <p className="text-[13px] text-ink-2">TMA Bendung Katulampa</p>
          </div>
          <span className="text-[13px] text-warn">▲ {HYDRO.rise}</span>
        </div>
        <div className="mt-4 rounded-lg bg-panel-2 pt-2">
          <AreaTrend data={tmaData} xKey="t" series={[{ key: "v", color: "#6d7cf0", name: "TMA" }]} height={150} yDomain={[0, 220]} hLines={HYDRO.thresholds.map((t) => ({ y: t.v, color: t.color }))} unit=" cm" />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
          {HYDRO.thresholds.map((t) => (
            <span key={t.label} className="inline-flex items-center gap-1.5">
              <Dot color={t.color} shape="dash" /> {t.label} · {t.v}
            </span>
          ))}
        </div>
        <p className="mt-5 mb-1 text-[13px] text-ink-2">Pos pantau & aset air</p>
        <ul className="divide-y divide-line">
          {WATER_ASSETS.map((a) => (
            <li key={a.label} className="flex items-center gap-3 py-3">
              <IconTile icon={ICON[a.icon]} tone={a.tone} size="sm" />
              <span className="flex-1 text-sm">{a.label}</span>
              <span className={cn("text-sm", TONE_TEXT[a.valueTone])}>{a.value}</span>
            </li>
          ))}
        </ul>
      </Panel>

      {/* ── peta ── */}
      <div className="panel relative min-h-[560px] overflow-hidden p-0">
        <BaseMap styleKey="light" center={[106.7952, -6.5832]} zoom={14}>
          {show("PJU") && <MapLines id="pju-off" lines={CITYOPS_MAP.pjuOff} color="#ff3d63" width={4} dashed />}
          {show("Hidrologi") &&
            CITYOPS_MAP.waterPosts.map((p) => (
              <MapMarker key={`w${p}`} at={p}>
                <PinDiamond color="#4c5fe6" size={14} />
              </MapMarker>
            ))}
          {show("Persampahan") && (
            <>
              {CITYOPS_MAP.tpsFull.map((p) => (
                <MapMarker key={`t${p}`} at={p}>
                  <PinSquare color="#ff8a2a" />
                </MapMarker>
              ))}
              {CITYOPS_MAP.trucks.map((p) => (
                <MapMarker key={`k${p}`} at={p}>
                  <span className="block size-3.5 rounded-full border-[3px] border-ok bg-white shadow" />
                </MapMarker>
              ))}
            </>
          )}
        </BaseMap>
        <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-xl bg-canvas/85 px-4 py-2.5 backdrop-blur">
          <h2 className="text-lg font-semibold">Peta operasional kota</h2>
          <p className="text-xs text-ink-2">Pantau aset air, penerangan jalan, dan armada sampah</p>
        </div>
        <Segmented options={FILTERS} value={filter} onChange={setFilter} size="sm" className="absolute top-4 right-4 z-10" />
        <Legend
          className="absolute bottom-4 left-4 z-10"
          items={[
            { label: "Pos pantau air", swatch: <Dot color="#4c5fe6" shape="diamond" /> },
            { label: "Ruas PJU padam", swatch: <Dot color="#ff3d63" shape="dash" /> },
            { label: "TPS hampir penuh", swatch: <Dot color="#ff8a2a" shape="square" /> },
            { label: "Truk sampah", swatch: <Dot color="#3dd4a0" shape="ring" /> },
          ]}
        />
      </div>

      {/* ── kanan ── */}
      <div className="flex flex-col gap-5">
        <Panel>
          <PanelHeader title="Penerangan jalan umum" aside={`${fmt(PJU.total)} titik`} />
          <div className="flex items-center gap-6">
            <Ring segments={[{ value: PJU.on, color: "#3dd4a0" }, { value: PJU.off, color: "#ff3d63" }, { value: PJU.maintenance, color: "#5d6178" }]} size={104} stroke={11}>
              <span className="text-2xl font-semibold">{Math.round((PJU.on / PJU.total) * 100)}%</span>
            </Ring>
            <ul className="flex-1 space-y-2 text-sm">
              {[
                { l: "Menyala", v: PJU.on, c: "border-ok" },
                { l: "Padam", v: PJU.off, c: "border-danger" },
                { l: "Pemeliharaan", v: PJU.maintenance, c: "border-ink-3" },
              ].map((r) => (
                <li key={r.l} className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <span className={cn("size-3 rounded-full border-2", r.c)} />
                    {r.l}
                  </span>
                  <span className="tabular-nums">{fmt(r.v)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-3 text-sm">
            <span className="text-ink-2">PJU pintar terhubung</span>
            <span>{PJU.smart}%</span>
          </div>
        </Panel>

        <Panel className="flex-1">
          <PanelHeader title="Persampahan" aside="ke TPA Galuga" />
          <div className="grid grid-cols-3 gap-2">
            <Mini label="Armada" value={WASTE.armada} of={WASTE.armadaTotal} />
            <Mini label="Ritase" value={WASTE.ritase} />
            <Mini label="TPS >80%" value={WASTE.tpsPenuh} warn />
          </div>
          <ul className="mt-4 space-y-3">
            {WASTE.tps.map((t) => {
              const tone = t.fill >= 85 ? "danger" : t.fill >= 75 ? "warn" : "ok";
              return (
                <li key={t.name} className="grid grid-cols-[1fr_100px_38px] items-center gap-3 text-sm">
                  <span className="truncate">{t.name}</span>
                  <Bar value={t.fill} tone={tone} className="h-1.5" />
                  <span className={cn("text-right tabular-nums", TONE_TEXT[tone])}>{t.fill}%</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      {/* ── bawah ── */}
      <div className="grid gap-5 sm:grid-cols-2 xl:col-span-3 xl:grid-cols-[repeat(4,1fr)_1.9fr]">
        {CITYOPS_KPI.map((k) => (
          <Panel key={k.label} className="flex items-center gap-4">
            <IconTile icon={ICON[k.icon]} tone={k.tone} size="lg" />
            <div className="leading-tight">
              <p className="flex items-baseline gap-1">
                <span className="text-[28px] font-semibold">{k.value}</span>
                <span className="text-xs text-ink-2">{k.unit}</span>
              </p>
              <p className="text-[13px] text-ink-2">{k.label}</p>
            </div>
          </Panel>
        ))}
        <Panel className="sm:col-span-2 xl:col-span-1">
          <PanelHeader
            title="Log operasi terbaru"
            className="mb-2"
            aside={
              <button type="button" onClick={() => setShowAllLog((s) => !s)} className="text-brand-soft hover:underline">
                {showAllLog ? "Ringkas" : "Lihat semua"}
              </button>
            }
          />
          <ul className="divide-y divide-line">
            {(showAllLog ? OPS_LOG : OPS_LOG.slice(0, 2)).map((l) => (
              <li key={l.time} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="text-ink-2 tabular-nums">{l.time}</span>
                <span className={cn("size-1.5 rounded-full", l.tone === "brand" ? "bg-brand" : l.tone === "warn" ? "bg-danger" : "bg-ok")} />
                <span className="min-w-0 flex-1 truncate">{l.text}</span>
                <Pill tone={l.tone}>{l.status}</Pill>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Mini({ label, value, of, warn }: { label: string; value: number; of?: number; warn?: boolean }) {
  return (
    <div className="tile px-3 py-2.5">
      <p className="text-[11px] text-ink-2">{label}</p>
      <p className="mt-0.5">
        <span className={cn("text-xl font-semibold", warn && "text-warn")}>{value}</span>
        {of != null && <span className="text-xs text-ink-2">/{of}</span>}
      </p>
    </div>
  );
}
