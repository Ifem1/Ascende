# Ascende state matrix

The contract implements these transitions. Direct Mode tests exercise the important economic and deadline boundaries; this matrix describes contract state, not a claim of production solvency. Live proof is address/source-specific and recorded in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md).

| Current state | Trigger / guard | Next state | Economic effect |
|---|---|---|---|
| `LOCKED` | Previous stage is `FINAL_QUALIFIED` | `OPEN` | None. |
| `OPEN` | Recipient submits admissible evidence before cutoff | `EVIDENCE_SEALED` | None. |
| `EVIDENCE_SEALED` | Validators agree on qualified/nonqualified classification | `PROVISIONAL_QUALIFIED` / `PROVISIONAL_NOT_QUALIFIED` | None; no entitlement before finality. |
| `EVIDENCE_SEALED` | Required source unavailable, digest mismatch, invalid model output, or consensus cannot establish a result | `RETRYABLE` | None; technical failure is not a business denial. |
| `RETRYABLE` | Bounded retry within frozen time/attempt limit | `EVIDENCE_SEALED` or `RETRYABLE` | None. |
| `PROVISIONAL_*` | Eligible party posts exact bond during challenge window | `CHALLENGED` | Bond recorded in a separate obligation bucket. |
| `PROVISIONAL_QUALIFIED` | Challenge window ends without challenge | `FINAL_QUALIFIED` | Vest the exact frozen tranche once; unlock next stage. |
| `PROVISIONAL_NOT_QUALIFIED` | Challenge window ends without challenge | `FINAL_NOT_QUALIFIED` | No tranche vests; later stages remain locked. |
| `CHALLENGED` | Independent review agrees on a business result | `PROVISIONAL_*` then final under frozen window | No payout until final; settle bond by frozen rule. |
| `RETRYABLE` | Frozen finite retry/grace policy exhausted | `FINAL_UNRESOLVED` | No earned tranche; closure/refund only under frozen policy. |
| Terminal milestone / unresolved program | Frozen close condition satisfied | `CLOSED_SUCCESS` / `CLOSED_STOPPED` | Only genuinely unearned principal becomes refund obligation. |
| Entitlement/refund obligation | Authorized owner requests payment | `AUTHORIZED` then `TRANSFER_SUBMITTED` | Reserve exactly once before one EOA child transfer; absent an authenticated child result, delivery remains unresolved. |

## Global invariants

- `funded_principal = locked_unearned + earned_claimable + refund_claimable + principal_pending_or_ambiguous + principal_confirmed_delivered`.
- Bond obligations use a separate conservation equation and never mix with milestone principal.
- Provisional, challenged, retryable, and unresolved states never unlock a later stage or create earned credit.
- A final qualified stage is immutable and vests its tranche at most once.
- A failed or ambiguous child delivery cannot be restored to claimable balance without authenticated proof; it cannot be resent automatically.
- Funder refunds exclude earned and pending obligations. Recipient claims exclude locked and refundable principal.

## Release boundary

The contract enforces accounting and one-shot submission, but cannot authenticate child delivery/failure or recover value attached to failed payable calls. These limits block production-safe escrow even when the state transitions and tests pass.
