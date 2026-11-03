"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { LayerSpecification, Map as MlMap, Marker as MlMarker, PaddingOptions, StyleSpecification } from "maplibre-gl";
import { cn } from "@/lib/utils";
import type { LngLat } from "@/data/bogor";

const POSITRON = process.env.NEXT_PUBLIC_MAP_STYLE_POSITRON || "https://tiles.openfreemap.org/styles/positron";

export const MAP_STYLES = {
  light: process.env.NEXT_PUBLIC_MAP_STYLE_LIGHT || "https://tiles.openfreemap.org/styles/liberty",
  positron: POSITRON,
  /** tema gelap dibuat dari Positron (lihat darkenStyle) kecuali di-override lewat env */
  dark: process.env.NEXT_PUBLIC_MAP_STYLE_DARK || POSITRON,
  "3d": process.env.NEXT_PUBLIC_MAP_STYLE_3D || "https://tiles.openfreemap.org/styles/liberty",
} as const;
/** disalin ke /public oleh scripts/copy-map-worker.mjs */
const WORKER_URL = "/maplibre-gl-worker.mjs";

export type MapStyleKey = keyof typeof MAP_STYLES;

const DARK_FROM_POSITRON = !process.env.NEXT_PUBLIC_MAP_STYLE_DARK;

/** Ubah style terang menjadi tema gelap dashboard (navy). */
function darkenStyle(_prev: StyleSpecification | undefined, next: StyleSpecification): StyleSpecification {
  const has = (id: string, ...k: string[]) => k.some((x) => id.includes(x));
  const layers = next.layers.map((l): LayerSpecification => {
    const id = l.id.toLowerCase();
    const paint = { ...(("paint" in l && l.paint) || {}) } as Record<string, unknown>;
    switch (l.type) {
      case "background":
        paint["background-color"] = "#14162a";
        break;
      case "fill":
        paint["fill-color"] = has(id, "water", "ocean")
          ? "#1a2140"
          : has(id, "park", "wood", "grass", "forest", "landcover", "green")
            ? "#172628"
            : has(id, "building")
              ? "#222539"
              : "#181a2f";
        paint["fill-outline-color"] = "rgba(0,0,0,0)";
        if (has(id, "building")) paint["fill-opacity"] = 0.8;
        break;
      case "line":
        paint["line-color"] = has(id, "water", "river", "stream", "canal")
          ? "#24305c"
          : has(id, "boundary", "admin")
            ? "#3b4170"
            : has(id, "motorway", "trunk", "primary")
              ? "#383d5e"
              : has(id, "rail", "transit")
                ? "#262941"
                : "#2a2d47";
        break;
      case "fill-extrusion":
        paint["fill-extrusion-color"] = "#23263c";
        break;
      case "symbol":
        paint["text-color"] = has(id, "water") ? "#5a6aa8" : has(id, "place", "city", "town", "village", "suburb") ? "#9aa0c4" : "#6d7398";
        paint["text-halo-color"] = "#14162a";
        paint["text-halo-width"] = 1.2;
        paint["icon-opacity"] = 0.35;
        break;
    }
    return { ...l, paint } as LayerSpecification;
  });
  return { ...next, layers };
}

function applyStyle(map: MlMap, key: MapStyleKey) {
  map.setStyle(MAP_STYLES[key], key === "dark" && DARK_FROM_POSITRON ? { transformStyle: darkenStyle } : undefined);
}

type Ctx = { map: MlMap | null; styleVersion: number };
const MapCtx = createContext<Ctx>({ map: null, styleVersion: 0 });
export const useMap = () => useContext(MapCtx);

