# SourceSeal: Consensus-Backed Claim Verifier

SourceSeal evaluates public web evidence through GenLayer validator consensus,
allows independent counter-evidence during seven days, and seals a canonical
verdict while retaining on-chain history.

## Portal milestone v1 — October 7, 2026

This is an update to the existing project, based on commit
`087dc1c5a59ca60a450c1b3eee2ac7e0a5a85b2b`. The old code called its implementation
v3; that internal name is separate from the portal's first milestone numbering.
The seven-day window, source-authority gate, evidence hashing and bounded
challenges already existed and are not claimed as new work.

New work:

- Store the complete first decision in a separate `initial_records` map. A
  challenge can update the canonical summary and quality without losing the
  original assessment.
- Add `get_review_bundle(claim_id)`, a deterministic read returning the complete
  original decision, current record, ordered revisions and deadline status.
- Add walletless JSON receipt export and shareable links scoped to the network.
  Receipts identify the chain, contract, RPC and retrieval time. These are
  snapshots, not standalone cryptographic proofs of truth.
- Add plain-language use cases and workflow explanations, with direct links to
  Studio's built-in test-account route. Browser wallets remain optional for
  stable-network writes; Dev writes use Studio. No private key is placed in the
  frontend.
- Add challenge/finality preflight reads and explicitly read finalized state.
- Require HTTP 2xx evidence, normalize default HTTPS ports for duplicate checks,
  and reject oversized or boolean byte lengths in evidence manifests.
- Add focused regression tests and execute the contract suite in CI.

## Current deployments

| Network | Chain ID | Contract |
| --- | --- | --- |
| Studionet | 61999 | `0xaf5Df783aCA48743f13A2B60576FAb07241325f3` |
| Studio Dev / Next | 61997 | `0xaA978B24a42005aed411E5f71b82dF674656c50E` |

- Normal explorer: https://explorer-studio.genlayer.com/address/0xaf5Df783aCA48743f13A2B60576FAb07241325f3
- Required Dev explorer: https://explorer-studio-dev.genlayer.com/address/0xaA978B24a42005aed411E5f71b82dF674656c50E
- Stable deployment: https://explorer-studio.genlayer.com/tx/0xf36c1bd8ba01dad57a9712ccfbb7f017602d9dbcf6d37638cf3f237f25e203c1
- Dev deployment: https://explorer-studio-dev.genlayer.com/tx/0x7ee3a93807e61fd55fe4961a065a0827df80bb489eab39ce7cfc0c91637e836a
- Stable verification: https://explorer-studio.genlayer.com/tx/0x84040db5e330800be77be6a6b864151979b25924434ae63f6a49fa044d680737
- Dev verification: https://explorer-studio-dev.genlayer.com/tx/0xb31e436587d3daf2a95226cbcdf1c69d856f41c645bcd07069d09c96d0aa5bae

- Independent Dev challenge: https://explorer-studio-dev.genlayer.com/tx/0xdf2adc67588eb6d8991237789d0515b64ffb11fd0da51ca4f1852921ab3f6cc1

The Dev challenge finalized as UPHELD from a second built-in account. The original
summary and quality remain in `original_record`; the canonical record has one
revision and its updated assessment. Saved finalized receipts are in
[docs/evidence](docs/evidence).

Both contracts were deployed with built-in Studio accounts and full consensus.
The stable and Dev sources have identical application logic with explicit
runtime compatibility differences. Stable uses `genlayer-js` 1.1.8; Dev reads
use the official `studioDevnet` preset in aliased SDK 2.0.0-rc.1. Never relabel the
stable network as Dev. The preview can reset; no deployment URL is guaranteed
to survive a network reset. Old records remain on their original deployments,
not migrated into these new contracts. Historical references are archived in
[docs/legacy-deployments.md](docs/legacy-deployments.md).

## Website status

The original site is https://sourceseal.netlify.app and the old account is no
longer accessible to the owner. Replacement project `sourceseal-v1` was created
in the connected new Netlify team. Publication is **pending**: available Netlify
connector operations do not expose build/upload/trigger-deploy, and no signed-in
browser session or CLI deploy credential is available. Do not present
`sourceseal-v1.netlify.app` as live until a ready deployment is verified.

The build uses the existing `netlify.toml`: `npm run netlify:build`, publish
folder `out`. Upload the contents of `out` to the replacement project, or link
this repository to that project with those build settings. Routes include `/`,
`/milestone`, `/source`, and both downloadable contract sources.

## Reproduce the reviewer flow

1. Open the published replacement app after deployment. Select Studionet or
   Studio Dev / Next.
2. Choose Inspect → Use live review example → Load on-chain history. No wallet
   is required. The example is `sourceseal-v1-stable-20261007` or
   `sourceseal-v1-dev-20261007` on its corresponding network.
3. Confirm the claim is about RFC 8259, verdict SUPPORTED, initial snapshot,
   evidence hash, and seven-day challenge deadline.
4. Export review receipt and verify the JSON's chain, contract, original record,
   current record and revisions. Copy review link; it prefills the claim and
   network for another reader. The reader explicitly loads fresh finalized data.
5. For writes, open the selected Studio contract with its built-in account.
   `verify_claim` accepts an ID, a claim and newline-separated evidence URLs.
   Use `https://www.rfc-editor.org/rfc/rfc8259.txt` for the RFC 8259 claim.
6. An independent built-in account can call `challenge_claim` within the window.
   The original account cannot. Early finalization and late challenges revert;
   passing the deadline alone does not write the finalization record.

Verdicts are evidence-based assessments, not guarantees of truth. The reported
wallet “dangerous site” warning was not independently reproduced and is **not
claimed fixed**. Walletless review and Studio test accounts offer another route;
do not bypass a browser or wallet warning.

## Validation

```bash
npm ci
pip install -r requirements-test.txt
python scripts/prepare-test-runtime.py
python -m pytest tests/direct -q
npx tsc --noEmit
npm run lint
npm test
npm run netlify:build
node scripts/check-live-review.mjs
```

The pinned official artifact preparation works around genlayer-test 0.29.2
requesting the old artifact filename; it verifies the official release SHA-256.
Contract tests mock web/LLM responses. Live checks separately fetch finalized
records from both networks through the official SDKs. Captured public receipts
are in `docs/evidence/`; they are snapshots and contain no wallet credentials.

Project editor and milestone draft: [docs/submission-v1.md](docs/submission-v1.md).
