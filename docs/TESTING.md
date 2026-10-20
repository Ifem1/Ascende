# Testing and CI

The checked-in workflow is the release gate: [GitHub Actions](https://github.com/Ifem1/Ascende/actions/workflows/ci.yml). It runs pinned GenVM contract checks on Windows and frontend checks and Playwright on Ubuntu. A green result must exist for the exact final commit.

## Current branch coverage

The Direct Mode suite covers acceptance and funding separation, permissionless expiry of unaccepted/unfunded drafts, sequential milestone progression and late activation, evidence deadline boundaries, unresolved review and challenge grace, retry exhaustion, bond ownership, immutable payment reservation, rejected payable credits, authority and URL policy, byte-level source citations, validator agreement, malformed/malicious packets, and conservation of principal and bonds. Current local run: **68 passed**.

Frontend tests cover creation preflight for required/optional authorities, manifest validation, draft readback, wallet preparation, extended finality polling and pending-status behavior. Local verification: TypeScript and ESLint passed; Vitest **16 passed**; production build passed; all **7 Playwright cases passed** against a fresh local server. Fresh current-contract lifecycle transactions used the repository GenLayerJS client and test wallets; the genuine Rabby transaction in `LIVE_VERIFICATION.md` is explicitly historical and belongs to an older address. Exact-commit CI is the release gate; check the latest [GitHub Actions run](https://github.com/Ifem1/Ascende/actions/workflows/ci.yml) before release.

The canonical source hash in Git is `bfb369ad103b9e98dfecd92ecc9d9800187b6e7661bfdb68b9d5387a9b44714e` (72,445 LF bytes, 1,549 newlines). Stable Studionet `gen_getContractCode` readback at `0x5bF12b1033A5827edBB27cdc92C7FAb0C4d1304F` is 73,994 CRLF bytes with hash `98bc175a714326dd926a92ffff709f2cfd42fc4709e04c1a940d9c5e94017a04`; byte comparison after converting Git LF to CRLF passes. A CI release-consistency check enforces these values and verifies every manifest item hash, so an obsolete source hash or pending-evidence status fails the release gate. The existing exact-main run [39273157272](https://github.com/Ifem1/Ascende/actions/runs/39273157272) succeeded on audited commit `8fd697b07485f46011cac331ec05a9aa958c0007`. Live qualification/challenge reversal, negative decision/refund, conflict/`INCONCLUSIVE` and timeout/refund scenarios are recorded in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). These synthetic fixtures do not establish independent source organizations or real-world truth. Child credits remain unreconciled by contract state. Vercel deployment `dpl_HEUi47BAn1GdnSiknNW83GhrPM84` is `READY`; checked production routes return HTTP 200 and the Docs page shows the current address and deployed-byte hash.

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
