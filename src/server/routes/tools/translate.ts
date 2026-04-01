import type { Request, Response } from "express";

const MOCK_TRANSLATIONS: Record<string, Record<string, string>> = {
  hello: {
    zh: "你好",
    ja: "こんにちは",
    es: "hola",
    fr: "bonjour",
    de: "hallo",
  },
  "thank you": {
    zh: "谢谢",
    ja: "ありがとう",
    es: "gracias",
    fr: "merci",
    de: "danke",
  },
  goodbye: {
    zh: "再见",
    ja: "さようなら",
    es: "adiós",
    fr: "au revoir",
    de: "auf wiedersehen",
  },
};

export function translateHandler(req: Request, res: Response) {
  const { text, from, to } = req.body;

  if (!text || !to) {
    res.status(400).json({ error: "Missing required fields: text, to" });
    return;
  }

  // Check for known translations, otherwise generate a plausible mock
  const lowerText = text.toLowerCase().trim();
  const known = MOCK_TRANSLATIONS[lowerText]?.[to];

  const translated = known || `[${to}] ${text}`;

  res.json({
    originalText: text,
    translatedText: translated,
    from: from || "en",
    to,
    confidence: known ? 0.98 : 0.85,
    timestamp: new Date().toISOString(),
    source: "AgentEconomy Translation",
  });
}
