const db = require('../config/database');

// Daftar nilai ENUM kategori (dipakai untuk validasi dan dropdown)
const KATEGORI = ['Fiksi', 'Non-Fiksi', 'Sains & Teknologi', 'Sejarah', 'Referensi'];

// Seluruh query memakai placeholder (?) dan db.execute() (prepared statement)
const BukuModel = {
  KATEGORI,

  // READ (All)
  getAll: async () => {
    const [rows] = await db.execute('SELECT * FROM buku ORDER BY id DESC');
    return rows;
  },

  // READ (One)
  getById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM buku WHERE id = ?', [id]);
    return rows[0]; // objek tunggal atau undefined
  },

  // CREATE
  create: async (data) => {
    const sql = 'INSERT INTO buku (judul, penulis, sinopsis, kategori, stok, harga, tanggal_masuk) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const [result] = await db.execute(sql, [
      data.judul,
      data.penulis,
      data.sinopsis,
      data.kategori,
      data.stok,
      data.harga,
      data.tanggal_masuk
    ]);
    return result;
  },

  // UPDATE
  update: async (id, data) => {
    const sql = 'UPDATE buku SET judul = ?, penulis = ?, sinopsis = ?, kategori = ?, stok = ?, harga = ?, tanggal_masuk = ? WHERE id = ?';
    const [result] = await db.execute(sql, [
      data.judul,
      data.penulis,
      data.sinopsis,
      data.kategori,
      data.stok,
      data.harga,
      data.tanggal_masuk,
      id
    ]);
    return result;
  },

  // DELETE
  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM buku WHERE id = ?', [id]);
    return result;
  }
};

module.exports = BukuModel;