import { config, KITE_NETWORK } from "./config.js";

/**
 * Build x402 price config for Kite testnet USDT.
 * Kite is not in the default stablecoin list, so we must use the explicit AssetAmount form.
 *
 * @param usdtAmount - Amount in USDT (e.g. 0.10 for $0.10). Assumes 18 decimals.
 */
export function kitePrice(usdtAmount: number) {
  // Kite Test USDT uses 18 decimals (standard ERC-20 default)
  // TODO: verify actual decimals on-chain; adjust if 6 decimals
  const wei = BigInt(Math.round(usdtAmount * 1e18)).toString();
  return {
    scheme: "exact" as const,
    network: KITE_NETWORK,
    payTo: config.payeeAddress,
    price: {
      amount: wei,
      asset: config.kiteUsdtAddress,
      extra: {
        name: "USDT",
        version: "1",
      },
    },
    maxTimeoutSeconds: 300,
  };
}
