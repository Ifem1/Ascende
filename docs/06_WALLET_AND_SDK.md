# 06 — Wallet, GenLayerJS and network LOCK

## Environment invariants

This release targets stable GenLayer **Studionet chain 61999, hex `0xF22F`**, RPC `https://studio.genlayer.com/api`; it uses the native `studionet` chain from GenLayerJS `1.1.8`. Contract CLI used for deployment was GenLayer CLI `0.39.1`; tests pin `genlayer-test 0.29.2`, `genlayer-py 0.16.3`, and GenVM `v0.2.16`. Do not substitute Studio-dev 61997 or prerelease runtimes. The frontend lockfile and Python requirements are the version authorities.

Python >=3.12 for tests; Node 22 for Next App Router; always capture exact versions in docs/DEPLOYMENT.md. The contract schema is generated with GENVM_VERSION=v0.2.16; CI sets this and forces UTF-8 output on Windows.

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
NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS=<address deployed from this exact source>
NEXT_PUBLIC_GENLAYER_RPC=https://studio.genlayer.com/api
```

The application pins the chain to Studionet 61999 in code; it does not read public network or chain-ID environment variables. The canonical test contract is `0x5bF12b1033A5827edBB27cdc92C7FAb0C4d1304F`; the Vercel production environment variable has been updated to this address and the RPC is `https://studio.genlayer.com/api`. Verify the production alias after deployment before calling the public site current. See [DEPLOYMENT.md](DEPLOYMENT.md) and [LIVE_VERIFICATION.md](LIVE_VERIFICATION.md). Do not configure a build with a guessed or historical address. A build without a valid contract address displays a clear unavailable state and disables real writes. Never store provider credentials in public env.

## Wallet UX acceptance

- Click wallet pill => popover with Copy, Explorer, Disconnect.
- Click wrong network => standard wallet switch; account persists if wallet approves; refetch on chain change.
- Reject switch => informative state and no transactions.
- Changing wallet during pending tx => track original sender/hash, not invent success or rebroadcast.
- On cold page/refresh => public reads work; reconnect via eth_accounts without popup when allowed; correctly isolate network chain.
