const pool = require("../config/database");

// Menampilkan semua dokumen penerimaan
const getDocuments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        rd.id_document,
        rd.document_number,
        rd.status,
        rd.created_by,
        rd.created_at,
        COUNT(rdi.id_document_receiving)::INTEGER AS total_items
      FROM receiving_documents rd
      LEFT JOIN receiving_document_items rdi
        ON rd.id_document = rdi.receiving_document_id
      GROUP BY rd.id_document
      ORDER BY rd.id_document DESC
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil dokumen penerimaan",
    });
  }
};

const getDocumentById = async (req, res) => {
  const documentId = Number(req.params.id);

  if (!Number.isSafeInteger(documentId) || documentId <= 0) {
    return res.status(400).json({
      success: false,
      message: "ID dokumen tidak valid",
    });
  }

  try {
    const documentResult = await pool.query(
      `SELECT
         rd.id_document,
         rd.document_number,
         rd.status,
         rd.created_by,
         rd.created_at,
         rd.updated_at,
         u.name AS created_by_name
       FROM receiving_documents rd
       LEFT JOIN users u ON u.id_user = rd.created_by
       WHERE rd.id_document = $1`,
      [documentId],
    );

    if (documentResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Dokumen penerimaan tidak ditemukan",
      });
    }

    const itemsResult = await pool.query(
      `SELECT
         rdi.id_document_receiving,
         rdi.product_id,
         p.sku,
         p.name AS product_name,
         rdi.expected_quantity,
         rdi.received_quantity,
         rdi.created_at,
         rdi.updated_at
       FROM receiving_document_items rdi
       JOIN products p ON p.id_product = rdi.product_id
       WHERE rdi.receiving_document_id = $1
       ORDER BY rdi.id_document_receiving ASC`,
      [documentId],
    );

    return res.status(200).json({
      success: true,
      data: {
        ...documentResult.rows[0],
        items: itemsResult.rows,
      },
    });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail dokumen penerimaan",
    });
  }
};

// Membuat dokumen penerimaan baru
const createDocument = async (req, res) => {
  const { document_number, items } = req.body ?? {};
  const createdBy = Number(req.user?.id_user);

  if (
    typeof document_number !== "string" ||
    !document_number.trim() ||
    document_number.trim().length > 100 ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(422).json({
      success: false,
      message: "Nomor dokumen dan minimal satu item wajib diisi",
    });
  }

  if (!Number.isSafeInteger(createdBy) || createdBy <= 0) {
    return res.status(401).json({
      success: false,
      message: "Autentikasi diperlukan untuk membuat dokumen",
    });
  }

  const normalizedItems = [];
  const productIds = new Set();

  for (const item of items) {
    const productId = Number(item?.product_id);
    const expectedQuantity = Number(item?.expected_quantity);

    if (
      !Number.isSafeInteger(productId) ||
      productId <= 0 ||
      !Number.isSafeInteger(expectedQuantity) ||
      expectedQuantity <= 0 ||
      expectedQuantity > 2147483647
    ) {
      return res.status(422).json({
        success: false,
        message: "Setiap item harus memiliki ID produk dan jumlah yang valid",
      });
    }

    if (productIds.has(productId)) {
      return res.status(422).json({
        success: false,
        message: "Produk tidak boleh duplikat dalam satu dokumen",
      });
    }

    productIds.add(productId);
    normalizedItems.push({ productId, expectedQuantity });
  }

  let client;
  let transactionStarted = false;

  try {
    client = await pool.connect();
    await client.query("BEGIN");
    transactionStarted = true;

    const productsResult = await client.query(
      `SELECT id_product
       FROM products
       WHERE id_product = ANY($1::bigint[])
         AND is_active = TRUE
       ORDER BY id_product
       FOR SHARE`,
      [[...productIds]],
    );

    if (productsResult.rowCount !== productIds.size) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(422).json({
        success: false,
        message: "Semua produk harus ditemukan dan berstatus aktif",
      });
    }

    const documentResult = await client.query(
      `INSERT INTO receiving_documents (document_number, created_by)
       VALUES ($1, $2)
       RETURNING *`,
      [document_number.trim(), createdBy],
    );

    const document = documentResult.rows[0];
    const createdItems = [];

    for (const item of normalizedItems) {
      const itemResult = await client.query(
        `INSERT INTO receiving_document_items
           (receiving_document_id, product_id, expected_quantity)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [document.id_document, item.productId, item.expectedQuantity],
      );
      createdItems.push(itemResult.rows[0]);
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "Dokumen penerimaan berhasil dibuat",
      data: {
        ...document,
        items: createdItems,
      },
    });
  } catch (error) {
    if (client && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(rollbackError.message);
      }
    }

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Nomor dokumen sudah digunakan",
      });
    }

    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal membuat dokumen penerimaan",
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

const addDocumentItem = async (req, res) => {
  const documentId = Number(req.params.id);
  const { product_id, expected_quantity } = req.body ?? {};

  if (
    !Number.isSafeInteger(documentId) ||
    documentId <= 0 ||
    !Number.isSafeInteger(Number(product_id)) ||
    Number(product_id) <= 0 ||
    !Number.isSafeInteger(Number(expected_quantity)) ||
    Number(expected_quantity) <= 0 ||
    Number(expected_quantity) > 2147483647
  ) {
    return res.status(400).json({
      success: false,
      message: "ID dokumen, ID produk, dan jumlah yang valid wajib diisi",
    });
  }

  let client;
  let transactionStarted = false;

  try {
    client = await pool.connect();
    await client.query("BEGIN");
    transactionStarted = true;

    const documentResult = await client.query(
      `SELECT status
       FROM receiving_documents
       WHERE id_document = $1
       FOR UPDATE`,
      [documentId],
    );

    if (documentResult.rowCount === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(404).json({
        success: false,
        message: "Dokumen penerimaan tidak ditemukan",
      });
    }

    if (documentResult.rows[0].status !== "pending") {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(409).json({
        success: false,
        message: "Item hanya dapat ditambahkan ke dokumen pending",
      });
    }

    const result = await client.query(
      `SELECT id_product
       FROM products
       WHERE id_product = $1
         AND is_active = TRUE
       FOR SHARE`,
      [Number(product_id)],
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(422).json({
        success: false,
        message: "Produk tidak ditemukan atau tidak aktif",
      });
    }

    const itemResult = await client.query(
      `INSERT INTO receiving_document_items
        (receiving_document_id, product_id, expected_quantity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [documentId, Number(product_id), Number(expected_quantity)],
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "Produk berhasil ditambahkan ke dokumen",
      data: itemResult.rows[0],
    });
  } catch (error) {
    if (client && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(rollbackError.message);
      }
    }

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Produk sudah ada dalam dokumen ini",
      });
    }

    if (error.code === "23503") {
      return res.status(422).json({
        success: false,
        message: "ID dokumen atau produk tidak ditemukan",
      });
    }

    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Gagal menambahkan produk ke dokumen",
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

