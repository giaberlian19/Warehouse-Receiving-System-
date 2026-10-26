# AI-Assisted Development Workflow

## Repository instructions

The repository-specific coding instructions are in [`.github/copilot-instructions.md`](../.github/copilot-instructions.md). They ask the coding agent to inspect the existing API and schema, make focused changes, preserve security boundaries, and run relevant tests.

## Workflow

1. State the desired behavior, affected role, and acceptance criteria in the prompt.
2. Ask the agent to inspect the current implementation and relevant documentation before editing.
3. Keep secrets out of prompts and source control; use environment variable names and redacted examples.
4. Request a small implementation aligned with existing API responses and database transactions.
5. Review the diff, run backend tests and frontend checks, and manually verify affected workflows.
6. Record unresolved gaps honestly; an agent response or successful build alone is not proof of feature correctness.

## Example prompts

These are reusable example prompts for the assessment workflow, not transcripts or claims of exact prompts previously executed.

### Prompt 1 — Diagnose and repair API startup

> Inspect the Express startup, routes, controllers, and database configuration. Reproduce the startup/API error without printing environment secrets. Fix the root cause with the smallest compatible change, then run the backend test suite and check the health endpoint. Report files changed and any checks that could not be run.

### Prompt 2 — Implement a safe receiving workflow

> Review the receiving API, schema, and OpenAPI contract. Ensure document creation is atomic and receipt processing cannot exceed expected quantities or update stock partially. Add idempotent retry handling for receipt requests, validate role access, and add automated tests for success, over-receipt rollback, replay, and key reuse with a different payload. Do not expose or log credentials.

### Prompt 3 — Complete and verify the receiving UI

> Extend the existing Next.js UI to support creating a receiving document with multiple products, viewing document details, recording partial/full receipts, and viewing inventory and transaction history. Use the existing API contract and surface API errors. Run lint and production build, and list any manual/browser checks still needed.
