// server/src/store/codes.js
// E-posta doğrulama kodlarını kısa süreli RAM'de tutar

const map = new Map(); // email -> { code, exp }

/**
 * Kodu set eder (ttlSec saniye)
 * @param {string} email
 * @param {string|number} code
 * @param {number} ttlSec  seconds (default 900 = 15dk)
 */
export function setCode(email, code, ttlSec = 900) {
  const key = String(email).toLowerCase();
  const exp = Date.now() + ttlSec * 1000;
  map.set(key, { code: String(code), exp });
}

/**
 * Kodu doğrular (doğruysa kaydı siler)
 * @param {string} email
 * @param {string|number} code
 * @returns {boolean}
 */
export function verifyCode(email, code) {
  const key = String(email).toLowerCase();
  const rec = map.get(key);
  if (!rec) return false;
  if (Date.now() > rec.exp) {
    map.delete(key);
    return false;
  }
  const ok = String(code) === rec.code;
  if (ok) map.delete(key);
  return ok;
}
