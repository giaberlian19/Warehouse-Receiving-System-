const pool = require("../config/database");

const isPositiveId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

// Menampilkan semua produk
const getProducts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY id_product DESC",
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data produk",
    });
  }
};

const getProductById = async (req, res) => {
  const id = isPositiveId(req.params.id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "ID produk tidak valid",
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE id_product = $1",
      [id],
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
      message: "Gagal mengambil detail produk",
    });
  }
};

// Menambahkan produk
const createProduct = async (req, res) => {
  const { sku, name } = req.body ?? {};

  if (
    typeof sku !== "string" ||
    !sku.trim() ||
    sku.trim().length > 100 ||
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 255
  ) {
    return res.status(422).json({
      success: false,
      message: "SKU dan nama produk wajib diisi",
    });
  }

  try {
    const client = await pool.connect();
    let transactionStarted = false;

    try {
      await client.query("BEGIN");
      transactionStarted = true;

      const result = await client.query(
        `INSERT INTO products (sku, name)
         VALUES ($1, $2)
         RETURNING *`,
        [sku.trim(), name.trim()],
      );

      await client.query(
        "INSERT INTO inventories (product_id, quantity) VALUES ($1, 0)",
        [result.rows[0].id_product],
      );
      await client.query("COMMIT");
      transactionStarted = false;

      return res.status(201).json({
        success: true,
        message: "Produk berhasil ditambahkan",
        data: result.rows[0],
      });
    } catch (error) {
      if (transactionStarted) {
        try {
          await client.query("ROLLBACK");
        } catch (rollbackError) {
          console.error(rollbackError.message);
        }
      }

      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "SKU sudah digunakan",
      });
    }

    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan produk",
    });
  }
};

// Mengubah produk
const updateProduct = async (req, res) => {
  const id = isPositiveId(req.params.id);
  const { sku, name, is_active } = req.body ?? {};

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "ID produk tidak valid",
    });
  }

  if (
    typeof sku !== "string" ||
    !sku.trim() ||
    sku.trim().length > 100 ||
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 255 ||
    (is_active !== undefined && typeof is_active !== "boolean")
  ) {
    return res.status(422).json({
      success: false,
      message: "SKU, nama produk, dan status aktif harus valid",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE products
       SET sku = $1,
           name = $2,
           is_active = COALESCE($3, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id_product = $4
       RETURNING *`,
      [sku.trim(), name.trim(), is_active ?? null, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Produk berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "SKU sudah digunakan produk lain",
      });
    }

    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui produk",
    });
  }
};

// Menonaktifkan produk
const deleteProduct = async (req, res) => {
  const id = isPositiveId(req.params.id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "ID produk tidak valid",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE products
       SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
       WHERE id_product = $1 AND is_active = TRUE
       RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Produk aktif tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Produk berhasil dinonaktifkan",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Gagal menonaktifkan produk",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
