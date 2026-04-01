/**
 * Attestation service: logs economic events on Kite Chain.
 * Uses ethers.js to interact with the AgentEconomyAttestation contract.
 *
 * If no contract address is configured, attestations are logged locally only
 * (graceful degradation for local dev without funded wallet).
 */
import { ethers } from "ethers";
import { config } from "../../shared/config.js";

const CONTRACT_ABI = [
  "event Attestation(bytes32 indexed taskHash, address indexed agent, uint256 amount, string attestationType, uint256 timestamp)",
  "function logAttestation(bytes32 taskHash, address agent, uint256 amount, string attestationType) external",
  "function attestationCount() view returns (uint256)",
];

let contract: ethers.Contract | null = null;
let provider: ethers.JsonRpcProvider | null = null;

const CONTRACT_ADDRESS = process.env.ATTESTATION_CONTRACT_ADDRESS || "";

export function initAttestation() {
  if (!CONTRACT_ADDRESS) {
    console.log(
      "[Attestation] No contract address configured. Attestations will be logged locally only."
    );
    return;
  }

  try {
    provider = new ethers.JsonRpcProvider(config.kiteRpcUrl);
    const wallet = new ethers.Wallet(config.agentPrivateKey, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    console.log(`[Attestation] Connected to contract at ${CONTRACT_ADDRESS}`);
  } catch (err) {
    console.error("[Attestation] Failed to initialize:", err);
  }
}

export async function logAttestation(
  taskId: string,
  agentAddress: string,
  amountUsdt: number,
  type: "task_completed" | "tool_purchased" | "payment_received"
): Promise<string | null> {
  const taskHash = ethers.id(taskId);
  const agent = ethers.isAddress(agentAddress)
    ? agentAddress
    : ethers.ZeroAddress;
  const amount = ethers.parseUnits(amountUsdt.toFixed(6), 18);

  console.log(
    `[Attestation] ${type}: task=${taskId.slice(0, 8)}, agent=${agent.slice(
      0,
      10
    )}, amount=$${amountUsdt}`
  );

  if (!contract) {
    console.log("[Attestation] No on-chain contract. Logged locally.");
    return null;
  }

  try {
    const tx = await contract.logAttestation(taskHash, agent, amount, type);
    console.log(`[Attestation] TX sent: ${tx.hash}`);
    await tx.wait();
    console.log(`[Attestation] TX confirmed: ${tx.hash}`);
    return tx.hash;
  } catch (err) {
    console.error("[Attestation] TX failed:", err);
    return null;
  }
}

export async function getAttestationCount(): Promise<number> {
  if (!contract) return 0;
  try {
    const count = await contract.attestationCount();
    return Number(count);
  } catch {
    return 0;
  }
}
