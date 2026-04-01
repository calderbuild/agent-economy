"use client";

import { usePolling, type Transaction } from "../hooks/useApi";

function truncateAddr(addr: string) {
  if (!addr || addr.length < 12) return addr || "--";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function TransactionLog() {
  const { data: txData, loading } = usePolling<{ transactions: Transaction[] }>(
    "/tasks/api/transactions",
  );
  const transactions = txData?.transactions;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white tracking-tight">
          Transaction Log
        </h2>
        <span className="text-xs text-slate-500">x402 Payments</span>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  From
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  To
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Detail
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && !transactions ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      <td colSpan={6} className="py-3 px-4">
                        <div className="h-4 bg-surface-700/50 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : !transactions?.length ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-slate-500 text-sm"
                  >
                    No transactions yet
                  </td>
                </tr>
              ) : (
                transactions.map((tx, i) => {
                  const isEarning = tx.type === "task_payment";
                  return (
                    <tr
                      key={`${tx.created_at}-${i}`}
                      className="border-b border-white/[0.03] hover:bg-surface-700/20 transition-colors animate-fade-in"
                    >
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded ${
                            isEarning
                              ? "bg-accent-green/10 text-accent-green"
                              : "bg-accent-red/10 text-accent-red"
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${isEarning ? "bg-accent-green" : "bg-accent-red"}`}
                          />
                          {isEarning ? "Earned" : "Spent"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-xs text-slate-400">
                        {truncateAddr(tx.from_address)}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-xs text-slate-400">
                        {truncateAddr(tx.to_address)}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-semibold text-sm ${isEarning ? "text-accent-green" : "text-accent-red"}`}
                      >
                        {isEarning ? "+" : "-"}${tx.amount_usdt.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-500">
                        {tx.tool_id
                          ? `Tool: ${tx.tool_id}`
                          : tx.task_id
                            ? `Task #${tx.task_id}`
                            : "--"}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="text-xs text-slate-600">
                          {formatTime(tx.created_at)}
                        </span>
                        {tx.tx_hash && (
                          <a
                            href={`https://testnet.kitescan.ai/tx/${tx.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-[10px] text-accent-blue/70 hover:text-accent-blue transition-colors"
                          >
                            View
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
