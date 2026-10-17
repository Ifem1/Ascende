# 11 — Source references and toolchain assumptions

Verified against public GenLayer documentation on **2026-10-13**; reference pages can evolve. Instruct Codex to check exact installed pinned runtime signatures before writing/deploying.

1. `https://docs.genlayer.com/developers/intelligent-contracts/features/value-transfers` — payable decorator; `gl.message.value` wei; native EOA transfer; asynchronous child payment and non-automatic refund on failure.
2. `https://docs.genlayer.com/developers/intelligent-contracts/features/messages` — child messages and `on='finalized'` for external transfers.
3. `https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle` — independent leader/validator, `gl.vm.Return` and decision-field comparison; `run_nondet_unsafe` valid official API.
4. `https://docs.genlayer.com/developers/intelligent-contracts/features/calling-llms` — `gl.nondet.exec_prompt`, JSON format, response validation and model unreliability.
5. `https://docs.genlayer.com/developers/intelligent-contracts/features/non-determinism` — side effects deterministic outside nondet blocks.
6. `https://docs.genlayer.com/api-references/genlayer-test/direct` — Direct VM mock_web/mock_llm, prank/sender/value/warp and validator tests.
7. `https://docs.genlayer.com/developers/decentralized-applications/writing-data` — browser provider client, fees, wait finalization.
8. `https://docs.genlayer.com/developers/decentralized-applications/querying-a-transaction` — successful execution requirement, triggered child IDs, tracing.
9. `https://docs.genlayer.com/developers/intelligent-contracts/features/transaction-context` — sender/origin/current time/chain.
10. `https://docs.genlayer.com/developers/intelligent-contracts/tooling-setup` — toolchain and contract/JS patterns.

## Stable network baseline from user requirements

- Studionet RPC `https://studio.genlayer.com/api`
- Chain ID `61999` = `0xF22F`
- Explorer `https://explorer-studio.genlayer.com`
- Local tools: repository-pinned GenLayer CLI `0.39.1`, GenLayerJS `1.1.8` (frontend lockfile), `genlayer-test 0.29.2`, `genlayer-py 0.16.3`, and Direct Mode runner `v0.2.16` (checksum-pinned). The ABI schema was generated from the current branch with the pinned runtime and all 33 public methods were present in the deployed schema readback at `0x5715eACA23d495b71E800Dd9eD6e13875855bd9c`.
- DO NOT use chain 61997 or global RC CLI for this target.

## Public implementation reference review (2026-10-13)

- [Ifem1/Redeem](https://github.com/Ifem1/Redeem): reviewed the project README and its stated frozen source/criteria model and reported test/deployment status. GitHub's code view did not return the contract source in this session, so no source-level transfer behavior is asserted.
- [zoefunds/Proof-bounty](https://github.com/zoefunds/Proof-bounty): inspected `contracts/proof_bounty.py`. It uses `@gl.evm.contract_interface` with `emit_transfer` to EOA recipients and centralizes native transfers in `_send_gen`; settlement state is zeroed before emission. The source explains the EOA bridge distinction, but it does not establish recipient-credit proof or a contract-authenticated recovery callback for failed/ambiguous child transfers.
- [ometere123/veilpact](https://github.com/ometere123/veilpact): reviewed its README's optional GEN escrow flow. It uses claimable balances and pull withdrawals; this changes when a user requests a transfer, but does not by itself prove delivery or safe recovery. GitHub's code view did not return the contract source in this session.

These repositories are design references only. No source code was copied. The matching native transfer syntax is used only after checking the official GenLayer docs and the installed runtime behavior in Direct Mode; live EOA delivery remains untested here.

## CharterLock comparison (conceptual research, no borrowed code)

Reference `https://github.com/GIFTEDLOV/charterlock` implements frozen event charters, bound source authority, SHA evidence commitments, strict semantic fact vector, custom equivalence, challenge lineage, and no direct payments. Its docs report live `SOURCE_UNAVAILABLE` for observed qualification, not proven YES/NO. Ascende uses these *design lessons*, but is original sequential milestone funding and child-transfer-safe entitlement management. Do not copy its code, phrasing, markup or UI.
