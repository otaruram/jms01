# Blueprint Sistem Admin Dashboard Terintegrasi (Enterprise-Grade)

*File ini dikelola oleh AI Agent. Berisi state tracker, dokumentasi arsitektur, skema relasi, pola keamanan, dan log pembaruan fitur.*

---

## 1. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Vite + React 19 + TypeScript + CSS Modules + **Tailwind CSS (Responsive Mobile-First)** |
| **Backend** | Node.js + Express 5 + TypeScript |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma ORM v5 (Schema, Migrations, Client) |
| **Validasi** | Zod (input validation pada setiap endpoint POST/PUT/PATCH) |
| **Auth** | Supabase JWT — diverifikasi via JWKS endpoint (`jose` library) |
| **Security** | `helmet` (HTTP headers), `express-rate-limit` (DDoS/brute-force), RLS (Row Level Security) di Supabase |
| **Infrastructure** | Docker & Docker Compose (multi-stage build) |

---

## 2. Arsitektur Backend — Domain-Driven Design (Separation of Concerns)

```
backend/
├── prisma/
│   ├── schema.prisma         # Skema relasi + @@index
│   ├── migrations/           # Riwayat migrasi SQL
│   └── seed.ts               # Data awal untuk development
│
├── src/
│   ├── config/
│   │   └── database.ts       # Prisma Client singleton (anti memory leak)
│   │
│   ├── validators/           # Zod schemas per modul
│   │   ├── inventory.validator.ts
│   │   ├── project.validator.ts
│   │   ├── document.validator.ts
│   │   ├── order.validator.ts
│   │   └── sph-bast.validator.ts
│   │
│   ├── middlewares/
│   │   ├── auth.ts           # JWT verification (Supabase) + Auto-sync User ke lokal DB
│   │   ├── role.ts           # RBAC (Role-Based Access Control: SUPER_ADMIN, ADMIN)
│   │   ├── activityLogger.ts # Interceptor otomatis pencatatan Audit Trail
│   │   ├── validate.ts       # Zod middleware factory
│   │   └── rateLimiter.ts    # Global (100 req/15m) & Strict (10 req/1m)
│   │
│   ├── routes/               # Definisi endpoint saja
│   │   ├── auth.routes.ts    # Get current user + role
│   │   ├── system.routes.ts  # Super Admin: Manajemen User & Activity Logs
│   │   ├── inventory.routes.ts
│   │   ├── project.routes.ts
│   │   ├── document.routes.ts
│   │   ├── order.routes.ts
│   │   ├── dashboard.routes.ts
│   │   └── sph-bast.routes.ts
│   │
│   ├── controllers/          # Request/Response handling
│   │   ├── inventory.controller.ts
│   │   ├── project.controller.ts
│   │   ├── document.controller.ts
│   │   ├── order.controller.ts
│   │   ├── dashboard.controller.ts
│   │   └── sph-bast.controller.ts
│   │
│   ├── services/             # Business logic & transaksi
│   │   ├── inventory.service.ts
│   │   ├── project.service.ts
│   │   ├── document.service.ts
│   │   ├── order.service.ts       # State Machine (UNPAID → PROCESS → PAID)
│   │   ├── dashboard.service.ts   # Agregasi ringan (count/sum)
│   │   └── sph-bast.service.ts
│   │
│   ├── repositories/         # Data access layer (Prisma queries)
│   │   ├── inventory.repository.ts
│   │   ├── project.repository.ts
│   │   ├── document.repository.ts
│   │   ├── order.repository.ts
│   │   └── sph-bast.repository.ts
│   │
│   ├── utils/
│   │   └── pagination.ts     # parsePagination() + paginatedResponse()
│   │
│   ├── app.ts                # Express setup, middleware, routing
│   └── server.ts             # Server bootstrap + graceful shutdown
│
├── .env                      # Kredensial database lokal (development) & variabel environment default
├── .env.production           # Kredensial database produksi (Vercel & Supabase Prod)
├── Dockerfile                # Multi-stage build (builder → production)
└── docker-compose.yml        # Orchestration
```

### 2.1 Hierarki Environment Variables (.env)
Sistem menggunakan dua file environment utama untuk memisahkan konfigurasi lokal dan produksi, sehingga mencegah modifikasi atau kebocoran data produksi saat masa *development*.

1. **`.env` (Lokal / Development)**
   - **Fungsi:** Mengatur variabel yang digunakan saat menjalankan server lokal (`npm run dev`).
   - **Database:** Terhubung ke instance database *development* atau staging Supabase.
   - **Penggunaan:** Modifikasi kode, eksperimen fitur baru, dan pengujian API menggunakan Postman.

