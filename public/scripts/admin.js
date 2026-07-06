/* =========================================================================
   SCRIPT ADMIN LAPORLAKA — VERSI LOKAL (OFFLINE)
   -------------------------------------------------------------------------
   Semua panggilan fetch() ke server (dragonmontainapi.com) sudah dihapus.
   Data sekarang disimpan di memori + localStorage, sehingga web ini bisa
   dibuka dan dicoba tanpa koneksi internet / server backend.

   5 CONTOH TITIK LAPORAN sudah disiapkan di variabel SAMPLE_REPORTS di
   bawah, lengkap dengan koordinat (lat/long) di sekitar Bogor, supaya
   peta, tabel "Laporan Masuk", "Pelacakan Laporan", dan statistik di
   halaman Beranda langsung terisi contoh data.
   ========================================================================= */

function escapeHTML(str) {
    if (str == null || typeof str !== 'string') return '';
    const htmlEntities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
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

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Gagal menyimpan ${key} ke localStorage:`, e);
        alert(`Gagal menyimpan data: ${e.message}`);
    }
}

const dependencies = [
    typeof Chart !== 'undefined' ? true : 'Chart.js',
    typeof XLSX !== 'undefined' ? true : 'SheetJS',
    typeof jspdf !== 'undefined' ? true : 'jsPDF',
    typeof L !== 'undefined' ? true : 'Leaflet'
].filter(dep => dep !== true);
if (dependencies.length > 0) console.warn('Missing dependencies:', dependencies.join(', '));


/* =========================================================================
   1. DATA CONTOH (5 TITIK LAPORAN) — INI YANG DIPAKAI SEBAGAI "DATABASE LOKAL"
   ========================================================================= */

const SAMPLE_REPORTS = [
    {
        id: 1001,
        nama: "Budi Santoso",
        nik: "3271011005900001",
        email: "budi.santoso@example.com",
        no_hp: "081234500001",
        tanggal: "2023-05-10 08:30",
        status: "Masuk",
        titik: "Jl. Pajajaran, Bogor Tengah",
        lat: -6.5971,
        long: 106.7972,
        bukti: "",
        saksi: "Andi Wijaya",
        petugas: "",
        received: false,
        kendaraan: "Motor vs Motor",
        jenis: "Tabrakan Ringan",
        jumlahKorban: "2",
        kronologi: "Dua sepeda motor bersenggolan saat menyalip di tikungan Jl. Pajajaran, kedua pengendara mengalami luka ringan.",
        bukti_selesai: "",
        keterangan_selesai: ""
    },
    {
        id: 1002,
        nama: "Siti Aminah",
        nik: "3271012201880002",
        email: "siti.aminah@example.com",
        no_hp: "081234500002",
        tanggal: "2023-05-18 14:10",
        status: "Diterima",
        titik: "Jl. Jenderal Sudirman, Bogor Tengah",
        lat: -6.5944,
        long: 106.7890,
        bukti: "",
        saksi: "Rina Marlina",
        petugas: "Ahmad Fauzi",
        received: true,
        kendaraan: "Mobil vs Motor",
        jenis: "Tabrakan Sedang",
        jumlahKorban: "1",
        kronologi: "Mobil menyerempet motor yang berhenti mendadak di lampu merah, pengendara motor mengalami luka di bagian kaki.",
        bukti_selesai: "",
        keterangan_selesai: ""
    },
    {
        id: 1003,
        nama: "Rudi Hartono",
        nik: "3271013006870003",
        email: "rudi.hartono@example.com",
        no_hp: "081234500003",
        tanggal: "2023-06-02 19:45",
        status: "Penanganan",
        titik: "Jl. Raya Tajur, Bogor Timur",
        lat: -6.6210,
        long: 106.8125,
        bukti: "",
        saksi: "Dedi Kurniawan",
        petugas: "Bambang Wijaya",
        received: true,
        kendaraan: "Kendaraan Tunggal",
        jenis: "Kecelakaan Tunggal",
        jumlahKorban: "1",
        kronologi: "Pengendara motor kehilangan kendali dan menabrak pembatas jalan akibat jalan licin, sedang ditangani petugas.",
        bukti_selesai: "",
        keterangan_selesai: "Sedang menunggu hasil pemeriksaan di lokasi."
    },
    {
        id: 1004,
        nama: "Dewi Lestari",
        nik: "3271014503920004",
        email: "dewi.lestari@example.com",
        no_hp: "081234500004",
        tanggal: "2023-06-20 07:15",
        status: "Selesai",
        titik: "Jl. Raya Dramaga, Bogor Barat",
        lat: -6.5580,
        long: 106.7300,
        bukti: "",
        saksi: "Fajar Nugraha",
        petugas: "Citra Ayu",
        received: true,
        kendaraan: "Mobil vs Mobil",
        jenis: "Tabrakan Beruntun",
        jumlahKorban: "3",
        kronologi: "Tiga kendaraan terlibat tabrakan beruntun akibat pengereman mendadak, seluruh korban telah dievakuasi dan ditangani.",
        bukti_selesai: "",
        keterangan_selesai: "Kasus selesai ditangani pada 20-06-2026 pukul 09:00, seluruh korban sudah mendapat perawatan."
    },
    {
        id: 1005,
        nama: "Fajar Nugraha",
        nik: "3271015812950005",
        email: "fajar.nugraha@example.com",
        no_hp: "081234500005",
        tanggal: "2023-06-28 16:00",
        status: "Ditolak",
        titik: "Jl. Baru Ciawi, Bogor Selatan",
        lat: -6.6470,
        long: 106.8323,
        bukti: "",
        saksi: "-",
        petugas: "",
        received: false,
        kendaraan: "-",
        jenis: "Laporan Duplikat",
        jumlahKorban: "0",
        kronologi: "Laporan merupakan duplikat dari laporan lain yang sudah masuk sebelumnya.",
        bukti_selesai: "",
        keterangan_selesai: "Ditolak karena duplikat laporan ID 1002."
    }
];

const SAMPLE_PETUGAS = [
    { id: "P001", nama: "Ahmad Fauzi", email: "ahmad.fauzi@example.com", no_hp: "081234511001", nik: "3271010101880011", kategori: "2", unit: "Polsek Bogor Tengah" },
    { id: "P002", nama: "Bambang Wijaya", email: "bambang.wijaya@example.com", no_hp: "081234511002", nik: "3271010101870012", kategori: "2", unit: "Polsek Bogor Timur" },
    { id: "P003", nama: "Citra Ayu", email: "citra.ayu@example.com", no_hp: "081234511003", nik: "3271010101900013", kategori: "2", unit: "Polsek Bogor Barat" }
];

const SAMPLE_USERS = [
    { id: "U001", nama: "Admin Utama", email: "admin@example.com", no_hp: "081234500000", nik: "3271010101800000", kategori: "1" },
    ...SAMPLE_PETUGAS,
    { id: "U005", nama: "Warga Pelapor", email: "warga@example.com", no_hp: "081234599999", nik: "3271019999999999", kategori: "4" }
];

function validateReportsData(data) {
    return Array.isArray(data) && data.every(report =>
        typeof report.id !== 'undefined' &&
        typeof report.nama === 'string' &&
        typeof report.tanggal === 'string' &&
        typeof report.status === 'string'
    );
}

// "reports" adalah database lokal utama. Diisi dari localStorage jika ada,
// jika tidak ada (pertama kali dibuka) maka dipakai 5 contoh di atas.
let reports = validateStoredData('reports', SAMPLE_REPORTS, validateReportsData);

function persistReports() {
    saveToLocalStorage('reports', reports);
}

// Kalau localStorage kosong / rusak, pastikan tetap ada 5 contoh di awal.
if (!Array.isArray(reports) || reports.length === 0) {
    reports = JSON.parse(JSON.stringify(SAMPLE_REPORTS));
    persistReports();
}


/* =========================================================================
   2. LOGOUT
   ========================================================================= */

function handleLogout() {
    const existingModal = document.getElementById('logout-confirm-modal');
    const existingOverlay = document.getElementById('logout-overlay');
    if (existingModal) existingModal.remove();
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'logout-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:999;';

    const modal = document.createElement('div');
    modal.id = 'logout-confirm-modal';
    modal.style.cssText = `
        position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
        background:#ffffff;padding:32px 24px;border-radius:16px;z-index:1000;
        box-shadow:0 20px 40px rgba(0,0,0,0.2);text-align:center;max-width:350px;width:90%;
        transition:transform .3s ease, opacity .3s ease;
    `;
    modal.innerHTML = `
        <h3 style="margin-bottom:12px;font-size:22px;font-weight:bold;color:#000;">Konfirmasi Keluar</h3>
        <p style="margin-bottom:24px;font-size:15px;color:#555;">Apakah Anda yakin ingin keluar dari akun?</p>
        <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">
            <button id="logout-cancel-btn" style="padding:10px 24px;border-radius:8px;background-color:#28a745;color:#fff;font-weight:500;border:none;cursor:pointer;">Batal</button>
            <button id="logout-yes-btn" style="padding:10px 24px;border-radius:8px;background-color:#e74c3c;color:#fff;font-weight:500;border:none;cursor:pointer;">Keluar</button>
        </div>
    `;
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    document.getElementById('logout-cancel-btn').addEventListener('click', () => { modal.remove(); overlay.remove(); });
    document.getElementById('logout-yes-btn').addEventListener('click', () => {
        modal.remove(); overlay.remove();
        setTimeout(() => { window.location.href = 'login.html'; }, 300);
    });
}


/* =========================================================================
   3. INISIALISASI HALAMAN ADMIN & NAVIGASI
   ========================================================================= */

function initializeAdminPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user') || 'admin';
    const usernameElement = document.getElementById('username');
    const sidebarTitle = document.querySelector('.sidebar-title');
    if (usernameElement && sidebarTitle) {
        usernameElement.textContent = escapeHTML(username);
        sidebarTitle.textContent = escapeHTML(username);
    }

    const sections = document.querySelectorAll('.content-section');
    const navItems = document.querySelectorAll('.nav-item');
    const homeSection = document.getElementById('home-section');
    const homeNavItem = document.querySelector('[data-section="home-section"]');

    if (homeSection && homeNavItem) {
        sections.forEach(section => section.classList.remove('active'));
        navItems.forEach(item => item.classList.remove('active'));
        homeSection.classList.add('active');
        homeNavItem.classList.add('active');
        renderStats();
        renderNotifications();
        renderEvaluasiCards();
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                const sectionId = item.getAttribute('data-section');
                const section = document.getElementById(sectionId);
                if (!section) throw new Error(`Section ${sectionId} not found`);

                sections.forEach(sec => sec.classList.remove('active'));
                section.classList.add('active');

                if (sectionId === 'monitoring-section') updateChart();
                else if (sectionId === 'laporan-masuk-section') loadLaporanMasuk();
                else if (sectionId === 'home-section') { renderStats(); renderNotifications(); renderEvaluasiCards(); }
                else if (sectionId === 'manage-pengguna-section') loadUsers();
                else if (sectionId === 'manage-petugas-section') { renderPetugas(); setupAddUserModal(); }
                else if (sectionId === 'tracking-section') renderTracking(getCurrentCategory());
                else if (sectionId === 'titik-laporan-section') { initMap(); toggleMapByYear(); }
            } catch (err) {
                console.error('Navigation error:', err);
                showErrorBoundary('Gagal memuat section: ' + err.message);
            }
        });
    });

    const profileIconHeader = document.getElementById('profile-icon-header');
    if (profileIconHeader) {
        profileIconHeader.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));
            const profileSection = document.getElementById('profil-section');
            if (profileSection) { profileSection.classList.add('active'); loadProfileData(); }
        });
    }

    const saveProfileBtn = document.getElementById('save-profile-btn');
    const cancelProfileBtn = document.getElementById('cancel-profile-btn');
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfile);
    if (cancelProfileBtn) cancelProfileBtn.addEventListener('click', cancelProfile);

    const yearSelect = document.getElementById('year-select');
    const monthSelect = document.getElementById('month-select');
    if (yearSelect) yearSelect.addEventListener('change', updateChart);
    if (monthSelect) monthSelect.addEventListener('change', updateChart);

    setupTrackingFilters();
    closeAllModals();
}

const sidebarProfileBtn = document.getElementById("sidebar-profile-btn");
if (sidebarProfileBtn) {
    sidebarProfileBtn.addEventListener("click", () => {
        document.querySelectorAll(".content-section").forEach(sec => sec.style.display = "none");
        const profilSection = document.getElementById("profil-section");
        if (profilSection) profilSection.style.display = "block";
        document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
        loadProfileData();
    });
}


/* =========================================================================
   4. PROFIL ADMIN (sudah lokal sejak awal, tidak berubah)
   ========================================================================= */

let originalProfileData = {
    nama: "admin", email: "admin@example.com", nik: "0000000000000000",
    jabatan: "Administrator", telepon: "081234567890", photo: null
};

function validateProfileData(data) {
    return data &&
        typeof data.nama === "string" && typeof data.email === "string" &&
        typeof data.nik === "string" && typeof data.jabatan === "string" &&
        typeof data.telepon === "string" && (data.photo === null || typeof data.photo === "string");
}

function loadProfileData() {
    try {
        let data = validateStoredData("profileData", originalProfileData, validateProfileData);
        document.getElementById("profil-username").value = data.nama || "";
        document.getElementById("profil-email").value = data.email || "";
        document.getElementById("profil-nik").value = data.nik || "";
        document.getElementById("profil-jabatan").value = data.jabatan || "";
        document.getElementById("profil-telepon").value = data.telepon || "";
        const usernameDisplay = document.getElementById("username");
        const sidebarTitle = document.querySelector(".sidebar-title");
        if (usernameDisplay) usernameDisplay.textContent = data.nama;
        if (sidebarTitle) sidebarTitle.textContent = data.nama;
    } catch (e) {
        console.error("Gagal memuat data profil:", e);
    }
}

function saveProfile() {
    try {
        const nama = document.getElementById("profil-username")?.value.trim();
        const email = document.getElementById("profil-email")?.value.trim();
        const nik = document.getElementById("profil-nik")?.value.trim();
        const jabatan = document.getElementById("profil-jabatan")?.value.trim();
        const telepon = document.getElementById("profil-telepon")?.value.trim();

        if (!nama || !email || !nik || !jabatan || !telepon) return alert("Semua field profil harus diisi!");
        if (!/^\S+@\S+\.\S+$/.test(email)) return alert("Email tidak valid!");
        if (!/^\d{16}$/.test(nik)) return alert("NIK harus 16 digit!");
        if (!/^\d{10,13}$/.test(telepon)) return alert("Nomor telepon harus 10–13 digit angka!");

        const updatedData = { nama, email, nik, jabatan, telepon };
        saveToLocalStorage("profileData", updatedData);
        originalProfileData = updatedData;
        alert("✅ Profil berhasil disimpan!");
        loadProfileData();
    } catch (e) {
        console.error("Error saat menyimpan profil:", e);
        alert("❌ Terjadi kesalahan saat menyimpan profil!");
    }
}

function cancelProfile() {
    const modal = document.getElementById('profil-section');
    if (modal) modal.style.display = 'none';
}

document.addEventListener("DOMContentLoaded", loadProfileData);


/* =========================================================================
   5. MONITORING (CHART) — sekarang dihitung dari data lokal `reports`
   ========================================================================= */

const canvas = document.getElementById("accident-chart");
const ctx = canvas ? canvas.getContext("2d") : null;
let monitoringChart = null;

const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

// Menghitung total laporan & total korban per bulan untuk tahun tertentu,
// diambil dari data lokal `reports` (bukan lagi fetch ke server).
function getMonitoringDataLocal(tahun) {
    const perBulan = Array.from({ length: 12 }, () => ({ total_laporan: 0, total_korban: 0 }));
    reports.forEach(r => {
        const d = new Date(r.tanggal);
        if (isNaN(d) || d.getFullYear().toString() !== tahun.toString()) return;
        const idx = d.getMonth();
        perBulan[idx].total_laporan += 1;
        perBulan[idx].total_korban += parseInt(r.jumlahKorban, 10) || 0;
    });
    return perBulan.map((item, i) => ({ bulan: i + 1, ...item }));
}

function renderBarChart(dataArr, tahun) {
    if (!ctx) return;
    const labels = monthNames.map(m => m.slice(0, 3));
    const totalLaporan = Array(12).fill(0);
    const totalKorban = Array(12).fill(0);
    dataArr.forEach(it => {
        const idx = (Number(it.bulan) || 1) - 1;
        totalLaporan[idx] = it.total_laporan ?? 0;
        totalKorban[idx] = it.total_korban ?? 0;
    });

    if (monitoringChart) monitoringChart.destroy();
    ctx.canvas.parentNode.style.width = "100%";
    ctx.canvas.parentNode.style.height = "400px";
    ctx.canvas.width = ctx.canvas.parentNode.offsetWidth;
    ctx.canvas.height = ctx.canvas.parentNode.offsetHeight;

    monitoringChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                { label: "Total Laporan", data: totalLaporan, backgroundColor: "rgba(54,162,235,0.7)" },
                { label: "Total Korban", data: totalKorban, backgroundColor: "rgba(246,53,95,0.7)" }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { title: { display: true, text: `Data Kecelakaan Tahun ${tahun}` }, legend: { position: "top" } },
            scales: { y: { beginAtZero: true, title: { display: true, text: "Jumlah" } } }
        }
    });
}

function renderPieChart(monthData, monthLabel, tahun) {
    if (!ctx) return;
    if (monitoringChart) monitoringChart.destroy();
    ctx.canvas.parentNode.style.width = "100%";
    ctx.canvas.parentNode.style.height = "400px";
    ctx.canvas.width = ctx.canvas.parentNode.offsetWidth;
    ctx.canvas.height = ctx.canvas.parentNode.offsetHeight;

    const labels = ["Total Laporan", "Total Korban"];
    const data = [monthData.total_laporan ?? 0, monthData.total_korban ?? 0];

    monitoringChart = new Chart(ctx, {
        type: "pie",
        data: { labels, datasets: [{ data, backgroundColor: ["rgba(54,162,235,0.7)", "rgba(246,53,95,0.7)"] }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { title: { display: true, text: `Distribusi ${monthLabel} ${tahun}` }, legend: { position: "top" } }
        }
    });
}

function updateChart() {
    const yearEl = document.getElementById("year-select");
    const monthEl = document.getElementById("month-select");
    if (!yearEl || !monthEl) return;
    const year = yearEl.value;
    const monthValue = monthEl.value;

    const dataArr = getMonitoringDataLocal(year);
    const hasData = dataArr.some(d => d.total_laporan > 0);

    if (!hasData) {
        if (monitoringChart) monitoringChart.destroy();
        const emptyData = Array(12).fill(0);
        monitoringChart = new Chart(ctx, {
            type: "bar",
            data: { labels: monthNames.map(m => m.slice(0, 3)), datasets: [{ label: "No Data", data: emptyData }] },
            options: { responsive: true, plugins: { title: { display: true, text: `Tidak ada data untuk ${year}` } } }
        });
        return;
    }

    if (monthValue === "all") {
        renderBarChart(dataArr, year);
    } else {
        const monthIndex = parseInt(monthValue, 10);
        const found = dataArr.find(d => Number(d.bulan) === monthIndex);
        const monthLabel = monthNames[monthIndex - 1] || monthValue;
        const monthData = found ?? { bulan: monthIndex, total_laporan: 0, total_korban: 0 };
        renderPieChart(monthData, monthLabel, year);
    }
}

document.getElementById("download-chart-btn")?.addEventListener("click", () => {
    if (!monitoringChart) return alert("Grafik belum dimuat.");
    const a = document.createElement("a");
    a.href = monitoringChart.toBase64Image();
    a.download = `grafik_kecelakaan_${document.getElementById("year-select").value}.png`;
    a.click();
});

document.getElementById("download-excel-btn")?.addEventListener("click", () => {
    if (!monitoringChart) return alert("Grafik belum dimuat.");
    const year = document.getElementById("year-select").value;
    const monthValue = document.getElementById("month-select").value;

    if (monthValue === "all") {
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
        let laporan = 0, korban = 0;
        if (monitoringChart.config.type === "pie") {
            const d = monitoringChart.data.datasets[0].data;
            laporan = Number(d[0] ?? 0);
            korban = Number(d[1] ?? 0);
        }
        const rows = [{ Bulan: monthLabel, Tahun: year, Total_Laporan: laporan, Total_Korban: korban }];
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `${monthLabel}_${year}`);
        XLSX.writeFile(wb, `Monitoring_${monthLabel}_${year}.xlsx`);
    }
});

document.getElementById("year-select")?.addEventListener("change", updateChart);
document.getElementById("month-select")?.addEventListener("change", updateChart);


/* =========================================================================
   6. LAPORAN MASUK / PELACAKAN — semua dari data lokal `reports`
   ========================================================================= */

let currentPage = 1;
const reportsPerPage = 15;
let currentTrackingCategory = 'all';
let selectedYear = 'all';
let selectedMonth = 'all';
let filteredReports = null;

function generateReportId() {
    const maxId = reports.reduce((m, r) => Math.max(m, Number(r.id) || 0), 1000);
    return maxId + 1;
}

function addReport(reportData) {
    try {
        const newReport = {
            id: generateReportId(),
            nama: reportData.nama || "",
            nik: reportData.nik || "",
            email: reportData.email || "",
            no_hp: reportData.telepon || reportData.no_hp || "",
            tanggal: reportData.tanggal || new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: reportData.status || "Masuk",
            titik: reportData.titik || "",
            lat: reportData.lat ?? null,
            long: reportData.long ?? null,
            bukti: reportData.bukti || "",
            saksi: reportData.saksi || "",
            petugas: reportData.petugas || "",
            received: reportData.received || false,
            kendaraan: reportData.kendaraan || "",
            jenis: reportData.jenis || "",
            jumlahKorban: reportData.jumlahKorban || "",
            kronologi: reportData.kronologi || "",
            bukti_selesai: "",
            keterangan_selesai: ""
        };
        reports.push(newReport);
        persistReports();
        return newReport.id;
    } catch (e) {
        console.error('Error adding report:', e);
        throw new Error('Gagal menambahkan laporan: ' + e.message);
    }
}

// Dahulu fetch ke server, sekarang cukup ambil dari array lokal `reports`.
function loadLaporanMasuk() {
    try {
        renderReportList();
        renderStats();
        renderTracking(getCurrentCategory());
        renderNotifications();
    } catch (error) {
        console.error("Error:", error);
        showErrorBoundary("Gagal memuat laporan lokal.");
    }
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

function renderReportList() {
    try {
        const tableBody = document.querySelector('#report-table-body');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        if (!tableBody) return;

        let localCurrentPage = parseInt(localStorage.getItem('currentReportPage')) || 1;
        const selYear = document.getElementById('year-filter')?.value || 'all';
        const selMonth = document.getElementById('month-filter')?.value || 'all';
        const searchKeyword = document.getElementById('report-search')?.value.trim().toLowerCase();

        let dataToRender = reports.filter(r => r.status === 'Masuk' || !r.status).filter(report => {
            if (!report.tanggal) return false;
            const date = new Date(report.tanggal);
            const year = date.getFullYear().toString();
            const monthNumber = (date.getMonth() + 1).toString().padStart(2, '0');
            const monthName = date.toLocaleString('id-ID', { month: 'long' }).toLowerCase();
            const matchYear = (selYear === 'all') || (year === selYear);
            const matchMonth = (selMonth === 'all') ||
                (selMonth.length === 2 && monthNumber === selMonth) ||
                (selMonth.length > 2 && monthName === selMonth.toLowerCase());
            return matchYear && matchMonth;
        });

        if (searchKeyword) {
            dataToRender = dataToRender.filter(report =>
                report.id?.toString().toLowerCase().includes(searchKeyword) ||
                report.nama?.toLowerCase().includes(searchKeyword)
            );
        }

        const totalReports = dataToRender.length;
        const totalPages = Math.max(1, Math.ceil(totalReports / reportsPerPage));
        if (localCurrentPage > totalPages) localCurrentPage = totalPages;
        if (localCurrentPage < 1) localCurrentPage = 1;

        const startIndex = (localCurrentPage - 1) * reportsPerPage;
        const paginatedReports = dataToRender.slice(startIndex, startIndex + reportsPerPage);

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
                <td><button
                      class="detail-icon-btn"
                      onclick="openReportModal('${report.id}')"
                      title="Lihat Detail">
                      <i class="fas fa-eye"></i>
                    </button>
                </td>
                <td><button onclick="downloadReportPDF('${report.id}')" class="download-pdf-btn" title="Unduh PDF">PDF</button></td>
            `;
            tableBody.appendChild(row);
        });

        if (prevBtn && nextBtn) {
            prevBtn.disabled = localCurrentPage === 1;
            nextBtn.disabled = localCurrentPage === totalPages;
            prevBtn.onclick = () => { if (localCurrentPage > 1) { localCurrentPage--; localStorage.setItem('currentReportPage', localCurrentPage); renderReportList(); } };
            nextBtn.onclick = () => { if (localCurrentPage < totalPages) { localCurrentPage++; localStorage.setItem('currentReportPage', localCurrentPage); renderReportList(); } };
        }
    } catch (e) {
        console.error('Error rendering report list:', e);
        showErrorBoundary('Gagal memuat daftar laporan: ' + e.message);
    }
}

