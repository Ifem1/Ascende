# Testing and CI

The checked-in workflow is the release gate: [GitHub Actions](https://github.com/Ifem1/Ascende/actions/workflows/ci.yml). It runs the pinned GenVM contract checks on Windows, then frontend checks and Playwright on Ubuntu. A green run must exist for the final pushed commit before calling that source verified.

## Local release checks

- Contract Direct Mode: **57 passed** with Python 3.12.10, `genlayer-test 0.29.2`, `genlayer-py 0.16.3`, and checksum-verified GenVM `v0.2.16`.
- GenVM lint: **3 checks passed**. Semantic validation: **29 methods** (13 view, 16 write). Generated schema matches `contracts/ascende.schema.json`.
- Frontend: TypeScript, ESLint, Vitest (**10 tests**), and Next.js production build passed.
- Playwright covers wallet connection, wrong-network switching, copy/disconnect, on-chain data or explicit unavailable states, creation wizard review, rejected-payment credit panel availability, treasury pending-delivery wording, current deployment evidence copy, and mobile overflow. All seven local Edge scenarios reported `ok`, but the Windows runner did not exit after the final test during teardown; the final GitHub Actions run must provide the clean process-exit result. Wallet-provider behavior is simulated in these E2E cases. The new deployment has a live rejected-payable/refund lifecycle; the broader positive, negative, expiry, challenge and abandoned-review receipts in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md) apply to the older deployment.
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
