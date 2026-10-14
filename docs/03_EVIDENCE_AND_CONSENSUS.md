# Evidence authenticity, semantic judgment and consensus

## Frozen source policy

At creation, a milestone freezes 1–4 HTTPS path authorities, 1–3 textual criteria, and a maximum 4-source evidence manifest. Authority matching rejects credentials, query/fragment, percent encoding, path traversal, malformed hosts, non-HTTPS URLs, prefix collisions and unsupported authority fields. A source may be used only once; each required authority must have one matching manifest entry.

Each manifest commits the exact requested URL, positive byte length and SHA-256. Individual source bodies are capped at 64 KiB and aggregate evidence at 128 KiB. Every evaluator independently fetches each URL, requires HTTP 200, checks byte length and digest, and decodes strict UTF-8 before prompting. A mismatch or fetch failure is SOURCE_UNAVAILABLE. SHA-256 proves byte equality, not publisher identity, final origin, factual truth, or whether content supports a criterion.

The pinned Web Access response exposes status and body, but not a final response URL or enforceable no-redirect control. Therefore the contract verifies the requested authority only. Redirect destination authority is not controlled or proven by this implementation.

## Decision packet

Each validator independently obtains and evaluates the frozen bytes. The required model envelope contains the evidence root and exactly one finding per criterion. Every finding has a criterion index, SUPPORTED / CONTRADICTED / INSUFFICIENT classification, and source indices into the frozen manifest. Positive and negative findings require at least one valid source reference; missing, duplicate, extra, or out-of-range fields are malformed.

The contract normalizes the packet, derives the overall result, and compares the complete normalized packet between leader and validator. Any criterion disagreement, source-reference disagreement, or wrong evidence root fails consensus. All criteria SUPPORTED maps to QUALIFIED; any CONTRADICTED maps to NOT_QUALIFIED; otherwise the result is INCONCLUSIVE. Source failure and malformed model output remain separate typed results.

Source text is supplied as untrusted data with explicit prompt-injection instructions. This is mitigation, not an isolation boundary. Validators can share model errors, sources can be compromised or misleading, and source references are not proof that a finding is true. A positive decision must be independently reconstructed from the committed manifest, exact bytes, normalized packet, history, and deterministic contract transition.

## Lineage and retry

Submission and challenge manifests, roots, prior results, each committed review packet, challenge bond outcome, terminal reason, and timestamps are preserved in contract state and append-only history. Challenge review uses the challenged manifest while retaining the original. Fixed retry spacing, maximum attempts, and review grace bound technical and abandoned reviews. If a challenge is unresolved when its grace expires, the bond returns to its challenger; infrastructure failure alone does not forfeit it.

See SECURITY.md for the remaining source-authority and settlement limits, and TESTING.md for the executed adversarial evidence.
