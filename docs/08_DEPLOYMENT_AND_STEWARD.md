# 08 — Release, documentation and steward signoff

## Current release record

This release candidate at `86436b4824cc18699a35dc09779c2aa38a46e4d6` has corrected liveness, accounting validation, evidence and consensus changes. Local contract and frontend checks pass (see [TESTING.md](TESTING.md)). A fresh source-matched stable Studionet deployment at `0xC2F0F3E18B69F398385652A55F423a1e339b4290` is recorded in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md), including successful positive/negative/refund/expiry paths and failed short-window challenge evidence.

**Steward verdict: NOT READY for production-safe escrow.** The native interface does not authenticate external child-transfer delivery/failure back into contract state; failed payable values may be stranded without a program record; the pinned Web Access response does not expose enforceable final redirect authority. See [SECURITY.md](SECURITY.md).

## Network

Stable Studionet **61999 (`0xF22F`)** only, RPC `https://studio.genlayer.com/api`, explorer `https://explorer-studio.genlayer.com`. Studio-dev 61997 is not the target. Repository-local contract checks pin GenVM `v0.2.16`; CLI version and network must be verified before deployment.

## Release gates

1. Freeze source and record SHA-256 for `contracts/ascende.py`, Git commit and generated schema.
2. Require lint, semantic validation, schema generation, Direct Mode, TypeScript, ESLint, unit tests, production build and Playwright to pass.
3. Deploy only the exact tested source to a new stable Studionet address, then retrieve and hash deployed source.
4. Record fresh positive, negative, missing-evidence and stalled-review transactions and verify actual child receipts separately from the contract's unresolved transfer ledger.
5. Update the frontend address, deployment configuration and public Vercel build only after a new address and source parity are verified. The local frontend example and Vercel production deployment now point to the current address; the public Programs page read programs 1–3 from it.
6. Require a green GitHub Actions run for the final pushed commit and inspect its logs. This local commit has not been pushed because the saved GitHub identity lacks write access.

## Honest release status

The stable Studionet demonstration has fresh positive, negative and missing-evidence/refund receipts. Its live challenge transaction missed its frozen 60-second window; two failed test creates plus that challenge stranded 5 wei without matching state. The 2-wei child payout/refunds also remain `TRANSFER_SUBMITTED` in contract accounting despite finalized child receipts. Final source-origin enforcement is unsupported. Submission readiness remains **NOT READY** until the final pushed commit has green Actions; production-safe escrow remains unsupported. Do not claim a reviewer score or production guarantee.
