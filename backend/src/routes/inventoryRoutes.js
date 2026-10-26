const express = require("express");
const router = express.Router();

const {
  getInventory,
  getInventoryByProductId,
  getInventoryTransactions,
  getInventoryTransactionById,
} = require("../controllers/inventoryController");
const { authenticateToken } = require("../middleware/auotmiddleware");

router.get("/", authenticateToken, getInventory);
router.get("/transactions", authenticateToken, getInventoryTransactions);
router.get(
  "/transactions/:id",
  authenticateToken,
  getInventoryTransactionById,
);
router.get("/:productId", authenticateToken, getInventoryByProductId);

module.exports = router;
