import MetaMaskOnboarding from "@metamask/onboarding";
import React, { useState, useEffect, useRef } from "react";

const ONBOARD_TEXT = "Click here to install MetaMask!";
const CONNECT_TEXT = "Connect";

// the single purpose of this component is to help users install Metamask
export function OnboardingButton() {
  const [buttonText, setButtonText] = useState(ONBOARD_TEXT);
  const [isDisabled, setDisabled] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const onboarding = useRef();

  function maskAccount(account) {
    const visibleLen = 5;
    return `${account.substring(0, visibleLen)}...${account.substring(
      account.length - visibleLen,
      account.length
    )}`;
  }

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (accounts.length > 0) {
        setButtonText(`Welcome ${maskAccount(accounts[0])}`);
        setDisabled(true);
        onboarding.current.stopOnboarding();
      } else {
        setButtonText(CONNECT_TEXT);
        setDisabled(false);
      }
    }
  }, [accounts]);

  useEffect(() => {
    function handleNewAccounts(newAccounts) {
      setAccounts(newAccounts);
    }
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then(handleNewAccounts);
      window.ethereum.on("accountsChanged", handleNewAccounts);
      return () => {
        window.ethereum.removeListener("accountsChanged", handleNewAccounts);
      };
    }
  }, []);

  const onClick = () => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((newAccounts) => setAccounts(newAccounts));
    } else {
      onboarding.current.startOnboarding();
    }
  };
  return (
    <button disabled={isDisabled} onClick={onClick}>
      {buttonText}
    </button>
  );
}
