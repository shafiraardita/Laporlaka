function escapeHTML(str) {
    if (str == null || typeof str !== 'string') return '';
    
    const htmlEntities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;'
    };
    
    return str.replace(/[&<>"']/g, match => htmlEntities[match]);
}
function showErrorBoundary(message) {
    const errorBoundary = document.createElement('div');
    errorBoundary.id = 'error-boundary';
    errorBoundary.className = 'error-boundary';
    errorBoundary.innerHTML = `<p>${message || 'Maaf, terjadi kesalahan pada sistem. Silakan coba lagi atau hubungi administrator.'}</p>`;
    document.body.appendChild(errorBoundary);
    errorBoundary.classList.add('active');
}

function validateStoredData(key, defaultData, validator) {
    try {
        const stored = localStorage.getItem(key);
        if (!stored) return defaultData;
        const parsed = JSON.parse(stored);
        return validator(parsed) ? parsed : defaultData;
    } catch (e) {
        console.error(`Error validating ${key}:`, e);
        return defaultData;
    }
}

const dependencies = [
    typeof Chart !== 'undefined' ? true : 'Chart.js',
    typeof XLSX !== 'undefined' ? true : 'SheetJS',
    typeof jspdf !== 'undefined' ? true : 'jsPDF',
    typeof L !== 'undefined' ? true : 'Leaflet'
].filter(dep => dep !== true);

if (dependencies.length > 0) {
    console.warn('Missing dependencies:', dependencies.join(', '));
}

// Logout //
function handleLogout() {
    // Cek dan hapus modal sebelumnya jika sudah ada
    const existingModal = document.getElementById('logout-confirm-modal');
    const existingOverlay = document.getElementById('logout-overlay');
    if (existingModal) existingModal.remove();
    if (existingOverlay) existingOverlay.remove();

    // Buat overlay
    const overlay = document.createElement('div');
    overlay.id = 'logout-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '999';

    // Buat modal konfirmasi logout
    const modal = document.createElement('div');
    modal.id = 'logout-confirm-modal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%) scale(1)';
    modal.style.background = '#ffffff';
    modal.style.padding = '32px 24px';
    modal.style.borderRadius = '16px';
    modal.style.zIndex = '1000';
    modal.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
    modal.style.textAlign = 'center';
    modal.style.maxWidth = '350px';
    modal.style.width = '90%';
    modal.style.transition = 'transform 0.3s ease, opacity 0.3s ease';

    modal.innerHTML = `
        <h3 style="
            margin-bottom: 12px;
            font-size: 22px;
            font-weight: bold;
            color: #000;
        ">Konfirmasi Keluar</h3>
        <p style="
            margin-bottom: 24px;
            font-size: 15px;
            color: #555;
        ">Apakah Anda yakin ingin keluar dari akun?</p>
        <div style="
            display: flex;
            justify-content: center;
            gap: 16px;
            flex-wrap: wrap;
        ">
            <button id="logout-cancel-btn" style="
                padding: 10px 24px;
                border-radius: 8px;
                background-color: #28a745;
                color: white;
                font-weight: 500;
                border: none;
                cursor: pointer;
                transition: background-color 0.2s;
            " onmouseover="this.style.backgroundColor='#28a745'" onmouseout="this.style.backgroundColor='#28a745'">Batal</button>

            <button id="logout-yes-btn" style="
                padding: 10px 24px;
                border-radius: 8px;
                background-color: #e74c3c;
                color: white;
                font-weight: 500;
                border: none;
                cursor: pointer;
                transition: background-color 0.2s;
            " onmouseover="this.style.backgroundColor='#c0392b'" onmouseout="this.style.backgroundColor='#e74c3c'">Keluar</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Event listener tombol
    document.getElementById('logout-cancel-btn').addEventListener('click', () => {
        modal.remove();
        overlay.remove();
    });

    document.getElementById('logout-yes-btn').addEventListener('click', () => {
        modal.remove();
        overlay.remove();
        setTimeout(() => {
            window.location.href = 'login.html'; // Ganti jika login file kamu berbeda
        }, 300);
    });
}

function initializeAdminPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user') || 'admin';
    const usernameElement = document.getElementById('username');
    const sidebarTitle = document.querySelector('.sidebar-title');
    
    if (usernameElement && sidebarTitle) {
        usernameElement.textContent = escapeHTML(username);
        sidebarTitle.textContent = escapeHTML(username);
    } else {
        console.warn('Username or sidebar title element not found');
    }

    const sections = document.querySelectorAll('.content-section');
    const navItems = document.querySelectorAll('.nav-item');

    const homeSection = document.getElementById('home-section');
    const homeNavItem = document.querySelector('[data-section="home-section"]');
    document.getElementById('home-section')?.classList.add('active');
    document.querySelector('[data-section="home-section"]')?.classList.add('active');
    if (homeSection && homeNavItem) {
    // Nonaktifkan semua terlebih dahulu
    sections.forEach(section => section.classList.remove('active'));
    navItems.forEach(item => item.classList.remove('active'));

    // Aktifkan home sebagai default
    homeSection.classList.add('active');
    homeNavItem.classList.add('active');

    // Langsung render isi beranda
    renderStats();
    renderNotifications();
    renderEvaluasiCards();
    } else {
        console.warn('Home section or navigation item not found');
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                const sectionId = item.getAttribute('data-section');
                const section = document.getElementById(sectionId);
                if (section) {
                    sections.forEach(sec => sec.classList.remove('active'));
                    section.classList.add('active');
                    if (sectionId === 'monitoring-section') {
                        updateChart();
                    } else if (sectionId === 'laporan-masuk-section') {
                        fetchLaporanMasuk();
                    } else if (sectionId === 'home-section') {
                        renderStats();
                        renderNotifications();
                        renderEvaluasiCards();
                    } else if (sectionId === 'manage-pengguna-section') {
                        loadUsers();
                    } else if (sectionId === "manage-petugas-section") {
                    renderPetugas();
                        setupAddUserModal(); // ← Tambahkan ini agar modal bisa berfungsi
                    } else if (sectionId === 'tracking-section') {
                        renderTracking();
                    } else if (sectionId === 'titik-laporan-section') {
                    initMap();
                    toggleMapByYear(); // tampilkan peta sesuai tahun
                    }
                    else if (sectionId === "manage-petugas-section") {
                    renderPetugas(); // tampilkan daftar petugas 
                    }


                } else {
                    throw new Error(`Section ${sectionId} not found`);
                }
            } catch (err) {
                console.error('Navigation error:', err);
                showErrorBoundary('Gagal memuat section: ' + err.message);
            }
        });
    });

    const profileIconHeader = document.getElementById('profile-icon-header');
    if (profileIconHeader) {
        profileIconHeader.addEventListener('click', () => {
            try {
                navItems.forEach(nav => nav.classList.remove('active'));
                sections.forEach(sec => sec.classList.remove('active'));
                const profileSection = document.getElementById('profil-section');
                if (profileSection) {
                    profileSection.classList.add('active');
                    loadProfileData();
                } else {
                    throw new Error('Profile section not found');
                }
            } catch (err) {
                console.error('Profile navigation error:', err);
                showErrorBoundary('Gagal memuat profil: ' + err.message);
            }
        });
    }

    const saveProfileBtn = document.getElementById('save-profile-btn');
    const cancelProfileBtn = document.getElementById('cancel-profile-btn');
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfile);
    if (cancelProfileBtn) cancelProfileBtn.addEventListener('click', cancelProfile);


    const yearSelect = document.getElementById('year-select');
    const monthSelect = document.getElementById('month-select');
    const downloadChartBtn = document.getElementById('download-chart-btn');
    const downloadExcelBtn = document.getElementById('download-excel-btn');
    if (yearSelect) yearSelect.addEventListener('change', updateChart);
    if (monthSelect) monthSelect.addEventListener('change', updateChart);

}
// === Klik profil di sidebar membuka halaman profil admin ===
const sidebarProfileBtn = document.getElementById("sidebar-profile-btn");
if (sidebarProfileBtn) {
  sidebarProfileBtn.addEventListener("click", () => {
    document.querySelectorAll(".content-section").forEach(sec => sec.style.display = "none");
    const profilSection = document.getElementById("profil-section");
    if (profilSection) profilSection.style.display = "block";
    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
    loadProfileData(); // Pastikan data tampil saat halaman profil dibuka
  });
}

// === Data Awal Profil ===
let originalProfileData = {
  nama: "admin",
  email: "admin@example.com",
  nik: "0000000000000000",
  jabatan: "Administrator",
  telepon: "081234567890",
  photo: null
};

// === Fungsi Validasi Data ===
function validateProfileData(data) {
  return data &&
    typeof data.nama === "string" &&
    typeof data.email === "string" &&
    typeof data.nik === "string" &&
    typeof data.jabatan === "string" &&
    typeof data.telepon === "string" &&
    (data.photo === null || typeof data.photo === "string");
}

// === Fungsi Memuat Data Profil dari localStorage ===
function loadProfileData() {
  try {
    const stored = localStorage.getItem("profileData");
    let data = stored ? JSON.parse(stored) : originalProfileData;

    if (!validateProfileData(data)) data = originalProfileData;

    // Tampilkan ke form input
    document.getElementById("profil-username").value = data.nama || "";
    document.getElementById("profil-email").value = data.email || "";
    document.getElementById("profil-nik").value = data.nik || "";
    document.getElementById("profil-jabatan").value = data.jabatan || "";
    document.getElementById("profil-telepon").value = data.telepon || "";

    // Perbarui tampilan nama di header/sidebar
    const usernameDisplay = document.getElementById("username");
    const sidebarTitle = document.querySelector(".sidebar-title");
    if (usernameDisplay) usernameDisplay.textContent = data.nama;
    if (sidebarTitle) sidebarTitle.textContent = data.nama;
  } catch (e) {
    console.error("Gagal memuat data profil:", e);
  }
}

// === Navigasi antar section dari sidebar ===
document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", function (e) {
    e.preventDefault();

    // Ambil target section
    const targetId = this.getAttribute("data-section");

    // Sembunyikan semua section
    document.querySelectorAll(".content-section").forEach(sec => sec.style.display = "none");

    // Tampilkan section yang sesuai
    const targetSection = document.getElementById(targetId);
    if (targetSection) targetSection.style.display = "block";

    // Update status aktif
    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
    this.classList.add("active");
  });
});

// === Fungsi Menyimpan Data Profil ===
function saveProfile() {
  try {
    const nama = document.getElementById("profil-username")?.value.trim();
    const email = document.getElementById("profil-email")?.value.trim();
    const nik = document.getElementById("profil-nik")?.value.trim();
    const jabatan = document.getElementById("profil-jabatan")?.value.trim();
    const telepon = document.getElementById("profil-telepon")?.value.trim();

    // Validasi
    if (!nama || !email || !nik || !jabatan || !telepon) {
      alert("Semua field profil harus diisi!");
      return;
    }

    const emailPattern = /^\S+@\S+\.\S+$/;
    if (!emailPattern.test(email)) {
      alert("Email tidak valid!");
      return;
    }

    if (!/^\d{16}$/.test(nik)) {
      alert("NIK harus 16 digit!");
      return;
    }

    if (!/^\d{10,13}$/.test(telepon)) {
      alert("Nomor telepon harus 10–13 digit angka!");
      return;
    }

    // Simpan ke localStorage
    const updatedData = { nama, email, nik, jabatan, telepon };
    localStorage.setItem("profileData", JSON.stringify(updatedData));
    originalProfileData = updatedData;

    alert("✅ Profil berhasil disimpan!");
    loadProfileData(); // Refresh data terbaru

  } catch (e) {
    console.error("Error saat menyimpan profil:", e);
    alert("❌ Terjadi kesalahan saat menyimpan profil!");
  }
}

// === Jalankan load saat halaman pertama kali dibuka ===
document.addEventListener("DOMContentLoaded", loadProfileData);

function cancelProfile() {
    const modal = document.getElementById('profile-section'); // Sesuaikan ID-nya
    if (modal) {
        modal.style.display = 'none';
    } else {
        console.warn('Elemen modal profile tidak ditemukan.');
    }
}
// monitoring data
const canvas = document.getElementById("accident-chart");
const ctx = canvas.getContext("2d");
let monitoringChart = null;

// Utility: nama bulan
const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Ambil data per tahun dari API
async function fetchMonitoringData(tahun) {
  const apiURL = `https://dragonmontainapi.com/lapor_laka/total_kecelakaan_pertahun.php?tahun=${tahun}`;
  try {
    const res = await fetch(apiURL);
    const json = await res.json();
    if (json && json.kode === 200 && Array.isArray(json.data)) {
      return json.data; // array of { bulan, total_laporan, total_korban }
    } else {
      console.warn("Format data API tidak sesuai:", json);
      return [];
    }
  } catch (err) {
    console.error("Gagal fetch data:", err);
    return [];
  }
}

// RENDER BAR CHART (semua bulan)
function renderBarChart(dataArr, tahun) {
  const labels = monthNames.map(m => m.slice(0,3)); // Jan, Feb, ...
  const totalLaporan = Array(12).fill(0);
  const totalKorban = Array(12).fill(0);

  dataArr.forEach(it => {
    const idx = (Number(it.bulan) || 1) - 1;
    totalLaporan[idx] = it.total_laporan ?? 0;
    totalKorban[idx] = it.total_korban ?? 0;
  });

  if (monitoringChart) monitoringChart.destroy();
  // Pastikan canvas menyesuaikan ukuran container
  ctx.canvas.parentNode.style.width = "100%";    // container bisa di CSS juga
  ctx.canvas.parentNode.style.height = "400px";  // misal tinggi default
  ctx.canvas.width = ctx.canvas.parentNode.offsetWidth;
  ctx.canvas.height = ctx.canvas.parentNode.offsetHeight;

  monitoringChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Total Laporan", data: totalLaporan, backgroundColor: "rgba(54,162,235,0.7)" },
        { label: "Total Korban", data: totalKorban, backgroundColor: "rgba(246, 53, 95, 0.7)" }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // ini penting agar chart bisa mengikuti ukuran canvas
      plugins: {
        title: { display: true, text: `Data Kecelakaan Tahun ${tahun}` },
        legend: { position: "top" }
      },
      scales: { y: { beginAtZero: true, title: { display: true, text: "Jumlah" } } }
    }
  });
}

// RENDER PIE CHART
function renderPieChart(monthData, monthLabel, tahun) {
  if (monitoringChart) monitoringChart.destroy();

  // Atur ukuran canvas sama seperti bar chart
  ctx.canvas.parentNode.style.width = "100%";
  ctx.canvas.parentNode.style.height = "400px";
  ctx.canvas.width = ctx.canvas.parentNode.offsetWidth;
  ctx.canvas.height = ctx.canvas.parentNode.offsetHeight;

  const labels = ["Total Laporan", "Total Korban"];
  const data = [monthData.total_laporan ?? 0, monthData.total_korban ?? 0];

  monitoringChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{ data, backgroundColor: ["rgba(54,162,235,0.7)","rgba(246, 53, 95, 0.7)"] }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: `Distribusi ${monthLabel} ${tahun}` },
        legend: { position: "top" }
      }
    }
  });
}

// Akan membaca year-select & month-select, fetch data dan render sesuai pilihan.
async function updateChart() {
  const year = document.getElementById("year-select").value;
  const monthValue = document.getElementById("month-select").value; // 'all' atau '01'..'12'

  // ambil data tahun dari API
  const dataArr = await fetchMonitoringData(year);

  if (!dataArr.length) {
    // kosong -> render chart kosong / beri peringatan
    if (monitoringChart) monitoringChart.destroy();
    const emptyData = Array(12).fill(0);
    monitoringChart = new Chart(ctx, {
      type: "bar",
      data: { labels: monthNames.map(m => m.slice(0,3)), datasets: [{ label: "No Data", data: emptyData }] },
      options: { responsive: true, plugins: { title: { display: true, text: `Tidak ada data untuk ${year}` } } }
    });
    return;
  }

  if (monthValue === "all") {
    // bar chart tahunan
    renderBarChart(dataArr, year);
  } else {
    // cari data bulan yang dipilih
    const monthIndex = parseInt(monthValue, 10); // 1..12 as number if '01' -> 1
    // dataArr mungkin berisi objects dengan 'bulan' numeric
    const found = dataArr.find(d => Number(d.bulan) === monthIndex);
    const monthLabel = monthNames[monthIndex - 1] || monthValue;
    const monthData = found ?? { bulan: monthIndex, total_laporan: 0, total_korban: 0 };
    renderPieChart(monthData, monthLabel, year);
  }
}

