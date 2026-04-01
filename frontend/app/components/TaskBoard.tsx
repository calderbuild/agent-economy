"use client";

import { useState, useCallback } from "react";
import {
  usePolling,
  approveTask,
  rejectTask,
  type Task,
} from "../hooks/useApi";
import PostTaskForm from "./PostTaskForm";
import TaskDetail from "./TaskDetail";

const statusMap: Record<string, { label: string; color: string }> = {
  open: { label: "OPEN", color: "var(--info)" },
  in_progress: { label: "RUNNING", color: "var(--warning)" },
  submitted: { label: "REVIEW", color: "var(--accent)" },
  completed: { label: "DONE", color: "var(--accent)" },
};

export default function TaskBoard() {
  const {
    data: tasksData,
    loading,
    refetch,
  } = usePolling<{ tasks: Task[]; count: number }>("/tasks");
  const tasks = tasksData?.tasks;
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState("all");

  const handleApprove = useCallback(
    async (id: string) => {
      await approveTask(id);
      setSelectedTask(null);
      refetch();
    },
    [refetch],
  );

  const handleReject = useCallback(
    async (id: string) => {
      await rejectTask(id);
      setSelectedTask(null);
      refetch();
    },
    [refetch],
  );

  const filtered = tasks?.filter(
    (t) => filter === "all" || t.status === filter,
  );
  const filters = ["all", "open", "in_progress", "submitted", "completed"];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "var(--text-secondary)" }}
        >
          Task Board
        </h2>
        <span
          className="text-[10px] font-mono tabular-nums"
          style={{ color: "var(--text-dim)" }}
        >
          {tasks?.length ?? 0} tasks
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-3">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded transition-colors"
            style={{
              background: filter === f ? "var(--bg-raised)" : "transparent",
              color: filter === f ? "var(--text-primary)" : "var(--text-dim)",
              border:
                filter === f
                  ? "1px solid var(--border-mid)"
                  : "1px solid transparent",
            }}
          >
            {f === "all"
              ? "All"
              : f === "in_progress"
                ? "Active"
                : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Post task */}
      <PostTaskForm onCreated={refetch} />

      {/* Task list */}
      <div
        className="flex-1 overflow-y-auto space-y-1.5 mt-3"
        style={{ maxHeight: "360px" }}
      >
        {loading &&
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded"
              style={{ background: "var(--bg-raised)" }}
            />
          ))}

        {!loading && (!filtered || filtered.length === 0) && (
          <div className="flex items-center justify-center h-24">
            <span
              className="text-xs font-mono"
              style={{ color: "var(--text-dim)" }}
            >
              No tasks
            </span>
          </div>
        )}

        {filtered?.map((task) => {
          const status = statusMap[task.status] || {
            label: task.status,
            color: "var(--text-dim)",
          };
          return (
            <button
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="w-full text-left rounded p-3 transition-all"
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border-dim)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-mid)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-dim)";
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-sm font-medium truncate pr-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  {task.title}
                </span>
                <span
                  className="badge text-[9px] font-mono shrink-0"
                  style={{
                    color: status.color,
                    background: `color-mix(in srgb, ${status.color} 12%, transparent)`,
                  }}
                >
                  {status.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] truncate"
                  style={{ color: "var(--text-dim)" }}
                >
                  {task.description?.slice(0, 60)}...
                </span>
                <span
                  className="text-xs font-mono font-semibold tabular-nums shrink-0 ml-2"
                  style={{ color: "var(--accent)" }}
                >
                  ${task.bounty_usdt.toFixed(2)}
                </span>
              </div>
              {task.status === "submitted" && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(task.id);
                    }}
                    className="px-3 py-1 text-[10px] font-semibold rounded uppercase tracking-wider transition-opacity hover:opacity-80"
                    style={{
                      background: "var(--accent-dim)",
                      color: "var(--accent)",
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(task.id);
                    }}
                    className="px-3 py-1 text-[10px] font-semibold rounded uppercase tracking-wider transition-opacity hover:opacity-80"
                    style={{
                      background: "var(--negative-dim)",
                      color: "var(--negative)",
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
