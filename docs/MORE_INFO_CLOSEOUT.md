# More Info implementation closeout

## Implemented

- Per-source findings across frozen authorities, with bounded quotes and UTF-8 byte offsets checked against independently fetched, digest-bound response bytes. Validators compare the normalized decision packet and evidence root.
- Immutable challenge evidence and prior decision lineage. A challenge is evaluated against its own committed manifest and can change the provisional outcome without rewriting earlier evidence.
- Frozen recipient acceptance window and three-party lifecycle: zero-value draft, named-recipient acceptance, then exact-budget funding by the original funder. Permissionless expiry closes unfunded drafts.
- Bounded terminal recovery for expired submissions, abandoned technical review, exhausted retries, stalled challenges and late milestone activation.
- Multi-source creation and evidence workflows in the frontend; pinned CLI/GenVM and Windows UTF-8 CI configuration.

## Current verification

The corrected source is deployed on stable Studionet 61999 at `0x5bF12b1033A5827edBB27cdc92C7FAb0C4d1304F`. Audited main commit `8fd697b07485f46011cac331ec05a9aa958c0007` contains canonical 72,445-byte LF source (`bfb369ad103b9e98dfecd92ecc9d9800187b6e7661bfdb68b9d5387a9b44714e`, 1,549 newlines). A direct `gen_getContractCode` read returned 73,994 CRLF bytes (`98bc175a714326dd926a92ffff709f2cfd42fc4709e04c1a940d9c5e94017a04`); exact byte comparison after LF-to-CRLF conversion and reverse normalization passed. These are distinct hashes for equivalent source bytes under different line endings. Fresh live flows demonstrate qualification then challenge reversal, negative decision and refund entitlement, conflicting source findings resolved as `INCONCLUSIVE`, bounded closure, and recipient/bond/refund child receipts. Full transaction-level evidence is in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md).

Local frontend checks passed: TypeScript, ESLint, 16 Vitest tests, production build and 7 Playwright cases. GitHub Actions is the release gate and must pass on the exact final commit. Vercel deployment `dpl_HEUi47BAn1GdnSiknNW83GhrPM84` following the final main merge is ready, and production routes and embedded address/hash were checked. No current-address browser wallet transaction is claimed.

## Limits and verdict

The live fixture publisher controls both hostnames, so this does not establish organizational source independence or real-world truth. The pinned Web Access interface does not expose enforceable final redirect authority. Outgoing child receipts report `value_credited=true`, but no authenticated child-result callback updates contract accounting or permits safe retry. Unexpected failed payable calls may strand attached GEN.

**Verdict: ready as a transparent Studionet reviewer demonstration after exact-commit CI and production frontend deployment verification. Not production-safe escrow.** No reviewer score is claimed.
