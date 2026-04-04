/**
 * Debug x402 payment flow step by step.
 * Run: npx tsx src/scripts/test-x402-debug.ts
 */
import "dotenv/config";
import { config, KITE_NETWORK } from "../shared/config.js";
import { privateKeyToAccount } from "viem/accounts";

const SERVER_URL = `http://localhost:${config.port}`;

async function main() {
  console.log("=== x402 Payment Debug ===\n");

  // Step 1: Get 402 response
  console.log("1. Requesting paid endpoint...");
  const res = await fetch(`${SERVER_URL}/tools/stock-data?symbol=TSLA`);
  console.log(`   Status: ${res.status}`);

  if (res.status !== 402) {
    console.log("   Not 402, exiting");
    return;
  }

  const paymentHeader = res.headers.get("PAYMENT-REQUIRED");
  if (!paymentHeader) {
    console.log("   No PAYMENT-REQUIRED header");
    return;
  }

  const requirements = JSON.parse(atob(paymentHeader));
  console.log(
    "   Requirements:",
    JSON.stringify(requirements.accepts[0], null, 2)
  );

  // Step 2: Check facilitator
  console.log("\n2. Checking facilitator...");
  const facRes = await fetch(`${config.facilitatorUrl}/v2/supported`);
  if (facRes.ok) {
    const supported = await facRes.json();
    console.log("   Facilitator supported networks:");
    for (const kind of (supported.kinds || []).slice(0, 5)) {
      console.log(`   - ${kind.scheme} on ${kind.network}`);
    }
    const kiteSupported = (supported.kinds || []).some(
      (k: any) => k.network === KITE_NETWORK
    );
    console.log(`   Kite (${KITE_NETWORK}) supported: ${kiteSupported}`);
  } else {
    console.log(`   Facilitator error: ${facRes.status}`);
  }

  // Step 3: Try signing a payment manually
  console.log("\n3. Testing payment signing...");
  const account = privateKeyToAccount(config.agentPrivateKey as `0x${string}`);
  console.log(`   Account: ${account.address}`);

  // Step 4: Try the full x402 flow with detailed error catching
  console.log("\n4. Full x402 fetch with payment...");
  try {
    const { wrapFetchWithPaymentFromConfig } = await import("@x402/fetch");
    const { ExactEvmScheme } = await import("@x402/evm/exact/client");

    const x402Fetch = wrapFetchWithPaymentFromConfig(fetch, {
      schemes: [
        {
          network: KITE_NETWORK,
          client: new ExactEvmScheme(account),
        },
      ],
    });

    const paidRes = await x402Fetch(
      `${SERVER_URL}/tools/stock-data?symbol=TSLA`
    );
    console.log(`   Status: ${paidRes.status}`);
    console.log(`   Headers:`, Object.fromEntries(paidRes.headers.entries()));
    const body = await paidRes.text();
    console.log(`   Body: ${body.slice(0, 500)}`);
  } catch (err: any) {
    console.log(`   Error: ${err.message}`);
    if (err.cause) console.log(`   Cause: ${JSON.stringify(err.cause)}`);
    console.log(`   Stack: ${err.stack?.split("\n").slice(0, 5).join("\n")}`);
  }
}

main().catch(console.error);
