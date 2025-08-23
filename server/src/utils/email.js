// server/src/utils/email.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

/**
 * SMTP transporter
 * .env örneği:
 *   SMTP_HOST=smtp.yandex.com
 *   SMTP_PORT=587
 *   SMTP_SECURE=false
 *   SMTP_USER=noreply@sinyalizasyon.com
 *   SMTP_PASS=...
 *   SMTP_FROM="Sinyal Stok <noreply@sinyalizasyon.com>"
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE) === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/** Doğrulama kodu gönderir (şifre değişikliği / kayıt) */
export async function sendVerificationCode(to, code) {
  const subject = "Sinyal Stok Sistemi — Doğrulama Kodu";
  const html = `
    <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px">
      <p>Merhaba,</p>
      <p>Doğrulama kodunuz:</p>
      <div style="font-size:24px;font-weight:700;letter-spacing:3px;margin:12px 0">${code}</div>
      <p>Kod <strong>15 dakika</strong> içinde geçerlidir.</p>
      <p>İsteği siz başlatmadıysanız bu mesajı yok sayabilirsiniz.</p>
    </div>
  `;

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

/** Kritik stok bildirimi (opsiyonel) */
export async function sendCriticalStockEmail(to, lines) {
  const html = `
    <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px">
      <h3>Kritik Stok Uyarısı</h3>
      <ul>${(lines || []).map((l) => `<li>${l}</li>`).join("")}</ul>
    </div>
  `;
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Kritik Stok Uyarısı",
    html,
  });
}
