# Evidence authenticity, semantic judgment and consensus

## Frozen source policy

At creation, each milestone freezes 2–4 required HTTPS path authorities on distinct hostnames, 1–3 textual criteria, and a maximum 4-source evidence manifest. Same-host aliases are rejected. This is domain separation only: the contract cannot prove distinct ownership, governance, data origin, or institutional independence. Authority matching rejects credentials, query/fragment, percent encoding, path traversal, malformed hosts, non-HTTPS URLs, prefix collisions and unsupported authority fields. A source may be used only once; each required authority must have one matching manifest entry. The frontend collects one URL, SHA-256 and exact byte length for each required authority for both submissions and challenges.

Each manifest commits the exact requested URL, positive byte length and SHA-256. Individual source bodies are capped at 64 KiB and aggregate evidence at 128 KiB. Every evaluator independently fetches each URL, requires HTTP 200, checks byte length and digest, and decodes strict UTF-8 before prompting. A mismatch or fetch failure is SOURCE_UNAVAILABLE. SHA-256 proves byte equality, not publisher identity, final origin, factual truth, or whether content supports a criterion.

The pinned Web Access response exposes status and body, but not a final response URL or enforceable no-redirect control. Therefore the contract verifies the requested authority only. Redirect destination authority is not controlled or proven by this implementation.

## Decision packet

Each validator independently obtains and evaluates the frozen bytes. The required model envelope contains the evidence root and exactly one finding per criterion. Every criterion finding contains an overall SUPPORTED / CONTRADICTED / INSUFFICIENT result plus one source-level finding per cited source. A positive criterion requires at least two required, distinct-host sources to support it and no cited contradiction; a negative criterion requires at least two to contradict it and no cited support. Mixed support and contradiction is INSUFFICIENT. Malformed, duplicate, missing, extra, or out-of-range findings are rejected.

The contract normalizes the packet, derives and checks each criterion and overall result, and compares the evidence root, each criterion result, and exact source-level findings between leader and validator. Every source reference resolves to the frozen manifest and its exact bytes. A validator that reaches the same outcome using different source-level findings disagrees and cannot authorize a transition. All criteria SUPPORTED maps to QUALIFIED; any criterion CONTRADICTED maps to NOT_QUALIFIED; mixed or insufficient evidence maps to INCONCLUSIVE. Source failure and malformed model output remain separate typed results. This makes independent validator review decision-critical: a leader result alone cannot vest a tranche, and provenance disagreement prevents consensus.

Source text is supplied as untrusted data with explicit prompt-injection instructions. This is mitigation, not an isolation boundary. Validators can share model errors, sources can be compromised or misleading, and source references are not proof that a finding is true. A positive decision must be independently reconstructed from the committed manifest, exact bytes, normalized packet, history, and deterministic contract transition.

## Lineage and retry

Submission and challenge manifests, roots, prior results, each committed review packet, challenge bond outcome, terminal reason, and timestamps are preserved in contract state and append-only history. Challenge review uses the challenged manifest while retaining the original. Fixed retry spacing, maximum attempts, and review grace bound technical and abandoned reviews. If a challenge is unresolved when its grace expires, the bond returns to its challenger; infrastructure failure alone does not forfeit it.

See SECURITY.md for the remaining source-authority and settlement limits, and TESTING.md for the executed adversarial evidence.
