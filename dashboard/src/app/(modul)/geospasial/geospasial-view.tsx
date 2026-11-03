"use client";

import { useEffect, useState } from "react";
import {
  Cctv, ChevronDown, Flame, Grid2x2, Hexagon, Layers, Minus, Mountain, Plus, Radius, Ruler, School, Waves, type LucideIcon,
} from "lucide-react";
import { cn, fmt } from "@/lib/utils";
import { IconTile, Panel, PanelHeader, Pill } from "@/components/ui/primitives";
import { Segmented, Toggle } from "@/components/ui/segmented";
import { BaseMap, MapMarker, useMap, type MapStyleKey } from "@/components/maps/base-map";
import { PinDot } from "@/components/maps/pins";
import { GEO_POINTS, KEC_CENTER, KECAMATAN, LAYERS, SPATIAL_TOOLS, type KecamatanId, type LngLat } from "@/data/bogor";

const LAYER_ICON: Record<string, LucideIcon> = { grid: Grid2x2, waves: Waves, mountain: Mountain, cctv: Cctv, plus: Plus, school: School };
const TOOL_ICON: Record<string, LucideIcon> = { radius: Radius, flame: Flame, layers: Layers, waves: Waves };
const LAYER_COLOR: Record<string, string> = { cctv: "#9b51ff", faskes: "#ff3d63", sekolah: "#22b8e6", longsor: "#f6c443" };
const BASEMAPS: { value: MapStyleKey; label: string }[] = [
  { value: "dark", label: "Gelap" },
  { value: "3d", label: "Terang" },
  { value: "positron", label: "Netral" },
];
const MODES = ["3D", "Bandingkan", "Linimasa"] as const;
type Mode = (typeof MODES)[number];

const initialLayers = Object.fromEntries(LAYERS.flatMap((g) => g.items.map((i) => [i.id, i.on]))) as Record<string, boolean>;

