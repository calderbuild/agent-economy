import type { Request, Response } from "express";

export function chartGenHandler(req: Request, res: Response) {
  const { title, type, labels, data } = req.body;

  if (!title || !type || !labels || !data) {
    res.status(400).json({
      error: "Missing required fields: title, type, labels, data",
    });
    return;
  }

  // Generate a text-based chart representation and SVG URL
  // In production, this would return an actual chart image
  const chartId = `chart-${Date.now()}`;
  const maxVal = Math.max(...(data as number[]));

  const bars = (labels as string[]).map((label: string, i: number) => {
    const val = (data as number[])[i] || 0;
    const barLen = Math.round((val / maxVal) * 20);
    return `  ${label.padEnd(12)} ${"█".repeat(barLen)} ${val}`;
  });

  res.json({
    chartId,
    title,
    type,
    textRepresentation: [title, "─".repeat(40), ...bars].join("\n"),
    labels,
    data,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><text x="10" y="20" font-size="14">${title}</text></svg>`,
    timestamp: new Date().toISOString(),
    source: "AgentEconomy Chart Generator",
  });
}
