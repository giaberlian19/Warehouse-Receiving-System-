require("dotenv").config();

const pool = require("../src/config/database");

async function promoteAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    throw new Error("Set ADMIN_EMAIL to the existing account email");
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET role = 'admin', updated_at = CURRENT_TIMESTAMP
       WHERE email = $1
       RETURNING id_user`,
      [email],
    );

    if (result.rowCount === 0) {
      throw new Error("No account found for ADMIN_EMAIL; register that account first");
    }

    console.log("Admin role assigned.");
  } finally {
    await pool.end();
  }
}

promoteAdmin().catch((error) => {
  console.error("Admin promotion failed:", error.message);
  process.exitCode = 1;
});
