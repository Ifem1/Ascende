# Deployment status

**Test deployment:** stable GenLayer Studionet, chain ID `61999` (`0xF22F`), RPC `https://studio.genlayer.com/api`. Studio-dev 61997 is not a target.

The corrected contract was deployed from `contracts/ascende.py` SHA-256 `8BFD9B82A65458D2CFC11499E10681A83E283EDC355BB88F389697F884E665CC` in transaction [`0xbabe65aade68a23989009ce95a9106181512f9d396458103c5141da38f3e3a29`](https://explorer-studio.genlayer.com/tx/0xbabe65aade68a23989009ce95a9106181512f9d396458103c5141da38f3e3a29) to `0xb47Cc771D53846246016D78D39e59AAC0884D827`. The transaction reached `ACCEPTED` with `MAJORITY_AGREE` (3 agree, 2 idle). A direct `gen_getContractCode` fetch hashes to the same SHA-256. Fresh live lifecycle verification is being completed; see [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md) for the release record.

The frontend must be built with `NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS=0xb47Cc771D53846246016D78D39e59AAC0884D827` and `NEXT_PUBLIC_GENLAYER_RPC=https://studio.genlayer.com/api`. Public values are embedded at build time. A contract source change requires a new deployment and a new live-verification record; evidence from another address or source hash is historical only.

This is a testnet deployment, not production approval. Failed payable calls can leave unaccounted GEN, and the EOA child-transfer interface has no authenticated delivery/failure callback. Those limitations prevent production-safe escrow. Final redirect authority also cannot be enforced with the pinned Web Access response API. See [SECURITY.md](SECURITY.md).
