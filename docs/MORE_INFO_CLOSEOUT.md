# More Info implementation closeout

## Implemented on this branch

- Replaced single-source-style criterion decisions with source-level findings across frozen authorities. Each source finding carries a bounded quote and UTF-8 byte offsets validated against independently fetched, hash-checked response bytes. The validator agreement compares the exact normalized packet and evidence root.
- Preserved challenge evidence and prior decision lineage; a challenge is reevaluated against its own immutable manifest and can change the provisional result without mutating prior evidence.
- Added a frozen acceptance window and a three-party-safe lifecycle: zero-value draft, named-recipient acceptance, then exact-budget funding by the original funder. Permissionless expiry closes unaccepted and unfunded drafts without holding principal.
- Extended frontend creation and milestone evidence forms for multiple required and optional authorities, additional criteria, and accept/fund/expiry actions.
- Pinned the CLI in the root lockfile and made Windows CI verify CLI version and stable Studionet selection. Generated ABI schema is checked for drift.

## Verification state

The pinned release verification recorded 62 passing Direct Mode tests, 15 Vitest tests, and 7 Playwright tests; GitHub Actions run [39036494073](https://github.com/Ifem1/Ascende/actions/runs/39036494073) passed for commit [`e84858e4df4bd2da16ff2dd87776af82df903b32`](https://github.com/Ifem1/Ascende/commit/e84858e4df4bd2da16ff2dd87776af82df903b32). The branch is deployed at `0x5715eACA23d495b71E800Dd9eD6e13875855bd9c`; normalized source readback details and deployment transaction are recorded in [DEPLOYMENT.md](DEPLOYMENT.md). One fresh create attempt finalized without creating a program, so there is still no successful live program or lifecycle evidence for this deployment. Existing successful lifecycle receipts belong to earlier contract sources. The production Vercel alias has not been modified.

## Unresolved capabilities

- EVM vault feasibility is not demonstrated end-to-end on stable Studionet. Official documentation describes underlying mechanisms, but there is no vault transaction proof for deposit, authenticated GenVM settlement, idempotency, and final result handling. No EVM vault was introduced.
- EOA child-transfer outcome remains unauthenticated in contract state; no automatic retry or delivery reconciliation is claimed.
- Unexpected failed payable calls may strand attached GEN without matching state.
- The available Web Access interface does not enforce final redirect-origin policy.

**Verdict: implementation hardening is pushed, exact-commit CI is green, and a fresh stable deployment is source-matched with a documented terminal-newline normalization. Reviewer demonstration evidence is incomplete because no current-deployment program lifecycle succeeded and production Vercel still points to its prior release. This is not production-safe escrow.**
