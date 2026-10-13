# Ascende user guide

Ascende is a live **testnet** portal for GEN-funded, evidence-gated milestone programs. Its current contract is on stable Studionet 61999 (`0xF22F`); the address, source fingerprint, and completed test cycles are recorded in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). The portal has no mock registry and reads from the configured contract.

**Do not use Ascende for production escrow.** Failed payable calls may leave GEN without an attributable program or bond, and finalized EOA child transfers have no authenticated callback to reconcile their delivery into contract state. The portal therefore presents submitted transfers as pending even when an external receipt reports the value was credited. See [SECURITY.md](SECURITY.md).

## Connect and browse

1. Open the current portal and select **Connect wallet**.
2. Choose the injected wallet. The account must be on Studionet chain `61999` (`0xF22F`); the wallet control offers a network switch when needed.
3. Browse Programs, My Work, Treasury, and History. Records and activity come from finalized contract state; an unavailable RPC is shown as an error state, not replaced with sample data.

## Create a test program

1. Enter the recipient, purpose, and at least two ordered milestones.
2. Set each tranche, deadline, acceptance clauses, and allowed HTTPS source path before funding. These terms are frozen once created.
3. Add public evidence manifests containing exact URL, byte length, and SHA-256. Evidence sources are fetched independently by validators; technical fetch/digest failures are retryable and are not a business denial.
4. Review the exact total GEN amount and authorize creation in the wallet. Contract funding must exactly equal the tranche sum.
5. The recipient seals evidence for the open milestone. Evaluation may be qualified, not qualified, or retryable; only finalized qualification vests a tranche and opens the next milestone.

## Challenge and payment status

An eligible party may submit a distinct evidence manifest and exact frozen bond during the challenge window. Program detail pages preserve both evidence versions, roots, earlier decisions, challenge result, and resolution lineage.

After finalization, a recipient or funder may request an earned payment or refund. The authorized operation is submitted once and exposes its parent/child receipts. The UI says **pending** because the contract cannot authenticate a child result or safely retry an ambiguous transfer; do not interpret a finalized parent as proof of delivery.

The deployed portal and contract are testnet software. A successful test cycle does not close the documented failed-payable, child-reconciliation, final-redirect-authority, or model-truth limitations.
