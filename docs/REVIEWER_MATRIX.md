# Reviewer matrix

Evidence in this matrix is valid only for the repository HEAD and contract address recorded in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). Passing checks do not override the escrow release blockers.

| Review area | Implemented artifact | Evidence | Remaining gap |
|---|---|---|---|
| GenLayer fit | `contracts/ascende.py`, `contracts/ascende.schema.json` | Stable `py-genlayer` dependency, semantic validation and schema generation with GenVM `v0.2.16`; Direct Mode suite | Stable Studionet consensus results apply only to the deployed source hash in the live record. |
| Contract quality | Frozen sequential milestones, exact funding, challenge provenance, strictly ordered deadlines, permissionless expiry, bounded review finalization, authorization ledger | 55 Direct Mode contract tests including idempotent terminal close, evidence-hash, validator-disagreement, challenge lineage and time-boundary checks | Failed payable value and EOA child delivery cannot be safely reconciled; production escrow is blocked. |
| Evidence provenance | HTTPS path-prefix validation, byte length/SHA-256, preserved manifests and decisions | Executed Direct Mode tests; live evidence listed per deployment | Final response URL after redirects is unavailable in the pinned Web Access response; requested authority is not proof of final authority. |
| Engineering / CI | Windows UTF-8 environment, pinned GenVM version, Windows contract job, Ubuntu frontend and Playwright jobs | Local lint, semantic validation, schema, Direct Mode, typecheck, ESLint, Vitest, build and Playwright; Actions success linked in `TESTING.md` | Documentation-only final commit must receive its own green Actions run. |
| Frontend / UX | Next.js wallet state, network switch, provider selection, copy/disconnect, chain reads, finality and pending-transfer wording | Five Playwright tests use a simulated EIP-1193 provider; live GenLayerJS reads and test-wallet writes are separately recorded for the exact deployment | Playwright does not perform wallet-signed live writes. UI observations cannot reconcile transfer outcomes. |
| Stable deployment | Studionet 61999 (`0xF22F`) deployment | Current address, transaction, source SHA, challenge lineage, positive/negative lifecycles and finalized child receipts in `LIVE_VERIFICATION.md` | Child results cannot be reconciled in contract storage; failed payable-call recovery is unsupported. |

**Submission readiness: NOT READY for production-safe escrow.** Redirect-final-authority enforcement and authenticated child delivery/failure recovery are still unsupported. See [SECURITY.md](SECURITY.md) for exact stranded balances and limits. A testnet build may be submitted with this blocker plainly disclosed; it must not be labeled production-ready.
