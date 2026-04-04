import "dotenv/config";
import { ethers } from "ethers";
import { config } from "../shared/config.js";

async function main() {
  const provider = new ethers.JsonRpcProvider(config.kiteRpcUrl);
  const usdt = config.kiteUsdtAddress;

  const code = await provider.getCode(usdt);
  // transferWithAuthorization selector: 0xe3ee160e
  const hasEip3009 = code.toLowerCase().includes("e3ee160e");
  // permit (EIP-2612): 0xd505accf
  const hasPermit = code.toLowerCase().includes("d505accf");
  // DOMAIN_SEPARATOR: 0x3644e515
  const hasDomain = code.toLowerCase().includes("3644e515");

  console.log("USDT contract bytecode length:", code.length);
  console.log("Has transferWithAuthorization (EIP-3009):", hasEip3009);
  console.log("Has permit (EIP-2612):", hasPermit);
  console.log("Has DOMAIN_SEPARATOR:", hasDomain);

  // Try calling DOMAIN_SEPARATOR
  const iface = new ethers.Interface([
    "function DOMAIN_SEPARATOR() view returns (bytes32)",
    "function nonces(address) view returns (uint256)",
  ]);
  const contract = new ethers.Contract(usdt, iface, provider);

  try {
    const ds = await contract.DOMAIN_SEPARATOR();
    console.log("DOMAIN_SEPARATOR:", ds);
  } catch {
    console.log("DOMAIN_SEPARATOR: not available");
  }

  try {
    const nonce = await contract.nonces(
      "0x854d98155f25f5A294cc3522472019FD07188092"
    );
    console.log("Nonces:", nonce.toString());
  } catch {
    console.log("Nonces: not available");
  }
}

main().catch(console.error);
