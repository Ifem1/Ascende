# Testing and CI

The checked-in workflow is the release gate: [GitHub Actions](https://github.com/Ifem1/Ascende/actions/workflows/ci.yml). It runs the pinned GenVM contract checks on Windows, then frontend checks and Playwright on Ubuntu. A green run must exist for the final pushed commit before calling that source verified.

## Local release checks

- Contract Direct Mode after the multi-authority policy change: **59 passed** with Python 3.12.10, `genlayer-test 0.29.2`, `genlayer-py 0.16.3`, and GenVM linter `0.11.0` pinned to stable runtime `v0.2.16`.
- GenVM lint: **3 checks passed**. Semantic validation: **29 methods** (13 view, 16 write). Generated schema matches `contracts/ascende.schema.json`.
- Frontend: TypeScript, ESLint, Vitest (**13 tests**), Next.js production build and Playwright were rerun after adding the multi-authority form and settlement operation list. Local Playwright executed all seven cases successfully; the Windows runner took additional time to exit after tests.
- Contract regressions cover one-host policy rejection, exact evidence manifests across required authorities, source-level contradictions becoming INCONCLUSIVE, exact leader/validator provenance agreement, and challenge outcomes that change after reevaluation. Playwright creation checks require two distinct hostnames per milestone. These E2E cases simulate EIP-1193 behavior; the genuine Rabby transaction and contract readback are separately recorded in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md).

The checked-in source has changed since the live deployment. The existing deployment and its receipts do not prove the new multi-authority contract. A fresh stable Studionet deployment and source-matched live scenarios are still required; do not claim release verification until that is complete.

## Latest release verification — 2026-10-15

- Commit: [`bf0da8059dfc8ca98ebc5e985626880843f28771`](https://github.com/Ifem1/Ascende/commit/bf0da8059dfc8ca98ebc5e985626880843f28771).
- [GitHub Actions run 38735284900](https://github.com/Ifem1/Ascende/actions/runs/38735284900): contract and frontend jobs passed. The contract job ran GenVM lint, semantic validation, schema generation and Direct Mode tests; the frontend job ran typecheck, ESLint, 12 Vitest tests, Next.js build and Playwright.
- Vercel Production deployment `7092608908` completed successfully: [production deployment](https://ascende-d9qhdjbnh-ifem1s-projects.vercel.app).
- The production wallet transaction and Program 1 contract readback are documented in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). The user switched Rabby to the supplied account and Studionet 61999; the successful transaction confirms the actual sender and chain.
- Windows CI sets `PYTHONUTF8=1` and `PYTHONIOENCODING=utf-8` and pins `GENVM_VERSION=v0.2.16` to avoid console encoding errors and runtime drift.

Reproduce from the repository root in PowerShell:

```powershell
$env:GENVM_VERSION='v0.2.16'
$env:PYTHONUTF8='1'
$env:PYTHONIOENCODING='utf-8'
genvm-lint lint contracts/ascende.py
genvm-lint validate contracts/ascende.py
genvm-lint schema --json -o contracts/ascende.schema.json contracts/ascende.py
pytest -p no:cacheprovider --tb=short -q tests/test_contract.py
Push-Location frontend
npm run typecheck
npm run lint
npm test
npm run build
npm run e2e
Pop-Location
```

A finalized parent transfer, a finalized child receipt, and contract-accounting reconciliation are different facts. The current contract intentionally retains transfer obligations as pending because it cannot authenticate a child result. See [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md) and [SECURITY.md](SECURITY.md).
