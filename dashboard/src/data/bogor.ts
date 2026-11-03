/* ─────────────────────────────────────────────────────────────────────────
 * DATA DUMMY — Bogor Command Center
 * Semua angka di dashboard berasal dari file ini. Ganti dengan fetch ke API
 * nyata per modul ketika backend sudah siap (bentuk datanya dipertahankan).
 * ───────────────────────────────────────────────────────────────────────── */

export type Tone = "brand" | "ok" | "warn" | "danger" | "violet" | "amber" | "sky" | "muted";
export type LngLat = [number, number];

export const CITY_CENTER: LngLat = [106.7972, -6.595];

/* ── Wilayah ─────────────────────────────────────────────────────────── */
export const KECAMATAN = [
  { id: "utara", name: "Bogor Utara", short: "Utara", luas: 17.72, kelurahan: 8, penduduk: 197_430, rawanBanjir: 2, rawanLongsor: 1, cctv: 52 },
  { id: "tanah-sareal", name: "Tanah Sareal", short: "T. Sareal", luas: 18.84, kelurahan: 11, penduduk: 232_560, rawanBanjir: 1, rawanLongsor: 0, cctv: 64 },
  { id: "barat", name: "Bogor Barat", short: "Barat", luas: 32.85, kelurahan: 16, penduduk: 247_910, rawanBanjir: 2, rawanLongsor: 4, cctv: 47 },
  { id: "tengah", name: "Bogor Tengah", short: "Tengah", luas: 8.13, kelurahan: 11, penduduk: 102_640, rawanBanjir: 3, rawanLongsor: 0, cctv: 96 },
  { id: "timur", name: "Bogor Timur", short: "Timur", luas: 10.15, kelurahan: 6, penduduk: 108_920, rawanBanjir: 2, rawanLongsor: 1, cctv: 38 },
  { id: "selatan", name: "Bogor Selatan", short: "Selatan", luas: 30.81, kelurahan: 16, penduduk: 209_180, rawanBanjir: 1, rawanLongsor: 6, cctv: 41 },
] as const;
export type KecamatanId = (typeof KECAMATAN)[number]["id"];

/* ── Beranda ─────────────────────────────────────────────────────────── */
export const SUMMARY = {
  insidenAktif: 5,
  peringatanDini: 2,
  kameraOffline: 28,
  aduan: { total: 248, delta: 23, sejak: "08.00", selesai: 186, diproses: 53, lewatSla: 9 },
  lalinIndex: 78,
  cctvOnline: 312,
  cctvTotal: 340,
  cuaca: { suhu: 27, kelembapan: 84, ispu: 43 },
  banjir: { tma: 40, delta: 12, status: "Normal", lokasi: "TMA Bendung Katulampa" },
  populasi: { total: 1_063_043, kepadatan: 8_972, tumbuh: 0.8, ipm: 79.4 },
  peluangBanjir6j: 64,
  peluangDelta: 18,
};

export const MODULE_STATUS = [
  { href: "/data-statistik", label: "Data & Statistik", value: "1.284", unit: "dataset", tone: "brand", progress: 88 },
  { href: "/call-center", label: "Call Center", value: "156", unit: "tiket aktif", tone: "warn", progress: 64 },
  { href: "/surveillance", label: "Surveillance", value: "92%", unit: "kamera aktif", tone: "violet", progress: 92 },
  { href: "/geospasial", label: "GeoSpasial", value: "37", unit: "layer aktif", tone: "ok", progress: 74 },
  { href: "/city-operation", label: "City Operation", value: "96%", unit: "PJU menyala", tone: "ok", progress: 96 },
  { href: "/ews-ai", label: "EWS & AI", value: "Waspada", unit: "2 peringatan", tone: "danger", progress: 50 },
] as const;

