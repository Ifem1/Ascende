# Live Studionet verification

Stable Studionet (chain 61999 / `0xF22F`). This is test evidence, not production approval.

## Release source status

The current working branch is deployed at `0x5715eACA23d495b71E800Dd9eD6e13875855bd9c`; deployment and normalized source-byte parity are recorded in [DEPLOYMENT.md](DEPLOYMENT.md). A fresh create attempt finalized but did not create a program (`get_program_counter() == 0`, `get_program(1) == ""`, `value_credited == false`); therefore no positive, challenge, funding, expiry, or settlement lifecycle is proven on this deployment. The production alias remains intentionally unchanged and points to the previous release. All receipts in the historical sections below remain historical.

## Current branch deployment — 2026-10-17

- Deployment transaction: [`0x3c36b8b0391e9a5a1c6447e0108c84501d235f89a9f989c57eae02bf9b3a380e`](https://explorer-studio.genlayer.com/tx/0x3c36b8b0391e9a5a1c6447e0108c84501d235f89a9f989c57eae02bf9b3a380e), finalized `SUCCESS`, `MAJORITY_AGREE`.
- Contract: `0x5715eACA23d495b71E800Dd9eD6e13875855bd9c`, stable Studionet 61999.
- Fresh unsuccessful create attempt: [`0x44e9682ddd0e76283dd2348d1437843708e53a1c5772c4dad106af9d3f7b626a`](https://explorer-studio.genlayer.com/tx/0x44e9682ddd0e76283dd2348d1437843708e53a1c5772c4dad106af9d3f7b626a). It finalized with `MAJORITY_AGREE`, but the contract counter stayed at `0`; `get_program(1)` was empty. The receipt states `value_credited=false`. It is recorded as a failed attempt, not a successful creation or lifecycle receipt.
- No real-wallet frontend transaction was performed against the current branch. Production Vercel was not changed.

## Historical source deployment — 2026-10-17 (superseded)

All details in this subsection, including the Vercel deployment reference, describe that previous release only. They are not current branch deployment evidence.

- Repository commit: [`fccac05730c95d68f5759c89f9e689c0d76165b5`](https://github.com/Ifem1/Ascende/commit/fccac05730c95d68f5759c89f9e689c0d76165b5).
- Stable Studionet chain ID `61999` (`0xF22F`), RPC `https://studio.genlayer.com/api`.
- Contract: `0x2c7a6260f2958C0Bd6634182E9978d209F0a06aD`.
- Deployment transaction: [`0x03bc674baea5c6915ce840a20c6d17072171805d410b9e7bf968bbad0177be01`](https://explorer-studio.genlayer.com/tx/0x03bc674baea5c6915ce840a20c6d17072171805d410b9e7bf968bbad0177be01), finalized, execution `SUCCESS`, result `MAJORITY_AGREE`; five validators revealed and three agreed.
- Source SHA-256: `A811544EB159A7745545DCC87D5F1258FEACB6352CEC6B10A8DDCBBFD9375D09`. The public `genlayer code` readback matches the committed source bytes after line-ending normalization; the CLI adds two trailing display newlines. Deployed API schema matches the generated checked-in schema.
- Deployer: supplied test wallet `0xD6423aE82a975d55C6CeaC222827A727325e0459`. Initial authoritative `get_program_counter()` readback was `0`.
- No new program, evidence evaluation, challenge or settlement lifecycle has yet been executed against this deployment. The existing multi-authority Direct Mode tests are simulation evidence only, not live validator evidence.
- Deployment transaction explorer: [view receipt](https://explorer-studio.genlayer.com/tx/0x03bc674baea5c6915ce840a20c6d17072171805d410b9e7bf968bbad0177be01).

The production alias [ascende-sand.vercel.app](https://ascende-sand.vercel.app/) now uses this address. Vercel production deployment [`dpl_7LJoRtnqCG7DW5SgyzqKVDGNmw2F`](https://vercel.com/ifem1s-projects/ascende/7LJoRtnqCG7DW5SgyzqKVDGNmw2F) is `READY`; the deployed Docs page embeds the new contract address and source hash. Routes `/`, `/programs`, `/create`, `/my-work`, `/treasury`, `/activity`, and `/docs` returned HTTP 200. These are deployment smoke checks, not a real wallet-signed transaction or proof of positive/disputed/failure lifecycle outcomes. Do not reuse historical browser-created program or payout receipts below as proof for the current source.

## Historical deployment — rejected payable and bounded refund (source `d80148c4…`)

- Contract source commit: [`d80148c4fadd23c01fb4bff39d46bd1508951bbe`](https://github.com/Ifem1/Ascende/commit/d80148c4fadd23c01fb4bff39d46bd1508951bbe). The current frontend and documentation release is tracked on `main`; see the [CI workflow runs](https://github.com/Ifem1/Ascende/actions/workflows/ci.yml) for commit-specific results.
- Contract: `0x884676bCDE191A9D9c79B3111812425E15824836`.
- Deployment transaction: [`0xe502d1640c1612979018be4aafde8eaea83afc29cc1ed49a341c775d5559b2a7`](https://explorer-studio.genlayer.com/tx/0xe502d1640c1612979018be4aafde8eaea83afc29cc1ed49a341c775d5559b2a7), accepted on stable Studionet 61999 with `MAJORITY_AGREE` and 5/5 validator votes.
- Deployed `contracts/ascende.py` SHA-256: `7CA854631AFFF1861006BD8BC9F32A1425DF40C1BA402D88177FE74E853E7D6A`. `genlayer code` readback exactly matched the local source bytes after newline normalization.
- Wallet: supplied Landlord 1 test account `0xD6423aE82a975d55C6CeaC222827A727325e0459`. No private key is recorded here.
- Deliberately invalid `create_program` with 2 wei: parent [`0x2225c04fff0a04b2d804da39ae4202883fe92cdaa3fbc2ed7f3afc6040e1331e`](https://explorer-studio.genlayer.com/tx/0x2225c04fff0a04b2d804da39ae4202883fe92cdaa3fbc2ed7f3afc6040e1331e) finalized. Program counter stayed 0; independent contract readback showed exactly 2 wei credited and available to the original sender. No program was created.
- Refund reservation: parent [`0xe75442f0ed39bf13962cdd0ba26e1ca9fb9e9a8cadb9979c7506aef527eeceeb`](https://explorer-studio.genlayer.com/tx/0xe75442f0ed39bf13962cdd0ba26e1ca9fb9e9a8cadb9979c7506aef527eeceeb) finalized. Ledger operation 1 reserved 2 wei: available 0, authorized 2.
- Once-only refund submission: parent [`0xe08fc9df399ec722e9a7037c559a3cbae1855f2ba9dbaa532d9a34574b64e040`](https://explorer-studio.genlayer.com/tx/0xe08fc9df399ec722e9a7037c559a3cbae1855f2ba9dbaa532d9a34574b64e040) finalized. Contract readback shows operation 1 `TRANSFER_SUBMITTED`, pending 2 wei, delivered 0, delivery status `UNVERIFIABLE`.
- Triggered child [`0x8221e192dbe93929c0d2ce8b3b1ae88ae60fa6ae8d46d5c55a2217bbea7d02b9`](https://explorer-studio.genlayer.com/tx/0x8221e192dbe93929c0d2ce8b3b1ae88ae60fa6ae8d46d5c55a2217bbea7d02b9) finalized with `value_credited=true`, value 2 wei, and recipient equal to the original sender. This is external receipt evidence only; contract storage correctly remains pending.
- This demonstrates the expected rejection and once-only refund path on the new source. It does not demonstrate every rejection code, any production guarantee, or recovery of the 5 wei stranded at the historical deployment below.
- Production frontend is aliased at [ascende-sand.vercel.app](https://ascende-sand.vercel.app/). Vercel inspection reported the production deployment `READY`; the final route checks are recorded in the 2026-10-15 verification below. These are route/config smoke checks, not proof of a wallet-signed frontend transaction.

## Production injected-wallet verification — complete (2026-10-15)

The production site was opened in Chrome and a real Rabby injected wallet was used. The user selected the supplied Landlord 1 account and switched Rabby to Studionet 61999; the connected page showed `0xD642…e0459` and `STUDIONET · 61999`. The browser-originated finalized transaction below confirms the selected account and correct chain. The wrong-network warning was observed during the browser test; the user completed the final network selection in Rabby. This record does not claim that the page's own switch button performed that final switch.

- Contract: `0x884676bCDE191A9D9c79B3111812425E15824836`; deployed source SHA-256: `7CA854631AFFF1861006BD8BC9F32A1425DF40C1BA402D88177FE74E853E7D6A`.
- Funder: supplied Landlord 1 `0xD6423aE82a975d55C6CeaC222827A727325e0459`. Recipient: supplied Tenant 1 `0x39680bd423437C0Eaa18493629652821Ec672C61`.
- Genuine production-browser transaction: [`0x10b12943d4644d83c1b4e29cbd456ad0cf25a98a54cdd031803dd9f86e073a0b`](https://explorer-studio.genlayer.com/tx/0x10b12943d4644d83c1b4e29cbd456ad0cf25a98a54cdd031803dd9f86e073a0b). Explorer readback: `FINALIZED`, consensus `Accepted`, execution `SUCCESS`, return value `1`; sender and destination match the wallet and canonical contract. Explorer rounds the displayed native value to `0.000000 GEN`; decoded call parameters and contract state show the exact 2-wei budget.
- Program `1` is independently listed in the production registry at [ascende-sand.vercel.app/programs/1](https://ascende-sand.vercel.app/programs/1). Contract state confirms `ACTIVE`, funder and recipient above, `funded_wei=2`, `locked_wei=2`, Stage 1 `OPEN` at 1 wei and Stage 2 `LOCKED` at 1 wei, with the submitted title, purpose, criteria, authorities and frozen deadlines.
- The original frontend displayed an unsuccessful-execution message despite the explorer's successful result and matching contract state. This was a receipt-metadata mismatch, not a failed transaction. Commit [`bf0da8059dfc8ca98ebc5e985626880843f28771`](https://github.com/Ifem1/Ascende/commit/bf0da8059dfc8ca98ebc5e985626880843f28771) now checks the finalized on-chain program readback before reporting failure; its regression test requires the exact funder, recipient, title and budget. [CI run 38735284900](https://github.com/Ifem1/Ascende/actions/runs/38735284900) passed, and Vercel recorded Production deployment `7092608908` as successful at [the deployment URL](https://ascende-d9qhdjbnh-ifem1s-projects.vercel.app).
- The current contract's separate rejected-payable/refund test is recorded above. This browser transaction verifies real wallet connection, correct-chain payable creation and authoritative program readback; it does not demonstrate later milestone evaluation or child-transfer settlement.

## Previous source — historical full lifecycle evidence

The following release evidence is source-matched only to its historical deployment and does not verify the current source.

## Previous source — full lifecycle live test

- Deployed contract source commit: [`86436b4824cc18699a35dc09779c2aa38a46e4d6`](https://github.com/Ifem1/Ascende/commit/86436b4824cc18699a35dc09779c2aa38a46e4d6). The final repository release also records adversarial tests and fresh live verification; it does not change `contracts/ascende.py`.
- Contract: `0xC2F0F3E18B69F398385652A55F423a1e339b4290`.
- Deployment transaction: [`0xb3cfec04a693ad09fb9630a664052541e70fc524fe1b66a8813c9ac9c318037b`](https://explorer-studio.genlayer.com/tx/0xb3cfec04a693ad09fb9630a664052541e70fc524fe1b66a8813c9ac9c318037b), finalized, `MAJORITY_AGREE`, 5/5 validator votes, `SUCCESS`.
- Deployed `contracts/ascende.py` SHA-256: `A7545AF5FD87DDDECD5E68766CB95D82A0BF4C9C487ECC1651316D6327733853`. A fresh `gen_getContractCode` readback produced the same digest.
- Historical frontend config was `NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS=0xC2F0F3E18B69F398385652A55F423a1e339b4290`; RPC `https://studio.genlayer.com/api`. Vercel deployment [`dpl_ARNbm29K9qfRMfCxXjTi4B6caT6N`](https://vercel.com/ifem1s-projects/ascende/ARNbm29K9qfRMfCxXjTi4B6caT6N) is READY and aliased to [ascende-sand.vercel.app](https://ascende-sand.vercel.app/). That public build read programs 1–6 from the old contract; it does not verify the newly deployed address. Deployment upload excludes local Playwright browsers and generated build/dependency directories through the repository `.vercelignore`.
- Contract counter is 6. Programs 1–3 were present during the original source-matched release check; programs 4–6 below were added during final challenge and bounded-recovery verification. Failed payable calls did not create records.
- Live evidence fixtures are immutable files at commit `edfe1da` and were fetched and digest-checked by the contract on this deployment.

### Positive qualified lifecycle — Program 1

Funder `0xD6423aE82a975d55C6CeaC222827A727325e0459`; recipient `0x39680bd423437C0Eaa18493629652821Ec672C61`; principal 2 wei (1 wei per milestone). This live test used short, explicitly test-only policy windows; it is not a recommended production policy.

- Create `0x9108e1e3a40e6b6574f0957d9eb0b1b9704e460bd98a5cd851b1b4ee2645dbbf`; first evidence seal `0x851650866fb4cacc51f737cc945e5f5c6ced7e942af8e8564172bb2c1fa2c9d9`; first evaluation `0xe7a0bc8abd1f7f9a9faa2e119addbb57960790c4c02273b85acac6c1af025503` => `PROVISIONAL_QUALIFIED` / `QUALIFIED`.
- First milestone finalization `0xaf67488ac0aae78dce535a7a8026297c7580849f16efb26e95bc5af2de08a9cc` => `FINAL_QUALIFIED`, opening milestone 2.
- Second evidence seal `0x2c9e0ee5c65fb97065bb298476c7e144c6b66959eab9111f2a54385b703aa468`; first evaluation `0x6a03548332faf258449431a807646b61de73d3eb56d87952a7e0c6293a28b300` => `MODEL_OUTPUT_INVALID` / `RETRYABLE`; the one policy-allowed retry `0x57606f2d262cae62a55206f61b35b9eeca08ed99d82a26e445e8d10dd1d0a385` => `PROVISIONAL_QUALIFIED` / `QUALIFIED`.
- Second milestone finalization `0xcd07363c8b66230684950a87efbb18d2c4c6dd03ef29bb414f9f08bedaa5912e` => `CLOSED_SUCCESS`, 2 wei earned and 0 locked.
- Withdrawal authorization `0x24e66cfc9d7efbf3e2cd3117faacaefd5343a332d2969f0852e9782d3ae58596`; single submit parent `0xb438356d9df08bb6a08287b5ec79f0ec45597dd4f7c113b42f9f5a0c5569b15a`; child [`0x23a41dbb04a44e8a5f7c28589f8bd32faff8aa63042839741cd0fcd96c4fc387`](https://explorer-studio.genlayer.com/tx/0x23a41dbb04a44e8a5f7c28589f8bd32faff8aa63042839741cd0fcd96c4fc387), finalized, 2 wei, recipient matches, `value_credited=true`.
- Contract accounting remains `recipient_pending_wei=2`, `recipient_delivered_wei=0`, operation `TRANSFER_SUBMITTED`. The child credit is observed externally but not reconciled on-chain.

### Negative result and refund — Program 2

- Create `0x9e9e38dee2bbec6928e3021f32ee6336ca2dd84f8fc85f1f17435361a83fe857`; evidence seal `0x34bb8d49e088fbdd4da406348110b78ff8afe85b862595cb83bafd9fb1b74b69`; evaluation `0xaac4810f38a23edf0216b0628951b4d10dbe78db89ace924acadeb0542105e2c` => `PROVISIONAL_NOT_QUALIFIED` / `NOT_QUALIFIED`.
- Finalization `0xed48707231287041649548eaf5e3f698b0fc15075d4b0873701d2c38efc73bc6`; close `0x1e9392ee75741bbcb8d58be46128c7f65fdbf4f3a4e74b5bddcbf30359441cd5` => `CLOSED_STOPPED`, with all 2 wei refundable.
- Refund authorization `0xfb76f3ee2263459281fb7e311231bddc2be38982041028cdb1b92cb3c776d5f9`; submit parent `0x1adf79bdc4d9dcbd87a4e4e0f676919eeacdea02d7e824fc433e844d3f521ff7`; child [`0x29f70b5962e048aede7caa432c81b30dda2ec54bc1b6b2a9550327582c5b1e20`](https://explorer-studio.genlayer.com/tx/0x29f70b5962e048aede7caa432c81b30dda2ec54bc1b6b2a9550327582c5b1e20), finalized, 2 wei to the funder, `value_credited=true`.
- Accounting intentionally remains `funder_pending_wei=2`, `funder_refunded_wei=0` because there is no authenticated child callback.

### Missing evidence, expiry and refund — Program 3

- Create `0x3480abeeed7400a4b61d146b93e0bf073fb1158a99d2c70ee8aeed8ad69c9853` with a 180-second test deadline and no evidence submitted.
- Permissionless expiry `0xe52561e7ba8e2977321b4643e687b456b68bd1b66fc6d82d00f147e3adaac3e3` => `FINAL_EXPIRED`, reason `EVIDENCE_NOT_SUBMITTED`; closure `0x79e404e4a4833e204b4068bb0dbb582c3b7b35601f196f276dd573ccc65c9c49` => `CLOSED_STOPPED`, no recipient entitlement, 2 wei refundable.
- Refund authorization `0x265e6475e753e3574d2134e8dfe03997ee50349aef117b8332391e0027999d40`; submit parent `0xf87ccf529737bd374ecf0786b487927beafdd1d5e21cfa59e22aafb1eb273ed3`; child [`0x25761d78554f11f37bac60c4adb13793fc11ee24ddc6f084dea3bd9ceaaa553f`](https://explorer-studio.genlayer.com/tx/0x25761d78554f11f37bac60c4adb13793fc11ee24ddc6f084dea3bd9ceaaa553f), finalized, 2 wei to the funder, `value_credited=true`.
- Accounting remains `funder_pending_wei=2`, `funder_refunded_wei=0`; no resend was attempted.

### Challenge provenance and bond outcome — Program 4

Funder `0xD6423aE82a975d55C6CeaC222827A727325e0459`; recipient `0x39680bd423437C0Eaa18493629652821Ec672C61`; principal 2 wei and challenge bond 1 wei. Test-only policy used a 15-minute challenge window.

- Create `0x791f9a02f93fc37131bd7685573982e487c1b75325a947e345b942163462352b`; evidence submission `0x6c204322e18f491b3ef184e70fa2e3bf478fab75e62e01ffeb47b288f5f238f7`; initial evaluation `0x5535ffb393ac67c226e9d4d161777ec552ac58856d2684fdadb6ac3d87293850` => `PROVISIONAL_QUALIFIED`.
- Challenge `0xe28cfff0766a9d3756686fd21aa89ddf3adbeefb252cef521816fab1d343fcd6` committed a second immutable manifest/root and 1-wei bond. Resolution `0x277455da25591a87baa5e82b5093aba295b58b3e83f76656330f2526a7c224ff` independently evaluated the challenge evidence, returned `QUALIFIED`, and did not flip the result. Stored lineage includes decision IDs 1–3, previous and challenged roots, and resolution time.
- After the frozen 15-minute challenge window, permissionless finalization `0x3080fabb979a225c8474131238fd30178c08cb199446bda5fb01f3c98a272abc` finalized with `MAJORITY_AGREE`; readback showed milestone 1 `FINAL_QUALIFIED`, 1 wei earned, and milestone 2 `OPEN`.
- Milestone 2 evidence submission `0x6563218a135ca63a3529b5284bb026d6cae42277363bc896ac40acbca712b415` used the immutable `qualified-challenge.md` fixture (same 323-byte evidence root `37aa9932b2243df3569b65b9936d5a6fac976778d54eba884d16faf34f422e45`). Evaluation `0xb700472c4f477a12dfcaca108236de9295313a024422740d3998345089f6943d` reached `PROVISIONAL_QUALIFIED`; after the full frozen challenge window, finalization `0xd4551060b3edf1eaa6a792a08aab79e89b046a9eee07fd4afee599dd2c58d146` finalized with `MAJORITY_AGREE`. Readback: `CLOSED_SUCCESS`, both milestones `FINAL_QUALIFIED`, 2 wei claimable, 0 locked.
- Withdrawal authorization `0xfce266f4abe625c9d92474ab93f734bba4b72c3a4049514d7a3ca73cd5efb835` created one 2-wei operation (ID `8`). Payment parent `0x9c4d9d923c718f7657e9f06f191d0f1d52d0171190eb08ed09495cbbd5895db4` finalized with `MAJORITY_AGREE`; child `0xa5d54d62fabcbec6d655503ac184f7716e31b7f26eaca825a748f491d62072a0` finalized with `NO_MAJORITY`, recipient matched, value 2 wei, `value_credited=true`. The contract correctly retains 2 wei as `recipient_pending_wei` and 0 as delivered because child outcome cannot be authenticated in contract state.
- The bond child above is also finalized for 1 wei with `value_credited=true`, while bond delivery remains pending in contract storage. These child receipts demonstrate Studionet credits, not safe ledger reconciliation.

### Abandoned evidence evaluation and principal recovery — Program 5

- Create `0x858a247c0cfa562a67e2cdde0be0b77b5bd7a72ad46ee11b40240f7741583f0f` with 2 wei principal; evidence seal `0x768c02fa3311a9c0ddaa7191baf99678896e16a10cd7f4eb95edce1b7a475362`. No evaluation was submitted.
- After the frozen review deadline, permissionless `finalize_unresolved` `0x7df67720a912849f8eb4682d050116d83cb0fa69bbc7a6f99f55afefb9d2c885` recorded `FINAL_UNRESOLVED`, reason `NO_EVALUATION_BEFORE_REVIEW_EXPIRY`; it did not infer a business failure or vest recipient funds.
- Closure `0x88f356d5f3970673aedff614e2c02d9f86c789f91d21c7d7d9ac687ab4b9f366` => `CLOSED_STOPPED`. Refund authorization `0x18d4b711edb5942db71f7c1377a54ff4c776751e9b516200794168cb0a5f88d2`; parent `0xfc87774cf2f4a189a14b7bd45ac6277b35c530bdcd6afb0af95b4f1066d553bc`; child `0x77a5b227d474a15254b084efb2bf9f0da13bd3de38ad521a3bb6594198002e2c`, finalized, 2 wei to the funder, `value_credited=true`. Accounting records 2 wei funder-pending, 0 locked, 0 earned.

### Abandoned challenge and bond return — Program 6

- Create `0xb8316b9ad8f6e78f105ef805aa2194ce815409b3141bd3dfa3291f576819abd2` with 2 wei principal; evidence `0x0a03090dd64fedf444273472dd52d1f5121cfd177b0d232da80d57bc835da184`; evaluation `0xd95215a5a70af807c8801ee683e840356f61cd93f2682991b0aa739ad2510453`; challenge `0x7f9d915553064027bf591e03dfc81ca031a5f35579aada608bf43c20ce19bd8f` with 1 wei bond. No challenge resolution was submitted.
- After the frozen review grace, permissionless `finalize_unresolved` `0xaad489e83c213051a02fdfcc3165c00101034d7e1c0a989fb0dec540e5d7bad7` recorded `FINAL_UNRESOLVED`, reason `CHALLENGE_REVIEW_ABANDONED_BOND_RETURNED`. The locked bond became claimable by its recorded owner (the funder/challenger); it was not forfeited for review absence.
- Closure `0xc4b7eb36bed26a4b9ffc20c54a3abccb62f1ff3b7d0ad2035bed38fd12c8bca2` => `CLOSED_STOPPED`. Refund parent `0x659d4cc9e43e4e8c75570d1f125fb684bac3aaa4130983baa5f75ae88e28e001`; child `0x51c55a2a603985990e3c7266e3f26b5d1e469a7b339c3b5b14c49e1e58a4efeb`, finalized, 2 wei to the funder. Bond parent `0x4ad4443cc0fa27e7bfa9b1d31eff2c53685f3ef025a97a36909fccdf51f930fe`; child `0x59c5b19170d17d98060be240d8a33fe3741f7565da1a7b89a4a06e0b57aaa2e3`, finalized, 1 wei to the recorded bond owner. Both child receipts report `value_credited=true`; contract accounting retains 2 wei principal pending and 1 wei bond pending, with 0 locked.

The tests used 2 wei principal and 1 wei challenge bonds for programs 4 and 6. They expand the observed pending-transfer ledger but do not create new failed-payable surplus. Program 4 completed its challenged positive lifecycle through finalization and payment submission; its child credit remains externally observed and unreconciled in contract storage.

### Failed live calls and challenge boundary

- Create `0xbb8bc3a315fd8f68e1d1ecaf2033309e77d43f1b8f451044108e0fdbe2341696` finalized with consensus `MAJORITY_AGREE` but execution `ERROR`: the test harness used the funder as recipient. Receipt reports `value=2 wei` and `value_credited=true`; program counter remained 0 and protocol accounting remained zero. The value has no matching state record and is stranded.
- Nonpayable evidence/evaluation calls against the absent program finalized with execution `ERROR`: `0x01829a790b3b00c066c076238669cae869a6490f501985955f569471e119d3c5` and `0x68a7756275366548d6fd7c7c458b74dd25728d88d6467379d06bfadeb794f2fa`.
- Challenge attempt `0x23bedbe4be655af81a2eff52f4bea5fa8ccbc0d325b4d6c0eb56ee654b4da550` finalized with execution `ERROR`, value 1 wei and `value_credited=true`; chain transaction timestamp was 1791965361, while the provisional challenge deadline was 1791965355. The window had elapsed; no challenge state/bond record was created and no retry was made.
- A second test-harness create call `0xc6adf827d0424322ee538efacde7c4771dd0f3de4cc13988776d7192c46b3f49` also used the funder as recipient; execution `ERROR`, value 2 wei, `value_credited=true`, no program state. These failures were not converted into fictitious programs or bonds.
- This historical deployment therefore has 5 wei (0.000000000000000005 GEN) in observed failed payable value with no state record: two failed program creations (2 wei each) and one failed challenge (1 wei). No recovery path exists on that address; the new source's recovery path is demonstrated above on a separate deployment.

The successful challenge-resolution and abandoned-review receipts above belong to this historical source-matched deployment. The live test also shows that a 60-second challenge window can be missed under actual signing/execution timing; the contract tests separately cover boundary behavior.

## Historical deployment — superseded source

The following records belong to an even earlier contract source at commit `edfe1da1634abeb92ec091e562838b64093df3a9`. They are preserved for audit context only and do not verify either deployment above.

## Historical release candidate

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

At the time, the historical live Programs registry listed four programs on that superseded deployment. The historical Treasury view displayed pending child transfers separately from confirmed contract accounting; it did not label externally observed child credit as reconciled or paid.

Historical local validation for that superseded source: 29 contract tests, frontend typecheck/lint, 4 unit tests, 4 browser E2E cases, and a production build. Current release checks are recorded in [TESTING.md](TESTING.md). The live cycle was signed by the supplied test wallets through the local SDK script; frontend live reads were verified in the browser.

## Remaining production requirement

The app and contract preserve `TRANSFER_SUBMITTED` / pending state, but they cannot reconcile an external child transfer back into contract storage. Failed payable calls also demonstrated that attached value may remain at the contract after execution error. The earlier 0.06 GEN and 0.0002 GEN failed-call surpluses are unrecoverable through their old deployed interfaces. Do not use this settlement design for real funds until a separately reviewed settlement/reconciliation design closes this gap. See [payment safety](04_TREASURY_AND_PAYMENT_SAFETY.md) and [the live runbook](09_LIVE_RUNBOOK.md).
