# 04 — Escrow, GEN and payment safety: HARD RELEASE GATE

This is the highest-risk part of ASCENDE. The protocol is not complete merely because a payout button works. A terminal decision, actual transfer initiation, and **confirmed delivery** are three distinct facts.

Current implementation and test boundary: the contract enforces exact funding, separate principal/bond ledgers, one-time payment authorization and transfer submission. The current Studionet record includes positive, challenge, negative/refund, missing-evidence expiry, and abandoned-evaluation/challenge recovery. Seven finalized child receipts (five 2-wei principal transfers and two 1-wei bond transfers) remain pending in contract storage because no authenticated callback exists. Five wei of failed payable value remains without matching state. Failed payable recovery is unsupported, so the feature remains **NOT READY for production-safe escrow**. See [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md) and [SECURITY.md](SECURITY.md).

## Funding and frozen budgets

The funder sends exactly `sum(tranches)` GEN wei using `@gl.public.write.payable` + `gl.message.value`. Zero budgets, overflow, mismatch, overpayment, unexpected native transfer, invalid addresses and more than five tranches must fail. Keep challenge-bond ledger separate from tranche custody. Values are u256 wei; `1 GEN = 10^18 wei`, no JS floating point or `Number(BigInt)` for financial amounts.

## Economic buckets / accounting

Every unit of funded principal must belong to precisely one logical bucket:

`funded_principal = locked_unearned + earned_claimable + refund_claimable + principal_pending_or_ambiguous_delivery + principal_confirmed_delivered`

Split `principal_confirmed_delivered` by recipient vs funder. This is an **obligation conservation equation**, not an assertion that unsettled child-transferred GEN remains physically in contract custody. Physical balance, emitted messages, child tx values and confirmed recipient credit must be reconciled separately. If a transfer was emitted and money left custody, do not count it as spendable claimable again.

Challenge bonds: `bond_received = bond_locked + bond_claimable + bond_pending_or_ambiguous_delivery + bond_confirmed_delivered`. Successful challenger receives bond back; unsuccessful challenger forfeits to counterparty. If verdict is INCONCLUSIVE on second review, frozen policy must define a fair bond disposition (e.g., return to challenger) and no business payout until qualified. Never turn technical failure into lost bond as if party lost business dispute.

## Asynchronous GenLayer transfer problem

Current GenLayer docs state a value-bearing message may debit sender when emitted, credits recipient only on child activation, and **failed child transactions do not automatically refund sender**. GEN transfer to EOAs uses a supported `@gl.evm.contract_interface` recipient and `.emit_transfer(value=...)`. External sends occur on finalization. This is why `claimable = 0; emit_transfer()` is not enough proof of paid entitlement. Source: docs/genlayer value-transfers and messages.

Define immutable `transfer_attempt_id`, `owner`, `destination`, `amount`, `purpose`, `parent_tx`, `child_tx` (if discoverable), `status` (`REQUESTED`, `EMITTED`, `DELIVERY_CONFIRMED`, `CONFIRMED_FAILED`, `AMBIGUOUS`). Before emit reserve entitlement into `pending`; never issue second identical send while first is unresolved. UI may report **TRANSFER_PENDING**, not PAID, on parent finality alone. Follow child IDs using the supported SDK and inspect the authoritative execution/recipient credited outcome, not explorer green tags alone.

**CRITICAL architectural feasibility decision**: demonstrate how the contract can safely (not just UI) reconcile failed and ambiguous child payments without creating duplicate GEN. If no verifiable on-chain reconciliation exists, DO NOT add an unauthenticated `mark_failed`/`retry`/`admin_reconcile` function. A public caller supplying a hash or offchain screenshot is not authority. Do not claim liveness or safe recovery for failed transfers unless a reliable mechanism is implemented and tested. Clearly report the blocker and request operator approval for a redesigned settlement rail (e.g. a minimal separately audited EVM pull-vault contract), rather than silently compromising value safety. Additional contract is an exception requiring explicit justification, not default.

## No theft / no unilateral control

A funder may not withdraw still-locked tranches; a recipient may not withdraw unearned tranches; neither can seize another party's challenge bond. `close_program` cannot discard already-earned principal. Withdrawal destination should be frozen owner (or a safely authenticated owner-changed address under narrowly designed policy; V1 prefer frozen owner). Challenge/retry cannot release the same tranche twice. Reentrancy/replay and duplicate child-msg bugs must be tested wherever applicable.

## Liveness

Finite, fixed submission/correction/challenge/review deadlines and permissionless terminal actions. Technical failure may return unused principal only under precommitted policy after documented opportunity/retry window; it may not override previously earned credit or lose funds from an unresolved transfer. `FINAL_UNRESOLVED` never becomes a model-decided `NOT_QUALIFIED` by default.

## Minimum live economic evidence

1. Funding parent tx accepted/finalized and executed, exact deposited wei.
2. Stage QUALIFIED finality, exact earned credit.
3. Withdrawal parent tx finalized and executed, child transaction trace and destination+amount verification.
4. Recipient actual value credited (authoritative receipt/balance check, accounting delta).
5. Unqualified/final unresolved stage never releases its tranche.
6. Program close/refund and bond release/forfeit where exercised; reconciliation of all buckets.

If any link is missing, state `PAYMENT DELIVERY UNVERIFIED`, never fabricated `PAYOUT SUCCESS`.
