# More Info implementation closeout

## Implemented on this branch

- Replaced single-source-style criterion decisions with source-level findings across frozen authorities. Each source finding carries a bounded quote and UTF-8 byte offsets validated against independently fetched, hash-checked response bytes. The validator agreement compares the exact normalized packet and evidence root.
- Preserved challenge evidence and prior decision lineage; a challenge is reevaluated against its own immutable manifest and can change the provisional result without mutating prior evidence.
- Added a frozen acceptance window and a three-party-safe lifecycle: zero-value draft, named-recipient acceptance, then exact-budget funding by the original funder. Permissionless expiry closes unaccepted and unfunded drafts without holding principal.
- Extended frontend creation and milestone evidence forms for multiple required and optional authorities, additional criteria, and accept/fund/expiry actions.
- Pinned the CLI in the root lockfile and made Windows CI verify CLI version and stable Studionet selection. Generated ABI schema is checked for drift.

## Verification state

The release verification recorded 63 passing Direct Mode tests, 16 Vitest tests, and 7 Playwright tests. The exact final-HEAD GitHub Actions result is linked from the repository's [CI workflow](https://github.com/Ifem1/Ascende/actions/workflows/ci.yml). The branch is deployed at `0x5715eACA23d495b71E800Dd9eD6e13875855bd9c`. Fresh SDK recovery/refund evidence and a genuine injected-Rabby production frontend creation of unfunded draft program 2 are documented in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). Program 1's child receipt reports `value_credited=true` with `result_name=NO_MAJORITY`; contract pending remains 2 wei, so delivery is not treated as reconciled. Positive qualification and challenge-flip live evidence remain outstanding. The production Vercel alias points to the current contract configuration; deployment and route checks are recorded in [DEPLOYMENT.md](DEPLOYMENT.md).

## Unresolved capabilities

- EVM vault feasibility is not demonstrated end-to-end on stable Studionet. Official documentation describes underlying mechanisms, but there is no vault transaction proof for deposit, authenticated GenVM settlement, idempotency, and final result handling. No EVM vault was introduced.
- EOA child-transfer outcome remains unauthenticated in contract state; no automatic retry or delivery reconciliation is claimed.
- Unexpected failed payable calls may strand attached GEN without matching state.
- The available Web Access interface does not enforce final redirect-origin policy.

**Verdict: implementation hardening, source-matched Studionet deployment, a missing-evidence recovery/refund lifecycle, and genuine browser-wallet program creation are documented. Positive qualification and challenge-flip live evidence remain incomplete. The wallet proof creates an unfunded draft only. This is not production-safe escrow.**
