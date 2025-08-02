const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/riwayat_laporan', async (req, res) => {
  try {
    const response = await fetch('https://dragonmontainapi.com/riwayat_laporan.php?user=1');
    const data = await response.json();

    // Periksa apakah data berbentuk array
    if (!Array.isArray(data)) {
      return res.status(500).json({ error: 'Data dari API tidak berbentuk array', data });
    }

    res.json(data);
  } catch (error) {
    console.error('Gagal mengambil data dari API:', error.message);
    res.status(500).json({ error: 'Gagal mengambil data dari API' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server berjalan di http://localhost:${PORT}`);
});
