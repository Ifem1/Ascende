# Live Studionet verification

**Current candidate:** stable Studionet (chain 61999 / `0xF22F`). This is test evidence, not production approval.

## Current release candidate

- Contract: `0xb47Cc771D53846246016D78D39e59AAC0884D827`
- Deployment transaction: [`0xbabe65aade68a23989009ce95a9106181512f9d396458103c5141da38f3e3a29`](https://explorer-studio.genlayer.com/tx/0xbabe65aade68a23989009ce95a9106181512f9d396458103c5141da38f3e3a29)
- Source SHA-256: `8BFD9B82A65458D2CFC11499E10681A83E283EDC355BB88F389697F884E665CC`; fetched deployed code hashes identically.
- Deployment receipt: `ACCEPTED`, `MAJORITY_AGREE` (3 agree, 2 idle); deployer `0xD6423aE82a975d55C6CeaC222827A727325e0459`.
- A fresh `get_program_counter` read returned `0` before any release-candidate test lifecycle.
- Live positive/challenge/refund cycles: **pending**. They must use only this contract address and immutable test fixtures committed in the canonical release.
- Frontend production build was configured for this address. A browser read returned the live empty registry (`No programs found`), matching `get_program_counter=0`.

Do not cite the historical receipts below as evidence for the current source or address.

## Historical deployment (superseded)

The following results belong only to the older address and source hash. They are retained to explain the known unrecoverable residues and must not be treated as proof of the current release.

**Completed on the stable Studionet test network (chain 61999 / `0xF22F`).** Four programs were exercised with supplied unlocked test wallets and 0.24 GEN in program escrow, plus challenge bonds and one failed 0.06 GEN creation attempt. No private key is included here.

## Deployment

- Current contract: `0x1cC1130daeA4a26f0be748063a903d254b4CCe96`
- Deployment transaction: [`0x969eabe52cdf1d74ac2a0316dfe873de637e769bc1900a9b90ac7464482bfce9`](https://explorer-studio.genlayer.com/tx/0x969eabe52cdf1d74ac2a0316dfe873de637e769bc1900a9b90ac7464482bfce9)
- Deployed `contracts/ascende.py` SHA-256: `ED7F0DDC734554A2D5F1727B5372B2DB636D418247C5F25FBAB31916879B9D17`
- The deployed validator accepts versioned package paths containing `@` while rejecting user-info in the host. Contract tests and `genvm-lint` passed after this fix.
- The local frontend was built with `NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS` set to this address and exercised at `http://127.0.0.1:3102`. The Programs registry and Treasury dashboard read the live deployment.

## End-to-end records

**Program 1 — sequential success.** Created with 0.06 GEN split into 0.02 / 0.04 GEN. Both pinned-source evaluations qualified, both challenge periods elapsed, each milestone finalized, and the program closed successfully. The recipient requested and received the full 0.06 GEN. Parent payment `0x487eb6e54b958c5f48113d49c22cb22c7b50e08dbbe2982e21dde7a219ae9449`; finalized child credit `0xf9a20bcf329806adc748c6bfb61e81953ced38820d19aa7c3538728d4509062c`.

**Program 2 — denial and refund.** A source-backed criterion failure finalized as not qualified and the program closed stopped. The funder received the full 0.06 GEN refund; child `0x5c153ef1f0f9819b7d6fc732bcca4328c3640546f47a46ac77483e722e2b8994` finalized with `value_credited=true`. A challenge was submitted only after its allowed window had closed and failed; its attached 0.0001 GEN was credited to the contract and remains there. The program's bond ledger did not recognize that failed-call value.

**Program 3 — unresolved source and refund.** One required evidence mirror was unavailable to validators, so evaluation returned `SOURCE_UNAVAILABLE` / `RETRYABLE`, not a business denial. After its retry grace expired, the milestone finalized as `FINAL_UNRESOLVED`; the program closed stopped and the funder received the full 0.06 GEN refund. Child `0x689188e0860758369219b1efaa1052e77bf980e823bff6e2a914ad4df020fd3f` finalized with `value_credited=true`. A challenge call during the retryable state failed and left a second 0.0001 GEN unaccounted for in the contract.

**Program 4 — challenge and bond allocation.** A separate pinned source independently confirmed the not-qualified result; challenge resolution retained that result and allocated the 0.0001 GEN bond to the recipient. After the challenge window, the milestone finalized not qualified, the program closed stopped, the funder received its 0.06 GEN refund (child `0x1ffdab8a74fc0c9d6a4e3939dcf83a440952f429b918929795d3b5d53db40e8f`), and the recipient received the challenge bond (child `0xe393aba519d5993690d76e28e3ea6c7ed9b5230dd376732fc942b9c64e17928d`). Both child records finalized with `value_credited=true`.

## Balances and accounting at the end of the run

- Funder test wallet: `0x39680bd423437C0Eaa18493629652821Ec672C61`; balance `954.099109999999999788 GEN`.
- Recipient test wallet: `0xD6423aE82a975d55C6CeaC222827A727325e0459`; balance `972.971489999999999998 GEN`.
- Current contract balance: `0.0002 GEN` (two failed 0.0001 GEN challenge calls).
- Current contract's obligation ledger: 0.24 GEN funded, 0 locked, 0.06 GEN recipient transfer pending, 0.18 GEN funder refund pending, and 0.0001 GEN bond transfer pending. Those pending entries correspond to finalized child transfers with `value_credited=true`; the contract has no authenticated child-delivery callback, so its on-chain accounting intentionally remains pending and the UI reports it that way.
- An earlier deployment at `0xB8c2965026223a39d78f3834FBe0646cB3747C21` rejected a valid versioned source URL before the parser fix. The failed creation credited 0.06 GEN to that old contract, with no program record or recovery path. That amount is stranded on the old test deployment.

## Frontend and verification

The live Programs registry lists all four on-chain programs and their finalized statuses. The live Treasury view displays the pending child transfers separately from confirmed contract accounting; it does not label an externally verified child credit as reconciled or paid. The browser currently has the Treasury dashboard open at `http://127.0.0.1:3102/treasury`.

Validated locally: 29 contract tests, `genvm-lint lint contracts/ascende.py`, frontend typecheck/lint, 4 unit tests, all 4 browser E2E cases, and a production frontend build with the deployed contract address. The live cycle was signed by the supplied test wallets through the local SDK script; frontend live reads were verified in the browser.

## Remaining production requirement

The app and contract correctly preserve `TRANSFER_SUBMITTED` / pending state, but they cannot reconcile an external child transfer back into contract storage. Failed payable calls also demonstrated that attached value may remain at the contract after execution error. The old deployment's 0.06 GEN and the current deployment's 0.0002 GEN are unrecoverable with the deployed interfaces. Do not reuse this settlement design for real funds until a separately reviewed settlement/reconciliation design closes this gap. See [payment safety](04_TREASURY_AND_PAYMENT_SAFETY.md) and [the live runbook](09_LIVE_RUNBOOK.md).
