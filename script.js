/* KONFIGURASI INTEGRASI DATA */

// 1. Masukkan Link Google Form Anda di sini (untuk diubah jadi QR Code):
const GOOGLE_FORM_URL = "YOUR_LINK_GOOGLE_FORM_URL";

// 2. Masukkan Web App URL hasil Deploy Apps Script Anda di sini:
// (Didapat dari menu Deploy -> New deployment -> Web app -> Copy URL)
const APPS_SCRIPT_API_URL = "YOUR_APPS_SCRIPT_API_URL";

// 3. Koleksi Gambar Background Jam (Akan berganti setiap 15 detik)
const backgroundImages = [
  "https://images.unsplash.com/photo-1720884413532-59289875c3e1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1708893634094-f6604d94e43f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1721132447246-5d33f3008b05?auto=format&fit=crop&w=800&q=80"
];

/* JAM & TANGGAL REALTIME (WIB) */
function updateClock() {
  const now = new Date();
  
  // Format jam, menit, dan detik 2 digit
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // Update elemen jam di layar
  document.getElementById('timeHourMin').textContent = `${hours}:${minutes}`;
  document.getElementById('timeSec').textContent = seconds;

  // Format hari dan tanggal dalam Bahasa Indonesia
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('dateText').textContent = now.toLocaleDateString('id-ID', options);
}

// Jalankan update jam setiap 1 detik
setInterval(updateClock, 1000);
updateClock();

/* SLIDESHOW BACKGROUND JAM (TIAP 15 DETIK) */
let currentBgIndex = 0;
const clockBox = document.getElementById('clockBox');

function rotateBackground() {
  clockBox.style.backgroundImage = `url('${backgroundImages[currentBgIndex]}')`;
  currentBgIndex = (currentBgIndex + 1) % backgroundImages.length;
}

// Rotasi background setiap 15 detik (15.000 ms)
setInterval(rotateBackground, 15000);
rotateBackground();

/* GENERATE QR CODE GOOGLE FORM */
new QRCode(document.getElementById("qrcode"), {
  text: GOOGLE_FORM_URL,
  width: 140,
  height: 140,
  colorDark: "#063747",
  colorLight: "#ffffff",
  correctLevel: QRCode.CorrectLevel.H
});

/* DATA & SINKRONISASI JADWAL RAPAT */

// Data cadangan (mockup) jika Apps Script URL belum diisi
const fallbackMeetings = [
  {
    summary: "Rapat Dinas Luar Negeri",
    organizer: "Biro Hubungan Internasional ",
    location: "Lantai 5 Gedung B",
    start: "11:30",
    end: "12:30",
    isOngoing: true
  },
  {
    summary: "Rapat Kerja",
    organizer: "Biro Perencanaan",
    location: "Lantai 8 Gedung D ",
    start: "13:00",
    end: "14:30",
    isOngoing: false
  },
  {
    summary: "Rapat Evaluasi ",
    organizer: "Biro Sales",
    location: "Auditorium Utama Gedung A",
    start: "14:00",
    end: "16:00",
    isOngoing: false
  },
  {
    summary: "Rapat Koordinasi",
    organizer: "Biro Umum",
    location: "Lantai 2 Gedung E",
    start: "15:30",
    end: "17:00",
    isOngoing: false
  }
];

let scrollInterval = null;

// Simpan data rapat global agar bisa di-render ulang setiap menit saat jam berubah
let cachedMeetings = [];

