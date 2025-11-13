let openReportOnLoadId = null;
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

    // Buat modal konfirmasi
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
    const username = urlParams.get('user') || 'Pimpinan';
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
                        renderReportList();
                    } else if (sectionId === 'home-section') {
                        renderStats();
                        renderNotifications();
                        renderEvaluasiCards();
                    } else if (sectionId === 'manage-pengguna-section') {
                        renderUserList();
                    } else if (sectionId === 'tracking-section') {
                        renderTracking();
                    } else if (sectionId === 'titik-laporan-section') {
                    initMap();
                    toggleMapByYear(); // tampilkan peta sesuai tahun
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

function loadProfileData() {
    try {
        const stored = JSON.parse(localStorage.getItem('pimpinanProfileData'));
        const data = stored || originalProfileData;

        const fields = {
            'profil-username': data.nama,
            'profil-email': data.email,
            'profil-nik': data.nik,
            'profil-jabatan': data.jabatan,
            'profil-telepon': data.telepon
        };

        Object.entries(fields).forEach(([id, value]) => {
            const input = document.getElementById(id);
            if (input) input.value = escapeHTML(value);
            else console.warn(`Profile field ${id} not found`);
        });

        originalProfileData = data;

    } catch (e) {
        console.error('Error loading profile data:', e);
        showErrorBoundary('Gagal memuat data profil pimpinan: ' + e.message);
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
        { label: "Total Korban", data: totalKorban, backgroundColor: "rgba(255,99,132,0.7)" }
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
      datasets: [{ data, backgroundColor: ["rgba(54,162,235,0.7)","rgba(255,99,132,0.7)"] }]
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
}

function matchesDate(dateStr, year, month) {
  const date = new Date(dateStr);
  const reportYear = date.getFullYear().toString();
  const reportMonth = (date.getMonth() + 1).toString().padStart(2, "0");

  const yearMatch = year === "all" || reportYear === year;
  const monthMatch = month === "all" || reportMonth === month;

  return yearMatch && monthMatch;
}


async function fetchLaporanMasuk() {
  try {
    const response = await fetch("https://dragonmontainapi.com/riwayat_laporan.php?user=1");
    if (!response.ok) throw new Error("Gagal mengambil data laporan dari API");

    const data = await response.json();
    const statusMap = {
      "0": "Masuk",
      "1": "Diterima",
      "2": "Proses",
      "3": "Selesai",
      "4": "Ditolak"
    };

    reports = data.map(item => ({
      id: item.id,
      nama: item.nama_user || '',
      nik: item.nik || '',
      email: item.email || '',
      no_hp: item.no_hp || '',
      tanggal: item.tanggal || '',
      status: statusMap[item.status] || "Masuk",
      titik: item.alamat || '',
      bukti: Array.isArray(item.foto) ? item.foto[0] : (item.foto || ''),
      saksi: item.saksi_1 || '',
      petugas: item.petugas || '',
      kendaraan: item.kendaraan || '',
      jenis: item.jenis_kecelakaan || '',
      jumlahKorban: item.jumlah_korban || '',
      kronologi: item.kronologi || '',
      bukti_selesai: item.bukti_selesai || '',
      keterangan_selesai: item.keterangan_selesai || ''
    }));

    console.log("✅ Data laporan masuk:", reports);

    renderReportList();
    renderStats();
    renderTracking(getCurrentCategory());
    renderNotifications();

  } catch (error) {
    console.error("❌ Error fetching laporan:", error);
    showErrorBoundary("Gagal memuat laporan dari server.");
  }
}


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
        const searchKeyword = document.getElementById('report-search')?.value.trim().toLowerCase();

        let dataToRender = reports.filter(report =>
        (report.status === 'Masuk' || report.status === '' || !report.status) &&
        matchesDate(report.tanggal, selectedYear, selectedMonth)
        );


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
        const endIndex = startIndex + reportsPerPage;
        const paginatedReports = dataToRender.slice(startIndex, endIndex);

        // Render ulang tabel
        tableBody.innerHTML = '';
        paginatedReports.forEach(report => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHTML(report.id.toString())}</td>
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
                    <button onclick="downloadReportPDF('${report.id}')" class="download-pdf-btn" title="Unduh PDF">
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

    const nextBtn = document.createElement('button');
    nextBtn.textContent = "Next";
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.onclick = () => nextPage(totalReports, false);
    container.appendChild(nextBtn);
}


function downloadReportPDF(reportId) {
  const link = document.createElement("a");
  link.href = `/api/reports/${reportId}/download`; // ganti URL ini sesuai endpoint server kamu
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
async function openReportModal(reportId) {
  try {
    console.log("🔍 Membuka laporan ID:", reportId);

    const res = await fetch("https://dragonmontainapi.com/riwayat_laporan.php?user=1");
    const data = await res.json();
    const report = data.find(r => String(r.id) === String(reportId));

    if (!report) {
      alert("Laporan tidak ditemukan!");
      return;
    }

    console.log("✅ Laporan ditemukan:", report);

    // Fungsi bantu isi teks dan gambar
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = value && value !== "null" && value.trim() !== "" ? value : "-";
      } else {
        console.warn(`Elemen ${id} tidak ditemukan`);
      }
    };

    const setImage = (id, src) => {
      const el = document.getElementById(id);
      if (el) {
        if (src && src !== "null" && src.trim() !== "") {
          el.src = src;
          el.style.display = "block";
        } else {
          el.src = "";
          el.style.display = "none";
        }
      } else {
        console.warn(`Elemen ${id} tidak ditemukan`);
      }
    };

    // === Data Pelapor ===
    setText("report-nama", report.nama_user);
    setText("report-nik", report.nik);
    setText("report-email", report.email || "-");
    setText("report-telepon", report.no_hp);
    setText("report-saksi", report.saksi_1);

    // === Data Kecelakaan ===
    setText("report-jenis", report.jenis_kecelakaan);
    setText("report-kendaraan", report.kendaraan);
    setText("report-jumlah-korban", report.jumlah_korban);
    setText("report-titik", report.alamat);
    setText("report-tanggal", report.tanggal);
    setText("report-status", report.status);
    setImage("report-bukti", Array.isArray(report.foto) ? report.foto[0] : report.foto);
    setText("report-kronologi", report.kronologi);

    // === Data Petugas ===
    console.log("👮 Petugas:", report.petugas);
    console.log("📸 Bukti selesai:", report.bukti_selesai);
    console.log("📝 Keterangan selesai:", report.keterangan_selesai);

    setText("report-petugas", report.petugas);
    setImage("report-foto-petugas", report.bukti_selesai);
    setText("report-keterangan", report.keterangan_selesai);

    // Tombol Tutup saja
    const buttonContainer = document.querySelector(".report-buttons");
    if (buttonContainer) {
      buttonContainer.innerHTML = `<button class="btn cancel-btn" onclick="closeModal()">Tutup</button>`;
    }

    document.getElementById("report-modal").style.display = "block";

  } catch (error) {
    console.error("❌ Error membuka laporan:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchLaporanMasuk();
  setupTrackingFilters();
  renderTracking("all");
});

// Fungsi untuk menyimpan petugas dan memperbarui status
function savePetugas(reportId) {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    const petugas = document.getElementById('report-petugas').value.trim();
    if (!petugas && report.status === 'Diterima') {
        alert('Petugas harus diisi sebelum menyimpan!');
        return;
    }

    report.petugas = petugas;
    if (report.status === 'Diterima' && petugas) {
        report.status = 'Proses'; // Ubah status ke Proses jika petugas diisi
    }

    localStorage.setItem('reports', JSON.stringify(reports));
    alert('Petugas diperbarui.');
    closeModal();
    renderTracking(getCurrentCategory());
}

// Fungsi untuk memperbarui status laporan
function updateStatus(reportId, newStatus) {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    report.status = newStatus;
    localStorage.setItem('reports', JSON.stringify(reports));
    alert(`Status laporan diperbarui menjadi ${newStatus}.`);
    closeModal();
    const category = getCurrentCategory();
    renderTracking(category === 'all' ? newStatus === 'Ditolak' ? 'rejected' : 'accepted' : category);
}

// Fungsi untuk merender tabel tracking berdasarkan kategori
// --- Tracking ---
function filterCategory(category) {
    currentPage = 1;
    currentTrackingCategory = category;

    // Ubah tombol aktif
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
    const activeCard = document.querySelector(`.category-card[data-category="${category}"]`);
    if (activeCard) activeCard.classList.add('active');

    // Filter data sesuai kategori
    switch (category) {
        case 'all':
            filteredTrackingReports = reports.filter(r =>
                r.status !== "Masuk" &&
                matchesDate(r.tanggal, selectedYear, selectedMonth)
            );
            break;
        case 'accepted':
            filteredTrackingReports = reports.filter(r =>
                r.status === "Diterima" &&
                matchesDate(r.tanggal, selectedYear, selectedMonth)
            );
            break;
        case 'handling':
            filteredTrackingReports = reports.filter(r =>
                r.status === "Proses" &&
                matchesDate(r.tanggal, selectedYear, selectedMonth)
            );
            break;
        case 'received':
            filteredTrackingReports = reports.filter(r =>
                r.status === "Selesai" &&
                matchesDate(r.tanggal, selectedYear, selectedMonth)
            );
            break;
        case 'rejected':
            filteredTrackingReports = reports.filter(r =>
                r.status === "Ditolak" &&
                matchesDate(r.tanggal, selectedYear, selectedMonth)
            );
            break;
    }

    renderTrackingTable(filteredTrackingReports, category);
}

function downloadFilteredTracking(category) {
    let filtered = reports.filter(r => {
        if (category === 'all' && r.status !== "Masuk") return false;
        if (category === 'accepted' && r.status !== "Diterima") return false;
        if (category === 'handling' && r.status !== "Proses") return false;
        if (category === 'received' && r.status !== "Selesai") return false;
        if (category === 'rejected' && r.status !== "Ditolak") return false;
        return matchesDate(r.tanggal, selectedYear, selectedMonth);
    });

    if (filtered.length === 0) {
        alert("Tidak ada data untuk diunduh pada filter ini.");
        return;
    }

    const wb = XLSX.utils.book_new();
    const wsData = [
        ["ID", "Nama", "Tanggal", "Jenis", "Kendaraan", "Jumlah Korban", "Titik", "Kronologi", "Status"]
    ];
    filtered.forEach(r => {
        wsData.push([
            r.id, r.nama, r.tanggal, r.jenis, r.kendaraan, r.jumlahKorban, r.titik, r.kronologi, r.status
        ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "TrackingLaporan");
    const filename = `Tracking_${category}_${selectedYear}_${selectedMonth}.xlsx`;
    XLSX.writeFile(wb, filename);
}

function renderTrackingTable(data, category = 'all') {
    const tbody = document.getElementById('tracking-table-body');
    const statsContainer = document.querySelector('#tracking-section .stats-cards');
    tbody.innerHTML = '';

    // Kosongkan tampilan tabel bila tidak ada data
    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;">Laporan tidak ditemukan.</td></tr>`;
    } else {
        const start = (currentPage - 1) * reportsPerPage;
        const end = start + reportsPerPage;
        const pageData = data.slice(start, end);

        tbody.innerHTML = pageData.map(report => `
            <tr>
                <td>${escapeHTML(report.id.toString())}</td>
                <td>${escapeHTML(report.nama)}</td>
                <td>${escapeHTML(report.tanggal)}</td>
                <td>${escapeHTML(report.jenis)}</td>
                <td>${escapeHTML(report.kendaraan)}</td>
                <td>${escapeHTML(report.jumlahKorban)}</td>
                <td>${escapeHTML(report.titik)}</td>
                <td>${escapeHTML(report.kronologi.length > 40 ? report.kronologi.substring(0, 40) + '...' : report.kronologi)}</td>
                <td>
                    <button class="btn-detail" onclick="openTrackingModal(${report.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="#375B85" viewBox="0 0 16 16">
                            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                        </svg>
                    </button>
                </td>
                <td><span class="report-status ${report.status.toLowerCase()}">${escapeHTML(report.status)}</span></td>
            </tr>
        `).join('');
    }

    // === UBAH STATISTIK SESUAI FILTER AKTIF ===
    const count = data.length;
    let statsHTML = "";

    if (category === "all") {
        // Tampilkan semua
        const total = reports.length;
        const diterima = reports.filter(r => r.status === "Diterima").length;
        const proses = reports.filter(r => r.status === "Proses").length;
        const selesai = reports.filter(r => r.status === "Selesai").length;
        const ditolak = reports.filter(r => r.status === "Ditolak").length;

        statsHTML = `
            <div class="stats-card blue1"><h4>Total Laporan</h4><p>${total}</p></div>
            <div class="stats-card blue2"><h4>Laporan Diterima</h4><p>${diterima}</p></div>
            <div class="stats-card blue3"><h4>Penanganan Laporan</h4><p>${proses}</p></div>
            <div class="stats-card blue4"><h4>Laporan Selesai</h4><p>${selesai}</p></div>
            <div class="stats-card blue5"><h4>Laporan Ditolak</h4><p>${ditolak}</p></div>`;
    } else if (category === "accepted") {
        statsHTML = `<div class="stats-card blue2"><h4>Laporan Diterima</h4><p>${count}</p></div>`;
    } else if (category === "handling") {
        statsHTML = `<div class="stats-card blue3"><h4>Penanganan Laporan</h4><p>${count}</p></div>`;
    } else if (category === "received") {
        statsHTML = `<div class="stats-card blue4"><h4>Laporan Selesai</h4><p>${count}</p></div>`;
    } else if (category === "rejected") {
        statsHTML = `<div class="stats-card blue5"><h4>Laporan Ditolak</h4><p>${count}</p></div>`;
    }

    // Tampilkan hanya stats sesuai filter aktif
    if (statsContainer) statsContainer.innerHTML = statsHTML;

    // Pagination
    renderTrackingPagination(data.length);

    // Jika ada laporan yang perlu dibuka otomatis
    if (openReportOnLoadId !== null) {
        const id = openReportOnLoadId;
        openReportOnLoadId = null;
        setTimeout(() => openTrackingModal(id), 200);
    }
}

// Fungsi untuk mendapatkan kategori saat ini
function getCurrentCategory() {
    const active = document.querySelector('.category-card.active');
    return active ? active.getAttribute('data-category') : 'all';
}

// Inisialisasi filter kategori saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    fetchLaporanMasuk();
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
  const totalPages = Math.ceil(totalReports / reportsPerPage);
  const groupSize = 3;
  const paginationContainer = document.querySelector("#tracking-section .pagination");

  // Pastikan tombol ada di HTML
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");

  if (!prevBtn || !nextBtn) return;

  // Hitung grup halaman aktif
  const currentGroup = Math.floor((currentPage - 1) / groupSize);
  const startPage = currentGroup * groupSize + 1;
  const endPage = Math.min(startPage + groupSize - 1, totalPages);

  // Hapus tombol angka lama
  paginationContainer.querySelectorAll(".page-number").forEach(btn => btn.remove());

  // Tambahkan 3 tombol angka di antara Prev dan Next
  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.classList.add("page-number");
    if (i === currentPage) btn.classList.add("active");
    btn.onclick = () => {
      currentPage = i;
      renderTrackingReports(); // tampilkan data
      renderTrackingPagination(totalReports); // perbarui pagination
    };
    nextBtn.parentNode.insertBefore(btn, nextBtn); // sisipkan sebelum tombol Next
  }

  // Event tombol Kembali
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderTrackingReports();
      renderTrackingPagination(totalReports);
    }
  };

  // Event tombol Lanjut
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTrackingReports();
      renderTrackingPagination(totalReports);
    }
  };
}
function closeModal() {
    const modal = document.getElementById('report-modal');
    if (modal) {
        modal.style.display = 'none';
        // Reset isi modal agar bersih saat dibuka lagi
        const buttonContainer = document.querySelector('.report-buttons');
        if (buttonContainer) buttonContainer.innerHTML = '';
        const petugasInput = document.getElementById('report-petugas');
        if (petugasInput) petugasInput.value = '';
    }
}
function updatePetugas(reportId) {
    try {
        const report = reports.find(r => r.id === reportId);
        if (!report) {
            alert('Laporan tidak ditemukan!');
            return;
        }
    } catch (e) {
        console.error('Error updating petugas:', e);
        showErrorBoundary('Gagal menyimpan petugas: ' + e.message);
    }
}

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

