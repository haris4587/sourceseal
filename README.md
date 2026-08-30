# SourceSeal Recheck Protocol

SourceSeal is a consensus-backed claim verifier built on GenLayer. The accepted
version produced a single persistent verdict from public web evidence. This
milestone turns that verdict into a challengeable, append-only case file.

Live app: https://sourceseal.ansaf1st33.chatgpt.site

## Milestone deployment

- Contract: `0x43bD65C68220D08b20793208d50F9F59dEDd7691`
- Explorer: https://explorer-studio.genlayer.com/address/0x43bD65C68220D08b20793208d50F9F59dEDd7691
- Deployment transaction: https://explorer-studio.genlayer.com/tx/0xa5fdaba494a81340088dff6a89a049f6e35f66082af1e8c635c9eebd0ce0636d
- Finalized initial verdict: https://explorer-studio.genlayer.com/tx/0x2dfceaca3abfb4a7b11906c5dce6d19d40b2b86f69a38297cc183006b417275d
- Finalized counter-evidence challenge: https://explorer-studio.genlayer.com/tx/0xa7606e15d31ddd6a47b785e737c5f43687c48221db6a753bfb5ada12f794b960
- Milestone evidence: https://sourceseal.ansaf1st33.chatgpt.site/milestone

Accepted baseline contract:
`0xC9425eC2f9899473a3A403550C6241CBC3d5224e`

## Meaningful delta from the accepted project

| Area | Accepted SourceSeal | Milestone v2 |
| --- | --- | --- |
| Decision model | One-shot verdict | Challengeable canonical case file |
| Evidence | 1–3 URLs | 1–5 URLs plus counter-evidence |
| Quality signal | Confidence only | 0–100 quality, diversity, citations, and risk flags |
| Provenance | Claim ID | SHA-256 fingerprints for claims and challenges |
| History | Single record | Append-only linked revisions and canonical latest verdict |
| Contract API | `verify_claim` and 3 views | `challenge_claim` and 7 total public methods |

## Why GenLayer is central

The protocol requires capabilities ordinary deterministic smart contracts do
not have:

- live public-web retrieval inside GenVM;
- LLM reasoning over unstructured original and counter-evidence;
- independent validator recomputation;
- semantic consensus before a verdict or revision is accepted; and
- queryable, persistent claim and challenge records.

## Contract workflow

### Initial verification

1. Validate the claim and 1–5 HTTPS evidence URLs.
2. Fingerprint the exact claim and URL set with SHA-256.
3. Fetch each page inside the non-deterministic GenVM block.
4. Return a verdict, quality score, source diversity, citations, and risk flags.
5. Have validators independently check the complete proposed result.
6. Store the accepted initial case file.

### Challenge and re-adjudication

1. Reference an existing claim ID.
2. Add a challenge reason and 1–5 counter-evidence URLs.
3. Fingerprint the challenge inputs.
4. Re-fetch the original and new evidence.
5. Have validators decide `UPHELD`, `OVERTURNED`, or
   `INSUFFICIENT_COUNTER_EVIDENCE`.
6. Preserve the initial record, append the revision, and update the canonical
   latest verdict.

## Reviewable source

- `contracts/source_seal.py` — milestone Intelligent Contract
- `tests/direct/test_source_seal.py` — initial, challenge, and URL-safety tests
- `app/page.tsx` — Verify / Challenge / Inspect GenLayerJS interface
- `app/milestone/page.tsx` — public before/after milestone evidence
- `public/evidence/` — controlled initial and correction sources for live tests

## Verified live recheck

The full-consensus test used claim ID `sourceseal-live-2026-001` and revision
ID `sourceseal-revision-2026-001`.

1. The initial single-source fixture was finalized as
   `INSUFFICIENT_EVIDENCE` with quality score `25` and submission fingerprint
   `412fdff4f6008b93e23425a7a716871b3bbd8da340193e156c4caae7c3bdea81`.
2. A later correction was submitted as material counter-evidence.
3. Validators finalized the challenge as `OVERTURNED` with quality score `85`
   and challenge fingerprint
   `44792a20a755648c1df1eb091e79e8c9c21464b3ae34b8fb0219dbc77dcf98de`.
4. The queryable canonical record now reports `CONTRADICTED` and
   `CHALLENGED_OVERTURNED`, while the original verdict remains preserved in the
   append-only case file.
