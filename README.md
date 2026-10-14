# ASCENDE

Ascende is a GenLayer-native milestone funding application for stable Studionet (chain ID `61999`, `0xF22F`). Funders commit the exact sum of frozen GEN tranches; a recipient submits source manifests; independent validators evaluate exact fetched bytes; and a tranche vests only after the challenge period closes.

## Implementation status

The single principal Intelligent Contract is implemented in [`contracts/ascende.py`](contracts/ascende.py). Frozen, strictly increasing deadlines support permissionless missed-evidence expiry and bounded unresolved-review finalization; expired stages cannot qualify, and only unused principal becomes refund-entitled. The Next.js app reads live contract state when a verified deployment address is configured and gates wallet writes to Studionet 61999. No mock programs or TVL are shipped.

The current stable Studionet test deployment is `0x884676bCDE191A9D9c79B3111812425E15824836`, deployed from commit `d80148c4fadd23c01fb4bff39d46bd1508951bbe`. Its exact source hash, deployment transaction, and fresh rejected-payable/refund lifecycle are recorded in [`docs/LIVE_VERIFICATION.md`](docs/LIVE_VERIFICATION.md). The source now records sender-attributed credits for an explicit allowlist of predictable `create_program` and `challenge_milestone` validation rejections and permits one reserved, once-only refund transfer submission. This does not recover historical stranded value. Native EOA child transfers remain unresolved in contract state even when an external child receipt reports credit; the contract cannot authenticate recipient credit or safely retry an ambiguous child. Production-safe escrow remains unproven.

## Contract interface

Writes: `create_program`, `submit_evidence`, `evaluate_milestone`, `challenge_milestone`, `resolve_challenge`, `finalize_milestone`, `expire_milestone`, `finalize_unresolved`, `close_program`, `request_withdrawal`, `request_refund`, `request_bond_withdrawal`, `request_rejected_payable_refund`, `submit_payment`, `submit_rejected_payable_refund`, and `mark_transfer_unresolved`.

Views: `get_program_counter`, `list_program_ids`, `get_program`, `get_milestone`, `get_milestones`, `get_evidence_manifest`, `get_resolution_history`, `get_program_accounting`, `get_transfer_attempt`, `get_rejected_payable_credit`, `get_rejected_payable_ledger`, `get_protocol_accounting`, and `get_capabilities`. Decisions store a manifest-root-bound finding for every criterion and require independent validator agreement on the normalized packet; the model does not select amounts, recipients, or permissions. Zero is reserved as the payable-rejection sentinel; successful program IDs and challenge history IDs are positive.

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
