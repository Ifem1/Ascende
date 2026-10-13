# ASCENDE

Ascende is a GenLayer-native milestone funding application for stable Studionet (chain ID `61999`, `0xF22F`). Funders commit the exact sum of frozen GEN tranches; a recipient submits source manifests; independent validators evaluate exact fetched bytes; and a tranche vests only after the challenge period closes.

## Implementation status

The single principal Intelligent Contract is implemented in [`contracts/ascende.py`](contracts/ascende.py). Direct Mode exercises its funding, role, evidence, validator, challenge, sequential-finalization, refund, bond, payment-authorization, one-time submission, and unresolved states. The Next.js app reads live contract state when a verified deployment address is configured and gates wallet writes to Studionet 61999. No mock programs or TVL are shipped.

Native EOA child transfers are recorded as submitted, never delivered. A claim first becomes a durable `AUTHORIZED` operation bound to an immutable ID, destination and amount. A separate call can submit that ID once. A submitted operation can be marked unresolved; it stays reserved and cannot be resent. The current documented EOA transfer interface does not prove recipient credit or provide a contract-authenticated failed-delivery recovery path, so safe economic recovery and production readiness remain unproven. No live transfer or contract deployment is claimed.

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

Set `NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS` only to a verified Studionet deployment address. Reads are unavailable until a deployment exists. Do not add secrets to `.env` or commit wallet keys.

See [`docs/SECURITY.md`](docs/SECURITY.md), [`docs/TESTING.md`](docs/TESTING.md), [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md), and [`docs/LIVE_VERIFICATION.md`](docs/LIVE_VERIFICATION.md) for reviewed guarantees and release evidence.