export const REALTIME_ALERTS = [
  { kind: "flood", title: "Genangan 30 cm", place: "Jl. Pajajaran, Bogor Tengah", time: "10.35", tone: "danger" },
  { kind: "accident", title: "Kecelakaan lalu lintas", place: "Jl. KH. Sholeh Iskandar", time: "10.32", tone: "danger" },
  { kind: "traffic", title: "Kemacetan parah", place: "Simpang Tugu Kujang", time: "09.58", tone: "warn" },
  { kind: "rain", title: "Hujan lebat diprediksi", place: "Seluruh kota, 13.00–19.00", time: "09.30", tone: "violet" },
] as const;

export const TMA_SERIES = [36, 37, 35, 36, 38, 37, 36, 37, 38, 37, 38, 40, 41, 44, 47, 52].map((v, i) => ({ t: i, v }));
export const FLOOD_PROB_SERIES = [30, 34, 32, 28, 33, 40, 38, 35, 42, 48, 46, 52, 58, 64, 70, 74].map((v, i) => ({ t: i, v }));

/* ── Data & Statistik ────────────────────────────────────────────────── */
export const POP_TREND = [
  { year: "2017", v: 1.0 },
  { year: "2018", v: 1.013 },
  { year: "2019", v: 1.028 },
  { year: "2020", v: 1.043 },
  { year: "2021", v: 1.055 },
  { year: "2022", v: 1.07 },
  { year: "2023", v: 1.082 },
  { year: "2024", v: 1.093 },
  { year: "2025", v: 1.097 },
  { year: "2026", v: 1.11 },
];

export const STAT_CATEGORIES = [
  { id: "penduduk", label: "Kependudukan", value: "1,11", unit: "juta jiwa", delta: "1,2% dari 2025", tone: "brand" },
  { id: "ekonomi", label: "Ekonomi", value: "5,45", unit: "%", delta: "0,8 poin", tone: "ok" },
  { id: "kesehatan", label: "Kesehatan", value: "93", unit: "%", delta: "2% dari 2025", tone: "danger" },
  { id: "perizinan", label: "Perizinan", value: "4.120", unit: "izin", delta: "18% dari 2025", tone: "warn" },
  { id: "pendidikan", label: "Pendidikan", value: "184.320", unit: "total peserta didik", delta: "18% dari 2025", tone: "ok" },
] as const;

export const KEY_INDICATORS = [
  { label: "IPM", value: "79,75", delta: "0,72", up: true, good: true },
  { label: "Inflasi tahunan", value: "2,31%", delta: "0,4", up: false, good: true },
  { label: "Penduduk miskin", value: "6,63%", delta: "0,3", up: false, good: true },
  { label: "Pengangguran", value: "7,95%", delta: "0,2", up: true, good: false },
];

export const HEALTH = [
  { label: "Kunjungan faskes hari ini", value: "3.482", tone: "danger", icon: "heart" },
  { label: "Keterisian tempat tidur RS", value: "72%", tone: "violet", icon: "bed" },
  { label: "Kasus DBD minggu ini", value: "38", tone: "warn", icon: "drop" },
] as const;

export const PERMITS = [
  { label: "Diajukan", value: 586, tone: "brand" },
  { label: "Diverifikasi", value: 497, tone: "violet" },
  { label: "Terbit", value: 412, tone: "ok" },
  { label: "Ditolak", value: 37, tone: "danger" },
] as const;

export const DATASETS = [
  { title: "Penduduk per kelurahan", meta: "CSV · diperbarui 24 Okt", badge: "Terbaru", tone: "ok" },
  { title: "PDRB lapangan usaha", meta: "XLSX · diperbarui 20 Okt", badge: "Terbaru", tone: "ok" },
  { title: "Kunjungan puskesmas", meta: "API · hari ini", badge: "Realtime", tone: "brand" },
  { title: "Realisasi APBD", meta: "XLSX · 2 Okt", badge: "Perlu diperbarui", tone: "warn" },
] as const;

