# Ascende contract API

This API is implemented in `contracts/ascende.py`. Generated ABI schema is [`contracts/ascende.schema.json`](../contracts/ascende.schema.json), produced with the pinned GenVM `v0.2.16` SDK. CI pins that same SDK to avoid an incompatible cached prerelease.

All addresses are normalized to lowercase. GEN values are integer wei strings unless a method returns `u256`. Milestone indices are zero-based. JSON arguments and JSON view results are strings.

## Writes

| Method | Signature | Value / authorization |
|---|---|---|
| `create_program` | `(recipient: str, title: str, purpose: str, milestones_json: str, policy_json: str) -> u256` | Draft only. Sends no GEN. Caller becomes funder. Freezes 2–5 milestones, 2–4 authorities (at least two required) on distinct hostnames, 1–3 criteria per milestone and the policy. Attached value is credited as rejected payable value and no draft is created. |
| `accept_program` | `(program_id: u256) -> str` | Named recipient only, before frozen `accept_deadline`; records acceptance of immutable terms. |
| `fund_program` | `(program_id: u256) -> str` | Payable; original funder only, after recipient acceptance and before `accept_deadline`; exact `budget_wei` activates the programme. Rejected received value is sender-credited. |
| `expire_unaccepted_program` | `(program_id: u256) -> str` | Permissionless after the frozen deadline for an unaccepted draft; terminal, no principal is held. |
| `expire_unfunded_program` | `(program_id: u256) -> str` | Permissionless after the frozen deadline when accepted terms were not funded; terminal, no principal is held. |
| `submit_evidence` | `(program_id: u256, milestone_index: u256, manifest_json: str) -> str` | Recipient only; one item with exact URL, byte length and SHA-256 for every required authority while stage is open and before deadline. |
| `evaluate_milestone` | `(program_id: u256, milestone_index: u256) -> str` | Permissionless; independently fetches and validates evidence, then semantic evaluation under custom consensus. |
| `challenge_milestone` | `(program_id: u256, milestone_index: u256, manifest_json: str) -> u256` | Payable; funder or recipient; exact frozen bond, new complete multi-authority manifest, one challenge in the window. |
| `resolve_challenge` | `(program_id: u256, milestone_index: u256) -> str` | Permissionless independent reevaluation and deterministic bond allocation. |
| `finalize_milestone` | `(program_id: u256, milestone_index: u256) -> str` | Permissionless after challenge window; only final qualification earns its tranche and opens the next stage. A newly eligible later stage is terminal-expired if its frozen deadline has passed. |
| `expire_milestone` | `(program_id: u256, milestone_index: u256) -> str` | Permissionless after an `OPEN` stage's evidence deadline; records `FINAL_EXPIRED` without vesting its tranche. |
| `finalize_unresolved` | `(program_id: u256, milestone_index: u256) -> str` | Permissionless after fixed review grace if no substantive result was finalized; unused retry opportunities do not convert the outcome to a business denial. |
| `close_program` | `(program_id: u256) -> str` | Permissionless only after a final failure, unresolved, or expired stage, or all stages qualify; unused principal becomes funder refund entitlement. |
| `request_withdrawal` | `(program_id: u256, amount_wei: str) -> u256` | Frozen recipient; reserves no more than earned claimable balance. |
| `request_refund` | `(program_id: u256, amount_wei: str) -> u256` | Funder; reserves no more than refund entitlement. |
| `request_bond_withdrawal` | `(program_id: u256, amount_wei: str) -> u256` | Funder or recipient; reserves no more than caller's bond entitlement. |
| `submit_payment` | `(program_id: u256, operation_id: str) -> str` | Permissionless, once per authorized immutable operation; emits a single EOA external transfer and records submitted/pending, not delivered. |
| `mark_transfer_unresolved` | `(program_id: u256, operation_id: str) -> str` | Public status transition from submitted to unresolved; does not restore entitlement or enable retry. It is not an authenticated child failure proof. |

The frozen policy contains `acceptance_window` (60 seconds through 30 days), `challenge_window`, `retry_spacing`, `retry_grace`, `max_retries`, and `challenge_bond_wei`. Funding begins only after the recipient signs `accept_program`; an unaccepted or accepted-but-unfunded draft holds no GEN and expires permissionlessly.

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
| `get_capabilities` | `(program_id: u256, account: str) -> str` | JSON role, claim, recipient-submission, deadline, evaluation, challenge, expiry, unresolved-finalization, and closure booleans; `delivery_recovery_supported` is false. |

## Transfer state guarantee

Payment authorization, submission and recipient delivery are separate. `submit_payment` is one-shot and only moves reserved amounts into pending buckets. An EOA transfer uses the documented EVM external-message interface. The contract has no authenticated child-result callback or reconciliation view in this implementation; neither `mark_transfer_unresolved` nor an explorer observation can safely release the reservation for a second transfer.

Every criterion decision packet records one finding per required source, with byte start/end offsets and a quotation matched to that evaluator's independently fetched UTF-8 bytes. A positive or negative criterion finding requires at least two required, distinct-host source findings in agreement; conflicting source findings prevent a definitive criterion outcome. Leader and validator must agree on the evidence root, source identities and classifications, criterion outcomes, and final classification; each packet's citations are verified independently, but valid byte spans may differ. Quotations establish exact-byte traceability, not source truth or publisher identity. The frontend collects each required authority, supports optional sources and displays criterion citations. Different hostnames do not prove different owners. Challenge state preserves both manifests, roots, prior result, challenge resolution, and append-only decision records. Final redirect authority and authenticated child-transfer delivery remain unsupported; see [SECURITY.md](SECURITY.md).
