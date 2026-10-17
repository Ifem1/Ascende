# Reviewer matrix

Evidence is valid only for the exact source and deployment identified in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). This working branch has no source-matched deployment. Prior CI and live records are explicitly historical.

| Area | Current implementation | Current evidence | Remaining limitation |
|---|---|---|---|
| GenLayer fit | Deterministic contract transitions, transaction-context time, `run_nondet_unsafe` for independently fetched evidence and validator agreement | GenVM lint, semantic validation, generated schema and Direct Mode suite must be rerun on final HEAD | No live validator decision has been executed against this branch. |
| Contract quality | Draft → recipient acceptance → exact funding; bounded expiry/review; separate principal/bond buckets; immutable one-shot payout operations | Direct Mode invariant and adversarial cases | Unexpected execution failures can still strand payable value; native child delivery cannot be reconciled or safely retried. |
| Evidence provenance | Multiple required HTTPS authorities, per-criterion/per-source findings, exact byte citations, manifest hashes and challenge lineage | Direct Mode checks and frontend validation | Distinct hostnames do not prove distinct ownership; Web Access does not expose enforceable final redirect authority; hashes do not prove truth. |
| Frontend | Injected EIP-1193 wallet, multi-authority creation/evidence, accept/fund actions, capability-driven settlement states | Unit and simulated-provider browser tests | No genuine wallet transaction has been made against a deployment of this source; production alias is unchanged. |
| EVM settlement vault | Not implemented | Official platform documentation describes EVM interfaces/messages; local read-only RPC probing did not demonstrate a full deploy → GenVM message → idempotent view/write settlement path | Capability is unverified end-to-end. Do not claim that a vault solves delivery without the live proof and security review. |
| Engineering | Windows UTF-8 CI, pinned CLI/GenVM/linter and frontend lockfile | Exact final-HEAD GitHub Actions result is pending | A passing earlier run does not verify this branch. |

**Readiness: NOT READY for submission as a source-matched live release; NOT READY for production-safe escrow.** Local tests can establish implementation behavior but do not replace fresh stable deployment, live consensus, and source-matched transaction evidence. No reviewer score is claimed.