/* ── Call Center ─────────────────────────────────────────────────────── */
export const CALL_TODAY = { aduan: 248, aduanDelta: 12, darurat: 5, unitJalan: 3, diproses: 64, lewatSla: 9, respons: "6:24", responsDelta: 15 };

export const CHANNELS = [
  { label: "WhatsApp", value: 92, tone: "ok" },
  { label: "Telepon 112", value: 64, tone: "danger" },
  { label: "Aplikasi warga", value: 47, tone: "brand" },
  { label: "SP4N-LAPOR!", value: 28, tone: "violet" },
  { label: "Media sosial", value: 17, tone: "warn" },
] as const;

export const COMPLAINT_CATEGORIES = [
  { label: "Jalan rusak", value: 28, color: "#4c5fe6" },
  { label: "Sampah", value: 22, color: "#3dd4a0" },
  { label: "Banjir & drainase", value: 17, color: "#ff8a2a" },
  { label: "Penerangan jalan", value: 14, color: "#9b51ff" },
  { label: "Lainnya", value: 19, color: "#5d6178" },
];

export const EMERGENCIES = [
  { kind: "fire", title: "Kebakaran rumah", place: "Kel. Cibuluh · Damkar 02", eta: "4 mnt", at: [106.8105, -6.5705] as LngLat },
  { kind: "flood", title: "Orang tenggelam", place: "Sungai Cisadane · BPBD", eta: "3 mnt", at: [106.7745, -6.6035] as LngLat },
  { kind: "accident", title: "Kecelakaan", place: "Jl. KH. Sholeh Iskandar · PSC 119", eta: "di lokasi", at: [106.8045, -6.5555] as LngLat },
] as const;

export const UNITS = [
  { label: "Damkar", ready: 6, total: 8 },
  { label: "Ambulans", ready: 4, total: 6 },
  { label: "BPBD", ready: 3, total: 4 },
  { label: "Satpol PP", ready: 9, total: 12 },
];

export const AGENTS = [
  { initials: "RA", name: "Rina Agustina", tickets: 18, status: "Panggilan", tone: "brand" },
  { initials: "DS", name: "Dimas Saputra", tickets: 15, status: "Tersedia", tone: "ok" },
  { initials: "SY", name: "Siti Yulianti", tickets: 21, status: "Panggilan", tone: "brand" },
  { initials: "LW", name: "Lestari Wulan", tickets: 16, status: "Istirahat", tone: "muted" },
] as const;

export const TICKETS = [
  { type: "Darurat", id: "#112-0418", title: "Kebakaran rumah", place: "Kel. Cibuluh", unit: "Damkar 02", status: "Unit berangkat" },
  { type: "Darurat", id: "#112-0417", title: "Kecelakaan", place: "Jl. KH. Sholeh Iskandar", unit: "PSC 119", status: "Di lokasi" },
  { type: "Aduan", id: "#AD-24871", title: "Jalan berlubang", place: "Jl. Raya Tajur", unit: "DPUPR", status: "Diverifikasi" },
  { type: "Aduan", id: "#AD-24870", title: "Pohon tumbang", place: "Jl. Ir. H. Juanda", unit: "DLH", status: "Diteruskan" },
  { type: "Darurat", id: "#112-0416", title: "Orang tenggelam", place: "Sungai Cisadane", unit: "BPBD", status: "Unit berangkat" },
] as const;