export function BaseMap({
  styleKey = "light",
  center,
  zoom = 13,
  pitch = 0,
  bearing = 0,
  interactive = true,
  extrude = false,
  padding,
  className,
  children,
}: {
  styleKey?: MapStyleKey;
  center: LngLat;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  interactive?: boolean;
  /** tambahkan bangunan 3D bila style belum punya */
  extrude?: boolean;
  /** ruang yang tertutup panel; titik tengah peta digeser ke area yang terlihat */
  padding?: Partial<PaddingOptions>;
  className?: string;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MlMap | null>(null);
  const [styleVersion, setStyleVersion] = useState(0);
  const [failed, setFailed] = useState(false);
  const initial = useRef({ center, zoom, pitch, bearing, interactive, styleKey });

  // Inisialisasi sekali.
  useEffect(() => {
    let disposed = false;
    let instance: MlMap | null = null;
    (async () => {
      const ml = await import("maplibre-gl");
      if (disposed || !ref.current) return;
      if (ml.getWorkerUrl?.() !== WORKER_URL) ml.setWorkerUrl(WORKER_URL);
      const o = initial.current;
      instance = new ml.Map({
        container: ref.current,
        center: o.center,
        zoom: o.zoom,
        pitch: o.pitch,
        bearing: o.bearing,
        interactive: o.interactive,
        attributionControl: { compact: true },
        canvasContextAttributes: { antialias: true },
      });
      applyStyle(instance, o.styleKey);
      instance.on("style.load", () => setStyleVersion((v) => v + 1));
      instance.on("error", (e) => {
        if ((e as { error?: { status?: number } }).error && !instance?.isStyleLoaded()) setFailed(true);
      });
      setMap(instance);
    })();
    return () => {
      disposed = true;
      instance?.remove();
    };
  }, []);

  // Ganti style / kamera saat prop berubah.
  useEffect(() => {
    if (!map || styleKey === initial.current.styleKey) return;
    initial.current.styleKey = styleKey;
    applyStyle(map, styleKey);
  }, [map, styleKey]);

  // `padding` diterapkan sebagai offset kamera (setPadding membuat render tertahan).
  const padKey = JSON.stringify(padding ?? null);
  const firstMove = useRef(true);
  useEffect(() => {
    if (!map) return;
    const p = { top: 0, bottom: 0, left: 0, right: 0, ...(JSON.parse(padKey) as Partial<PaddingOptions> | null) };
    const offset: [number, number] = [(p.left - p.right) / 2, (p.top - p.bottom) / 2];
    map.easeTo({ center, zoom, pitch, bearing, offset, duration: firstMove.current ? 0 : 900 });
    firstMove.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, center[0], center[1], zoom, pitch, bearing, padKey]);

  // Bangunan 3D tambahan.
  useEffect(() => {
    if (!map || !styleVersion) return;
    const style = map.getStyle() as StyleSpecification;
    const has = style.layers.some((l) => l.type === "fill-extrusion");
    if (!extrude || has || !style.sources.openmaptiles) return;
    map.addLayer({
      id: "bcc-3d",
      type: "fill-extrusion",
      source: "openmaptiles",
      "source-layer": "building",
      minzoom: 14,
      paint: {
        "fill-extrusion-color": "#d9dbe3",
        "fill-extrusion-height": ["coalesce", ["get", "render_height"], 8],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
        "fill-extrusion-opacity": 0.9,
      },
    });
    return () => {
      if (map.getLayer("bcc-3d")) map.removeLayer("bcc-3d");
    };
  }, [map, styleVersion, extrude]);

  return (
    <MapCtx.Provider value={{ map, styleVersion }}>
      <div className={cn("relative h-full w-full overflow-hidden bg-[#1b1d30]", className)}>
        {/* inline style: CSS maplibre (.maplibregl-map{position:relative}) menimpa utilitas Tailwind */}
        <div ref={ref} style={{ position: "absolute", inset: 0 }} />
        {failed && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-xs text-ink-3">Peta dasar tidak dapat dimuat</div>
        )}
        {map && children}
      </div>
    </MapCtx.Provider>
  );
}

