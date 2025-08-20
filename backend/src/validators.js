const { z } = require('zod');

const email = z
  .string()
  .email('Geçersiz e-posta')
  .refine((val) => val.endsWith('@sinyalizasyon.com'), {
    message: 'Sadece @sinyalizasyon.com kabul edilir',
  });
const password = z.string().min(6, 'Şifre en az 6 karakter olmalı');

const registerSchema = z.object({ eposta: email, sifre: password });
const loginSchema = z.object({ eposta: email, sifre: password });

module.exports = { registerSchema, loginSchema };
