# More Info implementation closeout

## Implemented on this branch

- Replaced single-source-style criterion decisions with source-level findings across frozen authorities. Each source finding carries a bounded quote and UTF-8 byte offsets validated against independently fetched, hash-checked response bytes. The validator agreement compares the exact normalized packet and evidence root.
- Preserved challenge evidence and prior decision lineage; a challenge is reevaluated against its own immutable manifest and can change the provisional result without mutating prior evidence.
- Added a frozen acceptance window and a three-party-safe lifecycle: zero-value draft, named-recipient acceptance, then exact-budget funding by the original funder. Permissionless expiry closes unaccepted and unfunded drafts without holding principal.
- Extended frontend creation and milestone evidence forms for multiple required and optional authorities, additional criteria, and accept/fund/expiry actions.
- Pinned the CLI in the root lockfile and made Windows CI verify CLI version and stable Studionet selection. Generated ABI schema is checked for drift.

## Verification state

The latest contract suite has 63 Direct Mode tests. Exact-main-commit [GitHub Actions run 39159926035](https://github.com/Ifem1/Ascende/actions/runs/39159926035) passed on merge commit `f0e7d3cf93ef4bd82f774fb5907d52da8815ec9f`, including GenVM lint, type/semantic/schema checks, frontend checks, unit tests, production build and all Playwright tests. The contract is deployed at `0x1544852461c4F61F266F5c2930c315C85069f1a6` with SHA-256 `8345bbdd755fe5e35eb02ae02ab0ddeb00deb7af51f0581bff552cf68d060217`. A genuine Rabby browser transaction created current-source program 1, finalized with three validator agrees, and the authoritative contract readback matches; the program is unfunded. Program 2 was created using the SDK and is also an unfunded draft. Current-source live milestone evaluation, challenge and recovery remain unverified. The post-merge Vercel deployment `dpl_5eQJ7mPm4pUE5JbPCYV9ysEJGHfJ` was `READY` with the production alias assigned, and the public routes were verified. The final documentation-only main commit preserves the same frontend and contract behavior.

## Unresolved capabilities

- EVM vault feasibility is not demonstrated end-to-end on stable Studionet. Official documentation describes underlying mechanisms, but there is no vault transaction proof for deposit, authenticated GenVM settlement, idempotency, and final result handling. No EVM vault was introduced.
- EOA child-transfer outcome remains unauthenticated in contract state; no automatic retry or delivery reconciliation is claimed.
- Unexpected failed payable calls may strand attached GEN without matching state.
- The available Web Access interface does not enforce final redirect-origin policy.

**Verdict: implementation hardening, source-matched Studionet deployment, missing-evidence recovery/refund evidence on a previous deployment, and a genuine current-source browser-wallet draft creation are documented. Current-source positive qualification and challenge-flip live evidence remain incomplete. The browser proof creates an unfunded draft only. This is not production-safe escrow.**
