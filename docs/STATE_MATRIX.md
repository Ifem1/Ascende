# Ascende state matrix

The contract and generated schema are authoritative. Live evidence applies only to the exact source hash and deployment named in LIVE_VERIFICATION.md.

| Current state | Trigger / guard | Next state | Economic effect |
|---|---|---|---|
| LOCKED | Previous stage finalized qualified | OPEN, unless this deadline already passed | No change; if late, the stage becomes FINAL_EXPIRED. |
| OPEN | Recipient seals an admissible manifest at or before cutoff | EVIDENCE_SEALED | No entitlement. |
| OPEN | Anyone expires after cutoff | FINAL_EXPIRED | Tranche remains unearned and locked until program close. |
| EVIDENCE_SEALED / RETRYABLE | Independent validators agree on substantive criterion packet | PROVISIONAL_QUALIFIED / PROVISIONAL_NOT_QUALIFIED | No entitlement before finalization. |
| EVIDENCE_SEALED / RETRYABLE | Source unavailable, malformed output, or insufficient findings | RETRYABLE | No business denial or entitlement. |
| PROVISIONAL_* | Eligible party posts exact bond and distinct authorized evidence within window | CHALLENGED | Bond enters separate locked-bond bucket. |
| CHALLENGED / CHALLENGE_RETRYABLE | Substantive independent review | PROVISIONAL_* | Bond is assigned by the deterministic challenge rule; decision remains challengeable. |
| CHALLENGED / CHALLENGE_RETRYABLE | Review grace passes without substantive result | FINAL_UNRESOLVED | No tranche vests; the challenger receives the locked bond entitlement. |
| EVIDENCE_SEALED / RETRYABLE | Review grace passes without final result | FINAL_UNRESOLVED | No tranche vests; the reason records abandoned or technical review. |
| PROVISIONAL_* | Challenge period has passed | FINAL_QUALIFIED / FINAL_NOT_QUALIFIED | Only FINAL_QUALIFIED vests the exact tranche once. |
| Terminal failure / unresolved / expired stage | Permissionless close | CLOSED_STOPPED | Remaining locked principal becomes funder refund entitlement. |
| All milestones FINAL_QUALIFIED | Final stage finalizes | CLOSED_SUCCESS | All frozen tranches are earned. |
| Claim entitlement | Owner authorizes then submits unique operation | AUTHORIZED → TRANSFER_SUBMITTED | Amount enters pending; no contract-authenticated delivery claim or retry. |

## Invariants

- Principal is conserved across locked, earned claimable, authorized, pending, delivered, and refund buckets.
- Challenge bonds are conserved separately and returned to the challenger after unresolved technical review.
- Expiry never reverses an earlier final qualification or vests an unearned tranche.
- A submitted or ambiguous payment operation cannot be submitted twice.
- Permissionless means any account may submit the transition; it does not mean the chain executes it automatically.
- Failed payable value and native EOA delivery remain unsupported recovery paths, so the accounting ledger is not proof of physical solvency.