function applyReportFilters() { currentPage = 1; renderReportList(); }

function searchReportById() {
    try {
        const searchInput = document.getElementById('report-search')?.value.trim().toLowerCase();
        currentPage = 1;
        localStorage.setItem('currentReportPage', 1);
        renderReportList();
    } catch (e) {
        console.error('Error searching report:', e);
        showErrorBoundary('Gagal mencari laporan: ' + e.message);
    }
}

function downloadLaporanMasukExcel() {
    const yearFilter = document.getElementById("year-filter")?.value || 'all';
    const monthFilter = document.getElementById("month-filter")?.value || 'all';
    const keyword = document.getElementById("report-search")?.value.toLowerCase() || '';

    const dataToExport = reports.filter(r => {
        if (r.status !== 'Masuk') return false;
        const date = new Date(r.tanggal);
        const reportYear = date.getFullYear().toString();
        const reportMonth = date.toLocaleString('id-ID', { month: 'long' });
        const matchYear = (yearFilter === 'all') || (reportYear === yearFilter);
        const matchMonth = (monthFilter === 'all') || (reportMonth === monthFilter);
        const matchKeyword = !keyword || r.id.toString().includes(keyword) || r.nama.toLowerCase().includes(keyword);
        return matchYear && matchMonth && matchKeyword;
    });

    if (dataToExport.length === 0) return alert("Tidak ada data laporan masuk sesuai filter.");

    const exportData = dataToExport.map(r => ({
        ID: r.id, Nama: r.nama, Tanggal: r.tanggal, Jenis: r.jenis,
        'Titik Kecelakaan': r.titik, Saksi: r.saksi, Kronologi: r.kronologi, Status: r.status
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Masuk");
    XLSX.writeFile(wb, `laporan_masuk_${yearFilter}_${monthFilter}.xlsx`);
}
document.getElementById("download-filter-btn")?.addEventListener("click", downloadLaporanMasukExcel);


/* --- Detail & Modal Laporan --- */

function openReportModal(reportId) {
    try {
        const report = reports.find(r => String(r.id) === String(reportId));
        if (!report) return alert('Laporan tidak ditemukan!');

        const modal = document.getElementById('report-modal');
        if (!modal) return;

        document.getElementById('report-nama').value = report.nama || '';
        document.getElementById('report-nik').value = report.nik || '';
        const teleponInput = document.getElementById('report-telepon');
        if (teleponInput) {
            let nomor = (report.no_hp || "").replace(/\D/g, "");
            if (nomor.startsWith("0")) nomor = "62" + nomor.slice(1);
            teleponInput.value = report.no_hp || "";
            teleponInput.readOnly = true;
            teleponInput.style.cursor = "pointer";
            teleponInput.title = "Klik untuk chat via WhatsApp";
            teleponInput.onclick = () => {
                if (nomor) window.open(`https://wa.me/${nomor}`, "_blank");
                else alert("Nomor WhatsApp tidak tersedia.");
            };
        }
        document.getElementById('report-saksi').value = report.saksi || '';
        document.getElementById('report-titik').value = report.titik || '';
        document.getElementById('report-kendaraan').value = report.kendaraan || '-';
        document.getElementById('report-jenis').value = report.jenis || '-';
        document.getElementById('report-jumlah-korban').value = report.jumlahKorban || '-';
        document.getElementById('report-tanggal').value = report.tanggal || '';
        document.getElementById('report-status').value = report.status || '-';
        document.getElementById('report-kronologi').value = report.kronologi || '';
        const buktiImg = document.getElementById('report-bukti');
        if (buktiImg) buktiImg.src = report.bukti || '';

        const petugasInput = document.getElementById('report-petugas');
        if (petugasInput) petugasInput.value = report.petugas || '';

        const buktiPetugasImg = document.getElementById("report-bukti-petugas");
        const keteranganInput = document.getElementById("report-keterangan");
        if (keteranganInput) keteranganInput.value = report.keterangan_selesai || '';
        if (buktiPetugasImg) {
            if (report.bukti_selesai) { buktiPetugasImg.src = report.bukti_selesai; buktiPetugasImg.style.display = 'block'; }
            else { buktiPetugasImg.src = ''; buktiPetugasImg.style.display = 'none'; }
        }

        const buttonContainer = document.querySelector('.report-buttons');
        if (buttonContainer) {
            buttonContainer.innerHTML = '';
            const status = (report.status || '').toLowerCase();
            switch (status) {
                case 'masuk':
                    if (petugasInput) petugasInput.disabled = true;
                    buttonContainer.innerHTML = `
                        <button class="accept-button" onclick="updateStatus('${reportId}', 'diterima')">Terima</button>
                        <button class="reject-button" onclick="updateStatus('${reportId}', 'ditolak')">Tolak</button>
                        <button class="btn cancel-btn">Batal</button>`;
                    break;
                case 'diterima':
                    if (petugasInput) petugasInput.disabled = false;
                    buttonContainer.innerHTML = `
                        <button class="save-btn" onclick="savePetugasLaporan('${reportId}')">Simpan</button>
                        <button class="btn cancel-btn">Batal</button>`;
                    break;
                case 'penanganan':
                    if (petugasInput) petugasInput.disabled = false;
                    buttonContainer.innerHTML = `
                        <button class="save-btn" onclick="savePetugasLaporan('${reportId}')">Simpan</button>
                        <button class="complete-btn" onclick="updateStatus('${reportId}', 'selesai')">Selesai</button>
                        <button class="btn cancel-btn">Batal</button>`;
                    break;
                default:
                    if (petugasInput) petugasInput.disabled = true;
                    buttonContainer.innerHTML = `<button class="btn cancel-btn">Batal</button>`;
            }
        }

        modal.style.display = 'block';
        const cancelBtn = modal.querySelector('.cancel-btn');
        if (cancelBtn) cancelBtn.addEventListener('click', closeReportModal);
    } catch (e) {
        console.error('Error opening report modal:', e);
        showErrorBoundary('Gagal membuka modal laporan: ' + e.message);
    }
}

function closeReportModal() {
    const modal = document.getElementById('report-modal');
    if (modal) modal.style.display = 'none';
}

// Simpan petugas + keterangan, sekarang murni lokal (tanpa fetch ke server).
function savePetugasLaporan(reportId) {
    const report = reports.find(r => String(r.id) === String(reportId));
    if (!report) return alert('Laporan tidak ditemukan!');

    const petugas = document.getElementById('report-petugas')?.value.trim() || '';
    const keterangan = document.getElementById('report-keterangan')?.value.trim() || '';

    if (!petugas && report.status === 'Diterima') return alert('Petugas harus diisi sebelum menyimpan!');

    let newStatus = report.status;
    if (report.status === 'Diterima' && petugas) newStatus = 'Penanganan';
    else if (report.status === 'Penanganan' && keterangan) newStatus = 'Selesai';

    report.petugas = petugas;
    report.keterangan_selesai = keterangan;
    report.status = newStatus;
    persistReports();

    alert(`Laporan berhasil diperbarui menjadi ${newStatus}.`);
    closeReportModal();
    renderReportList();
    renderTracking(getCurrentCategory());
    renderStats();
}

// Dahulu fetch ke server untuk update status, sekarang langsung update array lokal.
function updateStatus(reportId, newStatus) {
    const report = reports.find(r => String(r.id) === String(reportId));
    if (!report) return;

    const statusMap = { diterima: "Diterima", ditolak: "Ditolak", selesai: "Selesai", penanganan: "Penanganan" };
    const mapped = statusMap[newStatus];
    if (!mapped) return alert("Status tidak valid.");

    report.status = mapped;
    report.received = mapped === "Diterima" || mapped === "Selesai";
    persistReports();

    alert(`Status laporan berhasil diubah menjadi ${mapped}.`);
    closeReportModal();
    renderReportList();
    renderTracking(getCurrentCategory());
    renderNotifications();
    renderStats();
}


/* --- PDF laporan (tetap pakai jsPDF, tapi datanya lokal) --- */

function loadImageAsDataURL(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
            const canvasEl = document.createElement('canvas');
            canvasEl.width = this.width; canvasEl.height = this.height;
            const c = canvasEl.getContext('2d');
            c.drawImage(this, 0, 0);
            try { resolve(canvasEl.toDataURL('image/jpeg')); } catch (e) { reject(e); }
        };
        img.onerror = () => reject(new Error('Gagal memuat gambar bukti'));
        img.src = url;
    });
}

