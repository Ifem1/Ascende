# Testing and CI

## Checks for the release candidate

- Contract Direct Mode: **55 passed** (`pytest -q -p no:cacheprovider tests/test_contract.py`), including idempotent close after success, source digest and authority validation, validator agreement, challenge evidence/decision lineage, failed and unresolved evidence, economic entitlements, and adversarial deadline boundaries. Runtime pins: Python 3.12.10, `genlayer-test 0.29.2`, `genlayer-py 0.16.3`, GenVM `v0.2.16` (checksum verified by `scripts/install-genvm-runner.ps1`).
- Contract static checks: `genvm-lint lint contracts/ascende.py` passed (3 checks); `genvm-lint validate contracts/ascende.py` passed for Ascende (25 methods); schema generation passed and is checked in as `contracts/ascende.schema.json`.
- Frontend: TypeScript, ESLint, Vitest (5 tests), Next.js production build, and **5 Playwright tests** passed. Browser checks cover wallet connect, wrong-network switching, address copy, disconnect, data/unavailable states, create wizard review, treasury delivery wording, and mobile overflow. The local Edge run used one worker against the built app at a local URL and exited cleanly. GitHub Actions used Chromium on the earlier source commit. Wallet actions use a simulated EIP-1193 provider in E2E; live contract writes were sent through GenLayerJS using the authorized test wallets.
- Windows console encoding: CI sets `PYTHONUTF8=1` and `PYTHONIOENCODING=utf-8`; GenVM runtime is explicitly pinned to `v0.2.16`.

## GitHub Actions

Historical baseline commit: [`edfe1da1634abeb92ec091e562838b64093df3a9`](https://github.com/Ifem1/Ascende/commit/edfe1da1634abeb92ec091e562838b64093df3a9). Its GitHub Actions run [38467395487](https://github.com/Ifem1/Ascende/actions/runs/38467395487) passed, but does not validate this release candidate. The current source has passed the local checks above; the final pushed commit still requires its own green Actions run. The workflow completed Windows lint, semantic validation, schema extraction, and Direct Mode, then Ubuntu typecheck, lint, Vitest, production build, Chromium install, and Playwright. This run validates the contract source; every pushed release commit must also have a successful Actions run before submission.

Live lifecycle checks are recorded separately in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). They must use only the deployed source/address named there. A parent transfer receipt, a child receipt, and a recipient balance delta are distinct pieces of evidence; a child receipt does not reconcile the contract's on-chain pending balance.
