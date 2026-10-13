# Ascende contract API — freeze status

**Status: NOT FROZEN.** No contract source or generated schema exists yet. The signatures below are a requirements inventory from `docs/02_PROTOCOL_STATE_AND_API.md`, not a callable ABI. Frontend writes must remain disabled until the contract compiles under the pinned stable runtime, its generated schema is checked in, and the economic delivery gate in `docs/04_TREASURY_AND_PAYMENT_SAFETY.md` has a safe design.

## Required public surface (provisional)

| Method | Intended access | Required behavior |
|---|---|---|
| `create_program` | payable | Freeze recipient, 2–5 milestones, source policy, rules and deadlines; require `msg.value` to equal the exact nonzero tranche sum. |
| `submit_evidence` | recipient | Accept one bounded manifest against frozen authorities and deadlines; commit its digest and byte lengths. |
| `evaluate_milestone` | public | Independently inspect authenticated source bytes; return only a supported typed business/technical classification. |
| `challenge_milestone` | funder or recipient, payable | Accept only the exact frozen bond during the challenge window and bind a new review to the existing evidence lineage. |
| `resolve_challenge` | public | Independently reevaluate under the frozen rubric and settle only the predeclared bond consequence. |
| `finalize_milestone` | public | Finalize after the challenge period; vest a tranche and unlock the next stage only for final qualification. |
| `retry_evaluation` / `finalize_unresolved` | public | Apply finite technical retry and unresolved rules without turning source failure into business failure. |
| `close_program` | public | Close only under a frozen terminal condition and account for unearned principal. |
| `request_withdrawal` / `request_refund` | owner-gated | **Blocked pending an authenticated child-transfer recovery mechanism. Do not implement by clearing credits and emitting an EOA transfer.** |
| Required views | public | Canonical IDs, frozen program/stage records, evidence/resolution history, accounting, claims and transfer-attempt status. |

Exact parameter types/order, return shapes, storage schema, event names and error behavior must be derived from compiled source and generated schema. No TypeScript ABI is asserted by this document.

## Compatibility evidence available locally

- Python: 3.12.10
- `genlayer-test`: 0.29.2
- `genlayer-py`: 0.16.3
- Global `genlayer --version`: 0.39.1. This is not a repository-local installation and is not used as a substitute for the required local pin.
- Node: v24.16.0; npm: 11.13.0.
- npm registry metadata request for `genlayer-js@1.1.8` did not return before timeout; no JS SDK lockfile was created.
- GenVM version and Studionet compatibility have not been independently established.

## Why payout ABI is blocked

The official GenLayer value-transfer documentation states that a value-bearing message is debited when emitted and is not automatically returned if its child transaction fails. The documented external EOA transfer API does not provide a contract-callable proof/recovery path. A public caller-supplied hash, screenshot, or “mark failed” flag cannot safely authorize restoring a claim. Therefore no payout/refund write can be frozen without either a verified protocol-native authenticated reconciliation primitive or explicit approval for a separately reviewed settlement rail.

References: [GenLayer Value Transfers](https://docs.genlayer.com/developers/intelligent-contracts/features/value-transfers), [GenLayer Messages](https://docs.genlayer.com/developers/intelligent-contracts/features/messages).
