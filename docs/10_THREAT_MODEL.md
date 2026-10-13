# 10 — Ascende threat model (reviewer-grade target)

| Attack | Surface | Control | Proof gate |
|---|---|---|---|
| Funder changes rubric after work begins | Program creation/milestones | Freeze source/criteria/budgets and hash; no mutation write | Negative call and immutable state diff |
| Recipient substitutes unauthorized evidence | Evidence submission | Exact authority role, hostname/path binding, source root and immutable digest | Host/path, redirect, wrong digest and synthetic publisher tests |
| Source hosted by claimant fakes work | Semantic review | Freeze authority and credible independent provenance; require genuine acceptance facts, not user prose alone | Hostile fixture and live known-source examples |
| Model obeys injected instructions in page | Prompt | Escape/delimit web evidence as data; forbid changing rubric, URLs, payout | Prompt-injection tests |
| Validators compare only output shape | Consensus | Validators independently refetch evidence and classify the *decision-critical* field | Opposing validator outcome tests |
| LLM says QUALIFIED on unavailable source | Fetch boundary | Required source availability/integrity checked before settlement | Missing, 404, timeout, digest mismatch |
| Funded stage N+1 prematurely starts | Progression | Sequential dependency on FINAL_QUALIFIED, not provisional | Early-stage negative execution |
| Challenge loops exhaust funds | Challenge | Bond, role gate, fixed window, attempt cap, unique root | Challenge replay/deadline tests |
| Funder steals earned recipient funds | Treasury | Closed/refund rights limited to unearned escrow; no owner override | Simulated adversarial refund |
| Recipient withdraws same tranche twice | Treasury | Unique entitlement and frozen transfer attempt; reserve before emit | Duplicate/race tests |
| Failed child transfer loses credit or double spends | GEN messages | Pending lock, authoritative reconciliation only, never unsafe auto-retry | Live failure/reconciliation and manual audit |
| Parent finalized but child not credited | Frontend | Distinct executed parent vs delivered child states | UI lifecycle tests + chain evidence |
| Pending tx times out, UI broadcasts again | Wallet | Persist and reconcile original tx hash; no automatic rebroadcast | Refresh/offline/resume test |
| Wrong chain signed/paid | Wallet | Hard gate 61999, provider events and pre-broadcast revalidation | Wrong-network click/rejection test |
| Fake program counts / IDs | Frontend | Canonical reads/counters, stable IDs, no hardcoded test fixtures in production | E2E public no-wallet source parity |
| Inconclusive becomes denial | Liveness | Typed non-business status, fixed eventual refund policy | Source failure and final fallback tests |

Residual risks must be disclosed, especially absence of a cryptographic publisher identity for generic HTTPS sources, mutable upstream pages, validator nondeterminism, L2/ghost delivery timing, and unsupported on-chain child-transfer proof verification.
