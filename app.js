const express = require('express');
require('dotenv').config();

const db = require('./config/database');
const bukuRoutes = require('./routes/buku.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Helper format tampilan (tersedia di semua view EJS)
app.locals.formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n));
app.locals.formatTanggal = (s) =>
  s ? new Date(`${String(s).slice(0, 10)}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

// Rute aplikasi (dipasang SEBELUM 404 handler)
app.get('/', (req, res) => res.redirect('/buku'));
app.use('/', bukuRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('pages/404', { pageTitle: '404 - Tidak Ditemukan' });
});

// Verifikasi koneksi basis data saat startup
db.query('SELECT 1 + 1 AS result')
  .then(() => {
    console.log('[DATABASE] Terhubung ke MySQL Pool secara aman.');
    app.listen(PORT, (err) => {
      if (err) throw err;
      console.log(`[SERVER] Aktif di http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('[DATABASE ERROR] Gagal terhubung ke MySQL:', err.message);
  });