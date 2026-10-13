# Ascende contract API

This API is implemented in `contracts/ascende.py`. Generated ABI schema is [`contracts/ascende.schema.json`](../contracts/ascende.schema.json), produced with the pinned GenVM `v0.2.16` SDK. CI pins that same SDK to avoid an incompatible cached prerelease.

All addresses are normalized to lowercase. GEN values are integer wei strings unless a method returns `u256`. Milestone indices are zero-based. JSON arguments and JSON view results are strings.

## Writes

| Method | Signature | Value / authorization |
|---|---|---|
| `create_program` | `(recipient: str, title: str, purpose: str, milestones_json: str, policy_json: str) -> u256` | Payable; exact sum of tranche wei. Caller becomes funder. Freezes 2–5 milestones and policy. |
| `submit_evidence` | `(program_id: u256, milestone_index: u256, manifest_json: str) -> str` | Recipient only; one authorized manifest while stage is open and before deadline. |
| `evaluate_milestone` | `(program_id: u256, milestone_index: u256) -> str` | Permissionless; independently fetches and validates evidence, then semantic evaluation under custom consensus. |
| `challenge_milestone` | `(program_id: u256, milestone_index: u256, manifest_json: str) -> u256` | Payable; funder or recipient; exact frozen bond, new authorized source manifest, one challenge in the window. |
| `resolve_challenge` | `(program_id: u256, milestone_index: u256) -> str` | Permissionless independent reevaluation and deterministic bond allocation. |
| `finalize_milestone` | `(program_id: u256, milestone_index: u256) -> str` | Permissionless after challenge window; only final qualification earns its tranche and opens the next stage. |
| `finalize_unresolved` | `(program_id: u256, milestone_index: u256) -> str` | Permissionless after all bounded retries and retry grace. |
| `close_program` | `(program_id: u256) -> str` | Permissionless only after a final failure/unresolved stage or all stages qualify; unused principal becomes funder refund entitlement. |
| `request_withdrawal` | `(program_id: u256, amount_wei: str) -> u256` | Frozen recipient; reserves no more than earned claimable balance. |
| `request_refund` | `(program_id: u256, amount_wei: str) -> u256` | Funder; reserves no more than refund entitlement. |
| `request_bond_withdrawal` | `(program_id: u256, amount_wei: str) -> u256` | Funder or recipient; reserves no more than caller's bond entitlement. |
| `submit_payment` | `(program_id: u256, operation_id: str) -> str` | Permissionless, once per authorized immutable operation; emits a single EOA external transfer and records submitted/pending, not delivered. |
| `mark_transfer_unresolved` | `(program_id: u256, operation_id: str) -> str` | Public status transition from submitted to unresolved; does not restore entitlement or enable retry. It is not an authenticated child failure proof. |

## Views

| Method | Signature | Result |
|---|---|---|
| `get_program_counter` | `() -> u256` | Total programs. |
| `list_program_ids` | `(offset: u256, limit: u256) -> str` | JSON array of one-based IDs; limit capped at 50. |
| `get_program` | `(program_id: u256) -> str` | Full program JSON including milestones, operations and history; empty string when absent. |
| `get_milestone` | `(program_id: u256, milestone_index: u256) -> str` | One frozen milestone and current state. |
| `get_milestones` | `(program_id: u256) -> str` | JSON milestone array. |
| `get_evidence_manifest` | `(program_id: u256, milestone_index: u256) -> str` | JSON active root/manifest, immutable submission/challenge evidence versions, and decision history. |
| `get_resolution_history` | `(program_id: u256, offset: u256, limit: u256) -> str` | JSON history slice; limit capped at 100. |
| `get_program_accounting` | `(program_id: u256) -> str` | JSON principal and bond bucket values, plus program status. |
| `get_transfer_attempt` | `(program_id: u256, operation_id: str) -> str` | JSON immutable destination/amount/purpose/status operation; empty string if absent. |
| `get_protocol_accounting` | `() -> str` | JSON sum of protocol principal and bond buckets. |
| `get_capabilities` | `(program_id: u256, account: str) -> str` | JSON role and claim booleans; `delivery_recovery_supported` is false. |

## Transfer state guarantee

Payment authorization, submission and recipient delivery are separate. `submit_payment` is one-shot and only moves reserved amounts into pending buckets. An EOA transfer uses the documented EVM external-message interface. The contract has no authenticated child-result callback or reconciliation view in this implementation; neither `mark_transfer_unresolved` nor an explorer observation can safely release the reservation for a second transfer.

The frontend uses the signatures above for its writes and treasury/history reads. Challenge state preserves both manifests, their roots, prior result, challenge resolution, and append-only decision records. This does not establish final redirect authority or authenticated child-transfer delivery; see [SECURITY.md](SECURITY.md).
