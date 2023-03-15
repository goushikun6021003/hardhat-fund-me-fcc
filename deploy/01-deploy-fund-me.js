// function deployFunc() {
//   console.log("Hi!");
// }
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");

const { network } = require("hardhat");
require("dotenv").config();
const { verify } = require("../utils/verify");
// module.exports.default = deployFunc;

// module.exports = async (hre) => {
//   const { getNamedAccounts, deployments } = hre;
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsedPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUsedAggregator = await deployments.get("MockV3Aggregator");
    ethUsedPriceFeedAddress = ethUsedAggregator.address;
  } else {
    ethUsedPriceFeedAddress = networkConfig[chainId]["ethUsedPriceFeed"];
  }

  const args = [ethUsedPriceFeedAddress];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsedPriceFeedAddress],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args);
  }
  log("----------------------------------");
};

module.exports.tags = ["all", "fundme"];
