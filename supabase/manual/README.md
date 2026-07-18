# Manual Supabase SQL Setup

Gunakan folder ini kalau menjalankan setup lewat Supabase Dashboard SQL Editor.

## Urutan Wajib

Jalankan satu per satu, tunggu sukses sebelum lanjut ke file berikutnya:

1. `01_extensions_and_enums.sql`
2. `02_tables_and_indexes.sql`
3. `03_functions_and_triggers.sql`
4. `04_policies_and_grants.sql`
5. `05_storage_buckets_and_policies.sql`
6. `06_realtime.sql`
7. `07_production_seed.sql`

## Opsional

8. `08_optional_demo_seed.sql`

File opsional hanya menambahkan contoh komentar dan pesan kontak untuk testing admin. Jangan jalankan kalau tidak ingin data dummy.

## Import Data Frontend Dalam Satu File

Kalau ingin Supabase langsung berisi data yang sama seperti tampilan frontend sekarang, jalankan file ini setelah file 1 sampai 6:

7. `09_initial_frontend_content.sql`

File ini sudah mencakup isi `07_production_seed.sql` plus contoh pesan kontak dari seed frontend. Jangan jalankan `07_production_seed.sql` lagi jika sudah memakai file ini.

## Catatan

- `combined_setup.sql` berisi gabungan file 1 sampai 7. Kalau SQL Editor terasa berat atau error, pakai urutan file kecil di atas.
- `production_seed.sql` sama dengan `07_production_seed.sql`, disediakan agar nama lama tetap bisa dipakai.
- `demo_seed.sql` sama dengan `08_optional_demo_seed.sql`.
- Setelah SQL berhasil, Edge Functions tetap perlu dideploy lewat Supabase CLI.
- Admin user tidak dibuat oleh SQL ini. Buat admin lewat script `scripts/create-supabase-admin.mjs` dengan service role key lokal.