async function downloadReportPDF(reportId) {
  try {
    if (typeof jspdf === 'undefined') {
      alert('jsPDF belum dimuat.');
      return;
    }

    const { jsPDF } = window.jspdf;

    // --- Ambil semua data laporan ---
    const res = await fetch(`https://dragonmontainapi.com/riwayat_laporan.php?user=1`);
    const result = await res.json();

    // Pastikan ambil dari result.data jika formatnya seperti { status: true, data: [...] }
    const allReports = Array.isArray(result) ? result : result.data;
    if (!Array.isArray(allReports)) {
      alert('Data laporan tidak valid.');
      return;
    }

    // --- Cari laporan berdasarkan ID ---
    const report = allReports.find(r => String(r.id) === String(reportId));
    if (!report) {
      alert('Laporan tidak ditemukan.');
      console.log("ID tidak ditemukan:", reportId);
      console.log("Semua laporan:", allReports);
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
        const imgUrl = report.foto[i].startsWith('http') ? report.foto[i] : `https://dragonmontainapi.com/foto/${report.foto[i]}`;
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

    // --- Footer ---
    doc.setFontSize(10);
    doc.text(`Halaman 1 dari 1`, 260, 820);

    doc.save(`Laporan_${report.nama_user}_${report.id}.pdf`);

  } catch (e) {
    console.error("Error download PDF:", e);
    alert("Gagal mengunduh PDF: " + e.message);
  }
}

// --- Fungsi untuk ambil gambar sebagai Base64 ---
async function loadImageAsDataURL(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('.modal');
        if (modal) closeModal(modal.id);
    });
});


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
        const kasusProses = reports.filter(r => r.status === 'Proses').length;
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

