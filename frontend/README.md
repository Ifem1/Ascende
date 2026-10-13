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

The wallet chooser discovers injected EIP-1193 providers, and all writes check the connected chain is 61999 before signing. The app separates durable payment authorization from transfer submission and displays submitted/unresolved states without claiming delivery. It never stores private keys.
