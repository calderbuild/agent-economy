import "dotenv/config";

export const config = {
  port: parseInt(process.env.PORT || "4021"),
  payeeAddress: process.env.PAYEE_ADDRESS || "",
  agentPrivateKey: process.env.AGENT_PRIVATE_KEY || "",
  kiteRpcUrl: process.env.KITE_RPC_URL || "https://rpc-testnet.gokite.ai/",
  kiteChainId: parseInt(process.env.KITE_CHAIN_ID || "2368"),
  kiteUsdtAddress:
    process.env.KITE_USDT_ADDRESS ||
    "0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63",
  facilitatorUrl:
    process.env.FACILITATOR_URL || "https://facilitator.pieverse.io",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  openrouterApiKey: process.env.OPENROUTER_API_KEY || "",
};

export const KITE_NETWORK = `eip155:${config.kiteChainId}` as const;
