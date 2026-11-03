# Deploy dengan Docker

Panduan build, push, pull, dan menjalankan dashboard Bogor Command Center memakai Docker.

- [Ringkasan alur](#ringkasan-alur)
- [Prasyarat](#prasyarat)
- [File terkait](#file-terkait)
- [Konfigurasi `.env`](#konfigurasi-env)
- [1. Build image](#1-build-image)
- [2. Uji di laptop](#2-uji-di-laptop)
- [3. Push ke Docker Hub](#3-push-ke-docker-hub)
- [4. Deploy di VPS](#4-deploy-di-vps)
- [5. Update versi baru](#5-update-versi-baru)
- [6. Rollback](#6-rollback)
- [Tanpa Docker Hub (save/load)](#tanpa-docker-hub-saveload)
- [Reverse proxy & HTTPS](#reverse-proxy--https)
- [Perintah harian](#perintah-harian)
- [Troubleshooting](#troubleshooting)

## Ringkasan alur

```
Laptop                                   Docker Hub                      VPS
───────────────────────────────          ────────────────────           ─────────────────────────────
docker compose build  ──► image  ──push──► nadifhartaman/          ──pull──► docker compose -f
                                            iccc-bogor-dashboard               docker-compose.prod.yml up -d
```

Image dibangun sekali di laptop, dikirim ke Docker Hub, lalu VPS hanya menarik image jadi. VPS tidak butuh source code maupun Node.js.

## Prasyarat

| Tempat | Kebutuhan |
| --- | --- |
| Laptop (build) | Docker Desktop (sudah termasuk Compose v2 dan Buildx), akun Docker Hub |
| VPS (jalan) | Docker Engine + plugin Compose v2, akses internet ke Docker Hub |

Cek versi:

```bash
docker --version
docker compose version
```

Login ke Docker Hub (sekali per mesin, di laptop dan VPS bila repo privat):

```bash
docker login -u nadifhartaman
```

> Gunakan **Access Token** dari Docker Hub (Account Settings → Personal access tokens) sebagai password, bukan password akun.

## File terkait

| File | Fungsi |
| --- | --- |
| `Dockerfile` | Build multi-stage: `deps` → `builder` (`next build`, output standalone) → `runner` (Node 22 Alpine, user non-root, healthcheck) |
| `docker-compose.yml` | Dipakai di laptop: build, jalankan, push. Membaca `.env` |
| `docker-compose.prod.yml` | Dipakai di VPS: hanya `image`, tanpa build. Ada rotasi log |
| `.dockerignore` | Mengecualikan `node_modules`, `.next`, `.env*`, dokumen, dsb. dari build context |
| `.env.example` | Template variabel |

## Konfigurasi `.env`

```bash
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```

| Variabel | Dipakai saat | Keterangan |
| --- | --- | --- |
| `NEXT_PUBLIC_CCTV_HLS_TEMPLATE` | **build** | URL HLS CCTV, `{id}` diganti ID kamera. Kosong = mode demo |
| `NEXT_PUBLIC_MAP_STYLE_*` | **build** | Style peta MapLibre. Kosong = default OpenFreeMap |
| `IMAGE_NAME` | compose | Nama repo image di Docker Hub |
| `IMAGE_TAG` | compose | Tag image, mis. `1.0.0` atau `latest` |
| `HOST_PORT` | compose | Port di host (default `3055`) yang diteruskan ke port 3000 container |

> **Penting:** semua `NEXT_PUBLIC_*` ditanam ke JavaScript saat `next build`. Mengubahnya di VPS **tidak berpengaruh**; ubah `.env` di laptop lalu **build ulang** image. Karena itu `.env` tidak ikut ke dalam image dan VPS tidak membutuhkannya (kecuali untuk `IMAGE_TAG`/`HOST_PORT`).

## 1. Build image

Dari folder `dashboard`:

```bash
docker compose build
# atau
npm run docker:build
```

Image yang dihasilkan: `${IMAGE_NAME}:${IMAGE_TAG}` → default `nadifhartaman/iccc-bogor-dashboard:latest`.

Build dengan nomor versi (disarankan, agar bisa rollback):

```bash
# Linux / macOS / Git Bash
IMAGE_TAG=1.0.0 docker compose build

# Windows PowerShell
$env:IMAGE_TAG="1.0.0"; docker compose build
```

Atau cukup ubah `IMAGE_TAG=1.0.0` di `.env`.

Build dari nol (tanpa cache), misalnya setelah ganti dependensi:

```bash
docker compose build --no-cache
```

> Image dibangun untuk `linux/amd64` (diatur di `docker-compose.yml`), sesuai kebanyakan VPS. Jika VPS memakai ARM (mis. Ampere/Graviton), ganti menjadi `linux/arm64`, atau bangun untuk keduanya dengan `docker buildx build --platform linux/amd64,linux/arm64 -t nadifhartaman/iccc-bogor-dashboard:1.0.0 --push .` (build args perlu ditambahkan dengan `--build-arg`).

## 2. Uji di laptop

```bash
docker compose up -d          # npm run docker:up
docker compose ps             # status harus "healthy" setelah ±20 detik
docker compose logs -f        # npm run docker:logs
```

Buka <http://localhost:3055>. Hentikan dengan:

```bash
docker compose down           # npm run docker:down
```

## 3. Push ke Docker Hub

```bash
docker compose push           # npm run docker:push
```

Build + push sekaligus:

```bash
npm run docker:release
```

Jika memakai tag versi, sekalian tandai sebagai `latest`:

```bash
docker tag nadifhartaman/iccc-bogor-dashboard:1.0.0 nadifhartaman/iccc-bogor-dashboard:latest
docker push nadifhartaman/iccc-bogor-dashboard:1.0.0
docker push nadifhartaman/iccc-bogor-dashboard:latest
```

## 4. Deploy di VPS

Deploy pertama kali:

```bash
# 1) siapkan folder
sudo mkdir -p /opt/iccc-bogor && cd /opt/iccc-bogor

# 2) salin docker-compose.prod.yml dari laptop, mis. dengan scp:
#    scp docker-compose.prod.yml user@IP_VPS:/opt/iccc-bogor/
#    atau buat manual: sudo nano docker-compose.prod.yml

# 3) (opsional) .env untuk tag/port
echo "IMAGE_TAG=latest"  | sudo tee .env
echo "HOST_PORT=3055"    | sudo tee -a .env

# 4) tarik & jalankan
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
```

Aplikasi berjalan di `http://IP_VPS:3055`. Pastikan port terbuka di firewall (mis. `sudo ufw allow 3055/tcp`) atau gunakan reverse proxy (lihat di bawah).

> Supaya tidak perlu menulis `-f docker-compose.prod.yml` terus, ganti nama file menjadi `docker-compose.yml` di VPS.

## 5. Update versi baru

Di laptop:

```bash
docker compose build && docker compose push      # npm run docker:release
```

Di VPS:

```bash
cd /opt/iccc-bogor
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker image prune -f        # hapus image lama yang tidak terpakai
```

`up -d` hanya membuat ulang container bila image berubah; downtime biasanya beberapa detik.

## 6. Rollback

Hanya bisa jika image diberi tag versi (lihat langkah 1). Di VPS:

```bash
# ubah tag ke versi sebelumnya
sed -i 's/^IMAGE_TAG=.*/IMAGE_TAG=1.0.0/' .env
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Daftar tag yang tersedia bisa dilihat di halaman repo Docker Hub.

## Tanpa Docker Hub (save/load)

Untuk VPS tanpa akses Docker Hub, kirim image sebagai file:

```bash
# laptop
docker save nadifhartaman/iccc-bogor-dashboard:latest | gzip > iccc-bogor.tar.gz
scp iccc-bogor.tar.gz user@IP_VPS:/opt/iccc-bogor/

# VPS
gunzip -c iccc-bogor.tar.gz | docker load
docker compose -f docker-compose.prod.yml up -d
```

## Reverse proxy & HTTPS

Contoh Nginx agar dashboard bisa diakses lewat domain (mis. `iccc.kotabogor.go.id`):

```nginx
server {
    listen 80;
    server_name iccc.kotabogor.go.id;

    location / {
        proxy_pass         http://127.0.0.1:3055;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
    }
}
```

Lalu pasang sertifikat: `sudo certbot --nginx -d iccc.kotabogor.go.id`.
Jika memakai reverse proxy, port bisa dibatasi ke localhost: ubah `ports` menjadi `"127.0.0.1:${HOST_PORT:-3055}:3000"`.

## Perintah harian

| Tujuan | Perintah |
| --- | --- |
| Status & health | `docker compose ps` |
| Log realtime | `docker compose logs -f --tail=100` |
| Restart | `docker compose restart` |
| Stop | `docker compose down` |
| Masuk ke container | `docker exec -it iccc-bogor-dashboard sh` |
| Pemakaian CPU/RAM | `docker stats iccc-bogor-dashboard` |
| Bersihkan image lama | `docker image prune -f` |
| Bersihkan cache build (laptop) | `docker builder prune -f` |

(Di VPS tambahkan `-f docker-compose.prod.yml` bila nama file belum diganti.)

## Troubleshooting

| Gejala | Penyebab & solusi |
| --- | --- |
| `denied: requested access to the resource is denied` saat push | Belum `docker login`, atau `IMAGE_NAME` bukan milik akun yang login |
| `no matching manifest for linux/arm64` di VPS | VPS ARM, image amd64. Build ulang dengan `platforms: [linux/arm64]` atau buildx multi-platform |
| Container `unhealthy` | Lihat `docker compose logs`. Healthcheck memanggil `http://127.0.0.1:3000/` di dalam container |
| `port is already allocated` | Port host dipakai aplikasi lain. Ganti `HOST_PORT` di `.env` |
| Peta kosong / "Peta dasar tidak dapat dimuat" | Browser pengguna tidak bisa mengakses `tiles.openfreemap.org` (firewall/proxy kantor). Izinkan domain tersebut atau set `NEXT_PUBLIC_MAP_STYLE_*` ke server tile internal, lalu build ulang |
| Peta error "Worker failed to load" | File `public/maplibre-gl-worker.mjs` tidak ada. Dibuat otomatis oleh `npm run build` (script `prebuild`); pastikan folder `scripts/` ikut di build context |
| Perubahan `NEXT_PUBLIC_*` tidak muncul | Variabel ini dibaca saat build. Ubah `.env` di laptop lalu `docker compose build` ulang, push, dan pull di VPS |
| Video CCTV tidak tampil | Server HLS harus mengizinkan CORS dari domain dashboard dan memakai HTTPS bila dashboard HTTPS |
| Disk VPS penuh | `docker image prune -a -f` dan `docker system df` untuk melihat pemakaian |
