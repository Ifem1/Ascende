# Deployment status

**Test deployment:** stable GenLayer Studionet, chain ID `61999` (`0xF22F`), RPC `https://studio.genlayer.com/api`. Studio-dev 61997 is not a target.

The configured stable Studionet test deployment is `0xC2F0F3E18B69F398385652A55F423a1e339b4290`, deployed from repository commit `86436b4824cc18699a35dc09779c2aa38a46e4d6`. It predates the current payable-credit source changes and does not expose those methods. Its deployment transaction, exact historical source hash, lifecycle receipts, failed-call residues and transfer limitations are recorded in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). It does not verify the current checkout.

Set `NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS=0xC2F0F3E18B69F398385652A55F423a1e339b4290` and `NEXT_PUBLIC_GENLAYER_RPC=https://studio.genlayer.com/api` only for the historical version. Do not point a release frontend at this address while expecting rejected-payable credit support. The source change requires a new deployment and a new live-verification record; evidence from another address or source hash is historical only.

This is a testnet deployment, not production approval. Failed payable calls can leave unaccounted GEN, and the EOA child-transfer interface has no authenticated delivery/failure callback. Those limitations prevent production-safe escrow. Final redirect authority also cannot be enforced with the pinned Web Access response API. See [SECURITY.md](SECURITY.md).
