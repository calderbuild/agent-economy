/**
 * Test script to verify x402 payment flow works.
 * Run: npm run test:payment
 *
 * Prerequisites:
 * 1. Server running (npm run dev:server)
 * 2. .env configured with PAYEE_ADDRESS and AGENT_PRIVATE_KEY
 * 3. Agent wallet funded with Test USDT from https://faucet.gokite.ai/
 */
import "dotenv/config";
import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
import { config, KITE_NETWORK } from "../shared/config.js";

async function main() {
  const serverUrl = `http://localhost:${config.port}`;

  // Step 1: Test health endpoint (no payment)
  console.log("1. Testing health endpoint...");
  const health = await fetch(`${serverUrl}/health`);
  console.log("   Health:", await health.json());

  // Step 2: Test tool discovery (no payment)
  console.log("\n2. Testing tool discovery...");
  const discovery = await fetch(`${serverUrl}/tools/discover`);
  const tools = await discovery.json();
  console.log(`   Found ${tools.tools.length} tools:`);
  for (const tool of tools.tools) {
    console.log(`   - ${tool.name} (${tool.price})`);
  }

  // Step 3: Test a tool endpoint WITHOUT payment (expect 402)
  console.log("\n3. Testing stock-data without payment (expect 402)...");
  const unpaid = await fetch(`${serverUrl}/tools/stock-data?symbol=TSLA`);
  console.log(`   Status: ${unpaid.status}`);
  if (unpaid.status === 402) {
    console.log("   Got 402 Payment Required (correct!)");
    const body = await unpaid.json();
    console.log("   Payment requirements:", JSON.stringify(body).slice(0, 200));
  }

  // Step 4: Test with x402 payment (requires funded wallet)
  if (!config.agentPrivateKey) {
    console.log(
      "\n4. Skipping paid request (AGENT_PRIVATE_KEY not set in .env)",
    );
    console.log("   Set AGENT_PRIVATE_KEY to test actual x402 payment flow.");
    return;
  }

  console.log("\n4. Testing stock-data WITH x402 payment...");
  const account = privateKeyToAccount(config.agentPrivateKey as `0x${string}`);
  console.log(`   Payer address: ${account.address}`);

  const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
    schemes: [
      {
        network: KITE_NETWORK,
        client: new ExactEvmScheme(account),
      },
    ],
  });

  const paid = await fetchWithPayment(
    `${serverUrl}/tools/stock-data?symbol=TSLA`,
  );
  console.log(`   Status: ${paid.status}`);
  if (paid.ok) {
    console.log("   Data:", await paid.json());
    console.log("   x402 payment successful!");
  } else {
    console.log("   Payment failed:", await paid.text());
  }
}

main().catch(console.error);
