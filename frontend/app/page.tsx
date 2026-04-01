"use client";

import { useBackendHealth } from "./hooks/useApi";
import MetricsRow from "./components/MetricsRow";
import TaskBoard from "./components/TaskBoard";
import ActivityFeed from "./components/ActivityFeed";
import TransactionLog from "./components/TransactionLog";

export default function Home() {
  const connected = useBackendHealth();

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* Command bar */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "var(--bg-panel)",
          borderColor: "var(--border-dim)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-5 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-sm bg-accent" />
              </div>
              <span
                className="text-sm font-semibold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                AgentEconomy
              </span>
            </div>
            <span
              className="text-xs font-mono"
              style={{ color: "var(--text-dim)" }}
            >
              Kite Testnet
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-accent pulse-dot" : "bg-negative"}`}
              />
              <span
                className="text-xs font-mono"
                style={{
                  color: connected ? "var(--accent)" : "var(--negative)",
                }}
              >
                {connected ? "LIVE" : "OFFLINE"}
              </span>
            </div>
            <a
              href="https://testnet.kitescan.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono hover:underline transition-colors"
              style={{ color: "var(--text-dim)" }}
            >
              kitescan
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-5 py-5 space-y-4">
        {/* Metrics strip */}
        <MetricsRow />

        {/* Workspace: Tasks + Activity */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          style={{ minHeight: "480px" }}
        >
          <section className="lg:col-span-2 panel p-4">
            <TaskBoard />
          </section>
          <section className="panel p-4 overflow-hidden">
            <ActivityFeed />
          </section>
        </div>

        {/* Transaction ledger */}
        <section className="panel p-4">
          <TransactionLog />
        </section>
      </main>

      {/* Footer */}
      <footer
        className="border-t py-3"
        style={{ borderColor: "var(--border-dim)" }}
      >
        <div className="max-w-[1400px] mx-auto px-5 flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--text-dim)" }}>
            x402 micropayments on Kite Chain
          </span>
          <span
            className="text-xs font-mono"
            style={{ color: "var(--text-dim)" }}
          >
            eip155:2368
          </span>
        </div>
      </footer>
    </div>
  );
}
