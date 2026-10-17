# 08 — Deployment and steward status

## Current working branch

This branch's contract is deployed to stable Studionet at `0x5715eACA23d495b71E800Dd9eD6e13875855bd9c`; deployment transaction and source-byte comparison are recorded in [DEPLOYMENT.md](DEPLOYMENT.md). Program 1 has fresh missing-evidence expiry/refund evidence, and a genuine injected-Rabby browser transaction created program 2 through the production frontend. Program 2 is a successful, unfunded draft; this is not a completed milestone lifecycle. Keep these limits and the production alias configuration current in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md).

## Stable target

Use stable Studionet chain ID `61999` (`0xF22F`), RPC `https://studio.genlayer.com/api`, and `explorer-studio.genlayer.com`. The repository pins GenLayer CLI `0.39.1`; CI verifies the selected network. GenVM runtime is pinned at `v0.2.16`. Do not use Studio-dev 61997 or prerelease tooling.

## Release gates

1. Freeze source and record the contract and schema SHA-256 values.
2. Require GenVM lint, typecheck, semantic validation, deterministic schema generation, Direct Mode, frontend TypeScript, ESLint, Vitest, production build, and Playwright to pass.
3. Push the exact tested commit and inspect GitHub Actions logs for a green run on that commit.
4. Deploy only the tested source to a new stable Studionet address and retrieve the deployed code for exact hash comparison.
5. Verify live creation, accepted funding, source-bound evaluation, challenge and finalization, failure/expiry, and settlement receipts. Report child credit separately from contract ledger state.
6. The current source-matched contract is already configured in the production frontend. Its finality fix is deployed and the core page routes return HTTP 200; the wallet creation receipt and exact deployment details are in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md) and [DEPLOYMENT.md](DEPLOYMENT.md).

## Steward verdict

This branch is a source-matched Studionet reviewer demonstration, not production-safe escrow. The browser proof creates an unfunded draft only; fresh positive qualification and challenge-flip live evidence are still absent. Unexpected failed payable calls may strand GEN; asynchronous child transfers have no authenticated result callback; and the pinned Web Access surface does not enforce final redirect authority. Multi-authority review improves provenance but does not prove publisher independence or truth. See [SECURITY.md](SECURITY.md), [SETTLEMENT_MODEL.md](SETTLEMENT_MODEL.md), and [MORE_INFO_CLOSEOUT.md](MORE_INFO_CLOSEOUT.md).
