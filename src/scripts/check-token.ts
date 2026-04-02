/**
 * Check USDT token contract on Kite testnet.
 * Run: npx tsx src/scripts/check-token.ts
 */
import "dotenv/config";
import { ethers } from "ethers";
import { config } from "../shared/config.js";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];

async function main() {
  const provider = new ethers.JsonRpcProvider(config.kiteRpcUrl);
  const token = new ethers.Contract(
    config.kiteUsdtAddress,
    ERC20_ABI,
    provider
  );

  console.log("Kite Testnet USDT Token Info");
  console.log("============================");
  console.log("Address:", config.kiteUsdtAddress);

  try {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      token.name(),
      token.symbol(),
      token.decimals(),
      token.totalSupply(),
    ]);
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Decimals:", Number(decimals));
    console.log("Total Supply:", ethers.formatUnits(totalSupply, decimals));
  } catch (err) {
    console.error("Error reading token info:", err);
  }

  // Check agent wallet balance
  if (config.agentPrivateKey) {
    const wallet = new ethers.Wallet(config.agentPrivateKey, provider);
    console.log("\nAgent Wallet");
    console.log("============");
    console.log("Address:", wallet.address);

    const kiteBalance = await provider.getBalance(wallet.address);
    console.log("KITE Balance:", ethers.formatEther(kiteBalance));

    try {
      const usdtBalance = await token.balanceOf(wallet.address);
      const decimals = await token.decimals();
      console.log("USDT Balance:", ethers.formatUnits(usdtBalance, decimals));
    } catch (err) {
      console.log(
        "USDT Balance: error reading -",
        (err as Error).message?.slice(0, 80)
      );
    }
  }

  // Check server/payee wallet
  if (config.payeeAddress) {
    console.log("\nServer Wallet");
    console.log("=============");
    console.log("Address:", config.payeeAddress);
    const kiteBalance = await provider.getBalance(config.payeeAddress);
    console.log("KITE Balance:", ethers.formatEther(kiteBalance));
    try {
      const usdtBalance = await token.balanceOf(config.payeeAddress);
      const decimals = await token.decimals();
      console.log("USDT Balance:", ethers.formatUnits(usdtBalance, decimals));
    } catch (err) {
      console.log(
        "USDT Balance: error -",
        (err as Error).message?.slice(0, 80)
      );
    }
  }
}

main().catch(console.error);
