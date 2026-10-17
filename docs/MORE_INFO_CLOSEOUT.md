# More Info implementation closeout

## Implemented on this branch

- Replaced single-source-style criterion decisions with source-level findings across frozen authorities. Each source finding carries a bounded quote and UTF-8 byte offsets validated against independently fetched, hash-checked response bytes. The validator agreement compares the exact normalized packet and evidence root.
- Preserved challenge evidence and prior decision lineage; a challenge is reevaluated against its own immutable manifest and can change the provisional result without mutating prior evidence.
- Added a frozen acceptance window and a three-party-safe lifecycle: zero-value draft, named-recipient acceptance, then exact-budget funding by the original funder. Permissionless expiry closes unaccepted and unfunded drafts without holding principal.
- Extended frontend creation and milestone evidence forms for multiple required and optional authorities, additional criteria, and accept/fund/expiry actions.
- Pinned the CLI in the root lockfile and made Windows CI verify CLI version and stable Studionet selection. Generated ABI schema is checked for drift.

## Verification state

The pinned release verification recorded 62 passing Direct Mode tests, 15 Vitest tests, and 7 Playwright tests. GitHub Actions runs on each pushed commit; see the [CI workflow](https://github.com/Ifem1/Ascende/actions/workflows/ci.yml) for the exact final-HEAD result. The branch is deployed at `0x5715eACA23d495b71E800Dd9eD6e13875855bd9c`. Fresh program creation, recipient acceptance, exact 2-wei funding, permissionless missing-evidence expiry, stopped closure, refund reservation, once-only child submission, and duplicate replay check are documented in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). The child receipt reports `value_credited=true` with `result_name=NO_MAJORITY`; contract pending remains 2 wei, so delivery is not treated as reconciled. Positive qualification and challenge-flip live evidence and a current-branch browser-wallet transaction remain outstanding. The production Vercel alias has not been modified.

## Unresolved capabilities

- EVM vault feasibility is not demonstrated end-to-end on stable Studionet. Official documentation describes underlying mechanisms, but there is no vault transaction proof for deposit, authenticated GenVM settlement, idempotency, and final result handling. No EVM vault was introduced.
- EOA child-transfer outcome remains unauthenticated in contract state; no automatic retry or delivery reconciliation is claimed.
- Unexpected failed payable calls may strand attached GEN without matching state.
- The available Web Access interface does not enforce final redirect-origin policy.

**Verdict: implementation hardening is pushed, exact-commit CI is green, the source-matched Studionet deployment is documented, and a missing-evidence recovery/refund lifecycle is verified. Reviewer demonstration evidence remains incomplete because no positive qualification, challenge-flip, or current-branch browser-wallet transaction has been demonstrated; production Vercel still points to its prior release. This is not production-safe escrow.**
