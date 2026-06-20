# Task Management API

REST API sistem Task Management dengan fitur manajemen Project & Task standar, ditambah fitur **AI Command** — user bisa mengetik instruksi bahasa natural untuk melakukan operasi CRUD pada Task, yang diproses oleh Gemini API.

## Tech Stack

- **Runtime / Framework**: Node.js + Express.js
- **Bahasa**: JavaScript (ESM)
- **RDBMS**: PostgreSQL (via Prisma ORM)
- **NoSQL**: Redis — dipakai untuk rate limiting
- **Autentikasi**: JSON Web Token (JWT)
- **AI Integration**: Gemini API (`gemini-2.5-flash`)
- **Container**: Docker & Docker Compose

## Fitur

- Register & Login dengan role `admin` / `user`.
- Middleware role-based access control (`authMiddleware` + `roleMiddleware`).
- CRUD Project (khusus `admin`, kecuali list project yang juga bisa diakses `user`).
- CRUD Task (`admin` & `user`).
- **AI Command** (`POST /ai/command`):
  - Prompt user dikirim ke Gemini dengan system prompt yang memaksa output berupa JSON terstruktur (`actions[]`).
  - Response AI diparsing dengan aman — kalau AI berhalusinasi / format salah, API tidak crash, balas `400 Bad Request`.
  - Semua aksi (`CREATE_TASK`, `UPDATE_TASK`, `DELETE_TASK`) dieksekusi dalam satu **Prisma transaction** — kalau satu aksi gagal, semua di-rollback.
  - AI tidak boleh mengubah tabel `User` — request seperti itu otomatis ditolak lewat instruksi system prompt.
  - Setiap pemanggilan endpoint ini (sukses maupun gagal) selalu menulis 1 record ke **Audit Log**.
  - **Rate limiting per user via Redis** — maksimal 10 request/menit per `user_id` (key `ai_cmd:{user_id}`, counter + TTL 60 detik) untuk mencegah abuse karena tiap hit = 1 call berbayar ke Gemini.
- Database seeder untuk data awal (admin, user, project, task, audit log) supaya API langsung bisa diuji tanpa input manual.

## Desain Database

| Model | Keterangan |
|---|---|
| `User` | `id`, `name`, `email` (unique), `password` (hashed bcrypt), `role` (`admin`\|`user`, default `user`) |
| `Project` | `id`, `name`, `description`, `created_by` (FK ke `User`) |
| `Task` | `id`, `project_id` (FK), `title`, `description`, `status` (`todo`\|`in_progress`\|`done`), `priority` (`low`\|`medium`\|`high`), `assignee_id` (FK ke `User`) |
| `AuditLog` | `id`, `user_id` (FK), `action`, `request_payload`, `response_payload`, `status` (`SUCCESS`\|`FAILED`), `failed_reason`, `created_at` |

Skema lengkap ada di [`prisma/models/`](prisma/models/).

## Setup & Instalasi

### Prasyarat

