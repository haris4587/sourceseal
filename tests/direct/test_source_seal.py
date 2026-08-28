import json


def test_verify_and_read_claim(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/source_seal.py")
    direct_vm.sender = direct_alice

    direct_vm.mock_web(
        r"https://example\.com/evidence",
        {
            "status": 200,
            "body": "The city council approved the solar project on 12 June.",
        },
    )
    direct_vm.mock_llm(
        r".*Classify the claim.*",
        json.dumps(
            {
                "verdict": "SUPPORTED",
                "confidence": "HIGH",
                "summary": "The supplied source directly confirms the approval.",
                "key_evidence": "The council approved the solar project on 12 June.",
                "sources_reviewed": 1,
            }
        ),
    )
    direct_vm.mock_llm(
        r".*independent blockchain validator.*",
        json.dumps(
            {
                "acceptable": True,
                "reason": "The proposed verdict follows directly from the source.",
            }
        ),
    )

    contract.verify_claim(
        "claim-test-001",
        "The city council approved the solar project.",
        "https://example.com/evidence",
    )

    verdict = json.loads(contract.get_verdict("claim-test-001"))
    assert verdict["verdict"] == "SUPPORTED"
    assert verdict["confidence"] == "HIGH"
    assert contract.get_total_verdicts() == 1
    assert list(contract.get_recent_ids()) == ["claim-test-001"]


def test_rejects_insecure_url(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/source_seal.py")
    direct_vm.sender = direct_alice

    with direct_vm.expect_revert("Evidence URLs must begin with https://"):
        contract.verify_claim(
            "claim-test-002",
            "This claim is long enough to be checked.",
            "http://example.com/evidence",
        )
