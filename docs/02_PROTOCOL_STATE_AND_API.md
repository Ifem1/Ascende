# Contract state machine and public interface

This file describes the implemented contract. The generated schema at contracts/ascende.schema.json and the method table in CONTRACT_API.md are authoritative.

## Milestone states

- LOCKED: the previous milestone is not final qualified.
- OPEN: the recipient may seal a manifest through the frozen evidence deadline.
- EVIDENCE_SEALED: the manifest and root are frozen for submission review.
- RETRYABLE: the review could not establish a business result; technical failure is not nonqualification.
- PROVISIONAL_QUALIFIED / PROVISIONAL_NOT_QUALIFIED: a substantive packet is recorded and the challenge window remains open.
- CHALLENGED / CHALLENGE_RETRYABLE: a party posted the exact frozen bond and a distinct, authorized manifest; the bond remains locked until substantive resolution or unresolved closure.
- FINAL_QUALIFIED: irrevocable qualification; the frozen tranche vests once.
- FINAL_NOT_QUALIFIED: irrevocable nonqualification; no tranche vests.
- FINAL_EXPIRED: an open milestone passed its evidence cutoff without submission, or its frozen deadline passed before activation.
- FINAL_UNRESOLVED: the bounded review window ended without a substantive resolution; this is distinct from nonqualification.

Programs are ACTIVE, CLOSED_SUCCESS, or CLOSED_STOPPED. A stopped program can only release unearned principal to its frozen funder after terminal closure. Earned entitlements and challenge bonds use separate accounting buckets.

## Time and transitions

All comparisons use GenVM's transaction-context timestamp. Creation requires future deadlines in strictly increasing order, each no more than 365 days ahead. Evidence submission and challenges are allowed at their exact deadline; expiry, unresolved closure, and decision finalization require a timestamp strictly after the applicable cutoff.

A later milestone opens only after prior final qualification. If its own frozen deadline has already passed, activation records FINAL_EXPIRED instead of OPEN. Anyone may expire an unsubmitted OPEN milestone after its deadline. Anyone may finalize a stalled sealed review or challenge after its frozen review grace; challenge closure returns the locked bond to the challenger. A technical result never creates a business denial.

The frozen policy bounds challenge windows, retry spacing, retry count and review grace. Review grace must allow the configured retry opportunities at the frozen spacing. No contract transition runs automatically without a transaction; the actions are permissionless and remain callable by any account that sends the transaction.

## Economic boundary

Funding must exactly equal the sum of positive tranche values. Each final qualified milestone removes its tranche from locked principal and adds it once to earned entitlement. Program closure makes only remaining locked principal refundable. Payment authorization reserves a unique immutable operation, and submission is one-shot. There is no authenticated callback to convert pending child transfers into confirmed delivery or safe retry.

AI output cannot set amounts, recipients, entitlement, timestamps, or permissions. See CONTRACT_API.md for exact public signatures and the generated schema.
