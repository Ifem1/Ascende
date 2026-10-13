# Security and payment guarantees

## Implemented controls

- The contract holds the entire frozen tranche total before activation; milestones progress in order and only a final qualified milestone earns its fixed tranche.
- Evidence manifest URLs must match frozen HTTPS authority prefixes. Exact response byte length and SHA-256 are checked independently during leader and validator execution. A bad hash/length becomes `SOURCE_UNAVAILABLE`, not a business denial.
- Validator output is restricted to bounded classes and compared by independent execution. VM/consensus errors are allowed to propagate instead of being converted into a verdict.
- Withdrawals, refunds and challenge-bond claims each create a durable `AUTHORIZED` operation that binds a unique ID, destination, amount and purpose. A second write submits that operation once; submitted operations cannot be reauthorized or resent.
- `TRANSFER_SUBMITTED` and `DELIVERY_UNRESOLVED` remain reserved. Delivered counters stay zero because no contract-authenticated EOA delivery callback is available in the implemented interface.

## Remaining risks and release blockers

- Authority prefixes validate the requested URL. Redirect handling and final-response-origin enforcement have not been established; a permitted URL that redirects elsewhere could violate intended provenance.
- Source responses and model interpretation can change or be unavailable between leader and validators. The contract treats technical failure as retryable, but live consensus behavior is unproven.
- A triggered EOA transfer is asynchronous. We have not demonstrated child success/failure, exact recipient credit, or a contract-authenticated failed-transfer recovery path on Studionet. `mark_transfer_unresolved` records uncertainty but does not restore funds or permit a retry.
- Direct Mode does not execute live native EOA child transfers. No deployed contract, live transaction, or recipient balance proof exists.
- Semantic GenVM lint/build validation and remote CI execution remain incomplete. Local typecheck, lint, production build, unit tests, and browser assertions have passed; see [TESTING.md](TESTING.md) for the Windows Playwright shutdown caveat and dependency audit status.

Therefore the code prevents duplicate authorization/submission within the contract state machine, but **does not guarantee lossless delivery or recoverability**. Do not describe it as production-safe escrow until the live boundary and provenance controls are independently established.
