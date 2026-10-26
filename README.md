# Warehouse Receiving System

Aplikasi web untuk mengelola produk, dokumen penerimaan barang, stok, dan riwayat transaksi. Stack: Next.js, Express, PostgreSQL, dan Docker Compose.

## Persyaratan

- Docker Desktop dan Docker Compose v2 untuk menjalankan seluruh aplikasi; atau
- Node.js 22+, npm, dan PostgreSQL untuk mode pengembangan lokal.

## Jalankan seluruh aplikasi dengan Docker

1. Salin `.env.example` menjadi `.env` di direktori root.
2. Ganti `DB_PASSWORD` dan `JWT_SECRET` dengan nilai acak yang kuat. Jangan commit `.env`.
3. Jalankan:

   ```powershell
   docker compose up --build
   ```

   Compose menunggu PostgreSQL sehat, menjalankan migrasi, lalu memulai API dan UI.
4. Buka UI di <http://localhost:3001>. API tersedia di <http://localhost:3000/api/health>.
5. Buat akun melalui halaman **Daftar**. Registrasi publik memberikan role `staff`; akun ini dapat membuat produk/dokumen dan mencatat penerimaan.
6. Untuk menetapkan supervisor/admin awal, registrasikan akun tersebut terlebih dahulu. Promosikan akun itu secara eksplisit dengan `ADMIN_EMAIL` yang menunjuk alamat terdaftar. Untuk Compose, jalankan `docker compose exec -e ADMIN_EMAIL=supervisor@example.com backend npm run promote-admin`.

Untuk menghentikan aplikasi, tekan `Ctrl+C`, lalu jalankan `docker compose down`. Data database tetap ada di volume `postgres_data`. Untuk menghapus data lokal, jalankan `docker compose down -v` dengan sadar bahwa tindakan ini menghapus database pada volume tersebut.

## Pengembangan lokal

### Backend

1. Siapkan PostgreSQL dan buat database/user.
2. Salin `.env.example` ke `backend/.env`; untuk PostgreSQL lokal gunakan `DB_HOST=localhost`. Ganti password dan `JWT_SECRET`. Jangan commit file `.env`.
3. Jalankan:

   ```powershell
   cd backend
   npm ci
   npm run migrate
   npm run dev
   ```

API berjalan di port `3000` secara default.

Untuk membuat admin lokal setelah registrasi:

```powershell
$env:ADMIN_EMAIL = "supervisor@example.com"
npm run promote-admin
Remove-Item Env:ADMIN_EMAIL
```

### Frontend

Di terminal lain, buat `frontend/.env.local` dengan:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Lalu jalankan:

```powershell
cd frontend
npm ci
npm run dev -- --port 3001
```

Buka <http://localhost:3001>.

## Fitur utama

- Registrasi/login dengan JWT.
- Manajemen produk dan stok awal nol.
- Pembuatan dokumen penerimaan dengan satu atau lebih produk.
- Penerimaan parsial/penuh, validasi batas kuantitas, dan pencegahan retry duplikat melalui `Idempotency-Key`.
- Daftar/detail dokumen, persediaan, dan riwayat transaksi.
- Migrasi database terlacak dan aman dijalankan ulang.

## Pemeriksaan

```powershell
cd backend
npm test
npm run migrate

cd ..\frontend
npm run lint
npm run build
```

Rincian cakupan test dan batasannya ada di [docs/testing.md](./docs/testing.md). OpenAPI tersedia di [docs/openapi.yaml](./docs/openapi.yaml); keputusan teknis dan skema data ada di [docs/technical-spec.md](./docs/technical-spec.md) dan [docs/erd.md](./docs/erd.md).

## Environment variables

Compose membaca konfigurasi root `.env` dari [.env.example](./.env.example). Backend lokal membaca variabel database dan JWT dari `backend/.env`; frontend lokal membaca `NEXT_PUBLIC_API_URL` dari `frontend/.env.local`. Jangan masukkan token, password, atau file `.env` ke commit.

## AI-assisted development

Instruksi repository dan contoh prompt workflow tercatat pada [docs/ai-workflow.md](./docs/ai-workflow.md) dan [.github/copilot-instructions.md](./.github/copilot-instructions.md).