// Unduh gambar (sama di semua mode)
document.getElementById("download-chart-btn").addEventListener("click", () => {
  if (!monitoringChart) return alert("Grafik belum dimuat.");
  const a = document.createElement("a");
  a.href = monitoringChart.toBase64Image();
  a.download = `grafik_kecelakaan_${document.getElementById("year-select").value}.png`;
  a.click();
});

// Unduh Excel: jika mode all -> export tabel bulan x (laporan/korban).
document.getElementById("download-excel-btn").addEventListener("click", async () => {
  if (!monitoringChart) return alert("Grafik belum dimuat.");

  const year = document.getElementById("year-select").value;
  const monthValue = document.getElementById("month-select").value;

  if (monthValue === "all") {
    // buat worksheet dari data chart (bulan)
    const headers = ["Bulan", "Total Laporan", "Total Korban"];
    const rows = monitoringChart.data.labels.map((lbl, i) => ({
      Bulan: lbl,
      Total_Laporan: monitoringChart.data.datasets[0].data[i] ?? 0,
      Total_Korban: monitoringChart.data.datasets[1].data[i] ?? 0
    }));
    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Tahun_${year}`);
    XLSX.writeFile(wb, `Monitoring_Kecelakaan_${year}.xlsx`);
  } else {
    
    const monthIndex = parseInt(monthValue, 10);
    const monthLabel = monthNames[monthIndex - 1] || monthValue;

    // pie chart
    let laporan = 0, korban = 0;
    if (monitoringChart.config.type === "pie" && Array.isArray(monitoringChart.data.datasets[0].data)) {
      const d = monitoringChart.data.datasets[0].data;
      // our pie uses labels ["Total Laporan","Total Korban"] => index 0,1
      laporan = Number(d[0] ?? 0);
      korban = Number(d[1] ?? 0);
    } else {
      // fallback: fetch API and find the month
      const arr = await fetchMonitoringData(year);
      const found = arr.find(x => Number(x.bulan) === monthIndex);
      laporan = found?.total_laporan ?? 0;
      korban = found?.total_korban ?? 0;
    }

    const rows = [{ Bulan: monthLabel, Tahun: year, Total_Laporan: laporan, Total_Korban: korban }];
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${monthLabel}_${year}`);
    XLSX.writeFile(wb, `Monitoring_${monthLabel}_${year}.xlsx`);
  }
});

// Auto-refresh: per menit, memanggil updateChart
const AUTO_REFRESH_MS = 60000;
setInterval(() => {
  // simpan pilihan user
  const prevYear = document.getElementById("year-select").value;
  const prevMonth = document.getElementById("month-select").value;
  // update chart sesuai pilihan saat ini
  updateChart();
  // (tidak merubah select elements)
}, AUTO_REFRESH_MS);

// Hook on change year/month selects (jika HTML memanggil onChange inline atau tidak, kita juga daftarkan listener)
document.getElementById("year-select").addEventListener("change", updateChart);
document.getElementById("month-select").addEventListener("change", updateChart);

// Jalankan pertama kali: gunakan nilai default pada select
updateChart();

let idCounter = 0;

function generateReportId() {
    const timestamp = Date.now();
    idCounter = (idCounter + 1) % 1000;
    const uniqueId = parseInt(`${timestamp}${idCounter.toString().padStart(1, '0')}`.slice(-5));
    return uniqueId;
}

const baseTimestamp = 1741959840000;
idCounter = 0;
let reports = [];

function validateReportsData(data) {
    return Array.isArray(data) && data.every(report =>
        typeof report.id === 'number' &&
        typeof report.nama === 'string' &&
        typeof report.nik === 'string' &&
        typeof report.email === 'string' &&
        typeof report.telepon === 'string' &&
        typeof report.tanggal === 'string' &&
        typeof report.status === 'string' &&
        typeof report.titik === 'string' &&
        typeof report.bukti === 'string' &&
        typeof report.saksi === 'string' &&
        typeof report.petugas === 'string' &&
        typeof report.received === 'boolean' &&
        typeof report.kendaraan === 'string' &&
        typeof report.jenis === 'string' &&
        typeof report.jumlahKorban === 'string' &&
        typeof report.kronologi === 'string'
    );
}

function addReport(reportData) {
    try {
        const newReport = {
            id: generateReportId(),
            nama: reportData.nama || "",
            nik: reportData.nik || "",
            email: reportData.email || "",
            telepon: reportData.telepon || "",
            tanggal: reportData.tanggal || new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: reportData.status || "Masuk",
            titik: reportData.titik || "",
            bukti: reportData.bukti || "",
            saksi: reportData.saksi || "",
            petugas: reportData.petugas || "",
            received: reportData.received || false,
            kendaraan: reportData.kendaraan || "",
            jenis: reportData.jenis || "",
            jumlahKorban: reportData.jumlahKorban || "",
            kronologi: reportData.kronologi || ""
        };

        if (!validateReportsData([newReport])) {
            throw new Error('Invalid report data');
        }

        reports.push(newReport);
        localStorage.setItem('reports', JSON.stringify(reports));
        return newReport.id;
    } catch (e) {
        console.error('Error adding report:', e);
        throw new Error('Gagal menambahkan laporan: ' + e.message);
    }
}

// --- Pagination Global ---
let currentPage = 1;
const reportsPerPage = 15;
let currentTrackingCategory = 'all';
let filteredTrackingReports = [];
let selectedYear = 'all';
let selectedMonth = 'all';

// --- Pagination Controls ---
function goToPage(page, isTracking = false) {
    currentPage = page;
    if (isTracking) {
        renderTrackingTable(filteredTrackingReports);
    } else {
        renderReportList();
    }
}

function previousPage(isTracking = false) {
    if (currentPage > 1) {
        currentPage--;
        if (isTracking) {
            renderTrackingTable(filteredTrackingReports);
        } else {
            renderReportList();
        }
    }
}

function nextPage(total, isTracking = false) {
    const totalPages = Math.ceil(total / reportsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        if (isTracking) {
            renderTrackingTable(filteredTrackingReports);
        } else {
            renderReportList();
        }
    }
}

function setFilter(year, month) {
    selectedYear = year;
    selectedMonth = month;
    currentPage = 1;
    renderReportList();
    renderTrackingTable(filteredReports);
}

function matchesDate(reportDate, year, month) {
    if (year === 'all') return true;
    const date = new Date(reportDate);
    const reportYear = date.getFullYear().toString();
    const reportMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    if (year !== reportYear) return false;
    if (month !== 'all' && month !== reportMonth) return false;
    return true;
}
async function syncReportsFromAPI() {
    try {
        const response = await fetch('https://dragonmontainapi.com/riwayat_laporan.php?user=1');
        if (!response.ok) throw new Error('Gagal fetch data dari API');
        const data = await response.json();
        reports = data;
        filterCategory(currentTrackingCategory); // Refresh tampilan tracking laporan
    } catch (error) {
        console.error('Error sync data:', error);
        alert('Gagal sync data laporan dari server.');
    }
}
// Endpoint Laporan Masuk
async function fetchLaporanMasuk() {
  try {
    const response = await fetch("https://dragonmontainapi.com/riwayat_laporan.php?user=1");
    if (!response.ok) throw new Error("Gagal mengambil data");

    const data = await response.json();
    const statusMap = {
      "0": "Masuk",
      "1": "Diterima",
      "2": "Penanganan",
      "3": "Selesai",
      "4": "Ditolak"
    };

    const mappedReports = data.map(item => ({
      id: item.id,
      nama: item.nama_user || '',
      nik: item.nik || '',
      email: item.email || '',
      no_hp: item.no_hp || '',
      tanggal: item.tanggal || '',
      status: statusMap[item.status] || "Masuk",
      titik: item.alamat || '',
      bukti: item.foto?.[0] || '',
      saksi: item.saksi_1 || '',
      petugas: item.petugas || '',
      received: item.status === "3",
      kendaraan: item.kendaraan || '',
      jenis: item.jenis_kecelakaan || '',
      jumlahKorban: item.jumlah_korban || '',
      kronologi: item.kronologi || '',
      bukti_selesai: item.bukti_selesai || '',
      keterangan_selesai: item.keterangan_selesai || ''
    }));

    // Simpan ke array global
    reports = mappedReports;

    // Tampilkan di tabel laporan masuk
    renderReportList();
    renderStats();
    renderTracking(getCurrentCategory());
    renderNotifications();
  } catch (error) {
    console.error("Error:", error);
    showPopup("Gagal memuat laporan dari server.");
  }
}

// Fungsi untuk menampilkan laporan masuk di tabel
function renderLaporanMasuk(data) {
  const tableBody = document.getElementById("report-table-body");
  tableBody.innerHTML = "";

  data.forEach(report => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${report.id}</td>
      <td>${report.nama}</td>
      <td>${report.tanggal}</td>
      <td>${report.jenis_kecelakaan}</td>
      <td>${report.titik_kejadian}</td>
      <td>${report.saksi}</td>
      <td>${report.kronologi}</td>
      <td>${report.status}</td>
      <td><button onclick="bukaDetailLaporan('${report.id}')">Detail</button></td>
      <td><a href="${report.bukti}" target="_blank">Unduh</a></td>
    `;
    tableBody.appendChild(row);
  });
}
// Pelacakan Laporan Tabel
function renderTrackingLaporan(data) {
  const tableBody = document.getElementById("tracking-table-body");
  tableBody.innerHTML = "";

  data.forEach(report => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${report.id}</td>
      <td>${report.nama}</td>
      <td>${report.tanggal}</td>
      <td>${report.jenis_kecelakaan}</td>
      <td>${report.kendaraan}</td>
      <td>${report.jumlah_korban}</td>
      <td>${report.titik_kejadian}</td>
      <td>${report.kronologi}</td>
      <td><button onclick="bukaDetailTracking('${report.id}')">Detail</button></td>
      <td>${report.status}</td>
    `;
    tableBody.appendChild(row);
  });
}

// Detail Laporan 
async function bukaDetailLaporan(id) {
  try {
    const res = await fetch("https://dragonmontainapi.com/riwayat_laporan.php?user=1");
    const data = await res.json();
    console.log("Data API:", data);

    const report = data.find(r => r.id === id.toString());
    if (!report) return alert("Laporan tidak ditemukan!");

    console.log("📋 Laporan ditemukan:", report);

    // --- Isi Data Pelapor
    document.getElementById("report-nama").value = report.nama_user || "";
    document.getElementById("report-nik").value = report.nik || "";
    // document.getElementById("report-email").value = report.email || "";
    // --- Buat input nomor telepon tetap tampil dan bisa diklik
    const teleponInput = document.getElementById("report-telepon");
    if (teleponInput) {
    const nomor = (report.no_hp || "").replace(/\D/g, ""); // hanya angka
    teleponInput.value = report.no_hp || "";
    teleponInput.readOnly = true; // agar tidak bisa diubah sembarangan

    // Ubah kursor dan beri warna/link hint
    teleponInput.style.cursor = "pointer";
    teleponInput.style.color = "#25D366"; // warna khas WhatsApp
    teleponInput.style.fontWeight = "600";
    teleponInput.title = "Klik untuk chat via WhatsApp";

    // Tambahkan event klik untuk buka chat
    teleponInput.onclick = () => {
        if (nomor) {
        const waLink = `https://wa.me/${nomor}`;
        window.open(waLink, "_blank");
        } else {
        alert("Nomor WhatsApp tidak tersedia.");
        }
    };
    }
    document.getElementById("report-saksi").value = report.saksi_1 || "";

    // --- Isi Data Laporan
    document.getElementById("report-titik").value = report.alamat || "";
    document.getElementById("report-kendaraan").value = report.kendaraan || "";
    document.getElementById("report-jenis").value = report.jenis_kecelakaan || "";
    document.getElementById("report-jumlah-korban").value = report.jumlah_korban || "";
    document.getElementById("report-tanggal").value = report.tanggal || "";
    document.getElementById("report-status").value = report.status || "";
    document.getElementById("report-bukti").src = Array.isArray(report.foto) ? report.foto[0] : report.foto;
    document.getElementById("report-kronologi").value = report.kronologi || "";

    // --- Data Petugas & Bukti Selesai
    const petugasInput = document.getElementById("report-petugas");
    const fotoPetugasInput = document.getElementById("report-foto-petugas");
    const buktiPetugasImg = document.getElementById("report-bukti-petugas");
    const keteranganInput = document.getElementById("report-keterangan");

    petugasInput.value = report.petugas || "";
    keteranganInput.value = report.keterangan_selesai || "";

    // ✅ Perbaikan utama di sini
    if (report.bukti_selesai && report.bukti_selesai !== "null" && report.bukti_selesai !== "") {
      console.log("📸 Menampilkan bukti:", report.bukti_selesai);
      buktiPetugasImg.src = report.bukti_selesai;
      buktiPetugasImg.style.display = "block";
    } else {
      console.warn("❌ Tidak ada bukti selesai ditemukan.");
      buktiPetugasImg.src = "";
      buktiPetugasImg.style.display = "none";
    }

    // --- Status yang bisa diedit
    const editable = report.status === "2"; // hanya saat penanganan
    petugasInput.disabled = !editable;
    fotoPetugasInput.disabled = !editable;
    keteranganInput.readOnly = !editable;

    // --- Tampilkan modal
    document.getElementById("report-modal").style.display = "block";
    
  } catch (error) {
    console.error("❌ Gagal memuat detail laporan:", error);
    alert("Terjadi kesalahan saat memuat data laporan.");
  }
}

function unduhLaporan(id) {
  alert(`Unduh laporan dengan ID: ${id}`);
}

document.addEventListener("DOMContentLoaded", () => {
  // Jalankan interval setelah halaman siap
  setInterval(() => {
    const section = document.querySelector('.content-section:not([style*="display: none"])');
    if (section && section.id === 'laporan-masuk-section') {
      fetchLaporanMasuk();
    }
  }, 30000);
});

