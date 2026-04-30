# RT Management System - Panduan Instalasi Lengkap

Sistem manajemen administrasi RT berbasis web dengan arsitektur decoupled (Laravel API & React Frontend). Panduan ini dirancang langkah-demi-langkah agar dapat diikuti dengan mudah, bahkan bagi orang awam.

---

## Prasyarat Sistem
Sebelum memulai, pastikan komputer Anda sudah terinstall aplikasi berikut:
1. **XAMPP** (Versi PHP 8.2 atau lebih baru)
2. **Composer** (Untuk dependensi Laravel)
3. **Node.js** (Versi 18 atau 20 - Versi LTS direkomendasikan)
4. **Git** (Opsional, untuk clone repository)

---

## Langkah 1: Persiapan Database
1. Jalankan **XAMPP Control Panel**.
2. Klik tombol **Start** pada **Apache** dan **MySQL**.
3. Buka browser dan pergi ke: `http://localhost/phpmyadmin`.
4. Buat database baru dengan nama: `rt_management`.

---

## Langkah 2: Setup Backend (API)
1. Buka Terminal atau Command Prompt (CMD).
2. Masuk ke folder API:
   ```bash
   cd rt-management-api
   ```
3. Install semua paket yang dibutuhkan:
   ```bash
   composer install
   ```
4. Copy file konfigurasi:
   ```bash
   cp .env.example .env
   ```
5. Buka file `.env` menggunakan Notepad atau VS Code. Pastikan bagian database sudah benar:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=rt_management
   DB_USERNAME=root
   DB_PASSWORD=
   ```
   *(Kosongkan DB_PASSWORD jika Anda menggunakan XAMPP standar)*.
6. Generate kunci aplikasi:
   ```bash
   php artisan key:generate
   ```
7. Jalankan Migrasi dan Seeding (Membuat tabel dan data awal):
   ```bash
   php artisan migrate:fresh --seed
   ```
8. Jalankan Server API:
   ```bash
   php artisan serve
   ```
   **PENTING:** Biarkan terminal ini tetap terbuka selama aplikasi digunakan. API akan berjalan di `http://127.0.0.1:8000`.

---

## Langkah 3: Setup Frontend (Web)
1. Buka Terminal baru (jangan tutup terminal backend).
2. Masuk ke folder Web:
   ```bash
   cd rt-management-web
   ```
3. Install paket yang dibutuhkan:
   ```bash
   npm install
   ```
4. Buat file `.env` di dalam folder ini (jika belum ada) dan isi dengan:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```
5. Jalankan aplikasi frontend:
   ```bash
   npm run dev
   ```
6. Aplikasi akan berjalan di `http://localhost:5173`. Klik link tersebut di terminal untuk membuka di browser.

---

## Informasi Login Default
Gunakan akun berikut untuk masuk ke sistem pertama kali:
- **Email:** `admin@rt.local`
- **Password:** `password`

---

## Troubleshooting (Masalah Umum)
- **Error: Connection Refused**: Pastikan MySQL di XAMPP sudah berjalan (tombol Start berwarna hijau).
- **Error: Table Not Found**: Pastikan Anda sudah menjalankan perintah `php artisan migrate:fresh --seed`.
- **Skeleton UI Tidak Muncul**: Pastikan terminal Frontend (`npm run dev`) dan Backend (`php artisan serve`) keduanya berjalan bersamaan.


