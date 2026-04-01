require("dotenv/config");
require("@nomicfoundation/hardhat-toolbox");

const DEPLOYER_KEY = process.env.AGENT_PRIVATE_KEY || "0x" + "0".repeat(64);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    kiteTestnet: {
      url: "https://rpc-testnet.gokite.ai/",
      chainId: 2368,
      accounts: [DEPLOYER_KEY],
    },
  },
};
