# SourceSeal Evidence Finality Protocol

SourceSeal is a consensus-backed claim verifier built on GenLayer. The accepted
project already supported authoritative-source checks, evidence-body hashing,
and append-only re-adjudication. Milestone v3 completes the lifecycle with a
fixed challenge window and deterministic finalization.

Production app (milestone v3):
https://sourceseal.netlify.app

Historical ChatGPT Sites deployment (accepted-project v2):
https://sourceseal.ansaf1st33.chatgpt.site

## Studio Next deployment

- Contract: `0xAEaFfe2543d72AdBcbeAff51BFd60400E2C4B6d2`
- Explorer: https://explorer-studio-dev.genlayer.com/address/0xAEaFfe2543d72AdBcbeAff51BFd60400E2C4B6d2
- Network: Studio Next (chain ID 61997)

## Historical milestone v3 proof

The transactions below belong to the previous Studionet v3 deployment and are
retained as historical evidence:

- Previous v3 contract: `0x94dc4ecE268F2791cbDDa7ad339DAe67443193a6`
- Previous explorer: https://explorer-studio.genlayer.com/address/0x94dc4ecE268F2791cbDDa7ad339DAe67443193a6
- Deployment transaction: https://explorer-studio.genlayer.com/tx/0x74445031d7711ff6b449f97e37a5a5121d7b0be20637d4fdd16f965a7f1a57e9
- Full-consensus verification: https://explorer-studio.genlayer.com/tx/0xb72eff22922880448c052c3441fe32d289b49beeaa5d4ba3cd50d6c904a4625d
- Independent challenge: https://explorer-studio.genlayer.com/tx/0x61764efefe5adadd0bafbad04946e569dd908c566e4130494dd0f08aae63b27b
- Early-finalization guard: https://explorer-studio.genlayer.com/tx/0x859ba4a8f3eaf9a60828be0b9862ef2b91876e1aac207b20484a84499f56c5fc
- Milestone evidence page: https://sourceseal.netlify.app/milestone
- Published contract source: https://sourceseal.netlify.app/source

Accepted baseline contract:
`0xC9425eC2f9899473a3A403550C6241CBC3d5224e`

Previous hardened milestone contract:
`0x3ce1bd5ba7CEDAabd60CB1f7276f4B0a6e89c70e`

## What v3 adds

| Area | Previous milestone | Milestone v3 |
| --- | --- | --- |
| Lifecycle | Challengeable record with no closing state | Seven-day challenge window and permissionless finalization |
| Participants | Submitter could recheck their own record | Original submitter cannot challenge their own claim |
| Evidence ingress | Public HTTPS URL validation | Blocks credentials, fragments, non-443 ports, local/private hosts, duplicates, oversized URLs, empty bodies, and responses over 300 KB |
| Challenge bounds | Unbounded append-only revisions | Maximum ten revisions per claim |
| Policy provenance | Stored authority assessment | `SOURCESEAL_AUTHORITY_V3` plus an immutable source-policy hash |
| Read access | Wallet-oriented interface | Walletless claim, revision, and deadline inspection |
| Final state | Latest canonical verdict | Immutable `FINALIZED` record with verdict, time, and finalizer |
| Public API | Seven methods | Eleven methods including `get_case_status` and `finalize_claim` |
| Delivery | Manual checks | GitHub CI for TypeScript, lint, production build, UI tests, and Python syntax |

## Live consensus evidence

The live v3 proof uses claim ID `sourceseal-finality-2026-001`:

> GenLayer Intelligent Contracts can access deterministic transaction time
> through the transaction context.

The contract fetched the official GenLayer transaction-context documentation
and produced a `SUPPORTED` result through validator consensus with:

- confidence `HIGH`;
- quality score `95`;
- `trust_gate_passed: true`;
- source policy version `SOURCESEAL_AUTHORITY_V3`;
- evidence body size `273,516` bytes;
- evidence SHA-256
  `59fc391d06c73439e97ebd4f56dfae9edc9b2669b21fdc613a82750e0adec7ac`;
- source-policy SHA-256
  `1587c6046cefd339333d9ac94353adce166c1dc6fef8b0c1b71e9eb8f1dee8a9`;
- submission fingerprint
  `2609b08f8ea729d1c797d832f0a4a49843e467c3d17347e2e202d9fb9d7e49f9`;
- deterministic challenge deadline `1790105895`; and
- initial state `CHALLENGE_WINDOW_OPEN`.

A different Studio wallet (`0xdD4c…83fc`) submitted revision
`sourceseal-finality-recheck-001`. Validators returned `UPHELD`, preserved the
canonical `SUPPORTED` verdict, scored the recheck `94`, and stored challenge
fingerprint
`511253fbc6b639c3fd34d3e0e42882e1b8e950ae7d03d040a8279f1d2aa734e9`.
Because the official documentation is dynamically rendered, the recheck also
demonstrated evidence-body drift detection.

The early-finalization transaction reached consensus but made no state change:
`get_case_status` still returned `can_finalize: false`, an empty final verdict,
and `CHALLENGE_WINDOW_OPEN`. This proves the on-chain deadline guard, rather
than relying on a disabled UI button.

## Contract workflow

### Initial verification

1. Validate the claim and one to five public HTTPS evidence URLs.
2. Apply strict URL and response-size policy before model execution.
3. Fingerprint the claim, URL set, and versioned trust rule with SHA-256.
4. Fetch and hash every evidence body inside GenVM.
5. Require one authoritative primary source or two independent trusted
   publisher groups for a conclusive verdict.
6. Store the record with deterministic creation and challenge-deadline times.

### Challenge and re-adjudication

1. Require a different wallet from the original submitter.
2. Accept challenges only before the stored deadline and below the ten-revision
   cap.
3. Re-fetch original and counter-evidence, retaining fresh hashes and content
   drift status.
4. Preserve every linked revision and update only the canonical current view.

### Finalization

1. Expose the live deadline and eligibility through `get_case_status`.
2. Reject finalization before the seven-day window closes.
3. After the deadline, seal the current verdict as `final_verdict` and store the
   deterministic finalization time and caller.
4. Reject subsequent challenges and repeated finalization.

## Why GenLayer is central

SourceSeal depends on live web retrieval inside GenVM, LLM reasoning over
unstructured evidence, independent validator review, semantic consensus, and
persistent on-chain case history. An ordinary deterministic smart contract
cannot perform that evidence adjudication by itself.

## Reviewable source and verification

- `contracts/source_seal.py` — milestone v3 Intelligent Contract
- `tests/direct/test_source_seal.py` — trust, URL safety, challenge, deadline,
  and finalization tests
- `app/page.tsx` — Verify / Challenge / Inspect / Finalize GenLayerJS interface
- `app/milestone/page.tsx` — public delta and deployment evidence
- `.github/workflows/ci.yml` — repeatable project verification

Local checks:

```bash
npm ci
npx tsc --noEmit
npm run lint
npm test
python -m py_compile contracts/source_seal.py tests/direct/test_source_seal.py
```
