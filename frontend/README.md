# Ascende app

This Next.js App Router application uses real contract reads and wallet writes when `NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS` is a valid deployed Studionet address. Without it, chain data surfaces a clear unavailable state; no sample programs or statistics are substituted.

Set `NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS` and `NEXT_PUBLIC_GENLAYER_RPC` before building. The RPC setting configures both GenLayerJS reads/writes and the wallet's Studionet network entry. `NEXT_PUBLIC_GENLAYER_NETWORK` and `NEXT_PUBLIC_GENLAYER_CHAIN_ID` are not read; the app pins stable Studionet chain ID 61999 in code. Next.js embeds public environment values at build time, so changing them in Vercel requires a new deployment. Never put private keys in frontend variables.

```powershell
npm ci
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run e2e
```

Build before browser E2E: Playwright starts the production server against the generated `.next` output.

The wallet chooser discovers available EIP-6963 providers and falls back to the browser's injected `window.ethereum`; it does not bundle or select an account. All writes check the connected chain is 61999 before signing. Evidence and challenge calls require a complete, locally validated manifest and an explicit preparation step, and the prepared request is discarded when its evidence, milestone, wallet account, or network changes.

The pinned SDK cannot simulate calls carrying GEN value. The current contract catches only allowlisted, predictable application validation failures in payable creation/challenge calls and records the sender-attributed credit; the UI checks finalized program/challenge state before reporting business success. Unexpected VM failures can still leave unaccounted value. Treasury displays available, authorized and submitted rejected-payment credit, and allows the original wallet to reserve a refund and submit its transfer once. Child delivery remains unverified, ambiguous transfers are never retried, and the UI never stores private keys. The current local configuration points at the fresh deployment. Vercel embeds its own build-time environment values and must be updated and rebuilt separately before the public website points at this address.