async function downloadReportPDF(reportId) {
    try {
        if (typeof jspdf === 'undefined') return alert('jsPDF belum dimuat.');
        const { jsPDF } = window.jspdf;

        const report = reports.find(r => String(r.id) === String(reportId));
        if (!report) return alert('Laporan tidak ditemukan.');

        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        doc.setFont("helvetica", "bold"); doc.setFontSize(16);
        doc.text("LAPORAN KEJADIAN KECELAKAAN", 40, 60);
        doc.setFontSize(12); doc.setFont("helvetica", "normal");
        doc.text(`ID Laporan: ${report.id}`, 40, 80);

        let y = 110;
        doc.setFont("helvetica", "bold"); doc.text("1. Data Pelapor", 40, y); y += 20;
        doc.setFont("helvetica", "normal");
        [["Nama", report.nama], ["NIK", report.nik], ["Telepon", report.no_hp], ["Saksi", report.saksi]]
            .forEach(([label, value]) => { doc.text(`${label}: ${value || "-"}`, 60, y); y += 16; });

        y += 10;
        doc.setFont("helvetica", "bold"); doc.text("2. Data Kecelakaan", 40, y); y += 20;
        doc.setFont("helvetica", "normal");
        [["Jenis Kecelakaan", report.jenis], ["Kendaraan", report.kendaraan], ["Jumlah Korban", report.jumlahKorban],
         ["Tanggal", report.tanggal], ["Alamat Kejadian", report.titik], ["Petugas Menangani", report.petugas], ["Status", report.status]]
            .forEach(([label, value]) => {
                const lines = doc.splitTextToSize(`${label}: ${value || "-"}`, 480);
                doc.text(lines, 60, y); y += lines.length * 14;
            });

        y += 10;
        doc.setFont("helvetica", "bold"); doc.text("3. Kronologi Kejadian", 40, y); y += 20;
        doc.setFont("helvetica", "normal");
        const kronologiText = doc.splitTextToSize(report.kronologi || "-", 480);
        doc.text(kronologiText, 60, y);

        doc.setFontSize(10);
        doc.text(`Halaman 1 dari 1`, 260, 820);
        doc.save(`Laporan_${report.nama}_${report.id}.pdf`);
    } catch (e) {
        console.error("Error download PDF:", e);
        alert("Gagal mengunduh PDF: " + e.message);
    }
}


