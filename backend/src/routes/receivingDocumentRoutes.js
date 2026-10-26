const express = require("express");
const router = express.Router();

const {
  getDocuments,
  getDocumentById,
  createDocument,
  addDocumentItem,
  receiveDocumentItem,
  completeDocument,
} = require("../controllers/receivingDocumentController");

const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/auotmiddleware");

// Admin and staff can view receiving documents.
router.get("/", authenticateToken, getDocuments);
router.get("/:id", authenticateToken, getDocumentById);

// Staff/operators create receiving documents and their items.
router.post(
  "/",
  authenticateToken,
  authorizeRole("admin", "staff"),
  createDocument,
);

router.post(
  "/:id/items",
  authenticateToken,
  authorizeRole("admin", "staff"),
  addDocumentItem,
);

// POST is the documented receipt operation; PATCH remains for older clients.
router.post(
  "/:id/items/:itemId/receive",
  authenticateToken,
  authorizeRole("admin", "staff"),
  receiveDocumentItem,
);
router.patch(
  "/:id/items/:itemId/receive",
  authenticateToken,
  authorizeRole("admin", "staff"),
  receiveDocumentItem,
);

// Only admins can manually complete a document.
router.patch(
  "/:id/complete",
  authenticateToken,
  authorizeRole("admin"),
  completeDocument,
);

module.exports = router;
