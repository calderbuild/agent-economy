"use client";

import { useEffect } from "react";
import type { Task } from "../hooks/useApi";

const statusMap: Record<string, { label: string; color: string }> = {
  open: { label: "OPEN", color: "var(--info)" },
  in_progress: { label: "RUNNING", color: "var(--warning)" },
  submitted: { label: "REVIEW", color: "var(--warning)" },
  completed: { label: "DONE", color: "var(--accent)" },
};

export default function TaskDetail({
  task,
  onClose,
  onApprove,
  onReject,
}: {
  task: Task;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const status = statusMap[task.status] || {
    label: task.status,
    color: "var(--text-dim)",
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={task.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[80vh] overflow-y-auto rounded-lg p-5"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-mid)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <h3
              className="text-base font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {task.title}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className="badge text-[9px] font-mono"
                style={{
                  color: status.color,
                  background: `color-mix(in srgb, ${status.color} 12%, transparent)`,
                }}
              >
                {status.label}
              </span>
              <span
                className="text-xs font-mono tabular-nums"
                style={{ color: "var(--accent)" }}
              >
                ${task.bounty_usdt.toFixed(2)} USDT
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-sm font-mono px-2 py-1 rounded transition-colors"
            style={{ color: "var(--text-dim)" }}
          >
            ESC
          </button>
        </div>

        {/* Description */}
        <div className="mb-4">
          <div
            className="text-[10px] font-semibold tracking-widest uppercase mb-1"
            style={{ color: "var(--text-dim)" }}
          >
            Description
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {task.description}
          </p>
        </div>

        {/* Agent */}
        {task.agent_address && (
          <div className="mb-4">
            <div
              className="text-[10px] font-semibold tracking-widest uppercase mb-1"
              style={{ color: "var(--text-dim)" }}
            >
              Agent
            </div>
            <span
              className="text-xs font-mono"
              style={{ color: "var(--text-secondary)" }}
            >
              {task.agent_address}
            </span>
          </div>
        )}

        {/* Result */}
        {task.result && (
          <div className="mb-4">
            <div
              className="text-[10px] font-semibold tracking-widest uppercase mb-1"
              style={{ color: "var(--text-dim)" }}
            >
              Result
            </div>
            <pre
              className="text-xs leading-relaxed whitespace-pre-wrap rounded p-3 overflow-x-auto font-mono"
              style={{
                background: "var(--bg-raised)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-dim)",
              }}
            >
              {task.result}
            </pre>
          </div>
        )}

        {/* Actions */}
        {task.status === "submitted" && (
          <div
            className="flex gap-2 pt-2 border-t"
            style={{ borderColor: "var(--border-dim)" }}
          >
            <button
              onClick={() => onApprove(task.id)}
              className="px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
              style={{ background: "var(--accent)", color: "var(--bg-base)" }}
            >
              Approve and Pay
            </button>
            <button
              onClick={() => onReject(task.id)}
              className="px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
              style={{
                background: "var(--negative-dim)",
                color: "var(--negative)",
              }}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
