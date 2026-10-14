# Testing and CI

The checked-in workflow is the release gate: [GitHub Actions](https://github.com/Ifem1/Ascende/actions/workflows/ci.yml). It runs the pinned GenVM contract checks on Windows, then frontend checks and Playwright on Ubuntu. A green run must exist for the final pushed commit before calling that source verified.

## Local release checks

- Contract Direct Mode: **55 passed** with Python 3.12.10, `genlayer-test 0.29.2`, `genlayer-py 0.16.3`, and checksum-verified GenVM `v0.2.16`.
- GenVM lint: **3 checks passed**. Semantic validation: **25 methods** (11 view, 14 write). Generated schema matches `contracts/ascende.schema.json`.
- Frontend: TypeScript, ESLint, Vitest (**5 tests**), and Next.js production build passed.
- Playwright covers wallet connection, wrong-network switching, copy/disconnect, on-chain data or explicit unavailable states, creation wizard review, treasury pending-delivery wording, and mobile overflow. The local Edge run completed all five scenarios; wallet-provider behavior is simulated in these E2E cases. Live transactions were separately signed through GenLayerJS using the authorized test wallets and are listed in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md).
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