export const CALL_MAP = {
  incidents: [
    [106.8105, -6.5705], [106.7745, -6.6035], [106.7905, -6.5612], [106.8231, -6.6122], [106.7802, -6.5803],
  ] as LngLat[],
  units: [[106.8022, -6.5788], [106.7891, -6.5951], [106.8134, -6.6011], [106.7955, -6.5702]] as LngLat[],
  complaints: [
    [106.7798, -6.5698], [106.7881, -6.5752], [106.8012, -6.5841], [106.8155, -6.5905], [106.8077, -6.6062],
    [106.7922, -6.6125], [106.7826, -6.6045], [106.7703, -6.5904], [106.8201, -6.5799], [106.8288, -6.6011],
    [106.7999, -6.5655], [106.7712, -6.5781], [106.8109, -6.6188], [106.7962, -6.5988],
  ] as LngLat[],
  callout: { at: [106.8105, -6.5705] as LngLat, title: "Kebakaran rumah", place: "Kel. Cibuluh, Bogor Utara", unit: "Damkar 02", eta: "tiba 4 menit", time: "10.41" },
};

/* ── Surveillance ────────────────────────────────────────────────────── */
export const CCTV_STATUS = { online: 312, offline: 21, maintenance: 7 };

export const CAMERAS = [
  { id: "CAM-001", name: "Simpang Tugu Kujang", kec: "tengah", online: true },
  { id: "CAM-002", name: "Jl. Pajajaran", kec: "tengah", online: true },
  { id: "CAM-003", name: "Stasiun Bogor", kec: "tengah", online: true },
  { id: "CAM-004", name: "Jl. Ir. H. Juanda", kec: "tengah", online: true },
  { id: "CAM-005", name: "Jl. KH. Sholeh Iskandar", kec: "tanah-sareal", online: true, detection: "Antrean 320 m" },
  { id: "CAM-006", name: "Bendung Katulampa", kec: "timur", online: true },
  { id: "CAM-007", name: "Pasar Bogor", kec: "tengah", online: true },
  { id: "CAM-008", name: "Jl. Otista", kec: "tengah", online: false },
  { id: "CAM-009", name: "Terminal Baranangsiang", kec: "timur", online: true },
  { id: "CAM-010", name: "Jl. Raya Tajur", kec: "selatan", online: true },
  { id: "CAM-011", name: "Simpang Yasmin", kec: "barat", online: true },
  { id: "CAM-012", name: "Jl. Sudirman", kec: "tengah", online: true },
  { id: "CAM-013", name: "Warung Jambu", kec: "utara", online: true },
  { id: "CAM-014", name: "Jl. Dr. Semeru", kec: "barat", online: false },
  { id: "CAM-015", name: "Kebun Raya", kec: "tengah", online: true },
  { id: "CAM-016", name: "Jl. Pahlawan", kec: "selatan", online: true },
] as const;

export const CAMERA_GROUPS: { kec: KecamatanId; online: number; total: number }[] = [
  { kec: "tengah", online: 96, total: 98 },
  { kec: "utara", online: 50, total: 52 },
  { kec: "tanah-sareal", online: 61, total: 64 },
  { kec: "selatan", online: 38, total: 41 },
  { kec: "timur", online: 35, total: 38 },
  { kec: "barat", online: 32, total: 47 },
];

export const AI_DETECTIONS = [
  { title: "Antrean kendaraan", cam: "CAM-005", conf: 94, time: "10.41", tone: "warn" },
  { title: "Kerumunan", cam: "CAM-003", conf: 88, time: "10.36", tone: "brand" },
  { title: "Parkir di bahu jalan", cam: "CAM-002", conf: 91, time: "10.30", tone: "violet" },
  { title: "Genangan di jalan", cam: "CAM-006", conf: 79, time: "10.22", tone: "brand" },
] as const;

export const ROAD_SPEED = [
  { road: "Jl. Pajajaran", speed: 11 },
  { road: "Jl. KH. Sholeh Iskandar", speed: 13 },
  { road: "Jl. Ir. H. Juanda", speed: 18 },
  { road: "Jl. Raya Tajur", speed: 21 },
  { road: "Jl. Jend. Sudirman", speed: 29 },
];

export const PLAYBACK_EVENTS = [
  { at: 0.29, w: 0.02, tone: "warn" },
  { at: 0.52, w: 0.03, tone: "warn" },
  { at: 0.66, w: 0.015, tone: "danger" },
] as const;

