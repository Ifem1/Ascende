# 02 — Contract state machine and public interface LOCK

This is a **conceptual ABI lock** that Codex must turn into a concrete, compiled GenLayer schema **before frontend integration**. The final method argument types/order must come from generated schema, not guessed TypeScript. Contract is the authority. Use the leanest supportable storage layout and do not assume standard Solidity callbacks.

## Parties and identifiers

Each program has monotonic generated `program_id` (not supplied by caller), immutable funder = `gl.message.sender_address`, immutable recipient, denomination GEN wei (`u256`), creation timestamp, up to 5 milestone records with frozen version 1 rubric and exact tranche. No zero or duplicate payments; `sum(tranches) == msg.value`. Use length-prefixed canonical commitments for hashing variable-sized fields rather than naive delimiter concatenation.

`program` and `milestone` are not the same identity; milestone primary key = (`program_id`, `milestone_index`). Evidence snapshot root and resolution generation are immutable per resolution.

## State separation

Program: `ACTIVE`, `CLOSED_SUCCESS`, `CLOSED_STOPPED` (terminal). Program counters and treasury are orthogonal to a milestone's semantic status.

Milestone:
- `LOCKED` — cannot accept evidence until predecessor is final QUALIFIED.
- `OPEN` — recipient can submit admissible evidence before frozen submission cutoff.
- `EVIDENCE_SEALED` — read-only committed evidence bundle accepted, may evaluate.
- `RETRYABLE` — typed infrastructure/model transient issue; never coerced to NOT_QUALIFIED.
- `PROVISIONAL_QUALIFIED` or `PROVISIONAL_NOT_QUALIFIED` — challenge clock active, no money earned yet.
- `CHALLENGED` — single active bonded dispute, no premature settlement.
- `FINAL_QUALIFIED` — irrevocable qualifying decision; vest tranche (once) and activate next milestone.
- `FINAL_NOT_QUALIFIED` — irrevocable nonqualification under frozen policy; later milestones do not unlock; remainder subject to frozen closure/refund rules.
- `FINAL_UNRESOLVED` — no business classification proved after finite windows; unused tranche handled under explicitly frozen policy, never as implicit semantic FAIL.

Use explicit transition table tests; every write requires correct state. No self-challenge by nonparty; no reopening final milestone; no retroactive milestone re-interpretation.

## Suggested core public writes (keep close; change only after schema-backed justification)

1. `create_program(recipient, title, purpose, milestone_config_json, authority_config_json, policy_json) payable -> program_id` — exact wei funding, freeze total and rules, create records and first OPEN milestone.
2. `submit_evidence(program_id, milestone_index, manifest_json) -> evidence_root` — designated recipient or intentionally approved authorized submitter; deadline, bounded HTTPS sources, expected hash/byte length, immutable evidence root, no arbitrary authority injection.
3. `evaluate_milestone(program_id, milestone_index) -> verdict_record_id` — public action; GenLayer independent review; records status and canonical manifest, bounded attempts.
4. `challenge_milestone(program_id, milestone_index, challenge_evidence_json) payable -> challenge_id` — funder or recipient, exact bounded bond; freeze grounds; no new authority.
5. `resolve_challenge(program_id, milestone_index) -> verdict_record_id` — public action, validator review + deterministic challenge consequence, challenge limit.
6. `finalize_milestone(program_id, milestone_index) -> final_decision` — public action after challenge window if unchallenged; only final qualified vests entitlement.
7. `retry_evaluation(program_id, milestone_index) -> verdict_record_id` — bounded spacing and cap; no way to reset attempts.
8. `finalize_unresolved(program_id, milestone_index)` — deadline-limited finite fallback, no forced business verdict.
9. `close_program(program_id)` — closed final or unable-to-complete milestone, freeze all later stages, account for unearned refund only.
10. `request_withdrawal(program_id, amount)` — recipient only, amount <= earned and available, record unique transfer attempt ID and lock claim from duplicate initiation.
11. `request_refund(program_id, amount)` — funder only, <= truly refundable and available after closure; unique attempt.
12. `reconcile_transfer(program_id, attempt_id, proof)` — **ONLY if GenLayer exposes authentic on-chain proof validation; otherwise do not implement a fake reconciliation method.** See payment-safety spec for stop gate.

Challenge bond recovery (success/tie/unresolved) needs full safe accounting. Depending on runtime, provide `request_bond_withdrawal()` or create claimable bond credit combined with `request_withdrawal()`. Do not over-generalize withdrawal authority across recipient/funder.

## Required views

- `get_program_counter`, `get_program(program_id)`, `list_program_ids(offset,limit)`, `get_milestone(program_id,index)`, `get_milestones(program_id)` (bounded), `get_authority_rule(program_id,authority_id)`.
- `get_evidence_manifest(program_id,index,generation)`, `get_resolution_history(program_id,index,offset,limit)`, `get_challenge(program_id,index,challenge_id)`.
- `get_program_accounting(program_id)`, `get_protocol_accounting()`, `get_claimable(address,program_id)`, `get_transfer_attempt(program_id,attempt_id)`, `get_capabilities(program_id,account)`.
- Counters/IDs must be returned canonically; do NOT infer ID from title, array index after filtering or timestamps.

## Time and rights

Time source must be GenVM transaction time, not local browser time. All windows frozen; `>=`/`>` boundaries explicitly tested. Stages cannot advance from ACCEPTED or pending transaction UI state; financial authorization requires protocol-confirmed finalized decision. Funders cannot revoke vested entitlement; recipients cannot extend deadline unilaterally.

## Entitlement logic

At final qualified milestone `i`, `earned_credit[recipient] += tranche[i]` **exactly once**; `unearned_locked -= tranche[i]`; stage `i+1` moves LOCKED -> OPEN. At final failed/unresolved stage, no entitlement is created; later stages stay closed. Unused tranches enter `refundable_credit[funder]` only on permissible program closure, never while pending or under challenge.

No independent AI authority to set recipient, tranche amounts, deadlines or token amount. All of those are deterministic frozen fields.
