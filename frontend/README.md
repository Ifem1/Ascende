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

The pinned SDK cannot simulate calls carrying GEN value. Creation and challenge preflight checks catch deterministic input errors, but they do not guarantee payable execution; a failed payable call may strand its value. The UI never retries an ambiguous transaction. It separates durable payment authorization from transfer submission and displays submitted/unresolved states without claiming delivery. It never stores private keys.
