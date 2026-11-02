const express = require('express');
const router = express.Router();
const bukuController = require('../controllers/buku.controller');

router.get('/buku', bukuController.getDaftarBuku);               // Read (All)
router.get('/buku/tambah', bukuController.getFormTambah);        // Form tambah
router.post('/buku/tambah', bukuController.postTambahBuku);      // Create (PRG)
router.get('/buku/edit/:id', bukuController.getFormEdit);        // Read (One), pre-filled
router.post('/buku/edit/:id', bukuController.postUpdateBuku);    // Update (PRG)
router.post('/buku/hapus/:id', bukuController.postHapusBuku);    // Delete (PRG)

module.exports = router;