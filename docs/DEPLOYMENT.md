# Deployment status

**Canonical test deployment:** stable GenLayer Studionet, chain ID `61999` (`0xF22F`), RPC `https://studio.genlayer.com/api`.

## Current source-matched deployment

- Repository commit: [`fccac05730c95d68f5759c89f9e689c0d76165b5`](https://github.com/Ifem1/Ascende/commit/fccac05730c95d68f5759c89f9e689c0d76165b5).
- Contract: `0x2c7a6260f2958C0Bd6634182E9978d209F0a06aD`.
- Deployment transaction: [`0x03bc674baea5c6915ce840a20c6d17072171805d410b9e7bf968bbad0177be01`](https://explorer-studio.genlayer.com/tx/0x03bc674baea5c6915ce840a20c6d17072171805d410b9e7bf968bbad0177be01); finalized with execution `SUCCESS` and validator consensus `MAJORITY_AGREE` (five validators revealed, three agreed).
- `contracts/ascende.py` SHA-256: `A811544EB159A7745545DCC87D5F1258FEACB6352CEC6B10A8DDCBBFD9375D09`.
- `genlayer code` readback from this address begins with the exact committed source bytes after normalizing line endings; its CLI output adds two trailing formatting newlines. The deployed public schema matches the generated repository schema. Initial `get_program_counter()` returned `0`.
- The deployment used supplied test wallet `0xD6423aE82a975d55C6CeaC222827A727325e0459`. No key material is stored in the repository.
- The multi-authority positive, challenge-flip and failure lifecycle scenarios have not yet been run against this address. Do not treat historical receipts or Direct Mode simulations as fresh live proof.

The production alias [ascende-sand.vercel.app](https://ascende-sand.vercel.app/) now uses this address. Vercel deployment `dpl_7LJoRtnqCG7DW5SgyzqKVDGNmw2F` is `READY` at [its deployment URL](https://ascende-8spcbezud-ifem1s-projects.vercel.app). Its Docs page and the Programs, Create, My Work, Treasury, and Activity routes returned HTTP 200; the Docs page embeds this contract address and source hash. `NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS` and `NEXT_PUBLIC_GENLAYER_RPC` are build inputs; changing them in Vercel requires a new production deployment.

## Historical deployments

Address `0x884676bCDE191A9D9c79B3111812425E15824836` was deployed from commit `d80148c4fadd23c01fb4bff39d46bd1508951bbe`, transaction `0xe502d1640c1612979018be4aafde8eaea83afc29cc1ed49a341c775d5559b2a7`, source SHA-256 `7CA854631AFFF1861006BD8BC9F32A1425DF40C1BA402D88177FE74E853E7D6A`. Its rejection-credit/refund and browser creation receipts remain valid historical evidence for that older source only. Older full lifecycle evidence is separately labeled in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md).

## Verified behavior and limits

This is a testnet demonstration, not production approval. The contract authorizes an outgoing EOA transfer once and records it as submitted; the pinned runtime offers no authenticated child-result callback. A child receipt with `value_credited=true` is observational evidence and does not reconcile the contract ledger or enable retry. Allowlisted validation rejections can be credited to the sender, but unexpected execution failures may leave attached GEN stranded. The pinned Web Access response does not expose enforceable final redirect authority, so the frozen URL prefix proves the requested URL, not the final response origin. See [SECURITY.md](SECURITY.md) and [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md).
