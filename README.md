# ASCENDE

Ascende is a GenLayer-native milestone funding application for stable Studionet (chain ID `61999`, `0xF22F`). Funders commit the exact sum of frozen GEN tranches; a recipient submits source manifests; independent validators evaluate exact fetched bytes; and a tranche vests only after the challenge period closes.

## Implementation status

The single principal Intelligent Contract is implemented in [`contracts/ascende.py`](contracts/ascende.py). Frozen, strictly increasing deadlines support permissionless missed-evidence expiry and bounded unresolved-review finalization; expired stages cannot qualify, and only unused principal becomes refund-entitled. The Next.js app reads live contract state when a verified deployment address is configured and gates wallet writes to Studionet 61999. No mock programs or TVL are shipped.

Current checked-in contract source now requires 2–4 required evidence authorities on distinct hostnames for each milestone. Every submitted or challenged manifest must include exact byte length and SHA-256 for each authority. Validators independently fetch all frozen bytes, provide per-criterion source findings, and must agree on the evidence root, criterion result, and source-by-source findings; conflicting sources are insufficient rather than an automatic denial. Distinct hostnames do not establish distinct owners, and final redirect authority remains unenforceable. The currently deployed address and its live evidence predate this source change; they are not source-matched evidence for the new multi-authority policy. A new deployment and fresh live evidence are required before claiming release verification.

## Contract interface

Writes: `create_program`, `submit_evidence`, `evaluate_milestone`, `challenge_milestone`, `resolve_challenge`, `finalize_milestone`, `expire_milestone`, `finalize_unresolved`, `close_program`, `request_withdrawal`, `request_refund`, `request_bond_withdrawal`, `request_rejected_payable_refund`, `submit_payment`, `submit_rejected_payable_refund`, and `mark_transfer_unresolved`.

Views: `get_program_counter`, `list_program_ids`, `get_program`, `get_milestone`, `get_milestones`, `get_evidence_manifest`, `get_resolution_history`, `get_program_accounting`, `get_transfer_attempt`, `get_rejected_payable_credit`, `get_rejected_payable_ledger`, `get_protocol_accounting`, and `get_capabilities`. Decisions store a manifest-root-bound source finding for every criterion and require independent validator agreement on the exact provenance packet; the model does not select amounts, recipients, or permissions. Zero is reserved as the payable-rejection sentinel; successful program IDs and challenge history IDs are positive.

## Local checks

Python versions are pinned in `requirements.txt`. Direct Mode uses GenVM `v0.2.16`; `scripts/install-genvm-runner.ps1` downloads and checksum-verifies that artifact.

```powershell
$env:GENVM_VERSION='v0.2.16'; $env:PYTHONUTF8='1'; $env:PYTHONIOENCODING='utf-8'
python -m pip install -r requirements.txt
./scripts/install-genvm-runner.ps1
genvm-lint lint contracts/ascende.py
genvm-lint validate contracts/ascende.py
genvm-lint schema --json -o contracts/ascende.schema.json contracts/ascende.py
pytest -p no:cacheprovider -q tests/test_contract.py
```

The frontend uses Node.js 22 and the pinned GenLayerJS 1.1.8 client:

```powershell
cd frontend
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
npm run e2e
```

Build before browser E2E: Playwright starts the production server against the generated `.next` output.

Set `NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS` and `NEXT_PUBLIC_GENLAYER_RPC` before building the frontend. Public environment values are embedded at build time. Do not add secrets to `.env` or commit wallet keys.

See [`docs/SECURITY.md`](docs/SECURITY.md), [`docs/TESTING.md`](docs/TESTING.md), [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md), and [`docs/LIVE_VERIFICATION.md`](docs/LIVE_VERIFICATION.md) for reviewed guarantees and release evidence.
