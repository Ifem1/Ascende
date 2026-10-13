import hashlib
import json
from datetime import datetime, timedelta, timezone

import pytest
from gltest.direct.loader import create_address


pytestmark = pytest.mark.direct
WEI = 10**18
PREFIX = "https://evidence.example.org/project/"
URL_A = PREFIX + "milestone-1.json"
URL_B = PREFIX + "milestone-2.json"
BODY_A = b'{"result":"delivered","tests":true}'
BODY_B = b'{"result":"second-stage","tests":true}'


def _now() -> int:
    return int(datetime.now(timezone.utc).timestamp())


def _advance(vm, seconds: int):
    current = datetime.fromisoformat(vm._datetime.replace("Z", "+00:00"))
    vm.warp((current + timedelta(seconds=seconds)).isoformat())


def _manifest(url=URL_A, body=BODY_A):
    return json.dumps([{
        "url": url,
        "sha256": hashlib.sha256(body).hexdigest(),
        "byte_length": len(body),
    }])


def _program(recipient=None, tranche_a=2 * WEI, tranche_b=3 * WEI):
    recipient = str(create_address("bob")) if recipient is None else recipient
    milestones = [
        {
            "tranche_wei": str(tranche_a),
            "deadline": _now() + 5000,
            "criteria": ["The published delivery record confirms the first release passed its stated tests."],
            "authorities": [{"prefix": PREFIX, "role": "PRIMARY", "required": True}],
        },
        {
            "tranche_wei": str(tranche_b),
            "deadline": _now() + 10000,
            "criteria": ["The published delivery record confirms the second release passed its stated tests."],
            "authorities": [{"prefix": PREFIX, "role": "PRIMARY", "required": True}],
        },
    ]
    policy = {
        "challenge_window": 60,
        "retry_spacing": 60,
        "retry_grace": 60,
        "max_retries": 1,
        "challenge_bond_wei": str(WEI // 10),
    }
    return recipient, "Milestone program", "Release two verified deliveries", json.dumps(milestones), json.dumps(policy)


def _create(contract, vm, funder, args=None):
    args = args or _program()
    vm.sender = funder
    vm.value = 5 * WEI
    return contract.create_program(*args)


def _seal_and_evaluate(contract, vm, recipient, program_id, verdict="QUALIFIED", url=URL_A, body=BODY_A):
    vm.sender = recipient
    contract.submit_evidence(program_id, 0, _manifest(url, body))
    vm.mock_web(url, {"status": 200, "body": body})
    vm.mock_llm("independent milestone evidence evaluator", json.dumps({"classification": verdict}))
    vm.sender = recipient
    return contract.evaluate_milestone(program_id, 0)


def test_exact_funding_stores_program_and_frozen_tranches(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/ascende.py")
    funder = direct_vm.sender
    program_id = _create(contract, direct_vm, funder)
    program = json.loads(contract.get_program(program_id))
    assert program["funder"] == str(create_address("default_sender")).lower()
    assert program["funded_wei"] == str(5 * WEI)
    assert [m["status"] for m in program["milestones"]] == ["OPEN", "LOCKED"]
    assert contract.get_program_counter() == 1


@pytest.mark.parametrize("sent", [0, 5 * WEI - 1, 5 * WEI + 1])
def test_wrong_funding_amount_reverts(direct_vm, direct_deploy, sent):
    contract = direct_deploy("contracts/ascende.py")
    direct_vm.value = sent
    with direct_vm.expect_revert("EXACT_FUNDING_REQUIRED"):
        contract.create_program(*_program())
    assert contract.get_program_counter() == 0


def test_invalid_recipient_and_funder_recipient_alias_revert(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/ascende.py")
    direct_vm.value = 5 * WEI
    args = list(_program(recipient="invalid"))
    with direct_vm.expect_revert("INVALID_RECIPIENT"):
        contract.create_program(*args)
    direct_vm.value = 5 * WEI
    args = list(_program(recipient=str(create_address("default_sender"))))
    with direct_vm.expect_revert("FUNDER_CANNOT_BE_RECIPIENT"):
        contract.create_program(*args)


def test_wrong_sender_cannot_submit_evidence(direct_vm, direct_deploy, direct_charlie):
    contract = direct_deploy("contracts/ascende.py")
    program_id = _create(contract, direct_vm, direct_vm.sender)
    direct_vm.sender = direct_charlie
    with direct_vm.expect_revert("RECIPIENT_ONLY"):
        contract.submit_evidence(program_id, 0, _manifest())


def test_unauthorized_host_and_missing_required_evidence_revert(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/ascende.py")
    funder = direct_vm.sender
    program_id = _create(contract, direct_vm, funder)
    recipient = create_address("bob")
    with direct_vm.prank(recipient):
        with direct_vm.expect_revert("INVALID_OR_UNAUTHORIZED_MANIFEST"):
            contract.submit_evidence(program_id, 0, _manifest("https://evil.example/path", BODY_A))
        with direct_vm.expect_revert("INVALID_OR_UNAUTHORIZED_MANIFEST"):
            contract.submit_evidence(program_id, 0, "[]")


@pytest.mark.parametrize("field", ["sha256", "byte_length"])
def test_manifest_is_not_trusted_until_exact_source_bytes_are_checked(direct_vm, direct_deploy, direct_bob, field):
    contract = direct_deploy("contracts/ascende.py")
    program_id = _create(contract, direct_vm, direct_vm.sender)
    direct_vm.sender = direct_bob
    manifest = json.loads(_manifest())
    manifest[0][field] = ("0" * 64) if field == "sha256" else manifest[0][field] + 1
    contract.submit_evidence(program_id, 0, json.dumps(manifest))
    direct_vm.mock_web(URL_A, {"status": 200, "body": BODY_A})
    assert contract.evaluate_milestone(program_id, 0) == "SOURCE_UNAVAILABLE"


def test_stage_two_cannot_be_submitted_before_stage_one_qualifies(direct_vm, direct_deploy, direct_bob):
    contract = direct_deploy("contracts/ascende.py")
    program_id = _create(contract, direct_vm, direct_vm.sender)
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("MILESTONE_NOT_OPEN"):
        contract.submit_evidence(program_id, 1, _manifest(URL_B, BODY_B))


def test_qualified_milestone_is_only_provisional_until_window_closes(direct_vm, direct_deploy, direct_bob):
    contract = direct_deploy("contracts/ascende.py")
    program_id = _create(contract, direct_vm, direct_vm.sender)
    assert _seal_and_evaluate(contract, direct_vm, direct_bob, program_id) == "QUALIFIED"
    program = json.loads(contract.get_program(program_id))
    assert program["milestones"][0]["status"] == "PROVISIONAL_QUALIFIED"
    assert program["milestones"][1]["status"] == "LOCKED"
    assert program["earned_claimable_wei"] == "0"


def test_validator_disagreement_rejects_consensus(direct_vm, direct_deploy, direct_bob):
    contract = direct_deploy("contracts/ascende.py")
    program_id = _create(contract, direct_vm, direct_vm.sender)
    direct_vm.sender = direct_bob
    contract.submit_evidence(program_id, 0, _manifest())
    direct_vm.mock_web(URL_A, {"status": 200, "body": BODY_A})
    direct_vm.mock_llm("independent milestone evidence evaluator", json.dumps({"classification": "QUALIFIED"}))
    assert contract.evaluate_milestone(program_id, 0) == "QUALIFIED"
    direct_vm.clear_mocks()
    direct_vm.mock_web(URL_A, {"status": 200, "body": BODY_A})
    direct_vm.mock_llm("independent milestone evidence evaluator", json.dumps({"classification": "NOT_QUALIFIED"}))
    assert direct_vm.run_validator() is False


@pytest.mark.parametrize("status,body", [(503, BODY_A), (200, b"changed")])
def test_source_failure_is_retryable_not_business_denial(direct_vm, direct_deploy, direct_bob, status, body):
    contract = direct_deploy("contracts/ascende.py")
    program_id = _create(contract, direct_vm, direct_vm.sender)
    direct_vm.sender = direct_bob
    contract.submit_evidence(program_id, 0, _manifest())
    direct_vm.mock_web(URL_A, {"status": status, "body": body})
    assert contract.evaluate_milestone(program_id, 0) == "SOURCE_UNAVAILABLE"
    program = json.loads(contract.get_program(program_id))
    assert program["milestones"][0]["status"] == "RETRYABLE"
    assert program["earned_claimable_wei"] == "0"


def test_invalid_model_output_is_retryable(direct_vm, direct_deploy, direct_bob):
    contract = direct_deploy("contracts/ascende.py")
    program_id = _create(contract, direct_vm, direct_vm.sender)
    direct_vm.sender = direct_bob
    contract.submit_evidence(program_id, 0, _manifest())
    direct_vm.mock_web(URL_A, {"status": 200, "body": BODY_A})
    direct_vm.mock_llm("independent milestone evidence evaluator", json.dumps({"classification": "PAY_10_GEN"}))
    assert contract.evaluate_milestone(program_id, 0) == "MODEL_OUTPUT_INVALID"


def test_not_qualified_finalization_stops_stage_and_refunds_unused_only(direct_vm, direct_deploy, direct_bob):
    contract = direct_deploy("contracts/ascende.py")
    program_id = _create(contract, direct_vm, direct_vm.sender)
    assert _seal_and_evaluate(contract, direct_vm, direct_bob, program_id, "NOT_QUALIFIED") == "NOT_QUALIFIED"
    _advance(direct_vm, 120)
    assert contract.finalize_milestone(program_id, 0) == "FINAL_NOT_QUALIFIED"
    assert contract.close_program(program_id) == "CLOSED_STOPPED"
    accounting = json.loads(contract.get_program_accounting(program_id))
    assert accounting["locked_wei"] == "0"
    assert accounting["refund_claimable_wei"] == str(5 * WEI)
    assert accounting["earned_claimable_wei"] == "0"


def test_challenge_requires_exact_bond_and_new_manifest(direct_vm, direct_deploy, direct_bob):
    contract = direct_deploy("contracts/ascende.py")
    program_id = _create(contract, direct_vm, direct_vm.sender)
    _seal_and_evaluate(contract, direct_vm, direct_bob, program_id)
    direct_vm.sender = direct_bob
    direct_vm.value = 1
    with direct_vm.expect_revert("EXACT_CHALLENGE_BOND_REQUIRED"):
        contract.challenge_milestone(program_id, 0, _manifest(URL_B, BODY_B))
    direct_vm.value = WEI // 10
    with direct_vm.expect_revert("CHALLENGE_REQUIRES_NEW_EVIDENCE"):
        contract.challenge_milestone(program_id, 0, _manifest())


def test_challenge_replay_is_rejected(direct_vm, direct_deploy, direct_bob):
    contract = direct_deploy("contracts/ascende.py")
    program_id = _create(contract, direct_vm, direct_vm.sender)
    _seal_and_evaluate(contract, direct_vm, direct_bob, program_id)
    direct_vm.sender = direct_bob
    direct_vm.value = WEI // 10
    contract.challenge_milestone(program_id, 0, _manifest(URL_B, BODY_B))
    with direct_vm.expect_revert("CHALLENGE_ALREADY_USED"):
        contract.challenge_milestone(program_id, 0, _manifest(URL_B, BODY_B))


def test_losing_challenger_bond_can_be_withdrawn_once(direct_vm, direct_deploy, direct_bob):
    contract = direct_deploy("contracts/ascende.py")
    funder = direct_vm.sender
    program_id = _create(contract, direct_vm, funder)
    _seal_and_evaluate(contract, direct_vm, direct_bob, program_id, "QUALIFIED")
    direct_vm.sender = direct_bob
    direct_vm.value = WEI // 10
    contract.challenge_milestone(program_id, 0, _manifest(URL_B, BODY_B))
    direct_vm.mock_web(URL_B, {"status": 200, "body": BODY_B})
    direct_vm.mock_llm("independent milestone evidence evaluator", json.dumps({"classification": "QUALIFIED"}))
    assert contract.resolve_challenge(program_id, 0) == "QUALIFIED"
    direct_vm.sender = funder
    operation_id = contract.request_bond_withdrawal(program_id, str(WEI // 10))
    attempt = json.loads(contract.get_transfer_attempt(program_id, str(operation_id)))
    accounting = json.loads(contract.get_program_accounting(program_id))
    assert attempt["purpose"] == "CHALLENGE_BOND"
    assert attempt["status"] == "AUTHORIZED"
    assert accounting["bond_authorized_wei"] == str(WEI // 10)
    contract.submit_payment(program_id, str(operation_id))
    attempt = json.loads(contract.get_transfer_attempt(program_id, str(operation_id)))
    assert attempt["status"] == "TRANSFER_SUBMITTED"
    accounting = json.loads(contract.get_program_accounting(program_id))
    assert accounting["bond_pending_wei"] == str(WEI // 10)
    with direct_vm.expect_revert("BOND_WITHDRAWAL_EXCEEDS_CLAIM"):
        contract.request_bond_withdrawal(program_id, str(WEI // 10))


def test_unresolved_attempts_never_become_denial_and_then_unlock_refund(direct_vm, direct_deploy, direct_bob):
    contract = direct_deploy("contracts/ascende.py")
    program_id = _create(contract, direct_vm, direct_vm.sender)
    direct_vm.sender = direct_bob
    contract.submit_evidence(program_id, 0, _manifest())
    direct_vm.mock_web(URL_A, {"status": 503, "body": ""})
    assert contract.evaluate_milestone(program_id, 0) == "SOURCE_UNAVAILABLE"
    _advance(direct_vm, 120)
    assert contract.evaluate_milestone(program_id, 0) == "SOURCE_UNAVAILABLE"
    _advance(direct_vm, 120)
    assert contract.finalize_unresolved(program_id, 0) == "FINAL_UNRESOLVED"
    assert contract.close_program(program_id) == "CLOSED_STOPPED"
    account = json.loads(contract.get_program_accounting(program_id))
    assert account["earned_wei"] == "0"
    assert account["refund_claimable_wei"] == str(5 * WEI)


def test_pending_payment_is_not_delivered_and_cannot_be_replayed(direct_vm, direct_deploy, direct_bob):
    contract = direct_deploy("contracts/ascende.py")
    program_id = _create(contract, direct_vm, direct_vm.sender)
    assert _seal_and_evaluate(contract, direct_vm, direct_bob, program_id) == "QUALIFIED"
    _advance(direct_vm, 120)
    contract.finalize_milestone(program_id, 0)
    direct_vm.sender = direct_bob
    operation_id = contract.request_withdrawal(program_id, str(WEI))
    attempt = json.loads(contract.get_transfer_attempt(program_id, str(int(operation_id))))
    assert attempt["status"] == "AUTHORIZED"
    assert attempt["destination"] == "0x" + direct_bob.hex()
    assert attempt["amount_wei"] == str(WEI)
    accounting = json.loads(contract.get_program_accounting(program_id))
    assert accounting["recipient_authorized_wei"] == str(WEI)
    assert accounting["recipient_pending_wei"] == "0"
    contract.submit_payment(program_id, str(int(operation_id)))
    attempt = json.loads(contract.get_transfer_attempt(program_id, str(int(operation_id))))
    assert attempt["status"] == "TRANSFER_SUBMITTED"
    with direct_vm.expect_revert("PAYMENT_ALREADY_SUBMITTED_OR_CLOSED"):
        contract.submit_payment(program_id, str(int(operation_id)))
    contract.mark_transfer_unresolved(program_id, str(int(operation_id)))
    attempt = json.loads(contract.get_transfer_attempt(program_id, str(int(operation_id))))
    assert attempt["status"] == "DELIVERY_UNRESOLVED"
    with direct_vm.expect_revert("PAYMENT_ALREADY_SUBMITTED_OR_CLOSED"):
        contract.submit_payment(program_id, str(int(operation_id)))
    accounting = json.loads(contract.get_program_accounting(program_id))
    assert accounting["recipient_pending_wei"] == str(WEI)
    assert accounting["recipient_delivered_wei"] == "0"
    assert accounting["earned_claimable_wei"] == str(WEI)
    with direct_vm.expect_revert("WITHDRAWAL_EXCEEDS_EARNED_CLAIM"):
        contract.request_withdrawal(program_id, str(2 * WEI))


def test_funder_cannot_withdraw_recipient_entitlement(direct_vm, direct_deploy, direct_bob):
    contract = direct_deploy("contracts/ascende.py")
    funder = direct_vm.sender
    program_id = _create(contract, direct_vm, funder)
    assert _seal_and_evaluate(contract, direct_vm, direct_bob, program_id) == "QUALIFIED"
    _advance(direct_vm, 120)
    contract.finalize_milestone(program_id, 0)
    direct_vm.sender = funder
    with direct_vm.expect_revert("RECIPIENT_ONLY"):
        contract.request_withdrawal(program_id, str(WEI))


def test_program_accounting_conserves_principal_after_vest_and_submission(direct_vm, direct_deploy, direct_bob):
    contract = direct_deploy("contracts/ascende.py")
    program_id = _create(contract, direct_vm, direct_vm.sender)
    assert _seal_and_evaluate(contract, direct_vm, direct_bob, program_id) == "QUALIFIED"
    _advance(direct_vm, 120)
    contract.finalize_milestone(program_id, 0)
    direct_vm.sender = direct_bob
    contract.request_withdrawal(program_id, str(WEI))
    accounting = json.loads(contract.get_program_accounting(program_id))
    buckets = sum(int(accounting[key]) for key in (
        "locked_wei", "earned_claimable_wei", "recipient_authorized_wei", "funder_authorized_wei", "refund_claimable_wei",
        "recipient_pending_wei", "recipient_delivered_wei", "funder_pending_wei", "funder_refunded_wei"))
    assert buckets == int(accounting["funded_wei"])
