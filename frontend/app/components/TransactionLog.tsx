"use client";

import { usePolling, type Transaction } from "../hooks/useApi";

function truncAddr(addr: string) {
  if (!addr || addr.length < 12) return addr || "--";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatTime(dateStr: string) {
  return new Date(dateStr + "Z").toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function TransactionLog() {
  const { data: txData, loading } = usePolling<{ transactions: Transaction[] }>(
    "/tasks/api/transactions"
  );
  const transactions = txData?.transactions;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "var(--text-secondary)" }}
        >
          Transaction Ledger
        </h2>
        <span
          className="text-[10px] font-mono"
          style={{ color: "var(--text-dim)" }}
        >
          x402
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-dim)" }}>
              {["Type", "From", "To", "Amount", "Detail", "Time"].map((h) => (
                <th
                  key={h}
                  className="pb-2 text-[10px] font-semibold tracking-widest uppercase font-mono"
                  style={{ color: "var(--text-dim)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              [...Array(3)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="py-2">
                    <div
                      className="h-5 rounded"
                      style={{ background: "var(--bg-raised)" }}
                    />
                  </td>
                </tr>
              ))}

            {!loading && (!transactions || transactions.length === 0) && (
              <tr>
                <td colSpan={6} className="py-8 text-center">
                  <span
                    className="text-xs font-mono"
                    style={{ color: "var(--text-dim)" }}
                  >
                    No transactions yet
                  </span>
                </td>
              </tr>
            )}

            {transactions?.map((tx, i) => {
              const isEarning = tx.type === "task_payment";
              const color = isEarning ? "var(--accent)" : "var(--negative)";
              return (
                <tr
                  key={i}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid var(--border-dim)" }}
                >
                  <td className="py-2.5 pr-4">
                    <span
                      className="badge text-[9px] font-mono"
                      style={{
                        color,
                        background: `color-mix(in srgb, ${color} 12%, transparent)`,
                      }}
                    >
                      {isEarning ? "EARNED" : "SPENT"}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span
                      className="text-xs font-mono"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {truncAddr(tx.from_address)}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span
                      className="text-xs font-mono"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {truncAddr(tx.to_address)}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span
                      className="text-xs font-mono font-semibold tabular-nums"
                      style={{ color }}
                    >
                      {isEarning ? "+" : "-"}${tx.amount_usdt.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {tx.tool_id || "Task bounty"}
                    </span>
                  </td>
                  <td className="py-2.5">
                    {tx.tx_hash ? (
                      <a
                        href={`https://testnet.kitescan.ai/tx/${tx.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono tabular-nums hover:underline"
                        style={{ color: "var(--accent)" }}
                      >
                        {formatTime(tx.created_at)}
                      </a>
                    ) : (
                      <span
                        className="text-[10px] font-mono tabular-nums"
                        style={{ color: "var(--text-dim)" }}
                      >
                        {formatTime(tx.created_at)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
