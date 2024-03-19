import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import { Chain } from "viem";
import { HttpNetworkUserConfig } from "hardhat/types";
import {rolluxTestnet} from "viem/chains";
dotenv.config();
// read MNEMONIC from env variable
let mnemonic = process.env.MNEMONIC || 'test test test test test test test test test test test junk';

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const networkConfig = (chain: Chain): HttpNetworkUserConfig => {
  let url = process.env.RPC_URL || chain.rpcUrls.default.http[0];

  // support for infura and alchemy URLs through env variables
  if (process.env.INFURA_ID && chain.rpcUrls.infura?.http) {
      url = `${chain.rpcUrls.infura.http}/${process.env.INFURA_ID}`;
  } else if (process.env.ALCHEMY_ID && chain.rpcUrls.alchemy?.http) {
      url = `${chain.rpcUrls.alchemy.http}/${process.env.ALCHEMY_ID}`;
  }

  return {
      chainId: chain.id,
      url,
      accounts: mnemonic ? { mnemonic } : undefined,
  };
};

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    rollux_testnet: networkConfig(rolluxTestnet),
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