2. **`.env.production` (Produksi / Vercel)**
   - **Fungsi:** Mengatur kredensial aman yang hanya digunakan oleh *build system* Vercel saat deployment final.
   - **Database:** Terhubung ke instance database *Production* (URL Supabase yang sesungguhnya).
   - **Penggunaan:** Prisma Push untuk sinkronisasi skema tabel nyata, dan *live hosting* di cloud (URL Vercel).

---

## 3. Pola Keamanan (Enterprise Security)

### 3.1 Request Flow (Pipeline)
```
Client Request
  → helmet (secure headers)
  → cors
  → express-rate-limit (global: 100 req/15min)
  → express.json() (body parser)
  → authMiddleware (JWT verification via Supabase JWKS)
  → validate(zodSchema) (input validation)
  → Controller → Service → Repository → Prisma → PostgreSQL
```

### 3.2 Rate Limiting Strategy
| Endpoint | Limit | Window |
|----------|-------|--------|
| Global (semua `/api/*`) | 100 requests | 15 menit |
| Sensitif (`POST /api/documents`) | 10 requests | 1 menit |

### 3.3 Database Security
- **Row Level Security (RLS)**: Diaktifkan pada seluruh tabel di Supabase.
- **Prisma Singleton**: Satu koneksi pool global untuk mencegah *connection exhaustion*.
- **PgBouncer**: Transaction-mode pooling via Supabase pooler.

---

## 4. Skema Database (Prisma) + Indeks

### Relasi Tabel
```text
User (id, email, name, role)
ActivityLog (id, userId, action, module, timestamp)

Client ─1:N─► Project ─1:N─► ProjectCapital
  │                  │
  │                  └─1:N─► Installation ◄─N:1─ Product
  │
  └─1:N─► Order

DocumentMaster ─1:1─► Kwitansi
               └─1:1─► SuratJalan

Sph (standalone, indexed by clientId + projectId)
Bast (standalone, indexed by clientId + projectId)
```

### Indexed Columns (@@index)
| Tabel | Kolom yang diindeks |
|-------|---------------------|
| User | `role` |
| ActivityLog | `userId`, `module`, `timestamp` |
| Product | `category`, `status` |
| Installation | `productId`, `projectId` |
| Project | `clientId`, `status` |
| ProjectCapital | `projectId` |
| Order | `clientId`, `status` |
| DocumentMaster | `clientId`, `projectId` |
| Sph | `clientId`, `projectId`, `status` |
| Bast | `clientId`, `projectId` |

---

## 5. Optimasi Data (Anti Memory Leak)

| Aturan | Implementasi |
|--------|-------------|
| **Pagination wajib** | `parsePagination(req.query)` — default 20, max 50 per request |
| **Selective Fetching** | Setiap repository menggunakan `select` Prisma, bukan `include` |
| **No SELECT *** | Dilarang — semua query eksplisit memilih kolom |
| **Response Shape** | `{ success, data, meta: { page, limit, total, totalPages } }` |

---

## 6. Daftar Endpoint API

### System & Auth (RBAC)
| Method | Path | Middleware | Deskripsi |
|--------|------|-----------|-----------|
| `GET` | `/api/auth/me` | auth | Dapatkan profil & role login saat ini |
| `GET` | `/api/system/users` | auth, role(SUPER_ADMIN) | Daftar pengguna sistem |
| `PATCH`| `/api/system/users/:id/role`| auth, role(SUPER_ADMIN), logger | Ubah role pengguna |
| `GET` | `/api/system/logs` | auth, role(SUPER_ADMIN) | Audit trail log aktivitas |

### Inventory
| Method | Path | Middleware | Deskripsi |
|--------|------|-----------|-----------|
| `GET` | `/api/inventory` | auth | Daftar stok (paginated) |
| `POST` | `/api/inventory/install` | auth, validate(Zod) | Pemasangan + potong stok (transaction) |

### Projects
| Method | Path | Middleware | Deskripsi |
|--------|------|-----------|-----------|
| `GET` | `/api/projects` | auth | Daftar proyek (paginated) |
| `GET` | `/api/projects/:id` | auth | Detail proyek + modal + instalasi |
| `POST` | `/api/projects/capital` | auth, validate(Zod) | Tambah modal (transaction) |

### Documents (Single Input)
| Method | Path | Middleware | Deskripsi |
|--------|------|-----------|-----------|
| `POST` | `/api/documents` | auth, strictLimiter, validate(Zod) | Buat DocumentMaster + Kwitansi + SuratJalan (ACID transaction) |

