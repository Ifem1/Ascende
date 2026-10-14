# 08 — Release, documentation and steward signoff

## Current release record

The current contract source is commit `d80148c4fadd23c01fb4bff39d46bd1508951bbe`, deployed to `0x884676bCDE191A9D9c79B3111812425E15824836`; its source hash, deployment transaction and fresh rejected-payable/refund evidence are recorded in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). The broader positive, negative, expiry, challenge and abandoned-review receipts belong to the previous source at `0xC2F0F3E18B69F398385652A55F423a1e339b4290` and are historical evidence only. GitHub push and final Actions verification remain outstanding.

**Steward verdict: NOT READY for production-safe escrow.** Current source accounts only for an allowlisted set of expected payable validation rejections; unexpected VM failures may still leave value unaccounted, and the older deployed address has no credit methods. The native interface does not authenticate external child-transfer delivery/failure back into contract state, and pinned Web Access does not expose enforceable final redirect authority. See [SECURITY.md](SECURITY.md).

## Network

Stable Studionet **61999 (`0xF22F`)** only, RPC `https://studio.genlayer.com/api`, explorer `https://explorer-studio.genlayer.com`. Studio-dev 61997 is not the target. Repository-local contract checks pin GenVM `v0.2.16`; CLI version and network must be verified before deployment.

## Release gates

1. Freeze source and record SHA-256 for `contracts/ascende.py`, Git commit and generated schema.
2. Require lint, semantic validation, schema generation, Direct Mode, TypeScript, ESLint, unit tests, production build and Playwright to pass.
3. Deploy only the exact tested source to a new stable Studionet address, then retrieve and hash deployed source.
4. Record fresh positive, negative, missing-evidence and stalled-review transactions and verify actual child receipts separately from the contract's unresolved transfer ledger.
5. Update the frontend address, deployment configuration and public Vercel build only after a new address and source parity are verified. The local frontend configuration and Vercel production deployment point to the current address; a fresh public Programs page read returned programs 1–6 from it.
6. Require a green GitHub Actions run for the final pushed commit and inspect its logs.

## Honest release status

The current stable deployment demonstrates a rejected payable credited to its original sender, once-only reservation and transfer submission, and an externally finalized 2-wei child credit. Its contract ledger remains pending because authenticated child settlement is unsupported. The previous deployment's positive, negative, missing-evidence, challenge and abandoned-review receipts are historical; 5 wei remains stranded at that older address. Final source-origin enforcement and authenticated child settlement remain unsupported. A green final commit CI run is required for reviewer submission; production-safe escrow remains **NOT READY**. Do not claim a reviewer score or production guarantee.