function renderLaporan() {
  const masukContainer = document.getElementById('laporan-masuk');
  const trackingContainer = document.getElementById('pelacakan-laporan');

  masukContainer.innerHTML = '';
  trackingContainer.innerHTML = '';

  reports.forEach(report => {
    const status = (report.status || '').toLowerCase();
    const html = generateReportCardHTML(report); // fungsi buat tampilan

    if (status === 'masuk') {
      masukContainer.innerHTML += html;
    } else {
      trackingContainer.innerHTML += html;
    }
  });
}
function downloadLaporanMasukExcel() {
    const yearFilter = document.getElementById("year-filter").value;
    const monthFilter = document.getElementById("month-filter").value;
    const keyword = document.getElementById("report-search").value.toLowerCase();

    // Gunakan filteredReports kalau sudah ada, kalau belum pakai reports
    const sourceReports = filteredReports && filteredReports.length > 0 ? filteredReports : reports;

    // Filter lagi untuk pastikan hanya laporan masuk
    const dataToExport = sourceReports.filter(r => {
        const date = new Date(r.tanggal);
        const reportYear = date.getFullYear().toString();
        const reportMonth = date.toLocaleString('id-ID', { month: 'long' });

        const matchYear = (yearFilter === 'all') || (reportYear === yearFilter);
        const matchMonth = (monthFilter === 'all') || (reportMonth === monthFilter);
        const matchKeyword = !keyword || r.id.toString().includes(keyword) || r.nama.toLowerCase().includes(keyword);

        return matchYear && matchMonth && matchKeyword && r.status === 'Masuk';
    });

    if (dataToExport.length === 0) {
        alert("Tidak ada data laporan masuk sesuai filter.");
        return;
    }

    // Konversi ke format untuk Excel
    const exportData = dataToExport.map(r => ({
        ID: r.id,
        Nama: r.nama,
        Tanggal: r.tanggal,
        Jenis: r.jenis,
        'Titik Kecelakaan': r.titik,
        Saksi: r.saksi,
        Kronologi: r.kronologi,
        Status: r.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Masuk");

    XLSX.writeFile(wb, `laporan_masuk_${yearFilter}_${monthFilter}.xlsx`);
}

// Pastikan tombol terhubung
document.addEventListener("DOMContentLoaded", () => {
    const btnDownload = document.getElementById("download-filter-btn");
    if (btnDownload) {
        btnDownload.addEventListener("click", downloadLaporanMasukExcel);
    }
});

// --- Laporan Masuk ---
function renderReportList() {
    try {
        const tableBody = document.querySelector('#report-table-body');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        if (!tableBody || !prevBtn || !nextBtn) {
            console.warn('Table body or pagination buttons not found');
            return;
        }

        let currentPage = parseInt(localStorage.getItem('currentReportPage')) || 1;

        // Ambil filter dari dropdown
        const selectedYear = document.getElementById('year-filter')?.value || 'all';
        const selectedMonth = document.getElementById('month-filter')?.value || 'all';
        const searchKeyword = document.getElementById('report-search')?.value.trim().toLowerCase();

        // Filter data laporan masuk
        let dataToRender = reports.filter(report =>
            report.status === 'Masuk' || report.status === '' || !report.status
        ).filter(report => {
            if (!report.tanggal) return false;

            const date = new Date(report.tanggal);
            const year = date.getFullYear().toString();
            const monthNumber = (date.getMonth() + 1).toString().padStart(2, '0'); // "01" - "12"
            const monthName = date.toLocaleString('id-ID', { month: 'long' }).toLowerCase();

            const matchYear = (selectedYear === 'all') || (year === selectedYear);
            const matchMonth =
                (selectedMonth === 'all') ||
                (selectedMonth.length === 2 && monthNumber === selectedMonth) || // cocok angka
                (selectedMonth.length > 2 && monthName === selectedMonth.toLowerCase()); // cocok nama

            return matchYear && matchMonth;
        });

        // Filter pencarian berdasarkan ID atau Nama
        if (searchKeyword) {
            dataToRender = dataToRender.filter(report =>
                report.id?.toString().toLowerCase().includes(searchKeyword) ||
                report.nama?.toLowerCase().includes(searchKeyword)
            );
        }

        const totalReports = dataToRender.length;
        const totalPages = Math.ceil(totalReports / reportsPerPage);

        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * reportsPerPage;
        const paginatedReports = dataToRender.slice(startIndex, startIndex + reportsPerPage);

        // Render ulang tabel
        tableBody.innerHTML = '';
        paginatedReports.forEach(report => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHTML(report.id?.toString() || '')}</td>
                <td>${escapeHTML(report.nama?.length > 30 ? report.nama.substring(0, 30) + '...' : report.nama || '-')}</td>
                <td>${escapeHTML(report.tanggal || '-')}</td>
                <td>${escapeHTML(report.jenis || '-')}</td>
                <td>${escapeHTML(report.titik?.length > 40 ? report.titik.substring(0, 40) + '...' : report.titik || '-')}</td>
                <td>${escapeHTML(report.saksi?.length > 25 ? report.saksi.substring(0, 25) + '...' : report.saksi || '-')}</td>
                <td>${escapeHTML(report.kronologi?.length > 80 ? report.kronologi.substring(0, 80) + '...' : report.kronologi || '-')}</td>
                <td><span class="report-status ${report.status?.toLowerCase()}">${escapeHTML(report.status || 'Masuk')}</span></td>
                <td>
                    <button onclick="openReportModal('${report.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="#375B85" viewBox="0 0 16 16">
                            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                        </svg>
                    </button>
                </td>
                <td>
                    <button onclick="downloadReportPDF(${report.id})" class="download-pdf-btn" title="Unduh PDF">
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="#375B85" viewBox="0 0 17 17">
                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                        </svg>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Pagination controls
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;

        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                localStorage.setItem('currentReportPage', currentPage);
                renderReportList();
            }
        };

        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                localStorage.setItem('currentReportPage', currentPage);
                renderReportList();
            }
        };

    } catch (e) {
        console.error('Error rendering report list:', e);
        showErrorBoundary('Gagal memuat daftar laporan: ' + e.message);
    }
}
// Inisialisasi saat halaman dimuat laporan masuk
document.addEventListener('DOMContentLoaded', () => {
    // Ambil data dari API eksternal
    fetchLaporanMasuk();
});
// filter laporan masuk
function applyReportFilters() {
    currentPage = 1; // Kembali ke halaman pertama saat filter berubah
    renderReportList();
}
function viewReportDetail(id) {
    console.log("View detail for report ID:", id);
    // Tambahkan logika untuk menampilkan detail laporan (misalnya, modal atau halaman baru)
}
function renderReportPagination(totalReports) {
    const container = document.querySelector("#laporan-masuk-section .pagination");
    if (!container) return;

    container.innerHTML = '';
    const totalPages = Math.ceil(totalReports / reportsPerPage);

    const prevBtn = document.createElement('button');
    prevBtn.textContent = "Previous";
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => previousPage(false);
    container.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === currentPage) btn.classList.add('active');
        btn.onclick = () => goToPage(i, false);
        container.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.textContent = "Next";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => nextPage(totalReports, false); // ← PENTING
    container.appendChild(nextBtn);
}

function downloadReportPDF(reportId) {
  const link = document.createElement("a");
  link.href = `https://dragonmontainapi.com/riwayat_laporan.php?user=1/download`; // ganti URL ini sesuai endpoint server kamu
  link.download = `laporan_${reportId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function searchReportById() {
    try {
        const searchInput = document.getElementById('report-search')?.value.trim().toLowerCase();
        if (!searchInput) {
            currentPage = 1;
            renderReportList();
            return;
        }
        const filteredReports = reports.filter(report =>
    report.id.toString().includes(searchInput) || report.nama.toLowerCase().includes(searchInput)
);
        currentPage = 1;
        renderReportList(filteredReports);
    } catch (e) {
        console.error('Error searching report:', e);
        showErrorBoundary('Gagal mencari laporan: ' + e.message);
    }
}

// Fungsi untuk membuka modal detail laporan berdasarkan kategori
function openReportModal(reportId) {
  try {
    console.log("Report ID yang dipilih:", reportId);
    console.log("Data reports:", reports);

    const report = reports.find(r => String(r.id) === String(reportId));
    if (!report) {
      alert('Laporan tidak ditemukan!');
      return;
    }

    const modal = document.getElementById('report-modal');
    if (!modal) {
      console.warn('Report modal not found');
      return;
    }

    // Isi field modal
    document.getElementById('report-nama').value = report.nama || '';
    document.getElementById('report-nik').value = report.nik || '';
    // document.getElementById('report-email').value = report.pelapor?.email || '';
    document.getElementById('report-telepon').value = report.no_hp || '';
    // === Buat klik nomor telepon langsung ke WhatsApp ===
    const teleponInput = document.getElementById('report-telepon');
    if (teleponInput) {
    let nomor = (report.no_hp || "").replace(/\D/g, "");
    if (nomor.startsWith("0")) nomor = "62" + nomor.slice(1);
    teleponInput.readOnly = true;
    teleponInput.style.cursor = "pointer";
    teleponInput.style.color = "#00000";
    teleponInput.title = "Klik untuk chat via WhatsApp";

    teleponInput.onclick = null;
    teleponInput.addEventListener("click", () => {
        if (nomor) {
        const waLink = `https://wa.me/${nomor}`;
        console.log("🔗 Buka WhatsApp:", waLink);
        window.open(waLink, "_blank");
        } else {
        alert("Nomor WhatsApp tidak tersedia.");
        }
    });
    }
    document.getElementById('report-saksi').value = report.saksi || '';
    document.getElementById('report-titik').value = report.titik || '';
    document.getElementById('report-kendaraan').value = report.kendaraan || '-';
    document.getElementById('report-jenis').value = report.jenis || '-';
    document.getElementById('report-jumlah-korban').value = report.jumlahKorban || '-';
    document.getElementById('report-tanggal').value = report.tanggal || '';
    document.getElementById('report-status').value = report.status || '-';
    document.getElementById('report-kronologi').value = report.kronologi || '';
    document.getElementById('report-bukti').src = report.bukti || '';
    document.getElementById('report-petugas').value = report.petugas || '';
    const petugasInput = document.getElementById('report-petugas');
    if (petugasInput) {
      petugasInput.value = escapeHTML(report.petugas || '');
    }
    // === Tambahkan bagian ini untuk menampilkan bukti dan keterangan selesai ===
    const buktiPetugasImg = document.getElementById("report-bukti-petugas");
    const keteranganInput = document.getElementById("report-keterangan");

    // Jika elemen keterangan selesai ada di modal
    if (keteranganInput) {
    keteranganInput.value = report.keterangan_selesai || '';
    }

    // Jika elemen bukti selesai ada di modal
    if (buktiPetugasImg) {
    if (report.bukti_selesai && report.bukti_selesai !== 'null' && report.bukti_selesai !== '') {
        buktiPetugasImg.src = report.bukti_selesai;
        buktiPetugasImg.style.display = 'block';
    } else {
        buktiPetugasImg.src = '';
        buktiPetugasImg.style.display = 'none';
    }
    }

    const buttonContainer = document.querySelector('.report-buttons');
    if (!buttonContainer) {
      console.warn('report-buttons container not found');
      return;
    }

    buttonContainer.innerHTML = ''; // Kosongkan dulu tombol

    // Status normalisasi huruf besar kecil
    const status = (report.status || '').toLowerCase();

    // Tombol dinamis berdasarkan status
    switch (status) {
      case 'masuk':
        if (petugasInput) petugasInput.disabled = true;
        buttonContainer.innerHTML = `
          <button class="accept-button" onclick="updateStatus('${reportId}', 'diterima')">Terima</button>
          <button class="reject-button" onclick="updateStatus('${reportId}', 'ditolak')">Tolak</button>
          <button class="btn cancel-btn">Batal</button>
        `;
        break;

      case 'diterima':
        if (petugasInput) petugasInput.disabled = false;
        buttonContainer.innerHTML = `
          <button class="save-btn" onclick="savePetugas('${reportId}')">Simpan</button>
          <button class="btn cancel-btn">Batal</button>
        `;
        break;

      case 'penanganan':
        if (petugasInput) petugasInput.disabled = false;
        buttonContainer.innerHTML = `
          <button class="save-btn" onclick="savePetugas('${reportId}')">Simpan</button>
          <button class="complete-btn" onclick="updateStatus('${reportId}', 'selesai')">Selesai</button>
          <button class="btn cancel-btn">Batal</button>
        `;
        break;

      case 'selesai':
      case 'ditolak':
      default:
        if (petugasInput) petugasInput.disabled = true;
        buttonContainer.innerHTML = `
        <button class="btn cancel-btn">Batal</button>
        `;
        break;
    }

    // Tampilkan modal
    modal.style.display = 'block';

    // Event listener untuk tombol Batal (harus di-bind ulang setiap kali)
    const cancelBtn = modal.querySelector('.cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeReportModal);
    }
    

  } catch (e) {
    console.error('Error opening report modal:', e);
    showErrorBoundary('Gagal membuka modal laporan: ' + e.message);
  }
}

// Zoom in bukti laporan
document.addEventListener("DOMContentLoaded", () => {
  const bukti = document.getElementById("report-bukti");
  const modal = document.getElementById("zoomModal");
  const zoomedImg = document.getElementById("zoomedImage");
  const closeBtn = modal.querySelector(".close");

  if (bukti && modal && zoomedImg && closeBtn) {
    bukti.style.cursor = "zoom-in";

    bukti.addEventListener("click", () => {
      zoomedImg.src = bukti.src;
      modal.style.display = "block";
    });

    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }
});

// Fungsi menutup modal laporan masuk
function closeReportModal() {
  const modal = document.getElementById('report-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}
async function saveLaporan() {
  try {
    const laporanId = currentReportId;  // pastikan kamu punya variabel ID laporan
    const petugas = document.getElementById("report-petugas").value;
    const keterangan = document.getElementById("report-keterangan").value.trim();
    const file = document.getElementById("report-foto-petugas").files[0];

    if (!petugas) {
      alert("Pilih petugas terlebih dahulu");
      return;
    }

    const formData = new FormData();
    formData.append("id", laporanId);
    formData.append("petugas", petugas);
    formData.append("keterangan_selesai", keterangan);
    if (file) {
      formData.append("bukti_selesai", file);
    }

    const response = await fetch("https://dragonmontainapi.com/ubah_status_laporan.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      alert("Laporan berhasil diperbarui");
      closeModal();
      // reload / refresh tampilan laporan atau pelacakan
    } else {
      alert("Gagal memperbarui laporan: " + (result.message || "error"));
    }

  } catch (err) {
    console.error("Error saat saveLaporan:", err);
    alert("Terjadi kesalahan saat menyimpan laporan");
  }
}

// Fungsi untuk menyimpan petugas dan memperbarui status
function savePetugas(reportId) {
  const report = reports.find(r => String(r.id) === String(reportId));
  if (!report) return;

  const petugasSelect = document.getElementById('report-petugas');
  const fotoPetugasInput = document.getElementById('report-foto-petugas');
  const keteranganInput = document.getElementById('report-keterangan');

  const petugas = petugasSelect ? petugasSelect.value.trim() : '';
  const keteranganSelesai = keteranganInput ? keteranganInput.value.trim() : '';
  const fotoSelesai = fotoPetugasInput ? fotoPetugasInput.files[0] : null;

  if (!petugas && report.status === 'Diterima') {
    alert('Petugas harus diisi sebelum menyimpan!');
    return;
  }

  // Mapping status agar sesuai dengan API
  const statusMap = {
    "Diterima": "2",      // jadi Penanganan
    "Penanganan": "3"     // jadi Selesai
  };

  // Jika diterima → ubah jadi penanganan
  // Jika sedang penanganan dan sudah ada bukti → ubah jadi selesai
  let newStatus = report.status;
  if (report.status === 'Diterima' && petugas) {
    newStatus = "Penanganan";
  } else if (report.status === 'Penanganan' && (fotoSelesai || keteranganSelesai)) {
    newStatus = "Selesai";
  }

  report.petugas = petugas;
  report.keterangan_selesai = keteranganSelesai;

  // === Kirim ke API ===
  const formData = new FormData();
  formData.append("id", reportId);
  formData.append("petugas", petugas);
  formData.append("status", statusMap[newStatus] || report.status);
  if (fotoSelesai) formData.append("bukti_selesai", fotoSelesai);
  if (keteranganSelesai) formData.append("keterangan_selesai", keteranganSelesai);

  fetch("https://dragonmontainapi.com/ubah_status_laporan.php", {
    method: "POST",
    body: formData
  })
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  })
  .then(result => {
    console.log("Respons ubah status:", result);
    if (result.kode === 200) {
      alert(`Laporan berhasil diperbarui menjadi ${newStatus}.`);
      closeReportModal();
      renderTracking(getCurrentCategory());
    } else {
      alert("Gagal menyimpan ke server: " + (result.message || "Unknown error."));
    }
  })
  .catch(err => {
    console.error("Gagal mengirim ke API:", err);
    alert("Terjadi kesalahan koneksi ke server.");
  });

//   localStorage.setItem('reports', JSON.stringify(reports));
  alert('Petugas diperbarui.');
  closeReportModal(); 
  renderTracking(getCurrentCategory());
}