/* ── GeoSpasial ──────────────────────────────────────────────────────── */
export const LAYERS = [
  { group: "Administrasi", items: [{ id: "batas", label: "Batas kelurahan", icon: "grid", tone: "muted", on: false }] },
  {
    group: "Kerawanan",
    items: [
      { id: "banjir", label: "Rawan banjir", icon: "waves", tone: "warn", on: true },
      { id: "longsor", label: "Rawan longsor", icon: "mountain", tone: "muted", on: false },
    ],
  },
  {
    group: "Fasilitas & sensor",
    items: [
      { id: "cctv", label: "Kamera CCTV", icon: "cctv", tone: "violet", on: true },
      { id: "faskes", label: "Fasilitas kesehatan", icon: "plus", tone: "muted", on: false },
      { id: "sekolah", label: "Sekolah", icon: "school", tone: "muted", on: false },
    ],
  },
] as const;

export const GEO_POINTS = {
  cctv: [
    [106.7948, -6.5948], [106.7991, -6.5921], [106.8032, -6.5975], [106.7899, -6.5986], [106.8061, -6.6012],
    [106.7972, -6.6031], [106.7925, -6.5903], [106.8088, -6.5944],
  ] as LngLat[],
  banjir: [[106.8015, -6.5968], [106.7862, -6.6001], [106.8098, -6.6048]] as LngLat[],
  longsor: [[106.7801, -6.6112], [106.8155, -6.6201]] as LngLat[],
  faskes: [[106.7934, -6.5931], [106.8052, -6.5899], [106.7881, -6.6044]] as LngLat[],
  sekolah: [[106.7911, -6.5962], [106.8011, -6.5911], [106.8071, -6.5999], [106.7956, -6.6066]] as LngLat[],
};

export const SPATIAL_TOOLS = [
  { label: "Radius layanan", icon: "radius", tone: "brand" },
  { label: "Peta panas aduan", icon: "flame", tone: "danger" },
  { label: "Tumpang zonasi", icon: "layers", tone: "ok" },
  { label: "Simulasi genangan", icon: "waves", tone: "warn" },
] as const;

/* ── City Operation ──────────────────────────────────────────────────── */
export const HYDRO = { tma: 40, rise: "12 cm / 3 jam", status: "Normal", thresholds: [{ label: "Siaga 4", v: 80, color: "#f6c443" }, { label: "Siaga 3", v: 150, color: "#ff8a2a" }, { label: "Siaga 2", v: 200, color: "#ff3d63" }] };
export const WATER_ASSETS = [
  { label: "Ciliwung hilir", value: "112 cm", icon: "wave", tone: "brand", valueTone: "muted" },
  { label: "Cisadane", value: "96 cm", icon: "wave", tone: "brand", valueTone: "warn" },
  { label: "Pintu air Cidepit", value: "Buka 40%", icon: "gate", tone: "violet", valueTone: "brand" },
  { label: "Pompa Babakan Pasar", value: "Beroperasi", icon: "pump", tone: "warn", valueTone: "warn" },
  { label: "Pompa Sempur", value: "Siaga", icon: "pump", tone: "ok", valueTone: "ok" },
  { label: "Pompa Kedung Badak", value: "Siaga", icon: "pump", tone: "ok", valueTone: "ok" },
] as const;

