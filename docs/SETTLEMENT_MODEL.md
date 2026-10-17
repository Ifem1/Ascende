# Settlement model

## Principal and challenge bonds

Program principal is accepted exactly once, after the recipient accepts frozen terms. `budget_wei` and each milestone tranche are immutable. Principal transitions among locked, earned/claimable, authorized, submitted/pending, and funder-refund buckets; challenge bonds are tracked separately by their frozen owner and cannot fund principal claims. Permissionless expiry or unresolved-review finalization does not award unearned tranches. Closing a stopped program exposes only unused principal as a funder entitlement. Submitted child transfers consume the authorization once and remain pending or unresolved; no status assertion restores a claim.

The tests assert accounting conservation across these transitions. This is an internal obligation ledger, not proof that contract-held GEN equals recorded principal or that an EOA received a child transfer. Unexpected payable execution failure can strand value before state is recorded. Ambiguous child outcomes cannot be safely resent with the currently authenticated interface.

## EVM contract feasibility

The pinned stable-runtime documentation describes `@gl.evm.contract_interface`, EVM views, EVM external messages, Ghost-originated calls, and GEN held at the Ghost for EVM transfers. Those documented features establish that an EVM integration is part of the platform model; they do not establish Ascende-specific idempotency, child-result authentication, or recoverable transfer behavior.

The environment's read-only probe confirmed chain ID `61999` (`0xf22f`) and a public RPC endpoint. `eth_accounts` returned method-not-found. No Solidity vault was deployed, and this branch has not demonstrated (1) a vault's balance/read interface, (2) a GenVM-originated authenticated deposit or settlement, (3) duplicate operation-key rejection under retries, (4) an authenticated terminal result, and (5) behavior under parent failure or ambiguous child execution. Therefore no vault was added and no claim is made that the platform cannot support one. A future vault requires those stable-runtime tests and a separate review of its caller authorization, idempotency storage, exact-value accounting, reentrancy, and failure semantics before it can replace the current native-transfer path.

## Evidence limits

Multiple source findings and byte citations improve traceability and make criterion-level validator agreement material to a tranche decision. They do not establish independent ownership, truthful publishing, final redirect origin, or semantic correctness. These limitations remain release disclosures in [SECURITY.md](SECURITY.md).
