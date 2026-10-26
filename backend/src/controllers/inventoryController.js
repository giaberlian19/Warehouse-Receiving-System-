const pool = require("../config/database");

const parsePositiveId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const getInventory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         p.id_product AS product_id,
         p.sku,
         p.name AS product_name,
         p.is_active,
         COALESCE(i.quantity, 0) AS quantity,
         i.updated_at
       FROM products p
       LEFT JOIN inventories i ON i.product_id = p.id_product
       ORDER BY p.id_product`,
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data inventaris",
    });
  }
};

const getInventoryByProductId = async (req, res) => {
  const productId = parsePositiveId(req.params.productId);

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "ID produk tidak valid",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         p.id_product AS product_id,
         p.sku,
         p.name AS product_name,
         p.is_active,
         COALESCE(i.quantity, 0) AS quantity,
         i.updated_at
       FROM products p
       LEFT JOIN inventories i ON i.product_id = p.id_product
       WHERE p.id_product = $1`,
      [productId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil stok produk",
    });
  }
};

const getInventoryTransactions = async (req, res) => {
  const productId =
    req.query.product_id === undefined
      ? null
      : parsePositiveId(req.query.product_id);
  const from = req.query.from;
  const to = req.query.to;
  const isDate = (value) =>
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) &&
    new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;

  if (
    (req.query.product_id !== undefined && !productId) ||
    (from !== undefined && !isDate(from)) ||
    (to !== undefined && !isDate(to)) ||
    (from !== undefined && to !== undefined && from > to)
  ) {
    return res.status(400).json({
      success: false,
      message: "Filter produk atau rentang tanggal tidak valid",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         it.id_inventory_transactions,
         it.product_id,
         p.sku,
         p.name AS product_name,
         it.receiving_document_item_id,
         rd.document_number,
         it.performed_by,
         u.name AS performed_by_name,
         it.transaction_type,
         it.quantity,
         it.created_at
       FROM inventory_transactions it
       JOIN products p ON p.id_product = it.product_id
       JOIN receiving_document_items rdi
         ON rdi.id_document_receiving = it.receiving_document_item_id
       JOIN receiving_documents rd
         ON rd.id_document = rdi.receiving_document_id
       JOIN users u ON u.id_user = it.performed_by
       WHERE ($1::bigint IS NULL OR it.product_id = $1)
         AND ($2::date IS NULL OR it.created_at >= $2::date)
         AND ($3::date IS NULL OR it.created_at < $3::date + INTERVAL '1 day')
       ORDER BY it.created_at DESC, it.id_inventory_transactions DESC`,
      [productId, from ?? null, to ?? null],
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil riwayat transaksi inventaris",
    });
  }
};

const getInventoryTransactionById = async (req, res) => {
  const transactionId = parsePositiveId(req.params.id);

  if (!transactionId) {
    return res.status(400).json({
      success: false,
      message: "ID transaksi tidak valid",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         it.id_inventory_transactions,
         it.product_id,
         p.sku,
         p.name AS product_name,
         it.receiving_document_item_id,
         rd.document_number,
         it.performed_by,
         u.name AS performed_by_name,
         it.transaction_type,
         it.quantity,
         it.created_at
       FROM inventory_transactions it
       JOIN products p ON p.id_product = it.product_id
       JOIN receiving_document_items rdi
         ON rdi.id_document_receiving = it.receiving_document_item_id
       JOIN receiving_documents rd
         ON rd.id_document = rdi.receiving_document_id
       JOIN users u ON u.id_user = it.performed_by
       WHERE it.id_inventory_transactions = $1`,
      [transactionId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaksi inventaris tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail transaksi inventaris",
    });
  }
};

module.exports = {
  getInventory,
  getInventoryByProductId,
  getInventoryTransactions,
  getInventoryTransactionById,
};
