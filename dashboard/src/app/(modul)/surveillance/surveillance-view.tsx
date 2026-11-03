"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, Circle, Minus, Pause, Play, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dot, Panel, PanelHeader, Pill, TONE_BG } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/segmented";
import { Ring } from "@/components/charts/ring";
import { CameraFeed, CamBadge } from "@/components/cctv/camera-feed";
import { AI_DETECTIONS, CAMERA_GROUPS, CAMERAS, CCTV_STATUS, KECAMATAN, PLAYBACK_EVENTS, ROAD_SPEED } from "@/data/bogor";

const GRIDS = { "2×2": 2, "3×3": 3, "4×4": 4 } as const;
type GridKey = keyof typeof GRIDS;
const TONE_HEX = { warn: "#ff8a2a", brand: "#4c5fe6", violet: "#9b51ff" } as const;

export function SurveillanceView() {
  const [grid, setGrid] = useState<GridKey>("3×3");
  const [page, setPage] = useState(0);
  const [tour, setTour] = useState(false);
  const [selected, setSelected] = useState("CAM-005");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string>("tengah");
  const [handled, setHandled] = useState<Record<string, "ok" | "skip">>({});
  const [playing, setPlaying] = useState(false);
  const [head, setHead] = useState(0.745);
  const [ptz, setPtz] = useState<string | null>(null);

  const n = GRIDS[grid];
  const perPage = n * n;
  const pages = Math.max(1, Math.ceil(CAMERAS.length / perPage));
  const visible = CAMERAS.slice((page % pages) * perPage, (page % pages) * perPage + perPage);
  const total = CCTV_STATUS.online + CCTV_STATUS.offline + CCTV_STATUS.maintenance;
  const sel = CAMERAS.find((c) => c.id === selected)!;

  useEffect(() => {
    if (!tour) return;
    const id = setInterval(() => setPage((p) => (p + 1) % pages), 8000);
    return () => clearInterval(id);
  }, [tour, pages]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setHead((h) => (h >= 1 ? 0 : h + 0.002)), 200);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    if (!ptz) return;
    const t = setTimeout(() => setPtz(null), 1600);
    return () => clearTimeout(t);
  }, [ptz]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => CAMERAS.filter((c) => !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)), [q]);

  const headTime = (() => {
    const mins = Math.round(head * 24 * 60);
    return `${String(Math.floor(mins / 60) % 24).padStart(2, "0")}.${String(mins % 60).padStart(2, "0")}`;
  })();

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr_420px]">
      {/* ── kiri ── */}
      <div className="flex flex-col gap-5">
        <Panel>
          <PanelHeader title="Status jaringan CCTV" />
          <div className="flex items-center gap-6">
            <Ring segments={[{ value: CCTV_STATUS.online, color: "#4c5fe6" }, { value: total - CCTV_STATUS.online, color: "transparent" }]} size={92} stroke={10} gap={0}>
              <span className="text-xl font-semibold">{Math.round((CCTV_STATUS.online / total) * 100)}%</span>
            </Ring>
            <ul className="flex-1 space-y-1.5 text-sm">
              {[
                { l: "Online", v: CCTV_STATUS.online, c: "border-brand" },
                { l: "Offline", v: CCTV_STATUS.offline, c: "border-danger" },
                { l: "Pemeliharaan", v: CCTV_STATUS.maintenance, c: "border-ink-3" },
              ].map((r) => (
                <li key={r.l} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className={cn("size-3 rounded-full border-2", r.c)} />
                    {r.l}
                  </span>
                  <span className="tabular-nums">{r.v}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel className="flex min-h-0 flex-1 flex-col">
          <PanelHeader title="Daftar kamera" />
          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama kamera atau lokasi…"
              className="w-full rounded-lg border border-line bg-panel-2 py-2.5 pr-3 pl-10 text-sm outline-none placeholder:text-ink-3 focus:border-brand"
            />
          </label>
          <ul className="mt-3 max-h-[420px] flex-1 overflow-y-auto scrollbar-thin">
            {CAMERA_GROUPS.map((g) => {
              const name = KECAMATAN.find((k) => k.id === g.kec)!.name;
              const cams = filtered.filter((c) => c.kec === g.kec);
              const isOpen = open === g.kec || (q !== "" && cams.length > 0);
              if (q && cams.length === 0) return null;
              return (
                <li key={g.kec}>
                  <button type="button" onClick={() => setOpen(isOpen ? "" : g.kec)} className="flex w-full items-center gap-2 py-2.5 text-sm">
                    <ChevronRight className={cn("size-3.5 text-ink-3 transition-transform", isOpen && "rotate-90")} />
                    <span className="flex-1 text-left">{name}</span>
                    <span className="text-xs text-ink-2 tabular-nums">
                      {g.online}/{g.total}
                    </span>
                  </button>
                  {isOpen && (
                    <ul className="mb-2 space-y-0.5 pl-5">
                      {cams.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => setSelected(c.id)}
                            className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] hover:bg-white/5", selected === c.id && "bg-brand/15")}
                          >
                            <span className={cn("size-1.5 rounded-full", c.online ? "bg-ok" : "bg-danger")} />
                            <span className="flex-1 text-left">{c.name}</span>
                            <span className="text-xs text-ink-2">{c.id}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      {/* ── video wall ── */}
      <Panel className="flex min-w-0 flex-col">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Video wall</h2>
            <Pill tone="danger" dot>Langsung</Pill>
            {pages > 1 && <span className="text-xs text-ink-2">Hal. {(page % pages) + 1}/{pages}</span>}
          </div>
          <div className="flex items-center gap-3">
            <Segmented options={Object.keys(GRIDS) as GridKey[]} value={grid} onChange={(g) => { setGrid(g); setPage(0); }} size="sm" />
            <button
              type="button"
              aria-pressed={tour}
              onClick={() => setTour((t) => !t)}
              className={cn("rounded-lg border px-4 py-2 text-sm", tour ? "border-brand bg-brand/20 text-white" : "border-line bg-panel-2 hover:bg-white/10")}
            >
              Tur otomatis
            </button>
          </div>
        </div>
        <div className="grid flex-1 gap-2.5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${n}, minmax(0, 1fr))` }}>
          {visible.map((c, i) => {
            const det = "detection" in c ? c.detection : undefined;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                className={cn("group relative aspect-video overflow-hidden rounded-lg text-left ring-2 transition xl:aspect-auto xl:min-h-[110px]", selected === c.id ? "ring-warn" : "ring-transparent hover:ring-white/20")}
              >
                <CameraFeed id={c.id} online={c.online} seed={i + page * perPage} showTime={n < 4} />
                <CamBadge className="absolute top-2 left-2">{c.id}</CamBadge>
                <CamBadge tone={c.online ? "live" : "off"} className="absolute top-2 right-2">
                  {c.online ? "Langsung" : "Offline"}
                </CamBadge>
                {det && (
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="mb-1 block rounded bg-warn px-2 py-0.5 text-xs font-medium whitespace-nowrap text-[#1b1206]">{det}</span>
                    <span className="mx-auto block h-12 w-20 border-2 border-warn" />
                  </span>
                )}
                <span className="absolute bottom-2 left-2.5 text-xs text-white [text-shadow:0_1px_3px_#000]">{c.name}</span>
              </button>
            );
          })}
        </div>
        {pages > 1 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} type="button" aria-label={`Halaman ${i + 1}`} onClick={() => setPage(i)} className={cn("h-1.5 rounded-full transition-all", page % pages === i ? "w-6 bg-brand" : "w-1.5 bg-white/20")} />
            ))}
          </div>
        )}
      </Panel>

      {/* ── kanan ── */}
      <div className="flex flex-col gap-5">
        <Panel className="flex-1">
          <PanelHeader title="Deteksi AI" aside={<Pill tone="warn">24 perlu verifikasi</Pill>} />
          <ul className="divide-y divide-line">
            {AI_DETECTIONS.map((d) => {
              const h = handled[d.cam + d.title];
              return (
                <li key={d.cam + d.title} className={cn("flex gap-3 py-3.5 first:pt-0", h && "opacity-50")}>
                  <button type="button" onClick={() => setSelected(d.cam)} className="grid h-14 w-20 shrink-0 place-items-center rounded-md bg-panel-2">
                    <span className="h-6 w-9 rounded-sm border-2" style={{ borderColor: TONE_HEX[d.tone] }} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm">{d.title}</p>
                      <span className="text-xs text-ink-2">{d.time}</span>
                    </div>
                    <p className="text-xs text-ink-2">
                      {d.cam} · yakin {d.conf}%
                    </p>
                    <div className="mt-1 flex gap-4 text-xs">
                      {h ? (
                        <span className={h === "ok" ? "text-ok" : "text-ink-3"}>{h === "ok" ? "Terverifikasi" : "Diabaikan"}</span>
                      ) : (
                        <>
                          <button type="button" className="text-brand-soft hover:underline" onClick={() => setHandled((s) => ({ ...s, [d.cam + d.title]: "ok" }))}>
                            Verifikasi
                          </button>
                          <button type="button" className="text-ink-2 hover:underline" onClick={() => setHandled((s) => ({ ...s, [d.cam + d.title]: "skip" }))}>
                            Abaikan
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel>
          <PanelHeader title="Kemacetan per ruas" aside="km/jam" />
          <ul className="space-y-2.5">
            {ROAD_SPEED.map((r) => {
              const tone = r.speed < 15 ? "danger" : r.speed < 25 ? "warn" : "ok";
              return (
                <li key={r.road} className="grid grid-cols-[1fr_110px_28px] items-center gap-3 text-sm">
                  <span className="truncate">{r.road}</span>
                  <span className="h-1 overflow-hidden rounded-full bg-white/8">
                    <span className={cn("block h-full rounded-full", TONE_BG[tone])} style={{ width: `${100 - r.speed * 2}%` }} />
                  </span>
                  <span className={cn("text-right tabular-nums", tone === "danger" ? "text-danger" : tone === "warn" ? "text-warn" : "text-ok")}>{r.speed}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      {/* ── bawah ── */}
      <div className="grid gap-5 xl:col-span-3 xl:grid-cols-[1fr_640px]">
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-semibold">Putar ulang rekaman</h2>
              <p className="text-xs text-ink-2">
                {sel.id} {sel.name}, 28 Oktober 2026 · {headTime}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <IconBtn label="Mundur" onClick={() => setHead((h) => Math.max(0, h - 0.02))}>
                <ChevronsLeft />
              </IconBtn>
              <IconBtn label={playing ? "Jeda" : "Putar"} onClick={() => setPlaying((p) => !p)} active>
                {playing ? <Pause /> : <Play />}
              </IconBtn>
              <IconBtn label="Maju" onClick={() => setHead((h) => Math.min(1, h + 0.02))}>
                <ChevronsRight />
              </IconBtn>
              <button type="button" onClick={() => { setPlaying(false); setHead(0.745); }} className="ml-1 rounded-lg border border-danger/40 px-4 py-2 text-sm text-danger hover:bg-danger/10">
                Kembali ke langsung
              </button>
            </div>
          </div>
          <div
            className="relative mt-4 h-6 cursor-pointer rounded-md bg-panel-2"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setHead((e.clientX - r.left) / r.width);
            }}
          >
            <div className="absolute inset-y-0 left-0 rounded-l-md bg-brand/25" style={{ width: `${head * 100}%` }} />
            {PLAYBACK_EVENTS.map((ev) => (
              <span key={ev.at} className={cn("absolute inset-y-0", TONE_BG[ev.tone])} style={{ left: `${ev.at * 100}%`, width: `${ev.w * 100}%` }} />
            ))}
            <span className="absolute -inset-y-1 w-0.5 rounded bg-brand-soft" style={{ left: `${head * 100}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-ink-2">
            {["00.00", "06.00", "12.00", "18.00", "24.00"].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title={`Kendali kamera ${sel.id}`} aside={ptz ? <span className="text-brand-soft">{ptz}…</span> : "PTZ"} />
          <div className="flex flex-wrap items-center gap-2">
            {[
              { i: <ChevronLeft />, l: "Pan kiri" },
              { i: <ChevronUp />, l: "Tilt atas" },
              { i: <ChevronDown />, l: "Tilt bawah" },
              { i: <ChevronRight />, l: "Pan kanan" },
              { i: <Plus />, l: "Zoom masuk" },
              { i: <Minus />, l: "Zoom keluar" },
            ].map((b) => (
              <IconBtn key={b.l} label={b.l} onClick={() => setPtz(b.l)} disabled={!sel.online}>
                {b.i}
              </IconBtn>
            ))}
            <button type="button" disabled={!sel.online} onClick={() => setPtz("Mengambil gambar")} className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-sm hover:bg-white/10 disabled:opacity-40">
              <Camera className="size-4" /> Ambil gambar
            </button>
            <button type="button" disabled={!sel.online} onClick={() => setPtz("Merekam")} className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-sm hover:bg-white/10 disabled:opacity-40">
              <Circle className="size-3 fill-danger text-danger" /> Rekam
            </button>
          </div>
          {!sel.online && (
            <p className="mt-3 flex items-center gap-2 text-xs text-danger">
              <Dot color="#ff3d63" /> Kamera offline, kendali tidak tersedia.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

function IconBtn({ children, label, onClick, active, disabled }: { children: React.ReactNode; label: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid size-10 place-items-center rounded-lg border transition [&_svg]:size-4 disabled:opacity-40",
        active ? "border-brand bg-brand text-white" : "border-line bg-panel-2 text-ink hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}
