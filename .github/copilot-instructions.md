# Repository Instructions

- Inspect the relevant routes, controllers, database migration, and API documentation before changing behavior.
- Preserve the Express response envelope (`success`, `message`, and/or `data`) and validate user-controlled input.
- Keep inventory changes, receipt records, transaction history, and idempotency records in the same database transaction.
- Require authentication and the existing `admin`/`staff` role model for protected operations. Public registration creates `staff`; never allow the public request to select a privileged role.
- Use parameterized SQL and environment variables for credentials. Never print, commit, or copy `.env` contents.
- Add or update focused automated tests for business behavior and failure paths.
- Run `npm test` in `backend`; for frontend changes run `npm run lint` and `npm run build` in `frontend`.
- Update the OpenAPI contract and user/developer documentation when API behavior changes.