// Fungsi untuk memperbarui status laporan
async function updateStatus(reportId, newStatus) {
  const report = reports.find(r => String(r.id) === String(reportId));
  if (!report) return;

  // Mapping status ke nilai yang diminta backend
  const statusMap = {
    "diterima": "1",
    "ditolak": "4",
    "selesai": "3",
    "penanganan": "2"
  };

  const statusValue = statusMap[newStatus];
  if (!statusValue) {
    alert("Status tidak valid.");
    return;
  }

  console.log("Kirim ke API dengan:", { id: reportId, status: statusValue });

  try {
    const formData = new FormData();
    formData.append("id", reportId);
    formData.append("status", statusValue);
    const petugasInput = document.getElementById('report-petugas');
    const petugas = petugasInput ? petugasInput.value.trim() : '';
    formData.append("petugas", petugas);

    const response = await fetch("https://dragonmontainapi.com/ubah_status_laporan.php", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Gagal update status di server: ${response.status}`);
    }

    const result = await response.json();
    console.log("Respons dari server:", result);

    if (result.kode !== 200) {
      throw new Error(result.message || "Update status gagal.");
    }
    // pemberitahuan status diperbaharui
    alert(`Status laporan berhasil diubah menjadi ${newStatus}.`);

    // Refresh data laporan dari server
    // await loadAllReports();
    closeReportModal();
    window.location.reload();

    // Render ulang halaman pelacakan
    renderTracking(getCurrentCategory());
  } catch (err) {
    console.error("Gagal mengubah status laporan:", err);
  }
}
// async function loadAllReports() {
//   try {
//     const response = await fetch('https://dragonmontainapi.com/riwayat_laporan.php?user=1');

//     if (!response.ok) {
//       throw new Error(`HTTP ${response.status} ${response.statusText}`);
//     }

//     const result = await response.json();
//     console.log("📥 Respon dari API:", result);

//     if (
//       result && 
//       (result.kode === 200 || result.success === true) && 
//       result.data && 
//       typeof result.data === 'object'
//     ) {
//       reports = result.data;
//       console.log("✅ Data laporan dimuat:", reports);
//       renderTracking(getCurrentCategory());
//     } else {
//       console.warn("❌ Data kosong atau tidak sesuai:", result);
//       alert("Gagal memuat data laporan: " + (result.message || "Data kosong dari server."));
//     }
//   } catch (err) {
//     console.error("❗ Gagal memuat laporan:", err);
//     alert("Tidak dapat terhubung ke server laporan: " + err.message);
//   }
// }

// Fungsi untuk merender tabel tracking berdasarkan kategori
// --- Tracking ---
function filterCategory(category) {
    currentPage = 1;
    currentTrackingCategory = category;
    applyFilters();

    switch (category) {
        case 'all':
            filteredTrackingReports = reports.filter(r => r.status === "Masuk");
            break;
        case 'accepted':
            filteredTrackingReports = reports.filter(r => r.status === "Diterima");
            break;
        case 'handling':
            filteredTrackingReports = reports.filter(r => r.status === "Penanganan");
            break;
        case 'received':
            filteredTrackingReports = reports.filter(r => r.status === "Selesai");
            break;
        case 'rejected':
            filteredTrackingReports = reports.filter(r => r.status === "Ditolak");
            break;
    }

    filteredTrackingReports = filteredTrackingReports.filter(r => matchesDate(r.tanggal, selectedYear, selectedMonth));
    renderTrackingTable(filteredTrackingReports);
}
// Unduh Filter dipelacakan Laporan sesuai kategori
function downloadFilteredTracking(category) {
    try {
        const selectedYear = document.getElementById("tracking-filter-year")?.value || "all";
        const selectedMonth = document.getElementById("tracking-filter-month")?.value || "all";
        const searchKeyword = document.getElementById("tracking-search")?.value.trim().toLowerCase();

        let filtered = reports.filter(r => {
            // Filter kategori laporan
            if (category === "all" && r.status === "Masuk") return false;
            if (category === "accepted" && r.status !== "Diterima") return false;
            if (category === "handling" && r.status !== "Penanganan") return false;
            if (category === "received" && r.status !== "Selesai") return false;
            if (category === "rejected" && r.status !== "Ditolak") return false;

            // Filter tahun/bulan
            if (!r.tanggal) return false;
            const date = new Date(r.tanggal);
            const year = date.getFullYear().toString();
            const monthName = date.toLocaleString("id-ID", { month: "long" }).toLowerCase();

            const matchYear = (selectedYear === "all") || (year === selectedYear);
            const matchMonth = (selectedMonth === "all") || (monthName === selectedMonth.toLowerCase());

            return matchYear && matchMonth;
        });

        // Filter keyword jika ada
        if (searchKeyword) {
            filtered = filtered.filter(r =>
                r.id?.toString().toLowerCase().includes(searchKeyword) ||
                r.nama?.toLowerCase().includes(searchKeyword)
            );
        }

        if (filtered.length === 0) {
            alert("Tidak ada data untuk diunduh pada filter ini.");
            return;
        }

        // Header data
        const wsData = [
            ["ID", "Nama", "Tanggal", "Jenis Kecelakaan", "Kendaraan", "Jumlah Korban", "Titik Kejadian", "Kronologi", "Status"]
        ];

        // Isi data
        filtered.forEach(r => {
            wsData.push([
                r.id || "",
                r.nama || "",
                r.tanggal || "",
                r.jenis || "",
                r.kendaraan || "",
                r.jumlahKorban || "",
                r.titik || "",
                r.kronologi || "",
                r.status || ""
            ]);
        });

        // Buat sheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Auto-width kolom
        const colWidths = wsData[0].map((_, colIndex) => {
            let maxLength = 0;
            wsData.forEach(row => {
                const cellValue = row[colIndex] ? row[colIndex].toString() : "";
                maxLength = Math.max(maxLength, cellValue.length);
            });
            return { wch: maxLength + 2 }; // +2 biar ada jarak
        });
        ws['!cols'] = colWidths;

        // Buat workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tracking Laporan");

        // Nama file
        let filename = `tracking_${category}`;
        if (selectedYear !== "all") filename += `_${selectedYear}`;
        if (selectedMonth !== "all") filename += `_${selectedMonth}`;
        filename += ".xlsx";

        // Simpan file
        XLSX.writeFile(wb, filename);

    } catch (e) {
        console.error("Gagal mengunduh Tracking Excel:", e);
        alert("Terjadi kesalahan saat mengunduh data tracking.");
    }
}
// Pelacakan Laporan Tabel sesuai Filter
function renderTrackingTable(data) {
    const tbody = document.getElementById('tracking-table-body');
    tbody.innerHTML = '';
    const start = (currentPage - 1) * reportsPerPage;
    const end = start + reportsPerPage;
    const pageData = data.slice(start, end);

    tbody.innerHTML = pageData.map(report => `
        <tr>
        <td>${escapeHTML(report.id.toString())}</td>
        <td>${escapeHTML(report.nama?.length > 30 ? report.nama.substring(0, 30) + '...' : report.nama || '-')}</td>
        <td>${escapeHTML(report.tanggal || '-')}</td>
        <td>${escapeHTML(report.jenis || '-')}</td>
        <td>${escapeHTML(report.kendaraan || '-')}</td>
        <td>${escapeHTML(report.jumlahKorban || '-')}</td>
        <td>${escapeHTML(report.titik?.length > 40 ? report.titik.substring(0, 40) + '...' : report.titik || '-')}</td>
        <td>${escapeHTML(report.kronologi?.length > 80 ? report.kronologi.substring(0, 80) + '...' : report.kronologi || '-')}</td>

            <td><button onclick="bukaDetailLaporan(${report.id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="#FFFFFF" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                            </svg></button></td>
            <td><span class="report-status ${report.status.toLowerCase()}">${escapeHTML(report.status)}</span></td>
        </tr>
    `).join('');

    // Ambil semua elemen stats card
const totalCard = document.getElementById('card-total');
const acceptedCard = document.getElementById('card-accepted');
const handlingCard = document.getElementById('card-handling');
const receivedCard = document.getElementById('card-received');
const rejectedCard = document.getElementById('card-rejected');

const totalElement = document.getElementById('total-reports');
const acceptedElement = document.getElementById('accepted-reports-count');
const handlingElement = document.getElementById('handling-reports-count');
const receivedElement = document.getElementById('received-data-count');
const rejectedElement = document.getElementById('rejected-reports-count');

// Reset tampilan semua cards
[totalCard, acceptedCard, handlingCard, receivedCard, rejectedCard].forEach(card => {
    if (card) card.style.display = 'none';
});

// Tampilkan sesuai filter
if (currentTrackingCategory === 'all') {
    // Tampilkan semua
    if (totalCard) totalCard.style.display = 'block';
    if (acceptedCard) acceptedCard.style.display = 'block';
    if (handlingCard) handlingCard.style.display = 'block';
    if (receivedCard) receivedCard.style.display = 'block';
    if (rejectedCard) rejectedCard.style.display = 'block';

    totalElement.textContent = data.length;
    acceptedElement.textContent = data.filter(r => r.status === 'Diterima').length;
    handlingElement.textContent = data.filter(r => r.status === 'Penanganan').length;
    receivedElement.textContent = data.filter(r => r.status === 'Selesai').length;
    rejectedElement.textContent = data.filter(r => r.status === 'Ditolak').length;
} else {
    // Tampilkan hanya satu card tergantung kategori aktif
    if (currentTrackingCategory === 'accepted' && acceptedCard) {
        acceptedCard.style.display = 'block';
        acceptedElement.textContent = data.length;
    }
    if (currentTrackingCategory === 'handling' && handlingCard) {
        handlingCard.style.display = 'block';
        handlingElement.textContent = data.length;
    }
    if (currentTrackingCategory === 'received' && receivedCard) {
        receivedCard.style.display = 'block';
        receivedElement.textContent = data.length;
    }
    if (currentTrackingCategory === 'rejected' && rejectedCard) {
        rejectedCard.style.display = 'block';
        rejectedElement.textContent = data.length;
    }
}
    // Update pagination
    renderTrackingPagination(data.length);
}
let selectedEvaluasiId = null; // null untuk mode tambah
// Evaluasi
function openAddEvaluasi() {
    try {
        const modal = document.getElementById('evaluasi-modal');
        if (!modal) {
            console.warn('Evaluasi modal not found');
            return;
        }

        document.getElementById('evaluasi-title').value = '';
        document.getElementById('evaluasi-description').value = '';
        document.getElementById('evaluasi-period').value = '';
        document.getElementById('delete-evaluasi-btn').style.display = 'none';

        const saveBtn = document.getElementById('save-evaluasi-btn');
        const cancelBtn = document.getElementById('cancel-evaluasi-btn');

        if (saveBtn) {
            saveBtn.onclick = () => {
                const title = document.getElementById('evaluasi-title')?.value.trim();
                const description = document.getElementById('evaluasi-description')?.value.trim();
                const period = document.getElementById('evaluasi-period')?.value.trim();

                if (!title || !description || !period) {
                    alert('Semua field evaluasi harus diisi!');
                    return;
                }

                const newId = evaluasiData.length ? Math.max(...evaluasiData.map(e => e.id)) + 1 : 1;
                evaluasiData.push({ id: newId, title, description, period });
                localStorage.setItem('evaluasiData', JSON.stringify(evaluasiData));
                alert('Evaluasi berhasil ditambahkan!');
                closeModal('evaluasi-modal');
                renderEvaluasiCards();
            };
        }

        if (cancelBtn) cancelBtn.onclick = () => closeModal('evaluasi-modal');

        modal.style.display = 'flex';
    } catch (e) {
        console.error('Error opening add evaluasi modal:', e);
        showErrorBoundary('Gagal membuka form tambah evaluasi: ' + e.message);
    }
}

// Fungsi simpan (tambah atau edit) Evaluasi
document.getElementById('save-evaluasi-btn').onclick = function () {
    const title = document.getElementById('evaluasi-title').value.trim();
    const description = document.getElementById('evaluasi-description').value.trim();
    const period = document.getElementById('evaluasi-period').value.trim();

    if (!title || !description || !period) {
        alert('Semua kotak wajib diisi!');
        return;
    }

    const isDuplicate = evaluasiData.some(e =>
        e.title.toLowerCase() === title.toLowerCase() &&
        (selectedEvaluasiId === null || e.id !== selectedEvaluasiId)
    );
    if (isDuplicate) {
        alert('Evaluasi dengan judul yang sama sudah ada.');
        return;
    }

    if (selectedEvaluasiId === null) {
        const newId = evaluasiData.length ? Math.max(...evaluasiData.map(e => e.id)) + 1 : 1;
        evaluasiData.push({ id: newId, title, description, period });
    } else {
        const index = evaluasiData.findIndex(e => e.id === selectedEvaluasiId);
        if (index !== -1) {
            evaluasiData[index].title = title;
            evaluasiData[index].description = description;
            evaluasiData[index].period = period;
        }
    }

    saveToLocalStorage('evaluasiData', evaluasiData);
    renderEvaluasiCards();
    closeModal('evaluasi-modal'); // ✅ Modal tertutup setelah simpan
};

// Fungsi hapus EValuasi
document.getElementById('delete-evaluasi-btn').onclick = function () {
    if (selectedEvaluasiId === null) {
        alert('Evaluasi belum dipilih.');
        return;
    }

    const index = evaluasiData.findIndex(e => e.id === selectedEvaluasiId);
    if (index === -1) {
        alert('Evaluasi tidak ditemukan.');
        return;
    }

    const konfirmasi = confirm('Apakah kamu yakin ingin menghapus evaluasi ini?');
    if (!konfirmasi) return;

    evaluasiData.splice(index, 1);
    saveToLocalStorage('evaluasiData', evaluasiData);
    renderEvaluasiCards();
    closeModal('evaluasi-modal'); // ✅ Modal tertutup setelah hapus
};
// JS
document.getElementById('cancel-evaluasi-btn')?.addEventListener('click', () => closeModal('evaluasi-modal'));
document.getElementById('close-evaluasi-modal')?.addEventListener('click', () => closeModal('evaluasi-modal'));

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        setTimeout(() => { modal.style.display = 'none'; }, 300); // tunggu transisi selesai
    }
}

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Gagal menyimpan ${key} ke localStorage:`, e);
        alert(`Gagal menyimpan data: ${e.message}`);
    }
}
document.getElementById('delete-evaluasi-btn').onclick = function () {
    if (selectedEvaluasiId === null) {
        alert('Evaluasi belum dipilih.');
        return;
    }

    const index = evaluasiData.findIndex(e => e.id === selectedEvaluasiId);
    if (index === -1) {
        alert('Evaluasi tidak ditemukan.');
        return;
    }

    const konfirmasi = confirm('Apakah kamu yakin ingin menghapus evaluasi ini?');
    if (!konfirmasi) return;

    evaluasiData.splice(index, 1);
    saveToLocalStorage('evaluasiData', evaluasiData);
    renderEvaluasiCards();
    closeModal('evaluasi-modal'); // ✅ Tutup modal setelah hapus
};

// Fungsi untuk mendapatkan kategori saat ini
function getCurrentCategory() {
    const active = document.querySelector('.category-card.active');
    return active ? active.getAttribute('data-category') : 'all';
}

// Inisialisasi filter kategori saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    setupTrackingFilters();
    renderTracking('all'); // Default ke All Report
});

// Fungsi untuk mengatur event listener pada kartu kategori
function setupTrackingFilters() {
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const category = card.dataset.category;
            currentPage = 1;
            renderTracking(category);
        });
    });
}

function renderTrackingPagination(totalReports) {
    const container = document.querySelector("#tracking-section .pagination");
    if (!container) return;

    container.innerHTML = '';
    const totalPages = Math.ceil(totalReports / reportsPerPage);

    const prevBtn = document.createElement('button');
    prevBtn.textContent = "Previous";
    prevBtn.onclick = () => previousPage(true);
    container.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === currentPage) btn.classList.add('active');
        btn.onclick = () => goToPage(i, true);
        container.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.textContent = "Next";
    nextBtn.onclick = () => nextPage(totalReports, true);
    container.appendChild(nextBtn);
}

// Fungsi untuk memperbarui pagination
function updatePagination(totalReports) {
    const totalPages = Math.ceil(totalReports / reportsPerPage);
    const prevBtn = document.querySelector('.pagination button:first-child');
    const nextBtn = document.querySelector('.pagination button:last-child');
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    // Bersihkan isian dan tombol (jika ada)
    const buttonContainer = document.querySelector('.report-buttons');
    if (buttonContainer) buttonContainer.innerHTML = '';
    
    const petugasInput = document.getElementById('report-petugas');
    if (petugasInput) petugasInput.value = '';
}
// memperbaharui petugas
function updatePetugas(reportId) {
    try {
        const report = reports.find(r => r.id === reportId);
        if (!report) {
            alert('Laporan tidak ditemukan!');
            return;
        }

        const petugas = document.getElementById('report-petugas')?.value.trim();
        if (!petugas) {
            alert('Nama petugas harus diisi!');
            return;
        }

        report.petugas = petugas;
        report.status = 'Penanganan';
        localStorage.setItem('reports', JSON.stringify(reports));
        alert('Petugas berhasil disimpan!');
        closeModal('report-modal');
        renderReportList();
        renderTracking();
    } catch (e) {
        console.error('Error updating petugas:', e);
        showErrorBoundary('Gagal menyimpan petugas: ' + e.message);
    }
}
// memperbaharui status laporan
function updateReportStatus(reportId, newStatus) {
    try {
        const report = reports.find(r => r.id === reportId);
        if (!report) {
            alert('Laporan tidak ditemukan!');
            return;
        }

        report.status = newStatus;
        if (newStatus === 'Diterima') {
            report.received = true;
        } else if (newStatus === 'Ditolak') {
            report.received = false;
        }
        localStorage.setItem('reports', JSON.stringify(reports));
        alert(`Laporan telah ${newStatus.toLowerCase()}!`);
        closeModal('report-modal');
        renderReportList();
        renderTracking();
        renderNotifications();
        renderStats();
    } catch (e) {
        console.error('Error updating report status:', e);
        showErrorBoundary('Gagal memperbarui status laporan: ' + e.message);
    }
}
// Utility untuk load gambar external jadi dataURL (dipakai di PDF)
function loadImageAsDataURL(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // agar bisa dipakai ke canvas
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);
            try {
                const dataURL = canvas.toDataURL('image/jpeg');
                resolve(dataURL);
            } catch (e) {
                reject(e);
            }
        };
        img.onerror = () => reject(new Error('Gagal memuat gambar bukti'));
        img.src = url;
    });
}

