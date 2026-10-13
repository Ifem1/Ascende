# Testing and CI

## Local checks for the release candidate

- Contract Direct Mode: **34 passed** (`pytest -q -p no:cacheprovider tests/test_contract.py`), including source digest and authority validation, validator agreement, challenge evidence/decision lineage, failed and unresolved evidence, economic entitlements, and adversarial deadline boundaries. Runtime pins: Python 3.12.10, `genlayer-test 0.29.2`, `genlayer-py 0.16.3`, GenVM `v0.2.16` (checksum verified by `scripts/install-genvm-runner.ps1`).
- Contract static checks: `genvm-lint lint contracts/ascende.py` passed (3 checks); `genvm-lint validate contracts/ascende.py` passed for Ascende (24 methods); schema generation passed and is checked in as `contracts/ascende.schema.json`.
- Frontend: TypeScript, ESLint, Vitest (4 tests), Next.js production build, and **5 Playwright tests** passed. Browser checks cover wallet connect, wrong-network switching, address copy, disconnect, data/unavailable states, create wizard review, treasury delivery wording, and mobile overflow. Playwright ran in Microsoft Edge against a separately started production server so the process exited cleanly.
- Windows console encoding: CI sets `PYTHONUTF8=1` and `PYTHONIOENCODING=utf-8`; GenVM runtime is explicitly pinned to `v0.2.16`.

## GitHub Actions

Canonical release commit: `PENDING_COMMIT`. CI run: `PENDING_CI_URL` (status: pending). The workflow runs Windows lint, semantic validation, schema extraction, and Direct Mode, then Ubuntu typecheck, lint, Vitest, production build, Chromium install, and Playwright. Replace the pending fields after the pushed commit's complete workflow finishes; local checks do not substitute for remote CI.

Live lifecycle checks are recorded separately in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). They must use only the deployed source/address named there. A parent transfer receipt, a child receipt, and a recipient balance delta are distinct pieces of evidence; a child receipt does not reconcile the contract's on-chain pending balance.
