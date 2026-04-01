import hre from "hardhat";

async function main() {
  console.log("Deploying AgentEconomyAttestation to", hre.network.name, "...");

  const contract = await hre.ethers.deployContract("AgentEconomyAttestation");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("AgentEconomyAttestation deployed to:", address);
  console.log(
    "View on Kitescan: https://testnet.kitescan.ai/address/" + address,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
