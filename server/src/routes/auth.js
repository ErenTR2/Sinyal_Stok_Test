// server/src/routes/auth.js
import { Router } from "express";
import { query } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendVerificationCode } from "../utils/email.js";
import { setCode, verifyCode } from "../store/codes.js";

const router = Router();

// Ensure new auth-related columns exist for older databases
let checked = false;
async function ensureUserColumns() {
  if (checked) return;
  checked = true;
  try {
    await query(
      "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS username TEXT NOT NULL DEFAULT ''"
    );
    await query(
      "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT ''"
    );
    await query(
      "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false"
    );
  } catch (err) {
    console.error("ensureUserColumns:", err.message);
  }
}

// Run column check once for any auth request
router.use(async (_req, _res, next) => {
  await ensureUserColumns();
  next();
});

/* Örnek health */
router.get("/health", (req, res) => res.json({ ok: true }));

/* ---- Kayıt (örnek) ----
   Frontend’den gelen email/username/password’i alıp user oluşturursun.
   Burada sadece iskelet var. Senin projendeki mevcut kayıt kodun varsa onu kullan.
*/
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "missing_fields" });

    // E-posta zaten var mı?
    const existRes = await query("SELECT id FROM users WHERE email=$1", [email]);
    if (existRes.rows?.length) return res.status(400).json({ error: "email_in_use" });

    const hashed = await bcrypt.hash(password, 10);

    // Kullanıcıyı oluştur
    const { rows } = await query(
      "INSERT INTO users (email, username, password_hash) VALUES ($1,$2,$3) RETURNING id",
      [email, username || "", hashed]
    );
    const userId = rows?.[0]?.id;

    // Varsayılan rol ata
    const roleRes = await query("SELECT id FROM roles WHERE name=$1 LIMIT 1", ["kullanici"]);
    const roleId = roleRes.rows?.[0]?.id;
    if (userId && roleId) {
      try {
        await query("INSERT INTO user_roles (user_id, role_id) VALUES ($1,$2)", [userId, roleId]);
      } catch (err) {
        console.error("default role assignment failed:", err.message);
      }
    }

    // Doğrulama kodu gönder
    const code = Math.floor(100000 + Math.random() * 900000);
    setCode(email, code, 900);
    try {
      await sendVerificationCode(email, code);
    } catch (err) {
      console.error("verification email failed:", err.message);
    }

    res.json({ ok: true, email });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "register_failed" });
  }
});

// E-posta doğrulama
router.post("/verify", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "missing_fields" });

    const valid = verifyCode(email, code);
    if (!valid) return res.status(400).json({ error: "invalid_code" });

    await query("UPDATE users SET verified=true WHERE email=$1", [email]);

    const { rows } = await query(
      `SELECT u.id, u.username, r.name as role
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id=u.id
       LEFT JOIN roles r ON r.id=ur.role_id
       WHERE u.email=$1 LIMIT 1`,
      [email]
    );
    const user = rows?.[0];

    const token = jwt.sign(
      { uid: user.id, role: user.role },
      process.env.JWT_SECRET || "dev",
      { expiresIn: "7d" }
    );

    res.json({ ok: true, token, user: { id: user.id, email, username: user.username, role: user.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "verify_failed" });
  }
});

// Doğrulama kodunu yeniden gönder
router.post("/resend-code", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "missing_fields" });

    const { rows } = await query("SELECT id FROM users WHERE email=$1 LIMIT 1", [email]);
    if (!rows?.[0]) return res.status(404).json({ error: "user_not_found" });

    const code = Math.floor(100000 + Math.random() * 900000);
    setCode(email, code, 900);
    try {
      await sendVerificationCode(email, code);
    } catch (err) {
      console.error("verification email failed:", err.message);
    }

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "resend_failed" });
  }
});

/* ---- Login ---- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "missing_fields" });

    const { rows } = await query(
      `SELECT u.id, u.email, u.username, u.password_hash, r.name as role
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id=u.id
       LEFT JOIN roles r ON r.id=ur.role_id
       WHERE u.email=$1 LIMIT 1`,
      [email]
    );
    const user = rows?.[0];
    if (!user) return res.status(404).json({ error: "user_not_found" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: "wrong_password" });

    const token = jwt.sign(
      { uid: user.id, role: user.role },
      process.env.JWT_SECRET || "dev",
      { expiresIn: "7d" }
    );
    res.json({
      ok: true,
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "login_failed" });
  }
});

/* ---- Şifre Değiştir: 1) Kod iste ---- */
router.post("/change-password/request", async (req, res) => {
  try {
    const { email, current } = req.body;
    if (!email || !current) return res.status(400).json({ error: "missing_fields" });

    const { rows } = await query("SELECT id, password_hash FROM users WHERE email=$1 LIMIT 1", [email]);
    const user = rows?.[0];
    if (!user) return res.status(404).json({ error: "user_not_found" });

    const ok = await bcrypt.compare(current, user.password_hash);
    if (!ok) return res.status(400).json({ error: "wrong_password" });

    const code = Math.floor(100000 + Math.random() * 900000);
    setCode(email, code, 900); // 15 dk
    await sendVerificationCode(email, code);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "request_failed" });
  }
});

/* ---- Şifre Değiştir: 2) Kod doğrula & kaydet ---- */
router.post("/change-password/confirm", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: "missing_fields" });

    const valid = verifyCode(email, code);
    if (!valid) return res.status(400).json({ error: "invalid_code" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password_hash=$1 WHERE email=$2", [hashed, email]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "confirm_failed" });
  }
});

export default router;
