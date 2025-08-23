// server/src/index.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet";

import authRoutes from "./routes/auth.js";
// diğer routerların varsa import et: products, inventory, vs.

dotenv.config();
const app = express();

/**
 * ÖNEMLİ SIRA:
 * 1) CORS (OPTIONS dahil)
 * 2) JSON body parsers
 * 3) Helmet (CORS ile çakışmasın diye CORP disabled)
 * 4) Rotalar
 */

const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_ORIGIN || ""
].filter(Boolean));

app.use(cors({
  origin: (origin, cb) => {
    // mobile/desktop app veya curl gibi originsiz istekler için:
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.has(origin)) return cb(null, true);
    return cb(new Error("CORS: Origin not allowed: " + origin), false);
  },
  credentials: true,          // gerek yoksa true kalmasında sakınca yok
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Preflight (bazı barındırmalarda şart olabiliyor)
app.options("*", cors());

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Helmet: CORP kapalı, yoksa CORS header’larını gölgeliyor
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cookieParser());

// Sağlık kontrolü
app.get("/health", (req, res) => res.json({ ok: true }));

// Rotalar
app.use("/auth", authRoutes);
// app.use("/products", productsRoutes); // varsa aç

// 404
app.use((req, res) => res.status(404).json({ error: "not_found" }));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`✅ Server listening on http://localhost:${port}`);
});
