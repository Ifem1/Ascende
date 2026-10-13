# 03 — Evidence authenticity, semantic judgment and consensus LOCK

## Strong GenLayer necessity

Traditional escrow can check bits, signatures, oracle numerics and deadlines; it cannot independently determine whether a documented real-world software, service or delivery milestone *substantively* meets written acceptance criteria. ASCENDE freezes the meaning and authorized evidence before work starts, then validators independently fetch and interpret the admissible evidence. Only the agreed classification crosses the deterministic economic boundary.

## Source authority and authenticity

At program creation freeze at most 4 source authorities per milestone (default 1–3), each with role (PRIMARY / CORROBORATING / OFFICIAL when grounded), strict hostname + allowed path prefix, required flag and credible relevance to each criterion. Reject credentials in URL, non-HTTPS, fragments, control chars, path confusion, userinfo, unexpectedly aliased domains, malformed encodings, redirects outside authorization and oversized content. SSRF, DNS rebinds and redirect rules must follow actual GenLayer runtime capabilities; if hostname binding cannot be verified in a particular provider, fail closed rather than overclaim.

Recipient submission references **pre-authorized** HTTPS endpoints with SHA-256 of exact bytes, expected byte length, timestamps and optional version/commit identity. Contract enforces immutable manifest root. Validator fetches and verifies the *content bytes* match the commitment, source binding and fixed bounds. Never claim SHA of a URL proves publisher authenticity; separate official source role from arbitrary user-hosted content. Timestamp embedded in a file is not an independent trusted timestamp.

Authoritative evidence must be suitable for objective checking. Test-fixture JSON included in this package is fictional and only for deterministic tests, not real-world delivery proof. Live positive and negative business cases should be grounded in truthful, independent sources or explicitly labeled controlled demonstrations and should not be presented as real-world product performance.

## Judgment policy

Criteria specify 1–3 explicit textual acceptance clauses per milestone, with exclusion(s), time bounds and permitted evidence classes. Model decides if the *evidence supports* the clauses, not whether a claim sounds plausible. Capture source omissions as technical/inconclusive; NEVER transform 404, transport failure or model invalidity into economic NOT_QUALIFIED.

Decision-bearing output is one bounded **scalar classification** (after security preflight):

- `QUALIFIED` — all frozen acceptance requirements materially satisfied based on authenticated evidence.
- `NOT_QUALIFIED` — authenticated sufficient evidence establishes a requirement failed; absence of evidence alone does not prove this.
- `INCONCLUSIVE` — authenticated evidence is insufficient, contradictory or ambiguous.
- `SOURCE_UNAVAILABLE` — required authorized evidence inaccessible or integrity check failed; use typed reason alongside where possible.
- `MODEL_OUTPUT_INVALID` — model returned a non-allowed token or call format invalid.

The model can only return classification; it must not return payout amounts, bps, authorization flags, addresses, URLs or altered rules. A deterministic manifest records `program_id,index,source_root,attempt,generation,token,time,typed_failure` and a bounded factual note; do not claim a fabricated AI rationale if none is stored.

## Validator equivalence

`gl.vm.run_nondet_unsafe` official API; inside the nondet block each validator independently retrieves validated source(s) and classifies evidence using `gl.nondet.exec_prompt`. Both leader and validator return a canonical **string**, not a dict against a string. `validator()` first checks `isinstance(leader_result, gl.vm.Return)`, recomputes independently, then compares permitted scalar label exactly; reject mismatched labels or invalid results. Pin and inspect SDK so `leader_result.calldata` type is confirmed before deployment.

A model returning a valid `QUALIFIED` label is not sufficient if source policy failed. Authority, digest, length and required-source checks must be performed and applied to the allowed verdict. Different models must not agree to an unsafe payout based on a missing required source. Keep output validation outside of untrusted prose parsing.

A custom validator is only meaningful if it **independently** obtains the evidence and evaluates the same frozen question. Validators checking only output shape or echoing the leader's label are insufficient and should be rejected in CI.

## Consensus failure and retry

`Undetermined` may leave state uncommitted. It is **not** a successful business verdict even if network transaction status is FINALIZED. No challenge without PROVISIONAL. Retrying must not create unbounded costs/semantic-shopping: cap attempts and time, freeze input snapshot for each round, record every committed attempt and use explicit final recovery. Don't treat consensus acceptance as execution success; require successful GenVM execution and post-state readback. No final false positive or false negative from type coercion or hidden catch-all errors.

## Conflict / procedural challenge

Provisional result challenge can include an admissible, pre-authorized already-committed source snapshot or evidence of procedure violation. Allow a bounded latest snapshot only within the frozen permitted submission/correction policy; require new evidence materially different from prior root. On same snapshot, a rerun may resolve a disagreement but it must not silently substitute a different question or new source. Log lineage, predecessor and generation; no unlimited appeal.

## Example consensus invariants

- LEADER QUALIFIED, VALIDATOR QUALIFIED with same authoritative snapshot => agree.
- LEADER QUALIFIED, VALIDATOR NOT_QUALIFIED => disagree, do not unlock.
- LEADER QUALIFIED, VALIDATOR SOURCE_UNAVAILABLE => disagree, fail closed.
- LEADER MODEL_OUTPUT_INVALID => no economic qualification.
- Any digest/authority violation => no business qualification, even if a model claims QUALIFIED.
- Previous FINAL_QUALIFIED stays historical FINAL; stage N+1 may depend on it but not rewrite it.

## Required proof

Direct Mode lead/validator mocks, positive/negative and disagreement tests, hostile prompt injection, missing/changed source, digest collision-resistant binding, and at least one live agreed verdict that creates a provisional milestone before any funding release.
