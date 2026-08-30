import json


def mock_initial_verdict(direct_vm):
    direct_vm.mock_llm(
        r".*evidence analyst operating.*",
        json.dumps(
            {
                "verdict": "SUPPORTED",
                "confidence": "HIGH",
                "summary": "The supplied sources directly confirm the approval.",
                "key_evidence": "The council approved the solar project on 12 June.",
                "quality_score": 88,
                "source_diversity": "MEDIUM",
                "citations": ["https://example.com/evidence"],
                "risk_flags": ["Only one publisher is represented."],
                "sources_reviewed": 1,
            }
        ),
    )
    direct_vm.mock_llm(
        r".*independent blockchain validator.*",
        json.dumps(
            {
                "acceptable": True,
                "reason": "The verdict and score follow from the source.",
            }
        ),
    )


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
    mock_initial_verdict(direct_vm)

    contract.verify_claim(
        "claim-test-001",
        "The city council approved the solar project.",
        "https://example.com/evidence",
    )

    verdict = json.loads(contract.get_verdict("claim-test-001"))
    assert verdict["current_verdict"] == "SUPPORTED"
    assert verdict["quality_score"] == 88
    assert verdict["status"] == "UNCHALLENGED"
    assert len(verdict["submission_fingerprint"]) == 64
    assert contract.get_total_verdicts() == 1
    assert contract.get_total_challenges() == 0


def test_challenge_can_overturn_and_preserve_revision(
    direct_vm, direct_deploy, direct_alice
):
    contract = direct_deploy("contracts/source_seal.py")
    direct_vm.sender = direct_alice
    direct_vm.mock_web(
        r"https://example\.com/evidence",
        {"status": 200, "body": "The proposal was initially approved."},
    )
    direct_vm.mock_web(
        r"https://example\.com/correction",
        {"status": 200, "body": "The approval was formally withdrawn."},
    )
    mock_initial_verdict(direct_vm)
    contract.verify_claim(
        "claim-test-002",
        "The city council approved the solar project.",
        "https://example.com/evidence",
    )

    direct_vm.mock_llm(
        r".*append-only challenge.*",
        json.dumps(
            {
                "resolution": "OVERTURNED",
                "canonical_verdict": "CONTRADICTED",
                "confidence": "HIGH",
                "rationale": "A later official correction withdrew the approval.",
                "decisive_evidence": "The approval was formally withdrawn.",
                "quality_score": 94,
                "citations": ["https://example.com/correction"],
            }
        ),
    )
    direct_vm.mock_llm(
        r".*independent validator reviewing.*",
        json.dumps(
            {
                "acceptable": True,
                "reason": "The official correction materially changes the record.",
            }
        ),
    )

    contract.challenge_claim(
        "revision-test-001",
        "claim-test-002",
        "A newer official correction says that the approval was withdrawn.",
        "https://example.com/correction",
    )

    verdict = json.loads(contract.get_verdict("claim-test-002"))
    revision = json.loads(contract.get_revision("revision-test-001"))
    assert verdict["original_verdict"] == "SUPPORTED"
    assert verdict["current_verdict"] == "CONTRADICTED"
    assert verdict["status"] == "CHALLENGED_OVERTURNED"
    assert verdict["revision_count"] == 1
    assert revision["prior_verdict"] == "SUPPORTED"
    assert revision["canonical_verdict"] == "CONTRADICTED"
    assert json.loads(contract.get_revision_ids("claim-test-002")) == [
        "revision-test-001"
    ]
    assert contract.get_total_challenges() == 1


def test_rejects_insecure_and_duplicate_urls(
    direct_vm, direct_deploy, direct_alice
):
    contract = direct_deploy("contracts/source_seal.py")
    direct_vm.sender = direct_alice

    with direct_vm.expect_revert("Evidence URLs must begin with https://"):
        contract.verify_claim(
            "claim-test-003",
            "This claim is long enough to be checked.",
            "http://example.com/evidence",
        )

    with direct_vm.expect_revert("Duplicate evidence URLs are not allowed"):
        contract.verify_claim(
            "claim-test-004",
            "This claim is long enough to be checked.",
            "https://example.com/evidence\nhttps://example.com/evidence",
        )