/* =========================================================================
   7. TRACKING / PELACAKAN LAPORAN
   ========================================================================= */

function filterCategory(category) {
    currentPage = 1;
    currentTrackingCategory = category;
    applyFilters();
}

function applyFilters() {
    const yearFilter = document.getElementById("tracking-filter-year")?.value || "all";
    const monthFilter = document.getElementById("tracking-filter-month")?.value || "all";
    const searchQuery = document.getElementById("tracking-search")?.value.toLowerCase() || "";

    let filtered = reports;
    switch (currentTrackingCategory) {
        case 'accepted': filtered = filtered.filter(r => r.status === "Diterima"); break;
        case 'handling': filtered = filtered.filter(r => r.status === "Penanganan"); break;
        case 'received': filtered = filtered.filter(r => r.status === "Selesai"); break;
        case 'rejected': filtered = filtered.filter(r => r.status === "Ditolak"); break;
        default:
            filtered = filtered.filter(r => ["Diterima", "Penanganan", "Selesai", "Ditolak"].includes(r.status));
    }

    filtered = filtered.filter(r => matchesDate(r.tanggal, yearFilter, monthFilter));

    if (searchQuery) {
        filtered = filtered.filter(r =>
            r.id?.toString().includes(searchQuery) || r.nama?.toLowerCase().includes(searchQuery));
    }

    currentPage = 1;
    renderTrackingTable(filtered);
}

