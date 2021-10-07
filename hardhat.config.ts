import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";

import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

export default {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: process.env.INFURA_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
};

