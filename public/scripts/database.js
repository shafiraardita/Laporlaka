// database.js
// ===============================
// Data Kecelakaan Lalu Lintas Kota Bogor
// Digunakan untuk halaman Monitoring Data
// ===============================

const accidentData = {
  '2023': {
    'Januari':   { total: 7,  meninggal: 6, lukaBerat: 1, lukaRingan: 5 },
    'Februari':  { total: 16, meninggal: 6, lukaBerat: 9, lukaRingan: 7 },
    'Maret':     { total: 10, meninggal: 5, lukaBerat: 0, lukaRingan: 10 },
    'April':     { total: 9,  meninggal: 3, lukaBerat: 1, lukaRingan: 6 },
    'Mei':       { total: 14, meninggal: 6, lukaBerat: 8, lukaRingan: 9 },
    'Juni':      { total: 10, meninggal: 2, lukaBerat: 7, lukaRingan: 6 },
    'Juli':      { total: 10, meninggal: 8, lukaBerat: 0, lukaRingan: 8 },
    'Agustus':   { total: 9,  meninggal: 4, lukaBerat: 4, lukaRingan: 9 },
    'September': { total: 6,  meninggal: 3, lukaBerat: 1, lukaRingan: 3 },
    'Oktober':   { total: 14, meninggal: 5, lukaBerat: 7, lukaRingan: 14 },
    'November':  { total: 6,  meninggal: 2, lukaBerat: 1, lukaRingan: 7 },
    'Desember':  { total: 8,  meninggal: 2, lukaBerat: 5, lukaRingan: 4 }
  },
  '2024': {
    'Januari':   { total: 8,  meninggal: 5, lukaBerat: 1, lukaRingan: 6 },
    'Februari':  { total: 6,  meninggal: 3, lukaBerat: 0, lukaRingan: 8 },
    'Maret':     { total: 5,  meninggal: 3, lukaBerat: 0, lukaRingan: 2 },
    'April':     { total: 12, meninggal: 2, lukaBerat: 6, lukaRingan: 16 },
    'Mei':       { total: 11, meninggal: 4, lukaBerat: 4, lukaRingan: 9 },
    'Juni':      { total: 14, meninggal: 4, lukaBerat: 5, lukaRingan: 12 },
    'Juli':      { total: 11, meninggal: 4, lukaBerat: 7, lukaRingan: 12 },
    'Agustus':   { total: 12, meninggal: 3, lukaBerat: 7, lukaRingan: 11 },
    'September': { total: 8,  meninggal: 2, lukaBerat: 3, lukaRingan: 8 },
    'Oktober':   { total: 14, meninggal: 3, lukaBerat: 3, lukaRingan: 12 },
    'November':  { total: 16, meninggal: 7, lukaBerat: 7, lukaRingan: 17 },
    'Desember':  { total: 9,  meninggal: 2, lukaBerat: 5, lukaRingan: 7 }
  }
};

// ===============================
// Fungsi bantu (opsional)
// ===============================

// Mengambil total kecelakaan per tahun
function getTotalPerYear(year) {
  const data = accidentData[year];
  if (!data) return 0;
  return Object.values(data).reduce((sum, bulan) => sum + bulan.total, 0);
}

// Mengambil data per bulan
function getMonthData(year, month) {
  return accidentData[year]?.[month] || null;
}

// Contoh penggunaan di console:
// console.log(getTotalPerYear("2024"));
// console.log(getMonthData("2023", "Maret"));
