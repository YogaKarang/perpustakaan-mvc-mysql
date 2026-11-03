# Tugas 3 - Master Data Buku Perpustakaan (Express + MySQL)

- **Mata Kuliah:** Pemrograman Web (MK11)
- **Tugas:** Tugas 3 Terstruktur (Kasus Mandiri Non-Cookbook) - Sistem Manajemen Master Entitas Terintegrasi MySQL dan Prepared Statements
- **Nama:** I Wayan Yoga Karang Saputra
- **NIM:** 42530013
- **Kelas:** Pagi - Teknologi Informasi

Aplikasi web monolith (Server-Side Rendering) berbasis **Node.js, Express, dan EJS** yang terhubung ke **MySQL** lewat **connection pool** (`mysql2/promise`). Domain sistem adalah **master data buku perpustakaan** dengan operasi CRUD penuh.

## Fitur

- **MVC ketat:** seluruh query SQL hanya berada di `models/`, controller mengatur alur data, dan view EJS hanya menampilkan antarmuka.
- **Koneksi terisolasi:** kredensial database (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`) disimpan di `.env`, dan contohnya tersedia di `.env.example`.
- **CRUD fungsional:**
  - Daftar data tabular dengan format harga (Rupiah) dan tanggal (Indonesia) yang rapi.
  - Formulir tambah data dengan metode POST dan pola **Post-Redirect-Get (PRG)**.
  - Edit data lewat rute dinamis `/buku/edit/:id` dengan formulir yang terisi data awal (pre-filled).
  - Hapus data dengan konfirmasi dialog di sisi klien.
- **100% prepared statement:** seluruh query `INSERT`, `SELECT ... WHERE`, `UPDATE`, dan `DELETE` memakai placeholder `?` melalui `db.execute()`, tanpa template literal atau penggabungan string pada SQL.
- Validasi sisi server, halaman 404 untuk data yang tidak ditemukan, dan pesan status setelah redirect.

## Skema Tabel

Tabel `buku` memiliki sembilan kolom dengan beragam tipe data:

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `INT AUTO_INCREMENT PRIMARY KEY` | Kunci utama |
| `judul` | `VARCHAR(150)` | Judul buku |
| `penulis` | `VARCHAR(100)` | Nama penulis |
| `sinopsis` | `TEXT` | Ringkasan (opsional) |
| `kategori` | `ENUM('Fiksi','Non-Fiksi','Sains & Teknologi','Sejarah','Referensi')` | Kategori buku |
| `stok` | `INT` | Jumlah eksemplar |
| `harga` | `DECIMAL(10,2)` | Harga buku |
| `tanggal_masuk` | `DATE` | Tanggal buku masuk |
| `created_at` | `TIMESTAMP` | Waktu pencatatan otomatis |

## Cara Menjalankan

1. **Pasang dependensi**

   ```bash
   npm install
   ```

2. **Siapkan database.** Jalankan isi `sql/schema.sql` di klien MySQL (phpMyAdmin, MySQL Workbench, atau DBeaver).

3. **Siapkan variabel lingkungan.** Salin `.env.example` menjadi `.env`, lalu sesuaikan nilainya.

   ```bash
   cp .env.example .env
   ```

   Isi `.env.example`:

   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   DB_NAME=db_perpustakaan
   DB_PORT=3306
   ```

4. **Jalankan server**

   ```bash
   npm run dev
   ```

   Terminal menampilkan `[DATABASE] Terhubung ke MySQL Pool secara aman.` lalu `[SERVER] Aktif di http://localhost:3000`.

5. Buka `http://localhost:3000/buku`.

## Struktur Proyek

```
perpustakaan-mvc-mysql/
├── app.js                          # Entry point: middleware, router, helper format, uji koneksi pool
├── config/database.js              # Connection pool (mysql2) + interface Promise
├── models/buku.model.js            # Seluruh query SQL (prepared statement)
├── controllers/buku.controller.js  # Validasi input dan alur request/response
├── routes/buku.routes.js           # Definisi endpoint (express.Router)
├── views/
│   ├── pages/                      # buku-list, buku-form (tambah dan edit), 404
│   └── partials/                   # header.ejs, footer.ejs
├── public/css/style.css            # Aset statis
├── sql/schema.sql                  # Skema tabel dan data awal
├── docs/screenshots/               # Bukti pengujian
├── .env.example                    # Contoh variabel lingkungan (tanpa kredensial asli)
└── package.json
```

## Endpoint

| Operasi | Endpoint | HTTP Method | Parameter / Payload | Respons |
|---|---|---|---|---|
| Read (All) | `/buku` | GET | - | 200 OK (tabel buku) |
| Form tambah | `/buku/tambah` | GET | - | 200 OK |
| Create | `/buku/tambah` | POST | `req.body` | 302 Found, redirect ke `/buku` |
| Read (One) | `/buku/edit/:id` | GET | `req.params.id` | 200 OK (formulir terisi) |
| Update | `/buku/edit/:id` | POST | `req.params.id` dan `req.body` | 302 Found, redirect ke `/buku` |
| Delete | `/buku/hapus/:id` | POST | `req.params.id` | 302 Found, redirect ke `/buku` |
| Uji keamanan | `/uji-keamanan` | GET | `?penulis=` | JSON hasil pencarian |

## Keamanan Query

Seluruh query memakai placeholder `?`, sehingga nilai input dipisahkan dari struktur SQL:

```js
const [rows] = await db.execute('SELECT * FROM buku WHERE id = ?', [id]);
```

Rute `/uji-keamanan` dipakai untuk pengujian: input `' OR '1'='1` dikirim lewat URL dan diperlakukan sebagai nilai teks biasa, sehingga tidak ada data yang bocor.

## Matriks Penelusuran Pengujian (Traceability Matrix)

| ID Uji | Fitur / Operasi | Target Endpoint URL | HTTP Method | Skenario Pengujian | Hasil yang Diharapkan | Status | Bukti Tangkapan Layar |
|---|---|---|---|---|---|---|---|
| TC-01 | Koneksi Pool | App Startup | - | Server dijalankan pertama kali | Terhubung ke MySQL Pool tanpa error | Pass | [docs/screenshots/01-db-pool-connection.png](docs/screenshots/01-db-pool-connection.png) |
| TC-02 | Read (All) | `/buku` | GET | Akses halaman daftar buku | Menampilkan seluruh record tabel MySQL ke antarmuka EJS | Pass | [docs/screenshots/02-read-select-render.png](docs/screenshots/02-read-select-render.png) |
| TC-03 | Create | `/buku/tambah` | POST | Submit formulir buku baru | Data tersimpan di DB, DevTools mencatat 302 Redirect ke `/buku` | Pass | [docs/screenshots/03-create-insert-prg.png](docs/screenshots/03-create-insert-prg.png) |
| TC-04 | Update | `/buku/edit/:id` | POST | Mengubah harga dan stok buku | Nilai kolom pada baris MySQL berubah sesuai input baru | Pass | [docs/screenshots/04-update-param-redirect.png](docs/screenshots/04-update-param-redirect.png) |
| TC-05 | Delete | `/buku/hapus/:id` | POST | Eksekusi tombol hapus buku | Baris record terhapus dari MySQL dan UI ter-refresh | Pass | [docs/screenshots/05-delete-feedback.png](docs/screenshots/05-delete-feedback.png) |
| TC-06 | Keamanan | `/uji-keamanan` | GET | Input `' OR '1'='1` via URL | Prepared statement memperlakukan input sebagai literal string (tanpa injeksi) | Pass | [docs/screenshots/06-sql-injection-mitigation.png](docs/screenshots/06-sql-injection-mitigation.png) |