export const PJU = { total: 14_820, on: 14_227, off: 445, maintenance: 148, smart: 62 };
export const WASTE = {
  armada: 68,
  armadaTotal: 82,
  ritase: 131,
  tpsPenuh: 9,
  tps: [
    { name: "TPS Pasar Bogor", fill: 94 },
    { name: "TPS Kel. Menteng", fill: 92 },
    { name: "TPS Jl. Merdeka", fill: 86 },
    { name: "TPS Tegal Gundil", fill: 78 },
    { name: "TPS Bondongan", fill: 62 },
  ],
};
export const CITYOPS_KPI = [
  { value: "4", unit: "mm/j", label: "Curah hujan", icon: "rain", tone: "brand" },
  { value: "1", unit: "/3", label: "Pompa aktif", icon: "pump", tone: "warn" },
  { value: "445", unit: "titik", label: "PJU padam", icon: "bulb", tone: "danger" },
  { value: "412", unit: "ton", label: "Sampah terangkut", icon: "trash", tone: "ok" },
] as const;
export const OPS_LOG = [
  { time: "10.38", text: "Pompa Babakan Pasar dinyalakan, debit 0,8 m³/dtk", status: "Berjalan", tone: "brand" },
  { time: "10.21", text: "12 titik PJU padam di Jl. Ahmad Yani, kabel putus", status: "Menunggu", tone: "warn" },
  { time: "09.47", text: "Truk sampah B 9012 FG menuju TPA Galuga", status: "Selesai", tone: "ok" },
] as const;
export const CITYOPS_MAP = {
  waterPosts: [[106.7712, -6.5872], [106.8059, -6.5642], [106.8001, -6.5778], [106.8121, -6.6091]] as LngLat[],
  tpsFull: [[106.7835, -6.5768], [106.7802, -6.5951]] as LngLat[],
  trucks: [[106.7889, -6.5868], [106.8005, -6.5845], [106.8078, -6.5701], [106.7935, -6.6005]] as LngLat[],
  pjuOff: [
    [[106.7785, -6.5602], [106.7832, -6.5782]],
    [[106.7862, -6.5885], [106.8162, -6.5822]],
  ] as LngLat[][],
};

/* ── EWS & AI ────────────────────────────────────────────────────────── */
export const HAZARDS = [
  { kind: "flood", label: "Banjir", sub: "TMA 40 cm, diprediksi naik", status: "Waspada", tone: "brand" },
  { kind: "landslide", label: "Tanah longsor", sub: "6 titik rawan dipantau", status: "Waspada", tone: "amber" },
  { kind: "storm", label: "Cuaca ekstrem", sub: "Hujan lebat 13.00–19.00", status: "Waspada", tone: "violet" },
  { kind: "quake", label: "Gempa bumi", sub: "M3,1, 84 km barat daya", status: "Normal", tone: "muted" },
  { kind: "fire", label: "Kebakaran", sub: "1 kejadian ditangani", status: "Normal", tone: "danger" },
  { kind: "air", label: "Kualitas udara", sub: "ISPU 43", status: "Baik", tone: "ok" },
] as const;

export const CITY_LEVELS = ["Normal", "Waspada", "Siaga", "Awas"] as const;
export const CITY_LEVEL_INDEX = 1;

export const FORECAST_STEPS = ["Sekarang", "+1 jam", "+3 jam", "+6 jam", "+12 jam"] as const;
/** skala radius zona per langkah prakiraan (0–1) */
export const FORECAST_SCALE = [0.55, 0.65, 0.8, 1, 1.15];
export const FORECAST_PROB = [22, 31, 47, 64, 71];

export const AI_PRED = [
  { label: "Banjir 6 jam", value: "64%", tone: "danger" },
  { label: "Macet 3 jam", value: "48%", tone: "muted" },
  { label: "ISPU besok", value: "51", tone: "muted" },
] as const;
export const AI_SERIES = Array.from({ length: 24 }, (_, i) => {
  const actual = i <= 14 ? 22 + i * 0.6 + Math.sin(i / 2) * 0.6 + (i > 11 ? (i - 11) * 1.6 : 0) : null;
  const pred = i >= 14 ? 34 + (i - 14) * 4.2 + Math.sin(i) * 1.2 : null;
  return { t: i, actual, pred };
});

