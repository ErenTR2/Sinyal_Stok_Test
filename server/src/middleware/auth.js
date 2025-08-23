import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const accessToken = req.cookies['access_token'];
  if (!accessToken) return res.status(401).json({ error: 'unauthorized' });
  try {
    const payload = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
    const has = req.user.roles?.some(r => roles.includes(r));
    if (!has) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}
