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
    if (downloadChartBtn) downloadChartBtn.addEventListener('click', downloadChart);
    if (downloadExcelBtn) downloadExcelBtn.addEventListener('click', downloadExcel);
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

// data kecelakaan (monitoring)
const accidentData = {
    '2023': {
        'Januari': { total: 7, meninggal: 6, lukaBerat: 1, lukaRingan: 5 },
        'Februari': { total: 16, meninggal: 6, lukaBerat: 9, lukaRingan: 7 },
        'Maret': { total: 10, meninggal: 5, lukaBerat: 0, lukaRingan: 10 },
        'April': { total: 9, meninggal: 3, lukaBerat: 1, lukaRingan: 6 },
        'Mei': { total: 14, meninggal: 6, lukaBerat: 8, lukaRingan: 9 },
        'Juni': { total: 10, meninggal: 2, lukaBerat: 7, lukaRingan: 6 },
        'Juli': { total: 10, meninggal: 8, lukaBerat: 0, lukaRingan: 8 },
        'Agustus': { total: 9, meninggal: 4, lukaBerat: 4, lukaRingan: 9 },
        'September': { total: 6, meninggal: 3, lukaBerat: 1, lukaRingan: 3 },
        'Oktober': { total: 14, meninggal: 5, lukaBerat: 7, lukaRingan: 14 },
        'November': { total: 6, meninggal: 2, lukaBerat: 1, lukaRingan: 7 },
        'Desember': { total: 8, meninggal: 2, lukaBerat: 5, lukaRingan: 4 }
    },
    '2024': {
        'Januari': { total: 8, meninggal: 5, lukaBerat: 1, lukaRingan: 6 },
        'Februari': { total: 6, meninggal: 3, lukaBerat: 0, lukaRingan: 8 },
        'Maret': { total: 5, meninggal: 3, lukaBerat: 0, lukaRingan: 2 },
        'April': { total: 12, meninggal: 2, lukaBerat: 6, lukaRingan: 16 },
        'Mei': { total: 11, meninggal: 4, lukaBerat: 4, lukaRingan: 9 },
        'Juni': { total: 14, meninggal: 4, lukaBerat: 5, lukaRingan: 12 },
        'Juli': { total: 11, meninggal: 4, lukaBerat: 7, lukaRingan: 12 },
        'Agustus': { total: 12, meninggal: 3, lukaBerat: 7, lukaRingan: 11 },
        'September': { total: 8, meninggal: 2, lukaBerat: 3, lukaRingan: 8 },
        'Oktober': { total: 14, meninggal: 3, lukaBerat: 3, lukaRingan: 12 },
        'November': { total: 16, meninggal: 7, lukaBerat: 7, lukaRingan: 17 },
        'Desember': { total: 9, meninggal: 2, lukaBerat: 5, lukaRingan: 7 }
    }
};

