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
    if (downloadChartBtn) downloadChartBtn.addEventListener('click', downloadChart);
    if (downloadExcelBtn) downloadExcelBtn.addEventListener('click', downloadExcel);
}

let originalProfileData = {
    nama: "",
    email: "",
    nik: "",
    jabatan: "",
    telepon: "",
    photo: null
};

function validateProfileData(data) {
    return data && 
        typeof data.nama === 'string' &&
        typeof data.email === 'string' &&
        typeof data.nik === 'string' &&
        typeof data.jabatan === 'string' &&
        typeof data.telepon === 'string' &&
        (data.photo === null || typeof data.photo === 'string');
}

originalProfileData = validateStoredData('profileData', originalProfileData, validateProfileData);

function saveProfile() {
    try {
        const nama = document.getElementById('profil-username')?.value.trim();
        const email = document.getElementById('profil-email')?.value.trim();
        const nik = document.getElementById('profil-nik')?.value.trim();
        const jabatan = document.getElementById('profil-jabatan')?.value.trim();
        const telepon = document.getElementById('profil-telepon')?.value.trim();

        if (!nama || !email || !nik || !jabatan || !telepon) {
            alert('Semua field profil harus diisi!');
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            alert('Email tidak valid!');
            return;
        }

        if (!/^\d{16}$/.test(nik)) {
            alert('NIK harus 16 digit!');
            return;
        }

        if (!/^\d{10,12}$/.test(telepon)) {
            alert('Nomor telepon harus 10-12 digit!');
            return;
        }

        const updatedData = { nama, email, nik, jabatan, telepon };
        localStorage.setItem('pimpinanProfileData', JSON.stringify(updatedData));

        // Update variabel global juga agar langsung sinkron
        originalProfileData = updatedData;

        alert('Profil pimpinan berhasil disimpan!');
        loadProfileData(); // tampilkan data terbaru

        // Perbarui tampilan header/sidebar
        const usernameDisplay = document.getElementById('username');
        const sidebarTitle = document.querySelector('.sidebar-title');
        if (usernameDisplay) usernameDisplay.textContent = nama;
        if (sidebarTitle) sidebarTitle.textContent = nama;

    } catch (e) {
        console.error('Error saving profile:', e);
        showErrorBoundary('Gagal menyimpan profil pimpinan: ' + e.message);
    }
}

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
let reports = [
    { id: generateReportId(), nama: "Robi Maulana", nik: "1234567890123456", email: "robi.maulana@example.com", telepon: "081234567890", tanggal: "2025-03-25 17:30", status: "Masuk", titik: "Kecamatan Bogor Barat", bukti: "https://example.com/images/accident1.jpg", saksi: "Budi Santoso", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang" },
    { id: generateReportId(), nama: "Siti Kayla", nik: "6543210987654321", email: "siti.kayla@example.com", telepon: "081987654321", tanggal: "2025-03-22 10:11", status: "Masuk", titik: "Kecamatan Bogor Selatan", bukti: "https://example.com/images/accident2.jpg", saksi: "Ani Lestari", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Zikrillah", nik: "9876543210123456", email: "zikrillah@example.com", telepon: "081234567891", tanggal: "2025-03-18 05:25", status: "Masuk", titik: "Kecamatan Bogor Tengah", bukti: "https://example.com/images/accident3.jpg", saksi: "Rudi Hartono", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Aditya Pratama", nik: "1234567890123457", email: "aditya.pratama@example.com", telepon: "081234567892", tanggal: "2025-04-01 09:00", status: "Masuk", titik: "Kecamatan Bogor Timur", bukti: "https://example.com/images/accident4.jpg", saksi: "Dedi Susanto", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Dian Puspita", nik: "3210987654321098", email: "dianpuspita@example.com", telepon: "081345678901", tanggal: "2025-04-03 14:20", status: "Masuk", titik: "Kecamatan Bogor Utara", bukti: "https://example.com/images/accident5.jpg", saksi: "Lisa Maharani", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Fajar Nugroho", nik: "1234509876543210", email: "fajarnugroho@example.com", telepon: "081456789012", tanggal: "2025-04-04 12:00", status: "Masuk", titik: "Kecamatan Tanah Sereal", bukti: "https://example.com/images/accident6.jpg", saksi: "Yusuf Maulana", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Rina Apriani", nik: "6789012345678901", email: "rina.apriani@example.com", telepon: "081234567893", tanggal: "2025-04-05 17:00", status: "Masuk", titik: "Kecamatan Bogor Barat", bukti: "https://example.com/images/accident7.jpg", saksi: "Dodi Wirawan", petugas: "", received: true, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Bayu Firmansyah", nik: "7890123456789012", email: "bayu.firmansyah@example.com", telepon: "081234567894", tanggal: "2025-04-06 08:10", status: "Masuk", titik: "Kecamatan Bogor Selatan", bukti: "https://example.com/images/accident8.jpg", saksi: "Irfan Setiawan", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Fitriani", nik: "8901234567890123", email: "fitriani@example.com", telepon: "081234567895", tanggal: "2025-04-07 20:30", status: "Masuk", titik: "Kecamatan Bogor Tengah", bukti: "https://example.com/images/accident9.jpg", saksi: "Nova Sari", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Agus Widodo", nik: "9012345678901234", email: "agus.widodo@example.com", telepon: "081234567896", tanggal: "2025-04-08 11:45", status: "Masuk", titik: "Kecamatan Bogor Timur", bukti: "https://example.com/images/accident10.jpg", saksi: "Reza Purnama", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Intan Permata", nik: "2345678901234567", email: "intan.permata@example.com", telepon: "081234567897", tanggal: "2025-04-09 13:50", status: "Masuk", titik: "Kecamatan Bogor Utara", bukti: "https://example.com/images/accident11.jpg", saksi: "Wulan Sari", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Gilang Saputra", nik: "3456789012345678", email: "gilang.saputra@example.com", telepon: "081234567898", tanggal: "2025-04-10 16:05", status: "Masuk", titik: "Kecamatan Tanah Sereal", bukti: "https://example.com/images/accident12.jpg", saksi: "Taufik Hidayat", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Mega Sari", nik: "4567890123456789", email: "mega.sari@example.com", telepon: "081234567899", tanggal: "2025-04-11 07:25", status: "Masuk", titik: "Kecamatan Bogor Barat", bukti: "https://example.com/images/accident13.jpg", saksi: "Siska Nursanti", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Rizky Dwi Putra", nik: "5678901234567890", email: "rizky.dwi@example.com", telepon: "081234567800", tanggal: "2025-04-12 10:10", status: "Masuk", titik: "Kecamatan Bogor Selatan", bukti: "https://example.com/images/accident14.jpg", saksi: "Andini Fitria", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Lutfi Aulia", nik: "6789012345678901", email: "lutfi.aulia@example.com", telepon: "081234567801", tanggal: "2025-04-13 18:40", status: "Masuk", titik: "Kecamatan Bogor Tengah", bukti: "https://example.com/images/accident15.jpg", saksi: "Erik Setiawan", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Tania Maharani", nik: "7890123456789012", email: "tania.maharani@example.com", telepon: "081234567802", tanggal: "2025-04-14 15:15", status: "Masuk", titik: "Kecamatan Bogor Timur", bukti: "https://example.com/images/accident16.jpg", saksi: "Arif Kurniawan", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Alfian Ramadhan", nik: "8901234567890123", email: "alfian.ramadhan@example.com", telepon: "081234567803", tanggal: "2025-04-15 09:30", status: "Masuk", titik: "Kecamatan Bogor Utara", bukti: "https://example.com/images/accident17.jpg", saksi: "Ratna Komalasari", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Desi Arisanti", nik: "9012345678901234", email: "desi.arisanti@example.com", telepon: "081234567804", tanggal: "2025-04-16 19:00", status: "Masuk", titik: "Kecamatan Tanah Sereal", bukti: "https://example.com/images/accident18.jpg", saksi: "Hasan Alwi", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Imam Hidayat", nik: "0123456789012345", email: "imam.hidayat@example.com", telepon: "081234567805", tanggal: "2025-04-17 06:55", status: "Masuk", titik: "Kecamatan Bogor Barat", bukti: "https://example.com/images/accident19.jpg", saksi: "Yuni Kartika", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Dewi Lestari", nik: "1234567890123450", email: "dewi.lestari@example.com", telepon: "081234567806", tanggal: "2025-04-18 08:45", status: "Masuk", titik: "Kecamatan Bogor Selatan", bukti: "https://example.com/images/accident20.jpg", saksi: "Tomi Sutrisno", petugas: "", received: false, kendaraan:"roda 2", jenis:"Kecelakaan tunggal", jumlahKorban:"2", kronologi:"Pengendara motor menabrak mobil dari depan saat melaju kencang"},
    { id: generateReportId(), nama: "Andi Pratama", nik: "1234567890123451", email: "andi.pratama@example.com", telepon: "081234567807", tanggal: "2025-04-19 14:25", status: "Masuk", titik: "Kecamatan Bogor Tengah", bukti: "https://example.com/images/accident21.jpg", saksi: "Rina Wulandari", petugas: "", received: false, kendaraan: "roda 2", jenis: "Tabrakan beruntun", jumlahKorban: "3", kronologi: "Motor bertabrakan dengan mobil dan truk karena rem blong" },
    { id: generateReportId(), nama: "Riska Amelia", nik: "1234567890123452", email: "riska.amelia@example.com", telepon: "081234567808", tanggal: "2025-04-20 09:15", status: "Masuk", titik: "Kecamatan Bogor Timur", bukti: "https://example.com/images/accident22.jpg", saksi: "Hendra Wijaya", petugas: "", received: false, kendaraan: "roda 4", jenis: "Kecelakaan tunggal", jumlahKorban: "1", kronologi: "Mobil tergelincir di jalan licin akibat hujan" },
    { id: generateReportId(), nama: "Bima Sakti", nik: "1234567890123453", email: "bima.sakti@example.com", telepon: "081234567809", tanggal: "2025-04-21 16:40", status: "Masuk", titik: "Kecamatan Bogor Utara", bukti: "https://example.com/images/accident23.jpg", saksi: "Siti Aminah", petugas: "", received: false, kendaraan: "roda 2", jenis: "Tabrakan dengan pejalan kaki", jumlahKorban: "2", kronologi: "Motor menabrak pejalan kaki yang sedang menyeberang" },
    { id: generateReportId(), nama: "Nia Ramadhani", nik: "1234567890123454", email: "nia.ramadhani@example.com", telepon: "081234567810", tanggal: "2025-04-22 11:50", status: "Masuk", titik: "Kecamatan Tanah Sereal", bukti: "https://example.com/images/accident24.jpg", saksi: "Eko Prasetyo", petugas: "", received: false, kendaraan: "roda 2", jenis: "Kecelakaan tunggal", jumlahKorban: "1", kronologi: "Pengendara motor jatuh karena menghindari lubang di jalan" },
    { id: generateReportId(), nama: "Hadi Santoso", nik: "1234567890123455", email: "hadi.santoso@example.com", telepon: "081234567811", tanggal: "2025-04-23 07:30", status: "Masuk", titik: "Kecamatan Bogor Barat", bukti: "https://example.com/images/accident25.jpg", saksi: "Ayu Lestari", petugas: "", received: false, kendaraan: "roda 4", jenis: "Tabrakan beruntun", jumlahKorban: "4", kronologi: "Mobil menabrak kendaraan lain karena kelalaian pengemudi" },
    { id: generateReportId(), nama: "Lina Marlina", nik: "1234567890123458", email: "lina.marlina@example.com", telepon: "081234567812", tanggal: "2025-04-24 18:20", status: "Masuk", titik: "Kecamatan Bogor Selatan", bukti: "https://example.com/images/accident26.jpg", saksi: "Doni Hermawan", petugas: "", received: false, kendaraan: "roda 2", jenis: "Kecelakaan tunggal", jumlahKorban: "2", kronologi: "Motor tergelincir akibat jalanan basah" },
    { id: generateReportId(), nama: "Rudi Hartono", nik: "1234567890123459", email: "rudi.hartono@example.com", telepon: "081234567813", tanggal: "2025-04-25 13:10", status: "Masuk", titik: "Kecamatan Bogor Tengah", bukti: "https://example.com/images/accident27.jpg", saksi: "Maya Sari", petugas: "", received: false, kendaraan: "roda 2", jenis: "Tabrakan dengan kendaraan lain", jumlahKorban: "3", kronologi: "Motor menabrak mobil yang sedang berhenti di lampu merah" },
    { id: generateReportId(), nama: "Eka Putri", nik: "1234567890123460", email: "eka.putri@example.com", telepon: "081234567814", tanggal: "2025-04-26 10:05", status: "Masuk", titik: "Kecamatan Bogor Timur", bukti: "https://example.com/images/accident28.jpg", saksi: "Bambang Susilo", petugas: "", received: false, kendaraan: "roda 4", jenis: "Kecelakaan tunggal", jumlahKorban: "2", kronologi: "Mobil menabrak pembatas jalan karena pengemudi mengantuk" },
    { id: generateReportId(), nama: "Surya Wijaya", nik: "1234567890123461", email: "surya.wijaya@example.com", telepon: "081234567815", tanggal: "2025-04-27 15:55", status: "Masuk", titik: "Kecamatan Bogor Utara", bukti: "https://example.com/images/accident29.jpg", saksi: "Rina Wulandari", petugas: "", received: false, kendaraan: "roda 2", jenis: "Kecelakaan tunggal", jumlahKorban: "1", kronologi: "Pengendara motor jatuh karena kehilangan keseimbangan" },
    { id: generateReportId(), nama: "Ayu Lestari", nik: "1234567890123462", email: "ayu.lestari@example.com", telepon: "081234567816", tanggal: "2025-04-28 08:40", status: "Masuk", titik: "Kecamatan Tanah Sereal", bukti: "https://example.com/images/accident30.jpg", saksi: "Faisal Rahman", petugas: "", received: false, kendaraan: "roda 2", jenis: "Tabrakan beruntun", jumlahKorban: "3", kronologi: "Motor bertabrakan dengan dua kendaraan lain di persimpangan" },
    { id: generateReportId(), nama: "Dedi Susanto", nik: "1234567890123463", email: "dedi.susanto@example.com", telepon: "081234567817", tanggal: "2025-04-29 17:00", status: "Masuk", titik: "Kecamatan Bogor Barat", bukti: "https://example.com/images/accident31.jpg", saksi: "Nia Ramadhani", petugas: "", received: false, kendaraan: "roda 4", jenis: "Kecelakaan tunggal", jumlahKorban: "2", kronologi: "Mobil tergelincir dan menabrak pohon di pinggir jalan" },
    { id: generateReportId(), nama: "Maya Sari", nik: "1234567890123464", email: "maya.sari@example.com", telepon: "081234567818", tanggal: "2025-04-30 12:30", status: "Masuk", titik: "Kecamatan Bogor Selatan", bukti: "https://example.com/images/accident32.jpg", saksi: "Andi Pratama", petugas: "", received: false, kendaraan: "roda 2", jenis: "Kecelakaan tunggal", jumlahKorban: "1", kronologi: "Pengendara motor jatuh karena ban kempes" },
    { id: generateReportId(), nama: "Bambang Susilo", nik: "1234567890123465", email: "bambang.susilo@example.com", telepon: "081234567819", tanggal: "2025-05-01 09:20", status: "Masuk", titik: "Kecamatan Bogor Tengah", bukti: "https://example.com/images/accident33.jpg", saksi: "Surya Wijaya", petugas: "", received: false, kendaraan: "roda 2", jenis: "Tabrakan dengan pejalan kaki", jumlahKorban: "2", kronologi: "Motor menabrak pejalan kaki di zebra crossing" },
    { id: generateReportId(), nama: "Faisal Rahman", nik: "1234567890123466", email: "faisal.rahman@example.com", telepon: "081234567820", tanggal: "2025-05-02 14:45", status: "Masuk", titik: "Kecamatan Bogor Timur", bukti: "https://example.com/images/accident34.jpg", saksi: "Lina Marlina", petugas: "", received: false, kendaraan: "roda 4", jenis: "Tabrakan beruntun", jumlahKorban: "5", kronologi: "Mobil menabrak beberapa kendaraan karena pengemudi mabuk" },
    { id: generateReportId(), nama: "Rina Wulandari", nik: "1234567890123467", email: "rina.wulandari@example.com", telepon: "081234567821", tanggal: "2025-05-03 11:15", status: "Masuk", titik: "Kecamatan Bogor Utara", bukti: "https://example.com/images/accident35.jpg", saksi: "Hadi Santoso", petugas: "", received: false, kendaraan: "roda 2", jenis: "Kecelakaan tunggal", jumlahKorban: "1", kronologi: "Pengendara motor menabrak trotoar karena kehilangan kendali" },
    { id: generateReportId(), nama: "Tomi Sutrisno", nik: "1234567890123468", email: "tomi.sutrisno@example.com", telepon: "081234567822", tanggal: "2025-05-04 16:30", status: "Masuk", titik: "Kecamatan Tanah Sereal", bukti: "https://example.com/images/accident36.jpg", saksi: "Riska Amelia", petugas: "", received: false, kendaraan: "roda 2", jenis: "Kecelakaan tunggal", jumlahKorban: "2", kronologi: "Motor tergelincir di tikungan tajam" },
    { id: generateReportId(), nama: "Yuni Kartika", nik: "1234567890123469", email: "yuni.kartika@example.com", telepon: "081234567823", tanggal: "2025-05-05 08:50", status: "Masuk", titik: "Kecamatan Bogor Barat", bukti: "https://example.com/images/accident37.jpg", saksi: "Bima Sakti", petugas: "", received: false, kendaraan: "roda 4", jenis: "Kecelakaan tunggal", jumlahKorban: "3", kronologi: "Mobil menabrak pembatas jalan akibat kabut tebal" },
    { id: generateReportId(), nama: "Hendra Wijaya", nik: "1234567890123470", email: "hendra.wijaya@example.com", telepon: "081234567824", tanggal: "2025-05-06 13:40", status: "Masuk", titik: "Kecamatan Bogor Selatan", bukti: "https://example.com/images/accident38.jpg", saksi: "Eka Putri", petugas: "", received: false, kendaraan: "roda 2", jenis: "Tabrakan dengan kendaraan lain", jumlahKorban: "2", kronologi: "Motor menabrak mobil yang sedang parkir" },
    { id: generateReportId(), nama: "Siti Aminah", nik: "1234567890123471", email: "siti.aminah@example.com", telepon: "081234567825", tanggal: "2025-05-07 10:25", status: "Masuk", titik: "Kecamatan Bogor Tengah", bukti: "https://example.com/images/accident39.jpg", saksi: "Rudi Hartono", petugas: "", received: false, kendaraan: "roda 2", jenis: "Kecelakaan tunggal", jumlahKorban: "1", kronologi: "Pengendara motor jatuh karena jalanan berlubang" },
    { id: generateReportId(), nama: "Eko Prasetyo", nik: "1234567890123472", email: "eko.prasetyo@example.com", telepon: "081234567826", tanggal: "2025-05-08 15:10", status: "Masuk", titik: "Kecamatan Bogor Timur", bukti: "https://example.com/images/accident40.jpg", saksi: "Maya Sari", petugas: "", received: false, kendaraan: "roda 4", jenis: "Tabrakan beruntun", jumlahKorban: "4", kronologi: "Mobil bertabrakan dengan kendaraan lain di jalan tol" }
];

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
      telepon: item.telepon || '',
      tanggal: item.tanggal || '',
      status: statusMap[item.status] || "Masuk",
      titik: item.alamat || '',
      bukti: Array.isArray(item.foto) ? item.foto[0] : (item.foto || ''),
      saksi: item.saksi_1 || '',
      petugas: item.petugas || '',
      received: item.status === "3",
      kendaraan: item.kendaraan || '',
      jenis: item.jenis_kecelakaan || '',
      jumlahKorban: item.jumlah_korban || '',
      kronologi: item.kronologi || ''
    }));

    renderReportList();
    renderStats();
    renderTracking(getCurrentCategory());
    renderNotifications();

  } catch (error) {
    console.error("Error fetching laporan:", error);
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
                    <button onclick="openReportModal(${report.id})">
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
function openReportModal(reportId) {
  try {
    const report = reports.find(r => r.id == reportId); // pakai == agar cocok string/number
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
    const setValue = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = escapeHTML(value || '-');
    };

    setValue('report-nama', report.nama);
    setValue('report-nik', report.nik);
    setValue('report-email', report.email);
    setValue('report-telepon', report.telepon);
    setValue('report-saksi', report.saksi);
    setValue('report-titik', report.titik);
    setValue('report-kendaraan', report.kendaraan);
    setValue('report-jenis', report.jenis);
    setValue('report-jumlah-korban', report.jumlahKorban);
    setValue('report-tanggal', report.tanggal);
    setValue('report-status', report.status);
    setValue('report-kronologi', report.kronologi);

    const buktiEl = document.getElementById('report-bukti');
    if (buktiEl) buktiEl.src = report.bukti || '';

    const petugasInput = document.getElementById('report-petugas');
    if (petugasInput) petugasInput.value = escapeHTML(report.petugas || '');

    const buttonContainer = document.querySelector('.report-buttons');
    if (buttonContainer) {
      if (typeof isPimpinan !== 'undefined' && isPimpinan) {
        if (petugasInput) petugasInput.disabled = true;
        buttonContainer.innerHTML = `<button onclick="closeModal()">Tutup</button>`;
      } else {
        if (report.status === 'Masuk') {
          petugasInput.disabled = true;
        } else if (report.status === 'Diterima' || report.status === 'Proses') {
          petugasInput.disabled = false;
        } else {
          petugasInput.disabled = true;
        }
        buttonContainer.innerHTML = `<button onclick="closeModal()">Batal</button>`;
      }
    }

    modal.style.display = 'block';
  } catch (e) {
    console.error('Error opening report modal:', e);
    showErrorBoundary('Gagal membuka modal laporan: ' + e.message);
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

    renderTrackingTable(filteredTrackingReports);
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

function renderTrackingTable(data) {
    const tbody = document.getElementById('tracking-table-body');
    tbody.innerHTML = '';
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
            <td><button onclick="openTrackingModal(${report.id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="#375B85" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                            </svg></button></td>
            <td><span class="report-status ${report.status.toLowerCase()}">${escapeHTML(report.status)}</span></td>
        </tr>
    `).join('');
            // Hitung ulang semua kategori laporan (berdasarkan filter aktif) 
const all = reports.length; // Semua status
const accepted = reports.filter(r => r.status === 'Diterima').length;
const handling = reports.filter(r => r.status === 'Proses').length;
const received = reports.filter(r => r.status === 'Selesai').length;
const rejected = reports.filter(r => r.status === 'Ditolak').length;

// Tampilkan jumlah di elemen HTML
document.getElementById('total-reports').textContent = all;
document.getElementById('accepted-reports-count').textContent = accepted;
document.getElementById('handling-reports-count').textContent = handling;
document.getElementById('received-data-count').textContent = received;
document.getElementById('rejected-reports-count').textContent = rejected;



    renderTrackingPagination(data.length);

    // Update statistik
    document.getElementById('total-reports').textContent = data.length;
    document.getElementById('accepted-reports-count').textContent = reports.filter(r => r.status === 'Diterima').length;
    document.getElementById('handling-reports-count').textContent = reports.filter(r => r.status === 'Proses').length;
    document.getElementById('received-data-count').textContent = reports.filter(r => r.status === 'Selesai').length;
    document.getElementById('rejected-reports-count').textContent = reports.filter(r => r.status === 'Ditolak').length;

    // Update pagination
    renderTrackingPagination(data.length);
    if (openReportOnLoadId !== null) {
    const id = openReportOnLoadId;
    openReportOnLoadId = null;
    setTimeout(() => {
        openTrackingModal(id);
    }, 200);
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
    const container = document.querySelector("#tracking-section .pagination");
    if (!container) return;

    container.innerHTML = '';
    const totalPages = Math.ceil(totalReports / reportsPerPage);

    const prevBtn = document.createElement('button');
    prevBtn.textContent = "Previous";
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => previousPage(true);
    container.appendChild(prevBtn);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = "Next";
    nextBtn.disabled = currentPage >= totalPages;
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
function openTrackingModal(reportId) {
    try {
        const report = reports.find(r => r.id == reportId);
        if (!report) {
            alert('Laporan tidak ditemukan!');
            return;
        }

        const modal = document.getElementById('report-modal');
        if (!modal) {
            console.warn('Report modal not found');
            return;
        }

        // Isi field laporan
        document.getElementById('report-nama').textContent = escapeHTML(report.nama);
        document.getElementById('report-nik').textContent = escapeHTML(report.nik);
        document.getElementById('report-email').textContent = escapeHTML(report.email);
        document.getElementById('report-telepon').textContent = escapeHTML(report.telepon);
        document.getElementById('report-saksi').textContent = escapeHTML(report.saksi);
        document.getElementById('report-titik').textContent = escapeHTML(report.titik);
        document.getElementById('report-kendaraan').textContent = escapeHTML(report.kendaraan || '-');
        document.getElementById('report-jenis').textContent = escapeHTML(report.jenis || '-');
        document.getElementById('report-jumlah-korban').textContent = escapeHTML(report.jumlahKorban || '-');
        document.getElementById('report-tanggal').textContent = escapeHTML(report.tanggal);
        document.getElementById('report-status').textContent = escapeHTML(report.status);
        document.getElementById('report-kronologi').textContent = escapeHTML(report.kronologi);
        document.getElementById('report-bukti').src = report.bukti || '';

        const petugasInput = document.getElementById('report-petugas');
        const buttonContainer = document.querySelector('.report-buttons');

        petugasInput.value = escapeHTML(report.petugas || '');
        buttonContainer.innerHTML = '';

        // Logika untuk role Pimpinan: Tidak bisa edit petugas untuk status apapun
        if (typeof isPimpinan !== 'undefined' && isPimpinan) {
            petugasInput.disabled = true;
            buttonContainer.innerHTML = `<button onclick="closeModal()">Tutup</button>`;
        } else {
            // Role Admin (atau non-pimpinan)
            if (report.status === 'Diterima') {
                petugasInput.disabled = false;
                buttonContainer.innerHTML = `
                    <button onclick="savePetugas(${report.id})">Simpan</button>
                    <button onclick="closeModal()">Batal</button>
                `;
            } else if (report.status === 'Proses') {
                petugasInput.disabled = false;
                buttonContainer.innerHTML = `
                    <button onclick="updateStatus(${report.id}, 'Selesai')">Data Diterima</button>
                    <button onclick="savePetugas(${report.id})">Simpan</button>
                    <button onclick="closeModal()">Batal</button>
                `;
            } else {
                petugasInput.disabled = true;
                buttonContainer.innerHTML = `<button onclick="closeModal()">Tutup</button>`;
            }
        }

        modal.style.display = 'block';
    } catch (e) {
        console.error('Error opening tracking modal:', e);
        showErrorBoundary('Gagal membuka detail laporan: ' + e.message);
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
                        <button class="detail-btn" onclick="openReportModal(${report.id})">
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
let map2024, map2023;
let markers2024 = [], markers2023 = [];

// Updated coordinates from Kota Bogor 2024 KML
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

// Updated coordinates from Kota Bogor 2023 KML
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

// Default accident counts for 2024 and 2023 (for reference, but we'll use reports data instead)
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
