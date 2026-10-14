# 08 — Release, documentation and steward signoff

## Current release record

This release candidate contains corrected liveness, accounting validation, evidence and consensus changes. Local contract and frontend checks pass (see [TESTING.md](TESTING.md)). A fresh source-matched stable Studionet deployment and live lifecycle evidence are required before calling it a verified reviewer demonstration. The deployment and source hash are recorded in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md) when verified.

**Steward verdict: NOT READY for production-safe escrow.** The native interface does not authenticate external child-transfer delivery/failure back into contract state; failed payable values may be stranded without a program record; the pinned Web Access response does not expose enforceable final redirect authority. See [SECURITY.md](SECURITY.md).

## Network

Stable Studionet **61999 (`0xF22F`)** only, RPC `https://studio.genlayer.com/api`, explorer `https://explorer-studio.genlayer.com`. Studio-dev 61997 is not the target. Repository-local contract checks pin GenVM `v0.2.16`; CLI version and network must be verified before deployment.

## Release gates

1. Freeze source and record SHA-256 for `contracts/ascende.py`, Git commit and generated schema.
2. Require lint, semantic validation, schema generation, Direct Mode, TypeScript, ESLint, unit tests, production build and Playwright to pass.
3. Deploy only the exact tested source to a new stable Studionet address, then retrieve and hash deployed source.
4. Record fresh positive, negative, missing-evidence and stalled-review transactions and verify actual child receipts separately from the contract's unresolved transfer ledger.
5. Update the frontend address, deployment configuration and public Vercel build only after a new address and source parity are verified.
6. Require a green GitHub Actions run for the final pushed commit and inspect its logs.

## Honest release status

A transparent Studionet demonstration may be reviewer-ready when these release gates have evidence. It is not production-safe escrow while native transfer reconciliation, failed payable attribution/recovery and final source-origin enforcement remain unsupported. Do not claim a reviewer score or production guarantee.
