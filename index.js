const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const nodemailer = require('nodemailer');
const path = require('path');
const db = require('./db');

const DOMAIN = 'sinyalziasyon.com';
const EMAIL_USER = 'durmuseren123@gmail.com';
const EMAIL_PASS = 'diizzkgkemrhdxob';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'verysecretkey',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static('public', { index: false }));

const layout = (title, body) => `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>${title}</title><link rel="stylesheet" href="/style.css"></head><body><header><img src="/logo.svg" alt="Logo"><span>SİNYAL STOK SİSTEMİ</span></header><main>${body}</main></body></html>`;

// Ana sayfa
app.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/giris');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Giriş formu
app.get('/giris', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'giris.html'));
});

// Giriş işlemi
app.post('/giris', (req, res) => {
  const { emailPrefix, password } = req.body;
  if (!emailPrefix || !password) {
    return res.send(layout('Hata', 'Eksik bilgi <a href="/giris">Geri dön</a>'));
  }
  const email = `${emailPrefix}@${DOMAIN}`.toLowerCase();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  stmt.get(email, (err, user) => {
    if (err || !user) {
      return res.send(layout('Hata', 'Geçersiz e-posta veya şifre <a href="/giris">Geri dön</a>'));
    }
    if (!user.verified) {
      return res.send(layout('Hata', 'Hesabınız doğrulanmamış. <a href="/giris">Geri dön</a>'));
    }
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.send(layout('Hata', 'Geçersiz e-posta veya şifre <a href="/giris">Geri dön</a>'));
    }
    req.session.user = { id: user.id, email: user.email, username: user.username };
    res.redirect('/');
  });
});

// Kayıt formu
app.get('/kayit', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'kayit.html'));
});

// Kayıt işlemi
app.post('/kayit', (req, res) => {
  const { emailPrefix, adSoyad, password, confirmPassword } = req.body;
  if (!emailPrefix || !adSoyad || !password || !confirmPassword) {
    return res.send(layout('Hata', 'Eksik bilgi <a href="/kayit">Geri dön</a>'));
  }
  if (password !== confirmPassword) {
    return res.send(layout('Hata', 'Şifreler eşleşmiyor <a href="/kayit">Geri dön</a>'));
  }
  const email = `${emailPrefix}@${DOMAIN}`.toLowerCase();
  const passwordHash = bcrypt.hashSync(password, 10);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const stmt = db.prepare('INSERT INTO users (email, username, password_hash, verification_code) VALUES (?, ?, ?, ?)');
  stmt.run(email, adSoyad, passwordHash, verificationCode, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.send(layout('Hata', 'Bu e-posta ile hesap zaten var <a href="/kayit">Geri dön</a>'));
      }
      return res.send(layout('Hata', 'Kayıt sırasında hata oluştu <a href="/kayit">Geri dön</a>'));
    }
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: 'Sinyal Stok Doğrulama Kodu',
      text: `Doğrulama kodunuz: ${verificationCode}`
    };
    console.log(`Verification code for ${email}: ${verificationCode}`);
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Mail gönderilemedi:', error);
        return res.send(layout('Hata', 'Mail gönderilirken hata oluştu <a href="/kayit">Geri dön</a>'));
      }
      req.session.pendingEmail = email;
      res.redirect('/dogrula');
    });
  });
});

// Doğrulama formu
app.get('/dogrula', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  if (!req.session.pendingEmail) {
    return res.redirect('/giris');
  }
  res.sendFile(path.join(__dirname, 'public', 'dogrula.html'));
});

// Kullanıcı bilgisi
app.get('/api/me', (req, res) => {
  if (!req.session.user) {
    return res.json({ authenticated: false });
  }
  res.json({ authenticated: true, username: req.session.user.username });
});

// Bekleyen e-posta
app.get('/api/pending-email', (req, res) => {
  res.json({ email: req.session.pendingEmail || null });
});

// Doğrulama işlemi
app.post('/dogrula', (req, res) => {
  const email = req.session.pendingEmail;
  const { code } = req.body;
  if (!email) {
    return res.redirect('/giris');
  }
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  stmt.get(email, (err, user) => {
    if (err || !user) {
      return res.send(layout('Hata', 'Kullanıcı bulunamadı'));
    }
    if (user.verification_code !== code) {
      return res.send(layout('Hata', 'Kod hatalı <a href="/dogrula">Tekrar dene</a>'));
    }
    db.run('UPDATE users SET verified = 1, verification_code = NULL WHERE id = ?', user.id, (uerr) => {
      if (uerr) {
        return res.send(layout('Hata', 'Doğrulama sırasında hata'));
      }
      req.session.user = { id: user.id, email: user.email, username: user.username };
      delete req.session.pendingEmail;
      res.redirect('/');
    });
  });
});

// Çıkış
app.get('/cikis', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/giris');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