export const RECOMMENDATIONS = [
  { id: "r1", title: "Siagakan pompa Babakan Pasar dan Sempur", reason: "TMA diprediksi melewati 80 cm pukul 16.00" },
  { id: "r2", title: "Kirim peringatan dini ke 5 kelurahan bantaran Ciliwung", reason: "Peluang luapan 64% dalam 6 jam" },
  { id: "r3", title: "Siagakan regu BPBD di Bogor Selatan", reason: "Hujan tinggi di lereng rawan longsor" },
];

export const ACTIVE_WARNINGS = [
  { text: "Hujan lebat disertai angin, seluruh kota", time: "13.00–19.00" },
  { text: "Potensi longsor, Bogor Selatan & Barat", time: "s.d. besok 06.00" },
];

export const BROADCAST_CHANNELS = [
  { label: "Sirine", meta: "12/14 siap" },
  { label: "SMS", meta: "48.210" },
  { label: "WhatsApp", meta: "612 grup" },
  { label: "Media sosial", meta: "4 akun" },
];

export const SENSOR_HEALTH = { overall: 94, items: [
  { label: "Tinggi muka air", ok: 11, total: 12, tone: "ok" },
  { label: "Curah hujan", ok: 5, total: 6, tone: "ok" },
  { label: "Kualitas udara", ok: 7, total: 9, tone: "warn" },
] } as const;

/** titik tengah (perkiraan) tiap kecamatan */
export const KEC_CENTER: Record<KecamatanId, LngLat> = {
  utara: [106.8135, -6.5642],
  "tanah-sareal": [106.7801, -6.5535],
  barat: [106.7635, -6.5899],
  tengah: [106.7972, -6.5975],
  timur: [106.8245, -6.6075],
  selatan: [106.8055, -6.6335],
};

/* ── Geometri peta (perkiraan, untuk visualisasi) ─────────────────────── */
export const BALAI_KOTA: LngLat = [106.7942, -6.5951];
export const KEBUN_RAYA: LngLat = [106.7995, -6.5978];
export const RIVERS = {
  ciliwung: [
    [106.8362, -6.6335], [106.8265, -6.6235], [106.8158, -6.6128], [106.8072, -6.6035], [106.8031, -6.5958],
    [106.8008, -6.5885], [106.8035, -6.5795], [106.8052, -6.5702], [106.8091, -6.5598], [106.8128, -6.5465], [106.8175, -6.5335],
  ] as LngLat[],
  cisadane: [
    [106.7792, -6.6605], [106.7745, -6.6402], [106.7712, -6.6215], [106.7685, -6.6048], [106.7641, -6.5902],
    [106.7582, -6.5765], [106.7528, -6.5618], [106.7461, -6.5455], [106.7398, -6.5302],
  ] as LngLat[],
};
/** penanda di peta Beranda */
export const HOME_MAP = {
  traffic: { at: [106.8012, -6.6058] as LngLat, label: "Padat · 11 km/j" },
  incidents: [
    { at: [106.8072, -6.5868] as LngLat, title: "Lakalantas", sub: "Jl. Pajajaran", kind: "accident" },
    { at: [106.8139, -6.5689] as LngLat, title: "Genangan 30 cm", sub: "Jl. Pajajaran", kind: "flood" },
  ],
  cctv: [
    [106.7905, -6.5915], [106.8102, -6.5951], [106.7801, -6.5842], [106.8186, -6.5785], [106.7962, -6.6152],
    [106.7731, -6.5664], [106.8215, -6.6094], [106.7852, -6.6081],
  ] as LngLat[],
};
/** zona EWS: pusat & radius dasar (meter) */
export const EWS_ZONES = {
  flood: { at: [106.8098, -6.5935] as LngLat, rx: 900, ry: 620 },
  landslide: { at: [106.7565, -6.6085] as LngLat, rx: 750, ry: 600 },
  wind: { at: [106.8005, -6.6355] as LngLat, rx: 800, ry: 520 },
};
