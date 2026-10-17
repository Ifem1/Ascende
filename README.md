# ASCENDE

Ascende is an original GenLayer milestone programme prototype for stable Studionet (chain ID `61999`, `0xF22F`). A funder proposes frozen criteria, evidence authorities and tranches. The named recipient must accept those terms before the funder can activate with the exact budget. Independent validators assess hash-bound evidence; only a final qualified milestone vests its preset tranche.

## Current implementation

- The Intelligent Contract is [`contracts/ascende.py`](contracts/ascende.py). Its draft → recipient acceptance → exact funding sequence prevents principal from being deposited before the recipient accepts. Unaccepted and accepted-but-unfunded drafts expire permissionlessly without holding funds.
- Each milestone freezes 2–4 HTTPS path authorities, at least two required, and 1–3 criteria. Distinct hostnames and declared roles are policy assertions; they do not prove independent publishers or separate control.
- Decision packets bind to a deterministic evidence root and contain criterion/source findings plus exact UTF-8 byte quotations and offsets. GenVM validators independently fetch the frozen bytes and must agree on the material packet. A quotation proves that cited bytes were present; it does not prove that the publisher is authentic or that the evidence is true.
- The frontend uses the visitor’s injected EIP-1193 wallet. It presents all criteria and authority roles, supports optional source manifests, recipient acceptance and funder activation, and distinguishes parent execution from external child-transfer delivery.
- Contract withdrawals remain one-shot asynchronous native transfers. The contract has no authenticated child-result callback; it does not mark an EOA paid or retry an ambiguous transfer. Generic HTTPS redirects are not enforceably pinned by the currently available Web Access response.

**Release status: NOT READY for production-safe escrow.** The contract and frontend changes in this working branch need source-matched stable deployment and live lifecycle evidence. The existing deployment `0x2c7a6260f2958C0Bd6634182E9978d209F0a06aD` predates this source change and must not be used as proof for the new ABI. The production Vercel site is intentionally left on its present release until replacement contract and frontend behavior are verified.

## Contract interface

Creation uses `create_program` (zero value), `accept_program` (recipient only), and payable `fund_program` (original funder, exact frozen budget). `expire_unaccepted_program` and `expire_unfunded_program` close drafts after the frozen acceptance window. Milestone actions include `submit_evidence`, `evaluate_milestone`, `challenge_milestone`, `resolve_challenge`, `finalize_milestone`, `expire_milestone`, `finalize_unresolved` and `close_program`. Principal, challenge-bond and rejected-payable credits have separate reservation accounting; transfer submission is once-only and remains pending/unverifiable.

See the generated [Contract API](docs/CONTRACT_API.md), [Settlement Model](docs/SETTLEMENT_MODEL.md), [Security](docs/SECURITY.md), [Testing](docs/TESTING.md), [Deployment](docs/DEPLOYMENT.md), [Live Verification](docs/LIVE_VERIFICATION.md) and [More Info Closeout](docs/MORE_INFO_CLOSEOUT.md).

## Pinned toolchain and checks

The repository pins GenLayer CLI `0.39.1` and its lockfile, GenVM linter `0.11.0`, GenVM runtime `v0.2.16`, `genlayer-test 0.29.2`, Python 3.12, Node 22 in CI, and the frontend dependency lock. Use only stable Studionet; do not switch to chain 61997 or a release candidate.

```powershell
npm ci
npx --no-install genlayer --version
npx --no-install genlayer network set studionet
npx --no-install genlayer network info
$env:GENVM_VERSION='v0.2.16'; $env:PYTHONUTF8='1'; $env:PYTHONIOENCODING='utf-8'
python -m pip install -r requirements.txt
./scripts/install-genvm-runner.ps1
genvm-lint check contracts/ascende.py
genvm-lint lint contracts/ascende.py
genvm-lint validate contracts/ascende.py
genvm-lint typecheck contracts/ascende.py
genvm-lint schema --json -o contracts/ascende.schema.json contracts/ascende.py
python -m pytest -p no:cacheprovider -q tests/test_contract.py
Push-Location frontend
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
npm run e2e
Pop-Location
```

The deployment and settlement limits are described in [SECURITY.md](docs/SECURITY.md); transaction histories and old deployment receipts remain labeled by their exact source version in [LIVE_VERIFICATION.md](docs/LIVE_VERIFICATION.md). No wallet key or server-held signer is part of this repository.