const receiveDocumentItem = async (req, res) => {
  const documentId = Number(req.params.id);
  const itemId = Number(req.params.itemId);
  const quantity = Number(req.body?.quantity);
  const performedBy = Number(req.user?.id_user ?? req.user?.id);

  if (
    !Number.isSafeInteger(documentId) ||
    documentId <= 0 ||
    !Number.isSafeInteger(itemId) ||
    itemId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "ID dokumen dan ID item tidak valid",
    });
  }

  if (!Number.isSafeInteger(performedBy) || performedBy <= 0) {
    return res.status(401).json({
      success: false,
      message: "Autentikasi diperlukan untuk mencatat penerimaan",
    });
  }

  if (
    !Number.isSafeInteger(quantity) ||
    quantity <= 0 ||
    quantity > 2147483647
  ) {
    return res.status(422).json({
      success: false,
      message: "Jumlah penerimaan harus berupa bilangan bulat positif",
    });
  }

  const idempotencyKey = req.get
    ? req.get("Idempotency-Key")
    : req.headers?.["idempotency-key"];
  if (
    typeof idempotencyKey !== "string" ||
    !idempotencyKey.trim() ||
    idempotencyKey.trim().length > 255
  ) {
    return res.status(400).json({
      success: false,
      message: "Header Idempotency-Key wajib diisi (maksimal 255 karakter)",
    });
  }

  let client;
  let transactionStarted = false;

  try {
    client = await pool.connect();
    await client.query("BEGIN");
    transactionStarted = true;

    const idempotencyResult = await client.query(
      `INSERT INTO receipt_idempotency_keys
         (idempotency_key, user_id, document_id, item_id, quantity)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (idempotency_key) DO NOTHING
       RETURNING idempotency_key`,
      [idempotencyKey.trim(), performedBy, documentId, itemId, quantity],
    );

    if (idempotencyResult.rowCount === 0) {
      const existingResult = await client.query(
        `SELECT user_id, document_id, item_id, quantity,
                response_status, response_body
         FROM receipt_idempotency_keys
         WHERE idempotency_key = $1
         FOR UPDATE`,
        [idempotencyKey.trim()],
      );
      const existing = existingResult.rows[0];

      if (
        !existing ||
        Number(existing.user_id) !== performedBy ||
        Number(existing.document_id) !== documentId ||
        Number(existing.item_id) !== itemId ||
        existing.quantity !== quantity
      ) {
        await client.query("ROLLBACK");
        transactionStarted = false;
        return res.status(409).json({
          success: false,
          message: "Idempotency-Key sudah digunakan untuk permintaan lain",
        });
      }

      if (existing.response_body === null) {
        await client.query("ROLLBACK");
        transactionStarted = false;
        return res.status(409).json({
          success: false,
          message: "Permintaan dengan Idempotency-Key ini masih diproses",
        });
      }

      await client.query("COMMIT");
      transactionStarted = false;
      return res.status(existing.response_status).json(existing.response_body);
    }

    const itemResult = await client.query(
      `SELECT
         rd.document_number,
         rd.status,
         rdi.id_document_receiving,
         rdi.product_id,
         rdi.expected_quantity,
         rdi.received_quantity
       FROM receiving_documents rd
       JOIN receiving_document_items rdi
         ON rdi.receiving_document_id = rd.id_document
       WHERE rd.id_document = $1
         AND rdi.id_document_receiving = $2
       FOR UPDATE OF rd, rdi`,
      [documentId, itemId],
    );

    if (itemResult.rowCount === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(404).json({
        success: false,
        message: "Dokumen atau item penerimaan tidak ditemukan",
      });
    }

    const item = itemResult.rows[0];

    if (item.status === "completed") {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(409).json({
        success: false,
        message: "Dokumen penerimaan sudah selesai",
      });
    }

    const newReceivedQuantity = item.received_quantity + quantity;
    if (newReceivedQuantity > item.expected_quantity) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(422).json({
        success: false,
        message: "Jumlah penerimaan melebihi sisa jumlah yang diharapkan",
      });
    }

    await client.query(
      `UPDATE receiving_document_items
       SET received_quantity = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id_document_receiving = $2`,
      [newReceivedQuantity, itemId],
    );

    const inventoryResult = await client.query(
      `INSERT INTO inventories (product_id, quantity)
       VALUES ($1, $2)
       ON CONFLICT (product_id)
       DO UPDATE SET
         quantity = inventories.quantity + EXCLUDED.quantity,
         updated_at = CURRENT_TIMESTAMP
       RETURNING quantity`,
      [item.product_id, quantity],
    );

    await client.query(
      `INSERT INTO inventory_transactions
         (product_id, receiving_document_item_id, performed_by, transaction_type, quantity)
       VALUES ($1, $2, $3, 'receipt', $4)`,
      [item.product_id, itemId, performedBy, quantity],
    );

    const statusResult = await client.query(
      `UPDATE receiving_documents
       SET status = CASE
         WHEN NOT EXISTS (
           SELECT 1
           FROM receiving_document_items
           WHERE receiving_document_id = $1
             AND received_quantity < expected_quantity
         ) THEN 'completed'
         WHEN EXISTS (
           SELECT 1
           FROM receiving_document_items
           WHERE receiving_document_id = $1
             AND received_quantity > 0
         ) THEN 'partial'
         ELSE 'pending'
       END,
       updated_at = CURRENT_TIMESTAMP
       WHERE id_document = $1
       RETURNING status`,
      [documentId],
    );

    const responseBody = {
      success: true,
      message: "Penerimaan barang berhasil dicatat",
      data: {
        document_number: item.document_number,
        status: statusResult.rows[0].status,
        item: {
          product_id: item.product_id,
          expected_quantity: item.expected_quantity,
          received_quantity: newReceivedQuantity,
          remaining_quantity: item.expected_quantity - newReceivedQuantity,
        },
        inventory: {
          product_id: item.product_id,
          quantity: inventoryResult.rows[0].quantity,
        },
      },
    };

    await client.query(
      `UPDATE receipt_idempotency_keys
       SET response_status = 200, response_body = $1::jsonb
       WHERE idempotency_key = $2`,
      [JSON.stringify(responseBody), idempotencyKey.trim()],
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(200).json(responseBody);
  } catch (error) {
    if (client && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(rollbackError.message);
      }
    }

    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal mencatat penerimaan barang",
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