async function downloadReportPDF(reportId) {
  try {
    if (typeof jspdf === 'undefined') {
      alert('jsPDF belum dimuat.');
      return;
    }

    const { jsPDF } = window.jspdf;

    // Ambil semua data laporan
    const res = await fetch(`https://dragonmontainapi.com/riwayat_laporan.php?user=1`);
    const allReports = await res.json();
    const report = allReports.find(r => String(r.id) === String(reportId));

    if (!report) {
      alert('Laporan tidak ditemukan.');
      return;
    }

    const doc = new jsPDF({
      unit: 'pt',
      format: 'a4'
    });

    // --- Header ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("LAPORAN KEJADIAN KECELAKAAN", 40, 60);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`ID Laporan: ${report.id}`, 40, 80);

    let y = 110;

    // --- Data Pelapor ---
    doc.setFont("helvetica", "bold");
    doc.text("1. Data Pelapor", 40, y);
    y += 20;
    doc.setFont("helvetica", "normal");

    const pelaporData = [
      ["Nama", report.nama_user || "-"],
      ["NIK", report.nik || "-"],
      ["Telepon", report.no_hp || "-"],
      ["Saksi", report.saksi_1 || "-"],
    ];

    pelaporData.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 60, y);
      y += 16;
    });

    // --- Data Kecelakaan ---
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("2. Data Kecelakaan", 40, y);
    y += 20;
    doc.setFont("helvetica", "normal");

    const dataKecelakaan = [
      ["Jenis Kecelakaan", report.jenis_kecelakaan || "-"],
      ["Kendaraan", report.kendaraan || "-"],
      ["Jumlah Korban", report.jumlah_korban || "-"],
      ["Tanggal", report.tanggal || "-"],
      ["Alamat Kejadian", report.alamat || "-"],
      ["Petugas Menangani", report.petugas || "-"],
      ["Status", report.status || "-"],
    ];

    dataKecelakaan.forEach(([label, value]) => {
      const lines = doc.splitTextToSize(`${label}: ${value}`, 480);
      doc.text(lines, 60, y);
      y += lines.length * 14;
    });

    // --- Kronologi ---
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("3. Kronologi Kejadian", 40, y);
    y += 20;
    doc.setFont("helvetica", "normal");

    const kronologiText = doc.splitTextToSize(report.kronologi || "-", 480);
    doc.text(kronologiText, 60, y);
    y += kronologiText.length * 14 + 10;

    // --- Bukti Gambar ---
    if (Array.isArray(report.foto) && report.foto.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("4. Bukti Kecelakaan", 40, y);
      y += 20;

      for (let i = 0; i < report.foto.length; i++) {
        const imgUrl = report.foto[i];
        try {
          const imgData = await loadImageAsDataURL(imgUrl);
          doc.addImage(imgData, "JPEG", 60, y, 200, 120);
          y += 130;
          if (y > 700) {
            doc.addPage();
            y = 60;
          }
        } catch {
          doc.text(`Bukti ${i + 1}: [Gagal memuat gambar]`, 60, y);
          y += 20;
        }
      }
    }

    // --- Bukti Penanganan Selesai (jika ada) ---
    if (report.bukti_selesai) {
      if (y > 650) {
        doc.addPage();
        y = 60;
      }
      doc.setFont("helvetica", "bold");
      doc.text("5. Bukti Penanganan Selesai", 40, y);
      y += 20;

      try {
        const imgData = await loadImageAsDataURL(report.bukti_selesai);
        doc.addImage(imgData, "JPEG", 60, y, 200, 120);
        y += 130;
      } catch {
        doc.text("[Gagal memuat bukti penanganan]", 60, y);
        y += 20;
      }

      doc.setFont("helvetica", "normal");
      doc.text(`Keterangan Selesai: ${report.keterangan_selesai || "-"}`, 60, y);
    }

    // Footer
    doc.setFontSize(10);
    doc.text(`Halaman 1 dari 1`, 260, 820);

    doc.save(`Laporan_${report.nama_user}_${report.id}.pdf`);

  } catch (e) {
    console.error("Error download PDF:", e);
    alert("Gagal mengunduh PDF: " + e.message);
  }
}

async function loadImageAsDataURL(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}


function updatePagination(totalItems) {
    const prevBtn = document.querySelector('.pagination button:first-child');
    const nextBtn = document.querySelector('.pagination button:last-child');
    if (prevBtn && nextBtn) {
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage >= Math.ceil(totalItems / reportsPerPage);
    }
}