export function GeospasialView() {
  const [layers, setLayers] = useState(initialLayers);
  const [basemap, setBasemap] = useState<MapStyleKey>("3d");
  const [kec, setKec] = useState<KecamatanId>("tengah");
  const [mode, setMode] = useState<Mode>("3D");
  const [tool, setTool] = useState<string | null>(null);
  const [year, setYear] = useState(2026);
  const k = KECAMATAN.find((x) => x.id === kec)!;
  const center = KEC_CENTER[kec];
  const shift = (p: LngLat): LngLat => [p[0] + center[0] - KEC_CENTER.tengah[0], p[1] + center[1] - KEC_CENTER.tengah[1]];
  const activeCount = Object.values(layers).filter(Boolean).length;
  const zoneScale = mode === "Linimasa" ? 0.6 + ((year - 2020) / 6) * 0.6 : 1;

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr_420px]">
      {/* ── layer ── */}
      <Panel className="flex flex-col">
        <PanelHeader title="Layer peta" aside={`${activeCount} aktif`} />
        <div className="flex-1 space-y-5">
          {LAYERS.map((g) => (
            <div key={g.group}>
              <p className="mb-2 text-xs text-ink-2">{g.group}</p>
              <ul className="space-y-1">
                {g.items.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 py-1.5">
                    <IconTile icon={LAYER_ICON[i.icon]} tone={layers[i.id] ? (i.tone === "muted" ? "brand" : i.tone) : "muted"} size="sm" />
                    <span className="flex-1 text-sm">{i.label}</span>
                    <Toggle checked={layers[i.id]} onChange={(v) => setLayers((s) => ({ ...s, [i.id]: v }))} label={i.label} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <label className="mt-6 block">
          <span className="text-xs text-ink-2">Peta dasar</span>
          <span className="relative mt-1.5 block">
            <select
              value={basemap}
              onChange={(e) => setBasemap(e.target.value as MapStyleKey)}
              className="w-full appearance-none rounded-lg border border-line bg-panel-2 py-2.5 pr-9 pl-3 text-sm outline-none focus:border-brand"
            >
              {BASEMAPS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-2" />
          </span>
        </label>
      </Panel>

      {/* ── peta ── */}
      <div className="panel relative min-h-[560px] overflow-hidden p-0 xl:min-h-[730px]">
        <BaseMap styleKey={basemap} center={center} zoom={mode === "Bandingkan" ? 14.2 : 15.6} pitch={mode === "3D" ? 58 : 0} bearing={mode === "3D" ? -20 : 0} extrude>
          {layers.cctv &&
            GEO_POINTS.cctv.map((p) => (
              <MapMarker key={`c${p}`} at={shift(p)}>
                <PinDot color={LAYER_COLOR.cctv} size={14} ring="#16172a" />
              </MapMarker>
            ))}
          {layers.faskes &&
            GEO_POINTS.faskes.map((p) => (
              <MapMarker key={`f${p}`} at={shift(p)}>
                <span className="grid size-6 place-items-center rounded-full border-2 border-white bg-danger text-white shadow">
                  <Plus className="size-3.5" />
                </span>
              </MapMarker>
            ))}
          {layers.sekolah &&
            GEO_POINTS.sekolah.map((p) => (
              <MapMarker key={`s${p}`} at={shift(p)}>
                <span className="grid size-6 place-items-center rounded-full border-2 border-white bg-sky text-white shadow">
                  <School className="size-3.5" />
                </span>
              </MapMarker>
            ))}
          {layers.banjir &&
            GEO_POINTS.banjir.map((p, i) => (
              <MapMarker key={`b${p}`} at={shift(p)}>
                <span
                  className="block rounded-full border border-dashed border-warn bg-warn/35"
                  style={{ width: (70 + i * 14) * zoneScale, height: (52 + i * 10) * zoneScale }}
                />
              </MapMarker>
            ))}
          {layers.longsor &&
            GEO_POINTS.longsor.map((p) => (
              <MapMarker key={`l${p}`} at={shift(p)}>
                <span className="block size-16 rounded-full border border-dashed border-amber bg-amber/30" />
              </MapMarker>
            ))}
          {tool === "Radius layanan" && (
            <MapMarker at={center}>
              <span className="block size-64 rounded-full border-2 border-brand bg-brand/15" />
            </MapMarker>
          )}
          {tool === "Peta panas aduan" && (
            <MapMarker at={center}>
              <span className="block size-72 rounded-full bg-[radial-gradient(circle,rgba(255,61,99,0.6),rgba(255,138,42,0.3)_45%,transparent_70%)]" />
            </MapMarker>
          )}
          <MapTools />
          <CoordReadout />
        </BaseMap>

        <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-xl bg-canvas/85 px-4 py-2.5 backdrop-blur">
          <h2 className="text-lg font-semibold">Peta GIS Kota Bogor</h2>
          <p className="text-xs text-ink-2">Klik kecamatan di bawah untuk melihat detail wilayah</p>
        </div>
        <Segmented options={MODES} value={mode} onChange={setMode} size="sm" className="absolute top-4 right-4 z-10" />

        {mode === "Linimasa" && (
          <div className="absolute inset-x-4 bottom-16 z-10 mx-auto max-w-md rounded-xl bg-canvas/90 px-4 py-3 backdrop-blur">
            <div className="flex justify-between text-xs text-ink-2">
              <span>Perluasan zona rawan banjir</span>
              <span className="text-ink">{year}</span>
            </div>
            <input type="range" min={2020} max={2026} value={year} onChange={(e) => setYear(Number(e.target.value))} className="mt-2 w-full accent-brand" aria-label="Tahun" />
          </div>
        )}
      </div>

      {/* ── detail ── */}
      <div className="flex flex-col gap-5">
        <Panel>
          <PanelHeader title={k.name} aside={<Pill tone="brand">Terpilih</Pill>} />
          <div className="grid grid-cols-2 gap-3">
            <Info label="Luas wilayah" value={k.luas.toString().replace(".", ",")} unit="km²" />
            <Info label="Kelurahan" value={k.kelurahan} />
            <Info label="Penduduk" value={fmt(k.penduduk)} />
            <Info label="Kepadatan" value={fmt(Math.round(k.penduduk / k.luas))} unit="/km²" />
          </div>
          <ul className="mt-2 divide-y divide-line">
            {[
              { l: "Titik rawan banjir", v: k.rawanBanjir, i: Waves, t: "warn" as const },
              { l: "Titik rawan longsor", v: k.rawanLongsor, i: Mountain, t: "danger" as const },
              { l: "Kamera CCTV", v: k.cctv, i: Cctv, t: "violet" as const },
            ].map((r) => (
              <li key={r.l} className="flex items-center gap-3 py-3.5">
                <IconTile icon={r.i} tone={r.t} size="sm" />
                <span className="flex-1 text-sm">{r.l}</span>
                <span className="font-semibold tabular-nums">{r.v}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="flex-1">
          <PanelHeader title="Analisis spasial" />
          <div className="grid grid-cols-2 gap-3">
            {SPATIAL_TOOLS.map((t) => (
              <button
                key={t.label}
                type="button"
                aria-pressed={tool === t.label}
                onClick={() => setTool(tool === t.label ? null : t.label)}
                className={cn("flex items-center gap-3 rounded-[10px] border px-3 py-3 text-left text-sm transition", tool === t.label ? "border-brand bg-brand/15" : "border-transparent bg-panel-2 hover:border-line")}
              >
                <IconTile icon={TOOL_ICON[t.icon]} tone={t.tone} size="sm" />
                <span className="leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-[13px] text-ink-2">
            {tool ? `${tool} aktif di ${k.name}. Klik lagi untuk menonaktifkan.` : "Pilih alat, lalu klik atau gambar area di peta."}
          </p>
        </Panel>
      </div>

      {/* ── kecamatan ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:col-span-3 xl:grid-cols-6">
        {KECAMATAN.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setKec(x.id)}
            className={cn("panel relative p-5 text-left transition", kec === x.id ? "border-brand bg-brand/20" : "hover:border-white/15")}
          >
            <span className={cn("absolute top-5 right-5 size-2 rounded-full", kec === x.id ? "bg-brand-soft" : "bg-white/15")} />
            <span className="block text-[15px] font-medium">{x.name}</span>
            <span className="mt-0.5 block text-xs text-ink-2">
              {x.luas.toString().replace(".", ",")} km² · {x.kelurahan} kelurahan
            </span>
            <span className="mt-2 flex items-baseline gap-1">
              <span className="text-[22px] font-semibold">{fmt(x.penduduk)}</span>
              <span className="text-xs text-ink-2">jiwa</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value, unit }: { label: string; value: React.ReactNode; unit?: string }) {
  return (
    <div className="tile px-3 py-2.5">
      <p className="text-xs text-ink-2">{label}</p>
      <p className="mt-0.5 flex items-baseline gap-1">
        <span className="text-[22px] font-semibold">{value}</span>
        {unit && <span className="text-xs text-ink-2">{unit}</span>}
      </p>
    </div>
  );
}

function MapTools() {
  const { map } = useMap();
  const btn = "grid size-10 place-items-center rounded-lg bg-canvas/90 text-ink shadow-lg backdrop-blur hover:bg-panel-2 [&_svg]:size-4";
  return (
    <div className="absolute top-1/2 right-4 z-10 flex -translate-y-1/2 flex-col gap-2">
      <button type="button" aria-label="Perbesar" className={btn} onClick={() => map?.zoomIn()}>
        <Plus />
      </button>
      <button type="button" aria-label="Perkecil" className={btn} onClick={() => map?.zoomOut()}>
        <Minus />
      </button>
      <button type="button" aria-label="Ukur jarak" className={btn}>
        <Ruler />
      </button>
      <button type="button" aria-label="Gambar area" className={btn}>
        <Hexagon />
      </button>
    </div>
  );
}

function CoordReadout() {
  const { map } = useMap();
  const [pos, setPos] = useState<{ lng: number; lat: number; scale: number } | null>(null);
  useEffect(() => {
    if (!map) return;
    const update = (lng: number, lat: number) => {
      const mpp = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** map.getZoom();
      setPos({ lng, lat, scale: Math.round((mpp * 96) / 0.0254 / 500) * 500 });
    };
    const onMove = (e: { lngLat: { lng: number; lat: number } }) => update(e.lngLat.lng, e.lngLat.lat);
    const onZoom = () => {
      const c = map.getCenter();
      update(c.lng, c.lat);
    };
    map.on("mousemove", onMove);
    map.on("zoomend", onZoom);
    onZoom();
    return () => {
      map.off("mousemove", onMove);
      map.off("zoomend", onZoom);
    };
  }, [map]);
  if (!pos) return null;
  return (
    <div className="absolute right-12 bottom-3 z-10 rounded-lg bg-canvas/90 px-3 py-1.5 font-mono text-xs text-ink-2 backdrop-blur">
      {pos.lat.toFixed(4).replace(".", ",")}°, {pos.lng.toFixed(4).replace(".", ",")}° · skala 1:{fmt(pos.scale)}
    </div>
  );
}
