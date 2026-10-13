# Deployment status

**NOT DEPLOYED.** The source and app are implemented locally, but there is no generated deployment artifact, contract address, deployment transaction, or release commit yet. The frontend reads from the configured contract address only; it does not fabricate data when the address is absent.

Target network: stable GenLayer Studionet only, chain ID `61999` (`0xF22F`), RPC `https://studio.genlayer.com/api`. Studio-dev 61997 is not a target.

The Python Direct Mode suite passes against its pinned local runtime. GenLayerJS is pinned at 1.1.8 in the frontend lockfile. The local global CLI is 0.39.1 and is not treated as a reproducible deploy toolchain. The GenVM lint command's semantic validation has not passed in this environment; Direct Mode execution validates source import/runtime behavior but is not a compiled Studionet deployment.

Do not deploy or claim production readiness until semantic compilation on the stable toolchain, full CI including frontend/browser tests, source review, and the live native transfer proof are complete. The transfer recovery limitation remains explicit in [SECURITY.md](SECURITY.md).
