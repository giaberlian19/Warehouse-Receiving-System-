const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/authControllers");

const { authenticateToken } = require("../middleware/auotmiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getCurrentUser);
router.post("/logout", authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout berhasil. Hapus token dari sisi klien.",
  });
});

module.exports = router;