/** Elemen React yang ditempel di koordinat peta. */
export function MapMarker({
  at,
  anchor = "center",
  children,
  onClick,
  zIndex,
}: {
  at: LngLat;
  anchor?: "center" | "bottom" | "top" | "left" | "right";
  children: React.ReactNode;
  onClick?: () => void;
  zIndex?: number;
}) {
  const { map } = useMap();
  const [el] = useState(() => (typeof document === "undefined" ? null : document.createElement("div")));
  const marker = useRef<MlMarker | null>(null);

  useEffect(() => {
    if (!map || !el) return;
    let alive = true;
    import("maplibre-gl").then((ml) => {
      if (!alive) return;
      marker.current = new ml.Marker({ element: el, anchor }).setLngLat(at).addTo(map);
      if (zIndex != null) marker.current.getElement().style.zIndex = String(zIndex);
    });
    return () => {
      alive = false;
      marker.current?.remove();
      marker.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, el, anchor, zIndex]);

  useEffect(() => {
    marker.current?.setLngLat(at);
  }, [at]);

  if (!el) return null;
  return createPortal(
    onClick ? (
      <div role="button" tabIndex={0} className="cursor-pointer" onClick={onClick} onKeyDown={(e) => e.key === "Enter" && onClick()}>
        {children}
      </div>
    ) : (
      children
    ),
    el,
  );
}

/** Garis GeoJSON (mis. ruas PJU padam). */
export function MapLines({
  id,
  lines,
  color,
  width = 3,
  dashed,
  glow,
}: {
  id: string;
  lines: LngLat[][];
  color: string;
  width?: number;
  dashed?: boolean;
  /** tambahkan pendar lembut di bawah garis */
  glow?: boolean;
}) {
  const { map, styleVersion } = useMap();
  const key = JSON.stringify(lines);
  useEffect(() => {
    if (!map || !styleVersion) return;
    const data = {
      type: "FeatureCollection" as const,
      features: (JSON.parse(key) as LngLat[][]).map((coordinates) => ({
        type: "Feature" as const,
        properties: {},
        geometry: { type: "LineString" as const, coordinates },
      })),
    };
    map.addSource(id, { type: "geojson", data });
    if (glow)
      map.addLayer({
        id: `${id}-glow`,
        type: "line",
        source: id,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": color, "line-width": width * 4, "line-blur": width * 3, "line-opacity": 0.45 },
      });
    map.addLayer({
      id,
      type: "line",
      source: id,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": color, "line-width": width, ...(dashed ? { "line-dasharray": [1.5, 1.2] } : {}) },
    });
    return () => {
      if (!map.getStyle()) return;
      for (const l of [id, `${id}-glow`]) if (map.getLayer(l)) map.removeLayer(l);
      if (map.getSource(id)) map.removeSource(id);
    };
  }, [map, styleVersion, id, key, color, width, dashed, glow]);
  return null;
}

/** Poligon/zona GeoJSON yang ikut skala peta (zona risiko, ruang hijau, dsb). */
export function MapPolygons({
  id,
  polygons,
  fill,
  fillOpacity = 0.3,
  line,
  lineWidth = 1.5,
  dashed,
}: {
  id: string;
  polygons: LngLat[][];
  fill: string;
  fillOpacity?: number;
  line?: string;
  lineWidth?: number;
  dashed?: boolean;
}) {
  const { map, styleVersion } = useMap();
  const key = JSON.stringify(polygons);
  useEffect(() => {
    if (!map || !styleVersion) return;
    const data = {
      type: "FeatureCollection" as const,
      features: (JSON.parse(key) as LngLat[][]).map((ring) => ({
        type: "Feature" as const,
        properties: {},
        geometry: { type: "Polygon" as const, coordinates: [[...ring, ring[0]]] },
      })),
    };
    const src = map.getSource(id) as { setData?: (d: unknown) => void } | undefined;
    if (src?.setData) {
      src.setData(data);
      return;
    }
    map.addSource(id, { type: "geojson", data });
    map.addLayer({ id: `${id}-fill`, type: "fill", source: id, paint: { "fill-color": fill, "fill-opacity": fillOpacity } });
    if (line)
      map.addLayer({
        id: `${id}-line`,
        type: "line",
        source: id,
        paint: { "line-color": line, "line-width": lineWidth, ...(dashed ? { "line-dasharray": [2, 2] } : {}) },
      });
  }, [map, styleVersion, id, key, fill, fillOpacity, line, lineWidth, dashed]);
  useEffect(() => {
    if (!map) return;
    return () => {
      if (!map.getStyle()) return;
      for (const l of [`${id}-line`, `${id}-fill`]) if (map.getLayer(l)) map.removeLayer(l);
      if (map.getSource(id)) map.removeSource(id);
    };
  }, [map, styleVersion, id]);
  return null;
}

/** Elips (dalam meter) sebagai cincin koordinat. */
export function ellipse(center: LngLat, rxM: number, ryM = rxM, steps = 48): LngLat[] {
  const [lng, lat] = center;
  const dLat = ryM / 111_320;
  const dLng = rxM / (111_320 * Math.cos((lat * Math.PI) / 180));
  return Array.from({ length: steps }, (_, i) => {
    const a = (i / steps) * Math.PI * 2;
    return [lng + Math.cos(a) * dLng, lat + Math.sin(a) * dLat] as LngLat;
  });
}