const completeDocument = async (req, res) => {
  const documentId = Number(req.params.id);

  if (!Number.isSafeInteger(documentId) || documentId <= 0) {
    return res.status(400).json({
      success: false,
      message: "ID dokumen tidak valid",
    });
  }

  let client;
  let transactionStarted = false;

  try {
    client = await pool.connect();
    await client.query("BEGIN");
    transactionStarted = true;

    const documentResult = await client.query(
      `SELECT id_document, status
       FROM receiving_documents
       WHERE id_document = $1
       FOR UPDATE`,
      [documentId],
    );

    if (documentResult.rowCount === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(404).json({
        success: false,
        message: "Dokumen penerimaan tidak ditemukan",
      });
    }

    const itemsResult = await client.query(
      `SELECT
         COUNT(*) AS total_items,
         COUNT(*) FILTER (
           WHERE received_quantity < expected_quantity
         ) AS incomplete_items
       FROM receiving_document_items
       WHERE receiving_document_id = $1`,
      [documentId],
    );

    const totalItems = Number(itemsResult.rows[0].total_items);
    const incompleteItems = Number(itemsResult.rows[0].incomplete_items);

    if (totalItems === 0 || incompleteItems > 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(409).json({
        success: false,
        message:
          totalItems === 0
            ? "Dokumen belum memiliki item"
            : "Masih ada item yang belum diterima secara lengkap",
      });
    }

    const result = await client.query(
      `UPDATE receiving_documents
       SET status = 'completed',
           updated_at = CURRENT_TIMESTAMP
       WHERE id_document = $1
       RETURNING *`,
      [documentId],
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Dokumen penerimaan berhasil diselesaikan",
      data: result.rows[0],
    });
  } catch (error) {
    if (client && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(rollbackError.message);
      }
    }

    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal menyelesaikan dokumen penerimaan",
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  addDocumentItem,
  receiveDocumentItem,
  completeDocument,
};
