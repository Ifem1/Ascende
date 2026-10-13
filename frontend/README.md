# Ascende app

This Next.js App Router application uses real contract reads and wallet writes when `NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS` is a valid deployed Studionet address. Without it, chain data surfaces a clear unavailable state; no sample programs or statistics are substituted.

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
