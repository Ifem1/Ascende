# Live Studionet verification

**Current candidate:** stable Studionet (chain 61999 / `0xF22F`). This is test evidence, not production approval.

## Current release candidate

- Contract: `0x03b3525C550E5281747E686b87d19aDbD5f4F10b`
- Deployment transaction: [`0x2e609aa4f01eee4ec9118e7586932f1365eecd021326507d2c607f9f59de0f4f`](https://explorer-studio.genlayer.com/tx/0x2e609aa4f01eee4ec9118e7586932f1365eecd021326507d2c607f9f59de0f4f)
- Source commit: `edfe1da1634abeb92ec091e562838b64093df3a9`; SHA-256 `FA411EDC689686D2E793508D38D6C20E39996E264325632A367B018CC74CC930`. Direct `gen_getContractCode` retrieval produced the identical digest.
- Deployment receipt: `ACCEPTED`, `MAJORITY_AGREE` (5 agree); deployer `0xD6423aE82a975d55C6CeaC222827A727325e0459`.
- The contract counter was `0` before tests. The immutable fixtures below are pinned to source commit `edfe1da` and each request was re-fetched by validators against its committed byte length and digest.
- A local Next.js production build configured with this address used the frontend's GenLayerJS read path and returned two live records: Program 1 `CLOSED_SUCCESS` with two `FINAL_QUALIFIED` milestones, Program 2 `CLOSED_STOPPED` with a `FINAL_NOT_QUALIFIED` first milestone. Program counter: `2`.
- Production frontend: [ascende-sand.vercel.app](https://ascende-sand.vercel.app/), current Vercel Production alias. Its public build settings contain the same contract address and Studionet RPC. A public browser load verified the live home page and both canonical program links; direct Playwright navigation from the sandbox was blocked by its `ERR_NETWORK_ACCESS_DENIED` firewall, while the five local/CI E2E scenarios pass using a simulated wallet provider.

### Positive lifecycle and challenge provenance

Program 1 (`0.01 GEN` principal; `0.0001 GEN` bond), funder `0xD6423aE82a975d55C6CeaC222827A727325e0459`, recipient `0x39680bd423437C0Eaa18493629652821Ec672C61`:

- Create: `0x56172c673ef86f81a8283ca1cc5429ca28052f8c47a24a3d734ee0695f062152`; evidence seal: `0x7ba146f958d3e093f5d9beea72cf030aee7d9e8195d0501c1e0ee632636fb866`; first evaluation: `0x1a394b2f4d0d19609c06c5d66563ea2d8ef41235871ce18980f109e97fc7544c` => `QUALIFIED`.
- Submission evidence root: `395058873369eea4e5745e82c38403c7fef8a157d269de84bf07f40f00d9c3f1`, manifest SHA-256 `0e45e4eb26ae0b8ace69198cda82e23b9ba71c8d72259aed0d76ea633c333e67`, length 268 bytes, URL [`qualified.md`](https://raw.githubusercontent.com/Ifem1/Ascende/edfe1da/tests/live-evidence/qualified.md).
- Challenge: `0x99ddf32f3ac487ac5925d88e93f73e2c2cb3878363a9c130c768aea8af95254d`; resolution: `0xe0a2dee1aa28b7e5f6944489cf28af7ff2a2e6a7a1d529e573f5b3ea24e72ed7` => `QUALIFIED`, `flipped=false`; challenge manifest SHA-256 `085fff5a92ad9622ad090f293825eb8b2d0b49913ce38638634fc914eb3dd513`, length 323 bytes, URL [`qualified-challenge.md`](https://raw.githubusercontent.com/Ifem1/Ascende/edfe1da/tests/live-evidence/qualified-challenge.md). The stored challenge record retains both manifests/roots, previous result, challenger, bond owner, resolution and decision IDs.
- First finalization: `0x4b4ac9a96797b6c6e073d3888598558e64efde3915b004ce62b7f5a28448d116`; second evidence evaluation: `0x20ef7a2dd5d8b42fd87efcb92be8c15e36e6719954c00f2d27e614f195ee10c` => `QUALIFIED`; second finalization: `0xbcea1919d66a3a36e0ac8313d2e9bb730b593fc49c60a9954d1fc79fdfa6ff2c`; explicit idempotent close: `0xc394692d35f1b4c1354c1b124fac5eaff294f31793d322cae124609e3e71da00` => `CLOSED_SUCCESS`.
- Earned payment authorization: `0xdf94c0028e6fb0a7c72cb509245a2b13c17f38fff220fd855889122d8ed8bdc3`; submit parent: `0x2bb1ec0efd80d7300849dc529d1a27692fa6649b0267425633ea956d3afc63e5`; child receipt: [`0x79a94e6a130b2a8f7594f8691c93885189571b8c98d9171df68b93c83e13edc2`](https://explorer-studio.genlayer.com/tx/0x79a94e6a130b2a8f7594f8691c93885189571b8c98d9171df68b93c83e13edc2), finalized, value `0.01 GEN`, recipient matches, `value_credited=true`.
- Challenge-bond authorization: `0x03c01e1f3dabd4033189496575965ba6e8a63bd6b3878d4132f0cff591e61568`; submit parent: `0xf03b1c4525f5bae447d2756ed7e9731475edfcdfd225c795bb8c02a023e8583a`; child receipt: [`0xeff0c07014c61cdefd0936ea35da71e684db7675dde273daca3dd39ccb141396`](https://explorer-studio.genlayer.com/tx/0xeff0c07014c61cdefd0936ea35da71e684db7675dde273daca3dd39ccb141396), finalized, value `0.0001 GEN`, recipient matches, `value_credited=true`.

### Negative lifecycle and refund

Program 2 (`0.01 GEN` principal), same test parties:

- Create: `0x7960e1d4db48f4495026af72e79d0c776f94028feb39d7006ba78eb95b192c03`; evidence seal: `0x6b7598e94bad2327bce0b1a8ed5f125c2cd69e51a1358291e966fa0eed94e55a`; evaluation: `0xaebf667fd94e673cc8e9f1d8653a245920d9a84a08d67adc0118c74aeaf54165` => `NOT_QUALIFIED`. Evidence SHA-256 `48d8741597db84d6a2ee3bacf1084cc46bb0417d1dca12d2a339edeca2dee1ab`, length 433 bytes, URL [`not-qualified.md`](https://raw.githubusercontent.com/Ifem1/Ascende/edfe1da/tests/live-evidence/not-qualified.md).
- Finalization: `0xb0120315562d78162aedf027ac40402758fb4454c32620a395a00dd2f2c4ad32`; close: `0x8c60a5ff7d16dfeca43293ec42581ec90b2012b8dd63b73df6a48dce1b3b1212` => `CLOSED_STOPPED`.
- Refund authorization: `0xae0830cf16597c91a701be6b2994be8ac50349fbf9d21a0f2bf5e5849bcdee0a`; submit parent: `0xcf94ae6f62fb4ec889f34897b32ab31e9a319ab409daef9cb317ebf613fd93d7`; child receipt: [`0xc1573bd5baf5a9c078260af4b120c9bcd439b1ac81f710b1697180560d668fc0`](https://explorer-studio.genlayer.com/tx/0xc1573bd5baf5a9c078260af4b120c9bcd439b1ac81f710b1697180560d668fc0), finalized, value `0.01 GEN`, funder matches, `value_credited=true`.

The contract’s post-cycle accounting intentionally still shows `0.01 GEN` recipient transfer pending, `0.0001 GEN` bond pending, and `0.01 GEN` funder refund pending, even though each child receipt says `value_credited=true`. There is no authenticated on-chain child callback to reconcile them. These are live test receipts, not a claim of production-safe settlement.

Do not cite receipts from the superseded deployments below as proof of this source or address.

## Historical deployment (superseded)

The following results belong only to the older address and source hash. They are retained to explain the known unrecoverable residues and must not be treated as proof of the current release.

### Prior diagnostic deployment: `0xb47Cc771D53846246016D78D39e59AAC0884D827`

This deployment used source SHA-256 `8BFD9B82A65458D2CFC11499E10681A83E283EDC355BB88F389697F884E665CC` and transaction [`0xbabe65aade68a23989009ce95a9106181512f9d396458103c5141da38f3e3a29`](https://explorer-studio.genlayer.com/tx/0xbabe65aade68a23989009ce95a9106181512f9d396458103c5141da38f3e3a29). A live positive program exposed that the last qualified milestone auto-closed its program, while an explicit subsequent `close_program` incorrectly failed. That defect is fixed in the current source and covered by an idempotency regression test.

The diagnostic program's principal and challenge bond were then withdrawn exactly once. Child receipts [`0x980005a72613f826d9bc0668150b6887d846bdab1dd88f85c2ccd26ea257e90c`](https://explorer-studio.genlayer.com/tx/0x980005a72613f826d9bc0668150b6887d846bdab1dd88f85c2ccd26ea257e90c) (0.01 GEN) and [`0x9deff281d4048a6f8b9a809bdcbf5faf9f8f228c1e52114d327ad326ba5e1857`](https://explorer-studio.genlayer.com/tx/0x9deff281d4048a6f8b9a809bdcbf5faf9f8f228c1e52114d327ad326ba5e1857) (0.0001 GEN) both finalized with `value_credited=true`. Its on-chain ledger remains `TRANSFER_SUBMITTED` because the contract cannot authenticate child results. This deployment is superseded and its receipts are not used above as proof of the current source.

### Earlier deployment: `0x1cC1130daeA4a26f0be748063a903d254b4CCe96`

**Completed on the stable Studionet test network (chain 61999 / `0xF22F`).** Four programs were exercised with supplied unlocked test wallets and 0.24 GEN in program escrow, plus challenge bonds and one failed 0.06 GEN creation attempt. No private key is included here.

## Deployment

- Contract: `0x1cC1130daeA4a26f0be748063a903d254b4CCe96` (superseded)
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
- End-of-run contract balance on this superseded address: `0.0002 GEN` (two failed 0.0001 GEN challenge calls).
- This deployment's obligation ledger: 0.24 GEN funded, 0 locked, 0.06 GEN recipient transfer pending, 0.18 GEN funder refund pending, and 0.0001 GEN bond transfer pending. Those pending entries correspond to finalized child transfers with `value_credited=true`; the contract has no authenticated child-delivery callback, so its on-chain accounting intentionally remains pending and the UI reports it that way.
- An earlier deployment at `0xB8c2965026223a39d78f3834FBe0646cB3747C21` rejected a valid versioned source URL before the parser fix. The failed creation credited 0.06 GEN to that old contract, with no program record or recovery path. That amount is stranded on the old test deployment.

## Frontend and verification

The live Programs registry lists all four on-chain programs and their finalized statuses. The live Treasury view displays the pending child transfers separately from confirmed contract accounting; it does not label an externally verified child credit as reconciled or paid. The browser currently has the Treasury dashboard open at `http://127.0.0.1:3102/treasury`.

Validated locally: 29 contract tests, `genvm-lint lint contracts/ascende.py`, frontend typecheck/lint, 4 unit tests, all 4 browser E2E cases, and a production frontend build with the deployed contract address. The live cycle was signed by the supplied test wallets through the local SDK script; frontend live reads were verified in the browser.

## Remaining production requirement

The app and contract preserve `TRANSFER_SUBMITTED` / pending state, but they cannot reconcile an external child transfer back into contract storage. Failed payable calls also demonstrated that attached value may remain at the contract after execution error. The earlier 0.06 GEN and 0.0002 GEN failed-call surpluses are unrecoverable through their old deployed interfaces. Do not use this settlement design for real funds until a separately reviewed settlement/reconciliation design closes this gap. See [payment safety](04_TREASURY_AND_PAYMENT_SAFETY.md) and [the live runbook](09_LIVE_RUNBOOK.md).
