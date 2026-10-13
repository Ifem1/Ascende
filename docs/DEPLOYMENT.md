# Deployment status

**Test deployment:** stable GenLayer Studionet, chain ID `61999` (`0xF22F`), RPC `https://studio.genlayer.com/api`. Studio-dev 61997 is not a target.

The current corrected contract was deployed from source commit `edfe1da1634abeb92ec091e562838b64093df3a9`, `contracts/ascende.py` SHA-256 `FA411EDC689686D2E793508D38D6C20E39996E264325632A367B018CC74CC930`, in transaction [`0x2e609aa4f01eee4ec9118e7586932f1365eecd021326507d2c607f9f59de0f4f`](https://explorer-studio.genlayer.com/tx/0x2e609aa4f01eee4ec9118e7586932f1365eecd021326507d2c607f9f59de0f4f) to `0x03b3525C550E5281747E686b87d19aDbD5f4F10b`. The transaction reached `ACCEPTED` with `MAJORITY_AGREE` (5 agree). A direct `gen_getContractCode` fetch hashes to the same SHA-256. Fresh positive, challenge, refund, and child-transfer evidence is recorded in [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md).

The frontend must be built with `NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS=0x03b3525C550E5281747E686b87d19aDbD5f4F10b` and `NEXT_PUBLIC_GENLAYER_RPC=https://studio.genlayer.com/api`. Public values are embedded at build time. A contract source change requires a new deployment and a new live-verification record; evidence from another address or source hash is historical only.

This is a testnet deployment, not production approval. Failed payable calls can leave unaccounted GEN, and the EOA child-transfer interface has no authenticated delivery/failure callback. Those limitations prevent production-safe escrow. Final redirect authority also cannot be enforced with the pinned Web Access response API. See [SECURITY.md](SECURITY.md).
