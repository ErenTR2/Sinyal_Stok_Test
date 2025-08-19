const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(express.json());

const JWT_SECRET = 'verysecretkey'; // For demo purposes only

// Helper to send JSON error
function sendError(res, message, code = 400) {
  return res.status(code).json({ error: message });
}

// Registration endpoint
app.post('/register', (req, res) => {
  const { emailPrefix, username, password, confirmPassword } = req.body;
  if (!emailPrefix || !username || !password || !confirmPassword) {
    return sendError(res, 'Eksik bilgi');
  }
  if (password !== confirmPassword) {
    return sendError(res, 'Şifreler eşleşmiyor');
  }
  const email = `${emailPrefix}@sinyalizasyon.com`.toLowerCase();

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const passwordHash = bcrypt.hashSync(password, 10);

  const stmt = db.prepare(
    'INSERT INTO users (email, username, password_hash, verification_code, verified) VALUES (?, ?, ?, ?, 0)'
  );
  stmt.run(email, username, passwordHash, verificationCode, function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return sendError(res, 'Bu e-posta ile hesap zaten var');
      }
      return sendError(res, 'Kayıt sırasında hata oluştu');
    }
    console.log(`Verification code for ${email}: ${verificationCode}`);
    res.json({ message: 'Doğrulama kodu e-posta adresinize gönderildi' });
  });
});

// Verification endpoint
app.post('/verify', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return sendError(res, 'Eksik bilgi');
  }
  const stmt = db.prepare('SELECT verification_code, verified FROM users WHERE email = ?');
  stmt.get(email.toLowerCase(), (err, row) => {
    if (err || !row) {
      return sendError(res, 'Kullanıcı bulunamadı', 404);
    }
    if (row.verified) {
      return res.json({ message: 'Hesap zaten doğrulanmış' });
    }
    if (row.verification_code !== code) {
      return sendError(res, 'Doğrulama kodu hatalı');
    }
    const updateStmt = db.prepare('UPDATE users SET verified = 1, verification_code = NULL WHERE email = ?');
    updateStmt.run(email.toLowerCase(), (err2) => {
      if (err2) {
        return sendError(res, 'Güncelleme sırasında hata oluştu');
      }
      res.json({ message: 'Hesap doğrulandı' });
    });
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, 'Eksik bilgi');
  }
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  stmt.get(email.toLowerCase(), (err, user) => {
    if (err || !user) {
      return sendError(res, 'Geçersiz e-posta veya şifre', 401);
    }
    if (!user.verified) {
      return sendError(res, 'Hesap doğrulanmamış', 403);
    }
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return sendError(res, 'Geçersiz e-posta veya şifre', 401);
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
