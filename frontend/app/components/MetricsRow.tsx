"use client";

import { usePolling, type Metrics } from "../hooks/useApi";

function formatUSD(value: number) {
  return `$${value.toFixed(2)}`;
}

const cards: {
  key: keyof Metrics;
  label: string;
  color: string;
  glowClass: string;
  icon: JSX.Element;
}[] = [
  {
    key: "totalVolume",
    label: "Total Volume",
    color: "text-accent-blue",
    glowClass: "glow-blue",
    icon: (
      <svg
        width={20}
        height={20}
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    key: "agentEarnings",
    label: "Agent Earnings",
    color: "text-accent-green",
    glowClass: "glow-green",
    icon: (
      <svg
        width={20}
        height={20}
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
        />
      </svg>
    ),
  },
  {
    key: "agentSpending",
    label: "Agent Spending",
    color: "text-accent-red",
    glowClass: "glow-red",
    icon: (
      <svg
        width={20}
        height={20}
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181"
        />
      </svg>
    ),
  },
  {
    key: "agentProfit",
    label: "Net Profit",
    color: "text-accent-purple",
    glowClass: "glow-purple",
    icon: (
      <svg
        width={20}
        height={20}
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
        />
      </svg>
    ),
  },
];

export default function MetricsRow() {
  const { data: metrics, loading } = usePolling<Metrics>("/tasks/api/metrics");

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const value = metrics?.[card.key] ?? 0;
        return (
          <div
            key={card.key}
            className={`glass-card p-5 ${card.glowClass} transition-all duration-300 hover:scale-[1.02] animate-fade-in`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400 font-medium tracking-wide uppercase">
                {card.label}
              </span>
              <span className={`${card.color} opacity-60`}>{card.icon}</span>
            </div>
            {loading ? (
              <div className="h-8 w-24 bg-surface-700 rounded animate-pulse" />
            ) : (
              <p
                className={`text-2xl font-semibold tracking-tight ${card.color}`}
              >
                {formatUSD(value as number)}
                <span className="text-xs font-normal text-slate-500 ml-1.5">
                  USDT
                </span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
