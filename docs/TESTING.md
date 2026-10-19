# Testing and CI

The checked-in workflow is the release gate: [GitHub Actions](https://github.com/Ifem1/Ascende/actions/workflows/ci.yml). It runs pinned GenVM contract checks on Windows and frontend checks and Playwright on Ubuntu. A green result must exist for the exact final commit.

## Current branch coverage

The Direct Mode suite covers acceptance and funding separation, permissionless expiry of unaccepted/unfunded drafts, sequential milestone progression and late activation, evidence deadline boundaries, unresolved review and challenge grace, retry exhaustion, bond ownership, immutable payment reservation, rejected payable credits, authority and URL policy, byte-level source citations, validator agreement, malformed/malicious packets, and conservation of principal and bonds. Current local run: **68 passed**.

Frontend tests cover creation preflight for required/optional authorities, manifest validation, draft readback, wallet preparation, extended finality polling and pending-status behavior. Local verification: TypeScript and ESLint passed; Vitest **16 passed**; production build passed; all **7 Playwright cases passed** against a fresh local server. Fresh current-contract lifecycle transactions used the repository GenLayerJS client and test wallets; the genuine Rabby transaction in `LIVE_VERIFICATION.md` is explicitly historical and belongs to an older address. Exact-commit CI is the release gate; check the latest [GitHub Actions run](https://github.com/Ifem1/Ascende/actions/workflows/ci.yml) before release.

The corrective source SHA-256 `98bc175a714326dd926a92ffff709f2cfd42fc4709e04c1a940d9c5e94017a04` is deployed at `0x5bF12b1033A5827edBB27cdc92C7FAb0C4d1304F`. Live qualification/challenge reversal, negative decision/refund, conflict/`INCONCLUSIVE` and timeout/refund scenarios are recorded in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). These synthetic fixtures do not establish independent source organizations or real-world truth. Child credits remain unreconciled by contract state. Vercel deployment `dpl_3XsnaYsx1RCpdzu6SGpJgvxicZyq` is `READY`; checked production routes return HTTP 200 and the Docs page shows the current address and source hash.

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