function renderTrackingTable(data) {
    const tbody = document.getElementById('tracking-table-body');
    if (!tbody) return;
    const start = (currentPage - 1) * reportsPerPage;
    const pageData = data.slice(start, start + reportsPerPage);

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
            <td><button onclick="openReportModal('${report.id}')">Detail</button></td>
            <td><span class="report-status ${report.status.toLowerCase()}">${escapeHTML(report.status)}</span></td>
        </tr>
    `).join('');

    document.getElementById('total-reports') && (document.getElementById('total-reports').textContent = data.length);
    document.getElementById('accepted-reports-count') && (document.getElementById('accepted-reports-count').textContent = data.filter(r => r.status === 'Diterima').length);
    document.getElementById('handling-reports-count') && (document.getElementById('handling-reports-count').textContent = data.filter(r => r.status === 'Penanganan').length);
    document.getElementById('received-data-count') && (document.getElementById('received-data-count').textContent = data.filter(r => r.status === 'Selesai').length);
    document.getElementById('rejected-reports-count') && (document.getElementById('rejected-reports-count').textContent = data.filter(r => r.status === 'Ditolak').length);

    renderTrackingPagination(data.length);
}

function renderTracking(category = 'all') {
    currentTrackingCategory = category;
    applyFilters();
}

function renderTrackingPagination(totalReports) {
    const container = document.querySelector("#tracking-section .pagination");
    if (!container) return;
    container.innerHTML = "";
    const totalPages = Math.max(1, Math.ceil(totalReports / reportsPerPage));

    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    startPage = Math.max(1, endPage - maxVisiblePages + 1);

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Kembali";
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; applyFilters(); } };
    container.appendChild(prevBtn);

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        if (i === currentPage) pageBtn.classList.add("active-page");
        pageBtn.onclick = () => { currentPage = i; applyFilters(); };
        container.appendChild(pageBtn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Lanjut";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; applyFilters(); } };
    container.appendChild(nextBtn);
}

function downloadFilteredTracking(category) {
    try {
        const selYear = document.getElementById("tracking-filter-year")?.value || "all";
        const selMonth = document.getElementById("tracking-filter-month")?.value || "all";
        const searchKeyword = document.getElementById("tracking-search")?.value.trim().toLowerCase();

        let filtered = reports.filter(r => {
            if (category === "all" && r.status === "Masuk") return false;
            if (category === "accepted" && r.status !== "Diterima") return false;
            if (category === "handling" && r.status !== "Penanganan") return false;
            if (category === "received" && r.status !== "Selesai") return false;
            if (category === "rejected" && r.status !== "Ditolak") return false;
            return matchesDate(r.tanggal, selYear, selMonth);
        });

        if (searchKeyword) {
            filtered = filtered.filter(r =>
                r.id?.toString().toLowerCase().includes(searchKeyword) || r.nama?.toLowerCase().includes(searchKeyword));
        }
        if (filtered.length === 0) return alert("Tidak ada data untuk diunduh pada filter ini.");

        const wsData = [["ID", "Nama", "Tanggal", "Jenis Kecelakaan", "Kendaraan", "Jumlah Korban", "Titik Kejadian", "Kronologi", "Status"]];
        filtered.forEach(r => wsData.push([r.id, r.nama, r.tanggal, r.jenis, r.kendaraan, r.jumlahKorban, r.titik, r.kronologi, r.status]));

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = wsData[0].map((_, colIndex) => {
            let maxLength = 0;
            wsData.forEach(row => { maxLength = Math.max(maxLength, (row[colIndex] || "").toString().length); });
            return { wch: maxLength + 2 };
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tracking Laporan");
        let filename = `tracking_${category}`;
        if (selYear !== "all") filename += `_${selYear}`;
        if (selMonth !== "all") filename += `_${selMonth}`;
        XLSX.writeFile(wb, filename + ".xlsx");
    } catch (e) {
        console.error("Gagal mengunduh Tracking Excel:", e);
        alert("Terjadi kesalahan saat mengunduh data tracking.");
    }
}

function getCurrentCategory() {
    const active = document.querySelector('.category-card.active');
    return active ? active.getAttribute('data-category') : 'all';
}

function setupTrackingFilters() {
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentPage = 1;
            renderTracking(card.dataset.category);
        });
    });
}


/* =========================================================================
   8. STATISTIK & NOTIFIKASI BERANDA
   ========================================================================= */

function renderStats() {
    try {
        const totalLaporan = reports.length;
        const kasusProses = reports.filter(r => r.status === 'Penanganan').length;
        const kasusSelesai = reports.filter(r => r.status === 'Selesai').length;

        const totalEl = document.getElementById('total-laporan');
        const prosesEl = document.getElementById('kasus-proses');
        const selesaiEl = document.getElementById('kasus-selesai');
        if (totalEl) totalEl.textContent = totalLaporan;
        if (prosesEl) prosesEl.textContent = kasusProses;
        if (selesaiEl) selesaiEl.textContent = kasusSelesai;
    } catch (e) {
        console.error('Error rendering stats:', e);
    }
}

function renderNotifications() {
    try {
        const notificationList = document.getElementById('notification-list');
        if (!notificationList) return;

        const recentReports = [...reports]
            .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
            .slice(0, 5);

        notificationList.innerHTML = recentReports.map(report => {
            let statusClass = report.status === "Masuk" ? "unread" : "read";
            return `
                <div class="notification-item">
                    <span class="status-indicator ${statusClass}"></span>
                    <div class="details">
                        <span class="name">${escapeHTML(report.nama)}</span>
                        <span class="titik-laporan">${escapeHTML(report.titik?.length > 40 ? report.titik.substring(0, 40) + '...' : report.titik || '-')}</span>
                        <span class="date">${escapeHTML(report.tanggal)}</span>
                        <button class="action-btn" onclick="navigateToLaporanMasuk('${report.id}')">Detail</button>
                    </div>
                </div>`;
        }).join('');
    } catch (e) {
        console.error('Error rendering notifications:', e);
    }
}

function navigateToLaporanMasuk(reportId) {
    try {
        const laporanMasukSection = document.getElementById('laporan-masuk-section');
        const laporanMasukNavItem = document.querySelector('[data-section="laporan-masuk-section"]');
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.content-section');
        if (!laporanMasukSection || !laporanMasukNavItem) throw new Error('Section laporan masuk tidak ditemukan');

        sections.forEach(sec => sec.classList.remove('active'));
        navItems.forEach(nav => nav.classList.remove('active'));
        laporanMasukSection.classList.add('active');
        laporanMasukNavItem.classList.add('active');
        renderReportList();
        setTimeout(() => openReportModal(String(reportId)), 200);
    } catch (e) {
        console.error('Error navigating to laporan masuk:', e);
        showErrorBoundary('Gagal membuka laporan masuk: ' + e.message);
    }
}


/* =========================================================================
   9. EVALUASI (sudah lokal sejak awal — tidak berubah)
   ========================================================================= */

let selectedEvaluasiId = null;
let evaluasiData = [
    { id: 1, title: "Evaluasi Kecelakaan Q1 2026", description: "Analisis kecelakaan di Kecamatan Bogor Barat menunjukkan peningkatan dibandingkan periode sebelumnya.", period: "Jan-Mar 2026" },
    { id: 2, title: "Evaluasi Kecelakaan Q2 2026", description: "Penurunan angka kecelakaan di Kecamatan Bogor Selatan setelah pemasangan rambu baru.", period: "Apr-Jun 2026" }
];

function validateEvaluasiData(data) {
    return Array.isArray(data) && data.every(item =>
        typeof item.id === 'number' && typeof item.title === 'string' &&
        typeof item.description === 'string' && typeof item.period === 'string');
}
evaluasiData = validateStoredData('evaluasiData', evaluasiData, validateEvaluasiData);

function renderEvaluasiCards() {
    try {
        const evaluasiCards = document.getElementById('evaluasi-cards');
        if (!evaluasiCards) return;
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
    }
}

function openAddEvaluasi() {
    const modal = document.getElementById('evaluasi-modal');
    if (!modal) return;
    selectedEvaluasiId = null;
    document.getElementById('evaluasi-title').value = '';
    document.getElementById('evaluasi-description').value = '';
    document.getElementById('evaluasi-period').value = '';
    const deleteBtn = document.getElementById('delete-evaluasi-btn');
    if (deleteBtn) deleteBtn.style.display = 'none';
    modal.style.display = 'flex';
}

function openEvaluasiModal(evaluasiId) {
    const evaluasi = evaluasiData.find(e => e.id === evaluasiId);
    if (!evaluasi) return alert('Evaluasi tidak ditemukan!');
    const modal = document.getElementById('evaluasi-modal');
    if (!modal) return;

    document.getElementById('evaluasi-title').value = evaluasi.title;
    document.getElementById('evaluasi-description').value = evaluasi.description;
    document.getElementById('evaluasi-period').value = evaluasi.period;
    const deleteBtn = document.getElementById('delete-evaluasi-btn');
    if (deleteBtn) { deleteBtn.style.display = 'inline-block'; }
    modal.style.display = 'flex';
    selectedEvaluasiId = evaluasi.id;
}

document.getElementById('save-evaluasi-btn')?.addEventListener('click', function () {
    const title = document.getElementById('evaluasi-title').value.trim();
    const description = document.getElementById('evaluasi-description').value.trim();
    const period = document.getElementById('evaluasi-period').value.trim();
    if (!title || !description || !period) return alert('Semua kotak wajib diisi!');

    const isDuplicate = evaluasiData.some(e => e.title.toLowerCase() === title.toLowerCase() && (selectedEvaluasiId === null || e.id !== selectedEvaluasiId));
    if (isDuplicate) return alert('Evaluasi dengan judul yang sama sudah ada.');

    if (selectedEvaluasiId === null) {
        const newId = evaluasiData.length ? Math.max(...evaluasiData.map(e => e.id)) + 1 : 1;
        evaluasiData.push({ id: newId, title, description, period });
    } else {
        const index = evaluasiData.findIndex(e => e.id === selectedEvaluasiId);
        if (index !== -1) Object.assign(evaluasiData[index], { title, description, period });
    }
    saveToLocalStorage('evaluasiData', evaluasiData);
    renderEvaluasiCards();
    closeModal('evaluasi-modal');
});

document.getElementById('delete-evaluasi-btn')?.addEventListener('click', function () {
    if (selectedEvaluasiId === null) return alert('Evaluasi belum dipilih.');
    if (!confirm('Apakah kamu yakin ingin menghapus evaluasi ini?')) return;
    evaluasiData = evaluasiData.filter(e => e.id !== selectedEvaluasiId);
    saveToLocalStorage('evaluasiData', evaluasiData);
    renderEvaluasiCards();
    closeModal('evaluasi-modal');
});

document.getElementById('cancel-evaluasi-btn')?.addEventListener('click', () => closeModal('evaluasi-modal'));
document.getElementById('close-evaluasi-modal')?.addEventListener('click', () => closeModal('evaluasi-modal'));
document.querySelector('#evaluasi-modal .modal-close')?.addEventListener('click', () => closeModal('evaluasi-modal'));

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) { modal.classList.add('hidden'); setTimeout(() => { modal.style.display = 'none'; }, 300); }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    const buttonContainer = document.querySelector('.report-buttons');
    if (buttonContainer) buttonContainer.innerHTML = '';
    const petugasInput = document.getElementById('report-petugas');
    if (petugasInput) petugasInput.value = '';
}


/* =========================================================================
   10. MANAJEMEN PENGGUNA — sekarang dari array lokal `allUsers`
   ========================================================================= */

function validateUsersData(data) {
    return Array.isArray(data) && data.every(u => typeof u.id !== 'undefined' && typeof u.nama === 'string');
}
let allUsers = validateStoredData('allUsers', SAMPLE_USERS, validateUsersData);
let filteredUsers = [...allUsers];
function persistUsers() { saveToLocalStorage('allUsers', allUsers); }

function loadUsers() {
    filteredUsers = [...allUsers];
    renderUsersAPI(filteredUsers);
}

function renderUsersAPI(users) {
    const tableBody = document.getElementById("approved-user-table-body");
    if (!tableBody) return;
    users = users.filter(u => u.id && u.nama && u.email);
    tableBody.innerHTML = "";
    users.forEach((user, index) => {
        const row = document.createElement("tr");
        const foto = user.foto && user.foto !== "" ? user.foto : "assets/img/default-user.png";
        row.innerHTML = `
            <td>${escapeHTML(user.id || (index + 1).toString())}</td>
            <td style="text-align:center;"><img src="${foto}" alt="foto" style="width:35px;height:35px;border-radius:50%;object-fit:cover;"></td>
            <td>${escapeHTML(user.nama || "-")}</td>
            <td>${escapeHTML(user.email || "-")}</td>
            <td>${escapeHTML(user.no_hp || "-")}</td>
            <td>${escapeHTML(user.nik || "-")}</td>
            <td>${getKategoriName(user.kategori)}</td>
            <td style="display:flex;justify-content:center;align-items:center;gap:10px;">
                <button onclick='openEditUserModal(${JSON.stringify(user).replace(/'/g, "&#39;")})' title="Edit" style="background:none;border:none;color:#007bff;cursor:pointer;"><i class="fa-solid fa-edit"></i></button>
                <button onclick='deleteUser("${user.id}", "${(user.nama || '').replace(/"/g, "&quot;")}")' title="Hapus" style="background:none;border:none;color:#dc3545;cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
            </td>`;
        tableBody.appendChild(row);
    });
}

function getKategoriName(kode) {
    switch (String(kode)) {
        case "1": return "Admin";
        case "2": return "Petugas";
        case "3": return "Pimpinan";
        default: return "User";
    }
}

function kategoriToCode(kat) {
    switch (kat) {
        case "Admin": return 1;
        case "Petugas": return 2;
        case "Pimpinan": return 3;
        default: return 4;
    }
}

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

document.getElementById("save-user-btn")?.addEventListener("click", () => {
    const id = document.getElementById("user-id").value;
    const nama = document.getElementById("user-nama").value.trim();
    const email = document.getElementById("user-email").value.trim();
    const no_hp = document.getElementById("user-nohp").value.trim();
    const nik = document.getElementById("user-nik").value.trim();
    const kategori = document.getElementById("user-kategori").value;

    if (!nama || !email || !no_hp || !nik) return alert("⚠️ Semua kolom wajib diisi!");

    if (!id) {
        const newId = "U" + String(Date.now()).slice(-6);
        allUsers.push({ id: newId, nama, email, no_hp, nik, kategori: kategoriToCode(kategori).toString() });
    } else {
        const u = allUsers.find(x => String(x.id) === String(id));
        if (u) Object.assign(u, { nama, email, no_hp, nik, kategori: kategoriToCode(kategori).toString() });
    }
    persistUsers();
    alert("✅ Data pengguna berhasil diperbarui!");
    document.getElementById("user-modal").style.display = "none";
    loadUsers();
});

function deleteUser(userId, userName) {
    if (!confirm(`Yakin ingin menghapus pengguna "${userName}"?`)) return;
    allUsers = allUsers.filter(u => String(u.id) !== String(userId));
    persistUsers();
    alert(`✅ Pengguna "${userName}" berhasil dihapus!`);
    loadUsers();
}

function applySearchAndSort() {
    const query = document.getElementById("approved-user-search")?.value.toLowerCase() || "";
    const sortValue = document.getElementById("approved-user-sort")?.value || "";

    filteredUsers = allUsers.filter(user => {
        const nama = (user.nama || "").toLowerCase();
        const email = (user.email || "").toLowerCase();
        const no_hp = (user.no_hp || "").toLowerCase();
        const nik = (user.nik || "").toLowerCase();
        return nama.includes(query) || email.includes(query) || no_hp.includes(query) || nik.includes(query);
    });

    filteredUsers.sort((a, b) => {
        switch (sortValue) {
            case "az": return (a.nama || "").localeCompare(b.nama || "");
            case "za": return (b.nama || "").localeCompare(a.nama || "");
            default: return 0;
        }
    });
    renderUsersAPI(filteredUsers);
}

document.getElementById("approved-user-search")?.addEventListener("input", applySearchAndSort);
document.getElementById("approved-user-sort")?.addEventListener("change", applySearchAndSort);
document.getElementById("cancel-user-btn")?.addEventListener("click", () => { document.getElementById("user-modal").style.display = "none"; });
document.getElementById("user-modal-close")?.addEventListener("click", () => { document.getElementById("user-modal").style.display = "none"; });


/* =========================================================================
   11. MANAJEMEN PETUGAS — sekarang dari array lokal `petugasList`
   ========================================================================= */

function validatePetugasData(data) {
    return Array.isArray(data) && data.every(p => typeof p.id !== 'undefined' && typeof p.nama === 'string');
}
let petugasList = validateStoredData('petugasList', SAMPLE_PETUGAS, validatePetugasData);
let currentPetugasPage = 1;
const petugasPerPage = 5;
let editingPetugas = null;
function persistPetugas() { saveToLocalStorage('petugasList', petugasList); }

function renderPetugas() {
    const tbody = document.getElementById("petugas-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    const start = (currentPetugasPage - 1) * petugasPerPage;
    const pageData = petugasList.slice(start, start + petugasPerPage);

    if (pageData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Belum ada data petugas</td></tr>`;
        return;
    }
    pageData.forEach((p, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${start + index + 1}</td>
            <td>${escapeHTML(p.nama)}</td>
            <td>${escapeHTML(p.unit)}</td>
            <td style="text-align:center;">
                <div class="aksi-wrapper">
                    <button class="btn-icon btn-edit" onclick="openEditPetugas('${p.id}')"><i class="fa-solid fa-edit"></i></button>
                    <button class="btn-icon btn-delete" onclick="deletePetugas('${p.id}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>`;
        tbody.appendChild(row);
    });

    const totalPages = Math.max(1, Math.ceil(petugasList.length / petugasPerPage));
    const pageInfo = document.getElementById("petugas-page-info");
    if (pageInfo) pageInfo.textContent = `Halaman ${currentPetugasPage} dari ${totalPages}`;
    renderPetugasDropdown();
}

