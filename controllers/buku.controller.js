const BukuModel = require('../models/buku.model');

// Pastikan parameter :id hanya berisi angka
const isId = (v) => /^\d+$/.test(String(v));

// Validasi dan sanitasi input formulir -> { errors, data }
function validasi(body) {
  const errors = [];
  const data = {
    judul: (body.judul || '').trim(),
    penulis: (body.penulis || '').trim(),
    sinopsis: (body.sinopsis || '').trim(),
    kategori: body.kategori,
    stok: body.stok,
    harga: body.harga,
    tanggal_masuk: body.tanggal_masuk
  };

  if (!data.judul || data.judul.length > 150) errors.push('Judul wajib diisi (maks. 150 karakter).');
  if (!data.penulis || data.penulis.length > 100) errors.push('Penulis wajib diisi (maks. 100 karakter).');
  if (!BukuModel.KATEGORI.includes(data.kategori)) errors.push('Kategori tidak valid.');
  if (!/^\d+$/.test(String(data.stok ?? ''))) errors.push('Stok harus bilangan bulat >= 0.');
  if (data.harga === undefined || String(data.harga).trim() === '' || !(Number(data.harga) >= 0)) errors.push('Harga harus berupa angka >= 0.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.tanggal_masuk || '') || isNaN(new Date(data.tanggal_masuk))) errors.push('Tanggal masuk tidak valid.');

  // Sinopsis bersifat opsional: kirim NULL (bukan undefined) agar aman untuk prepared statement
  data.sinopsis = data.sinopsis === '' ? null : data.sinopsis;
  return { errors, data };
}

const renderForm = (res, status, { mode, buku, errors = [] }) =>
  res.status(status).render('pages/buku-form', {
    pageTitle: mode === 'edit' ? 'Edit Buku' : 'Tambah Buku',
    mode,
    buku,
    errors,
    kategoriList: BukuModel.KATEGORI
  });

const render404 = (res) =>
  res.status(404).render('pages/404', { pageTitle: 'Data Tidak Ditemukan' });

// ---------- READ (All) ----------
exports.getDaftarBuku = async (req, res) => {
  try {
    const bukuList = await BukuModel.getAll();
    res.render('pages/buku-list', {
      pageTitle: 'Master Data Buku Perpustakaan',
      bukuList,
      status: req.query.status || null
    });
  } catch (error) {
    console.error('[ERROR getDaftarBuku]:', error);
    res.status(500).send('Terjadi galat internal saat mengambil data.');
  }
};

// ---------- CREATE ----------
exports.getFormTambah = (req, res) => {
  renderForm(res, 200, {
    mode: 'tambah',
    buku: { stok: 1, tanggal_masuk: new Date().toISOString().slice(0, 10) }
  });
};

exports.postTambahBuku = async (req, res) => {
  const { errors, data } = validasi(req.body);
  if (errors.length) return renderForm(res, 400, { mode: 'tambah', buku: data, errors });

  try {
    await BukuModel.create(data);
    console.log(`[DATABASE] Buku "${data.judul}" berhasil di-insert.`);
    res.redirect('/buku?status=created'); // Pola Post-Redirect-Get (PRG)
  } catch (error) {
    console.error('[ERROR postTambahBuku]:', error);
    res.status(500).send('Gagal menyimpan data ke basis data.');
  }
};

// ---------- READ (One) + UPDATE ----------
exports.getFormEdit = async (req, res) => {
  const { id } = req.params;
  if (!isId(id)) return render404(res);

  try {
    const buku = await BukuModel.getById(id);
    if (!buku) return render404(res);
    renderForm(res, 200, { mode: 'edit', buku });
  } catch (error) {
    console.error('[ERROR getFormEdit]:', error);
    res.status(500).send('Galat internal saat memuat form edit.');
  }
};

exports.postUpdateBuku = async (req, res) => {
  const { id } = req.params;
  if (!isId(id)) return render404(res);

  const { errors, data } = validasi(req.body);
  if (errors.length) return renderForm(res, 400, { mode: 'edit', buku: { ...data, id }, errors });

  try {
    const result = await BukuModel.update(id, data);
    if (result.affectedRows === 0) return render404(res);
    console.log(`[DATABASE] Record ID ${id} berhasil diperbarui.`);
    res.redirect('/buku?status=updated'); // PRG
  } catch (error) {
    console.error('[ERROR postUpdateBuku]:', error);
    res.status(500).send('Gagal memperbarui record data.');
  }
};

// ---------- DELETE ----------
exports.postHapusBuku = async (req, res) => {
  const { id } = req.params;
  if (!isId(id)) return render404(res);

  try {
    const result = await BukuModel.delete(id);
    if (result.affectedRows === 0) {
      console.warn(`[DATABASE] Tidak ada record yang terhapus untuk ID ${id}`);
      return res.redirect('/buku?status=notfound');
    }
    console.log(`[DATABASE] Record ID ${id} berhasil dihapus.`);
    res.redirect('/buku?status=deleted'); // PRG
  } catch (error) {
    console.error('[ERROR postHapusBuku]:', error);
    res.status(500).send('Gagal menghapus entitas dari basis data.');
  }
};