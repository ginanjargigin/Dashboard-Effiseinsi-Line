# Papan Efisiensi Line

Aplikasi web untuk pencatatan dan monitoring efisiensi produksi line.

Aplikasi digunakan untuk mencatat data produksi harian, monitoring pencapaian, pencatatan NG (Not Good), serta menampilkan ringkasan dan dashboard efisiensi produksi.

## Teknologi

- React
- Vite
- Recharts
- Lucide React
- Supabase
- PostgreSQL
- Vercel

## Arsitektur Data

Saat ini aplikasi menggunakan Supabase sebagai database utama.

```text
React / Vite
     │
     ├── READ
     │    ↓
     │  Supabase
     │
     └── WRITE
          ↓
    Supabase RPC
          ↓
      PostgreSQL
