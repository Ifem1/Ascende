# Deployment status

**Test deployment:** stable GenLayer Studionet, chain ID `61999` (`0xF22F`), RPC `https://studio.genlayer.com/api`. Studio-dev 61997 is not a target.

The earlier deployment at `0x03b3525C550E5281747E686b87d19aDbD5f4F10b` is historical and does not contain the liveness, policy, or decision-packet changes in this release candidate. Do not use its receipts as evidence for the corrected source. A fresh source-matched Studionet deployment and lifecycle verification are required before this release can be presented as a verified reviewer demonstration.

Set `NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS` to the fresh address recorded in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md), and `NEXT_PUBLIC_GENLAYER_RPC=https://studio.genlayer.com/api`. Public values are embedded at build time. The example configuration intentionally leaves the address empty until deployment is verified. A contract source change requires a new deployment and a new live-verification record; evidence from another address or source hash is historical only.

This is a testnet deployment, not production approval. Failed payable calls can leave unaccounted GEN, and the EOA child-transfer interface has no authenticated delivery/failure callback. Those limitations prevent production-safe escrow. Final redirect authority also cannot be enforced with the pinned Web Access response API. See [SECURITY.md](SECURITY.md).
