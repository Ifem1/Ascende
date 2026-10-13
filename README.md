# ASCENDE

Ascende is a GenLayer-native milestone funding application for stable Studionet (chain ID `61999`, `0xF22F`). Funders commit the exact sum of frozen GEN tranches; a recipient submits source manifests; independent validators evaluate exact fetched bytes; and a tranche vests only after the challenge period closes.

## Implementation status

The single principal Intelligent Contract is implemented in [`contracts/ascende.py`](contracts/ascende.py). Direct Mode exercises its funding, role, evidence, validator, challenge, sequential-finalization, refund, bond, payment-authorization, one-time submission, and unresolved states. The Next.js app reads live contract state when a verified deployment address is configured and gates wallet writes to Studionet 61999. No mock programs or TVL are shipped.

The current stable Studionet deployment and live receipts are documented in [`docs/LIVE_VERIFICATION.md`](docs/LIVE_VERIFICATION.md). Contract source changes require a new address; prior live evidence applies only to the source hash and address named in that record. Native EOA child transfers remain `TRANSFER_SUBMITTED`/pending because this interface cannot authenticate recipient credit or safely recover an ambiguous/failed child. Failed payable calls can also leave value at a contract without matching state. Those unresolved value paths make production-safe escrow unproven; this is a release blocker, not a guarantee of recovery.

## Contract interface

Writes: `create_program`, `submit_evidence`, `evaluate_milestone`, `challenge_milestone`, `resolve_challenge`, `finalize_milestone`, `finalize_unresolved`, `close_program`, `request_withdrawal`, `request_refund`, `request_bond_withdrawal`, `submit_payment`, and `mark_transfer_unresolved`.

Views: `get_program_counter`, `list_program_ids`, `get_program`, `get_milestone`, `get_milestones`, `get_evidence_manifest`, `get_resolution_history`, `get_program_accounting`, `get_transfer_attempt`, `get_protocol_accounting`, and `get_capabilities`.

## Local checks

Python versions are pinned in `requirements.txt`. Direct Mode uses GenVM `v0.2.16`; `scripts/install-genvm-runner.ps1` downloads and checksum-verifies that artifact.

```powershell
python -m pip install -r requirements.txt
./scripts/install-genvm-runner.ps1
pytest -p no:cacheprovider -q tests/test_contract.py
```

The frontend uses Node.js 20+ and the pinned GenLayerJS 1.1.8 client:

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
