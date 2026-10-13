# Ascende user guide — current preview status

Ascende is intended to let a funder commit a fixed GEN budget to a recipient across 2–5 ordered milestones. The funder freezes acceptance rules and authorized evidence sources at creation. Validators assess source-authenticated evidence; only a final qualified result should vest its frozen tranche and open the next stage.

## Current preview

The supplied site is a design starter, not a live portal. It has no deployed contract address, canonical program registry, activity feed, or transaction actions. Do not send funds through it or interpret any screen as a live program record.

## Intended wallet/network behavior

The eventual portal will use an injected EIP-1193 wallet on stable Studionet 61999 (`0xF22F`). Connected address and chain can change in the wallet. A displayed transaction hash must be followed through execution and any child transaction; parent finality does not by itself prove that GEN reached a recipient.

## Funds and evidence

The protocol is not deployed and cannot currently accept evidence, evaluate milestones, process challenges, vest claims, or return funds. Generic HTTPS content hashes establish byte identity, not the publisher's real-world identity. Never treat a missing source as proof that a milestone failed.

See [the live verification status](LIVE_VERIFICATION.md) before relying on any claimed deployment or payment.