// Tambahkan fungsi renderNotifications() di pimpinan.js jika belum ada
function renderNotifications() {
    try {
        const notificationList = document.getElementById('notification-list');
        if (!notificationList) return;

        const recentReports = [...reports]
            .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
            .slice(0, 5);

        notificationList.innerHTML = recentReports.map(report => `
            <div class="notification-item">
                <span class="status-indicator ${report.received ? 'read' : 'unread'}"></span>
                <div class="details">
                    <span class="name">${escapeHTML(report.nama)}</span>
                    <span class="titik-laporan">${escapeHTML(report.titik?.length > 40 ? report.titik.substring(0, 40) + '...' : report.titik || '-')}</span>
                    <span class="date">${escapeHTML(report.tanggal)}</span>
                    <button class="action-btn" onclick="navigateToLaporanMasuk(${report.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="#ffffff" viewBox="0 0 16 16">
                            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error('Error rendering notifications:', e);
        showErrorBoundary('Gagal memuat notifikasi: ' + e.message);
    }
}


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

        // Beri sedikit delay agar render selesai sebelum buka modal
        setTimeout(() => {
            openReportModal(reportId);
        }, 200);
    } catch (e) {
        console.error('Error navigating to laporan masuk:', e);
        showErrorBoundary('Gagal membuka laporan masuk: ' + e.message);
    }
}

function openTrackingFromHome(reportId) {
    openReportOnLoadId = reportId;
    // Aktifkan navigasi ke section pelacakan
    const navTracking = document.querySelector('[data-section="tracking-section"]');
    if (navTracking) navTracking.click();
}

// Navigasi ke Tracking Laporan dan buka detail
function goToTrackingAndOpenDetail(reportId) {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(nav => nav.classList.remove('active'));
    sections.forEach(sec => sec.classList.remove('active'));

    const trackingSection = document.getElementById('tracking-section');
    const trackingNavItem = document.querySelector('[data-section="tracking-section"]');

    if (trackingSection && trackingNavItem) {
        trackingSection.classList.add('active');
        trackingNavItem.classList.add('active');

        openReportOnLoadId = reportId; // ⬅️ simpan ID di global
        renderTracking('all'); // ⬅️ render ulang tracking
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
                <button class="more-about-btn" onclick="openEvaluasiModal(${evaluasi.id})">Detail</button>
            </div>
        `).join('');
    } catch (e) {
        console.error('Error rendering evaluasi cards:', e);
        showErrorBoundary('Gagal memuat kartu evaluasi: ' + e.message);
    }
}

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

        // Isi data ke dalam input
        document.getElementById('evaluasi-title').value = evaluasi.title;
        document.getElementById('evaluasi-description').value = evaluasi.description;
        document.getElementById('evaluasi-period').value = evaluasi.period;

        // Jadikan semua input hanya baca
        document.getElementById('evaluasi-title').readOnly = true;
        document.getElementById('evaluasi-description').readOnly = true;
        document.getElementById('evaluasi-period').readOnly = true;

        // Sembunyikan tombol simpan/edit jika ada


        const cancelBtn = document.getElementById('cancel-evaluasi-btn');
        if (cancelBtn) cancelBtn.onclick = () => closeModal('evaluasi-modal');

        modal.style.display = 'flex';
    } catch (e) {
        console.error('Error opening evaluasi modal:', e);
        showErrorBoundary('Gagal membuka modal evaluasi: ' + e.message);
    }
}

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
    }
}
document.getElementById('tracking-search')?.addEventListener('input', searchTrackingReports);
function searchTrackingReports() {
    try {
        const searchInput = document.getElementById('tracking-search')?.value.trim().toLowerCase();
        const category = getCurrentCategory(); // e.g., 'all', 'accepted', etc.
        let baseReports = [];

        switch (category) {
            case 'all':
                baseReports = reports.filter(r => r.status === "Masuk");
                break;
            case 'accepted':
                baseReports = reports.filter(r => r.status === "Diterima");
                break;
            case 'handling':
                baseReports = reports.filter(r => r.status === "Proses");
                break;
            case 'received':
                baseReports = reports.filter(r => r.status === "Selesai");
                break;
            case 'rejected':
                baseReports = reports.filter(r => r.status === "Ditolak");
                break;
        }

        filteredTrackingReports = baseReports.filter(r =>
            matchesDate(r.tanggal, selectedYear, selectedMonth) &&
            (r.nama.toLowerCase().includes(searchInput) || r.id.toString().includes(searchInput))
        );

        currentPage = 1;
        renderTrackingTable(filteredTrackingReports);
    } catch (e) {
        console.error('Error searching tracking reports:', e);
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
let isPimpinan = true; // Sesuaikan dari login session

// ==================== DETAIL LAPORAN (PIMPINAN - READ ONLY) ====================
// ==================== DETAIL LAPORAN (PIMPINAN - READ ONLY) ====================
function openTrackingModal(reportId) {
  try {
    const report = reports.find(r => r.id == reportId);
    if (!report) {
      alert("Laporan tidak ditemukan!");
      return;
    }

    console.log("Data laporan detail:", report); // Debugging

    const modal = document.getElementById("report-modal");
    if (!modal) {
      console.warn("Elemen modal tidak ditemukan!");
      return;
    }

    // === Data pelapor & kecelakaan utama ===
    document.getElementById("report-nama").textContent = report.nama || "-";
    document.getElementById("report-nik").textContent = report.nik || "-";
    document.getElementById("report-email").textContent = report.email || "-";
    document.getElementById("report-telepon").textContent = report.telepon || "-";
    document.getElementById("report-saksi").textContent = report.saksi || "-";
    document.getElementById("report-jenis").textContent = report.jenis || "-";
    document.getElementById("report-kendaraan").textContent = report.kendaraan || "-";
    document.getElementById("report-jumlah-korban").textContent = report.jumlahKorban || "-";
    document.getElementById("report-titik").textContent = report.titik || "-";
    document.getElementById("report-tanggal").textContent = report.tanggal || "-";
    document.getElementById("report-status").textContent = report.status || "-";
    document.getElementById("report-kronologi").textContent = report.kronologi || "-";

    // === Bukti kecelakaan utama ===
    const buktiImg = document.getElementById("report-bukti");
    if (buktiImg) {
      if (report.bukti && report.bukti !== "null" && report.bukti !== "") {
        buktiImg.src = report.bukti;
        buktiImg.style.display = "block";
        buktiImg.onclick = () => window.open(report.bukti, "_blank");
      } else {
        buktiImg.src = "";
        buktiImg.style.display = "none";
      }
    }

    // === Data petugas (read-only) ===
    const petugasField = document.getElementById("report-petugas");
    if (petugasField) {
      petugasField.textContent = report.petugas || report.namaPetugas || "-";
    }

    // === Bukti selesai (read-only) ===
    const fotoPetugas = document.getElementById("report-foto-petugas");
    if (fotoPetugas) {
    const possibleBuktiFields = [
        report.buktiSelesai,
        report.bukti_selesai,
        report.fotoPetugas,
        report.foto_petugas,
        report.fotoSelesai,
        report.buktiPenugasan,
        report.bukti_penugasan
    ];

    // Cari field pertama yang punya nilai valid
    const buktiSelesai =
        possibleBuktiFields.find(
        b => b && b !== "null" && b !== ""
        ) || "";

    if (buktiSelesai) {
        fotoPetugas.src = buktiSelesai;
        fotoPetugas.style.display = "block";
        fotoPetugas.onclick = () => window.open(buktiSelesai, "_blank");
    } else {
        fotoPetugas.src = "";
        fotoPetugas.style.display = "none";
    }
    }

    // === Keterangan Selesai (read-only) ===
    const keteranganElem = document.getElementById("report-keterangan");
    if (keteranganElem) {
    const possibleKeteranganFields = [
        report.keteranganSelesai,
        report.keterangan_selesai,
        report.keteranganPetugas,
        report.keterangan_petugas,
        report.catatanSelesai,
        report.catatan_selesai,
        report.deskripsiSelesai,
        report.deskripsi_selesai
    ];

    // Cari field yang valid
    const keterangan =
        possibleKeteranganFields.find(
        k => k && k !== "null" && k.trim() !== ""
        ) || "-";

    keteranganElem.textContent = keterangan;
    }

    // === Tampilkan modal ===
    modal.style.display = "block";
  } catch (err) {
    console.error("Gagal membuka detail laporan:", err);
    alert("Terjadi kesalahan saat membuka detail laporan.");
  }
}

document.querySelector("#evaluasi-modal .modal-close").onclick = function () {
    document.getElementById("evaluasi-modal").style.display = "none";
};
document.getElementById("cancel-evaluasi-btn").onclick = function () {
    document.getElementById("evaluasi-modal").style.display = "none";
};

function renderTracking(category = 'all', filteredReports = null) {
    try {
        const trackingTableBody = document.getElementById('tracking-table-body');
        if (!trackingTableBody) {
            console.warn('Tracking table body not found');
            return;
        }

        const totalReports = reports.length;

        // Gunakan filteredReports jika ada, jika tidak gunakan semua laporan
        let displayReports = filteredReports || reports;
        // Urutkan laporan agar yang terbaru tampil di atas
        displayReports.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

        // Terapkan filter kategori jika bukan hasil pencarian
        if (!filteredReports) {
            if (category === 'accepted') {
                displayReports = displayReports.filter(r => r.status === 'Diterima');
            } else if (category === 'handling') {
                displayReports = displayReports.filter(r => r.status === 'Proses');
            } else if (category === 'received') {
                displayReports = displayReports.filter(r => r.status === 'Selesai');
            } else if (category === 'rejected') {
                displayReports = displayReports.filter(r => r.status === 'Ditolak');
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

        // Update statistik
        document.getElementById('total-reports').textContent = totalReports;
        document.getElementById('accepted-reports-count').textContent = reports.filter(r => r.status === 'Diterima').length;
        document.getElementById('handling-reports-count').textContent = reports.filter(r => r.status === 'Proses').length;
        document.getElementById('received-data-count').textContent = reports.filter(r => r.status === 'Selesai').length;
        document.getElementById('rejected-reports-count').textContent = reports.filter(r => r.status === 'Ditolak').length;

        // Update pagination
        updatePagination(displayReports.length);
    } catch (e) {
        console.error('Error rendering tracking data:', e);
        showErrorBoundary('Gagal memuat data tracking: ' + e.message);
    }
}
function renderTrackingPagination(totalReports) {
    const container = document.querySelector("#tracking-section .pagination");
    if (!container) return;

    container.innerHTML = '';
    const totalPages = Math.ceil(totalReports / reportsPerPage);

    const prevBtn = document.createElement('button');
    prevBtn.textContent = "Previous";
    prevBtn.disabled = currentPage === 1;
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
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => nextPage(totalReports, true);
    container.appendChild(nextBtn);
}

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

function filterReports() {
    try {
        const year = document.getElementById('year-filter')?.value;
        const month = document.getElementById('month-filter')?.value;
        let filteredReports = reports.filter(report => report.status === 'Masuk');

        if (year !== 'all') {
            filteredReports = filteredReports.filter(report => {
                const reportYear = new Date(report.tanggal).getFullYear();
                return reportYear === parseInt(year);
            });
        }
        if (month !== 'all') {
            filteredReports = filteredReports.filter(report => {
                const reportMonth = (new Date(report.tanggal).getMonth() + 1).toString().padStart(2, '0');
                return reportMonth === month;
            });
        }

        currentPage = 1;
        renderReportList(filteredReports);
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

//fitur download laporan masuk
function downloadFilteredReports() {
    try {
        if (typeof XLSX === 'undefined') {
            throw new Error('SheetJS is not loaded');
        }

        const year = document.getElementById('year-filter')?.value || 'all';
        const month = document.getElementById('month-filter')?.value || 'all';

        // Filter awal: hanya laporan masuk
        let filteredReports = reports.filter(r => {
            const statusStr = String(r.status).toLowerCase();
            return statusStr === '0' || statusStr === 'terkirim' || statusStr.includes('masuk');
        });

        // Filter tahun
        if (year !== 'all') {
            filteredReports = filteredReports.filter(report => {
                const reportYear = new Date(report.tanggal).getFullYear().toString();
                return reportYear === year;
            });
        }

        // Filter bulan
        if (month !== 'all') {
            filteredReports = filteredReports.filter(report => {
                const reportMonth = new Date(report.tanggal).toLocaleString('id-ID', { month: 'long' });
                return reportMonth.toLowerCase() === month.toLowerCase();
            });
        }

        if (filteredReports.length === 0) {
            alert('Tidak ada data laporan masuk yang sesuai filter untuk diunduh.');
            return;
        }

        // Data lengkap laporan masuk
        const data = filteredReports.map(report => ({
            ID: report.id,
            Nama: report.nama,
            NIK: report.nik,
            Email: report.email,
            Telepon: report.telepon,
            Saksi: report.saksi,
            Titik: report.titik,
            Kendaraan: report.kendaraan,
            Jenis: report.jenis,
            'Jumlah Korban': report.jumlahKorban,
            Tanggal: report.tanggal,
            Status: report.status,
            Petugas: report.petugas || '-',
            Kronologi: report.kronologi || '-'
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);

        // Lebar kolom otomatis biar rapi
        worksheet['!cols'] = Object.keys(data[0]).map(key => ({
            wch: Math.max(
                key.length,
                ...data.map(row => String(row[key] || '').length)
            ) + 2
        }));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Masuk');

        const filename = `laporan-masuk-${year}${month !== 'all' ? '-' + month : ''}.xlsx`;
        XLSX.writeFile(workbook, filename);

    } catch (e) {
        console.error('Error downloading filtered reports:', e);
        showErrorBoundary('Gagal mengunduh laporan masuk: ' + e.message);
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
function updateTrackingStats(data) {
    const accepted = data.filter(r => r.status === 'Diterima').length;
    const handling = data.filter(r => r.status === 'Proses').length;
    const received = data.filter(r => r.status === 'Selesai').length;
    const rejected = data.filter(r => r.status === 'Ditolak').length;

    document.getElementById('total-reports').textContent = data.length;
    document.getElementById('accepted-reports-count').textContent = accepted;
    document.getElementById('handling-reports-count').textContent = handling;
    document.getElementById('received-data-count').textContent = received;
    document.getElementById('rejected-reports-count').textContent = rejected;
}


// Fungsi untuk menerapkan semua filter (tahun, bulan, kategori, dan pencarian)
function applyFilters() {
    const year = document.getElementById("tracking-filter-year").value;
    const month = document.getElementById("tracking-filter-month").value;
    const searchQuery = document.getElementById("tracking-search").value.toLowerCase();

    let filteredReports = trackingData;

    if (year !== "all") {
        filteredReports = filteredReports.filter(report => {
            const reportYear = new Date(report.tanggal).getFullYear().toString();
            return reportYear === year;
        });
    }

    if (month !== "all") {
        const monthNames = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const monthIndex = monthNames.indexOf(month); // index: 0–11

        filteredReports = filteredReports.filter(report => {
            const reportMonth = new Date(report.tanggal).getMonth(); // 0–11
            return reportMonth === monthIndex;
        });
    }

    // Filter pencarian
    if (searchQuery) {
        filteredReports = filteredReports.filter(report =>
            report.id.toString().includes(searchQuery) ||
            report.nama.toLowerCase().includes(searchQuery)
        );
    }

    currentPage = 1;
    renderTracking(currentCategory, filteredReports);
    updateStats(filteredReports);
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
function renderTracking(category) {
    filterCategory(category);
}

document.addEventListener('DOMContentLoaded', () => {
    setupTrackingFilters();
    renderTracking('all'); // Default ke All Report
});

// Fungsi untuk melihat detail laporan (placeholder)
function viewDetail(id) {
    console.log("View detail for report ID:", id);
}

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    applyFilters();
});

// Modifikasi initializeAdminPage
initializeAdminPage = (function(original) {
    return function() {
        original();
        setupTrackingFilters();
        closeAllModals(); // Pastikan semua modal ditutup
    };
})(initializeAdminPage);
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

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeAdminPage();
        renderStats();
        renderNotifications();
        renderEvaluasiCards();
    } catch (e) {
        console.error('Error during page initialization:', e);
        showErrorBoundary('Gagal menginisialisasi halaman: ' + e.message);
    }
});
window.onbeforeunload = null;
document.addEventListener("DOMContentLoaded", () => {
  const yearFilter = document.getElementById("year-filter");
  const monthFilter = document.getElementById("month-filter");

  if (yearFilter && monthFilter) {
    yearFilter.addEventListener("change", () => {
      const year = yearFilter.value;
      const month = convertMonthNameToNumber(monthFilter.value);
      setFilter(year, month);
    });

    monthFilter.addEventListener("change", () => {
      const year = yearFilter.value;
      const month = convertMonthNameToNumber(monthFilter.value);
      setFilter(year, month);
    });
  }
});

function convertMonthNameToNumber(name) {
  const months = {
    "Januari": "01",
    "Februari": "02",
    "Maret": "03",
    "April": "04",
    "Mei": "05",
    "Juni": "06",
    "Juli": "07",
    "Agustus": "08",
    "September": "09",
    "Oktober": "10",
    "November": "11",
    "Desember": "12",
    "Semua": "all",
    "all": "all"
  };
  return months[name] || "all";
}