function renderStats() {
    try {
        const totalLaporan = reports.length;
        const kasusProses = reports.filter(r => r.status === 'Penanganan').length;
        const kasusSelesai = reports.filter(r => r.status === 'Selesai').length;

        const totalLaporanElement = document.getElementById('total-laporan');
        const kasusProsesElement = document.getElementById('kasus-proses');
        const kasusSelesaiElement = document.getElementById('kasus-selesai');

        if (totalLaporanElement && kasusProsesElement && kasusSelesaiElement) {
            totalLaporanElement.textContent = totalLaporan;
            kasusProsesElement.textContent = kasusProses;
            kasusSelesaiElement.textContent = kasusSelesai;
        } else {
            console.warn('One or more stats card elements not found');
        }
    } catch (e) {
        console.error('Error rendering stats:', e);
        showErrorBoundary('Gagal memuat statistik: ' + e.message);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    renderStats(); // ← supaya langsung muncul tanpa klik menu
});
// laporan terbaru
function renderNotifications() {
    try {
        const notificationList = document.getElementById('notification-list');
        if (!notificationList) return;

        // Ambil hanya laporan yang bukan selesai (3) atau ditolak (4)
        const filteredReports = reports.filter(r => r.status !== "3" && r.status !== "4");

        // Urutkan dari terbaru
        const recentReports = [...filteredReports]
            .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
            .slice(0, 5);

        notificationList.innerHTML = recentReports.map(report => {
            let statusClass = "read"; // default abu

            // Mapping status ke warna dot
            if (report.status === "Masuk") {
            statusClass = "unread"; // merah
            } else if (report.status === "Diterima" || report.status === "Penanganan") {
            statusClass = "read"; // abu
            }


            return `
                <div class="notification-item">
                    <span class="status-indicator ${statusClass}"></span>
                    <div class="details">
                        <span class="name">${escapeHTML(report.nama)}</span>
                        <span class="titik-laporan">
                            ${escapeHTML(report.titik?.length > 40 ? report.titik.substring(0, 40) + '...' : report.titik || '-')}
                        </span>
                        <span class="date">${escapeHTML(report.tanggal)}</span>
                        <button class="action-btn" onclick="navigateToLaporanMasuk('${report.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="#ffffff" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error('Error rendering notifications:', e);
        showErrorBoundary('Gagal memuat notifikasi: ' + e.message);
    }
}

let lastReportCount = 0;
const sirineAudio = new Audio("assets/sirine.mp3");
sirineAudio.loop = true;

function showNewReportPopup(count) {
  const oldPopup = document.querySelector(".new-report-popup");
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement("div");
  popup.className = "new-report-popup";
  popup.innerHTML = `
    <div class="popup-content">
      🚨 <strong>${count} Laporan Baru Masuk!</strong>
      <button id="popup-close">Tutup</button>
    </div>
  `;
  popup.style.cssText = `
    position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
    background: #e63946; color: white; padding: 16px 24px;
    border-radius: 10px; font-size: 16px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 9999;
    display: flex; align-items: center; gap: 12px;
    animation: popupFade 0.5s ease;
  `;
  document.body.appendChild(popup);

  document.getElementById("popup-close").onclick = () => {
    popup.remove();
    sirineAudio.pause();
    sirineAudio.currentTime = 0;
  };
}

async function checkNewReportsFromAPI() {
  try {
    const res = await fetch("https://dragonmontainapi.com/riwayat_laporan.php?user=1");
    const data = await res.json();
    const newReports = data.filter(r => r.status === "0");

    if (lastReportCount === 0) {
      lastReportCount = newReports.length;
      return;
    }

    if (newReports.length > lastReportCount) {
      const diff = newReports.length - lastReportCount;
      showNewReportPopup(diff);
      sirineAudio.play().catch(err => console.warn("⚠️ Audio tidak dapat diputar otomatis:", err));
    }

    lastReportCount = newReports.length;
  } catch (err) {
    console.error("❌ Gagal mengambil laporan:", err);
  }
}

setInterval(checkNewReportsFromAPI, 5000);
checkNewReportsFromAPI();

// aktifkan audio setelah satu kali klik di halaman
document.addEventListener("click", () => {
  sirineAudio.play().then(() => {
    sirineAudio.pause();
    sirineAudio.currentTime = 0;
    console.log("✅ Audio diaktifkan, popup akan bunyi otomatis berikutnya.");
  }).catch(() => {});
}, { once: true });

// Laporan terbaru menuju laporan masuk
function navigateToLaporanMasuk(reportId) {
    try {
        const laporanMasukSection = document.getElementById('laporan-masuk-section');
        const laporanMasukNavItem = document.querySelector('[data-section="laporan-masuk-section"]');
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.content-section');

        if (!laporanMasukSection || !laporanMasukNavItem) {
            throw new Error('Section laporan masuk tidak ditemukan');
        }

        sections.forEach(sec => sec.classList.remove('active'));
        navItems.forEach(nav => nav.classList.remove('active'));
        laporanMasukSection.classList.add('active');
        laporanMasukNavItem.classList.add('active');

        renderReportList();

        // Pastikan ID diperlakukan sebagai string
        setTimeout(() => {
            openReportModal(String(reportId));
        }, 200);
    } catch (e) {
        console.error('Error navigating to laporan masuk:', e);
        showErrorBoundary('Gagal membuka laporan masuk: ' + e.message);
    }
}

let evaluasiData = [
    { id: 1, title: "Evaluasi Kecelakaan Q1 2025", description: "Analisis kecelakaan di Kecamatan Bogor Barat menunjukkan peningkatan 10% dibandingkan Q4 2024.", period: "Jan-Mar 2025" },
    { id: 2, title: "Evaluasi Kecelakaan Q4 2024", description: "Penurunan angka kecelakaan di Kecamatan Bogor Selatan setelah pemasangan rambu baru.", period: "Okt-Des 2024" }
];

function validateEvaluasiData(data) {
    return Array.isArray(data) && data.every(item =>
        typeof item.id === 'number' &&
        typeof item.title === 'string' &&
        typeof item.description === 'string' &&
        typeof item.period === 'string'
    );
}
evaluasiData = validateStoredData('evaluasiData', evaluasiData, validateEvaluasiData);

// evaluasi cards
function renderEvaluasiCards() {
    try {
        const evaluasiCards = document.getElementById('evaluasi-cards');
        if (!evaluasiCards) {
            console.warn('Evaluasi cards element not found');
            return;
        }

        evaluasiCards.innerHTML = evaluasiData.map(evaluasi => `
            <div class="evaluasi-card">
                <h3>${escapeHTML(evaluasi.title)}</h3>
                <p class="evaluasi-period">${escapeHTML(evaluasi.period)}</p>
                <p>${escapeHTML(evaluasi.description)}</p>
                <button class="more-about-btn" onclick="openEvaluasiModal(${evaluasi.id})">Ubah</button>
            </div>
        `).join('');
    } catch (e) {
        console.error('Error rendering evaluasi cards:', e);
        showErrorBoundary('Gagal memuat kartu evaluasi: ' + e.message);
    }
}

// membuka detail evaluasi
function openEvaluasiModal(evaluasiId) {
    try {
        const evaluasi = evaluasiData.find(e => e.id === evaluasiId);
        if (!evaluasi) {
            alert('Evaluasi tidak ditemukan!');
            return;
        }

        const modal = document.getElementById('evaluasi-modal');
        if (!modal) {
            console.warn('Evaluasi modal not found');
            return;
        }

        // Set isi form
        document.getElementById('evaluasi-title').value = evaluasi.title;
        document.getElementById('evaluasi-description').value = evaluasi.description;
        document.getElementById('evaluasi-period').value = evaluasi.period;

        // Tampilkan tombol hapus
        const deleteBtn = document.getElementById('delete-evaluasi-btn');
        if (deleteBtn) {
            deleteBtn.style.display = 'inline-block';
            deleteBtn.onclick = () => deleteEvaluasi(evaluasiId);
        }

        // Tombol simpan dan batal
        const saveBtn = document.getElementById('save-evaluasi-btn');
        const cancelBtn = document.getElementById('cancel-evaluasi-btn');
        if (saveBtn) saveBtn.onclick = () => saveEvaluasi(evaluasiId);
        if (cancelBtn) cancelBtn.onclick = () => closeModal('evaluasi-modal');

        // Tombol X (close modal)
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.onclick = () => closeModal('evaluasi-modal');

        // Tampilkan modal
        modal.style.display = 'flex';
        selectedEvaluasiId = evaluasi.id;
    } catch (e) {
        console.error('Error opening evaluasi modal:', e);
        showErrorBoundary('Gagal membuka modal evaluasi: ' + e.message);
    }
}
// menutup evaluasi
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}
// menghapus evaluasi
function deleteEvaluasi(evaluasiId) {
    try {
        const confirmDelete = confirm('Yakin ingin menghapus evaluasi ini?');
        if (!confirmDelete) return;

        evaluasiData = evaluasiData.filter(e => e.id !== evaluasiId);
        localStorage.setItem('evaluasiData', JSON.stringify(evaluasiData));
        alert('Evaluasi berhasil dihapus!');
        closeModal('evaluasi-modal');
        renderEvaluasiCards();
    } catch (e) {
        console.error('Error deleting evaluasi:', e);
        showErrorBoundary('Gagal menghapus evaluasi: ' + e.message);
    }
}
// menyimpan evaluasi
function saveEvaluasi(evaluasiId) {
    try {
        const evaluasi = evaluasiData.find(e => e.id === evaluasiId);
        if (!evaluasi) {
            alert('Evaluasi tidak ditemukan!');
            return;
        }

        const title = document.getElementById('evaluasi-title')?.value.trim();
        const description = document.getElementById('evaluasi-description')?.value.trim();
        const period = document.getElementById('evaluasi-period')?.value.trim();

        if (!title || !description || !period) {
            alert('Semua field evaluasi harus diisi!');
            return;
        }

        evaluasi.title = title;
        evaluasi.description = description;
        evaluasi.period = period;
        localStorage.setItem('evaluasiData', JSON.stringify(evaluasiData));
        alert('Evaluasi berhasil disimpan!');
        closeModal('evaluasi-modal');
        renderEvaluasiCards();
    } catch (e) {
        console.error('Error saving evaluasi:', e);
        showErrorBoundary('Gagal menyimpan evaluasi: ' + e.message);
    }
}

// ===========================
// 📦 MANAJEMEN PENGGUNA (MODE API)
// ===========================

// === Endpoint API ===
const API_GET_ALL_USERS = "https://dragonmontainapi.com/lapor_laka/get_alluser.php";
const API_EDIT_USER = "https://dragonmontainapi.com/user_edit.php"; // pastikan path ini sesuai di servermu

// === Ambil Data dari API ===
async function loadUsers() {
  try {
    const response = await fetch(API_GET_ALL_USERS);
    const data = await response.json();

    const users = data.data || []; // ambil array user
    renderUsersAPI(users);
    allUsers = data.data || [];        // simpan semua data
    filteredUsers = [...allUsers];     // copy awalnya sama
    renderUsersAPI(filteredUsers);     // render tabel
  } catch (error) {
    console.error("Gagal mengambil data pengguna:", error);
  }
}

// === Render Tabel Pengguna ===
function renderUsersAPI(users) {
  const tableBody = document.getElementById("approved-user-table-body");
  if (!tableBody) return;

  // 🧹 Filter data kosong (sisa hasil hapus dari server)
  users = users.filter(u =>
    u.id && u.id.trim() !== "" &&            // pastikan ID ada
    u.nama && u.nama.trim() !== "" &&        // pastikan nama tidak kosong
    u.email && u.email.trim() !== ""         // pastikan email tidak kosong
  );

  tableBody.innerHTML = ""; // bersihkan isi tabel

  users.forEach((user, index) => {
    const row = document.createElement("tr");

    // jika user belum punya foto, gunakan default
    const foto = user.foto && user.foto !== "" 
      ? user.foto 
      : "assets/img/default-user.png";

    row.innerHTML = `
      <td>${user.id || index + 1}</td>
      <td style="text-align:center;">
        <img src="${foto}" alt="foto" style="width:35px; height:35px; border-radius:50%; object-fit:cover;">
      </td>
      <td>${user.nama || "-"}</td>
      <td>${user.email || "-"}</td>
      <td>${user.no_hp || "-"}</td>
      <td>${user.nik || "-"}</td>
      <td>${getKategoriName(user.kategori)}</td>
      <td>${user.terakhir_aktif || "-"}</td>
      <td style="display:flex; justify-content:center; align-items:center; gap:10px;">
        <button 
          onclick='openEditUserModal(${JSON.stringify(user).replace(/"/g, "&quot;")})' 
          title="Edit" style="background:none; border:none; color:#007bff; cursor:pointer;">
          <i class="fa-solid fa-edit"></i>
        </button>
        <button 
        onclick='deleteUser("${user.id}", "${user.nama.replace(/"/g, "&quot;")}")'
        title="Hapus" style="background:none; border:none; color:#dc3545; cursor:pointer;">
        <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}


// === Helper: Kategori kode ke teks ===
function getKategoriName(kode) {
  switch (String(kode)) {
    case "1": return "Admin";
    case "2": return "Petugas";
    case "3": return "Pimpinan";
    default: return "User";
  }
}

// === Modal Edit ===
function openEditUserModal(user) {
  document.getElementById("user-modal-title").textContent = "Edit Pengguna";
  document.getElementById("user-id").value = user.id || "";
  document.getElementById("user-nama").value = user.nama || "";
  document.getElementById("user-email").value = user.email || "";
  document.getElementById("user-nohp").value = user.no_hp || "";
  document.getElementById("user-nik").value = user.nik || "";
  document.getElementById("user-kategori").value = user.kategori; 
  document.getElementById("user-modal").style.display = "block";
}

document.getElementById("save-user-btn").addEventListener("click", async () => {
  const id = document.getElementById("user-id").value;
  const nama = document.getElementById("user-nama").value.trim();
  const email = document.getElementById("user-email").value.trim();
  const no_hp = document.getElementById("user-nohp").value.trim();
  const nik = document.getElementById("user-nik").value.trim();
  const kategori = document.getElementById("user-kategori").value;

  if (!nama || !email || !no_hp || !nik) {
    alert("⚠️ Semua kolom wajib diisi!");
    return;
  }

  if (id === "") {
    alert("Tambah user dari web belum tersedia. Data hanya bisa dari mobile.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("nama", nama);
    formData.append("email", email);
    formData.append("no_hp", no_hp);
    formData.append("nik", nik);
    formData.append("kategori", kategoriToCode(kategori));

    console.log("📤 Data dikirim:", Object.fromEntries(formData));

    const response = await fetch("https://dragonmontainapi.com/user_edit.php", {
      method: "POST",
      body: formData
    });

    const result = await response.json();
    console.log("📨 Respon edit:", result);

    if (
      result.status === "success" ||
      result.message?.toLowerCase().includes("berhasil")
    ) {
      alert("✅ Data pengguna berhasil diperbarui!");
      document.getElementById("user-modal").style.display = "none";
      loadUsers();
    } else {
      alert("❌ Gagal mengedit pengguna: " + (result.message || "Unknown error"));
    }
  } catch (error) {
    console.error("❌ Gagal memperbarui pengguna:", error);
    alert("❌ Terjadi kesalahan saat mengedit pengguna!");
  }
});

// Helper tetap sama
function kategoriToCode(kat) {
  switch (kat) {
    case "Admin": return 1;
    case "Petugas": return 2;
    case "Pimpinan": return 3;
    default: return 4;
  }
}

async function deleteUser(userId, userName) {
  if (!confirm(`Yakin ingin menghapus pengguna "${userName}"?`)) return;

  try {
    const formData = new FormData();
    formData.append("id", userId);

    const response = await fetch(API_EDIT_USER, { // endpoint sama dengan edit
      method: "POST",
      body: formData
    });

    const result = await response.json(); // pastikan API mengembalikan JSON
    console.log("📨 Respon hapus:", result);

    if (result.status === "success") {
      alert(`✅ Pengguna "${userName}" berhasil dihapus!`);
      loadUsers(); // refresh tabel
    } else {
      alert("✅Berhasil menghapus pengguna: " + (result.message));
    }
  } catch (error) {
    console.error("❌ Gagal menghapus pengguna:", error);
    alert("❌ Terjadi kesalahan saat menghapus pengguna!");
  }
}

// === Helper: Nama kategori ke kode ===
function kategoriToCode(kat) {
  switch (kat) {
    case "Admin": return 1;
    case "Petugas": return 2;
    case "Pimpinan": return 3;
    default: return 4;
  }
}
// === Filter & Search ===
function applySearchAndSort() {
  const query = document.getElementById("approved-user-search").value.toLowerCase();
  const sortValue = document.getElementById("approved-user-sort").value;

  // filter dari allUsers
  filteredUsers = allUsers.filter(user => {
    const nama = (user.nama || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const no_hp = (user.no_hp || "").toLowerCase();
    const nik = (user.nik || "").toLowerCase();
    return nama.includes(query) || email.includes(query) || no_hp.includes(query) || nik.includes(query);
  });

  // sort
  filteredUsers.sort((a, b) => {
    switch (sortValue) {
      case "az": return (a.nama || "").localeCompare(b.nama || "");
      case "za": return (b.nama || "").localeCompare(a.nama || "");
      case "terbaru": return new Date(b.terakhir_aktif || 0) - new Date(a.terakhir_aktif || 0);
      case "terlama": return new Date(a.terakhir_aktif || 0) - new Date(b.terakhir_aktif || 0);
      default: return 0;
    }
  });

  renderUsersAPI(filteredUsers);
}


// Event listener search & sort
document.getElementById("approved-user-search").addEventListener("input", applySearchAndSort);
document.getElementById("approved-user-sort").addEventListener("change", applySearchAndSort);

// Helper kategori
function getKategoriName(kode) {
  switch(String(kode)) {
    case "1": return "Admin";
    case "2": return "Petugas";
    case "3": return "Pimpinan";
    default: return "User";
  }
}

// Load awal
document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
});

// === Tutup Modal ===
document.getElementById("cancel-user-btn").addEventListener("click", () => {
  document.getElementById("user-modal").style.display = "none";
});
document.getElementById("user-modal-close").addEventListener("click", () => {
  document.getElementById("user-modal").style.display = "none";
});

// === Saat Halaman Dibuka ===
document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
});

// ==================== Manajemen Petugas ====================
let petugasList = [];
let currentPetugasPage = 1;
const petugasPerPage = 5;
let editingPetugas = null;

// ==================== FETCH DATA PETUGAS DARI API ====================
async function fetchPetugasFromAPI() {
  try {
    const res = await fetch("https://dragonmontainapi.com/lapor_laka/get_alluser.php?kategori=2");
    if (!res.ok) throw new Error("Gagal mengambil data petugas");

    const json = await res.json();

    if (json.status !== "success" || !Array.isArray(json.data)) {
      throw new Error("Format data tidak sesuai");
    }

    // Sesuaikan field dengan struktur API
    petugasList = json.data.map((item) => ({
      id: item.id,
      nama: item.nama,
      email: item.email,
      no_hp: item.no_hp,
      nik: item.nik,
      kategori: item.kategori,
      unit: item.satuan || "Tidak diketahui",
    }));

    console.log("✅ Data petugas dari API:", petugasList);
    renderPetugas();
    renderPetugasDropdown(); // untuk dropdown di laporan
  } catch (err) {
    console.error("❌ Gagal memuat petugas:", err);
    document.getElementById("petugas-table-body").innerHTML =
      `<tr><td colspan="4" style="text-align:center; color:red;">Gagal memuat data petugas</td></tr>`;
  }
}

// ==================== RENDER DATA KE TABEL ====================
function renderPetugas() {
  const tbody = document.getElementById("petugas-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  const start = (currentPetugasPage - 1) * petugasPerPage;
  const end = start + petugasPerPage;
  const pageData = petugasList.slice(start, end);

  if (pageData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Belum ada data petugas</td></tr>`;
    return;
  }

  pageData.forEach((p, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${start + index + 1}</td>
      <td>${p.nama}</td>
      <td>${p.unit}</td>
      <td style="text-align:center;">
        <div class="aksi-wrapper">
        <button class="btn-icon btn-edit" onclick="openEditPetugas('${p.id}')">
        <i class="fa-solid fa-edit"></i>
    </button>
        <button class="btn-icon btn-delete" onclick="deletePetugas('${p.id}')">
        <i class="fa-solid fa-trash"></i>
    </button>
  </div>
      </td>
    `;
    tbody.appendChild(row);
  });

  const totalPages = Math.max(1, Math.ceil(petugasList.length / petugasPerPage));
  document.getElementById("petugas-page-info").textContent =
    `Halaman ${currentPetugasPage} dari ${totalPages}`;
}

// ==================== PAGINATION ====================
function nextPetugasPage() {
  const totalPages = Math.ceil(petugasList.length / petugasPerPage);
  if (currentPetugasPage < totalPages) {
    currentPetugasPage++;
    renderPetugas();
  }
}

function prevPetugasPage() {
  if (currentPetugasPage > 1) {
    currentPetugasPage--;
    renderPetugas();
  }
}

// ==================== CARI PETUGAS ====================
function searchPetugas() {
  const query = document.getElementById("search-petugas").value.toLowerCase();
  const filtered = petugasList.filter(p =>
    p.nama.toLowerCase().includes(query) || p.unit.toLowerCase().includes(query)
  );

  const tbody = document.getElementById("petugas-table-body");
  tbody.innerHTML = "";

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Tidak ada hasil</td></tr>`;
    return;
  }

  filtered.forEach((p, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${p.nama}</td>
      <td>${p.unit}</td>
      <td style="text-align:center;">
        <button class="btn-icon btn-edit" onclick="openEditPetugas('${p.id}')">
          <i class="fa-solid fa-edit"></i>
        </button>
        <button class="btn-icon btn-delete" onclick="deletePetugas('${p.id}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// ==================== MODAL HANDLER ====================
function openAddPetugasModal() {
  editingPetugas = null;
  document.getElementById("modal-petugas-title").textContent = "Tambah Petugas";
  document.getElementById("petugas-form").reset();
  document.querySelector("#petugasModal").style.display = "flex";
}

function openEditPetugas(id) {
  const petugas = petugasList.find(p => p.id === id);
  if (!petugas) return;

  editingPetugas = petugas;

  document.getElementById("modal-petugas-title").textContent = "Edit Petugas";
  document.getElementById("petugas-nama").value = petugas.nama || "";
  document.getElementById("petugas-unit").value = petugas.unit || "";

  document.querySelector("#petugasModal").style.display = "flex";
}

function closePetugasModal() {
  document.querySelector("#petugasModal").style.display = "none";
  editingPetugas = null;
}

window.addEventListener("click", (e) => {
  const modal = document.querySelector("#petugasModal");
  if (e.target === modal) closePetugasModal();
});

// ==================== TAMBAH / EDIT PETUGAS ====================
async function savePetugasToAPI(event) {
  event.preventDefault();

  const nama = document.getElementById("petugas-nama").value.trim();
  const satuan = document.getElementById("petugas-unit").value.trim();

  if (!nama || !satuan) {
    alert("⚠️ Nama dan instansi wajib diisi!");
    return;
  }

  // === MODE EDIT PETUGAS ===
  if (editingPetugas) {
    try {
      const formData = new URLSearchParams();

      // Kirim semua data yang dibutuhkan API
      formData.append("id", editingPetugas.id);
      formData.append("nama", nama);
      formData.append("email", editingPetugas.email || `${nama.toLowerCase().replace(/\s+/g, '.')}@example.com`);
      formData.append("no_hp", editingPetugas.no_hp || "081234567890");
      formData.append("nik", editingPetugas.nik || "0000000000000000");
      formData.append("password", editingPetugas.password || "rahasia123");
      formData.append("satuan", satuan);

      const res = await fetch("https://dragonmontainapi.com/lapor_laka/edit_petugas.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const text = await res.text();
      console.log("📥 Respon edit:", text);

      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.error("❌ Respon bukan JSON valid:", e);
        alert("❌ Gagal mengedit petugas (respon tidak valid dari server)");
        return;
      }

      if (json.status === "success" || json.message?.toLowerCase().includes("berhasil")) {
        alert("✅ Data petugas berhasil diperbarui!");
        closePetugasModal();
        await fetchPetugasFromAPI();
      } else {
        alert(`❌ Gagal mengedit petugas: ${json.message || "Terjadi kesalahan"}`);
      }
    } catch (err) {
      console.error("❌ Error edit petugas:", err);
      alert("Gagal mengedit petugas. Coba lagi nanti.");
    }
    return;
  }

  // === MODE TAMBAH PETUGAS BARU ===
  const password = "rahasia123";
  const email = `${nama.toLowerCase().replace(/\s+/g, '.')}@example.com`;
  const no_hp = "081234567890";
  const nik = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();

  const formData = new URLSearchParams();
  formData.append("nama", nama);
  formData.append("password", password);
  formData.append("email", email);
  formData.append("no_hp", no_hp);
  formData.append("nik", nik);
  formData.append("satuan", satuan);

  try {
    const res = await fetch("https://dragonmontainapi.com/lapor_laka/tambah_petugas.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });
    const json = await res.json();

    if (json.status === "success" || json.message?.toLowerCase().includes("berhasil")) {
      alert("✅ Petugas baru berhasil ditambahkan!");
      closePetugasModal();
      await fetchPetugasFromAPI();
    } else {
      alert(`❌ Gagal menambah petugas: ${json.message || "Coba lagi nanti"}`);
    }
  } catch (error) {
    console.error("❌ Error tambah petugas:", error);
    alert("⚠️ Gagal terhubung ke server. Coba lagi nanti.");
  }
}
// ==================== HAPUS PETUGAS ====================
// ==================== HAPUS PETUGAS (FINAL: API & SINKRON DENGAN PENGGUNA) ====================
async function deletePetugas(id) {
  if (!confirm("Yakin ingin menghapus petugas ini dari sistem?")) return;

  const url = `https://dragonmountainapi.com/user_hapus.php?id=${encodeURIComponent(id)}`;
  console.log("🟡 Menghapus petugas melalui endpoint:", url);

  try {
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      cache: "no-store",
      headers: {
        "Accept": "application/json",
      },
    });

    const text = await res.text();
    console.log("📥 Respon hapus petugas:", text);

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      alert("⚠️ Server mengirim respon tidak valid:\n" + text);
      return;
    }

    // ✅ Jika API hapus berhasil
    if (
      json.success === true ||
      json.status?.toLowerCase() === "success" ||
      json.message?.toLowerCase().includes("berhasil")
    ) {
      alert("🗑️ Petugas berhasil dihapus dari server!");

      // Hapus dari list petugas di frontend
      petugasList = petugasList.filter(p => p.id !== id);
      renderPetugas();
      renderPetugasDropdown();

      // Jika tabel pengguna juga menampilkan petugas
      if (typeof allUsers !== "undefined" && Array.isArray(allUsers)) {
        allUsers = allUsers.filter(u => u.id !== id);
        try {
          renderUsersAPI(allUsers);
        } catch (err) {
          console.warn("ℹ️ Tidak ada tabel pengguna aktif untuk diperbarui.");
        }
      }

      // Refresh ulang data dari API agar sinkron
      await fetchPetugasFromAPI();
      if (typeof loadUsers === "function") await loadUsers();
    } else {
      alert(`❌ Gagal menghapus petugas: ${json.message || "Server menolak permintaan."}`);
    }
  } catch (err) {
    console.error("❌ Error saat hapus petugas:", err);
    alert("⚠️ Terjadi kesalahan saat menghapus petugas. Coba lagi nanti.");
  }
}

