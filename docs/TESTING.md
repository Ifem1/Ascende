# Testing and CI

## Latest local verification

- Contract: **28 passed** with `pytest -q -p no:cacheprovider`; all 28 are marked Direct Mode and deploy/call the contract in the GenVM harness. Runtime pins: Python 3.12.10, `genlayer-test 0.29.2`, `genlayer-py 0.16.3`, GenVM `v0.2.16` (verified release artifact checksum in `scripts/install-genvm-runner.ps1`).
- Contract lint: `genvm-lint check contracts/ascende.py` reports **Lint passed (3 checks)**.
- Contract semantic validation and schema generation: **blocked locally**. `genvm-lint` cannot read its SDK artifact cache at `%USERPROFILE%\.cache\genvm-linter\extracted\...\py-genlayer\1jb45...` (`WinError 5: Access is denied`). This is not reported as a pass. See `docs/CONTRACT_API.md` for the concrete API derived from source and tests; run schema extraction in a compatible environment before deployment.
- Frontend: TypeScript, ESLint, Vitest (4 tests), production build and all **3 Playwright browser tests** passed locally. Playwright ran in installed Microsoft Edge against an isolated production server at port 3101; the initial attempt reused a stale server on port 3000 and was discarded. CI remains configured to use Chromium after its browser install step.
- CI: `.github/workflows/ci.yml` defines Windows contract and Ubuntu frontend jobs including Playwright Chromium. No authorized remote is configured, so GitHub Actions was not run and there is no CI URL/status to report.

The Direct Mode suite covers exact/invalid funding, role checks, authority and byte integrity, frozen rules, leader/validator disagreement, hostile URL-prefix cases, model/source failures, qualified and failed outcomes, sequential stage gating, challenge bond/window/replay, retries and unresolved closure, principal/bond entitlements, zero/excess withdrawal, refund gating, one-shot transfer submission, unresolved delivery isolation and principal conservation.

The suite does **not** test a live Studionet EOA send, child failure/recovery, recipient balance credit or multi-validator Studionet consensus. Those need an approved live transaction and the external payment behavior remains unproven. See `docs/LIVE_VERIFICATION.md`.
