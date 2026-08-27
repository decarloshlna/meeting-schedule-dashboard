# 🏢 Sistem Otomasi Reservasi Ruang Rapat & TV Dashboard Display

Sistem informasi cerdas berbasis Google Workspace (Google Form, Google Sheets, Google Calendar, dan Google Apps Script) yang terintegrasi langsung dengan Frontend Web Dashboard untuk layar TV Display secara *real-time*.

---

## 📌 Fitur Utama Sistem
1. **Validasi Bentrok Otomatis (Anti-Collision):** Mendeteksi ketersediaan ruangan di Google Calendar secara otomatis saat formulir dikirim.
2. **Notifikasi Email Real-Time:** 
   - Notifikasi persetujuan resmi jika ruangan tersedia.
   - Notifikasi penolakan otomatis jika ruangan dan jam yang diminta bentrok.
3. **Multi-Sheet Synchronization:**
   - **Sheet Respon Form:** Menyimpan seluruh tanggapan masuk beserta kolom status terkunci.
   - **Sheet Ketersediaan Publik:** Menampilkan matriks ketersediaan per ruangan (07.00 - 17.00) dengan fitur pemilihan tanggal interaktif.
4. **REST API Endpoint (`doGet`):** Menyediakan output JSON agenda hari ini untuk dikonsumsi oleh layar TV Display.
5. **Dashboard TV Pintar:** Highlight otomatis agenda yang sedang berlangsung (*ongoing*), jam digital WIB, dan auto-refresh data.

---

## 🛠️ Arsitektur & Alur Data

```text
[User / Pemesan] 
       │ (Mengisi Formulir)
       ▼
[Google Form] ───────────────► [Spreadsheet Respon Form]
                                         │ (Trigger: onFormSubmit)
                                         ▼
                               [Google Apps Script]
                                  │           │
           ┌──────────────────────┴──────┐    └───────────────────────┐
           ▼                             ▼                            ▼
  [Pengecekan Kalender]        [Kirim Notifikasi Email]     [Update Sheet Ketersediaan]
  - Bentrok  -> DITOLAK         - Disetujui / Ditolak       - Tab 'Semua Agenda'
  - Tersedia -> DISETUJUI                                   - Tab Ruangan Dinamis
           │
           ▼
[Google Calendar API]
           │
           ▼ (doGet JSON Endpoint)
[Frontend TV Dashboard]