### Orders (State Machine)
| Method | Path | Middleware | Deskripsi |
|--------|------|-----------|-----------|
| `GET` | `/api/orders` | auth | Daftar pesanan (paginated) |
| `POST` | `/api/orders` | auth, validate(Zod) | Buat pesanan baru (status: UNPAID) |
| `PATCH` | `/api/orders/:id/status` | auth, validate(Zod) | Ubah status (UNPAID→PROCESS→PAID) |

### SPH & BAST
| Method | Path | Middleware | Deskripsi |
|--------|------|-----------|-----------|
| `GET` | `/api/sph` | auth | Daftar SPH (paginated) |
| `POST` | `/api/sph` | auth, validate(Zod) | Buat SPH baru |
| `GET` | `/api/bast` | auth | Daftar BAST (paginated) |
| `POST` | `/api/bast` | auth, validate(Zod) | Buat BAST baru |

### Dashboard
| Method | Path | Middleware | Deskripsi |
|--------|------|-----------|-----------|
| `GET` | `/api/dashboard/stats` | auth | Agregasi ringan (count/sum) |

### System
| Method | Path | Middleware | Deskripsi |
|--------|------|-----------|-----------|
| `GET` | `/health` | (public) | Health check untuk Docker/K8s |

---

## 7. Log Pembaruan Fitur

### [2026-08-29] — Inisialisasi & Setup
- Inisialisasi `agent.md` sebagai blueprint proyek.
- Fix bug frontend komponen UI (Card, Sidebar, SlideOver).
- Setup frontend React + Vite dengan CSS Modules.
- Implementasi Landing Page + Google Auth (Supabase).

### [2026-08-29] — Backend Foundation
- Inisiasi folder `backend/` dengan Express, TypeScript, dan Prisma ORM.
- Pembuatan `schema.prisma` dengan relasi Product, Project, Order, Document.
- Implementasi Separation of Concerns (Controller → Service → Repository) untuk modul Inventory.
- Pembuatan transaksi database atomik untuk potong stok saat pemasangan.

### [2026-08-29] — Production Architecture
- Setup `.env.production` dan `.env.local` untuk dual-environment (lokal + Supabase).
- Instalasi `helmet` dan `express-rate-limit` untuk keamanan.
- Restrukturisasi `app.ts` + `server.ts` (graceful shutdown).
- Pembuatan `Dockerfile` (multi-stage) dan `docker-compose.yml`.
- Migrasi database ke Supabase Production + Seeding data awal.
- Aktivasi Row Level Security (RLS) pada seluruh tabel di kedua database.

### [2026-08-29] — Enterprise-Grade Refactor
- **Keamanan**: JWT auth middleware (`jose` + Supabase JWKS), Zod input validation pada semua endpoint.
- **Optimasi**: Pagination wajib (max 50/req), selective fetching (`select`), database indexing (`@@index`).
- **Anti-Spaghetti**: Konsistensi arsitektur — semua service melalui repository, tidak ada `prisma` langsung di service.
- **Modul Baru**: Order (state machine UNPAID→PROCESS→PAID), SPH & BAST (schema + CRUD), Dashboard (agregasi ringan).
- **Blueprint**: Tulis ulang `agent.md` secara menyeluruh sesuai standar Enterprise.

### [2026-08-29] — RBAC, Mobile-First, & Audit Trail
- **Mobile-First UI**: Instalasi Tailwind CSS. Implementasi hamburger menu & off-canvas sidebar. Wrapper `overflow-x-auto` pada semua tabel.
- **Role-Based Access Control**: Penambahan tabel `User`. Ekstraksi context role (`useAuth()`) di frontend. Proteksi endpoint POST/PATCH/DELETE khusus `ADMIN` dan `SUPER_ADMIN`.
- **Super Admin Panel**: Halaman "Pengaturan Sistem" untuk manajemen akses (`role`) pengguna.
- **Activity Logger**: Middleware Express.js terpusat (`activityLogger.ts`) yang otomatis menyimpan rekam jejak operasi (Audit Trail) ke tabel `ActivityLog` setiap kali ada manipulasi data (POST/PUT/PATCH/DELETE).
- **Auto-Sync Auth**: `authMiddleware` otomatis mendaftarkan user baru yang login ke database lokal. User dengan email yang sama di `.env` (`SUPER_ADMIN_EMAIL`) otomatis diberikan previlese tertinggi.