function nextPetugasPage() {
    const totalPages = Math.ceil(petugasList.length / petugasPerPage);
    if (currentPetugasPage < totalPages) { currentPetugasPage++; renderPetugas(); }
}
function prevPetugasPage() {
    if (currentPetugasPage > 1) { currentPetugasPage--; renderPetugas(); }
}

function searchPetugas() {
    const query = document.getElementById("search-petugas")?.value.toLowerCase() || "";
    const tbody = document.getElementById("petugas-table-body");
    if (!tbody) return;
    const filtered = petugasList.filter(p => p.nama.toLowerCase().includes(query) || p.unit.toLowerCase().includes(query));
    tbody.innerHTML = "";
    if (filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Tidak ada hasil</td></tr>`; return; }
    filtered.forEach((p, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td><td>${escapeHTML(p.nama)}</td><td>${escapeHTML(p.unit)}</td>
            <td style="text-align:center;">
                <button class="btn-icon btn-edit" onclick="openEditPetugas('${p.id}')"><i class="fa-solid fa-edit"></i></button>
                <button class="btn-icon btn-delete" onclick="deletePetugas('${p.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>`;
        tbody.appendChild(row);
    });
}

function openAddPetugasModal() {
    editingPetugas = null;
    document.getElementById("modal-petugas-title").textContent = "Tambah Petugas";
    document.getElementById("petugas-form").reset();
    document.querySelector("#petugasModal").style.display = "flex";
}

