# Bogor Command Center — Dashboard

Dashboard Intelligent City Command Center Pemerintah Kota Bogor.
Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS 4 · MapLibre GL · Recharts.

## Modul

| Route | Halaman |
| --- | --- |
| `/` | Beranda (ringkasan kota, peta skematis) |
| `/data-statistik` | Data & Statistik |
| `/call-center` | Call Center 112 & aduan |
| `/surveillance` | Video wall CCTV & deteksi AI |
| `/geospasial` | Peta GIS 3D |
| `/city-operation` | Hidrologi, PJU, persampahan |
| `/ews-ai` | Peringatan dini & prediksi AI |

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

`predev`/`prebuild` menyalin worker MapLibre ke `public/` secara otomatis.

## Struktur

```
src/
  app/(beranda)/        halaman Beranda (peta latar penuh)
  app/(modul)/          6 modul lain dengan top bar standar
  components/
    layout/top-bar.tsx  logo, navigasi modul, jam, cuaca
    ui/                 Panel, Pill, Bar, IconTile, Segmented, Toggle
    charts/             AreaTrend (Recharts), Ring (SVG)
    maps/               BaseMap (MapLibre), pin, peta skematis
    cctv/               CameraFeed + HlsPlayer
  data/bogor.ts         SEMUA data dummy — ganti dengan API per modul
```

## Konfigurasi (`.env`, lihat `.env.example`)

- `NEXT_PUBLIC_CCTV_HLS_TEMPLATE` — URL HLS kamera, `{id}` diganti ID kamera (mis. `CAM-001`). Kosong = mode demo.
- `NEXT_PUBLIC_MAP_STYLE_LIGHT` / `_3D` / `_DARK` — style MapLibre (default OpenFreeMap).

Ganti `public/logo-kota-bogor.svg` dengan lambang resmi Kota Bogor.

## Deploy

Ringkas:

```bash
npm run docker:release                                   # laptop: build + push
docker compose -f docker-compose.prod.yml pull && \
docker compose -f docker-compose.prod.yml up -d          # VPS
```

Panduan lengkap (build, push, pull, update, rollback, Nginx, troubleshooting): [docs/DEPLOY.md](docs/DEPLOY.md).