// ==================== DROPDOWN PETUGAS UNTUK LAPORAN ====================
function renderPetugasDropdown() {
  const dropdown = document.getElementById("report-petugas");
  if (!dropdown) return;

  dropdown.innerHTML = `<option value="">Pilih Petugas</option>`;
  petugasList.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.nama;
    opt.textContent = p.nama;
    dropdown.appendChild(opt);
  });
}

// ==================== INISIALISASI ====================
document.addEventListener("DOMContentLoaded", () => {
  fetchPetugasFromAPI();
});
// ==================== SIMPAN / EDIT DATA PETUGAS LAPORAN ====================
async function savePetugas(reportId) {
  console.log("🟢 Fungsi savePetugas() terpanggil dengan ID:", reportId);

  try {
    const report = reports.find(r => String(r.id) === String(reportId));
    if (!report) {
      console.error("❌ Laporan tidak ditemukan di array reports");
      alert("Laporan tidak ditemukan.");
      return;
    }

    const petugas = document.getElementById("report-petugas")?.value.trim() || "";
    const keterangan = document.getElementById("report-keterangan")?.value.trim() || "";
    const buktiFile = document.getElementById("report-foto-petugas")?.files[0] || null;

    console.log("📋 Input dari form:", { petugas, keterangan, buktiFile });

    if (!petugas) {
      alert("Nama petugas wajib diisi!");
      return;
    }

    // Tentukan status baru
    let newStatus = report.status;
    if (report.status === "Diterima" && petugas) {
      newStatus = "Penanganan";
    } else if (report.status === "Penanganan" && (keterangan || buktiFile)) {
      newStatus = "Selesai";
    }

    const statusMap = {
      "Masuk": "0",
      "Diterima": "1",
      "Penanganan": "2",
      "Selesai": "3",
      "Ditolak": "4"
    };

    const formData = new FormData();
    formData.append("id", reportId);
    formData.append("petugas", petugas);
    formData.append("status", statusMap[newStatus]);
    formData.append("keterangan_selesai", keterangan);
    if (buktiFile) formData.append("bukti_selesai", buktiFile);

    console.log("🛰️ Data dikirim ke API:", Object.fromEntries(formData));

    const res = await fetch("https://dragonmontainapi.com/ubah_status_laporan.php", {
      method: "POST",
      body: formData
    });

    console.log("🌐 Status HTTP:", res.status);

    const result = await res.json();
    console.log("📩 Respons API:", result);

    if (result.kode === 200 || result.status === "success") {
      alert(`✅ Laporan berhasil diperbarui menjadi ${newStatus}`);
      await syncReportsFromAPI(); // refresh data laporan
      closeReportModal();
    } else {
      alert("❌ Gagal menyimpan: " + (result.message || "Terjadi kesalahan."));
    }

  } catch (err) {
    console.error("🚨 Error di savePetugas:", err);
    alert("Terjadi kesalahan saat menyimpan data ke server.");
  }
}


// ==================== EDIT & HAPUS ====================
function editPetugas(id) {
  openPetugasModal(true, id);
}

function deletePetugas(id) {
  if (confirm("Yakin ingin menghapus petugas ini?")) {
    petugasList = petugasList.filter(p => p.id !== id);
    localStorage.setItem("petugasList", JSON.stringify(petugasList));
    renderPetugas();
    updatePetugasDropdown();
  }
}

// ==================== PAGINATION ====================
function prevPetugasPage() {
  if (currentPetugasPage > 1) {
    currentPetugasPage--;
    renderPetugas();
  }
}

function nextPetugasPage() {
  const totalPages = Math.ceil(petugasList.length / petugasPerPage);
  if (currentPetugasPage < totalPages) {
    currentPetugasPage++;
    renderPetugas();
  }
}

// ==================== PENCARIAN ====================
function searchPetugas() {
  const keyword = document.getElementById("search-petugas").value.toLowerCase();
  const tbody = document.getElementById("petugas-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  const hasil = petugasList.filter(
    p => p.nama.toLowerCase().includes(keyword) || p.unit.toLowerCase().includes(keyword)
  );

  if (hasil.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Tidak ada hasil</td></tr>`;
    return;
  }

  hasil.forEach((p, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${p.nama}</td>
      <td>${p.unit}</td>
      <td style="text-align:center;">
        <button class="btn-icon btn-edit" onclick="editPetugas(${p.id})" title="Edit">
          <i class="fa-solid fa-edit"></i>
        </button>
        <button class="btn-icon btn-delete" onclick="deletePetugas(${p.id})" title="Hapus">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>`;
    tbody.appendChild(row);
  });
}

// Fungsi dummy untuk kompatibilitas agar tidak error
function setupAddUserModal() {
  // Sudah digantikan oleh openAddUserModal(), tidak perlu isi apa pun di sini
}

// ==================== INISIALISASI ====================
document.addEventListener("DOMContentLoaded", renderPetugas);
// ==================== PELACAKAN LAPORAN ====================
// Mencari di pelacakan Laporan
function searchTracking() {
    try {
        const keyword = document.getElementById('tracking-search')?.value.trim().toLowerCase();
        if (!keyword) {
            currentPage = 1; // Reset ke halaman pertama jika input kosong
            renderTracking(); // Tampilkan semua laporan jika tidak ada keyword
            return;
        }

        const filteredReports = reports.filter(report =>
            report.id.toString().toLowerCase().includes(keyword) ||
            report.nama.toLowerCase().includes(keyword)
        );

        currentPage = 1; // Reset ke halaman pertama setelah pencarian
        renderTracking(null, filteredReports); // Render hasil pencarian
    } catch (e) {
        console.error('Error searching tracking data:', e);
        showErrorBoundary('Gagal mencari laporan tracking: ' + e.message);
    }
}

function renderTracking(filteredReports = null) {
    const trackingTableBody = document.getElementById('tracking-table-body');
    if (!trackingTableBody) return;

    const displayReports = filteredReports || reports;
    trackingTableBody.innerHTML = displayReports.map(report => `
        <tr>
            <td>${escapeHTML(report.id.toString())}</td>
            <td>${escapeHTML(report.nama)}</td>
            <td>${escapeHTML(report.tanggal)}</td>
            <td>${escapeHTML(report.status)}</td>
        </tr>
    `).join('');
}

function renderTracking(category = 'all', filteredReports = null) {
    try {
        const trackingTableBody = document.getElementById('tracking-table-body');
        if (!trackingTableBody) {
            console.warn('Tracking table body not found');
            return;
        }

        // Gunakan filteredReports jika ada, jika tidak gunakan semua laporan
        let displayReports = filteredReports || [...reports];
        // Urutkan laporan agar yang terbaru tampil di atas
        displayReports.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

        // Terapkan filter kategori jika bukan hasil pencarian
        if (!filteredReports) {
            if (category === 'accepted') {
                displayReports = displayReports.filter(r => r.status === 'Diterima');
            } else if (category === 'handling') {
                displayReports = displayReports.filter(r => r.status === 'Penanganan');
            } else if (category === 'received') {
                displayReports = displayReports.filter(r => r.status === 'Selesai');
            } else if (category === 'rejected') {
                displayReports = displayReports.filter(r => r.status === 'Ditolak');
            } else if (category === 'all') {
                // All Report hanya menampilkan laporan yang sudah diproses
                displayReports = displayReports.filter(r => 
                    ['Diterima', 'Penanganan', 'Selesai', 'Ditolak'].includes(r.status)
                );
            }
        }

        // Pagination
        const start = (currentPage - 1) * reportsPerPage;
        const end = start + reportsPerPage;
        const paginated = displayReports.slice(start, end);

        // Render tabel dengan kolom tambahan
        trackingTableBody.innerHTML = paginated.map(report => {
            // Batasi panjang kronologi agar tidak terlalu panjang di tabel
            const shortKronologi = report.kronologi.length > 50 
                ? report.kronologi.substring(0, 50) + '...' 
                : report.kronologi;

            return `
                <tr>
                    <td>${escapeHTML(report.id.toString())}</td>
                    <td>${escapeHTML(report.nama)}</td>
                    <td>${escapeHTML(report.tanggal)}</td>
                    <td>${escapeHTML(report.jenis || '-')}</td>
                    <td>${escapeHTML(report.kendaraan || '-')}</td>
                    <td>${escapeHTML(report.jumlahKorban || '-')}</td>
                    <td>${escapeHTML(report.titik || '-')}</td>
                    <td>${escapeHTML(shortKronologi)}</td>
                    <td>
                        <button class="detail-btn" onclick="openReportModal('${report.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="#375B85" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                            </svg>
                        </button>
                    </td>
                    <td><span class="report-status ${report.status.toLowerCase()}">${escapeHTML(report.status)}</span></td>
                </tr>
            `;
        }).join('');

        // Update statistik berdasarkan displayReports
        document.getElementById('total-reports').textContent = displayReports.length;
        document.getElementById('accepted-reports-count').textContent = displayReports.filter(r => r.status === 'Diterima').length;
        document.getElementById('handling-reports-count').textContent = displayReports.filter(r => r.status === 'Penanganan').length;
        document.getElementById('received-data-count').textContent = displayReports.filter(r => r.status === 'Selesai').length;
        document.getElementById('rejected-reports-count').textContent = displayReports.filter(r => r.status === 'Ditolak').length;

        // Update pagination
        renderTrackingPagination(displayReports.length);
    } catch (e) {
        console.error('Error rendering tracking data:', e);
        showErrorBoundary('Gagal memuat data tracking: ' + e.message);
    }
}
// Pagination Pelacakan laporan
function renderTrackingPagination(totalReports) {
  const container = document.querySelector("#tracking-section .pagination");
  if (!container) return;

  container.innerHTML = "";
  const totalPages = Math.ceil(totalReports / reportsPerPage);

  // Tentukan range angka yang mau ditampilkan
  const maxVisiblePages = 3; // tampilkan hanya 3 angka
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Tombol "Kembali"
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Kembali";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderTracking(currentTrackingCategory);
    }
  };
  container.appendChild(prevBtn);

  // Tombol angka dinamis
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    if (i === currentPage) pageBtn.classList.add("active-page");
    pageBtn.onclick = () => {
      currentPage = i;
      renderTracking(currentTrackingCategory);
    };
    container.appendChild(pageBtn);
  }

  // Tombol "Lanjut"
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Lanjut";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTracking(currentTrackingCategory);
    }
  };
  container.appendChild(nextBtn);

}

// filter dropdown tahun dan bulan pelacakan laporan
function initializeFilters() {
    try {
        const yearFilter = document.getElementById('year-filter');
        const years = [...new Set(reports.map(report => new Date(report.tanggal).getFullYear()))].sort((a, b) => b - a);
        yearFilter.innerHTML = '<option value="all">Semua</option>' + years.map(year => `<option value="${year}">${year}</option>`).join('');
        yearFilter.value = new Date().getFullYear().toString();

        const monthFilter = document.getElementById('month-filter');
        monthFilter.value = new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1).toString();
    } catch (e) {
        console.error('Error initializing filters:', e);
        showErrorBoundary('Gagal memuat filter: ' + e.message);
    }
}
// variabel global
let filteredReports = null;

function filterReports() {
    try {
        const year = document.getElementById("year-filter").value;
        const month = document.getElementById("month-filter").value;
        const keyword = document.getElementById("report-search").value.toLowerCase();

        filteredReports = reports.filter(r => {
            if (!r.tanggal) return false;

            const date = new Date(r.tanggal);
            const reportYear = date.getFullYear().toString();
            const reportMonthNumber = (date.getMonth() + 1).toString().padStart(2, '0');
            const reportMonthName = date.toLocaleString('id-ID', { month: 'long' });

            const matchYear = (year === 'all') || (reportYear === year);
            const matchMonth =
                (month === 'all') ||
                (month === reportMonthNumber) ||
                (month.toLowerCase() === reportMonthName.toLowerCase());

            const matchKeyword =
                (!keyword) ||
                (r.id?.toString().toLowerCase().includes(keyword)) ||
                (r.nama?.toLowerCase().includes(keyword));

            return matchYear && matchMonth && matchKeyword && (r.status === 'Masuk' || !r.status);
        });

        localStorage.setItem('currentReportPage', 1);
        renderReportList(); // panggil render ulang

    } catch (e) {
        console.error('Error filtering reports:', e);
        showErrorBoundary('Gagal memfilter laporan: ' + e.message);
    }
}

function markReportAsSelesai(reportId) {
    const report = reports.find(r => r.id === reportId);
    if (!report) {
        alert('Laporan tidak ditemukan!');
        return;
    }

    const confirmFinish = confirm('Yakin ingin menyelesaikan laporan ini?');
    if (!confirmFinish) return;

    report.status = 'Selesai';
    localStorage.setItem('reports', JSON.stringify(reports));
    alert('Laporan telah diselesaikan.');
    closeModal('report-modal');
    renderTracking();
    renderStats();
    renderNotifications();
    renderReportList();
}

function setupTrackingFilters() {
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const category = card.dataset.category;
            currentPage = 1;
            renderTracking(category);
        });
    });
}

initializeAdminPage = (function(original) {
    return function() {
        original();
        setupTrackingFilters();
    };
})(initializeAdminPage);

// Map
// ========== Variabel Global ==========
let map2023, map2024, map2025;

// ========== Ambil Data API ==========
async function getReportsByYear(year) {
  const url = `https://dragonmontainapi.com/riwayat_laporan_pertahun.php?tahun=${year}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ Gagal mengambil data tahun ${year}:`, error);
    return [];
  }
}

// ========== Render Peta ==========
function renderMap(containerId, data, year) {
  if (typeof L === "undefined") {
    console.error("❌ Leaflet belum dimuat.");
    return;
  }

  // Hapus peta lama jika sudah ada
  const oldMap = L.DomUtil.get(containerId);
  if (oldMap && oldMap._leaflet_id) {
    oldMap._leaflet_id = null;
  }

  // Buat peta baru
  const map = L.map(containerId).setView([-6.5944, 106.7890], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  if (!Array.isArray(data) || data.length === 0) {
    console.warn(`⚠️ Tidak ada data untuk tahun ${year}`);
    return;
  }

  // === 1️⃣ Kelompokkan laporan berdasarkan lat-long ===
  const groupedByLocation = {};
  data.forEach(item => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.long);
    if (isNaN(lat) || isNaN(lng)) return;

    const key = `${lat},${lng}`;
    if (!groupedByLocation[key]) groupedByLocation[key] = [];
    groupedByLocation[key].push(item);
  });

  // === 2️⃣ Buat marker per lokasi unik ===
  Object.entries(groupedByLocation).forEach(([key, reports]) => {
    const [lat, lng] = key.split(',').map(Number);
    const count = reports.length;

    // === Buat tabel isi popup berisi semua laporan di titik ini ===
    const popupTable = `
      <div style="max-height:250px; overflow:auto;">
        <b>Total laporan di titik ini: ${count}</b><br><br>
        <table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse; width:100%;">
          <tr style="background-color:#375B85; color:white; text-align:center;">
            <th>No</th>
            <th>Nama</th>
            <th>Tanggal</th>
            <th>Saksi</th>
            <th>Telepon</th>
            <th>Jenis</th>
            <th>Maps</th>
          </tr>
          ${reports.map((r, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${r.nama_user || '-'}</td>
              <td>${r.tanggal || '-'}</td>
              <td>${r.saksi_1 || '-'}</td>
              <td>${r.no_hp || '-'}</td>
              <td>${r.jenis_kecelakaan || '-'}</td>
              <td><a href="https://www.google.com/maps?q=${r.lat},${r.long}" target="_blank">Lihat</a></td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;

    // === Buat marker dengan angka jumlah laporan ===
    const marker = L.marker([lat, lng], {
      icon: createNumberedMarkerIcon(count)
    }).addTo(map);
    // Otomatis Tutup Popup
    marker.bindPopup(popupTable, { closeButton: true, autoClose: false });
  });

  console.log(`✅ Peta ${year} berhasil dimuat (${data.length} laporan, ${Object.keys(groupedByLocation).length} titik unik).`);
}

// Membuat ikon marker dengan angka jumlah laporan
function createNumberedMarkerIcon(count) {
  const svg = `
    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10 15 25 15 25s15-15 15-25C30 6.7 23.3 0 15 0z" fill="#375B85"/>
      <circle cx="15" cy="15" r="8" fill="#FFFFFF"/>
      <text x="15" y="19" font-family="Arial" font-size="10" font-weight="bold" fill="#000000" text-anchor="middle">${count}</text>
    </svg>
  `;
  return L.divIcon({
    className: 'custom-marker-pin',
    html: svg,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -35]
  });
}

// ============================
// Ganti Peta Berdasarkan Tahun
// ============================
async function toggleMapByYear() {
  const selectedYear = document.getElementById("filter-tahun-laporan").value;

  // Sembunyikan semua peta dulu
  document.getElementById("map-2023").style.display = "none";
  document.getElementById("map-2024").style.display = "none";
  document.getElementById("map-2025").style.display = "none";

  // Tampilkan hanya peta tahun yang dipilih
  const selectedMapContainer = document.getElementById(`map-${selectedYear}`);
  if (!selectedMapContainer) {
    console.error(`❌ Container map-${selectedYear} tidak ditemukan`);
    return;
  }
  selectedMapContainer.style.display = "block";

  // Ambil data dari API sesuai tahun
  const reports = await getReportsByYear(selectedYear);

  // Render ulang peta untuk tahun yang dipilih
  renderMap(`map-${selectedYear}`, reports, selectedYear);
}
// ========== Inisialisasi Awal ==========
async function initMap() {
  const year = 2025; // default
  const data = await getReportsByYear(year);
  renderMap("map-2025", data, year);
}
// ========== Inisialisasi Awal ==========
async function initMap() {
  const year = 2025;
  const data = await getReportsByYear(year);
  renderMap("map-2025", data, year);

  // 🔄 Auto refresh setiap 30 detik
  setInterval(async () => {
    console.log("🔄 Memeriksa laporan terbaru...");
    const updatedData = await getReportsByYear(year);
    renderMap("map-2025", updatedData, year);
  }, 30000); // 30 detik
}

document.addEventListener("DOMContentLoaded", initMap)
// Ambil tahun dari dropdown
function getSelectedYear() {
  return document.getElementById("filter-tahun-laporan").value;
}

// ====================
// 📸 UNDUH GAMBAR PETA
// ====================
async function downloadSelectedMapImage() {
  const year = getSelectedYear();
  const mapId = `map-${year}`;
  const mapContainer = document.getElementById(mapId);

  if (!mapContainer) {
    alert("❌ Peta tidak ditemukan!");
    return;
  }

  try {
    const canvas = await html2canvas(mapContainer, {
      useCORS: true,
      scale: 2
    });
    const link = document.createElement("a");
    link.download = `Peta_Laporan_${year}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    console.error("❌ Gagal mengunduh gambar peta:", err);
    alert("Gagal menyimpan gambar peta.");
  }
}

