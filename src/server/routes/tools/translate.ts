import type { Request, Response } from "express";
import { config } from "../../../shared/config.js";

const LANGUAGE_NAMES: Record<string, string> = {
  zh: "Chinese (Simplified)",
  ja: "Japanese",
  es: "Spanish",
  fr: "French",
  de: "German",
  ko: "Korean",
  pt: "Portuguese",
  ar: "Arabic",
  ru: "Russian",
  hi: "Hindi",
};

// Rich static fallback phrase table for common business/finance terms
const STATIC_PHRASES: Record<string, Record<string, string>> = {
  hello: {
    zh: "你好",
    ja: "こんにちは",
    es: "hola",
    fr: "bonjour",
    de: "hallo",
  },
  "thank you": {
    zh: "谢谢",
    ja: "ありがとうございます",
    es: "gracias",
    fr: "merci",
    de: "danke",
  },
  "market analysis": {
    zh: "市场分析",
    ja: "市場分析",
    es: "análisis de mercado",
    fr: "analyse de marché",
    de: "Marktanalyse",
  },
  "stock price": {
    zh: "股票价格",
    ja: "株価",
    es: "precio de acciones",
    fr: "cours de l'action",
    de: "Aktienkurs",
  },
  "buy signal": {
    zh: "买入信号",
    ja: "買いシグナル",
    es: "señal de compra",
    fr: "signal d'achat",
    de: "Kaufsignal",
  },
  "sell signal": {
    zh: "卖出信号",
    ja: "売りシグナル",
    es: "señal de venta",
    fr: "signal de vente",
    de: "Verkaufssignal",
  },
  portfolio: {
    zh: "投资组合",
    ja: "ポートフォリオ",
    es: "cartera de inversión",
    fr: "portefeuille",
    de: "Portfolio",
  },
  revenue: {
    zh: "营业收入",
    ja: "売上高",
    es: "ingresos",
    fr: "chiffre d'affaires",
    de: "Umsatz",
  },
  "profit margin": {
    zh: "利润率",
    ja: "利益率",
    es: "margen de beneficio",
    fr: "marge bénéficiaire",
    de: "Gewinnmarge",
  },
  "earnings report": {
    zh: "财报",
    ja: "決算報告",
    es: "informe de ganancias",
    fr: "rapport financier",
    de: "Gewinnbericht",
  },
  "interest rate": {
    zh: "利率",
    ja: "金利",
    es: "tasa de interés",
    fr: "taux d'intérêt",
    de: "Zinssatz",
  },
  inflation: {
    zh: "通货膨胀",
    ja: "インフレ",
    es: "inflación",
    fr: "inflation",
    de: "Inflation",
  },
  cryptocurrency: {
    zh: "加密货币",
    ja: "暗号通貨",
    es: "criptomoneda",
    fr: "cryptomonnaie",
    de: "Kryptowährung",
  },
  blockchain: {
    zh: "区块链",
    ja: "ブロックチェーン",
    es: "cadena de bloques",
    fr: "chaîne de blocs",
    de: "Blockchain",
  },
  "smart contract": {
    zh: "智能合约",
    ja: "スマートコントラクト",
    es: "contrato inteligente",
    fr: "contrat intelligent",
    de: "Smart Contract",
  },
  decentralized: {
    zh: "去中心化",
    ja: "分散型",
    es: "descentralizado",
    fr: "décentralisé",
    de: "dezentralisiert",
  },
  "trading volume": {
    zh: "交易量",
    ja: "取引量",
    es: "volumen de negociación",
    fr: "volume de transactions",
    de: "Handelsvolumen",
  },
  "market cap": {
    zh: "市值",
    ja: "時価総額",
    es: "capitalización de mercado",
    fr: "capitalisation boursière",
    de: "Marktkapitalisierung",
  },
  volatility: {
    zh: "波动性",
    ja: "ボラティリティ",
    es: "volatilidad",
    fr: "volatilité",
    de: "Volatilität",
  },
  bullish: {
    zh: "看涨",
    ja: "強気",
    es: "alcista",
    fr: "haussier",
    de: "bullisch",
  },
  bearish: {
    zh: "看跌",
    ja: "弱気",
    es: "bajista",
    fr: "baissier",
    de: "bärisch",
  },
  "artificial intelligence": {
    zh: "人工智能",
    ja: "人工知能",
    es: "inteligencia artificial",
    fr: "intelligence artificielle",
    de: "Künstliche Intelligenz",
  },
  "autonomous agent": {
    zh: "自主智能体",
    ja: "自律エージェント",
    es: "agente autónomo",
    fr: "agent autonome",
    de: "autonomer Agent",
  },
};

async function callLLM(
  text: string,
  targetLang: string
): Promise<string | null> {
  const langName = LANGUAGE_NAMES[targetLang] || targetLang;
  const prompt = `Translate the following text to ${langName}. Return only the translation, no explanation:\n\n${text}`;

  const useOpenRouter = !!config.openrouterApiKey;
  const useAnthropic = !useOpenRouter && !!config.anthropicApiKey;
  if (!useOpenRouter && !useAnthropic) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let translated: string | null = null;

    if (useOpenRouter) {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.openrouterApiKey}`,
        },
        body: JSON.stringify({
          model: "anthropic/claude-haiku-4-5",
          max_tokens: 512,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: controller.signal,
      });
      if (res.ok) {
        const data = (await res.json()) as {
          choices: Array<{ message: { content: string } }>;
        };
        translated = data.choices?.[0]?.message?.content?.trim() || null;
      }
    } else {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 512,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: controller.signal,
      });
      if (res.ok) {
        const data = (await res.json()) as { content: Array<{ text: string }> };
        translated = data.content?.[0]?.text?.trim() || null;
      }
    }

    clearTimeout(timeout);
    return translated;
  } catch {
    return null;
  }
}

export async function translateHandler(req: Request, res: Response) {
  const { text, from, to } = req.body;

  if (!text || !to) {
    res.status(400).json({ error: "Missing required fields: text, to" });
    return;
  }

  // Try static phrase table first (exact match, case-insensitive)
  const lowerText = text.toLowerCase().trim();
  const staticMatch = STATIC_PHRASES[lowerText]?.[to];
  if (staticMatch) {
    res.json({
      originalText: text,
      translatedText: staticMatch,
      from: from || "en",
      to,
      confidence: 0.98,
      timestamp: new Date().toISOString(),
      source: "AgentEconomy Translation",
    });
    return;
  }

  // Try LLM translation
  const llmResult = await callLLM(text, to);
  if (llmResult) {
    res.json({
      originalText: text,
      translatedText: llmResult,
      from: from || "en",
      to,
      confidence: 0.95,
      timestamp: new Date().toISOString(),
      source: "AgentEconomy Translation",
    });
    return;
  }

  // Fallback: transliterate key financial terms from the phrase table
  const words = lowerText.split(/\s+/);
  for (const word of words) {
    const match = STATIC_PHRASES[word]?.[to];
    if (match) {
      res.json({
        originalText: text,
        translatedText: match,
        from: from || "en",
        to,
        confidence: 0.7,
        timestamp: new Date().toISOString(),
        source: "AgentEconomy Translation",
      });
      return;
    }
  }

  // Last resort: return partial translation marker with the closest known term
  const langName = LANGUAGE_NAMES[to] || to.toUpperCase();
  res.json({
    originalText: text,
    translatedText: `[${langName}] ${text}`,
    from: from || "en",
    to,
    confidence: 0.3,
    timestamp: new Date().toISOString(),
    source: "AgentEconomy Translation",
  });
}
