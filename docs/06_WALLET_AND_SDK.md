# 06 — Wallet, GenLayerJS and network LOCK

## Environment invariants

Stable GenLayer **Studionet chain 61999, hex `0xF22F`**, RPC `https://studio.genlayer.com/api`; use native `studionet` chain from a *verified compatible* `genlayer-js` release. DO NOT substitute Studio-dev 61997 or RC global CLI. Baseline tool candidates: repository-local CLI `0.39.1`, GenLayerJS `1.1.8`, genlayer-test `0.29.x` if supported, GenVM compatible with stable StudioNet. These are **starting assumptions**, not permission to mix incompatible releases. Document actual resolved versions, validate on-chain compatibility, pin lockfiles and use `npx --no-install genlayer` from local repo.

Python >=3.12 for tests; Node >=20 for Next App Router; always capture exact versions in docs/DEPLOYMENT.md. Some docs published later may not match pinned Studionet. Verify ABI/tool signature locally rather than guessing.

## Connection and network guard

Provider selection using injected EIP-1193 only. `eth_requestAccounts`, `eth_accounts`, `eth_chainId`, `wallet_switchEthereumChain` with `{chainId:'0xF22F'}`; `wallet_addEthereumChain` only if supported and when verified RPC/chain metadata are available. React to `accountsChanged`, `chainChanged`, `disconnect`. All connection-sensitive writes hard blocked unless account selected and chain 61999 confirmed both before estimation and before broadcast. No private key injection, generation, export or plaintext browser storage. Disconnect means app disconnection, not forced wallet revoke.

Read-only connection uses the public RPC client without wallet. Create a fresh wallet-backed `createClient` with injected provider and call `connect('studionet')` per *installed SDK's exact API*. Check the working instance and fields, not screenshot assumptions.

## Financial amounts

`parseGen('0.02') => 20000000000000000n`. Reject exponential notation, negatives, excessive fractional digits, empty, overflow. `formatGen` must preserve meaningful precision without floating point. `value` in payable `writeContract` is distinct from fee estimate. Display max fee and GEN deposit separately before confirmation.

## Fees, broadcast and lifecycle

Inspect installed GenLayerJS for `estimateTransactionFeesForWrite`, `writeContract`, `waitForDecision`, `waitForFinalization`, `waitForTransactionReceipt`, `isSuccessful`, child `getTriggeredTransactionIds` and `getTransaction`/traces. If fee-charging on target runtime, estimate and attach `fees: {distribution,feeValue}` as exact supported API. If Studionet allows another mode, document authoritative evidence rather than inventing fee values. Never silently retry broadcast after timeout: persist original tx hash and reconcile it.

After write, wait for required finality **and** GenVM executed success. Then reread canonical contract state/IDs. For money flows, additionally follow child transfers and credited value; never equate parent `FINALIZED` with recipient paid. Never treat undetermined consensus as committed milestone progress.

## Frontend environment contract

```
NEXT_PUBLIC_GENLAYER_NETWORK=studionet
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS=<new canonical deployment address only after successful deploy>
NEXT_PUBLIC_GENLAYER_RPC=https://studio.genlayer.com/api
```

Allow app build with missing contract address but display `Not deployed / Public reads unavailable` and disable real writes. Do not fallback to a guessed/old address. Never store provider credentials in public env.

## Wallet UX acceptance

- Click wallet pill => popover with Copy, Explorer, Disconnect.
- Click wrong network => standard wallet switch; account persists if wallet approves; refetch on chain change.
- Reject switch => informative state and no transactions.
- Changing wallet during pending tx => track original sender/hash, not invent success or rebroadcast.
- On cold page/refresh => public reads work; reconnect via eth_accounts without popup when allowed; correctly isolate network chain.
