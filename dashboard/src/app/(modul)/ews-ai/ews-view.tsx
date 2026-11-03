"use client";

import { useState } from "react";
import { Activity, CloudLightning, Flame, Leaf, Megaphone, Mountain, Waves, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Bar, Dot, IconTile, Legend, Panel, PanelHeader, Pill } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/segmented";
import { AreaTrend } from "@/components/charts/area-trend";
import { BaseMap, MapLines, MapMarker, MapPolygons, ellipse } from "@/components/maps/base-map";
import {
  EWS_ZONES, KEC_CENTER, KECAMATAN, RIVERS,
  ACTIVE_WARNINGS, AI_PRED, AI_SERIES, BROADCAST_CHANNELS, CITY_LEVEL_INDEX, CITY_LEVELS, FORECAST_PROB, FORECAST_SCALE, FORECAST_STEPS, HAZARDS, RECOMMENDATIONS, SENSOR_HEALTH,
} from "@/data/bogor";

const HAZARD_ICON: Record<string, LucideIcon> = { flood: Waves, landslide: Mountain, storm: CloudLightning, quake: Activity, fire: Flame, air: Leaf };
const LEVEL_COLOR = ["bg-ok", "bg-warn", "bg-danger", "bg-[#b4123a]"];
type Step = (typeof FORECAST_STEPS)[number];

