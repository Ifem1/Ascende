# Deployment status

**Test deployment:** stable GenLayer Studionet, chain ID `61999` (`0xF22F`), RPC `https://studio.genlayer.com/api`. Studio-dev 61997 is not a target.

Previously deployed stable Studionet address `0x884676bCDE191A9D9c79B3111812425E15824836` used repository source commit `d80148c4fadd23c01fb4bff39d46bd1508951bbe`, deployed in transaction `0xe502d1640c1612979018be4aafde8eaea83afc29cc1ed49a341c775d5559b2a7`, source SHA-256 `7CA854631AFFF1861006BD8BC9F32A1425DF40C1BA402D88177FE74E853E7D6A`. It predates the new multi-authority and per-source consensus policy. Its address, transaction receipts, frontend deployment, and browser-created Program 1 are historical evidence only and do not verify the changed contract source. A fresh deployment to stable Studionet and a matching frontend release are required before release verification.

The previous Vercel release embeds the historical address above. Update the public contract address only after the new source is deployed and independently read back; public environment values are embedded at build time. Do not point the frontend at a newly deployed address until the source hash, chain ID and canonical state have been verified.

This is a testnet deployment, not production approval. Only allowlisted validation rejections are sender-attributed; unexpected VM failures can still leave unaccounted GEN. The EOA child-transfer interface has no authenticated delivery/failure callback, and final redirect authority cannot be enforced with the pinned Web Access response API. These limitations prevent production-safe escrow. See [SECURITY.md](SECURITY.md).
