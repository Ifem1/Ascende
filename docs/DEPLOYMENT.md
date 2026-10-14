# Deployment status

**Test deployment:** stable GenLayer Studionet, chain ID `61999` (`0xF22F`), RPC `https://studio.genlayer.com/api`. Studio-dev 61997 is not a target.

The current stable Studionet test deployment is `0x884676bCDE191A9D9c79B3111812425E15824836`, deployed from repository commit `d80148c4fadd23c01fb4bff39d46bd1508951bbe` using GenLayer CLI 0.39.1 and a supplied test wallet. Deployment transaction: `0xe502d1640c1612979018be4aafde8eaea83afc29cc1ed49a341c775d5559b2a7`. Deployed source SHA-256 is `7CA854631AFFF1861006BD8BC9F32A1425DF40C1BA402D88177FE74E853E7D6A`, independently matched against the local source readback. Fresh payable-credit/refund receipts are in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). The prior address remains historical and its receipts do not verify this source.

Set `NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS=0x884676bCDE191A9D9c79B3111812425E15824836` and `NEXT_PUBLIC_GENLAYER_RPC=https://studio.genlayer.com/api`. Public values are embedded at build time. Evidence from another address or source hash is historical only. Vercel production now uses this address in deployment [`dpl_CiC6u1u6444z4J58Lvbd68a7MyiJ`](https://vercel.com/ifem1s-projects/ascende/CiC6u1u6444z4J58Lvbd68a7MyiJ), which is `READY` and aliased to `ascende-sand.vercel.app`; its client bundle was checked for this address.

This is a testnet deployment, not production approval. Only allowlisted validation rejections are sender-attributed; unexpected VM failures can still leave unaccounted GEN. The EOA child-transfer interface has no authenticated delivery/failure callback, and final redirect authority cannot be enforced with the pinned Web Access response API. These limitations prevent production-safe escrow. See [SECURITY.md](SECURITY.md).
