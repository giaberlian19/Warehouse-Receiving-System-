const assert = require("node:assert/strict");
const test = require("node:test");
const pool = require("../src/config/database");
const { receiveDocumentItem } = require("../src/controllers/receivingDocumentController");

class Response {
  statusCode = 200;
  body;

  status(code) {
    this.statusCode = code;
    return this;
  }

  json(body) {
    this.body = body;
    return this;
  }
}

const makeRequest = (overrides = {}) => ({
  params: { id: "7", itemId: "11" },
  body: { quantity: 3 },
  headers: {},
  user: { id_user: 5 },
  get(name) {
    return this.headers[name.toLowerCase()];
  },
  ...overrides,
});

const setClient = (query) => {
  const calls = [];
  pool.connect = async () => ({
    async query(sql, params) {
      calls.push({ sql, params });
      return query(sql, params, calls);
    },
    release() {},
  });
  return calls;
};

test("receipt requires an idempotency key before opening a transaction", async () => {
  const originalConnect = pool.connect;
  pool.connect = async () => {
    throw new Error("database should not be reached");
  };

  try {
    const response = new Response();
    await receiveDocumentItem(makeRequest(), response);
    assert.equal(response.statusCode, 400);
    assert.match(response.body.message, /Idempotency-Key/);
  } finally {
    pool.connect = originalConnect;
  }
});

test("receipt atomically updates received quantity, inventory, history, and replay response", async () => {
  const originalConnect = pool.connect;
  const calls = setClient((sql) => {
    if (sql.includes("INSERT INTO receipt_idempotency_keys")) {
      return { rowCount: 1, rows: [{ idempotency_key: "request-1" }] };
    }
    if (sql.includes("SELECT") && sql.includes("FOR UPDATE OF rd, rdi")) {
      return {
        rowCount: 1,
        rows: [
          {
            document_number: "RCV-007",
            status: "pending",
            id_document_receiving: 11,
            product_id: 4,
            expected_quantity: 10,
            received_quantity: 2,
          },
        ],
      };
    }
    if (sql.includes("INSERT INTO inventories")) {
      return { rowCount: 1, rows: [{ quantity: 8 }] };
    }
    if (sql.includes("UPDATE receiving_documents")) {
      return { rowCount: 1, rows: [{ status: "partial" }] };
    }
    return { rowCount: 1, rows: [] };
  });

  try {
    const response = new Response();
    await receiveDocumentItem(
      makeRequest({ headers: { "idempotency-key": "request-1" } }),
      response,
    );

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.item.received_quantity, 5);
    assert.equal(response.body.data.item.remaining_quantity, 5);
    assert.equal(response.body.data.inventory.quantity, 8);
    assert.equal(
      calls.filter(({ sql }) => sql.includes("INSERT INTO inventory_transactions"))
        .length,
      1,
    );
    assert.ok(
      calls.some(({ sql }) => sql.includes("SET response_status = 200")),
      "the replay response is stored before commit",
    );
    assert.ok(calls.some(({ sql }) => sql === "COMMIT"));
  } finally {
    pool.connect = originalConnect;
  }
});

test("over-receipt rolls back without changing inventory or transaction history", async () => {
  const originalConnect = pool.connect;
  const calls = setClient((sql) => {
    if (sql.includes("INSERT INTO receipt_idempotency_keys")) {
      return { rowCount: 1, rows: [{ idempotency_key: "request-2" }] };
    }
    if (sql.includes("SELECT") && sql.includes("FOR UPDATE OF rd, rdi")) {
      return {
        rowCount: 1,
        rows: [
          {
            document_number: "RCV-007",
            status: "partial",
            id_document_receiving: 11,
            product_id: 4,
            expected_quantity: 4,
            received_quantity: 3,
          },
        ],
      };
    }
    return { rowCount: 1, rows: [] };
  });

  try {
    const response = new Response();
    await receiveDocumentItem(
      makeRequest({ headers: { "idempotency-key": "request-2" } }),
      response,
    );

    assert.equal(response.statusCode, 422);
    assert.ok(calls.some(({ sql }) => sql === "ROLLBACK"));
    assert.equal(
      calls.some(({ sql }) => sql.includes("INSERT INTO inventories")),
      false,
    );
    assert.equal(
      calls.some(({ sql }) => sql.includes("INSERT INTO inventory_transactions")),
      false,
    );
  } finally {
    pool.connect = originalConnect;
  }
});

test("a successful retry replays its response without recording inventory twice", async () => {
  const originalConnect = pool.connect;
  const originalBody = {
    success: true,
    message: "Penerimaan barang berhasil dicatat",
    data: { inventory: { product_id: 4, quantity: 8 } },
  };
  const calls = setClient((sql) => {
    if (sql.includes("INSERT INTO receipt_idempotency_keys")) {
      return { rowCount: 0, rows: [] };
    }
    if (sql.includes("SELECT user_id, document_id, item_id, quantity")) {
      return {
        rowCount: 1,
        rows: [
          {
            user_id: "5",
            document_id: "7",
            item_id: "11",
            quantity: 3,
            response_status: 200,
            response_body: originalBody,
          },
        ],
      };
    }
    return { rowCount: 1, rows: [] };
  });

  try {
    const response = new Response();
    await receiveDocumentItem(
      makeRequest({ headers: { "idempotency-key": "request-1" } }),
      response,
    );

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, originalBody);
    assert.equal(
      calls.some(({ sql }) => sql.includes("INSERT INTO inventories")),
      false,
    );
    assert.ok(calls.some(({ sql }) => sql === "COMMIT"));
  } finally {
    pool.connect = originalConnect;
  }
});

test("reusing a receipt key with a different quantity returns a conflict", async () => {
  const originalConnect = pool.connect;
  const calls = setClient((sql) => {
    if (sql.includes("INSERT INTO receipt_idempotency_keys")) {
      return { rowCount: 0, rows: [] };
    }
    if (sql.includes("SELECT user_id, document_id, item_id, quantity")) {
      return {
        rowCount: 1,
        rows: [
          {
            user_id: "5",
            document_id: "7",
            item_id: "11",
            quantity: 2,
            response_status: 200,
            response_body: { success: true },
          },
        ],
      };
    }
    return { rowCount: 1, rows: [] };
  });

  try {
    const response = new Response();
    await receiveDocumentItem(
      makeRequest({ headers: { "idempotency-key": "request-1" } }),
      response,
    );

    assert.equal(response.statusCode, 409);
    assert.equal(
      calls.some(({ sql }) => sql.includes("FOR UPDATE OF rd, rdi")),
      false,
    );
    assert.ok(calls.some(({ sql }) => sql === "ROLLBACK"));
  } finally {
    pool.connect = originalConnect;
  }
});
