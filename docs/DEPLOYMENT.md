# Deployment status

**Canonical test deployment:** stable GenLayer Studionet, chain ID `61999` (`0xF22F`), RPC `https://studio.genlayer.com/api`.

## Corrective release status — 2026-10-19

Corrective source commit [`ff50ce9316673496dae423ca63f155043a2dba53`](https://github.com/Ifem1/Ascende/commit/ff50ce9316673496dae423ca63f155043a2dba53) is deployed to stable Studionet at [`0x5bF12b1033A5827edBB27cdc92C7FAb0C4d1304F`](https://explorer-studio.genlayer.com/address/0x5bF12b1033A5827edBB27cdc92C7FAb0C4d1304F), source SHA-256 `98bc175a714326dd926a92ffff709f2cfd42fc4709e04c1a940d9c5e94017a04`. Deployment receipt [`0x8dd7d2e4483b6f9e370e4c1985d482c47a819662caf5251c4e0eb0c092ab247b`](https://explorer-studio.genlayer.com/tx/0x8dd7d2e4483b6f9e370e4c1985d482c47a819662caf5251c4e0eb0c092ab247b) finalized with majority agreement; live source-byte readback exactly matches local source. Fresh scenarios now cover wrong-funder payable rejection/refund, qualification followed by a challenge reversal, a negative decision/refund, and conflicting authorities producing `INCONCLUSIVE` followed by bounded closure. Child receipts report credit, but contract accounting remains pending and unverifiable. See [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md) for transaction hashes and precise limits.

The Vercel production environment points to the corrective contract. Production deployment [`dpl_8fuNt8H4R7SgvFF8ygus64XKNVD4`](https://vercel.com/ifem1s-projects/ascende/8fuNt8H4R7SgvFF8ygus64XKNVD4) reached `READY` and is aliased to [ascende-sand.vercel.app](https://ascende-sand.vercel.app/). All checked production routes returned HTTP 200, and `/docs` embeds the corrective address and source SHA-256. This deployment contains the frontend from commit `78182ee223ac48c95814d2f28b9b9887b7ef9c3f`; final documentation updates will be redeployed after commit. This is a reviewer demonstration, not production-safe escrow.

## Superseded release status

This paragraph describes the superseded `0x154485…` deployment only. Its injected-wallet browser transaction is historical and is not evidence of a transaction on the corrective address. Current deployment and frontend state are recorded above.

## Superseded deployment — 2026-10-18

- Source commit used for deployment: [`7ed29355d9e308f0c236e3a3df4aff8eb8c20649`](https://github.com/Ifem1/Ascende/commit/7ed29355d9e308f0c236e3a3df4aff8eb8c20649). The deployed contract source is unchanged by subsequent documentation-only commits.
- Contract: `0x1544852461c4F61F266F5c2930c315C85069f1a6`; [Studionet explorer](https://explorer-studio.genlayer.com/address/0x1544852461c4F61F266F5c2930c315C85069f1a6).
- Network: stable Studionet, chain ID `61999` (`0xF22F`), RPC `https://studio.genlayer.com/api`; repository CLI `0.39.1`.
- Deployment transaction: [`0x46b46a4faa4101f010dffb338d7b4c9c401de1cc6a5891e7113a6baf06cee03c`](https://explorer-studio.genlayer.com/tx/0x46b46a4faa4101f010dffb338d7b4c9c401de1cc6a5891e7113a6baf06cee03c), `FINALIZED`, execution `SUCCESS`, `MAJORITY_AGREE`; five validators revealed votes, three agreed and two were idle. Deployer: supplied Landlord 1 `0xD6423aE82a975d55C6CeaC222827A727325e0459`.
- `contracts/ascende.py` and `gen_getContractCode` readback are both 71,993 bytes with SHA-256 `8345BBDD755FE5E35EB02AE02AB0DDEB00DEB7AF51F0581BFF552CF68D060217`.
- `gen_getContractSchema` readback contains 33 public methods and matches the generated API surface. Initial `get_program_counter()` is `0`; every protocol accounting bucket read is zero.
- Exact main-commit GitHub Actions: [run 39159926035](https://github.com/Ifem1/Ascende/actions/runs/39159926035), successful on merge commit `f0e7d3cf93ef4bd82f774fb5907d52da8815ec9f`.
- The post-merge Vercel production deployment `dpl_5eQJ7mPm4pUE5JbPCYV9ysEJGHfJ` reached `READY` and was assigned [ascende-sand.vercel.app](https://ascende-sand.vercel.app/). The deployed Docs page contains the canonical contract and source hash. Its build uses `NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS=0x1544852461c4F61F266F5c2930c315C85069f1a6` and `NEXT_PUBLIC_GENLAYER_RPC=https://studio.genlayer.com/api`; production route checks returned HTTP 200.

## Previous deployed source (historical; not this branch)

- Repository commit: [`fccac05730c95d68f5759c89f9e689c0d76165b5`](https://github.com/Ifem1/Ascende/commit/fccac05730c95d68f5759c89f9e689c0d76165b5).
- Contract: `0x2c7a6260f2958C0Bd6634182E9978d209F0a06aD`.
- Deployment transaction: [`0x03bc674baea5c6915ce840a20c6d17072171805d410b9e7bf968bbad0177be01`](https://explorer-studio.genlayer.com/tx/0x03bc674baea5c6915ce840a20c6d17072171805d410b9e7bf968bbad0177be01); finalized with execution `SUCCESS` and validator consensus `MAJORITY_AGREE` (five validators revealed, three agreed).
- `contracts/ascende.py` SHA-256: `A811544EB159A7745545DCC87D5F1258FEACB6352CEC6B10A8DDCBBFD9375D09`.
- `genlayer code` readback from this address begins with the exact committed source bytes after normalizing line endings; its CLI output adds two trailing formatting newlines. The deployed public schema matches the generated repository schema. Initial `get_program_counter()` returned `0`.
- The deployment used supplied test wallet `0xD6423aE82a975d55C6CeaC222827A727325e0459`. No key material is stored in the repository.
- The multi-authority positive, challenge-flip and failure lifecycle scenarios have not yet been run against this address. Do not treat historical receipts or Direct Mode simulations as fresh live proof.

At that historical release, the production alias [ascende-sand.vercel.app](https://ascende-sand.vercel.app/) used that release's contract address. Vercel deployment `dpl_7LJoRtnqCG7DW5SgyzqKVDGNmw2F` was `READY` at [its deployment URL](https://ascende-8spcbezud-ifem1s-projects.vercel.app). Its route checks are historical only. `NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS` and `NEXT_PUBLIC_GENLAYER_RPC` are build inputs; changing them in Vercel requires a new production deployment.

## Historical deployments

Address `0x884676bCDE191A9D9c79B3111812425E15824836` was deployed from commit `d80148c4fadd23c01fb4bff39d46bd1508951bbe`, transaction `0xe502d1640c1612979018be4aafde8eaea83afc29cc1ed49a341c775d5559b2a7`, source SHA-256 `7CA854631AFFF1861006BD8BC9F32A1425DF40C1BA402D88177FE74E853E7D6A`. Its rejection-credit/refund and browser creation receipts remain valid historical evidence for that older source only. Older full lifecycle evidence is separately labeled in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md).

## Verified behavior and limits

This is a testnet demonstration, not production approval. The contract authorizes an outgoing EOA transfer once and records it as submitted; the pinned runtime offers no authenticated child-result callback. A child receipt with `value_credited=true` is observational evidence and does not reconcile the contract ledger or enable retry. Allowlisted validation rejections can be credited to the sender, but unexpected execution failures may leave attached GEN stranded. The pinned Web Access response does not expose enforceable final redirect authority, so the frozen URL prefix proves the requested URL, not the final response origin. See [SECURITY.md](SECURITY.md) and [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md).
