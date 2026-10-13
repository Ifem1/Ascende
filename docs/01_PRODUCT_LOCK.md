# 01 — Product, market and scope LOCK

## Product line

**ASCENDE — Prove progress. Unlock what comes next.**

Evidence-governed milestone capital and delegated **protocol-level** authorization. A funder commits a fixed GEN budget to one recipient; a frozen, ordered milestone plan determines when each payout entitlement vests, and which actions become available at each level. Each milestone's qualification is a semantic question answered by independent GenLayer validators inspecting frozen, authenticated public HTTPS evidence. Contracts deterministically enforce rights and money.

Do not position as generic AI grant voting, market predictions, CharterLock re-skin, subscription service, or a bundle of Redeem guarantees. Ascende addresses a *progression dependency*: stage N+1 may not be active until N is finalized qualified; accumulated immutable proofs constrain later stage entitlement.

## User stories

- **Funder:** submit a program with 2–5 sequential milestones, acceptance rubrics, budgets, recipient address, deadlines, accepted authorities, explicit failure and recovery policies, and exact payable total funding. Browse and challenge provisional decisions, inspect locked/refundable balance.
- **Recipient:** inspect frozen requirements before accepting work, prepare admissible evidence with stable URLs and expected SHA256/content lengths, submit before deadline, watch GenLayer verification, inspect provisional decision, respond/challenge, withdraw earned balance, move to next unlocked stage.
- **Public steward:** without wallet, view programs, source policies, commitment roots, verdict/finality, challenger histories, treasury ledger and verifiable Explorer references. Identify limitations honestly.
- **Independent reviewer:** reproduce one PASS, one FAIL or INCONCLUSIVE, one properly challenged review, one successful payment, a refundable unused budget, and actual receipt chain without relying on UI simulation.

## V1 locked scope

- One designated funder and recipient per program, native GEN only.
- 2–5 sequential milestones; all milestones and budget amounts fixed at creation.
- Total program budget sent atomically in one payable creation call; exact value = sum(tranches). Any extra, missing, zero or invalid funding rejected.
- Per-stage frozen measurable acceptance criteria, authorized evidence sources and source roles, timestamp bounds, correction/challenge windows, prior milestone dependencies.
- Independent semantic evaluation using GenLayer web + model under meaningful validator agreement; stable economic verdict code (QUALIFIED / NOT_QUALIFIED), with typed INCONCLUSIVE/technical failure states.
- Only successful FINAL qualified decisions create an entitlement and unlock next stage.
- Recipient claims earned GEN; funder can recover only truly unearned amounts after a permitted closure condition.
- Challenge can change decision only through frozen policy and independently verified evidence; no authority substitution, no admin vote, no unilateral override.
- Permissionless deadline functions, bounded retries/corrections/challenges and truthful safety around asynchronous GEN delivery.
- Public read-only React application with injected EIP-1193 wallet for writes.

## Explicit non-goals (do not implement)

- Third-party tokens, bridge, DAO, staking, NFTs, trust scores, arbitrary cross-chain functionality, pooled fund management, continuous vesting, lender leverage, back-office backend controlling verdicts, off-chain keeper as canonical source, social analytics, marketplace matching, global indexer.
- External GitHub/GitLab ownership binding or project-level governance (could be separate future integrations). GitHub raw data is one possible authorized evidence source, not inherently authentic evidence of real-world work.
- Universal real-world authorization (the contract only authorizes its own operations and amounts).

## Differentiation table

| | CharterLock | Redeem | ASCENDE |
|---|---|---|---|
| Core input | Frozen event charter | Frozen guarantee | Ordered milestone funding mandate |
| Result | Verifiable event verdict | Guaranteed compensation | New earned funding entitlement and stage authority |
| Funds | No economic custody by design | Guarantee escrow | Entire budget escrow, multi-stage earned release |
| History | Challenge lineage | Outcome/bond history | Non-reinterpreted prior milestone proof dependencies |
| Primary risk | Verdict integrity | Wrong compensation | Premature authority or funds unlock, duplicate payout, funds stuck |

## Acceptance language

**Not:** "AI manages grants and pays developers".

**Instead:** "For each ordered milestone, GenLayer validators independently verify authenticated public evidence against acceptance rules frozen at funding. Only a final decision can vest the predetermined GEN entitlement; later stages cannot open before their prerequisite decision is final. Every release and residual refund is accounted for."

## Reviewer value

Novelty is not proportional to features. Get real substantive semantic review and payout proof. No 5/5 guarantee. A production-quality protocol must prove the non-trivial branch and financial invariant, not just include filenames or mock test counts.
