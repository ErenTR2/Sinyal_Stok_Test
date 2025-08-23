require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const errorHandler = require('./middleware/error');

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
app.use(limiter);

app.use(authRoutes);
app.use(protectedRoutes);
app.use(errorHandler);

const port = process.env.PORT || 4000;

db.init().then(() => {
  app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor`);
  });
});
