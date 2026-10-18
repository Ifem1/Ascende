# Testing and CI

The checked-in workflow is the release gate: [GitHub Actions](https://github.com/Ifem1/Ascende/actions/workflows/ci.yml). It runs pinned GenVM contract checks on Windows and frontend checks and Playwright on Ubuntu. A green result must exist for the exact final commit.

## Current branch coverage

The Direct Mode suite covers acceptance and funding separation, permissionless expiry of unaccepted/unfunded drafts, sequential milestone progression and late activation, evidence deadline boundaries, unresolved review and challenge grace, retry exhaustion, bond ownership, immutable payment reservation, rejected payable credits, authority and URL policy, byte-level source citations, validator agreement, malformed/malicious packets, and conservation of principal and bonds. Current local run: **63 passed**.

Frontend tests cover creation preflight for required/optional authorities, manifest validation, draft readback, wallet preparation, extended finality polling and pending-status behavior. Current local runs: TypeScript, ESLint, production build passed; Vitest **16 passed**; all **7 Playwright cases passed** against a fresh local server. Separately, genuine Rabby creation of program 2 via the production frontend is documented in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). Exact-commit GitHub Actions remains the release gate.

The current contract source SHA-256 `8345bbdd755fe5e35eb02ae02ab0ddeb00deb7af51f0581bff552cf68d060217` is deployed at `0x1544852461c4F61F266F5c2930c315C85069f1a6`. The deployment receipt and schema were verified; fresh live qualification, challenge-flip, conflict/recovery, and wallet-UI outcomes are not yet established. Earlier live transactions belong to a different source and remain historical. See [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md).

## Reproduce locally (PowerShell)

```powershell
npm ci
$env:GENVM_VERSION='v0.2.16'
$env:PYTHONUTF8='1'
$env:PYTHONIOENCODING='utf-8'
python -m pip install -r requirements.txt
./scripts/install-genvm-runner.ps1
genvm-lint check contracts/ascende.py
genvm-lint typecheck contracts/ascende.py
genvm-lint lint contracts/ascende.py
genvm-lint validate contracts/ascende.py
genvm-lint schema --json -o contracts/ascende.schema.json contracts/ascende.py
git diff --exit-code -- contracts/ascende.schema.json
python -m pytest -p no:cacheprovider --tb=short -q tests/test_contract.py
Push-Location frontend
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
npx playwright install chromium
npm run e2e
Pop-Location
```

The root lockfile pins GenLayer CLI `0.39.1`; CI verifies that version and stable Studionet chain `61999`. No test switches to Studio-dev or a release candidate. Parent transaction finality, child execution, recipient credit, and contract-ledger reconciliation are separate facts; see [SECURITY.md](SECURITY.md).