### [2026-08-29] — Database Timestamp Standardization & Defensive Programming
- **Standardisasi Skema Database**: Mengganti field `date` dan `timestamp` pada semua model database menjadi standar industri: `createdAt DateTime @default(now())` dan `updatedAt DateTime @updatedAt`.
- **Defensive Backend**: Pembungkusan query database di level controller dengan block `try...catch` terstandarisasi yang mengembalikan respons error JSON berstatus 500 dan mencegah crash server.
- **Graceful Error Handling Frontend**: Implementasi skeleton loader saat fetching data dan UI error screen interaktif yang dilengkapi tombol "Coba Lagi" (Retry) pada dashboard frontend untuk penanganan kegagalan API.

### [2026-08-29] — MASTER DIRECTIVE: Full System Rebuild (UI/UX & E2E Logic)
- **Sinkronisasi Environment**: Menambahkan seeder pada `prisma/seed.ts` yang memastikan `okitr52@gmail.com` secara absolut dan permanen diregistrasikan dengan Role `SUPER_ADMIN`.
- **Arsitektur Global Layout UI/UX**: Melakukan perombakan total pada hierarki HTML `DashboardLayout.tsx` dan `Sidebar.tsx`. Diimplementasikan secara strict struktur class Tailwind dengan kontainer `w-64 h-full bg-white` untuk Sidebar dan pembungkus `pt-12 px-10 pb-12 w-full max-w-7xl mx-auto` untuk konten utama agar memberikan layout yang berkelas dan konsisten.
- **E2E Logic**: Konfirmasi integritas halaman dashboard dengan request API *live*, sinkronisasi RBAC di semua halaman, dan pengamanan halaman Pengaturan Sistem (Super Admin) di layer React.

### [2026-08-30] — UI/UX Standardization & Expense Feature
- **Fitur Pengeluaran (Expense)**: Implementasi *end-to-end* untuk pencatatan pengeluaran operasional per proyek. Terdiri dari *Backend* (Prisma Schema, Repository, Service, Controller, Routes) yang sepenuhnya menerapkan *Separation of Concerns* (anti-spaghetti), dan *Frontend* (ExpensesPage dengan form *SlideOver* serta perhitungan otomatis).
- **Komponen AlertModal (Glassmorphism)**: Penghapusan total pemanggilan `window.confirm()` bawaan peramban pada fitur *delete* permanen. Digantikan oleh `AlertModal.tsx` terpusat yang *reusable* dan modern untuk menjamin *Clean Code* di seluruh komponen halaman.
- **Standarisasi Pagination & Search**: Refactoring *state management* pencarian dan batasan tampilan *history* (maksimal 10 data) pada fitur SPH, BAST, Dokumen (Kwitansi/Surat Jalan), Proyek, Inventaris, dan Pesanan.
- **Responsivitas Ekstrem (Mobile Friendly)**: Penambahan global `overflow-x-auto` pada semua tabel historis untuk mendukung *horizontal scroll* dari perangkat sentuh (*mobile*).
- **Toast Notifications System**: Mengganti notifikasi *alert* standar sistem (terutama di pengaturan *role* akun) dengan *Toast* kustom yang muncul elegan.
- **Sinkronisasi Environment**: Fix koneksi *pooling* Prisma ke Supabase Prod via `.env.production` (dengan port *session* 5432) dan penyelesaian integrasi migrasi DB.

### [2026-08-30] — RLS, Data Isolation, & Security
- **Multi-Tenant RLS (Row Level Security)**: Isolasi ketat pada backend Prisma dimana pengguna hanya dapat melihat dan memodifikasi data milik mereka sendiri. Semua *query* diinjeksi `userId` secara transparan lewat *AsyncLocalStorage*.
- **Pengecualian SUPER_ADMIN**: Khusus untuk modul `ActivityLog`, akses diperluas dengan me-*bypass* aturan RLS sehingga `SUPER_ADMIN` dapat melakukan *audit* menyeluruh terhadap seluruh aktivitas *user* di sistem (log semua akun bisa terbaca di Pengaturan Sistem).
- **Faktur Pajak End-to-End**: Penambahan fitur baru `TaxInvoice` (Schema, Repo, Controller, Validate) yang dilengkapi mekanisme *Auto-Fill (Dev)* pintar, input data modular, validasi *UUID bypass*, dan handling `P2003` yang mendetail.
- **ACID Transaction Restore Stock**: Pembaruan sistem inventaris yang memungkinkan histori instalasi (*Installation History*) dihapus (via API `DELETE /installations/:id`). Proses penghapusan otomatis mengembalikan *(increment)* jumlah stok produk di `Product` ke kondisi semula secara terjamin dengan Prisma `$transaction`.
- **Security Check (Lulus)**: Pengecekan *repository* untuk menjamin `.env` tidak ter-push (dihalangi ketat oleh `.gitignore`), serta verifikasi bahwa sistem RLS tidak memakan sumber daya eksklusif di backend.
