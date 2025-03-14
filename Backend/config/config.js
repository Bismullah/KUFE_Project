module.exports = {
  jwtSecret: process.env.JWT_SECRET || "your_jwt_secret_key",
  jwtExpire: process.env.JWT_EXPIRE || "30d",
  env: process.env.NODE_ENV || "development",
  uploadDir: "uploads/",
}

