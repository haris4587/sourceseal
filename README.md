# SourceSeal Recheck Protocol

SourceSeal is a consensus-backed claim verifier built on GenLayer. The accepted
version produced one persistent verdict from public web evidence. This milestone
turns that verdict into a challengeable, append-only case file and closes the
evidence trust-boundary issues identified in the acceptance review.

Live app: https://sourceseal.ansaf1st33.chatgpt.site

## Hardened milestone deployment

- Contract: `0x3ce1bd5ba7CEDAabd60CB1f7276f4B0a6e89c70e`
- Explorer: https://explorer-studio.genlayer.com/address/0x3ce1bd5ba7CEDAabd60CB1f7276f4B0a6e89c70e
- Deployment transaction: https://explorer-studio.genlayer.com/tx/0xaa099ce379a187c35338945e6334e6970138af227a55a0234279099d43ef8a09
- Authoritative-source proof: https://explorer-studio.genlayer.com/tx/0x065cd048db8dd0e14f10b14298ccde01911e9de5ad6a3a4986793732775bb03e
- Earlier finalized recheck proof: https://explorer-studio.genlayer.com/tx/0xa7606e15d31ddd6a47b785e737c5f43687c48221db6a753bfb5ada12f794b960
- Milestone evidence: https://sourceseal.ansaf1st33.chatgpt.site/milestone

Accepted baseline contract:
`0xC9425eC2f9899473a3A403550C6241CBC3d5224e`

## Staff feedback closed

The accepted project review requested two specific improvements.

1. **Independent or authoritative source validation.** A conclusive
   `SUPPORTED` or `CONTRADICTED` verdict now requires either one `HIGH`-authority
   primary source or two independent `MEDIUM`/`HIGH` publisher groups. The
   contract stores every source assessment and rejects a conclusive result when
   the trust gate fails.
2. **Evidence-content hashes.** SourceSeal now hashes the fetched response body
   for every URL with SHA-256 and stores the URL, byte length, and digest with
   the verdict. Challenges re-fetch original evidence and record whether the
   content changed.

The full-consensus proof used claim ID `sourceseal-trust-2026-003` and the
official GenLayer Optimistic Democracy documentation. The resulting record is
`SUPPORTED` with `trust_gate_passed: true`, a `HIGH`/primary GenLayer source
assessment, and this stored evidence-body hash:

`29753ccc2c91b12d0bd9203e0dbe3b6362be147bbde52c021b9706a055fceb97`

## Meaningful delta from the accepted project

| Area | Accepted SourceSeal | Hardened milestone |
| --- | --- | --- |
| Decision model | One-shot verdict | Challengeable canonical case file |
| Evidence | 1–3 URLs | 1–5 URLs plus counter-evidence |
| Source trust | No binding authority requirement | Hard primary-authority / independence gate |
| Evidence integrity | Claim ID only | SHA-256 of every fetched evidence body plus drift detection |
| Quality signal | Confidence only | 0–100 quality, diversity, citations, risk flags, authority assessments |
| History | Single record | Append-only linked revisions and canonical latest verdict |
| Contract API | `verify_claim` and 3 views | `challenge_claim` and 7 total public methods |

## Why GenLayer is central

The protocol requires capabilities ordinary deterministic smart contracts do
not have:

- live public-web retrieval inside GenVM;
- LLM reasoning over unstructured original and counter-evidence;
- independent validator review;
- semantic consensus before a verdict or revision is accepted; and
- queryable, persistent claim, trust, hash, and challenge records.

## Contract workflow

### Initial verification

1. Validate the claim and 1–5 HTTPS evidence URLs.
2. Fingerprint the exact claim and URL set with SHA-256.
3. Fetch every page and hash its response body inside the non-deterministic
   GenVM block.
4. Classify each publisher, authority level, primary-source status, and
   independence group.
5. Enforce the trust gate before allowing a conclusive verdict.
6. Store the verdict, authority manifest, evidence-content hashes, quality
   score, citations, and risk flags.

### Challenge and re-adjudication

1. Reference an existing claim ID.
2. Add a challenge reason and 1–5 counter-evidence URLs.
3. Re-fetch the original and new evidence and preserve new body hashes.
4. Detect whether original evidence content drifted after the first verdict.
5. Require trusted counter-evidence before an `OVERTURNED` resolution.
6. Preserve the initial record, append the revision, and update the canonical
   latest verdict.

## Reviewable source

- `contracts/source_seal.py` — hardened milestone Intelligent Contract
- `tests/direct/test_source_seal.py` — trust-gate, hashing, challenge, and URL-safety tests
- `app/page.tsx` — Verify / Challenge / Inspect GenLayerJS interface
- `app/milestone/page.tsx` — public before/after milestone evidence
- `public/evidence/` — controlled historical recheck fixtures

## Earlier verified recheck

The earlier v2 full-consensus flow used claim ID `sourceseal-live-2026-001` and
revision ID `sourceseal-revision-2026-001`. An initial
`INSUFFICIENT_EVIDENCE` record was later challenged and finalized as
`OVERTURNED`, producing the canonical verdict `CONTRADICTED` while preserving
the original record. That proof demonstrates append-only re-adjudication; the
new deployment above adds the binding trust gate and evidence-body hashes.
