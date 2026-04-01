"use client";

import { useBackendHealth } from "./hooks/useApi";
import MetricsRow from "./components/MetricsRow";
import TaskBoard from "./components/TaskBoard";
import ActivityFeed from "./components/ActivityFeed";
import TransactionLog from "./components/TransactionLog";

export default function Home() {
  const connected = useBackendHealth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass-card-strong border-b border-white/5 rounded-none">
        <div className="max-w-[1440px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-sm font-bold">
                AE
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                AgentEconomy
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-700/60 border border-surface-600/50">
              <span className="w-2 h-2 rounded-full bg-accent-purple/70" />
              <span className="text-[11px] text-slate-400 font-medium">
                Powered by Kite Chain
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-700/40">
              <span
                className={`w-2 h-2 rounded-full ${
                  connected ? "bg-accent-green status-dot" : "bg-accent-red"
                }`}
              />
              <span className="text-xs text-slate-400">
                {connected ? "Backend Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-6 space-y-6">
        {/* Metrics */}
        <section>
          <MetricsRow />
        </section>

        {/* Main content: Tasks + Activity */}
        <section
          className="grid grid-cols-1 lg:grid-cols-5 gap-6"
          style={{ minHeight: "500px" }}
        >
          <div className="lg:col-span-3 glass-card-strong p-5">
            <TaskBoard />
          </div>
          <div className="lg:col-span-2 glass-card-strong p-5">
            <ActivityFeed />
          </div>
        </section>

        {/* Transaction log */}
        <section>
          <TransactionLog />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4">
        <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
          <span className="text-xs text-slate-600">
            AgentEconomy -- AI Agent Micro-Economy Demo
          </span>
          <a
            href="https://testnet.kitescan.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent-blue/60 hover:text-accent-blue transition-colors"
          >
            Kitescan Explorer
          </a>
        </div>
      </footer>
    </div>
  );
}
