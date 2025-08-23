require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'sinyal-stok-secret',
  resave: false,
  saveUninitialized: false
}));

// Database setup
const db = new sqlite3.Database('database.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_verified INTEGER DEFAULT 0,
    verification_code TEXT
  )`);
});

// Mail transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error('Mail sunucusuna bağlanılamadı:', err);
  } else {
    console.log('Mail sunucusu hazır');
  }
});

function redirectIfAuth(req, res, next) {
  if (req.session.userId) {
    return res.redirect('/home');
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/home');
  res.redirect('/login');
});

app.get('/register', redirectIfAuth, (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', redirectIfAuth, (req, res) => {
  const { email_prefix, name, password, confirm_password } = req.body;
  if (!email_prefix || !name || !password) {
    return res.render('register', { error: 'Tüm alanlar gerekli.' });
  }
  if (password !== confirm_password) {
    return res.render('register', { error: 'Şifreler eşleşmiyor.' });
  }
  const email = `${email_prefix}@sinyalizasyon.com`;
  const hashed = bcrypt.hashSync(password, 10);
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  db.run(
    'INSERT INTO users (name, email, password, verification_code) VALUES (?,?,?,?)',
    [name, email, hashed, code],
    function (err) {
      if (err) {
        return res.render('register', { error: 'Mail zaten kayıtlı.' });
      }
      transporter.sendMail(
        {
          from: process.env.MAIL_USER,
          to: email,
          subject: 'Doğrulama Kodunuz',
          text: `Doğrulama kodunuz: ${code}`,
        },
        (mailErr) => {
          if (mailErr) {
            console.error(mailErr);
            db.run('DELETE FROM users WHERE id = ?', this.lastID);
            return res.render('register', { error: 'Doğrulama maili gönderilemedi.' });
          }
          req.session.userId = this.lastID;
          res.redirect('/verify');
        }
      );
    }
  );
});

app.get('/verify', requireAuth, (req, res) => {
  db.get('SELECT is_verified FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (user && user.is_verified) return res.redirect('/home');
    res.render('verify', { error: null });
  });
});

app.post('/verify', requireAuth, (req, res) => {
  const { code } = req.body;
  db.get('SELECT verification_code FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (!user || user.verification_code !== code) {
      return res.render('verify', { error: 'Kod geçersiz.' });
    }
    db.run('UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = ?',
      [req.session.userId],
      () => res.redirect('/home'));
  });
});

app.get('/login', redirectIfAuth, (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', redirectIfAuth, (req, res) => {
  const { email_prefix, password } = req.body;
  const email = `${email_prefix}@sinyalizasyon.com`;
  db.get('SELECT id, password, is_verified FROM users WHERE email = ?', [email], (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.render('login', { error: 'Geçersiz giriş.' });
    }
    req.session.userId = user.id;
    if (!user.is_verified) return res.redirect('/verify');
    res.redirect('/home');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/home', requireAuth, (req, res) => {
  db.get('SELECT name FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (!user) return res.redirect('/login');
    res.render('home', { name: user.name });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
