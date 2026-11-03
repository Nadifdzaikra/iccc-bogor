"use client";

import { useState } from "react";
import { Car, Flame, Send, Waves, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Bar, Dot, IconTile, Legend, Panel, PanelHeader, Pill, TONE_BG } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/segmented";
import { Ring } from "@/components/charts/ring";
import { BaseMap, MapMarker } from "@/components/maps/base-map";
import { CalloutCard, PinDiamond, PinDot } from "@/components/maps/pins";
import { AGENTS, CALL_MAP, CALL_TODAY, CHANNELS, COMPLAINT_CATEGORIES, EMERGENCIES, TICKETS, UNITS } from "@/data/bogor";

const EMG_ICON: Record<string, LucideIcon> = { fire: Flame, flood: Waves, accident: Car };
const MAP_LAYERS = ["Aduan", "Darurat 112", "Unit"] as const;
type MapLayer = (typeof MAP_LAYERS)[number];

export function CallCenterView() {
  const [layers, setLayers] = useState<Set<MapLayer>>(new Set(MAP_LAYERS));
  const [queue, setQueue] = useState<"Semua" | "Aduan" | "Darurat">("Semua");
  const [selected, setSelected] = useState(0);
  const [dispatched, setDispatched] = useState<Set<number>>(new Set([2]));
  const channelMax = Math.max(...CHANNELS.map((c) => c.value));
  const tickets = TICKETS.filter((t) => queue === "Semua" || t.type === queue);
  const toggleLayer = (l: MapLayer) =>
    setLayers((s) => {
      const n = new Set(s);
      if (n.has(l)) n.delete(l);
      else n.add(l);
      return n;
    });

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr_420px]">
      {/* ── kiri ── */}
      <div className="flex flex-col gap-5">
        <Panel>
          <PanelHeader title="Hari ini" aside={<Pill tone="ok" dot>Layanan 24 jam</Pill>} />
          <div className="grid grid-cols-2 gap-3">
            <Tile label="Aduan masuk" value={CALL_TODAY.aduan} note={<span className="text-danger">▲ {CALL_TODAY.aduanDelta}%</span>} />
            <Tile label="Darurat aktif" value={CALL_TODAY.darurat} note={`${CALL_TODAY.unitJalan} unit jalan`} danger />
            <Tile label="Diproses OPD" value={CALL_TODAY.diproses} note={<span className="text-danger">{CALL_TODAY.lewatSla} lewat SLA</span>} />
            <Tile label="Respons rata-rata" value={CALL_TODAY.respons} note={<span className="text-ok">▼ {CALL_TODAY.responsDelta}%</span>} />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Kanal masuk" aside="hari ini" />
          <ul className="space-y-3.5">
            {CHANNELS.map((c) => (
              <li key={c.label}>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", TONE_BG[c.tone])} />
                    {c.label}
                  </span>
                  <span className="tabular-nums">{c.value}</span>
                </div>
                <Bar value={c.value} max={channelMax} tone={c.tone} className="mt-1.5" />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="flex-1">
          <PanelHeader title="Kategori aduan" />
          <div className="flex items-center gap-6">
            <Ring segments={COMPLAINT_CATEGORIES.map((c) => ({ value: c.value, color: c.color }))} size={112} stroke={11}>
              <span className="leading-tight">
                <span className="block text-2xl font-semibold">{CALL_TODAY.aduan}</span>
                <span className="text-[11px] text-ink-2">aduan</span>
              </span>
            </Ring>
            <ul className="flex-1 space-y-2 text-sm">
              {COMPLAINT_CATEGORIES.map((c) => (
                <li key={c.label} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Dot color={c.color} />
                    {c.label}
                  </span>
                  <span className="text-ink-2 tabular-nums">{c.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      {/* ── peta ── */}
      <div className="panel relative min-h-[520px] overflow-hidden p-0 xl:min-h-0">
        <BaseMap styleKey="light" center={[106.7972, -6.5885]} zoom={13.4}>
          {layers.has("Aduan") &&
            CALL_MAP.complaints.map((p) => (
              <MapMarker key={p.join()} at={p}>
                <PinDot color="#e0262f" size={10} />
              </MapMarker>
            ))}
          {layers.has("Unit") &&
            CALL_MAP.units.map((p) => (
              <MapMarker key={p.join()} at={p}>
                <PinDiamond color="#4c5fe6" />
              </MapMarker>
            ))}
          {layers.has("Darurat 112") && (
            <>
              {CALL_MAP.incidents.map((p) => (
                <MapMarker key={p.join()} at={p}>
                  <PinDot color="#ff3d63" size={16} pulse ring="#16172a" />
                </MapMarker>
              ))}
              <MapMarker at={EMERGENCIES[selected].at} anchor="top" zIndex={5}>
                <div className="mt-5 w-[290px] rounded-xl border border-line bg-panel/95 p-4 shadow-2xl backdrop-blur">
                  <div className="flex items-center justify-between">
                    <Pill tone="danger" className="bg-danger text-white">Darurat 112</Pill>
                    <span className="text-xs text-ink-2">{CALL_MAP.callout.time}</span>
                  </div>
                  <p className="mt-2 text-base font-semibold">{EMERGENCIES[selected].title}</p>
                  <p className="text-xs text-ink-2">{EMERGENCIES[selected].place}</p>
                  <div className="mt-3 flex justify-between border-t border-line pt-2 text-xs">
                    <span>{EMERGENCIES[selected].place.split("·")[1]?.trim()}</span>
                    <span className="text-warn">{EMERGENCIES[selected].eta === "di lokasi" ? "di lokasi" : `tiba ${EMERGENCIES[selected].eta.replace("mnt", "menit")}`}</span>
                  </div>
                </div>
              </MapMarker>
            </>
          )}
          <MapMarker at={[106.8062, -6.5872]} anchor="bottom">
            <CalloutCard icon={Car} title="Lakalantas" sub="Jl. Pajajaran" />
          </MapMarker>
        </BaseMap>

        <div className="absolute top-4 right-4 z-10 flex gap-1 rounded-full border border-line bg-canvas/85 p-1 backdrop-blur">
          {MAP_LAYERS.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={layers.has(l)}
              onClick={() => toggleLayer(l)}
              className={cn("rounded-full px-4 py-1.5 text-[13px] font-medium", layers.has(l) ? "bg-brand text-white" : "text-ink-2 hover:text-ink")}
            >
              {l}
            </button>
          ))}
        </div>
        <Legend
          className="absolute bottom-4 left-4 z-10"
          items={[
            { label: "Kejadian darurat", swatch: <Dot color="#ff3d63" /> },
            { label: "Unit lapangan", swatch: <Dot color="#4c5fe6" shape="diamond" /> },
            { label: "Aduan", swatch: <Dot color="#ff8a2a" shape="dash" /> },
          ]}
        />
      </div>

      {/* ── kanan ── */}
      <div className="flex flex-col gap-5">
        <Panel className="border-danger/30">
          <PanelHeader title="Kedaruratan 112" aside={<Pill tone="danger">{CALL_TODAY.darurat} aktif</Pill>} />
          <ul className="divide-y divide-line">
            {EMERGENCIES.map((e, i) => (
              <li key={e.title}>
                <button type="button" onClick={() => setSelected(i)} className={cn("flex w-full items-center gap-3 py-3 text-left", selected === i && "bg-white/[0.03]")}>
                  <IconTile icon={EMG_ICON[e.kind]} tone="danger" size="sm" />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-sm">{e.title}</span>
                    <span className="block truncate text-xs text-ink-2">{e.place}</span>
                  </span>
                  <span className={cn("text-xs", e.eta === "di lokasi" ? "text-ok" : "text-warn")}>{e.eta}</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={dispatched.has(selected)}
            onClick={() => setDispatched((s) => new Set(s).add(selected))}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-danger py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            <Send className="size-4" />
            {dispatched.has(selected) ? "Unit sudah dikirim" : "Kirim unit"}
          </button>
        </Panel>

        <Panel>
          <PanelHeader title="Kesiapan unit" />
          <div className="grid grid-cols-4 gap-2">
            {UNITS.map((u) => (
              <div key={u.label} className="tile py-3 text-center">
                <p>
                  <span className="text-xl font-semibold">{u.ready}</span>
                  <span className="text-xs text-ink-2">/{u.total}</span>
                </p>
                <p className="mt-1 text-[11px] text-ink-2">{u.label}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="flex-1">
          <PanelHeader title="Agen bertugas" aside="antrean telepon 3" />
          <ul className="space-y-3.5">
            {AGENTS.map((a) => (
              <li key={a.name} className="flex items-center gap-3">
                <span className={cn("grid size-9 place-items-center rounded-lg text-xs font-semibold text-white", a.tone === "muted" ? "bg-warn" : a.tone === "ok" ? "bg-violet" : "bg-brand")}>
                  {a.initials}
                </span>
                <span className="flex-1 leading-tight">
                  <span className="block text-sm">{a.name}</span>
                  <span className="text-xs text-ink-2">{a.tickets} tiket</span>
                </span>
                <Pill tone={a.tone}>{a.status}</Pill>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* ── antrean tiket ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:col-span-3 xl:grid-cols-[300px_repeat(5,1fr)]">
        <Panel className="flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-semibold">Antrian tiket</h2>
            <span className="text-xl font-semibold">{CALL_TODAY.aduan}</span>
          </div>
          <Segmented options={["Semua", "Aduan", "Darurat"] as const} value={queue} onChange={setQueue} size="sm" className="w-fit" />
        </Panel>
        {tickets.map((t) => (
          <Panel key={t.id} className={cn("p-4", t.type === "Darurat" && "border-danger/35")}>
            <div className="flex items-center justify-between">
              <Pill tone={t.type === "Darurat" ? "danger" : "muted"} className={t.type === "Darurat" ? "bg-danger text-white" : ""}>
                {t.type}
              </Pill>
              <span className="text-xs text-ink-2">{t.id}</span>
            </div>
            <p className="mt-3 text-sm font-medium">{t.title}</p>
            <p className="text-xs text-ink-2">{t.place}</p>
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-ink-2">{t.unit}</span>
              <span className={t.type === "Darurat" ? "text-danger" : t.status === "Diverifikasi" ? "text-brand-soft" : "text-warn"}>{t.status}</span>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function Tile({ label, value, note, danger }: { label: string; value: React.ReactNode; note: React.ReactNode; danger?: boolean }) {
  return (
    <div className={cn("rounded-[10px] px-3.5 py-3", danger ? "bg-danger/12" : "bg-panel-2")}>
      <p className={cn("text-xs", danger ? "text-danger" : "text-ink-2")}>{label}</p>
      <p className="mt-1 flex items-baseline gap-1.5">
        <span className="text-[28px] font-semibold">{value}</span>
        <span className="text-[11px] text-ink-2">{note}</span>
      </p>
    </div>
  );
}
