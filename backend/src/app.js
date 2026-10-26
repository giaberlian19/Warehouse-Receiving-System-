require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const ProductRoutes = require("./routes/ProductRouter.js");
const receivingDocumentRoutes = require("./routes/receivingDocumentRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const allowedOrigins = (
  process.env.CORS_ORIGINS ??
  "http://localhost:3000,http://localhost:3001"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", authRoutes);
app.use("/api/receiving-documents", receivingDocumentRoutes);
app.use("/api/products", ProductRoutes);
app.use("/api/inventory", inventoryRoutes);

// Endpoint untuk mengecek server
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Warehouse Receiving API berjalan",
  });
});

// Endpoint untuk mengecek koneksi PostgreSQL
app.get("/api/health/db", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      success: true,
      message: "Koneksi PostgreSQL berhasil",
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Koneksi PostgreSQL gagal",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Body request harus berupa JSON yang valid",
    });
  }

  console.error(error.message);
  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

module.exports = app;
