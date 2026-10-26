# Testing and Verification

## Automated backend tests

Backend tests use Node.js built-in test runner and do not require a running database:

```powershell
cd backend
npm test
```

Coverage currently exercises receipt request validation, successful atomic receipt updates, over-receipt rollback, and idempotent replay/conflict behavior using a mocked PostgreSQL client. These tests do not replace end-to-end testing against PostgreSQL.

## Frontend checks

```powershell
cd frontend
npm run lint
npm run build
```

## Database and API smoke checks

With the local PostgreSQL instance and backend environment configured:

```powershell
cd backend
npm run migrate
npm run dev
```

Then verify `GET http://localhost:3000/api/health` and `GET http://localhost:3000/api/health/db`. Authenticated workflow checks should cover registration/login, document creation, partial receipt, full receipt, stock changes, and transaction history.

Receipt requests require a unique `Idempotency-Key` header. Retrying the same successful request with the same key and payload must return the original response without applying inventory changes again. Reusing that key with a different user, item, document, or quantity must return a conflict. The key record is persisted transactionally; do not remove it while a client can still retry a receipt.

## Docker verification

From the repository root, configure `.env` using `.env.example`, then run:

```powershell
docker compose config
docker compose up --build
```

Verify the API health endpoint and frontend at `http://localhost:3001`. Shut down with `docker compose down`; use `docker compose down -v` only when intentionally deleting the local database volume.

## Known limits

- Backend tests use a mocked database client, not a live PostgreSQL instance.
- No browser-driven end-to-end test suite is currently configured.
- Do not report manual smoke checks as automated test coverage.
