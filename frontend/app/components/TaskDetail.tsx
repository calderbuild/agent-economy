"use client";

import { type Task } from "../hooks/useApi";

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  open: {
    label: "Open",
    color: "text-accent-blue",
    bg: "bg-accent-blue/10 border-accent-blue/20",
  },
  in_progress: {
    label: "In Progress",
    color: "text-accent-yellow",
    bg: "bg-accent-yellow/10 border-accent-yellow/20",
  },
  submitted: {
    label: "Submitted",
    color: "text-accent-purple",
    bg: "bg-accent-purple/10 border-accent-purple/20",
  },
  completed: {
    label: "Completed",
    color: "text-accent-green",
    bg: "bg-accent-green/10 border-accent-green/20",
  },
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
  const status = statusConfig[task.status] ?? statusConfig.open;

  return (
    <div
      className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-card-strong w-full max-w-lg p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 mr-4">
            <h3 className="text-lg font-semibold text-white mb-1">
              {task.title}
            </h3>
            <span
              className={`inline-block text-xs font-medium px-2 py-0.5 rounded border ${status.bg} ${status.color}`}
            >
              {status.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <svg
              width={20}
              height={20}
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-wider">
              Description
            </label>
            <p className="text-slate-300 mt-1 leading-relaxed">
              {task.description}
            </p>
          </div>

          <div className="flex gap-6">
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider">
                Bounty
              </label>
              <p className="text-accent-green font-semibold mt-1">
                ${task.bounty_usdt.toFixed(2)}{" "}
                <span className="text-slate-500 font-normal text-xs">USDT</span>
              </p>
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider">
                Created
              </label>
              <p className="text-slate-300 mt-1">
                {new Date(task.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {task.required_capabilities?.length > 0 && (
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider">
                Capabilities
              </label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {task.required_capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="text-xs px-2 py-0.5 rounded bg-surface-700 text-slate-400 border border-surface-600"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          )}

          {task.agent_address && (
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider">
                Agent
              </label>
              <p className="text-slate-300 mt-1 font-mono text-xs">
                {task.agent_address}
              </p>
            </div>
          )}

          {task.result && (
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider">
                Result
              </label>
              <div className="mt-1.5 p-3 rounded-lg bg-surface-900/80 border border-surface-600 max-h-48 overflow-y-auto">
                <pre className="text-slate-300 text-xs whitespace-pre-wrap leading-relaxed font-mono">
                  {task.result}
                </pre>
              </div>
            </div>
          )}
        </div>

        {task.status === "submitted" && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
            <button
              onClick={() => onApprove(task.id)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-accent-green/15 text-accent-green border border-accent-green/20 font-medium text-sm hover:bg-accent-green/25 transition-all duration-200"
            >
              Approve
            </button>
            <button
              onClick={() => onReject(task.id)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-accent-red/15 text-accent-red border border-accent-red/20 font-medium text-sm hover:bg-accent-red/25 transition-all duration-200"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