// ====================
// 📊 UNDUH DATA EXCEL
// ====================
// 📊 Versi rapi: ekspor Excel dengan lebar kolom yang disesuaikan
async function downloadSelectedMapExcel() {
  const year = getSelectedYear();
  const data = await getReportsByYear(year);

  if (!data || data.length === 0) {
    alert(`⚠️ Tidak ada data untuk tahun ${year}.`);
    return;
  }

  // Format data
  const formattedData = data.map((r, i) => ({
    No: i + 1,
    ID: r.id || "-",
    Nama: r.nama_user || "-",
    Tanggal: r.tanggal || "-",
    Saksi: r.saksi_1 || "-",
    Telepon: r.no_hp || "-",
    Jenis_Kecelakaan: r.jenis_kecelakaan || "-",
    Jumlah_Korban: r.jumlah_korban || "-",
    Latitude: r.lat || "-",
    Longitude: r.long || "-"
  }));

  // Buat worksheet dari data
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // ✨ Atur lebar kolom biar rapi
  const columnWidths = [
    { wch: 5 },   // No
    { wch: 15 },  // ID
    { wch: 20 },  // Nama
    { wch: 22 },  // Tanggal
    { wch: 25 },  // Saksi
    { wch: 18 },  // Telepon
    { wch: 20 },  // Jenis
    { wch: 15 },  // Jumlah
    { wch: 14 },  // Latitude
    { wch: 14 }   // Longitude
  ];
  worksheet['!cols'] = columnWidths;

  // ✨ Tambahkan header bold
  const headerCells = Object.keys(formattedData[0]);
  headerCells.forEach((header, idx) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: idx });
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "375B85" } },
        alignment: { horizontal: "center" }
      };
    }
  });

  // Buat workbook dan simpan
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Laporan_${year}`);

  // Simpan file Excel
  XLSX.writeFile(workbook, `Data_Laporan_${year}.xlsx`);
}

// fitur download laporan masuk // 
function downloadFilteredReports() {
    try {
        if (typeof XLSX === 'undefined') {
            throw new Error('SheetJS is not loaded');
        }

        const year = document.getElementById('year-filter')?.value || 'all';
        const month = document.getElementById('month-filter')?.value || 'all';

        // Ambil data yang sudah difilter di table
        let filteredReports = reports;

        if (year !== 'all') {
            filteredReports = filteredReports.filter(report => {
                const reportYear = new Date(report.tanggal).getFullYear().toString();
                return reportYear === year;
            });
        }

        if (month !== 'all') {
            filteredReports = filteredReports.filter(report => {
                const reportMonth = new Date(report.tanggal).toLocaleString('id-ID', { month: 'long' });
                return reportMonth === month;
            });
        }

        if (filteredReports.length === 0) {
            alert('Tidak ada data yang sesuai dengan filter untuk diunduh.');
            return;
        }

        // Siapkan data untuk di-export
        const data = filteredReports.map(report => ({
            ID: report.id,
            Nama: report.nama,
            Tanggal: report.tanggal,
            Jenis: report.jenis,
            Titik: report.titik,
            Saksi: report.saksi,
            Kronologi: report.kronologi,
            Status: report.status
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Masuk');

        // Nama file dinamis
        const filename = `laporan-masuk-${year}${month !== 'all' ? '-' + month : '-all'}.xlsx`;

        XLSX.writeFile(workbook, filename);

    } catch (e) {
        console.error('Error downloading filtered reports:', e);
        showErrorBoundary('Gagal mengunduh laporan: ' + e.message);
    }
}

function downloadMonthReports() {
    const year = document.getElementById('year-filter')?.value;
    const month = document.getElementById('month-filter')?.value;

    if (year === 'all' || month === 'all') {
        alert('Silakan pilih bulan dan tahun terlebih dahulu.');
        return;
    }

    const filtered = getFilteredReportsForDownload(year, month);

    if (filtered.length === 0) {
        alert('Tidak ada laporan untuk bulan dan tahun ini.');
        return;
    }

    const monthNames = {
        '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
        '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
        '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
    };

    const title = `Laporan Kecelakaan Bulan ${monthNames[month]} Tahun ${year}`;
    const filename = `laporan-${year}-${month}.pdf`;
    generateFullPDF(title, filtered, filename);
}

function downloadYearReports() {
    const year = document.getElementById('year-filter')?.value;

    if (year === 'all') {
        alert('Silakan pilih tahun terlebih dahulu.');
        return;
    }

    const filtered = getFilteredReportsForDownload(year, 'all');

    if (filtered.length === 0) {
        alert('Tidak ada laporan untuk tahun ini.');
        return;
    }

    const title = `Laporan Kecelakaan Tahun ${year}`;
    const filename = `laporan-${year}.pdf`;
    generateFullPDF(title, filtered, filename);
}
const downloadMonthBtn = document.getElementById('download-month-btn');
const downloadYearBtn = document.getElementById('download-year-btn');

if (downloadMonthBtn) downloadMonthBtn.addEventListener('click', downloadMonthReports);
if (downloadYearBtn) downloadYearBtn.addEventListener('click', downloadYearReports);

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}
let currentCategory = "all";

// Fungsi untuk memperbarui statistik
function updateStats(filteredReports) {
    const totalReports = filteredReports.length;
    const acceptedReports = filteredReports.filter(r => r.status === "Diterima").length;
    const handlingReports = filteredReports.filter(r => r.status === "Penanganan").length;
    const receivedReports = filteredReports.filter(r => r.status === "Selesai").length;
    const rejectedReports = filteredReports.filter(r => r.status === "Ditolak").length;

    document.getElementById("total-reports").textContent = totalReports;
    document.getElementById("accepted-reports-count").textContent = acceptedReports;
    document.getElementById("handling-reports-count").textContent = handlingReports;
    document.getElementById("received-data-count").textContent = receivedReports;
    document.getElementById("rejected-reports-count").textContent = rejectedReports;
}

// Fungsi untuk menerapkan semua filter (tahun, bulan, kategori, dan pencarian)
function applyFilters() {
    const yearFilter = document.getElementById("tracking-filter-year")?.value || "all";
    const monthFilter = document.getElementById("tracking-filter-month")?.value || "all";
    const searchQuery = document.getElementById("tracking-search")?.value.toLowerCase() || "";

    let filtered = reports;

    // Filter berdasarkan status kategori
    switch (currentTrackingCategory) {
        case 'accepted':
            filtered = filtered.filter(r => r.status === "Diterima");
            break;
        case 'handling':
            filtered = filtered.filter(r => r.status === "Penanganan");
            break;
        case 'received':
            filtered = filtered.filter(r => r.status === "Selesai");
            break;
        case 'rejected':
            filtered = filtered.filter(r => r.status === "Ditolak");
            break;
        case 'all':
        default:
            filtered = filtered.filter(r =>
                r.status === "Diterima" ||
                r.status === "Penanganan" ||
                r.status === "Selesai" ||
                r.status === "Ditolak"
            );
            break;
        }

    // Filter berdasarkan tahun dan bulan
    filtered = filtered.filter(r => {
        let reportYear = null;
        let reportMonthIndex = null;

        if (typeof r.tanggal !== "string") return false;

        if (r.tanggal.includes("/")) {
            // Format: DD/MM/YYYY
            const parts = r.tanggal.split("/");
            if (parts.length !== 3) return false;
            reportYear = parts[2];
            reportMonthIndex = parseInt(parts[1], 10) - 1;
        } else {
            // Asumsikan format ISO: YYYY-MM-DD
            const d = new Date(r.tanggal);
            if (isNaN(d)) return false;
            reportYear = d.getFullYear().toString();
            reportMonthIndex = d.getMonth(); // 0–11
        }

        const monthNames = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const selectedMonthIndex = monthFilter !== "all" ? monthNames.indexOf(monthFilter) : null;

        const matchYear = (yearFilter === "all") || (reportYear === yearFilter);
        const matchMonth = (monthFilter === "all") || (reportMonthIndex === selectedMonthIndex);

        return matchYear && matchMonth;
    });

    // Filter berdasarkan pencarian
    if (searchQuery) {
        filtered = filtered.filter(r =>
            r.id?.toString().includes(searchQuery) ||
            r.nama?.toLowerCase().includes(searchQuery)
        );
    }

    currentPage = 1;
    renderTrackingTable(filtered);
    updateStats(filtered);
    console.log("Total semua laporan:", reports.length);
    console.log("Setelah filter kategori:", filtered.length);

}
// Fungsi untuk merender tabel
function renderTable(filteredReports) {
    const tableBody = document.getElementById("tracking-table-body");
    const start = (currentPage - 1) * reportsPerPage;
    const end = start + reportsPerPage;
    const paginatedReports = filteredReports.slice(start, end);

    tableBody.innerHTML = paginatedReports.map(report => `
        <tr>
            <td>${report.id}</td>
            <td>${report.nama}</td>
            <td>${report.tanggal}</td>
            <td><button onclick="viewDetail(${report.id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="#375B85" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                            </svg></button></td>
            <td>${report.status}</td>
        </tr>
    `).join("");

    updatePagination(filteredReports.length);
}

// Fungsi untuk memperbarui pagination
function updatePagination(totalReports) {
    const totalPages = Math.ceil(totalReports / reportsPerPage);
    document.querySelector(".pagination button:first-child").disabled = currentPage === 1;
    document.querySelector(".pagination button:last-child").disabled = currentPage === totalPages;
}

// Fungsi untuk halaman sebelumnya
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        applyFilters();
    }
}

// Fungsi untuk halaman berikutnya
function nextPage() {
    const totalPages = Math.ceil(reports.length / reportsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        applyFilters();
    }
}

// Fungsi untuk melihat detail laporan (placeholder)
function viewDetail(id) {
    console.log("View detail for report ID:", id);
}

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    applyFilters();
});
document.addEventListener("DOMContentLoaded", () => {
  try {
    renderPetugas();
  } catch (e) {
    console.warn("Render petugas dilewati sementara:", e);
  }
});

// Modifikasi initializeAdminPage
initializeAdminPage = (function(original) {
    return function() {
        original();
        setupTrackingFilters();
        closeAllModals(); // Pastikan semua modal ditutup
    };
})(initializeAdminPage);
document.addEventListener('DOMContentLoaded', () => {
    const cancelBtn = document.getElementById('cancel-user-btn');
    const closeBtn = document.getElementById('user-modal-close');

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeUserModal);
    } else {
        console.error('Cancel button #cancel-user-btn not found');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeUserModal);
    } else {
        console.error('Close button #user-modal-close not found');
    }
});
const downloadFilterBtn = document.getElementById('download-filter-btn');
if (downloadFilterBtn) {
    downloadFilterBtn.addEventListener('click', downloadFilteredReports);
}
// Tutup modal evaluasi saat klik tombol Batal
document.getElementById('cancel-evaluasi-btn')?.addEventListener('click', () => {
    document.getElementById('evaluasi-modal').style.display = 'none';
});

// Tutup modal evaluasi saat klik tombol × (modal-close)
document.querySelector('#evaluasi-modal .modal-close')?.addEventListener('click', () => {
    document.getElementById('evaluasi-modal').style.display = 'none';
});

const addUserBtn = document.getElementById('add-user-btn');
if (addUserBtn) {
    addUserBtn.addEventListener('click', () => {
        const userModal = document.getElementById('user-modal');
        if (userModal) {
            userModal.style.display = 'block';
        } else {
            console.error('Elemen user-modal tidak ditemukan.');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-user-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault(); // 🚫 Hentikan form dari reload halaman
            addUser(); // ✅ Jalankan fungsi tambah pengguna
        });
    }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeAdminPage();
        renderStats();           // Statistik jumlah laporan
        renderNotifications();   // 5 laporan terbaru
        renderEvaluasiCards();   // Evaluasi langsung muncul
        renderReportList();

    } catch (e) {
        console.error('Error during page initialization:', e);
        showErrorBoundary('Gagal menginisialisasi halaman: ' + e.message);
    }
});
window.onbeforeunload = null;
// mobile monitoring
// === 🎯 Responsif Chart untuk Mobile tanpa ubah Desktop ===
function optimizeChartForMobile() {
  const canvas = document.getElementById("accident-chart");

  if (!canvas) return;

  // Jika layar < 768px → dianggap mobile
  if (window.innerWidth < 768) {
    canvas.style.height = "350px"; // Tinggi besar agar batang jelas
    canvas.style.width = "100%";

    if (accidentChart?.options) {
      // 🔧 Perkecil font label agar pas di layar kecil
      accidentChart.options.scales.x.ticks.font.size = 10;
      accidentChart.options.scales.y.ticks.font.size = 10;

      // 🔧 Kurangi padding grafik agar lebih padat di HP
      accidentChart.options.layout = {
        padding: {
          top: 10,
          bottom: 10,
          left: 5,
          right: 5
        }
      };

      // 🔧 Legend lebih kecil
      if (accidentChart.options.plugins?.legend) {
        accidentChart.options.plugins.legend.labels = {
          boxWidth: 12,
          font: { size: 10 }
        };
      }

      // 🔧 Judul lebih kecil
      if (accidentChart.options.plugins?.title) {
        accidentChart.options.plugins.title.font = { size: 12 };
      }

      accidentChart.resize();
    }
  } else {
    // === Kembalikan ke tampilan normal desktop ===
    canvas.style.height = "300px";

    if (accidentChart?.options) {
      accidentChart.options.scales.x.ticks.font.size = 12;
      accidentChart.options.scales.y.ticks.font.size = 12;

      if (accidentChart.options.plugins?.legend) {
        accidentChart.options.plugins.legend.labels = {
          boxWidth: 16,
          font: { size: 12 }
        };
      }

      if (accidentChart.options.plugins?.title) {
        accidentChart.options.plugins.title.font = { size: 14 };
      }

      accidentChart.resize();
    }
  }
}

// Jalankan saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", optimizeChartForMobile);

// Jalankan ulang setiap kali ukuran layar berubah
window.addEventListener("resize", optimizeChartForMobile);
