# 08 — Release, documentation and steward signoff

## Current release record

The current multi-authority contract source is commit `fccac05730c95d68f5759c89f9e689c0d76165b5`, deployed to `0x2c7a6260f2958C0Bd6634182E9978d209F0a06aD` with SHA-256 `A811544EB159A7745545DCC87D5F1258FEACB6352CEC6B10A8DDCBBFD9375D09`. The deployment receipt and code/schema readback are recorded in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). Fresh positive, challenged and failure lifecycle receipts for this source have not yet been collected. Prior full lifecycle and rejected-payable/refund receipts belong to older source versions and must remain historical. CI for the contract source passed at [39024877282](https://github.com/Ifem1/Ascende/actions/runs/39024877282); submission also requires CI to pass on the exact documentation/frontend release HEAD. Vercel production deployment `dpl_7LJoRtnqCG7DW5SgyzqKVDGNmw2F` is `READY` and the alias uses the new contract address.

**Steward verdict: NOT READY for production-safe escrow.** Current source accounts only for an allowlisted set of expected payable validation rejections; unexpected VM failures may still leave value unaccounted, and the older deployed address has no credit methods. The native interface does not authenticate external child-transfer delivery/failure back into contract state, and pinned Web Access does not expose enforceable final redirect authority. See [SECURITY.md](SECURITY.md).

## Network

Stable Studionet **61999 (`0xF22F`)** only, RPC `https://studio.genlayer.com/api`, explorer `https://explorer-studio.genlayer.com`. Studio-dev 61997 is not the target. Repository-local contract checks pin GenVM `v0.2.16`; CLI version and network must be verified before deployment.

## Release gates

1. Freeze source and record SHA-256 for `contracts/ascende.py`, Git commit and generated schema.
2. Require lint, semantic validation, schema generation, Direct Mode, TypeScript, ESLint, unit tests, production build and Playwright to pass.
3. Deploy only the exact tested source to a new stable Studionet address, then retrieve and hash deployed source.
4. Record fresh positive, negative, missing-evidence and stalled-review transactions and verify actual child receipts separately from the contract's unresolved transfer ledger.
5. Update the frontend address and deployment configuration only after a new address and source parity are verified. Local and Vercel production configuration now point to the current address; the `READY` Vercel deployment's public `/programs` page returns HTTP 200 and its client bundle contains the address. This does not claim a wallet-signed live write through the public frontend.
6. Require a green GitHub Actions run for the final pushed commit and inspect its logs.

## Honest release status

The current deployment record and limitations are in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). The previous deployment's positive, negative, missing-evidence, challenge and abandoned-review receipts are historical; 5 wei remains stranded at an older address. Final source-origin enforcement and authenticated child settlement remain unsupported. The contract source commit's CI passed at [39024877282](https://github.com/Ifem1/Ascende/actions/runs/39024877282); verify a green Actions run on the exact documentation/frontend release HEAD before submission. Production-safe escrow remains **NOT READY**. Do not claim a reviewer score or production guarantee.
