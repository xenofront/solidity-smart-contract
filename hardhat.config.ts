import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomiclabs/hardhat-ethers";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const PRIVATE_KEY =
  process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: "0.8.11",
  networks: {
    rinkeby: {
      url: process.env.INFURA_URL || "",
      accounts: PRIVATE_KEY,
    },
    bsc: {
      url: process.env.BSC_URL || "",
      accounts: PRIVATE_KEY,
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts: PRIVATE_KEY,
    },
  },
  // @ts-ignore
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  // @ts-ignore
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
