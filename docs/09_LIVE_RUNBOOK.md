# 09 — Two-cycle actual Studionet economic verification

This is a reusable execution checklist. The current executed test cycles and receipts are in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md); they belong to the exact contract address and source hash named there. For future releases, use tiny testnet GEN amounts and controlled wallets (A=funder, B=recipient), never store keys, and preserve the resulting receipts without reusing earlier deployment evidence.

## Preconditions

- Contract deployed on 61999 and source SHA matches current `contracts/ascende.py`.
- Final Vercel production client points at the SAME address.
- Wallet A and B have adequate GEN plus fees; discover wallet addresses, never invent them.
- Choose accessible **immutable commit-pinned** HTTPS evidence, with exact raw SHA256 and lengths. Authoritative facts should be honest; for synthetic fixtures make demo clearly controlled and don't claim production achievement. Pin source prior to creation and verify both validator fetches.
- Snapshot `get_program_counter`, per-program/global accounting, real GEN balances and fee estimates.
- Freeze short but realistic observation/claim/challenge windows in a manner supported by contract; no retroactive time hack, no resetting network time.

## Cycle A — qualifying sequential progression

Example total escrow 0.06 GEN: milestone 1 0.02, milestone 2 0.04; stage 2 initially LOCKED. Exact wei at creation `60000000000000000`. Stage 1 source independently demonstrates agreed criterion. A creates/funds and B seals evidence; any party evaluates. Require PROVISIONAL_QUALIFIED (not merely FINALIZED tx); after frozen challenge period, finalize to FINAL_QUALIFIED; stage 2 becomes OPEN; vested credit 0.02 GEN. B requests withdrawal. Record parent, triggered child IDs, finalized GenVM result, actual recipient-credit proof. Do not mark Paid before confirmed delivery. Then stage 2 with genuine evidence can qualify or remain open depending on time. At least stage 1 progression and confirmed transfer must be proven.

## Cycle B — not-qualified / challenge and unused-funds recovery

Example total escrow 0.06 GEN for two milestones, 0.02/0.04. Submit authenticated evidence of a *defined criterion failure*, not absent-source synthetic denial. Evaluation must become PROVISIONAL_NOT_QUALIFIED. B challenges using the exact frozen bond amount. Re-review either retains NOT_QUALIFIED (losing challenge / precommitted bond outcome) or flips under genuinely new authorized evidence. To prove a losing challenge, use unmodified verifiable failure evidence. Once final, verify no earned principal, stage 2 remains LOCKED/closed, funder's unused principal becomes refundable only after allowed closure. Request refund, trace parent+child+recipient credit. Record bond forfeiture/return with child value verification.

## Other necessary runbook checks

- `SOURCE_UNAVAILABLE` on a required source is retryable/fallback, NEVER equivalent to NOT_QUALIFIED.
- Repeated `finalize_milestone`, `request_withdrawal`, `request_refund`, same evidence/challenge, old tx replay and wrong wallet fail closed.
- Account/chain changes in frontend never silently shift sender or allow wrong-network writes.
- Transfer failure ambiguity: prove no duplicated send and report recovery limitations honestly. If impossible to safely reconcile an actual failed transfer, STOP release under `docs/04` architecture gate.

## Evidence report template

```
Chain: 61999
Contract address: <real>
Contract source SHA-256: <real>
Deployed commit: <real>
Deployment tx: <real>
UI production URL: <real>
Wallet A/B: <addresses only>
Cycle A program ID: <actual>
- create hash, deposit, after-state
- milestone 1 evidence root, seal hash, evaluation hash
- provisional/final decision, source authority, challenge interval
- first vesting hash, unlocked second-stage state
- withdraw hash, triggered child hash, credited wei + destination
Cycle B program ID: <actual>
- create, evidence, provisional, challenge, resolve, refund, bond tx hashes
- no invalid unlock and true child GEN delivered
Global: funded, locked, earned claimable, refund claimable, pending, confirmed; bond ledger; before/after delta
CI URL:
Vercel deployment URL:
Known incomplete paths:
Verdict: PASS only if exact economic and source proofs pass
```

Never use a static Explorer transaction list as sole proof of final money delivery; inspect result, child trace and credited value.
