const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

const routes = [
  'panel',
  'profil',
  'ayarlar',
  'urunler',
  'depolar',
  'transferler',
  'gelen-urunler',
  'giden-urunler',
  'stok-duzeltme',
];

routes.forEach((r) => {
  router.get(`/${r}`, auth, (req, res) => {
    res.json({ mesaj: `${r} sayfası`, kullanici: req.user });
  });
});

module.exports = router;
