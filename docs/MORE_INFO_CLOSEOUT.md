# More Info implementation closeout

## Implemented on this branch

- Replaced single-source-style criterion decisions with source-level findings across frozen authorities. Each source finding carries a bounded quote and UTF-8 byte offsets validated against independently fetched, hash-checked response bytes. The validator agreement compares the exact normalized packet and evidence root.
- Preserved challenge evidence and prior decision lineage; a challenge is reevaluated against its own immutable manifest and can change the provisional result without mutating prior evidence.
- Added a frozen acceptance window and a three-party-safe lifecycle: zero-value draft, named-recipient acceptance, then exact-budget funding by the original funder. Permissionless expiry closes unaccepted and unfunded drafts without holding principal.
- Extended frontend creation and milestone evidence forms for multiple required and optional authorities, additional criteria, and accept/fund/expiry actions.
- Pinned the CLI in the root lockfile and made Windows CI verify CLI version and stable Studionet selection. Generated ABI schema is checked for drift.

## Verification state

The latest local verification recorded 63 Direct Mode tests; exact-commit GitHub Actions is running at [run 39154715318](https://github.com/Ifem1/Ascende/actions/runs/39154715318). The current branch source is deployed at `0x1544852461c4F61F266F5c2930c315C85069f1a6` with SHA-256 `8345bbdd755fe5e35eb02ae02ab0ddeb00deb7af51f0581bff552cf68d060217`. Current-source live milestone and injected-wallet scenarios are not yet recorded. Older live lifecycle and wallet receipts belong to prior source deployments. The Vercel production contract-address variable has been updated; the production alias alignment remains pending the final `main` deployment.

## Unresolved capabilities

- EVM vault feasibility is not demonstrated end-to-end on stable Studionet. Official documentation describes underlying mechanisms, but there is no vault transaction proof for deposit, authenticated GenVM settlement, idempotency, and final result handling. No EVM vault was introduced.
- EOA child-transfer outcome remains unauthenticated in contract state; no automatic retry or delivery reconciliation is claimed.
- Unexpected failed payable calls may strand attached GEN without matching state.
- The available Web Access interface does not enforce final redirect-origin policy.

**Verdict: implementation hardening, source-matched Studionet deployment, a missing-evidence recovery/refund lifecycle, and genuine browser-wallet program creation are documented. Positive qualification and challenge-flip live evidence remain incomplete. The wallet proof creates an unfunded draft only. This is not production-safe escrow.**
