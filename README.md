# SourceSeal

SourceSeal is a consensus-backed claim verifier built on GenLayer. A user submits
a claim and one to three public evidence URLs. Independent GenLayer validators
fetch the sources, classify the claim, agree on the decision, and store the
accepted verdict on-chain.

Live Studionet contract:
`0xC9425eC2f9899473a3A403550C6241CBC3d5224e`

Finalized proof transaction:
`0x92fd7f7060fac8ddd2a536dd169cbcb6397b0889229d79d35aacff90dfb8d19c`

## Why GenLayer is central

The product depends on capabilities that ordinary deterministic smart contracts
cannot provide:

- native public-web retrieval from GenVM;
- LLM reasoning over unstructured evidence;
- independent validator recomputation;
- semantic consensus before state is updated; and
- queryable, persistent verdict records.

## Project structure

- contracts/source_seal.py — Intelligent Contract
- tests/direct/test_source_seal.py — direct-mode contract tests
- app/page.tsx — GenLayerJS user interface
- app/source/page.tsx — public technical evidence page

## Contract workflow

1. Validate a claim and 1–3 HTTPS evidence URLs.
2. Fetch each source inside the non-deterministic GenVM block.
3. Ask the leader to return a structured verdict.
4. Have validators independently fetch the same evidence and assess the proposal.
5. Accept only when validators confirm the verdict is evidence-grounded.
6. Store the complete accepted result by claim ID.

## Deploy to Studionet

1. Open GenLayer Studio at https://studio.genlayer.com/.
2. Paste contracts/source_seal.py into a new contract.
3. Deploy with no constructor arguments.
4. Copy the deployed address into DEFAULT_CONTRACT_ADDRESS in app/page.tsx.
5. Rebuild and publish the frontend.

The deployed contract can then be shared through both Studio and the Studionet
Explorer.
