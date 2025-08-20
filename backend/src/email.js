const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transport = nodemailer.createTransport({
  streamTransport: true,
  newline: 'unix',
  buffer: true,
});

async function sendMail({ to, subject, text, html }) {
  const info = await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
  const dir = process.env.EMAIL_DIR || 'emails';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const file = path.join(dir, `${Date.now()}.eml`);
  fs.writeFileSync(file, info.message);
  return info;
}

module.exports = { sendMail };
