import type { Request, Response } from "express";

const MOCK_STOCKS: Record<
  string,
  { price: number; change: number; volume: string }
> = {
  TSLA: { price: 342.17, change: 2.34, volume: "98.2M" },
  AAPL: { price: 218.45, change: -0.87, volume: "62.1M" },
  GOOGL: { price: 178.92, change: 1.12, volume: "28.4M" },
  MSFT: { price: 445.31, change: 0.45, volume: "21.7M" },
  NVDA: { price: 892.56, change: 5.23, volume: "45.3M" },
  AMZN: { price: 198.34, change: -1.23, volume: "38.9M" },
  META: { price: 532.89, change: 3.45, volume: "19.2M" },
};

export function stockDataHandler(req: Request, res: Response) {
  const symbol = (req.query.symbol as string)?.toUpperCase();
  if (!symbol) {
    res.status(400).json({ error: "Missing 'symbol' parameter" });
    return;
  }

  const stock = MOCK_STOCKS[symbol];
  if (!stock) {
    // Generate plausible data for unknown symbols
    const price = 50 + Math.random() * 500;
    res.json({
      symbol,
      price: Math.round(price * 100) / 100,
      change: Math.round((Math.random() * 10 - 5) * 100) / 100,
      changePercent: Math.round((Math.random() * 6 - 3) * 100) / 100 + "%",
      volume: Math.round(Math.random() * 100) + "M",
      high: Math.round(price * 1.03 * 100) / 100,
      low: Math.round(price * 0.97 * 100) / 100,
      timestamp: new Date().toISOString(),
      source: "AgentEconomy Market Data",
    });
    return;
  }

  res.json({
    symbol,
    price: stock.price,
    change: stock.change,
    changePercent: ((stock.change / stock.price) * 100).toFixed(2) + "%",
    volume: stock.volume,
    high: Math.round(stock.price * 1.02 * 100) / 100,
    low: Math.round(stock.price * 0.98 * 100) / 100,
    timestamp: new Date().toISOString(),
    source: "AgentEconomy Market Data",
  });
}
