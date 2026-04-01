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

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; dotColor: string }
> = {
  open: {
    label: "Open",
    color: "text-accent-blue",
    bg: "bg-accent-blue/10 border-accent-blue/20",
    dotColor: "bg-accent-blue",
  },
  in_progress: {
    label: "In Progress",
    color: "text-accent-yellow",
    bg: "bg-accent-yellow/10 border-accent-yellow/20",
    dotColor: "bg-accent-yellow",
  },
  submitted: {
    label: "Submitted",
    color: "text-accent-purple",
    bg: "bg-accent-purple/10 border-accent-purple/20",
    dotColor: "bg-accent-purple",
  },
  completed: {
    label: "Completed",
    color: "text-accent-green",
    bg: "bg-accent-green/10 border-accent-green/20",
    dotColor: "bg-accent-green",
  },
};

export default function TaskBoard() {
  const {
    data: tasksData,
    loading,
    refetch,
  } = usePolling<{ tasks: Task[]; count: number }>("/tasks");
  const tasks = tasksData?.tasks;
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<string>("all");

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white tracking-tight">
          Task Board
        </h2>
        <span className="text-xs text-slate-500">
          {tasks?.length ?? 0} tasks
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 p-0.5 rounded-lg bg-surface-900/50">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-md transition-all duration-200 capitalize ${
              filter === f
                ? "bg-surface-700 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {f === "in_progress" ? "Active" : f}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <PostTaskForm onCreated={refetch} />
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {loading && !tasks ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-4 h-20 animate-pulse" />
            ))}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No tasks found
          </div>
        ) : (
          filtered?.map((task) => {
            const status = statusConfig[task.status] ?? statusConfig.open;
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="glass-card p-4 cursor-pointer hover:bg-surface-700/50 transition-all duration-200 animate-fade-in group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${status.dotColor} ${
                          task.status === "in_progress" ? "status-dot" : ""
                        }`}
                      />
                      <h3 className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                        {task.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 ml-3.5">
                      {task.description}
                    </p>
                    {task.required_capabilities?.length > 0 && (
                      <div className="flex gap-1 mt-2 ml-3.5">
                        {task.required_capabilities.slice(0, 3).map((cap) => (
                          <span
                            key={cap}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-surface-700/80 text-slate-500"
                          >
                            {cap}
                          </span>
                        ))}
                        {task.required_capabilities.length > 3 && (
                          <span className="text-[10px] text-slate-600">
                            +{task.required_capabilities.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-sm font-semibold text-accent-green">
                      ${task.bounty_usdt.toFixed(2)}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${status.bg} ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>

                {task.status === "submitted" && (
                  <div className="flex gap-2 mt-3 ml-3.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(task.id);
                      }}
                      className="text-xs px-3 py-1.5 rounded-md bg-accent-green/10 text-accent-green border border-accent-green/20 hover:bg-accent-green/20 transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(task.id);
                      }}
                      className="text-xs px-3 py-1.5 rounded-md bg-accent-red/10 text-accent-red border border-accent-red/20 hover:bg-accent-red/20 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
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
