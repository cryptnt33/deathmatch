import React from "react";
const AVALANCHE_NETWORK_PARAMS = {
  development: {
    chainId: "0xA869",
    chainName: "Avalanche Testnet C-Chain",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://testnet.snowtrace.io/"],
  },
  test: {
    chainId: "0xA869",
    chainName: "Avalanche Testnet C-Chain",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://testnet.snowtrace.io/"],
  },
  production: {
    chainId: "0xA86A",
    chainName: "Avalanche Mainnet C-Chain",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://snowtrace.io/"],
  },
};

function getAvalancheNetwork() {
  return AVALANCHE_NETWORK_PARAMS[process.env.NODE_ENV];
}
export function AddAvalancheButton({ provider }) {
  async function addAvalancheNetwork() {
    const network = getAvalancheNetwork();
    console.log(network);
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [network],
    });
  }

  return <button onClick={addAvalancheNetwork}>Add Avalanche Network</button>;
}
