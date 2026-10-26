const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/ProductControllers");

const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/auotmiddleware");

// Admin dan staff dapat melihat produk
router.get("/", authenticateToken, getProducts);
router.get("/:id", authenticateToken, getProductById);

// Staff/operator and admins can create products used in receiving documents.
router.post("/", authenticateToken, authorizeRole("admin", "staff"), createProduct);

// Hanya admin yang dapat mengubah produk
router.put("/:id", authenticateToken, authorizeRole("admin"), updateProduct);

// Hanya admin yang dapat menonaktifkan produk
router.delete("/:id", authenticateToken, authorizeRole("admin"), deleteProduct);

module.exports = router;
