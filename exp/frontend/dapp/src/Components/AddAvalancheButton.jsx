import React, { useState } from "react";
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

// the single purpose of this component is to help users add Avalanche network to Metakask
export function AddAvalancheButton({ provider }) {
  const [buttonText] = useState("Add Avalanche Network");
  const [disable, setDisable] = useState(false);
  const avalanceNetwork = AVALANCHE_NETWORK_PARAMS[process.env.NODE_ENV];

  async function addAvalancheNetwork() {
    try {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [avalanceNetwork],
      });
      setDisable(true);
    } catch (e) {
      setDisable(false);
      console.log(e);
    }
  }

  return (
    <button disabled={disable} onClick={addAvalancheNetwork}>
      {buttonText}
    </button>
  );
}
