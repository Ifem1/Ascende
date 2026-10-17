# 08 — Deployment and steward status

## Current working branch

This branch's contract is deployed to stable Studionet at `0x5715eACA23d495b71E800Dd9eD6e13875855bd9c`; deployment transaction, source-byte comparison, and the unsuccessful fresh create attempt are recorded in [DEPLOYMENT.md](DEPLOYMENT.md) and [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). No successful current-deployment lifecycle is claimed. The production Vercel alias intentionally remains on its existing release. Do not set the alias to an old contract address and describe it as this source.

## Stable target

Use stable Studionet chain ID `61999` (`0xF22F`), RPC `https://studio.genlayer.com/api`, and `explorer-studio.genlayer.com`. The repository pins GenLayer CLI `0.39.1`; CI verifies the selected network. GenVM runtime is pinned at `v0.2.16`. Do not use Studio-dev 61997 or prerelease tooling.

## Release gates

1. Freeze source and record the contract and schema SHA-256 values.
2. Require GenVM lint, typecheck, semantic validation, deterministic schema generation, Direct Mode, frontend TypeScript, ESLint, Vitest, production build, and Playwright to pass.
3. Push the exact tested commit and inspect GitHub Actions logs for a green run on that commit.
4. Deploy only the tested source to a new stable Studionet address and retrieve the deployed code for exact hash comparison.
5. Verify live creation, accepted funding, source-bound evaluation, challenge and finalization, failure/expiry, and settlement receipts. Report child credit separately from contract ledger state.
6. Configure and deploy the frontend only after a verified source-matched address exists. Do not alter the present production alias before these checks pass.

## Steward verdict

This branch is not yet a source-matched live submission and is not production-safe escrow. Unexpected failed payable calls may strand GEN; asynchronous child transfers have no authenticated result callback; and the pinned Web Access surface does not enforce final redirect authority. Multi-authority review improves provenance but does not prove publisher independence or truth. See [SECURITY.md](SECURITY.md), [SETTLEMENT_MODEL.md](SETTLEMENT_MODEL.md), and [MORE_INFO_CLOSEOUT.md](MORE_INFO_CLOSEOUT.md).
