# 08 — Release, documentation and steward signoff

## Current release record

Source commit `edfe1da1634abeb92ec091e562838b64093df3a9` is deployed to Studionet 61999 at `0x03b3525C550E5281747E686b87d19aDbD5f4F10b`, with source SHA-256 `FA411EDC689686D2E793508D38D6C20E39996E264325632A367B018CC74CC930` and deployment transaction `0x2e609aa4f01eee4ec9118e7586932f1365eecd021326507d2c607f9f59de0f4f`. Actions run `38467395487` passed. Live evidence: [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). **Steward verdict remains NOT READY for production-safe escrow** because failed payable recovery, child-transfer reconciliation, and final redirect authority are unsupported.

## Network

Stable Studionet **61999 (`0xF22F`)** only, RPC `https://studio.genlayer.com/api`, explorer `https://explorer-studio.genlayer.com`. Studio-dev 61997 is an unrelated preview chain. Use repository-local verified CLI (candidate 0.39.1) after preflight. Final deployment address must be discovered and documented from real receipt, NEVER guessed.

## Deployment prerequisites

1. Source freeze with `SHA-256(contracts/ascende.py)`, Git commit, clean worktree and actual generated ABI/schema.
2. Build/lint/semantic lint/preflight green. If unavailable tool, disclose exact error; no misleading "all green".
3. Direct Mode positive/negative tests, adversarial monetary tests, mutation evidence, frontend unit/E2E, schema parity, unknown statuses fail closed.
4. Money-delivery architecture independently signed off with actual child transfer behavior and safe recovery semantics, or explicit BLOCKED. No "we'll reconcile later".
5. Deploy to chain 61999 using controlled permitted wallet. Record deploy hash, finalized consensus and execution success, source hash/parity to HEAD.
6. Update NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS and redeploy Vercel only after address exists; check production JS configuration really points to final address.
7. Execute live economic runbook; save exact hashes, source commits, recipient amounts, initial/final accounting.
8. Freeze protocol after positive live result. Docs-only cleanup does not require redeployment if contract source unchanged.

## Files required for submission

- `README.md`: short value proposition, actual status, deployed address/commit/hash, how it works, why GenLayer, evidence model, challenge and liveness, funds and trust boundaries, realistic test counts, known limits, quickstart.
- `docs/DEPLOYMENT.md`: network, source SHA, exact address and deployment hash, pinned toolchain and contract parity.
- `docs/LIVE_VERIFICATION.md`: actual two-source semantic outcomes, progress/unlock, payment child transaction and recipient credit, refusal/recovery, challenge and accounting; all source-address parity.
- `docs/SECURITY.md`: concrete threat model + residual risk + attempted adversarial tests.
- `docs/TESTING.md`: honest test count by real execution mode; CI links, no inflated "Direct Mode" counts.
- `docs/REVIEWER_MATRIX.md`: feature→actual contract source location→unit/DirectMode/live evidence. Label unproven distinctly.
- `docs/USER_GUIDE.md`: correct portal how-to with actual wallet/network/GEN values, no free-text fictitious outcomes.
- `.env.example` and real commands; frontend should not show blank screen with default mocks.

## Reviewer acceptance path

Public page without wallet → browse current live programs → inspect frozen acceptance criteria / evidence authorities → inspect real adjudication/provisional → challenge lineage → verify final earned entitlement → inspect withdrawal and child recipient credit → check program conservation, unused refund and canonical source/deployment.

## Honest release status

`PASS` only when ALL critical gates pass. If contract passes but live child transfer cannot be safely reconciled, say `NOT READY — MONEY DELIVERY BLOCKED`. Frontend green ≠ contract live. A single demo with fake evidence ≠ credible real-world milestones. Report partial proof accurately.

## Portal positioning

Primary tag choice after implementation: likely `DeFi`/`Governance` (milestone capital approvals) depending on actual tag list; optional evidence evaluation topic. One-liner: `Capital unlocks only when GenLayer validators verify frozen milestone requirements against authenticated evidence.` Never promise score or boast about outscores until actual steward verdict.
