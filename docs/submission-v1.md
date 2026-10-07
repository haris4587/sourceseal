# Milestone v1 and proposed project update — ready to paste

The replacement site is published. Walletless reads and JSON exports were
tested on both networks in the hosted browser. Portal forms have not been filed.

Contribution type: Builder → Milestones
Linked project: SourceSeal: Consensus-Backed Claim Verifier
Contribution date: 10/07/2026
Title: SourceSeal v1: Portable Evidence Review and Immutable First Decisions

## Changes & Improvements (under 1,000 characters)

Added a portable evidence-review workflow to the existing SourceSeal app. The contract now preserves the complete first decision separately from the canonical record and exposes get_review_bundle for the original assessment, current verdict, ordered challenge revisions and deadline in one read. The app adds walletless JSON receipt export, network-scoped review links, plain-language steps and use cases, and a direct Studio built-in-account route. Evidence checks now require HTTP 2xx, normalize default HTTPS ports for duplicate detection, and bound stored hash manifests. Added focused regression tests and contract-test CI. Deployed and tested separate Studionet and Studio Dev contracts using built-in accounts; GitHub records their addresses, source variants and live evidence. The existing seven-day window and verdict outcomes remain. Published the replacement Netlify site and verified live reads/exports; the wallet warning is not claimed resolved.

## Evidence links

- Website: https://sourceseal-v1.netlify.app/
- Milestone: https://sourceseal-v1.netlify.app/milestone
- Implemented code: https://github.com/haris4587/sourceseal/commit/0b0380f19eb7802f577bc2e9cea03a0305481748
- Changes from baseline: https://github.com/haris4587/sourceseal/compare/087dc1c5a59ca60a450c1b3eee2ac7e0a5a85b2b...e76610bbc18d55ab5b7e877a464e9e9f3666cb75

- Repository: https://github.com/haris4587/sourceseal
- Required Dev contract: https://explorer-studio-dev.genlayer.com/address/0xaA978B24a42005aed411E5f71b82dF674656c50E
- Normal contract: https://explorer-studio.genlayer.com/address/0xaf5Df783aCA48743f13A2B60576FAb07241325f3
- Dev deployment: https://explorer-studio-dev.genlayer.com/tx/0x7ee3a93807e61fd55fe4961a065a0827df80bb489eab39ce7cfc0c91637e836a
- Dev verification: https://explorer-studio-dev.genlayer.com/tx/0xb31e436587d3daf2a95226cbcdf1c69d856f41c645bcd07069d09c96d0aa5bae
- Independent Dev challenge: https://explorer-studio-dev.genlayer.com/tx/0xdf2adc67588eb6d8991237789d0515b64ffb11fd0da51ca4f1852921ab3f6cc1
- Stable verification: https://explorer-studio.genlayer.com/tx/0x84040db5e330800be77be6a6b864151979b25924434ae63f6a49fa044d680737
- Original-snapshot regression: https://github.com/haris4587/sourceseal/blob/main/tests/direct/test_source_seal.py
- Saved Dev review receipt: https://github.com/haris4587/sourceseal/blob/main/docs/evidence/dev-review.json

Do not claim the wallet warning is fixed without independent evidence.

## Propose update — fields to change

| Field | Action |
| --- | --- |
| Name, logo and primary tag | Keep unchanged |
| One-liner | Keep the current one-liner unchanged |
| Project Explorer URL | Keep fixed; do not create another project |
| Description | Replace with the draft below |
| Website | Set https://sourceseal-v1.netlify.app/ |
| GitHub | Keep https://github.com/haris4587/sourceseal |
| Contract links | Replace the unavailable Dev address with the required current Dev contract above; optionally add the separate normal contract |
| Demo | Keep the existing video as a historical core-workflow demo; upload a new video for export/share if a demo matching the update is required. No new video was published in this work |
| How-to | Replace with the steps below |
| Expected verification outcome | Replace with the draft below |

Description draft (under 1,000 characters):

SourceSeal is a GenLayer-native app for checking factual claims against 1–5 public HTTPS evidence URLs. Validators assess fetched sources and reach consensus on SUPPORTED, CONTRADICTED or INSUFFICIENT_EVIDENCE. The contract stores source assessments, evidence hashes, timestamps and policy provenance. A different account can submit counter-evidence during a fixed seven-day window; revisions retain their evidence and content-drift result. After the deadline, any account can seal the current verdict. Milestone v1 adds a separately preserved first-decision snapshot and a single review-bundle read. Readers can inspect finalized history, export a network-scoped JSON receipt and share a claim link without a wallet. Plain-language guidance explains each step and gives a Studio built-in-test-account route for writes. URL checks, source trust gates, revision limits and deadlines remain contract-enforced. For public project claims, announcements and corrections.

How-to:

1. Open SourceSeal and select the network. Choose Inspect to read without a wallet.
2. Select Use live review example, then Load on-chain history. Review the outcome, original decision, evidence hashes and deadline.
3. Choose Export review receipt to download JSON. Choose Copy review link to share the claim and network; recipients load fresh finalized data.
4. To create a claim, choose Verify. Use the linked Studio with its built-in test account, or an optional compatible browser wallet on Studionet. Submit a claim and 1–5 public HTTPS evidence URLs; wait for transaction finalization and confirm the stored record.
5. Within seven days, use a different account to challenge with a reason and 1–5 counter-evidence URLs. Inspect again to compare the unchanged first decision with the revision and current result.
6. Read the deadline first. After it closes, any account can finalize. Early finalization is rejected, and finalized cases reject further challenges.

Expected verification outcome (under 500 characters):

The live example loads finalized state without a wallet. Exported JSON includes the selected chain/contract, unchanged first decision, current record, ordered revisions and deadline. A different account can append a challenge within seven days while the original snapshot stays unchanged. The original submitter cannot challenge. Early finalization is rejected; after the deadline any account can seal the verdict. Further challenges then fail.
