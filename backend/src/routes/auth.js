const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const { registerSchema, loginSchema } = require('../validators');
const { sendMail } = require('../email');

const router = express.Router();
const DOMAIN = '@sinyalizasyon.com';

function checkEmail(email) {
  if (!email.endsWith(DOMAIN)) {
    throw new Error('E-posta domaini geçersiz');
  }
  return email.toLowerCase();
}

router.post('/kayit', async (req, res, next) => {
  try {
    const { ad, soyad, eposta, sifre } = registerSchema.parse(req.body);
    const email = checkEmail(eposta);
    const hashed = await bcrypt.hash(sifre, 10);
    const token = crypto.randomBytes(20).toString('hex');
    await db.query(
      'INSERT INTO users (ad, soyad, email, password, verification_token) VALUES ($1,$2,$3,$4,$5)',
      [ad, soyad, email, hashed, token]
    );
    const verifyLink = `${process.env.FRONTEND_URL}/dogrulama?token=${token}`;
    await sendMail({
      to: email,
      subject: 'Hesap Doğrulama',
      text: `Lütfen doğrulamak için ${verifyLink} adresine gidin`,
    });
    res.status(201).json({ mesaj: 'Kayıt başarılı, e-postanızı kontrol edin' });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ mesaj: 'E-posta zaten kayıtlı' });
    } else if (err.errors) {
      res.status(400).json({ mesaj: err.errors[0].message });
    } else if (err.message) {
      res.status(400).json({ mesaj: err.message });
    } else {
      next(err);
    }
  }
});

router.post('/giris', async (req, res, next) => {
  try {
    const { eposta, sifre } = loginSchema.parse(req.body);
    const email = checkEmail(eposta);
    const { rows } = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ mesaj: 'Geçersiz bilgiler' });
    if (!user.verified)
      return res.status(403).json({ mesaj: 'Hesap doğrulanmamış' });
    const valid = await bcrypt.compare(sifre, user.password);
    if (!valid) return res.status(400).json({ mesaj: 'Geçersiz bilgiler' });
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
    });
    res.json({ mesaj: 'Giriş başarılı' });
  } catch (err) {
    if (err.errors) {
      res.status(400).json({ mesaj: err.errors[0].message });
    } else if (err.message) {
      res.status(400).json({ mesaj: err.message });
    } else {
      next(err);
    }
  }
});

router.get('/dogrulama', async (req, res, next) => {
  const { token } = req.query;
  try {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE verification_token=$1',
      [token]
    );
    const user = rows[0];
    if (!user) return res.status(400).json({ mesaj: 'Token geçersiz' });
    await db.query(
      'UPDATE users SET verified=true, verification_token=null WHERE id=$1',
      [user.id]
    );
    res.json({ mesaj: 'Hesap doğrulandı' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
