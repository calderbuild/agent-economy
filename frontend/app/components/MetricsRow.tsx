"use client";

import { usePolling, type Metrics } from "../hooks/useApi";
import { useEffect, useRef, useState } from "react";

function AnimatedNumber({
  value,
  prefix = "$",
}: {
  value: number;
  prefix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(to);
      prevRef.current = to;
      return;
    }

    const duration = 600;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        prevRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return (
    <span className="font-mono tabular-nums text-2xl font-semibold tracking-tight count-enter">
      {prefix}
      {display.toFixed(2)}
    </span>
  );
}

const cards: {
  key: keyof Metrics;
  label: string;
  colorVar: string;
}[] = [
  { key: "totalVolume", label: "VOLUME", colorVar: "--info" },
  { key: "agentEarnings", label: "EARNED", colorVar: "--accent" },
  { key: "agentSpending", label: "SPENT", colorVar: "--negative" },
  { key: "agentProfit", label: "PROFIT", colorVar: "--accent" },
];

export default function MetricsRow() {
  const { data: metrics, loading } = usePolling<Metrics>("/tasks/api/metrics");

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const value = (metrics?.[card.key] ?? 0) as number;
        return (
          <div key={card.key} className="metric-card px-4 py-3">
            <div
              className="text-[10px] font-semibold tracking-widest mb-1.5 uppercase"
              style={{ color: "var(--text-dim)" }}
            >
              {card.label}
            </div>
            {loading ? (
              <div
                className="h-7 w-20 rounded"
                style={{ background: "var(--bg-raised)" }}
              />
            ) : (
              <div style={{ color: `var(${card.colorVar})` }}>
                <AnimatedNumber value={value} />
                <span
                  className="text-xs font-mono ml-1.5"
                  style={{ color: "var(--text-dim)" }}
                >
                  USDT
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
