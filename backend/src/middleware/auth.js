const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ mesaj: 'Giriş gerekli' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ mesaj: 'Geçersiz token' });
  }
}

module.exports = auth;
