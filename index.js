const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const db = require('./db');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'verysecretkey',
  resave: false,
  saveUninitialized: false
}));

// Ana sayfa
app.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/giris');
  }
  const { username } = req.session.user;
  res.send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Ana Sayfa</title></head><body><h1>Hoş geldiniz, ${username}</h1><a href="/cikis">Çıkış Yap</a></body></html>`);
});

// Giriş formu
app.get('/giris', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Giriş</title></head><body><h1>Giriş Yap</h1><form method="POST" action="/giris"><label>E-posta: <input type="text" name="email" required></label><br/><label>Şifre: <input type="password" name="password" required></label><br/><button type="submit">Giriş</button></form><p>Hesabınız yok mu? <a href="/kayit">Kayıt olun</a></p></body></html>`);
});

// Giriş işlemi
app.post('/giris', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.send('Eksik bilgi <a href="/giris">Geri dön</a>');
  }
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  stmt.get(email.toLowerCase(), (err, user) => {
    if (err || !user) {
      return res.send('Geçersiz e-posta veya şifre <a href="/giris">Geri dön</a>');
    }
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.send('Geçersiz e-posta veya şifre <a href="/giris">Geri dön</a>');
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
  res.send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Kayıt</title></head><body><h1>Kayıt Ol</h1><form method="POST" action="/kayit"><label>E-posta: <input type="text" name="emailPrefix" required>@sinyalizasyon.com</label><br/><label>Kullanıcı Adı: <input type="text" name="username" required></label><br/><label>Şifre: <input type="password" name="password" required></label><br/><label>Şifre (Tekrar): <input type="password" name="confirmPassword" required></label><br/><button type="submit">Kayıt Ol</button></form><p>Zaten hesabınız var mı? <a href="/giris">Giriş yapın</a></p></body></html>`);
});

// Kayıt işlemi
app.post('/kayit', (req, res) => {
  const { emailPrefix, username, password, confirmPassword } = req.body;
  if (!emailPrefix || !username || !password || !confirmPassword) {
    return res.send('Eksik bilgi <a href="/kayit">Geri dön</a>');
  }
  if (password !== confirmPassword) {
    return res.send('Şifreler eşleşmiyor <a href="/kayit">Geri dön</a>');
  }
  const email = `${emailPrefix}@sinyalizasyon.com`.toLowerCase();
  const passwordHash = bcrypt.hashSync(password, 10);
  const stmt = db.prepare('INSERT INTO users (email, username, password_hash, verified) VALUES (?, ?, ?, 1)');
  stmt.run(email, username, passwordHash, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.send('Bu e-posta ile hesap zaten var <a href="/kayit">Geri dön</a>');
      }
      return res.send('Kayıt sırasında hata oluştu <a href="/kayit">Geri dön</a>');
    }
    req.session.user = { id: this.lastID, email, username };
    res.redirect('/');
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