export function EwsView() {
  const [step, setStep] = useState<Step>("+6 jam");
  const [decisions, setDecisions] = useState<Record<string, "ok" | "no">>({});
  const [channels, setChannels] = useState<Set<string>>(new Set(BROADCAST_CHANNELS.map((c) => c.label)));
  const [published, setPublished] = useState(false);
  const si = FORECAST_STEPS.indexOf(step);
  const s = FORECAST_SCALE[si];
  const prob = FORECAST_PROB[si];

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr_420px]">
      {/* ── kiri ── */}
      <div className="flex flex-col gap-5">
        <Panel className="flex-1">
          <PanelHeader title="Status multi-bencana" aside={<Pill tone="warn" dot>Kota waspada</Pill>} />
          <ul className="divide-y divide-line">
            {HAZARDS.map((h) => (
              <li key={h.kind} className="flex items-center gap-3 py-3 first:pt-0">
                <IconTile icon={HAZARD_ICON[h.kind]} tone={h.tone === "muted" ? "muted" : h.tone} className={h.tone === "muted" ? "bg-[#5d6178] text-white" : ""} />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-[15px]">{h.label}</span>
                  <span className="block truncate text-xs text-ink-2">{h.sub}</span>
                </span>
                <Pill tone={h.status === "Waspada" ? "warn" : "ok"}>{h.status}</Pill>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHeader title="Tingkat status kota" className="mb-3" />
          <div className="grid grid-cols-4 gap-1.5">
            {CITY_LEVELS.map((l, i) => (
              <div key={l}>
                <span className={cn("block h-2 rounded-full", i <= CITY_LEVEL_INDEX ? LEVEL_COLOR[i] : "bg-white/8", i === CITY_LEVEL_INDEX && "ring-2 ring-warn/40")} />
                <span className={cn("mt-2 block text-[13px]", i === CITY_LEVEL_INDEX ? "font-semibold text-warn" : "text-ink-2")}>{l}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px] text-ink-2">Ditetapkan 09.30 karena potensi hujan lebat sore ini.</p>
        </Panel>
      </div>

      {/* ── peta risiko ── */}
      <div className="panel relative min-h-[560px] overflow-hidden p-0">
        <BaseMap styleKey="light" center={[106.7952, -6.5935]} zoom={12.2} padding={{ top: 60, right: 300 }}>
          <MapLines id="ews-rivers" lines={[RIVERS.ciliwung, RIVERS.cisadane]} color="#4c5fe6" width={3} />
          <MapPolygons id="ews-flood-ext" polygons={[ellipse(EWS_ZONES.flood.at, EWS_ZONES.flood.rx * 1.6 * s, EWS_ZONES.flood.ry * 1.6 * s)]} fill="#ff8a2a" fillOpacity={0.14} line="#ff8a2a" dashed />
          <MapPolygons id="ews-flood" polygons={[ellipse(EWS_ZONES.flood.at, EWS_ZONES.flood.rx * s, EWS_ZONES.flood.ry * s)]} fill="#ff3d63" fillOpacity={0.35} line="#ff3d63" />
          <MapPolygons id="ews-landslide" polygons={[ellipse(EWS_ZONES.landslide.at, EWS_ZONES.landslide.rx * (0.8 + s * 0.2), EWS_ZONES.landslide.ry * (0.8 + s * 0.2))]} fill="#f6c443" fillOpacity={0.22} line="#d9a521" dashed />
          <MapPolygons id="ews-wind" polygons={[ellipse(EWS_ZONES.wind.at, EWS_ZONES.wind.rx * (0.8 + s * 0.2), EWS_ZONES.wind.ry * (0.8 + s * 0.2))]} fill="#9b51ff" fillOpacity={0.2} line="#9b51ff" dashed />
          {KECAMATAN.map((k) => (
            <MapMarker key={k.id} at={KEC_CENTER[k.id]}>
              <span className="rounded-md bg-canvas/80 px-2 py-0.5 text-xs whitespace-nowrap text-ink backdrop-blur">{k.name}</span>
            </MapMarker>
          ))}
        </BaseMap>
        <div className="absolute top-[72px] right-4 z-10 w-[330px] max-w-[calc(100%-2rem)] rounded-xl border border-danger/40 bg-panel/95 p-4 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between">
            <Pill tone="danger" className="bg-danger text-white">
              Risiko {prob >= 50 ? "tinggi" : prob >= 30 ? "sedang" : "rendah"}
            </Pill>
            <span className="text-xs text-ink-2">perkiraan {step === "Sekarang" ? "10.40" : `+${step.replace(/\D/g, "")} jam`}</span>
          </div>
          <p className="mt-2 text-base font-semibold">Potensi luapan Sungai Ciliwung</p>
          <p className="text-xs text-ink-2">5 kelurahan, sekitar {Math.round(15600 * s).toLocaleString("id-ID")} jiwa terdampak</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-gradient-to-r from-warn to-danger" style={{ width: `${prob}%` }} />
            </span>
            <span className="text-lg font-semibold">{prob}%</span>
          </div>
          <p className="mt-2 text-xs text-ink-2">Keyakinan model 0,82</p>
        </div>
        <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-xl bg-canvas/85 px-4 py-2.5 backdrop-blur">
          <h2 className="text-lg font-semibold">Peta risiko & prediksi dampak</h2>
          <p className="text-xs text-ink-2">Geser waktu untuk melihat perkiraan perluasan zona</p>
        </div>
        <Segmented options={FORECAST_STEPS} value={step} onChange={setStep} size="sm" className="absolute top-4 right-4 z-10" />
        <Legend
          className="absolute bottom-4 left-4 z-10"
          items={[
            { label: "Banjir, risiko tinggi", swatch: <Dot color="#ff3d63" /> },
            { label: "Zona perluasan", swatch: <span className="inline-block size-2.5 rounded-[3px] border border-dashed border-warn" /> },
            { label: "Longsor", swatch: <Dot color="#f6c443" /> },
            { label: "Angin kencang", swatch: <Dot color="#9b51ff" /> },
          ]}
        />
      </div>

      {/* ── kanan ── */}
      <div className="flex flex-col gap-5">
        <Panel>
          <PanelHeader title="Prediksi AI" aside="diperbarui 10.40" />
          <div className="grid grid-cols-3 gap-2">
            {AI_PRED.map((p) => (
              <div key={p.label} className={cn("rounded-[10px] px-3 py-2.5", p.tone === "danger" ? "bg-danger/15" : "bg-panel-2")}>
                <p className={cn("text-xs", p.tone === "danger" ? "text-danger" : "text-ink-2")}>{p.label}</p>
                <p className="text-[22px] font-semibold">{p.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-panel-2 pt-1">
            <AreaTrend
              data={AI_SERIES}
              xKey="t"
              series={[
                { key: "actual", color: "#6d7cf0", name: "TMA aktual", fill: false },
                { key: "pred", color: "#f6a33b", name: "Prediksi", dashed: true },
              ]}
              height={110}
              yDomain={[10, 80]}
              marker={{ index: 14, key: "actual" }}
            />
          </div>
          <div className="mt-2 flex gap-5 text-xs text-ink-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-brand-soft" /> TMA aktual
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Dot color="#f6a33b" shape="dash" /> Prediksi 6 jam
            </span>
          </div>
        </Panel>

        <Panel className="flex-1">
          <PanelHeader title="Rekomendasi tindakan" aside="perlu persetujuan" />
          <ul className="space-y-3">
            {RECOMMENDATIONS.map((r) => {
              const d = decisions[r.id];
              return (
                <li key={r.id} className="tile p-3.5">
                  <p className="text-sm">{r.title}</p>
                  <p className="mt-0.5 text-xs text-ink-2">{r.reason}</p>
                  {d ? (
                    <p className={cn("mt-3 text-xs font-medium", d === "ok" ? "text-ok" : "text-ink-3")}>
                      {d === "ok" ? "✓ Disetujui, diteruskan ke OPD" : "Ditolak"}
                      <button type="button" className="ml-3 font-normal text-ink-2 underline" onClick={() => setDecisions((s) => { const n = { ...s }; delete n[r.id]; return n; })}>
                        batalkan
                      </button>
                    </p>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => setDecisions((s) => ({ ...s, [r.id]: "no" }))} className="rounded-md border border-line px-4 py-1.5 text-sm hover:bg-white/5">
                        Tolak
                      </button>
                      <button type="button" onClick={() => setDecisions((s) => ({ ...s, [r.id]: "ok" }))} className="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-white hover:brightness-110">
                        Setuju
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      {/* ── bawah ── */}
      <div className="grid gap-5 md:grid-cols-2 xl:col-span-3 xl:grid-cols-[1fr_1.2fr_1fr_0.8fr]">
        <Panel>
          <PanelHeader title="Peringatan aktif" aside={<Pill tone="warn">{ACTIVE_WARNINGS.length} berlaku</Pill>} />
          <ul className="divide-y divide-line">
            {ACTIVE_WARNINGS.map((w) => (
              <li key={w.text} className="flex items-center gap-3 py-2.5 text-sm first:pt-0">
                <span className="size-1.5 rounded-full bg-warn" />
                <span className="flex-1">{w.text}</span>
                <span className="text-xs text-ink-2">{w.time}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHeader title="Sebarkan peringatan" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BROADCAST_CHANNELS.map((c) => {
              const on = channels.has(c.label);
              return (
                <button
                  key={c.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setChannels((s) => {
                      const n = new Set(s);
                      if (on) n.delete(c.label);
                      else n.add(c.label);
                      return n;
                    })
                  }
                  className={cn("rounded-lg border px-2 py-2.5 text-center transition", on ? "border-brand/60 bg-brand/12" : "border-line bg-panel-2 opacity-60")}
                >
                  <span className="block text-sm">{c.label}</span>
                  <span className="block text-[11px] text-ink-2">{c.meta}</span>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Kesehatan sensor" aside={<span className="text-ok">{SENSOR_HEALTH.overall}%</span>} className="mb-3" />
          <ul className="space-y-2">
            {SENSOR_HEALTH.items.map((x) => (
              <li key={x.label} className="grid grid-cols-[1fr_90px_40px] items-center gap-3 text-sm">
                <span>{x.label}</span>
                <Bar value={x.ok} max={x.total} tone={x.tone} className="h-1.5" />
                <span className="text-right text-ink-2 tabular-nums">
                  {x.ok}/{x.total}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="flex flex-col justify-center gap-3">
          <button
            type="button"
            disabled={channels.size === 0}
            onClick={() => setPublished((p) => !p)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold text-white transition disabled:opacity-40",
              published ? "bg-ok/80" : "bg-danger hover:brightness-110",
            )}
          >
            <Megaphone className="size-4" />
            {published ? `Terbit ke ${channels.size} kanal` : "Terbitkan peringatan"}
          </button>
          <p className="text-center text-xs text-ink-2">{published ? "Klik lagi untuk menarik peringatan" : "Akurasi model 87% dalam 30 hari"}</p>
        </Panel>
      </div>
    </div>
  );
}