let chartInstance = null;
function updateChart() {
    try {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js is not loaded');
            return;
        }
        const ctx = document.getElementById('accident-chart')?.getContext('2d');
        if (!ctx) {
            console.warn('Canvas element #accident-chart not found');
            return;
        }

        const year = document.getElementById('year-select')?.value || new Date().getFullYear().toString();
        const monthValue = document.getElementById('month-select')?.value || 'all';

        let month = 'all';
        if (monthValue !== 'all') {
            const monthNames = [
                "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                "Juli", "Agustus", "September", "Oktober", "November", "Desember"
            ];
            const index = parseInt(monthValue, 10) - 1;
            month = monthNames[index];
        }

        const dataForYear = accidentData[year];

        if (!dataForYear) {
            alert('Data untuk tahun ini tidak tersedia.');
            return;
        }

        if (chartInstance) {
            chartInstance.destroy();
        }

        // Define adjustable sizes
        const barChartWidth = 850;
        const barChartHeight = 450;

        const pieChartWidth = 400;
        const pieChartHeight = 400;
        // Reset canvas styles to prevent layout issues
        const canvas = document.getElementById('accident-chart');
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        canvas.parentElement.style.height = 'auto'; // Prevent container from stretching

        if (month === 'all') {
            const labels = Object.keys(dataForYear);
            const totalData = labels.map(m => dataForYear[m].total || 0);
            const meninggalData = labels.map(m => dataForYear[m].meninggal || 0);
            const lukaBeratData = labels.map(m => dataForYear[m].lukaBerat || 0);
            const lukaRinganData = labels.map(m => dataForYear[m].lukaRingan || 0);

            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'Total Kecelakaan',
                            data: totalData,
                            backgroundColor: '#375b85',
                            borderColor: '#375b85',
                            borderWidth: 1
                        },
                        {
                            label: 'Meninggal',
                            data: meninggalData,
                            backgroundColor: '#F96D62',
                            borderColor: '#F96D62',
                            borderWidth: 1
                        },
                        {
                            label: 'Luka Berat',
                            data: lukaBeratData,
                            backgroundColor: '#FFDD71',
                            borderColor: '#FFDD71',
                            borderWidth: 1
                        },
                        {
                            label: 'Luka Ringan',
                            data: lukaRinganData,
                            backgroundColor: '#DFEDFF',
                            borderColor: '#DFEDFF',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true, // Ensure aspect ratio is maintained
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Jumlah' } },
                        x: { title: { display: true, text: 'Bulan' } }
                    },
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: `Data Kecelakaan Tahun ${year}` }
                    }
                }
            });

            // Set canvas size for bar chart
            canvas.style.width = `${barChartWidth}px`;
            canvas.style.height = `${barChartHeight}px`;
            canvas.parentElement.style.width = `${barChartWidth}px`;
            canvas.parentElement.style.maxHeight = `${barChartHeight}px`; // Prevent excessive vertical growth
        } else {
            const monthData = dataForYear[month];
            if (!monthData) {
                alert('Data untuk bulan ini tidak tersedia.');
                return;
            }

            const labels = ['Meninggal', 'Luka Berat', 'Luka Ringan'];
            const data = [monthData.meninggal || 0, monthData.lukaBerat || 0, monthData.lukaRingan || 0];

            chartInstance = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `Distribusi Kecelakaan ${month} ${year}`,
                        data: data,
                        backgroundColor: ['#F96D62', '#FFDD71', '#DFEDFF'],
                        borderColor: '#ffffff',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true, // Ensure aspect ratio is maintained
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: `Distribusi Kecelakaan ${month} ${year}` }
                    }
                }
            });

            // Set canvas size for pie chart
            canvas.style.width = `${pieChartWidth}px`;
            canvas.style.height = `${pieChartHeight}px`;
            canvas.parentElement.style.width = `${pieChartWidth}px`;
            canvas.parentElement.style.maxHeight = `${pieChartHeight}px`; // Prevent excessive vertical growth
        }
    } catch (e) {
        console.error('Error updating chart:', e);
        // Suppressed chart error
        console.warn('Gagal memuat grafik:', e.message);

    }
}
// mengunduh monitoring data
function downloadChart() {
    try {
        const canvas = document.getElementById('accident-chart');
        if (!canvas || !chartInstance) {
            throw new Error('Chart tidak tersedia untuk diunduh');
        }

        const year = document.getElementById('year-select')?.value || new Date().getFullYear().toString();
        const monthValue = document.getElementById('month-select')?.value;
        let filename = 'accident-chart';

        // Nama file lebih spesifik
        if (monthValue && monthValue !== 'all') {
            const monthNames = [
                "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                "Juli", "Agustus", "September", "Oktober", "November", "Desember"
            ];
            filename = `piechart-${monthNames[parseInt(monthValue) - 1]}-${year}`;
        } else {
            filename += `-${year}`;
        }

        // Buat canvas baru untuk memberi background putih
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
        const ctx = exportCanvas.getContext('2d');

        // Isi background putih
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Gambar chart asli di atas background putih
        ctx.drawImage(canvas, 0, 0);

        // Simpan sebagai JPEG
        const link = document.createElement('a');
        link.href = exportCanvas.toDataURL('image/jpeg', 0.9); // JPEG kualitas 90%
        link.download = `${filename}.jpeg`;
        link.click();
    } catch (e) {
        console.error('Error downloading chart:', e);
        showErrorBoundary('Gagal mengunduh grafik: ' + e.message);
    }
}
// unduh excel monitoring data
function downloadExcel() {
    try {
        if (typeof XLSX === 'undefined') {
            throw new Error('SheetJS tidak dimuat');
        }
        const year = document.getElementById('year-select')?.value || new Date().getFullYear().toString();
        const monthValue = document.getElementById('month-select')?.value;
        const dataForYear = accidentData[year];
        if (!dataForYear) {
            alert('Data untuk tahun ini tidak tersedia.');
            return;
        }

        let data = [];
        let sheetTitle = `Data Kecelakaan Tahun ${year}`;

        if (monthValue && monthValue !== 'all') {
            const monthNames = [
                "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                "Juli", "Agustus", "September", "Oktober", "November", "Desember"
            ];
            const month = monthNames[parseInt(monthValue, 10) - 1];
            const d = dataForYear[month];
            if (!d) {
                alert('Data untuk bulan ini tidak tersedia.');
                return;
            }
            sheetTitle = `Distribusi Kecelakaan ${month} ${year}`;
            data = [
                { Kategori: "Meninggal", Jumlah: d.meninggal || 0 },
                { Kategori: "Luka Berat", Jumlah: d.lukaBerat || 0 },
                { Kategori: "Luka Ringan", Jumlah: d.lukaRingan || 0 }
            ];
        } else {
            Object.keys(dataForYear).forEach(m => {
                const d = dataForYear[m];
                data.push({
                    Bulan: m,
                    'Total Kecelakaan': d.total || 0,
                    Meninggal: d.meninggal || 0,
                    'Luka Berat': d.lukaBerat || 0,
                    'Luka Ringan': d.lukaRingan || 0
                });
            });
        }

        // Buat worksheet kosong
        const worksheet = XLSX.utils.json_to_sheet([]);

        // Tambahkan judul di A1
        XLSX.utils.sheet_add_aoa(worksheet, [[sheetTitle]], { origin: "A1" });

        // Tambahkan data di A3 (supaya ada jarak dari judul)
        XLSX.utils.sheet_add_json(worksheet, data, { origin: "A3", skipHeader: false });

        // Lebar kolom otomatis
        const colWidths = Object.keys(data[0] || {}).map(key => ({
            wch: Math.max(key.length + 2, ...data.map(row => String(row[key] || '').length + 2))
        }));
        worksheet['!cols'] = colWidths;

        // Merge cell judul
        const lastColIndex = Object.keys(data[0]).length - 1;
        worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: lastColIndex } }];

        // Style dasar (bold judul dan header, border semua cell)
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let R = range.s.r; R <= range.e.r; R++) {
            for (let C = range.s.c; C <= range.e.c; C++) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!worksheet[cellRef]) continue;
                worksheet[cellRef].s = {
                    font: { bold: R === 0 || R === 2 }, // Judul & header bold
                    alignment: { horizontal: R === 0 ? 'center' : (typeof worksheet[cellRef].v === 'number' ? 'center' : 'left'), vertical: 'center' },
                    border: {
                        top: { style: 'thin', color: { rgb: '000000' } },
                        bottom: { style: 'thin', color: { rgb: '000000' } },
                        left: { style: 'thin', color: { rgb: '000000' } },
                        right: { style: 'thin', color: { rgb: '000000' } }
                    }
                };
            }
        }

        // Simpan workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Kecelakaan');

        let filename = 'accident-data';
        if (monthValue && monthValue !== 'all') {
            filename = `piechart-data-${monthValue}-${year}`;
        } else {
            filename += `-${year}`;
        }

        XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (e) {
        console.error('Error downloading Excel:', e);
        showErrorBoundary('Gagal mengunduh Excel: ' + e.message);
    }
}

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
    document.getElementById("report-email").value = report.email || "";
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
    document.getElementById('report-email').value = report.pelapor?.email || '';
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
    document.getElementById('report-status').innerText = report.status || '-';
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

            <td><button onclick="openTrackingModal(${report.id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="#375B85" viewBox="0 0 16 16">
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

        // Ambil detail laporan (fallback ke daftar kalau tidak ada detail endpoint)
        const res = await fetch(`https://dragonmontainapi.com/riwayat_laporan.php?user=1`);
        if (!res.ok) throw new Error('Gagal mengambil data laporan');
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

        const margin = 40;
        let y = 50;

        // Header
        doc.setFontSize(16);
        doc.text(`Detail Laporan #${report.id}`, margin, y);
        y += 25;

        doc.setFontSize(11);
        const lines = [
            `Nama Pelapor: ${report.nama || '-'}`,
            `NIK: ${report.nik || '-'}`,
            `Email: ${report.email || '-'}`,
            `Telepon: ${report.telepon || '-'}`,
            `Jenis Kecelakaan: ${report.jenis || '-'}`,
            `Jumlah Korban: ${report.jumlahKorban || '-'}`,
            `Kendaraan: ${report.kendaraan || '-'}`,
            `Titik Kejadian: ${report.titik || '-'}`,
            `Tanggal: ${report.tanggal || '-'}`,
            `Kronologi: ${report.kronologi || '-'}`,
            `Saksi: ${report.saksi || '-'}`,
            `Petugas Menangani: ${report.petugas || '-'}`,
            `Status: ${report.status || '-'}`
        ];

        for (const line of lines) {
            const split = doc.splitTextToSize(line, 500);
            for (const part of split) {
                if (y > 750) { // halaman baru jika sudah hampir habis
                    doc.addPage();
                    y = 50;
                }
                doc.text(part, margin, y);
                y += 14;
            }
        }

        // Gambar bukti jika ada
        if (report.bukti) {
            try {
                if (y > 650) {
                    doc.addPage();
                    y = 50;
                }
                doc.text('Bukti Gambar:', margin, y);
                y += 14;
                const imgData = await loadImageAsDataURL(report.bukti);
                const maxWidth = 250;
                const aspect = 1; // default kalau tidak tahu
                // bisa diimprove dengan membuat Image objek dulu
                doc.addImage(imgData, 'JPEG', margin, y, maxWidth, maxWidth * aspect);
                y += maxWidth + 10;
            } catch (err) {
                console.warn('Gagal memuat gambar bukti:', err);
                if (y > 750) {
                    doc.addPage();
                    y = 50;
                }
                doc.text('Bukti Gambar: [Gagal dimuat]', margin, y);
                y += 14;
            }
        }

        // Simpan / unduh
        doc.save(`laporan_${report.id}.pdf`);
    } catch (e) {
        console.error('Error download PDF:', e);
        alert('Gagal mengunduh PDF: ' + (e.message || e));
    }
}
// mengunduh laporan
function downloadReport(reportId) {
    try {
        if (typeof jspdf === 'undefined') {
            throw new Error('jsPDF is not loaded');
        }
        const { jsPDF } = window.jspdf;
        const report = reports.find(r => r.id === reportId);
        if (!report) {
            alert('Laporan tidak ditemukan!');
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Laporan Kecelakaan', 20, 20);
        doc.setFontSize(12);
        doc.text(`ID: ${report.id}`, 20, 30);
        doc.text(`Nama: ${report.nama}`, 20, 40);
        doc.text(`NIK: ${report.nik}`, 20, 50);
        doc.text(`Email: ${report.email}`, 20, 60);
        doc.text(`Telepon: ${report.telepon}`, 20, 70);
        doc.text(`Saksi: ${report.saksi}`, 20, 80);
        doc.text(`Titik Kecelakaan: ${report.titik}`, 20, 90);
        doc.text(`Tanggal: ${report.tanggal}`, 20, 100);
        doc.text(`Status: ${report.status}`, 20, 110);
        doc.text(`Petugas: ${report.petugas || '-'}`, 20, 120);
        doc.text(`Kendaraan: ${report.kendaraan || '-'}`, 20, 130);
        doc.text(`Jenis Kecelakaan: ${report.jenis || '-'}`, 20, 140);
        doc.text(`Jumlah Korban: ${report.jumlahKorban || '-'}`, 20, 150);
        doc.text(`Kronologi: ${report.kronologi || '-'}`, 20, 160);
        doc.save(`report-${report.id}.pdf`);
    } catch (e) {
        console.error('Error downloading report:', e);
        showErrorBoundary('Gagal mengunduh laporan: ' + e.message);
    }
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
// === Notifikasi Laporan Baru + Suara Sirine ===

// Inisialisasi variabel
let lastReportCount = 0;
const sirineAudio = new Audio("assets/sirine.mp3");
sirineAudio.loop = true; // suara berulang terus sampai ditutup

// Fungsi tampilkan popup di atas tengah
function showNewReportPopup(count) {
  // Hapus popup lama (jika masih ada)
  const oldPopup = document.querySelector(".new-report-popup");
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement("div");
  popup.className = "new-report-popup";
  popup.innerHTML = `
    <div class="popup-content">
      🚨 <strong>Laporan Baru Masuk!</strong>
      <button id="popup-close">Tutup</button>
    </div>
  `;
  popup.style.cssText = `
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #e63946;
  color: white;
  padding: 16px 24px;
  border-radius: 10px;
  font-size: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  animation: popupFade 0.5s ease;
  text-align: center;
`;
  // Animasi popup + efek sirine berdenyut
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes popupFade {
      from { opacity: 0; transform: translate(-50%, -20px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 10px #ff4d4d; }
      50% { box-shadow: 0 0 30px #ff0000; }
      100% { box-shadow: 0 0 10px #ff4d4d; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(popup);

  // Tombol "Tutup"
  document.getElementById("popup-close").onclick = () => {
    popup.remove();
    sirineAudio.pause();
    sirineAudio.currentTime = 0;
  };
}

// Fungsi cek laporan dari API
async function checkNewReportsFromAPI() {
  try {
    const response = await fetch("https://dragonmontainapi.com/riwayat_laporan.php?user=1");
    const data = await response.json();

    // Ambil laporan baru (status = 0 berarti "Terkirim")
    const newReports = data.filter(r => r.status === "0");

    // Jika ada laporan baru sejak terakhir kali
    if (lastReportCount !== 0 && newReports.length > lastReportCount) {
      const diff = newReports.length - lastReportCount;
      showNewReportPopup(diff);
      sirineAudio.play().catch(err => console.warn("⚠️ Audio tidak dapat diputar otomatis:", err));
    }

    // Update jumlah terakhir
    lastReportCount = newReports.length;
  } catch (err) {
    console.error("❌ Gagal mengambil data laporan:", err);
  }
}

// Jalankan otomatis setiap 5 detik
setInterval(checkNewReportsFromAPI, 5000);

// Jalankan pertama kali saat halaman dibuka
checkNewReportsFromAPI();

// Aktifkan izin audio setelah klik pertama
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
// 📦 MANAJEMEN PENGGUNA (MODE LOCAL)
// ===========================

let localUsers = JSON.parse(localStorage.getItem("localUsers")) || [];

// Pastikan kompatibel dengan pemanggilan HTML lama
function loadUsers() {
  renderUsersLocal();
}

// Tampilkan pengguna dari localStorage
function renderUsersLocal() {
  const tbody = document.getElementById("approved-user-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (localUsers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Belum ada data pengguna</td></tr>`;
    return;
  }

  localUsers.forEach((user, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${user.nama}</td>
      <td>${user.email}</td>
      <td>${user.no_hp}</td>
      <td>${user.nik}</td>
      <td>${user.kategori}</td>
      <td>${user.terakhir_aktif || "-"}</td>
      <td style="display: flex; justify-content: center; align-items: center; gap: 10px;">
        <button class="btn-icon btn-edit" onclick="editUserLocal(${index})" title="Edit"
            style="background:none; border:none; color:#007bff; cursor:pointer;">
            <i class="fa-solid fa-edit"></i>
        </button>

        <button class="btn-icon btn-delete" onclick="deleteUserLocal(${index})" title="Hapus"
            style="background:none; border:none; color:#dc3545; cursor:pointer;">
            <i class="fa-solid fa-trash"></i>
        </button>
    </td>`;
    tbody.appendChild(row);
  });
}

// Buka modal tambah pengguna
function openAddUserModal() {
  document.getElementById("user-modal-title").textContent = "Tambah Pengguna";
  document.getElementById("user-id").value = "";
  document.getElementById("user-nama").value = "";
  document.getElementById("user-email").value = "";
  document.getElementById("user-nohp").value = "";
  document.getElementById("user-nik").value = "";
  document.getElementById("user-kategori").value = "User";
  document.getElementById("user-modal").style.display = "flex";
}

// Simpan data (tambah / edit)
function saveUserLocal() {
  const id = document.getElementById("user-id").value;
  const nama = document.getElementById("user-nama").value.trim();
  const email = document.getElementById("user-email").value.trim();
  const no_hp = document.getElementById("user-nohp").value.trim();
  const nik = document.getElementById("user-nik").value.trim();
  const kategori = document.getElementById("user-kategori").value;

  if (!nama || !email || !nik) {
    alert("Nama, Email, dan NIK wajib diisi!");
    return;
  }

  const userData = {
    nama,
    email,
    no_hp,
    nik,
    kategori,
    terakhir_aktif: new Date().toLocaleString()
  };

  if (id) {
    localUsers[id] = userData;
  } else {
    localUsers.push(userData);
  }

  localStorage.setItem("localUsers", JSON.stringify(localUsers));
  renderUsersLocal();
  closeUserModal();
}

// Edit pengguna
function editUserLocal(index) {
  const user = localUsers[index];
  if (!user) return;

  document.getElementById("user-modal-title").textContent = "Edit Pengguna";
  document.getElementById("user-id").value = index;
  document.getElementById("user-nama").value = user.nama;
  document.getElementById("user-email").value = user.email;
  document.getElementById("user-nohp").value = user.no_hp;
  document.getElementById("user-nik").value = user.nik;
  document.getElementById("user-kategori").value = user.kategori;

  document.getElementById("user-modal").style.display = "flex";
}

// Hapus pengguna
function deleteUserLocal(index) {
  if (!confirm("Yakin ingin menghapus pengguna ini?")) return;
  localUsers.splice(index, 1);
  localStorage.setItem("localUsers", JSON.stringify(localUsers));
  renderUsersLocal();
}

// Tutup modal
function closeUserModal() {
  const modal = document.getElementById("user-modal");
  if (modal) modal.style.display = "none";
}
function setupAddUserModal() {
  console.log("setupAddUserModal dipanggil (kompatibilitas mode lokal)");
  // Tidak perlu melakukan apa pun, karena kita sudah punya openAddUserModal()
}

// Tombol simpan & batal di modal
document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("save-user-btn");
  const cancelBtn = document.getElementById("cancel-user-btn");
  const closeBtn = document.getElementById("user-modal-close");

  if (saveBtn) saveBtn.onclick = saveUserLocal;
  if (cancelBtn) cancelBtn.onclick = closeUserModal;
  if (closeBtn) closeBtn.onclick = closeUserModal;

  // Render awal (jika section pengguna aktif)
  if (document.getElementById("approved-user-table-body")) {
    renderUsersLocal();
  }
});


// ==================== Manajemen Petugas ====================

// Data awal petugas (dummy, bisa diganti dari API/DB)
let petugasList = JSON.parse(localStorage.getItem("petugasList")) || [
  { id: 1, nama: "Budi Santoso", unit: "Lantas Polresta Bogor" },
  { id: 2, nama: "Siti Rahma", unit: "Dinas Perhubungan" },
  { id: 3, nama: "Andi Pratama", unit: "Damkar Kota Bogor" }
];

let currentPetugasPage = 1;
const petugasPerPage = 5;
let editingPetugasId = null;

// ==================== RENDER DATA PETUGAS ====================
function renderPetugas() {
  const tbody = document.getElementById("petugas-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  const start = (currentPetugasPage - 1) * petugasPerPage;
  const end = start + petugasPerPage;
  const pageData = petugasList.slice(start, end);

  if (pageData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Belum ada data petugas</td></tr>`;
  } else {
    pageData.forEach((p, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
    <td style="text-align:left;">${start + index + 1}</td>
    <td style="text-align:left;">${p.nama}</td>
    <td style="text-align:left;">${p.unit}</td>
    <td style="display: flex; justify-content: flex-end; align-items: center; gap: 10px; width: 100%;">
  <button class="btn-icon btn-edit" onclick="editPetugas(${p.id})" title="Edit"
      style="background:none; border:none; color:#007bff; cursor:pointer;">
      <i class="fa-solid fa-edit"></i>
  </button>

  <button class="btn-icon btn-delete" onclick="deletePetugas(${p.id})" title="Hapus"
      style="background:none; border:none; color:#dc3545; cursor:pointer;">
      <i class="fa-solid fa-trash"></i>
  </button>
</td>`;
      tbody.appendChild(row);
    });
  }

  const pageInfo = document.getElementById("petugas-page-info");
  if (pageInfo) {
    const totalPages = Math.max(1, Math.ceil(petugasList.length / petugasPerPage));
    pageInfo.textContent = `Halaman ${currentPetugasPage} dari ${totalPages}`;
  }

  updatePetugasDropdown();
  localStorage.setItem("petugasList", JSON.stringify(petugasList)); // Simpan otomatis
}

// ==================== UPDATE DROPDOWN ====================
function updatePetugasDropdown() {
  const select = document.getElementById("report-petugas");
  if (!select) return;
  select.innerHTML = `<option value="">-- Pilih Petugas --</option>`;
  petugasList.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.nama;
    opt.textContent = `${p.nama} - ${p.unit}`;
    select.appendChild(opt);
  });
}
// === Modal Tambah / Edit Petugas ===
function openAddPetugasModal() {
  const modal = document.getElementById("petugasModal");
  if (modal) {
    modal.style.display = "flex"; // tampilkan modal di tengah
  }
}

function closePetugasModal() {
  const modal = document.getElementById("petugasModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Tutup modal jika klik di luar area
window.addEventListener("click", (e) => {
  const modal = document.getElementById("petugasModal");
  if (e.target === modal) {
    closePetugasModal();
  }
});
// ==================== SIMPAN PETUGAS ====================
function savePetugasLocal(event) {
  event.preventDefault();

  const nama = document.getElementById("petugas-nama").value.trim();
  const unit = document.getElementById("petugas-unit").value.trim();

  if (!nama || !unit) {
    alert("Nama dan Unit wajib diisi!");
    return;
  }

  // Jika sedang edit
  if (editingPetugasId) {
    const index = petugasList.findIndex(p => p.id === editingPetugasId);
    if (index !== -1) {
      petugasList[index].nama = nama;
      petugasList[index].unit = unit;
    }
    editingPetugasId = null;
    alert("✅ Data petugas berhasil diperbarui!");
  } else {
    // Tambah baru
    const newPetugas = {
      id: Date.now(),
      nama,
      unit
    };
    petugasList.push(newPetugas);
    alert("✅ Petugas berhasil ditambahkan!");
  }

  // Simpan ke localStorage
  localStorage.setItem("petugasList", JSON.stringify(petugasList));

  // Tutup modal & render ulang tabel
  closePetugasModal();
  renderPetugas();

  // Reset form
  document.getElementById("petugas-form").reset();
}

// ==================== MODAL CONTROL ====================
function openPetugasModal(isEdit = false, id = null) {
  const modal = document.getElementById("petugasModal");
  const title = document.getElementById("modal-petugas-title");
  const form = document.getElementById("petugas-form");

  if (!modal || !form) return;

  form.reset();
  editingPetugasId = null;

  if (isEdit && id) {
    const petugas = petugasList.find(p => p.id === id);
    if (petugas) {
      document.getElementById("petugas-nama").value = petugas.nama;
      document.getElementById("petugas-unit").value = petugas.unit;
      title.textContent = "Edit Petugas";
      editingPetugasId = id;
    }
  } else {
    title.textContent = "Tambah Petugas";
  }

  modal.style.display = "flex";
}

function closePetugasModal() {
  const modal = document.getElementById("petugasModal");
  if (modal) modal.style.display = "none";
  editingPetugasId = null;
}

// Tutup modal jika klik di luar area modal (tidak ganggu modal lain)
window.addEventListener("click", (event) => {
  const modal = document.getElementById("petugasModal");
  if (modal && event.target === modal) {
    closePetugasModal();
  }
});

// ==================== SIMPAN / EDIT DATA PETUGAS ====================
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

// ==================== INISIALISASI ====================
document.addEventListener("DOMContentLoaded", renderPetugas);

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

function renderTrackingPagination(totalReports) {
    const container = document.querySelector("#tracking-section .pagination");
    if (!container) {
        console.warn('Pagination container not found');
        return;
    }

    container.innerHTML = '';
    const totalPages = Math.ceil(totalReports / reportsPerPage);

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Kembali';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderTracking(currentTrackingCategory);
        }
    };
    container.appendChild(prevBtn);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Lanjut';
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
let map2024, map2023;
let markers2024 = [], markers2023 = [];

// koordinat Kota Bogor 2024 KML
const kecamatanData = {
    'Bubulak': { lat: -6.570208223813363, lng: 106.7565194694282 },
    'Dramaga': { lat: -6.572608378485456, lng: 106.747930077638 },
    'Lampu Merah Taman Yasmin': { lat: -6.555958501794913, lng: 106.7784828147841 },
    'Cibadak Tanah Sareal': { lat: -6.544611892548439, lng: 106.7731278546059 },
    'Kedung Badak': { lat: -6.562257918614856, lng: 106.7998199235766 },
    'Kp. Parung Jambu': { lat: -6.564396338899163, lng: 106.8106824175915 },
    'Kedung Halang': { lat: -6.552710431327665, lng: 106.81251174263 },
    'Kedung Halang Cibuluh': { lat: -6.554589548346053, lng: 106.8188880690398 },
    'Lampu Merah Jambu 2': { lat: -6.5694232334349, lng: 106.8093644933911 },
    'Kebon Pedes': { lat: -6.565473361203066, lng: 106.8019551990389 },
    'Pajajaran': { lat: -6.589475833982675, lng: 106.8047925432704 },
    'Paledang': { lat: -6.60364436001798, lng: 106.7960604610907 },
    'Baranang Siang': { lat: -6.600985535081746, lng: 106.812318375066 },
    'Tegal Gundil': { lat: -6.583269865076198, lng: 106.8176317081693 },
    'Ciomas': { lat: -6.600958883585266, lng: 106.7797109261217 },
    'Cikaret': { lat: -6.613363346923583, lng: 106.7887135179587 },
    'Jl. Pahlawan Kampung Bondongan': { lat: -6.613102465250727, lng: 106.8036636288571 },
    'Jl. Durian Raya': { lat: -6.618262987993308, lng: 106.8198138131263 },
    'Jl. Raya Tajur': { lat: -6.633785752488644, lng: 106.8259826446364 },
    'Jl. Raya Wangun Sindangsari': { lat: -6.644482565341315, lng: 106.8398110734623 },
    'Rancamaya': { lat: -6.662571280477469, lng: 106.8449973082993 },
    'Pamoyanan': { lat: -6.637845889823711, lng: 106.8081482640095 },
    'Semeru': { lat: -6.581692833413745, lng: 106.7778405342488 },
    'Merdeka': { lat: -6.589953583795155, lng: 106.7864180698409 }
};

// koordinat Kota Bogor 2023 KML
const kecamatanData2023 = {
    'Dramaga': { lat: -6.568661277741601, lng: 106.7545154021631 },
    'Sindang Barang': { lat: -6.576561540949736, lng: 106.754544152196 },
    'Loji': { lat: -6.583210831921096, lng: 106.7695756661669 },
    'Pasir Jaya': { lat: -6.596536673245207, lng: 106.7808125038127 },
    'Paledang': { lat: -6.593383153915527, lng: 106.7973655072452 },
    'Kebon Pedes': { lat: -6.579442874743195, lng: 106.7932724948944 },
    'Bantar Jati': { lat: -6.579375017041754, lng: 106.8071009592785 },
    'Cibuluh': { lat: -6.566611102758012, lng: 106.8137480450873 },
    'Kedung Badak': { lat: -6.561813136285853, lng: 106.8020183276574 },
    'Kedung Halang': { lat: -6.560246739361919, lng: 106.813096839432 },
    'Ciluar': { lat: -6.548086093362666, lng: 106.8230620189604 },
    'Baranang Siang': { lat: -6.613374494707477, lng: 106.8134261304722 },
    'Bondongan': { lat: -6.614292955416663, lng: 106.8034493146086 },
    'Pakuan': { lat: -6.63629592115764, lng: 106.8284125348147 },
    'Pamoyanan': { lat: -6.641038472572218, lng: 106.808174312126 },
    'Mulyaharja': { lat: -6.643095677148961, lng: 106.7842352175984 },
    'Sindangsari': { lat: -6.652309573746444, lng: 106.8454867867472 },
    'Bojong Kerta': { lat: -6.671827618587204, lng: 106.8362679477889 },
    'Kayu Manis': { lat: -6.533966300168681, lng: 106.7677376258943 },
    'Cibadak': { lat: -6.557134790785204, lng: 106.7815261742859 },
    'Semplak': { lat: -6.563409162779847, lng: 106.7642768476164 }
};

// data dummy titik laporan 2024 and 2023 (for reference, but we'll use reports data instead)
// Default accident counts for 2024
const reports2024 = [
// Bubulak
{ nama: "Eko Saputra", tanggal: "2024-01-18 14:00", telepon: "086259316570", titik: "Bubulak", jenis: "Motor vs Mobil" },
{ nama: "Rina Sari", tanggal: "2024-01-20 09:30", telepon: "087654321098", titik: "Bubulak", jenis: "Sepeda vs Mobil" },
{ nama: "Andi Prasetyo", tanggal: "2024-01-22 16:45", telepon: "085678912345", titik: "Bubulak", jenis: "Motor vs Motor" },
// Dramaga
{ nama: "Gilang Putra", tanggal: "2024-07-02 17:00", telepon: "088274050050", titik: "Dramaga", jenis: "Kecelakaan Tunggal" },
{ nama: "Siti Aisyah", tanggal: "2024-07-05 10:15", telepon: "089876543210", titik: "Dramaga", jenis: "Tabrakan" },
{ nama: "Rudi Hartono", tanggal: "2024-07-10 14:30", telepon: "087654321098", titik: "Dramaga", jenis: "Motor vs Mobil" },
{ nama: "Dewi Lestari", tanggal: "2024-07-12 09:45", telepon: "085432109876", titik: "Dramaga", jenis: "Kecelakaan Tunggal" },
{ nama: "Andi Setiawan", tanggal: "2024-07-15 16:00", telepon: "086543210987", titik: "Dramaga", jenis: "Tabrakan" },
// Lampu merah taman yasmin
{ nama: "Joko Saputra", tanggal: "2024-05-24 09:00", telepon: "082261114555", titik: "Lampu Merah Taman Yasmin", jenis: "Motor vs Mobil" },
{ nama: "Fajar Pramono", tanggal: "2024-05-26 11:30", telepon: "081234567890", titik: "Lampu Merah Taman Yasmin", jenis: "Tabrakan" },
{ nama: "Nina Sari", tanggal: "2024-05-28 15:45", telepon: "087654321234", titik: "Lampu Merah Taman Yasmin", jenis: "Kecelakaan Tunggal" },
{ nama: "Rizky Aditya", tanggal: "2024-05-30 13:00", telepon: "085678912345", titik: "Lampu Merah Taman Yasmin", jenis: "Motor vs Motor" },
{ nama: "Lina Amelia", tanggal: "2024-06-01 08:15", telepon: "089876543210", titik: "Lampu Merah Taman Yasmin", jenis: "Tabrakan" },
{ nama: "Budi Santoso", tanggal: "2024-06-03 17:30", telepon: "082345678901", titik: "Lampu Merah Taman Yasmin", jenis: "Kecelakaan Tunggal" },
{ nama: "Citra Dewi", tanggal: "2024-06-05 10:00", telepon: "086543210987", titik: "Lampu Merah Taman Yasmin", jenis: "Motor vs Mobil" },
// Cibadak tanah sareal
{ nama: "Hani Lestari", tanggal: "2024-09-12 12:00", telepon: "089634257496", titik: "Cibadak Tanah Sareal", jenis: "Motor vs Mobil" },
{ nama: "Budi Santoso", tanggal: "2024-09-15 15:30", telepon: "087123456789", titik: "Cibadak Tanah Sareal", jenis: "Kecelakaan Tunggal" },
{ nama: "Rina Sari", tanggal: "2024-09-18 09:00", telepon: "088765432109", titik: "Cibadak Tanah Sareal", jenis: "Tabrakan" },
{ nama: "Fajar Prabowo", tanggal: "2024-09-20 14:45", telepon: "086543210987", titik: "Cibadak Tanah Sareal", jenis: "Motor vs Motor" },
// Kedung badak
{ nama: "Hani Aulia", tanggal: "2024-03-26 16:00", telepon: "088064600209", titik: "Kedung Badak", jenis: "Motor vs Mobil" },
{ nama: "Amelia sari", tanggal: "2024-01-08 11:00", telepon: "08806460055", titik: "Kedung Badak", jenis: "Kecelakaan Beruntun" },
// Kp. Parung jambu
{ nama: "Ravindra Althafani", tanggal: "2024-04-24 12:00", telepon: "089109829774", titik: "Kp. Parung Jambu", jenis: "Kecelakaan Tunggal" },
{ nama: "Syakira Vellicia", tanggal: "2024-04-25 08:15", telepon: "081298334782", titik: "Kp. Parung Jambu", jenis: "Kecelakaan Beruntun" },
{ nama: "Ghibran Elvardio", tanggal: "2024-04-26 16:40", telepon: "082143778912", titik: "Kp. Parung Jambu", jenis: "Tabrak Lari" },
{ nama: "Anindira Maheswari", tanggal: "2024-04-27 10:05", telepon: "087654234109", titik: "Kp. Parung Jambu", jenis: "Kecelakaan Tunggal" },
{ nama: "Zahlan Revandika", tanggal: "2024-04-28 19:25", telepon: "083177654982", titik: "Kp. Parung Jambu", jenis: "Kecelakaan Ganda" },
{ nama: "Maika Rhedavira", tanggal: "2024-04-29 06:50", telepon: "085611223978", titik: "Kp. Parung Jambu", jenis: "Tabrak Pejalan Kaki" },
// Kedung halang
{ nama: "Levano Rakhendra", tanggal: "2024-05-02 09:10", telepon: "081234567891", titik: "Kedung Halang", jenis: "Kecelakaan Ganda" },
{ nama: "Nadiva Selestia", tanggal: "2024-05-03 14:45", telepon: "085612345678", titik: "Kedung Halang", jenis: "Tabrak Lari" },
{ nama: "Faizlan Dirgantara", tanggal: "2024-05-04 18:30", telepon: "082198765432", titik: "Kedung Halang", jenis: "Kecelakaan Tunggal" },
// Kedung halang cibuluh
{ nama: "Budi Maulana", tanggal: "2024-02-24 16:00", telepon: "082217847087", titik: "Kedung Halang Cibuluh", jenis: "Motor Slip" },
// Lampu Merah Jambu
{ nama: "Keyvan Mahardika", tanggal: "2024-06-01 07:20", telepon: "082134567890", titik: "Lampu Merah Jambu", jenis: "Tabrak Pejalan Kaki" },
{ nama: "Alesha Nurfadhilah", tanggal: "2024-06-01 12:35", telepon: "085798765432", titik: "Lampu Merah Jambu", jenis: "Kecelakaan Ganda" },
{ nama: "Deyandra Raufiano", tanggal: "2024-06-02 08:50", telepon: "081212345678", titik: "Lampu Merah Jambu", jenis: "Kecelakaan Tunggal" },
{ nama: "Zeneva Athaleya", tanggal: "2024-06-02 17:40", telepon: "087701112233", titik: "Lampu Merah Jambu", jenis: "Tabrak Lari" },
{ nama: "Raffasya Dzakyano", tanggal: "2024-06-03 06:55", telepon: "089812345612", titik: "Lampu Merah Jambu", jenis: "Kecelakaan Beruntun" },
{ nama: "Azzura Kireina", tanggal: "2024-06-03 14:10", telepon: "083812345999", titik: "Lampu Merah Jambu", jenis: "Tabrak Pejalan Kaki" },
{ nama: "Zavian Elnarendra", tanggal: "2024-06-04 11:25", telepon: "086777665544", titik: "Lampu Merah Jambu", jenis: "Kecelakaan Ganda" },
{ nama: "Inara Salwina", tanggal: "2024-06-04 20:05", telepon: "082177889900", titik: "Lampu Merah Jambu", jenis: "Kecelakaan Tunggal" },
// Kebon Pedes
{ nama: "Rifqi Yudhistira", tanggal: "2024-05-10 08:00", telepon: "082123456701", titik: "Kebon Pedes", jenis: "Kecelakaan Tunggal" },
{ nama: "Shaqina Elverina", tanggal: "2024-05-11 15:20", telepon: "081345672309", titik: "Kebon Pedes", jenis: "Tabrak Pejalan Kaki" },
{ nama: "Arelio Mahdyan", tanggal: "2024-05-12 10:45", telepon: "085234567801", titik: "Kebon Pedes", jenis: "Kecelakaan Beruntun" },
{ nama: "Nayaka Estrella", tanggal: "2024-05-13 19:30", telepon: "087812349900", titik: "Kebon Pedes", jenis: "Kecelakaan Ganda" },
// Pajajaran
{ nama: "Tafarel Nugraprana", tanggal: "2024-07-01 09:10", telepon: "081234567800", titik: "Pajajaran", jenis: "Kecelakaan Tunggal" },
{ nama: "Maresha Ayuningtyas", tanggal: "2024-07-01 13:25", telepon: "082167543210", titik: "Pajajaran", jenis: "Tabrak Lari" },
{ nama: "Janitra Rakhmawan", tanggal: "2024-07-02 07:45", telepon: "085799001122", titik: "Pajajaran", jenis: "Kecelakaan Ganda" },
{ nama: "Elvano Pradipta", tanggal: "2024-07-02 18:15", telepon: "087733321100", titik: "Pajajaran", jenis: "Kecelakaan Beruntun" },
{ nama: "Sekar Alverinda", tanggal: "2024-07-03 11:00", telepon: "083800998877", titik: "Pajajaran", jenis: "Tabrak Pejalan Kaki" },
// Paledang
{ nama: "Dewi sintia", tanggal: "2024-07-22 11:00", telepon: "082789924185", titik: "Paledang", jenis: "Motor Slip" },
{ nama: "Muhamad Ubed", tanggal: "2024-03-01 03:14", telepon: "082217356890", titik: "Paledang", jenis: "Supir Mengantuk" },
// Baranang Siang
{ nama: "Arkana Wiraputra", tanggal: "2024-07-05 06:40", telepon: "081299887766", titik: "Baranang Siang", jenis: "Kecelakaan Tunggal" },
{ nama: "Calyra Nindhyasari", tanggal: "2024-07-05 14:10", telepon: "085267889901", titik: "Baranang Siang", jenis: "Tabrak Pejalan Kaki" },
{ nama: "Damaris Yuvendra", tanggal: "2024-07-06 08:55", telepon: "082177661234", titik: "Baranang Siang", jenis: "Kecelakaan Ganda" },
{ nama: "Zhafira Khairanisa", tanggal: "2024-07-06 19:30", telepon: "087711234567", titik: "Baranang Siang", jenis: "Tabrak Lari" },
{ nama: "Ihsan Mahegrana", tanggal: "2024-07-07 10:20", telepon: "089800776655", titik: "Baranang Siang", jenis: "Kecelakaan Beruntun" },
{ nama: "Raissa Velmarani", tanggal: "2024-07-07 17:05", telepon: "083144556677", titik: "Baranang Siang", jenis: "Kecelakaan Ganda" },
// Tegal Gundil
{ nama: "Nareswara Galindra", tanggal: "2024-07-08 07:25", telepon: "082100334455", titik: "Tegal Gundil", jenis: "Kecelakaan Tunggal" },
{ nama: "Kezara Mulandari", tanggal: "2024-07-08 13:50", telepon: "085612009988", titik: "Tegal Gundil", jenis: "Tabrak Pejalan Kaki" },
{ nama: "Riyanza Mahardhika", tanggal: "2024-07-09 18:10", telepon: "081234998877", titik: "Tegal Gundil", jenis: "Kecelakaan Ganda" },
// Ciomas
{ nama: "Fani oktaviani", tanggal: "2024-06-16 15:00", telepon: "089038524789", titik: "Ciomas", jenis: "Kecelakaan Tunggal" },
{ nama: "Varesta Anindyo", tanggal: "2024-07-10 08:30", telepon: "082133446655", titik: "Ciomas", jenis: "Kecelakaan Tunggal" },
{ nama: "Larissa Maheswari", tanggal: "2024-07-10 14:15", telepon: "087766554433", titik: "Ciomas", jenis: "Tabrak Lari" },
{ nama: "Rayyanza Dilavero", tanggal: "2024-07-11 10:45", telepon: "085211009988", titik: "Ciomas", jenis: "Kecelakaan Ganda" },
// Cikaret
{ nama: "Muhamad Maulana", tanggal: "2024-05-13 16:00", telepon: "082967150360", titik: "Cikaret", jenis: "Motor Slip" },
// Kp Bondongan
{ nama: "Muhamad Zikrillah", tanggal: "2024-09-14 13:00", telepon: "087173141640", titik: "Jl. Pahlawan Kampung Bondongan", jenis: "Motor vs Mobil" },
{ nama: "Rayeska Adityawan", tanggal: "2024-07-12 07:10", telepon: "082199003344", titik: "Jl. Pahlawan Kampung Bondong", jenis: "Kecelakaan Tunggal" },
{ nama: "Shezanah Milendra", tanggal: "2024-07-12 13:40", telepon: "081233445566", titik: "Jl. Pahlawan Kampung Bondong", jenis: "Kecelakaan Ganda" },
{ nama: "Dhafin Rakendra", tanggal: "2024-07-13 09:00", telepon: "085267890012", titik: "Jl. Pahlawan Kampung Bondong", jenis: "Tabrak Pejalan Kaki" },
{ nama: "Nayara Devandira", tanggal: "2024-07-13 18:25", telepon: "087700123456", titik: "Jl. Pahlawan Kampung Bondong", jenis: "Tabrak Lari" },
// Durian Jaya
{ nama: "Rendy Azzami", tanggal: "2024-03-19 17:00", telepon: "089744914007", titik: "Jl. Durian Raya", jenis: "Tabrakan" },
{ nama: "yusuf putro", tanggal: "2024-02-14 10:00", telepon: "0896543723846", titik: "Jl. Durian Raya", Jenis: "Supir Mengantuk" },
// Jl Raya Tajur
{ nama: "Indah Yulianti", tanggal: "2024-08-08 12:00", telepon: "087345136987", titik: "Jl. Raya Tajur", jenis: "Motor vs Mobil" },
{ nama: "Yudvira Mahaprana", tanggal: "2024-07-15 06:50", telepon: "082144556677", titik: "Jl. Raya Tajur", jenis: "Kecelakaan Tunggal" },
{ nama: "Calista Nuravella", tanggal: "2024-07-15 12:30", telepon: "081266778899", titik: "Jl. Raya Tajur", jenis: "Tabrak Pejalan Kaki" },
{ nama: "Davintra Elvaruno", tanggal: "2024-07-16 08:10", telepon: "087711223344", titik: "Jl. Raya Tajur", jenis: "Kecelakaan Ganda" },
{ nama: "Kenandra Salwinda", tanggal: "2024-07-16 17:55", telepon: "085600998877", titik: "Jl. Raya Tajur", jenis: "Tabrak Lari" },
{ nama: "Fathian Ragantara", tanggal: "2024-07-17 09:40", telepon: "089900112233", titik: "Jl. Raya Tajur", jenis: "Kecelakaan Beruntun" },
{ nama: "Syakira Levandria", tanggal: "2024-07-17 14:05", telepon: "082134009900", titik: "Jl. Raya Tajur", jenis: "Kecelakaan Ganda" },
// Jl Raya wangun sindang sari
{ nama: "Mutiaroh", tanggal: "2024-10-15 14:00", telepon: "081888880123", titik: "Jl. Raya Wangun Sindangsari", jenis: "Kecelakaan Tunggal" },
{ nama: "Zhafran Rizqullah", tanggal: "2024-07-19 07:35", telepon: "082145678901", titik: "Jl. Raya Wangun Sindangsari", jenis: "Kecelakaan Ganda" },
{ nama: "Aurelia Salsabilla", tanggal: "2024-07-19 16:20", telepon: "081255667788", titik: "Jl. Raya Wangun Sindangsari", jenis: "Tabrak Pejalan Kaki" },
// Rancamaya
{ nama: "Atis Sutisno", tanggal: "2024-01-25 09:00", telepon: "081511512121", titik: "Rancamaya", jenis: "Motor Slip" },
{ nama: "Arkhanza Putrawira", tanggal: "2024-07-20 08:25", telepon: "082133221100", titik: "Rancamaya", jenis: "Kecelakaan Tunggal" },
{ nama: "Zivana Elmareta", tanggal: "2024-07-20 13:45", telepon: "085677889900", titik: "Rancamaya", jenis: "Tabrak Lari" },
{ nama: "Naufal Rayesvara", tanggal: "2024-07-21 18:10", telepon: "081288776655", titik: "Rancamaya", jenis: "Kecelakaan Ganda" },
// Pamoyanan
{ nama: "Sifa Anggraeni", tanggal: "2024-02-14 11:00", telepon: "088123789456", titik: "Pamoyanan", jenis: "Motor vs Mobil" },
{ nama: "Zayandra Mahavira", tanggal: "2024-07-22 09:15", telepon: "082199334455", titik: "Pamoyanan", jenis: "Kecelakaan Tunggal" },
// Semeru
{ nama: "Muhamad Ubed", tanggal: "2024-05-27 08:00", telepon: "083212345678", titik: "Semeru", jenis: "Tabrakan" },
{ nama: "Zayandra Mahavira", tanggal: "2024-07-22 09:15", telepon: "082199334455", titik: "Pamoyanan", jenis: "Kecelakaan Tunggal" },
{ nama: "Alviano Pradipta", tanggal: "2024-07-22 14:20", telepon: "081234556677", titik: "Pamoyanan", jenis: "Tabrak Lari" },
{ nama: "Maureena Khairunnisa", tanggal: "2024-07-23 07:40", telepon: "085788990011", titik: "Pamoyanan", jenis: "Kecelakaan Ganda" },
{ nama: "Elvano Zhafranda", tanggal: "2024-07-23 17:05", telepon: "087700889911", titik: "Pamoyanan", jenis: "Kecelakaan Beruntun" },
// Merdeka
{ nama: "Tio Setiawan", tanggal: "2024-06-30 10:00", telepon: "086123456789", titik: "Merdeka", jenis: "Kecelakaan Tunggal" },
{ nama: "Ravindra Elhakim", tanggal: "2024-07-25 07:20", telepon: "081234567800", titik: "Merdeka", jenis: "Kecelakaan Tunggal" },
{ nama: "Shafana Diandra", tanggal: "2024-07-25 13:50", telepon: "082145678911", titik: "Merdeka", jenis: "Tabrak Lari" },
{ nama: "Fayruz Mahardhika", tanggal: "2024-07-26 09:10", telepon: "085699887700", titik: "Merdeka", jenis: "Kecelakaan Ganda" },
{ nama: "Nayandra Kirani", tanggal: "2024-07-26 17:45", telepon: "087788900123", titik: "Merdeka", jenis: "Tabrak Pejalan Kaki" },
{ nama: "Alvino Rizqillah", tanggal: "2024-07-27 08:30", telepon: "089811122233", titik: "Merdeka", jenis: "Kecelakaan Beruntun" },
];


// Default accident counts for 2023
const reports2023 = [
// Dramaga
{ nama: "Zafran Alif", tanggal: "2023-07-11 18:00", telepon: "082151214739", titik: "Dramaga", jenis: "Tabrakan" },
{ nama: "Kirana Nadhira", tanggal: "2023-07-15 14:30", telepon: "081234567890", titik: "Dramaga", jenis: "Kecelakaan Tunggal" },
{ nama: "Rizky Fadhilah", tanggal: "2023-07-20 09:15", telepon: "087654321012", titik: "Dramaga", jenis: "Motor vs Mobil" },
{ nama: "Salsabila Rania", tanggal: "2023-07-25 16:45", telepon: "085678912345", titik: "Dramaga", jenis: "Tabrakan"},
// Sindang Barang
{ nama: "Damar Pramudita", tanggal: "2023-05-20 15:00", telepon: "081506205026", titik: "Sindang Barang", jenis: "Tabrakan" },
{ nama: "Fahri Ramadhan", tanggal: "2023-05-22 10:00", telepon: "089876543210", titik: "Sindang Barang", jenis: "Kecelakaan Tunggal" },
{ nama: "Larasati Cempaka", tanggal: "2023-05-25 13:30", telepon: "082345678901", titik: "Sindang Barang", jenis: "Motor vs Motor" },
// Loji
{ nama: "Arunika Sari", tanggal: "2023-05-16 11:00", telepon: "084377462370", titik: "Loji", jenis: "Motor Slip" },
{ nama: "Gilang Prabowo", tanggal: "2023-05-18 08:30", telepon: "086543210987", titik: "Loji", jenis: "Tabrakan" },
// Pasir Jaya
{ nama: "Hani Saputra", tanggal: "2023-03-08 17:00", telepon: "085512459991", titik: "Pasir Jaya", jenis: "Motor vs Mobil" },
{ nama: "Nadia Kencana", tanggal: "2023-03-10 14:00", telepon: "087654321098", titik: "Pasir Jaya", jenis: "Kecelakaan Tunggal" },
{ nama: "Rizal Akbar", tanggal: "2023-03-12 09:30", telepon: "088765432109", titik: "Pasir Jaya", jenis: "Tabrakan" },
{ nama: "Siti Nurani", tanggal: "2023-03-15 11:15", telepon: "089012345678", titik: "Pasir Jaya", jenis: "Motor vs Motor" },
{ nama: "Tari Melati", tanggal: "2023-03-20 16:45", telepon: "081234567890", titik: "Pasir Jaya", jenis: "Kecelakaan Tunggal" },
// Paledang
{ nama: "Zahra Kencana", tanggal: "2023-08-01 14:30", telepon: "089123456789", titik: "Paledang", jenis: "Motor vs Mobil" },
{ nama: "Rizky Pramudita", tanggal: "2023-08-05 10:15", telepon: "087654321012", titik: "Paledang", jenis: "Kecelakaan Tunggal" },
{ nama: "Fahmi Alamsyah", tanggal: "2023-08-10 16:45", telepon: "086543210987", titik: "Paledang", jenis: "Tabrakan" },
// Kebon pedes
{ nama: "Nadia Cendana", tanggal: "2023-09-01 09:00", telepon: "085678912345", titik: "Kebon Pedes", jenis: "Motor vs Motor" },
{ nama: "Damar Wicaksono", tanggal: "2023-09-03 11:30", telepon: "084321098765", titik: "Kebon Pedes", jenis: "Kecelakaan Tunggal" },
{ nama: "Sari Melati", tanggal: "2023-09-05 13:15", telepon: "089876543210", titik: "Kebon Pedes", jenis: "Tabrakan" },
{ nama: "Galih Prabowo", tanggal: "2023-09-07 15:45", telepon: "082345678901", titik: "Kebon Pedes", jenis: "Motor vs Mobil" },
{ nama: "Larasati Purnama", tanggal: "2023-09-10 17:00", telepon: "081234567890", titik: "Kebon Pedes", jenis: "Kecelakaan Tunggal" },
{ nama: "Raka Aditya", tanggal: "2023-09-12 18:30", telepon: "087654321098", titik: "Kebon Pedes", jenis: "Tabrakan" },
// Bantar Jati
{ nama: "Eko Maulana", tanggal: "2023-10-10 09:00", telepon: "087451625745", titik: "Bantar Jati", jenis: "Tabrakan" },
// Cibuluh
{ nama: "Dewangga Suryadi", tanggal: "2023-09-15 10:00", telepon: "088123456789", titik: "Cibuluh", jenis: "Motor vs Mobil" },
{ nama: "Kirana Sari", tanggal: "2023-09-17 12:30", telepon: "089876543210", titik: "Cibuluh", jenis: "Kecelakaan Tunggal" },
{ nama: "Arjuna Prasetyo", tanggal: "2023-09-20 14:15", telepon: "085432109876", titik: "Cibuluh", jenis: "Tabrakan" },
{ nama: "Siti Nurani", tanggal: "2023-09-22 16:45", telepon: "086543210987", titik: "Cibuluh", jenis: "Motor vs Motor" },
// Kedung Badak
{ nama: "Fikri Ramadhan", tanggal: "2023-09-25 11:00", telepon: "082151214739", titik: "Kedung Badak", jenis: "Kecelakaan Tunggal" },
{ nama: "Rani Kurnia", tanggal: "2023-09-28 15:30", telepon: "081506205026", titik: "Kedung Badak", jenis: "Tabrakan" },
// Kedung Halang
{ nama: "Dito Prabowo", tanggal: "2023-09-30 09:45", telepon: "089634257496", titik: "Kedung Halang", jenis: "Motor vs Mobil" },
{ nama: "Nina Anggraini", tanggal: "2023-10-02 13:00", telepon: "087123456789", titik: "Kedung Halang", jenis: "Kecelakaan Tunggal" },
{ nama: "Rizal Maulana", tanggal: "2023-10-05 17:15", telepon: "086543210987", titik: "Kedung Halang", jenis: "Tabrakan" },
// Ciluar
{ nama: "Alif Kurniawan", tanggal: "2023-10-10 08:30", telepon: "089123456789", titik: "Ciluar", jenis: "Motor vs Mobil" },
{ nama: "Dewi Lestari", tanggal: "2023-10-12 11:15", telepon: "087654321012", titik: "Ciluar", jenis: "Kecelakaan Tunggal" },
{ nama: "Fajar Pramudita", tanggal: "2023-10-15 14:00", telepon: "085678912345", titik: "Ciluar", jenis: "Tabrakan" },
{ nama: "Nadia Cendana", tanggal: "2023-10-18 16:45", telepon: "084321098765", titik: "Ciluar", jenis: "Motor vs Motor" },
{ nama: "Rizky Pramudita", tanggal: "2023-10-20 09:30", telepon: "088765432109", titik: "Ciluar", jenis: "Kecelakaan Tunggal" },
// Baranang Siang
{ nama: "Siti Anggraini", tanggal: "2023-10-22 10:00", telepon: "085432109876", titik: "Baranang Siang", jenis: "Motor vs Mobil" },
{ nama: "Galih Prabowo", tanggal: "2023-10-25 12:30", telepon: "082345678901", titik: "Baranang Siang", jenis: "Kecelakaan Tunggal" },
{ nama: "Larasati Purnama", tanggal: "2023-10-28 14:15", telepon: "081234567890", titik: "Baranang Siang", jenis: "Tabrakan" },
{ nama: "Damar Wicaksono", tanggal: "2023-10-30 16:45", telepon: "089876543210", titik: "Baranang Siang", jenis: "Motor vs Motor" },
// Bondongan
{ nama: "Gilang Maulana", tanggal: "2023-05-29 13:00", telepon: "085612349876", titik: "Bondongan", jenis: "Tabrakan" },
{ nama: "Rani Kurnia", tanggal: "2023-11-01 09:00", telepon: "087123456789", titik: "Bondongan", jenis: "Kecelakaan Tunggal" },
// Pakuan
{ nama: "Zahra Kencana", tanggal: "2023-11-05 10:15", telepon: "089123456789", titik: "Pakuan", jenis: "Motor vs Mobil" },
{ nama: "Rizal Maulana", tanggal: "2023-11-07 12:00", telepon: "087654321012", titik: "Pakuan", jenis: "Kecelakaan Tunggal" },
{ nama: "Nina Anggraini", tanggal: "2023-11-10 14:30", telepon: "085678912345", titik: "Pakuan", jenis: "Tabrakan" },
{ nama: "Dito Prabowo", tanggal: "2023-11-12 16:00", telepon: "084321098765", titik: "Pakuan", jenis: "Motor vs Motor" },
{ nama: "Sari Melati", tanggal: "2023-11-15 09:45", telepon: "088765432109", titik: "Pakuan", jenis: "Kecelakaan Tunggal" },
{ nama: "Fahmi Alamsyah", tanggal: "2023-11-18 11:15", telepon: "082345678901", titik: "Pakuan", jenis: "Tabrakan" },
// Pamoyanan
{ nama: "Alif Kurniawan", tanggal: "2023-11-20 10:30", telepon: "089123456789", titik: "Pamoyanan", jenis: "Motor vs Mobil" },
{ nama: "Dewi Lestari", tanggal: "2023-11-22 12:15", telepon: "087654321012", titik: "Pamoyanan", jenis: "Kecelakaan Tunggal" },
{ nama: "Fajar Pramudita", tanggal: "2023-11-25 14:45", telepon: "085678912345", titik: "Pamoyanan", jenis: "Tabrakan" },
// Mulyaharja
{ nama: "Maulana", tanggal: "2023-04-07 10:00", telepon: "089987654321", titik: "Mulyaharja", jenis: "Motor Slip" },
// Sindangsari
{ nama: "Afni okta", tanggal: "2023-11-12 14:00", telepon: "082233445566", titik: "Sindangsari", jenis: "Tabrakan" },
{ nama: "Nadia putri", tanggal: "2023-11-27 09:00", telepon: "084321098765", titik: "Sindangsari", jenis: "Motor vs Motor" },
{ nama: "Rizky Pramudya", tanggal: "2023-11-29 11:30", telepon: "088765432109", titik: "Sindangsari", jenis: "Kecelakaan Tunggal" },
{ nama: "Siti solihatun", tanggal: "2023-12-01 14:00", telepon: "085432109876", titik: "Sindangsari", jenis: "Tabrakan" },
{ nama: "Ananda Bowo", tanggal: "2023-12-03 16:15", telepon: "082345678901", titik: "Sindangsari", jenis: "Motor vs Mobil" },
// Bojong Kerta
{ nama: "Raka Putra", tanggal: "2023-08-18 16:00", telepon: "086778899000", titik: "Bojong Kerta", jenis: "Kecelakaan Tunggal" },
{ nama: "Bagus Putra", tanggal: "2023-12-07 09:30", telepon: "087123456789", titik: "Bojong Kerta", jenis: "Kecelakaan Tunggal" },
// Kayu Manis
{ nama: "Rezi Azzami", tanggal: "2023-12-12 10:15", telepon: "089123456789", titik: "Kayu Manis", jenis: "Motor vs Mobil" },
{ nama: "Rizal ahmad", tanggal: "2023-12-15 12:00", telepon: "087654321012", titik: "Kayu Manis", jenis: "Kecelakaan Tunggal" },
{ nama: "Nina andini", tanggal: "2023-12-18 14:30", telepon: "085678912345", titik: "Kayu Manis", jenis: "Tabrakan" },
{ nama: "Dito pradipto", tanggal: "2023-12-20 16:00", telepon: "084321098765", titik: "Kayu Manis", jenis: "Motor vs Motor" },
// Cibadak
{ nama: "Intan", tanggal: "2023-03-27 17:00", telepon: "087890765432", titik: "Cibadak", jenis: "Motor Slip" },
{ nama: "Sari Melati", tanggal: "2023-12-22 09:45", telepon: "088765432109", titik: "Cibadak", jenis: "Kecelakaan Tunggal" },
{ nama: "Fahmi Alamsyah", tanggal: "2023-12-25 11:15", telepon: "082345678901", titik: "Cibadak", jenis: "Tabrakan" },
// Semplak
{ nama: "Muhamad Sorin", tanggal: "2023-01-23 12:00", telepon: "081112223334", titik: "Semplak", jenis: "Tabrakan" },
{ nama: "Karno Putro", tanggal: "2023-12-30 10:00", telepon: "087654321012", titik: "Semplak", jenis: "Motor vs Mobil" },
{ nama: "Rosiyah", tanggal: "2024-01-02 12:30", telepon: "085678912345", titik: "Semplak", jenis: "Kecelakaan Tunggal" },
{ nama: "Edih subanda", tanggal: "2024-01-05 14:15", telepon: "084321098765", titik: "Semplak", jenis: "Tabrakan" },
{ nama: "Zikrillah", tanggal: "2024-01-07 16:45", telepon: "088765432109", titik: "Semplak", jenis: "Motor vs Motor" },
{ nama: "Sabani", tanggal: "2024-01-10 09:30", telepon: "085432109876", titik: "Semplak", jenis: "Kecelakaan Tunggal" },
{ nama: "Galih", tanggal: "2024-01-12 11:00", telepon: "082345678901", titik: "Semplak", jenis: "Tabrakan" },
{ nama: "Amaila", tanggal: "2024-01-15 13:30", telepon: "081234567890", titik: "Semplak", jenis: "Motor vs Mobil" },
{ nama: "Azizi Fad", tanggal: "2024-01-18 15:00", telepon: "087123456789", titik: "Semplak", jenis: "Kecelakaan Tunggal" },
{ nama: "Ramadhan", tanggal: "2024-01-20 17:15", telepon: "086543210987", titik: "Semplak", jenis: "Tabrakan" },
];

// Buat defaultAccidentCounts dari data laporan
const defaultAccidentCounts2023 = {};
const defaultAccidentCounts2024 = {};

reports2023.forEach(report => {
    const titik = report.titik;
    defaultAccidentCounts2023[titik] = (defaultAccidentCounts2023[titik] || 0) + 1;
});

reports2024.forEach(report => {
    const titik = report.titik;
    defaultAccidentCounts2024[titik] = (defaultAccidentCounts2024[titik] || 0) + 1;
});

// Load accident counts from localStorage with fallback to defaults
let accidentCounts2024, accidentCounts2023;
try {
    const stored2024 = localStorage.getItem('accidentCounts2024');
    accidentCounts2024 = stored2024 ? JSON.parse(stored2024) : defaultAccidentCounts2024;
    const stored2023 = localStorage.getItem('accidentCounts2023');
    accidentCounts2023 = stored2023 ? JSON.parse(stored2023) : defaultAccidentCounts2023;
    localStorage.setItem('accidentCounts2024', JSON.stringify(accidentCounts2024));
    localStorage.setItem('accidentCounts2023', JSON.stringify(accidentCounts2023));
} catch (error) {
    console.error('Gagal mengambil data dari localStorage:', error);
    accidentCounts2024 = defaultAccidentCounts2024;
    accidentCounts2023 = defaultAccidentCounts2023;
}


// Function to create a Google Maps-style marker with accident count
function createGoogleMapsMarker(count) {
    const svg = `
        <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C6.716 0 0 6.716 0 15c0 10 15 25 15 25s15-15 15-25C30 6.716 23.284 0 15 0z" fill="#375B85"/>
            <circle cx="15" cy="15" r="8" fill="#FFFFFF"/>
            <text x="15" y="18" font-family="Arial" font-size="10" font-weight="bold" fill="#000000" text-anchor="middle">${count}</text>
        </svg>
    `;
    return L.divIcon({
        className: 'custom-gmaps-icon',
        html: svg,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40]
    });
}

// Initialize maps for both years
function initMap() {
    try {
        if (typeof L === 'undefined') {
            throw new Error('Leaflet is not loaded');
        }

        // Gabungkan reports dengan reports2024 dan reports2023
        const allReports = [
            ...reports,
            ...reports2024.map(r => ({ ...r, status: "Masuk", received: false })),
            ...reports2023.map(r => ({ ...r, status: "Masuk", received: false }))
        ];

        // Initialize 2024 map
        const mapContainer2024 = document.getElementById('map-2024');
        if (!mapContainer2024) throw new Error('Map 2024 container not found');
        if (map2024) map2024.remove();

        map2024 = L.map('map-2024', { zoomControl: true }).setView([-6.5944, 106.7890], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Â© OpenStreetMap contributors'
        }).addTo(map2024);

        // Clear existing markers
        markers2024.forEach(marker => marker.remove());
        markers2024 = [];

        // Add markers for 2024
        Object.entries(kecamatanData).forEach(([kecamatan, data]) => {
            // Filter reports for 2024
            const kecamatanReports = allReports.filter(report => 
                report.titik === kecamatan && new Date(report.tanggal).getFullYear() === 2024
            );
            const count = kecamatanReports.length;

            const popupContent = `
    <div class="custom-gmaps-popup">
        <b>${kecamatan}</b><br>
        Total Kecelakaan: ${count}<br><br>
        <table>
            <tr style="background-color: #375B85; color: white;">
                <th>Nama</th>
                <th>Tanggal</th>
                <th>Telepon</th>
                <th>Titik</th>
                <th>Jenis</th>
                <th>Maps</th>
            </tr>
            ${kecamatanReports.map(report => `
                <tr>
                    <td>${escapeHTML(report.nama || '-')}</td>
                    <td>${escapeHTML(report.tanggal || '-')}</td>
                    <td>${escapeHTML(report.telepon || '-')}</td>
                    <td>${escapeHTML(report.titik || '-')}</td>
                    <td>${escapeHTML(report.jenis || '-')}</td>
                    <td><a href="https://www.google.com/maps?q=${data.lat},${data.lng}" target="_blank">Lihat di Maps</a></td>
                </tr>
            `).join('')}
        </table>
    </div>
`;
            const marker = L.marker([data.lat, data.lng], {
                icon: createGoogleMapsMarker(count)
            }).addTo(map2024).bindPopup(popupContent);
            markers2024.push(marker);
        });

        // Initialize 2023 map
        const mapContainer2023 = document.getElementById('map-2023');
        if (!mapContainer2023) throw new Error('Map 2023 container not found');
        if (map2023) map2023.remove();

        map2023 = L.map('map-2023', { zoomControl: true }).setView([-6.5944, 106.7890], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Â© OpenStreetMap contributors'
        }).addTo(map2023);

        // Clear existing markers
        markers2023.forEach(marker => marker.remove());
        markers2023 = [];

        // Add markers for 2023
        Object.entries(kecamatanData2023).forEach(([kecamatan, data]) => {
            // Filter reports for 2023
            const kecamatanReports = allReports.filter(report => 
                report.titik === kecamatan && new Date(report.tanggal).getFullYear() === 2023
            );
            const count = kecamatanReports.length;

            const popupContent = `
                <div>
                    <b>${kecamatan}</b><br>
                    Total Kecelakaan: ${count}<br><br>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background-color: #375B85; color: white;">
                            <th style="padding: 5px;">Nama Pelapor</th>
                            <th style="padding: 5px;">Tanggal</th>
                            <th style="padding: 5px;">Telepon</th>
                            <th style="padding: 5px;">Titik</th>
                            <th style="padding: 5px;">Jenis</th>
                            <th style="padding: 5px;">Maps</th>
                        </tr>
                        ${kecamatanReports.map(report => `
                            <tr>
                                <td style="padding: 5px; border: 1px solid #ddd;">${escapeHTML(report.nama || '-')}</td>
                                <td style="padding: 5px; border: 1px solid #ddd;">${escapeHTML(report.tanggal || '-')}</td>
                                <td style="padding: 5px; border: 1px solid #ddd;">${escapeHTML(report.telepon || '-')}</td>
                                <td style="padding: 5px; border: 1px solid #ddd;">${escapeHTML(report.titik || '-')}</td>
                                <td style="padding: 5px; border: 1px solid #ddd;">${escapeHTML(report.jenis || '-')}</td>
                                <td style="padding: 5px; border: 1px solid #ddd;">
                                    <a href="https://www.google.com/maps?q=${data.lat},${data.lng}" target="_blank" style="color: #375B85; text-decoration: underline;">Lihat di Maps</a>
                                </td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            `;
            const marker = L.marker([data.lat, data.lng], {
                icon: createGoogleMapsMarker(count)
            }).addTo(map2023).bindPopup(popupContent);
            markers2023.push(marker);
        });

        // Batas wilayah sederhana per kecamatan
        const bogorDistrictBoundaries = {
            "Bogor Barat": [
                [-6.563, 106.726], [-6.564, 106.730], [-6.570, 106.730], [-6.572, 106.726]
            ],
            "Bogor Timur": [
                [-6.619, 106.812], [-6.622, 106.819], [-6.628, 106.818], [-6.627, 106.812]
            ],
            "Bogor Selatan": [
                [-6.634, 106.794], [-6.640, 106.797], [-6.645, 106.790], [-6.640, 106.784]
            ],
            "Bogor Utara": [
                [-6.576, 106.819], [-6.580, 106.826], [-6.586, 106.822], [-6.582, 106.815]
            ],
            "Bogor Tengah": [
                [-6.598, 106.797], [-6.599, 106.803], [-6.604, 106.800], [-6.602, 106.794]
            ],
            "Tanah Sareal": [
                [-6.579, 106.785], [-6.582, 106.790], [-6.589, 106.787], [-6.587, 106.780]
            ]
        };

        // Tambahkan batas wilayah ke peta 2024
        Object.entries(bogorDistrictBoundaries).forEach(([kecamatan, coordinates]) => {
            const polygon2024 = L.polygon(coordinates, {
                color: "#375b85",
                weight: 2,
                fillOpacity: 0.08
            }).addTo(map2024);
            polygon2024.bindTooltip(kecamatan, { permanent: false, direction: "center" });
        });

        // Tambahkan batas wilayah ke peta 2023
        Object.entries(bogorDistrictBoundaries).forEach(([kecamatan, coordinates]) => {
            const polygon2023 = L.polygon(coordinates, {
                color: "#888888",
                weight: 1.5,
                dashArray: "4",
                fillOpacity: 0.05
            }).addTo(map2023);
            polygon2023.bindTooltip(kecamatan, { permanent: false, direction: "center" });
        });

        // Trigger initial toggle based on filter
        toggleMapByYear();

    } catch (e) {
        console.error('Error initializing maps:', e);
        showErrorBoundary('Gagal memuat peta: ' + e.message);
    }
}


// Function to update accident counts and refresh marker
function updateAccidentCount(year, kecamatan) {
    try {
        const inputId = `input-${year}-${kecamatan}`;
        const countId = `count-${year}-${kecamatan}`;
        const newCount = parseInt(document.getElementById(inputId).value) || 0;

        if (year === '2024') {
            accidentCounts2024[kecamatan] = newCount;
            localStorage.setItem('accidentCounts2024', JSON.stringify(accidentCounts2024));
            const marker = markers2024.find(m => m.getPopup().getContent().includes(kecamatan));
            if (marker) {
                marker.setIcon(createGoogleMapsMarker(newCount));
                marker.getPopup().setContent(`
                    <div>
                        <b>${kecamatan}</b><br>
                        Total Kecelakaan (2024): <span id="count-2024-${kecamatan}">${newCount}</span><br>
                        <input type="number" class="accident-input" id="input-2024-${kecamatan}" value="${newCount}" min="0" style="width: 60px; margin-top: 5px;"><br>
                        <button class="save-accident-btn" onclick="updateAccidentCount('2024', '${kecamatan}')" style="margin-top: 5px; padding: 2px 5px; cursor: pointer;">Simpan</button>
                    </div>
                `);
            }
        } else if (year === '2023') {
            accidentCounts2023[kecamatan] = newCount;
            localStorage.setItem('accidentCounts2023', JSON.stringify(accidentCounts2023));
            const marker = markers2023.find(m => m.getPopup().getContent().includes(kecamatan));
            if (marker) {
                marker.setIcon(createGoogleMapsMarker(newCount));
                marker.getPopup().setContent(`
                    <div>
                        <b>${kecamatan}</b><br>
                        Total Kecelakaan (2023): <span id="count-2023-${kecamatan}">${newCount}</span><br>
                        <input type="number" class="accident-input" id="input-2023-${kecamatan}" value="${newCount}" min="0" style="width: 60px; margin-top: 5px;"><br>
                        <button class="save-accident-btn" onclick="updateAccidentCount('2023', '${kecamatan}')" style="margin-top: 5px; padding: 2px 5px; cursor: pointer;">Simpan</button>
                    </div>
                `);
            }
        }

        document.getElementById(countId).textContent = newCount;
        alert(`Jumlah kecelakaan di ${kecamatan} tahun ${year} telah diperbarui menjadi ${newCount}`);
    } catch (e) {
        console.error('Error updating accident count:', e);
        showErrorBoundary('Gagal memperbarui jumlah kecelakaan: ' + e.message);
    }
}

// Toggle map visibility based on selected year
// Toggle map visibility based on selected year and update UI elements
function toggleMapByYear() {
    const year = document.getElementById('filter-tahun-laporan').value || '2024';

    const map2023Container = document.getElementById('map-2023');
    const map2024Container = document.getElementById('map-2024');
    const h3Title = document.querySelector('#titik-laporan-section h3');
    const downloadImageBtn = document.querySelector('#titik-laporan-section .download-image-btn');
    const downloadExcelBtn = document.querySelector('#titik-laporan-section .download-excel-btn');

    if (!h3Title || !downloadImageBtn || !downloadExcelBtn) {
        console.warn('One or more UI elements not found for year update');
        return;
    }

    // Update h3 title
    h3Title.textContent = `Titik Laporan Kecelakaan di Kota Bogor Tahun ${year}`;

    // Update button texts
    downloadImageBtn.textContent = `Unduh Gambar Peta ${year}`;
    downloadImageBtn.onclick = () => downloadMapImage(`map-${year}`, `peta-wilayah-${year}`);
    downloadExcelBtn.textContent = `Unduh Excel Data ${year}`;
    downloadExcelBtn.onclick = () => downloadMapDataToExcel(year);

    if (year === '2023') {
        map2023Container.style.display = 'block';
        map2024Container.style.display = 'none';
    } else {
        map2023Container.style.display = 'none';
        map2024Container.style.display = 'block';
    }

    setTimeout(() => {
        const activeMap = year === '2023' ? map2023 : map2024;
        if (activeMap) activeMap.invalidateSize();
    }, 200);
}

// Download map image
function downloadMapImage(mapContainerId, filename = 'peta-wilayah') {
    try {
        const mapContainer = document.getElementById(mapContainerId);
        if (!mapContainer) {
            throw new Error('Map container not found');
        }

        html2canvas(mapContainer, {
            useCORS: true,
            allowTaint: true,
            logging: true,
            width: mapContainer.offsetWidth,
            height: mapContainer.offsetHeight
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error('Error capturing map image:', err);
            showErrorBoundary('Gagal mengunduh peta: ' + err.message);
        });
    } catch (e) {
        console.error('Error downloading map image:', e);
        showErrorBoundary('Gagal mengunduh peta: ' + e.message);
    }
}
//download map data
function downloadMapDataToExcel(year) {
    console.log("Unduh Excel untuk tahun:", year);

    try {
        if (typeof XLSX === 'undefined') {
            alert('SheetJS (XLSX) tidak tersedia.');
            return;
        }

        const kecamatanSource = (year === '2024') ? kecamatanData : kecamatanData2023;
        const countSource = (year === '2024') ? accidentCounts2024 : accidentCounts2023;

        console.log("Data kecamatan:", kecamatanSource);
        console.log("Data kecelakaan:", countSource);

        if (!kecamatanSource || !countSource) {
            alert(`Data ${year} tidak ditemukan.`);
            return;
        }

        // Data tanpa kolom Batas Wilayah
        const data = Object.entries(kecamatanSource).map(([kecamatan, info]) => ({
            Kecamatan: kecamatan,
            'Jumlah Kecelakaan': countSource[kecamatan] || 0,
            Latitude: info.lat,
            Longitude: info.lng
        }));

        // Worksheet kosong
        const worksheet = XLSX.utils.json_to_sheet([]);

        // Tambah judul
        const title = [`Data Titik Kecelakaan Kota Bogor Tahun ${year}`];
        XLSX.utils.sheet_add_aoa(worksheet, [title], { origin: "A1" });

        // Tambah data mulai baris ke-3
        XLSX.utils.sheet_add_json(worksheet, data, { origin: "A3", skipHeader: false });

        // Lebar kolom otomatis
        const colWidths = Object.keys(data[0] || {}).map(key => ({
            wch: Math.max(key.length + 2, ...data.map(row => String(row[key] || '').length + 2))
        }));
        worksheet['!cols'] = colWidths;

        // Merge cell untuk judul
        const lastColIndex = Object.keys(data[0]).length - 1;
        worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: lastColIndex } }];

        // Styling
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let R = range.s.r; R <= range.e.r; R++) {
            for (let C = range.s.c; C <= range.e.c; C++) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!worksheet[cellRef]) continue;

                if (R === 0) {
                    // Judul
                    worksheet[cellRef].s = {
                        font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
                        fill: { fgColor: { rgb: "4F81BD" } },
                        alignment: { horizontal: "center", vertical: "center" }
                    };
                } else if (R === 2) {
                    // Header tabel
                    worksheet[cellRef].s = {
                        font: { bold: true, color: { rgb: "FFFFFF" } },
                        fill: { fgColor: { rgb: "305496" } },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: {
                            top: { style: 'thin', color: { rgb: '000000' } },
                            bottom: { style: 'thin', color: { rgb: '000000' } },
                            left: { style: 'thin', color: { rgb: '000000' } },
                            right: { style: 'thin', color: { rgb: '000000' } }
                        }
                    };
                } else {
                    // Data isi
                    worksheet[cellRef].s = {
                        alignment: { horizontal: typeof worksheet[cellRef].v === 'number' ? 'center' : 'left', vertical: 'center' },
                        border: {
                            top: { style: 'thin', color: { rgb: '000000' } },
                            bottom: { style: 'thin', color: { rgb: '000000' } },
                            left: { style: 'thin', color: { rgb: '000000' } },
                            right: { style: 'thin', color: { rgb: '000000' } }
                        }
                    };
                }
            }
        }

        // Simpan workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Titik Peta ${year}`);
        XLSX.writeFile(workbook, `titik-laporan-${year}.xlsx`);

    } catch (e) {
        console.error('Gagal download Excel:', e);
        showErrorBoundary('Gagal mengunduh data peta ke Excel: ' + e.message);
    }
}

// Setup event listeners for map initialization and year filter
function toggleMapByYear() {
    const year = document.getElementById('filter-tahun-laporan').value || '2024';

    const map2023Container = document.getElementById('map-2023-container');
    const map2024Container = document.getElementById('map-2024-container');
    const h3Map2023 = map2023Container.querySelector('h3');
    const h3Map2024 = map2024Container.querySelector('h3');
    const downloadImageBtn2023 = map2023Container.querySelectorAll('button')[0];
    const downloadImageBtn2024 = map2024Container.querySelectorAll('button')[0];
    const downloadExcelBtn2023 = map2023Container.querySelectorAll('button')[1];
    const downloadExcelBtn2024 = map2024Container.querySelectorAll('button')[1];

    if (year === '2023') {
        map2023Container.style.display = 'block';
        map2024Container.style.display = 'none';
        h3Map2023.textContent = `Titik Laporan Kecelakaan di Kota Bogor Tahun ${year}`;
        downloadImageBtn2023.textContent = `Unduh Gambar Peta ${year}`;
        downloadExcelBtn2023.textContent = `Unduh Excel Data ${year}`;
    } else {
        map2023Container.style.display = 'none';
        map2024Container.style.display = 'block';
        h3Map2024.textContent = `Titik Laporan Kecelakaan di Kota Bogor Tahun ${year}`;
        downloadImageBtn2024.textContent = `Unduh Gambar Peta ${year}`;
        downloadExcelBtn2024.textContent = `Unduh Excel Data ${year}`;
    }

    setTimeout(() => {
        if (year === '2023' && map2023) map2023.invalidateSize();
        else if (map2024) map2024.invalidateSize();
    }, 200);
}
function setupMapFilters() {
    console.warn('setupMapFilters dipanggil, tetapi belum diimplementasikan.');
}


// Update initializeAdminPage to include map filters
initializeAdminPage = (function(original) {
    return function() {
        original();
        setupTrackingFilters();
        setupMapFilters();
        closeAllModals();
    };
})(initializeAdminPage);

// Laporan download
function generateFullPDF(title, filteredReports, filename) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    let y = 30;

    filteredReports.forEach((r, i) => {
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(55, 91, 133);
        doc.rect(14, y - 5, 182, 8, 'F');
        doc.text(`Laporan #${i + 1}`, 16, y);

        y += 7;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);

        const lines = [
            `ID: ${r.id}`,
            `Nama: ${r.nama}`,
            `NIK: ${r.nik}`,
            `Email: ${r.email}`,
            `Telepon: ${r.telepon}`,
            `Tanggal: ${r.tanggal}`,
            `Titik Kejadian: ${r.titik}`,
            `Kendaraan: ${r.kendaraan || '-'}`,
            `Jenis Kecelakaan: ${r.jenis || '-'}`,
            `Jumlah Korban: ${r.jumlahKorban || '-'}`,
            `Kronologi: ${r.kronologi || '-'}`,
            `Saksi: ${r.saksi}`,
            `Petugas: ${r.petugas || '-'}`,
            `Status: ${r.status}`
        ];

        lines.forEach(line => {
            const splitText = doc.splitTextToSize(line, 180);
            splitText.forEach(textLine => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(textLine, 16, y);
                y += 6;
            });
        });

        y += 4; // spasi antar laporan
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
    });

    doc.save(filename);
}
async function generateFullPDF(title, filteredReports, filename) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text(title, 14, 20);

    let y = 30;

    for (let i = 0; i < filteredReports.length; i++) {
        const r = filteredReports[i];
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(55, 91, 133);
        doc.rect(14, y - 5, 182, 8, 'F');
        doc.text(`Laporan #${i + 1}`, 16, y);
        y += 7;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        const lines = [
            `ID: ${r.id}`,
            `Nama: ${r.nama}`,
            `NIK: ${r.nik}`,
            `Email: ${r.email}`,
            `Telepon: ${r.telepon}`,
            `Tanggal: ${r.tanggal}`,
            `Titik Kejadian: ${r.titik}`,
            `Kendaraan: ${r.kendaraan || '-'}`,
            `Jenis Kecelakaan: ${r.jenis || '-'}`,
            `Jumlah Korban: ${r.jumlahKorban || '-'}`,
            `Kronologi: ${r.kronologi || '-'}`,
            `Saksi: ${r.saksi}`,
            `Petugas: ${r.petugas || '-'}`,
            `Status: ${r.status}`
        ];

        for (let line of lines) {
            const splitText = doc.splitTextToSize(line, 180);
            for (let t of splitText) {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(t, 16, y);
                y += 6;
            }
        }

        // 🔽 Tambahkan gambar bukti jika ada
        if (r.bukti) {
            try {
                const imgData = await loadImageAsDataURL(r.bukti);
                if (y > 240) {
                    doc.addPage();
                    y = 20;
                }
                doc.text("Bukti Gambar:", 16, y);
                y += 5;
                doc.addImage(imgData, 'JPEG', 16, y, 60, 45);
                y += 50;
            } catch (err) {
                console.warn(`Gagal memuat gambar bukti untuk laporan ID ${r.id}:`, err);
                doc.text("Bukti Gambar: [Gagal dimuat]", 16, y);
                y += 8;
            }
        }

        y += 5;
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
    }

    doc.save(filename);
}

// Utilitas: load gambar jadi base64
function loadImageAsDataURL(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // jika sumber eksternal
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = reject;
        img.src = url;
    });
}
//fitur download laporan masuk
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
    canvas.style.height = "450px"; // Tinggi besar agar batang jelas
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
