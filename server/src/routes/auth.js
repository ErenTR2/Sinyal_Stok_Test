// server/src/routes/auth.js
import { Router } from "express";
import { query } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendVerificationCode } from "../utils/email.js";
import { setCode, verifyCode } from "../store/codes.js";

const router = Router();

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

    const hashed = await bcrypt.hash(password, 10);
    await query(
      "INSERT INTO users (email, username, password, role) VALUES ($1,$2,$3,$4)",
      [email, username || "", hashed, "kullanıcı"]
    );

    // İstersen burada doğrulama kodu üretip mail gönderebilirsin
    const code = Math.floor(100000 + Math.random() * 900000);
    setCode(email, code, 900);
    await sendVerificationCode(email, code);

    res.json({ ok: true, email });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "register_failed" });
  }
});

/* ---- Login ---- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "missing_fields" });

    const { rows } = await query("SELECT id, email, username, password, role FROM users WHERE email=$1 LIMIT 1", [email]);
    const user = rows?.[0];
    if (!user) return res.status(404).json({ error: "user_not_found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "wrong_password" });

    const token = jwt.sign({ uid: user.id, role: user.role }, process.env.JWT_SECRET || "dev", { expiresIn: "7d" });
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

    const { rows } = await query("SELECT id, password FROM users WHERE email=$1 LIMIT 1", [email]);
    const user = rows?.[0];
    if (!user) return res.status(404).json({ error: "user_not_found" });

    const ok = await bcrypt.compare(current, user.password);
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
    await query("UPDATE users SET password=$1 WHERE email=$2", [hashed, email]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "confirm_failed" });
  }
});

export default router;
