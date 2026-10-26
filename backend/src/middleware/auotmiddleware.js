const jwt = require("jsonwebtoken");
const pool = require("../config/database");

// Memastikan pengguna sudah login
const authenticateToken = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token autentikasi diperlukan",
    });
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      `SELECT id_user, name, email, role
       FROM users
       WHERE id_user = $1`,
      [decoded.id_user],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    req.user = result.rows[0];

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid atau sudah kedaluwarsa",
      });
    }

    console.error(error.message);

    return res.status(500).json({
      success: false,
      message: "Gagal memverifikasi autentikasi",
    });
  }
};

// Membatasi akses berdasarkan role
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Kamu tidak memiliki izin untuk mengakses fitur ini",
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
};
