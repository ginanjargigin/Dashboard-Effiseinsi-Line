# Papan Efisiensi

Aplikasi input & dashboard efisiensi produksi. Data disimpan online lewat JSONBin.io,
jadi bisa diakses dari HP atau laptop mana saja setelah di-deploy jadi website.

## Cara deploy (paling gampang: Vercel + GitHub)

### 1. Siapkan akun
- Buat akun di https://github.com (kalau belum punya)
- Buat akun di https://vercel.com — bisa langsung daftar pakai akun GitHub kamu

### 2. Upload project ini ke GitHub
- Login ke GitHub → klik **New repository** → beri nama misalnya `papan-efisiensi` → Create
- Di halaman repo kosong itu, klik **uploading an existing file**
- Seret (drag & drop) SEMUA file & folder di dalam folder `papan-efisiensi` ini ke halaman upload GitHub
  (folder `src`, file `package.json`, `vite.config.js`, `index.html`, `.gitignore`, `README.md`)
- Klik **Commit changes**

### 3. Deploy ke Vercel
- Login ke https://vercel.com
- Klik **Add New... → Project**
- Pilih repo `papan-efisiensi` yang baru kamu upload → klik **Import**
- Framework Preset akan otomatis terdeteksi sebagai **Vite** — biarkan default
- Klik **Deploy**, tunggu 1-2 menit

### 4. Selesai
- Vercel akan memberi URL, contoh: `papan-efisiensi.vercel.app`
- Buka URL itu di Chrome HP kamu → tambahkan ke Layar Utama biar seperti aplikasi asli
- Setiap kali kamu upload perubahan baru ke GitHub, Vercel otomatis deploy ulang

## Alternatif tanpa GitHub (Netlify Drop)

Kalau kamu punya Node.js terpasang di laptop:
1. Buka folder ini di terminal
2. Jalankan `npm install`
3. Jalankan `npm run build` → akan muncul folder `dist`
4. Buka https://app.netlify.com/drop di browser
5. Seret folder `dist` ke halaman itu → langsung dapat URL live

## Catatan keamanan

Access Key JSONBin ada di dalam kode `src/App.jsx` (bagian `JSONBIN_ACCESS_KEY`).
Karena ini website statis, siapa pun yang membuka "View Page Source" secara teknis
bisa melihat key ini. Untuk penggunaan internal/kecil ini biasanya cukup aman,
tapi jangan pernah menaruh Master Key di sini — hanya Access Key yang izinnya
sudah dibatasi (Create/Read/Update, tanpa Delete, dan dibatasi ke satu bin saja).

Jika suatu saat butuh keamanan lebih (misal banyak orang pakai, data sensitif),
langkah berikutnya adalah menambah backend sederhana (misalnya Vercel Functions)
supaya key tidak pernah dikirim ke browser pengguna.