- Node.js 20+
- PostgreSQL (lokal, on-prem, atau container terpisah)
- Redis (lokal, on-prem, atau container terpisah)
- API key Gemini ([Google AI Studio](https://aistudio.google.com/))

### 1. Clone & install dependency

```bash
git clone <repo-url>
cd task-management
npm install
```

### 2. Konfigurasi environment

Copy `.env.example` menjadi `.env`, lalu isi:

```bash
cp .env.example .env
```

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>
JWT_SECRET=<random-secret-string>
GEMINI_API_KEY=<gemini-api-key>
REDIS_URL=redis://<host>:6379
```

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL (dibaca Prisma) |
| `JWT_SECRET` | Secret untuk sign/verify token JWT |
| `GEMINI_API_KEY` | API key Gemini untuk endpoint `/ai/command` |
| `REDIS_URL` | Connection string Redis untuk rate limiting |

> `.env` tidak pernah di-commit (sudah ada di `.gitignore`) — jangan masukkan kredensial asli ke `.env.example`.

### 3. Migrasi & seeding database

```bash
npx prisma migrate deploy   # menjalankan migration yang sudah ada
npx prisma db seed          # mengisi data awal (admin, user, project, task, audit log)
```

Setelah seeding, akun yang tersedia untuk login:

| Email | Password | Role |
|---|---|---|
| `admin@gmail.com` | `password123` | admin |
| `user@gmail.com` | `password123` | user |

### 4. Menjalankan aplikasi

```bash
npm run dev
```

Server berjalan di `http://localhost:3000`.

### Menjalankan via Docker

Image di `Dockerfile` hanya menjalankan service Node.js (`prisma migrate deploy` lalu start server) — PostgreSQL dan Redis **tidak** disertakan di `docker-compose.yml` karena diasumsikan sudah tersedia (on-prem/server existing).

```bash
docker compose up --build
```

Compose memetakan **port container `3000` ke port host `8001`**, jadi API bisa diakses di `http://localhost:8001`. Pastikan `DATABASE_URL` dan `REDIS_URL` di `.env` mengarah ke host PostgreSQL/Redis yang bisa dijangkau dari dalam container (bukan `localhost` kalau service-nya jalan di host, gunakan IP/hostname on-prem yang sesuai).

## Dokumentasi Endpoint

Semua endpoint ber-otentikasi mengharapkan header:

```
Authorization: Bearer <token>
```

### Autentikasi

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/auth/register` | Public | Daftar user baru (`name`, `email`, `password`, `role`) |
| POST | `/auth/login` | Public | Login, balas `{ user, token }` |

### Projects

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/projects` | admin | Buat project (`name`, `description`) |
| GET | `/projects` | admin, user | List semua project |
| GET | `/projects/:id` | admin | Detail satu project |
| PUT | `/projects/:id` | admin | Update project |
| DELETE | `/projects/:id` | admin | Hapus project |
| GET | `/projects/:id/tasks` | admin, user | List semua task dalam satu project |

### Tasks

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/tasks` | admin, user | Buat task (`project_id`, `title`, `description`, `assignee_id`, `status`, `priority`) |
| GET | `/tasks` | admin, user | List semua task |
| GET | `/tasks/:id` | admin, user | Detail satu task |
| PUT | `/tasks/:id` | admin, user | Update task |
| DELETE | `/tasks/:id` | admin, user | Hapus task |

### AI Command

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/ai/command` | admin, user | Eksekusi instruksi natural language → CRUD Task |

Contoh request body:

```json
{
  "prompt": "Tolong buatkan task baru di project ID 1 dengan judul 'Fix Login Bug', assign ke user ID 3. Terus sekalian ubah status task ID 5 jadi 'done'."
}
```

Response sukses:

```json
{
  "message": "Command berhasil dieksekusi",
  "actions": [ { "type": "CREATE_TASK", "data": { /* ... */ } } ]
}
```

Kalau melebihi 10 request/menit, endpoint ini balas `429 Too Many Requests` dengan header `Retry-After` (detik) dan body:

```json
{
  "message": "Terlalu banyak request. Maksimal 10 request per menit.",
  "retryAfter": 42
}
```

## Cara Merancang Prompt AI

System prompt (lihat [`src/services/gemini.service.js`](src/services/gemini.service.js)) dirancang dengan beberapa aturan ketat agar output AI bisa langsung diparsing dan dieksekusi dengan aman:

1. **Scope dibatasi ke Task saja** — AI diberi instruksi eksplisit "hanya boleh mengelola Task" dan dilarang membuat/mengubah/menghapus User. Kalau prompt user meminta operasi User, AI diarahkan mengembalikan action khusus `USER_OPERATION_NOT_ALLOWED` alih-alih mencoba mengeksekusinya.
2. **Output dipaksa JSON murni** — prompt secara eksplisit melarang markdown, code block, atau penjelasan tambahan, supaya `JSON.parse()` di backend tidak gagal karena teks pembungkus.
3. **Skema output & naming konsisten** — system prompt mendefinisikan bentuk persis tiap action (`CREATE_TASK`, `UPDATE_TASK`, `DELETE_TASK`) beserta field yang wajib dipakai (`project_id`, `task_id`, `assignee_id`, dst) dan daftar nama field yang **dilarang** (`projectId`, `taskId`, `assignedTo`) — ini mengantisipasi inkonsistensi penamaan yang sering muncul dari model bahasa.
4. **Mendukung multi-action dalam satu prompt** — prompt menjelaskan bahwa satu instruksi user bisa menghasilkan beberapa action sekaligus, dieksekusi berurutan sesuai urutan permintaan, yang kemudian dijalankan dalam satu Prisma transaction di backend.
5. **Validasi berlapis di sisi backend** — backend tidak percaya begitu saja output AI: tiap field wajib (`project_id`, `title`, `assignee_id`, dll) dicek ulang, relasi (`project`, `user`) divalidasi ke database sebelum eksekusi, dan seluruh JSON yang gagal diparsing langsung ditolak dengan `400` tanpa pernah menyentuh database.

## Catatan Tambahan

- Audit log (tabel `audit_log`) mencatat setiap pemanggilan `/ai/command`, baik sukses maupun gagal (format JSON tidak valid dari AI, error validasi, error transaksi).
- Rate limiter (`src/middleware/aiRateLimiter.js`) bersifat **fail-closed**: kalau Redis tidak bisa dihubungi, request ke `/ai/command` ditolak (`503`) daripada diloloskan tanpa proteksi — karena setiap request yang lolos berarti cost ke Gemini API.
