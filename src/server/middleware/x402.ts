import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { config, KITE_NETWORK } from "../../shared/config.js";

type RouteConfig = Record<
  string,
  {
    accepts: {
      scheme: string;
      network: string;
      payTo: string;
      price: {
        amount: string;
        asset: string;
        extra: { name: string; version: string };
      };
      maxTimeoutSeconds?: number;
    };
    description: string;
    mimeType: string;
  }
>;

export function createPaymentMiddleware(routeConfig: RouteConfig) {
  const facilitator = new HTTPFacilitatorClient({
    url: config.facilitatorUrl,
  });

  const resourceServer = new x402ResourceServer(facilitator).register(
    KITE_NETWORK,
    new ExactEvmScheme(),
  );

  return paymentMiddleware(routeConfig as any, resourceServer);
}
