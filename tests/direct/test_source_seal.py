import hashlib
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
                "authority_summary": "The city page is an authoritative primary source.",
                "source_assessments": [
                    {
                        "url": "https://example.com/evidence",
                        "publisher": "Example City Council",
                        "authority_level": "HIGH",
                        "is_primary_source": True,
                        "independence_group": "Example City Council",
                        "reason": "The council is the primary decision-making body.",
                    }
                ],
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
    assert verdict["trust_gate_passed"] is True
    assert verdict["independent_source_groups"] == 1
    assert verdict["evidence_content_hashes"] == [
        {
            "url": "https://example.com/evidence",
            "content_sha256": hashlib.sha256(
                b"The city council approved the solar project on 12 June."
            ).hexdigest(),
            "content_bytes": 55,
        }
    ]
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
                "counter_authority_summary": "The correction is an authoritative primary record.",
                "counter_source_assessments": [
                    {
                        "url": "https://example.com/correction",
                        "publisher": "Example City Council",
                        "authority_level": "HIGH",
                        "is_primary_source": True,
                        "independence_group": "Example City Council",
                        "reason": "It is the issuing body's formal correction.",
                    }
                ],
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
    assert revision["counter_trust_gate_passed"] is True
    assert revision["content_drift_detected"] is False
    assert len(revision["counter_evidence_content_hashes"][0]["content_sha256"]) == 64
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


def test_blocks_conclusive_verdict_without_trusted_sources(
    direct_vm, direct_deploy, direct_alice
):
    contract = direct_deploy("contracts/source_seal.py")
    direct_vm.sender = direct_alice
    direct_vm.mock_web(
        r"https://blog\.example/evidence",
        {"status": 200, "body": "An unattributed blog repeats the claim."},
    )
    direct_vm.mock_llm(
        r".*evidence analyst operating.*",
        json.dumps(
            {
                "verdict": "SUPPORTED",
                "confidence": "LOW",
                "summary": "The blog repeats the claim.",
                "key_evidence": "An unattributed statement.",
                "quality_score": 20,
                "source_diversity": "LOW",
                "citations": ["https://blog.example/evidence"],
                "risk_flags": ["No identifiable authority."],
                "sources_reviewed": 1,
                "authority_summary": "The source does not pass the trust policy.",
                "source_assessments": [
                    {
                        "url": "https://blog.example/evidence",
                        "publisher": "Unknown blog",
                        "authority_level": "LOW",
                        "is_primary_source": False,
                        "independence_group": "Unknown blog",
                        "reason": "No accountable author or primary record.",
                    }
                ],
            }
        ),
    )
    direct_vm.mock_llm(
        r".*independent blockchain validator.*",
        json.dumps({"acceptable": True, "reason": "The page was inspected."}),
    )

    with direct_vm.expect_revert(
        "A conclusive verdict requires an authoritative primary source"
    ):
        contract.verify_claim(
            "claim-test-005",
            "This claim should not pass the source trust boundary.",
            "https://blog.example/evidence",
        )


def test_validates_evidence_content_hash_manifest(direct_deploy):
    contract = direct_deploy("contracts/source_seal.py")
    urls = ["https://example.com/evidence"]
    valid = [
        {
            "url": urls[0],
            "content_sha256": "a" * 64,
            "content_bytes": 42,
        }
    ]

    assert contract._valid_content_hashes(valid, urls) is True
    assert contract._valid_content_hashes(
        [{**valid[0], "content_sha256": "not-a-sha256"}],
        urls,
    ) is False
    assert contract._valid_content_hashes(
        [{**valid[0], "url": "https://example.com/other"}],
        urls,
    ) is False