function renderMeetings(meetings) {
  if (meetings) {
    cachedMeetings = meetings;
  }

  const tbody = document.getElementById('scheduleBody');
  tbody.innerHTML = '';

  if (!cachedMeetings || cachedMeetings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: #64748b; padding: 30px;">
          Tidak ada agenda rapat untuk hari ini.
        </td>
      </tr>
    `;
    if (scrollInterval) clearInterval(scrollInterval);
    return;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  cachedMeetings.forEach(item => {
    const row = document.createElement('tr');
    
    // Parsing jam mulai dan jam selesai ke total menit hari ini
    const [startH, startM] = item.start.split(':').map(Number);
    const [endH, endM]     = item.end.split(':').map(Number);

    const startTotalMinutes = startH * 60 + startM;
    const endTotalMinutes   = endH * 60 + endM;

    // Logika Status 3 Kondisi:
    let statusBadge = '';
    let textStyle = '';

    if (currentMinutes >= endTotalMinutes) {
      // Waktu sekarang sudah melewati jam selesai -> SELESAI
      statusBadge = `<span class="badge-status status-completed">Selesai</span>`;
      textStyle = 'opacity: 0.6;'; // Redupkan sedikit agar fokus ke rapat aktif
    } else if (currentMinutes >= startTotalMinutes && currentMinutes < endTotalMinutes) {
      // Waktu sekarang berada di antara jam mulai dan selesai -> BERLANGSUNG
      statusBadge = `<span class="badge-status status-ongoing">Berlangsung</span>`;
    } else {
      // Waktu sekarang belum masuk jam mulai -> AKAN DATANG
      statusBadge = `<span class="badge-status status-upcoming">Akan Datang</span>`;
    }

    row.style = textStyle;
    row.innerHTML = `
      <td><strong>${item.summary}</strong></td>
      <td>${item.organizer || '-'}</td>
      <td>${item.location || 'Ruang Rapat'}</td>
      <td style="color: #1f6e43; font-weight: 700;">${item.start} - ${item.end}</td>
      <td>${statusBadge}</td>
    `;
    tbody.appendChild(row);
  });

  // Jalankan animasi auto-scroll jika data melebihi layar
  startAutoScroll();
}

// Fungsi Animasi Scroll Otomatis yang Hanya Berjalan Jika Data Melebihi Layar
function startAutoScroll() {
  const container = document.getElementById('scrollContainer');
  const tbody = document.getElementById('scheduleBody');
  if (!container || !tbody) return;

  // Hentikan interval scroll sebelumnya jika ada
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }

  // Reset posisi scroll ke paling atas
  container.scrollTop = 0;

  // Cek apakah isi tabel melebihi batas tinggi area yang terlihat di TV
  const isOverflowing = container.scrollHeight > container.clientHeight;

  // Jika tabel TIDAK meluap (jadwalnya sedikit), jangan lakukan scroll
  if (!isOverflowing) {
    return;
  }

  // Jika jadwal rapat BANYAK dan meluap ke bawah, baru duplikasi untuk looping halus
  const originalRows = Array.from(tbody.children);
  originalRows.forEach(row => {
    tbody.appendChild(row.cloneNode(true));
  });

  // Jalankan scroll perlahan
  scrollInterval = setInterval(() => {
    container.scrollTop += 1;

    // Saat sudah scroll mencapai setengah (akhir data asli), kembalikan ke atas secara mulus
    if (container.scrollTop >= (container.scrollHeight / 2)) {
      container.scrollTop = 0;
    }
  }, 55);
}

// Fungsi Fetch data realtime dari Apps Script API
async function fetchGoogleCalendarEvents() {
  // Jika URL belum diganti dari placeholder, gunakan fallback
  if (APPS_SCRIPT_API_URL.includes("AKfycbx...")) {
    renderMeetings(fallbackMeetings);
    return;
  }

  try {
    const response = await fetch(APPS_SCRIPT_API_URL);
    const data = await response.json();
    
    if (Array.isArray(data)) {
      renderMeetings(data);
    } else {
      console.error("Format data dari API tidak sesuai:", data);
      renderMeetings(fallbackMeetings);
    }
  } catch (error) {
    console.error("Gagal mengambil data dari Apps Script, menggunakan cadangan:", error);
    renderMeetings(fallbackMeetings);
  }
}

// Inisialisasi awal dan auto-refresh setiap 60 detik
fetchGoogleCalendarEvents();
setInterval(fetchGoogleCalendarEvents, 60000);