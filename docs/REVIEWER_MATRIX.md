# Reviewer matrix

Evidence in this matrix is valid only for the repository HEAD and contract address recorded in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). Passing checks do not override the escrow release blockers.

| Review area | Implemented artifact | Evidence | Remaining gap |
|---|---|---|---|
| GenLayer fit | `contracts/ascende.py`, `contracts/ascende.schema.json` | Stable `py-genlayer` dependency, semantic validation and schema generation with GenVM `v0.2.16`; Direct Mode suite | Stable Studionet consensus results apply only to the deployed source hash in the live record. |
| Contract quality | Frozen sequential milestones, exact funding, challenge provenance, bounded retry/finalization, authorization ledger | 34 Direct Mode contract tests including evidence-hash, validator-disagreement, challenge lineage and time-boundary checks | Failed payable value and EOA child delivery cannot be safely reconciled; production escrow is blocked. |
| Evidence provenance | HTTPS path-prefix validation, byte length/SHA-256, preserved manifests and decisions | Executed Direct Mode tests; live evidence listed per deployment | Final response URL after redirects is unavailable in the pinned Web Access response; requested authority is not proof of final authority. |
| Engineering / CI | Windows UTF-8 environment, pinned GenVM version, Windows contract job, Ubuntu frontend and Playwright jobs | Local lint, semantic validation, schema, Direct Mode, typecheck, ESLint, Vitest, build and Playwright results recorded in `TESTING.md` | Remote Actions result must be green for the canonical commit; link is in `TESTING.md` after push. |
| Frontend / UX | Next.js wallet state, network switch, provider selection, copy/disconnect, chain reads, finality and pending-transfer wording | E2E wallet flow plus production-browser tests; current live read evidence | UI observations cannot reconcile transfer outcomes; live signed write evidence is specific to the exact deployed address. |
| Stable deployment | Studionet 61999 (`0xF22F`) deployment | Address, transaction, source SHA and live receipts in `LIVE_VERIFICATION.md` | Each contract source change requires a new deployment. Earlier deployment evidence never proves the corrected source. |

**Submission readiness: NOT READY for production-safe escrow.** Redirect-final-authority enforcement and authenticated child delivery/failure recovery are still unsupported. See [SECURITY.md](SECURITY.md) for exact stranded balances and limits. A testnet build may be submitted with this blocker plainly disclosed; it must not be labeled production-ready.
