function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ mesaj: 'Beklenmeyen hata' });
}

module.exports = errorHandler;
