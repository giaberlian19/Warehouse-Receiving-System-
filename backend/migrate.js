require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pool = require("./src/config/database");

async function migrate() {
  let client;
  let transactionStarted = false;
  const migrationName = "001_create_tables.sql";

  try {
    client = await pool.connect();
    const filePath = path.join(
      __dirname,
      "src",
      "migrations",
      "001_create_tables.sql",
    );

    const sql = fs.readFileSync(filePath, "utf8");
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const applied = await client.query(
      "SELECT name FROM schema_migrations WHERE name = $1",
      [migrationName],
    );

    if (applied.rowCount > 0) {
      console.log(`Migration ${migrationName} sudah diterapkan.`);
      return;
    }

    await client.query("BEGIN");
    transactionStarted = true;
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
      migrationName,
    ]);
    await client.query("COMMIT");
    transactionStarted = false;

    console.log(`Migration ${migrationName} berhasil dijalankan.`);
  } catch (error) {
    if (client && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback migration gagal:", rollbackError.message);
      }
    }
    console.error("Migration gagal:", error.message);
    process.exitCode = 1;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

migrate();