function openEditPetugas(id) {
    const petugas = petugasList.find(p => String(p.id) === String(id));
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
    if (modal && e.target === modal) closePetugasModal();
});

function savePetugasToAPI(event) {
    event.preventDefault();
    const nama = document.getElementById("petugas-nama").value.trim();
    const satuan = document.getElementById("petugas-unit").value.trim();
    if (!nama || !satuan) return alert("⚠️ Nama dan instansi wajib diisi!");

    if (editingPetugas) {
        Object.assign(editingPetugas, { nama, unit: satuan });
        alert("✅ Data petugas berhasil diperbarui!");
    } else {
        const newId = "P" + String(Date.now()).slice(-6);
        petugasList.push({
            id: newId, nama, unit: satuan,
            email: `${nama.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            no_hp: "081234500000",
            nik: Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(),
            kategori: "2"
        });
        alert("✅ Petugas baru berhasil ditambahkan!");
    }
    persistPetugas();
    closePetugasModal();
    renderPetugas();
}

function deletePetugas(id) {
    if (!confirm("Yakin ingin menghapus petugas ini?")) return;
    petugasList = petugasList.filter(p => String(p.id) !== String(id));
    persistPetugas();
    alert("🗑️ Petugas berhasil dihapus!");
    renderPetugas();
}

function renderPetugasDropdown() {
    const dropdown = document.getElementById("report-petugas");
    if (!dropdown || dropdown.tagName !== "SELECT") return;
    dropdown.innerHTML = `<option value="">Pilih Petugas</option>`;
    petugasList.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.nama; opt.textContent = p.nama;
        dropdown.appendChild(opt);
    });
}

function setupAddUserModal() { /* placeholder agar tidak error saat dipanggil */ }


/* =========================================================================
   12. PETA / TITIK LAPORAN — memakai 5 contoh titik dari SAMPLE_REPORTS
   ========================================================================= */

// Dahulu fetch ke server per tahun, sekarang filter data lokal `reports`
// berdasarkan tahun pada field `tanggal`.
function getReportsByYear(year) {
    return reports.filter(r => {
        const d = new Date(r.tanggal);
        return !isNaN(d) && d.getFullYear().toString() === year.toString() &&
            typeof r.lat === 'number' && typeof r.long === 'number';
    }).map(r => ({
        id: r.id,
        nama_user: r.nama,
        tanggal: r.tanggal,
        saksi_1: r.saksi,
        no_hp: r.no_hp,
        jenis_kecelakaan: r.jenis,
        lat: r.lat,
        long: r.long
    }));
}

function createNumberedMarkerIcon(count) {
    const svg = `
        <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C6.7 0 0 6.7 0 15c0 10 15 25 15 25s15-15 15-25C30 6.7 23.3 0 15 0z" fill="#375B85"/>
            <circle cx="15" cy="15" r="8" fill="#FFFFFF"/>
            <text x="15" y="19" font-family="Arial" font-size="10" font-weight="bold" fill="#000000" text-anchor="middle">${count}</text>
        </svg>`;
    return L.divIcon({ className: 'custom-marker-pin', html: svg, iconSize: [30, 40], iconAnchor: [15, 40], popupAnchor: [0, -35] });
}

function renderMap(containerId, data, year) {
    if (typeof L === "undefined") { console.error("❌ Leaflet belum dimuat."); return; }

    const oldMap = L.DomUtil.get(containerId);
    if (oldMap && oldMap._leaflet_id) oldMap._leaflet_id = null;

    const map = L.map(containerId).setView([-6.5944, 106.7890], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);

    if (!Array.isArray(data) || data.length === 0) { console.warn(`⚠️ Tidak ada data untuk tahun ${year}`); return; }

    const groupedByLocation = {};
    data.forEach(item => {
        const lat = parseFloat(item.lat), lng = parseFloat(item.long);
        if (isNaN(lat) || isNaN(lng)) return;
        const key = `${lat},${lng}`;
        (groupedByLocation[key] = groupedByLocation[key] || []).push(item);
    });

    Object.entries(groupedByLocation).forEach(([key, reportsAtPoint]) => {
        const [lat, lng] = key.split(',').map(Number);
        const count = reportsAtPoint.length;
        const popupTable = `
            <div style="max-height:250px;overflow:auto;">
                <b>Total laporan di titik ini: ${count}</b><br><br>
                <table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;width:100%;">
                    <tr style="background-color:#375B85;color:white;text-align:center;">
                        <th>No</th><th>Nama</th><th>Tanggal</th><th>Saksi</th><th>Telepon</th><th>Jenis</th><th>Maps</th>
                    </tr>
                    ${reportsAtPoint.map((r, i) => `
                        <tr>
                            <td>${i + 1}</td><td>${escapeHTML(r.nama_user || '-')}</td>
                            <td>${escapeHTML(r.tanggal || '-')}</td><td>${escapeHTML(r.saksi_1 || '-')}</td>
                            <td>${escapeHTML(r.no_hp || '-')}</td><td>${escapeHTML(r.jenis_kecelakaan || '-')}</td>
                            <td><a href="https://www.google.com/maps?q=${r.lat},${r.long}" target="_blank">Lihat</a></td>
                        </tr>`).join('')}
                </table>
            </div>`;
        const marker = L.marker([lat, lng], { icon: createNumberedMarkerIcon(count) }).addTo(map);
        marker.bindPopup(popupTable, { closeButton: true, autoClose: false });
    });

    console.log(`✅ Peta ${year} dimuat (${data.length} laporan, ${Object.keys(groupedByLocation).length} titik unik).`);
}

function toggleMapByYear() {
    const selectedYearEl = document.getElementById("filter-tahun-laporan");
    if (!selectedYearEl) return;
    const selectedYearVal = selectedYearEl.value;

    ["map-2023", "map-2024", "map-2025", "map-2026"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    const selectedMapContainer = document.getElementById(`map-${selectedYearVal}`);
    if (!selectedMapContainer) { console.error(`❌ Container map-${selectedYearVal} tidak ditemukan`); return; }
    selectedMapContainer.style.display = "block";

    const data = getReportsByYear(selectedYearVal);
    renderMap(`map-${selectedYearVal}`, data, selectedYearVal);
}

function initMap() {
    const year = new Date().getFullYear();
    const containerId = `map-${year}`;
    if (!document.getElementById(containerId)) return;
    const data = getReportsByYear(year);
    renderMap(containerId, data, year);
}

function getSelectedYear() {
    return document.getElementById("filter-tahun-laporan")?.value || new Date().getFullYear().toString();
}

async function downloadSelectedMapImage() {
    const year = getSelectedYear();
    const mapContainer = document.getElementById(`map-${year}`);
    if (!mapContainer) return alert("❌ Peta tidak ditemukan!");
    try {
        const canvasImg = await html2canvas(mapContainer, { useCORS: true, scale: 2 });
        const link = document.createElement("a");
        link.download = `Peta_Laporan_${year}.png`;
        link.href = canvasImg.toDataURL("image/png");
        link.click();
    } catch (err) {
        console.error("❌ Gagal mengunduh gambar peta:", err);
        alert("Gagal menyimpan gambar peta.");
    }
}

function downloadSelectedMapExcel() {
    const year = getSelectedYear();
    const data = getReportsByYear(year);
    if (!data || data.length === 0) return alert(`⚠️ Tidak ada data untuk tahun ${year}.`);

    const formattedData = data.map((r, i) => ({
        No: i + 1, ID: r.id, Nama: r.nama_user, Tanggal: r.tanggal, Saksi: r.saksi_1,
        Telepon: r.no_hp, Jenis_Kecelakaan: r.jenis_kecelakaan, Latitude: r.lat, Longitude: r.long
    }));
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    worksheet['!cols'] = [{ wch: 5 }, { wch: 10 }, { wch: 20 }, { wch: 22 }, { wch: 25 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 14 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Laporan_${year}`);
    XLSX.writeFile(workbook, `Data_Laporan_${year}.xlsx`);
}


/* =========================================================================
   13. INISIALISASI HALAMAN
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeAdminPage();
        renderStats();
        renderNotifications();
        renderEvaluasiCards();
        renderReportList();
        renderPetugas();
        loadUsers();
    } catch (e) {
        console.error('Error during page initialization:', e);
        showErrorBoundary('Gagal menginisialisasi halaman: ' + e.message);
    }
});

window.onbeforeunload = null;


/* =========================================================================
   14. RESPONSIF CHART UNTUK MOBILE
   ========================================================================= */

function optimizeChartForMobile() {
    const canvasEl = document.getElementById("accident-chart");
    if (!canvasEl || !monitoringChart?.options) return;

    if (window.innerWidth < 768) {
        canvasEl.style.height = "350px"; canvasEl.style.width = "100%";
        monitoringChart.options.scales.x.ticks.font = { size: 10 };
        monitoringChart.options.scales.y.ticks.font = { size: 10 };
        monitoringChart.options.layout = { padding: { top: 10, bottom: 10, left: 5, right: 5 } };
        if (monitoringChart.options.plugins?.legend) monitoringChart.options.plugins.legend.labels = { boxWidth: 12, font: { size: 10 } };
        if (monitoringChart.options.plugins?.title) monitoringChart.options.plugins.title.font = { size: 12 };
    } else {
        canvasEl.style.height = "300px";
        monitoringChart.options.scales.x.ticks.font = { size: 12 };
        monitoringChart.options.scales.y.ticks.font = { size: 12 };
        if (monitoringChart.options.plugins?.legend) monitoringChart.options.plugins.legend.labels = { boxWidth: 16, font: { size: 12 } };
        if (monitoringChart.options.plugins?.title) monitoringChart.options.plugins.title.font = { size: 14 };
    }
    monitoringChart.resize();
}

document.addEventListener("DOMContentLoaded", optimizeChartForMobile);
window.addEventListener("resize", optimizeChartForMobile);