export const deployments = {
  stable: {
    label: "Studionet", chainId: 61999,
    challengeTx: null,
    address: "0xaf5Df783aCA48743f13A2B60576FAb07241325f3",
    explorer: "https://explorer-studio.genlayer.com",
    studio: "https://studio.genlayer.com",
    rpc: "https://studio.genlayer.com/api",
    claimId: "sourceseal-v1-stable-20261007",
    verifyTx: "0x84040db5e330800be77be6a6b864151979b25924434ae63f6a49fa044d680737",
    deployTx: "0xf36c1bd8ba01dad57a9712ccfbb7f017602d9dbcf6d37638cf3f237f25e203c1",
  },
  dev: {
    label: "Studio Dev / Next", chainId: 61997,
    challengeTx: "0xdf2adc67588eb6d8991237789d0515b64ffb11fd0da51ca4f1852921ab3f6cc1",
    address: "0xaA978B24a42005aed411E5f71b82dF674656c50E",
    explorer: "https://explorer-studio-dev.genlayer.com",
    studio: "https://studio-dev.genlayer.com",
    rpc: "https://studio-dev.genlayer.com/api",
    claimId: "sourceseal-v1-dev-20261007",
    verifyTx: "0xb31e436587d3daf2a95226cbcdf1c69d856f41c645bcd07069d09c96d0aa5bae",
    deployTx: "0x7ee3a93807e61fd55fe4961a065a0827df80bb489eab39ce7cfc0c91637e836a",
  },
} as const;
