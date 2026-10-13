# 07 — Adversarial and integration testing acceptance matrix

**Counts are TARGETS, not claimed completion.** Favor behavioral assertions of actual executed contract functions over static grep and helper arithmetic. Each test must identify whether it runs in GenVM Direct Mode, unit Python, UI, or live chain.

## Contract behavior (target ≥60 focused behavioral tests; ≥35 genuine Direct Mode)

| Family | Minimum important cases |
|---|---|
| Funding | zero/mismatch/overpay/overflow, bad recipient, bad milestone count, sum conservation, forged budget, unauthorized funding mutation |
| Stage permissions | stage 2 before stage 1, simultaneous submissions, correct sender, role switching, fresh deployment sender/address, final can’t reopen |
| Evidence | unauthorized URL/redirect/host/path; revoked/mutable URL; wrong SHA or byte length, oversize, late evidence, duplicate evidence, forged publisher timestamp, model-injected instruction |
| Semantic | qualified and not qualified, insufficient/conflicting required source, model invalid token, source unavailable, validator disagree, wrong source authenticity, actual custom validator execution and pickling |
| Challenges | only PROVISIONAL, wrong bond, wrong sender, deadline, tie forfeit, successful shift bond return, missing/late evidence, repeated generation, no open-ended semantic shopping |
| Economic | partial progress, final stage, stage failure, unused refund, claim without vest, double claim, refund vs claim races, child tx failed, child ambiguous, child success but polling stale, replayed payment proof |
| Time | equality at deadlines, just before/after, UTC/time warp, retry grace/correction/fallback, permissionless finalize |
| Read APIs | bounded lists, stable canonical IDs, non-wallet reads, accounting exact per program/global, event consistency |

Direct Mode basics: `direct_deploy`, `direct_vm.sender`, `direct_vm.value`, `direct_vm.warp`, `direct_vm.prank`, `mock_web`, `mock_llm`, `run_validator`; inspect exact pinned APIs before use. Test leader/validator separately with `run_validator()` and real state changes; no mocks in LIVE verification.

## Financial invariants (property/state machine target)

- Principal conservation across every transition, including in-flight values.
- No recipient entitlement without qualifying finalized milestone.
- No premature stage unlock; previous completed milestone cannot change.
- No extra GEN moving to funder beyond unearned refund credit.
- Aggregate paid/returned value ≤ total funded principal + independently tracked bonds.
- No second transfer while one is pending/ambiguous; replay/proof reuse impossible.
- Bond accounting exact for win/loss/tie/unresolved.
- No ghost refunds for failed child value transfers; stop and report infeasible reconciliation.

## Adversarial mutation target

≥20 meaningful mutants of financial/state invariants (e.g. `>=`/`>`, sender check removed, wrong bps/amount, hash ignored, stage override, collateral bucket swapped, child retry allowed). Kill with genuine assertions. A large line-count of static tests is not enough.

## Frontend unit/integration target

≥40 tests across EIP-1193 connection, popup copy/disconnect, wrong-network switch/rejection, provider changes, no-wallet browse, schema parity, proper parseGen/formatGen, human staged form, IDs, links, safe fee preflight, transaction hash recovery, timeout-no-rebroadcast, accepted vs finalized vs executed success, child delivery state and role guards.

## Browser E2E target

≥10 Playwright flows at desktop 1440, mobile 390 and mobile 430. No horizontal overflow, accessible wallet modal, valid error state, no secrets logged, fee details, no mock on-chain numbers. Browser tests may stub wallet/provider in TEST mode only with obvious test labels; cannot be cited as live payment proof.

## CI pipelines

`contract-lint`, `contract-direct`, `economic-mutants`, `frontend-lint`, `frontend-typecheck`, `frontend-unit`, `frontend-build`, `e2e-smoke`, `security` (secret scanning, dangerous dependency flags, source parity and search for any residual 61997 configs). CI must pin tools and run from clean checkout.

## Stop condition

If ANY money-loss invariant or live semantic-payment path is unverified, report BLOCKED with exact step, traceback or tx hash. Never remove failed tests as a green-CI maneuver without documenting the gap. No fake CI screenshots or fake contract/address numbers.
