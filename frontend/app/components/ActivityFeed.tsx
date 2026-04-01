"use client";

import { usePolling, type Activity } from "../hooks/useApi";
import { useRef, useEffect } from "react";

function getStyle(action: string) {
  if (
    action.includes("payment") ||
    action.includes("approve") ||
    action.includes("complete")
  )
    return { color: "var(--accent)", label: "PAY" };
  if (action.includes("purchased") || action.includes("tool"))
    return { color: "var(--negative)", label: "BUY" };
  if (action.includes("accepted") || action.includes("progress"))
    return { color: "var(--warning)", label: "RUN" };
  if (action.includes("submitted"))
    return { color: "var(--info)", label: "SUB" };
  if (action.includes("created"))
    return { color: "var(--text-dim)", label: "NEW" };
  if (action.includes("rejected"))
    return { color: "var(--negative)", label: "REJ" };
  return { color: "var(--text-dim)", label: "---" };
}

function timeAgo(dateStr: string) {
  const sec = Math.floor(
    (Date.now() - new Date(dateStr + "Z").getTime()) / 1000,
  );
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  return `${hr}h`;
}

export default function ActivityFeed() {
  const { data: activityData, loading } = usePolling<{
    activities: Activity[];
  }>("/tasks/api/activity");
  const activities = activityData?.activities;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [activities]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "var(--text-secondary)" }}
        >
          Activity
        </h2>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
          <span
            className="text-[10px] font-mono"
            style={{ color: "var(--text-dim)" }}
          >
            LIVE
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-0.5 -mx-1 px-1"
        style={{ maxHeight: "420px" }}
      >
        {loading && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-10 rounded"
                style={{ background: "var(--bg-raised)" }}
              />
            ))}
          </div>
        )}

        {!loading && (!activities || activities.length === 0) && (
          <div className="flex items-center justify-center h-32">
            <span
              className="text-xs font-mono"
              style={{ color: "var(--text-dim)" }}
            >
              Waiting for activity...
            </span>
          </div>
        )}

        {activities?.map((a, i) => {
          const style = getStyle(a.action);
          return (
            <div
              key={`${a.created_at}-${i}`}
              className="ticker-enter flex items-center gap-2.5 py-2 px-2 rounded transition-colors"
              style={{
                background: i === 0 ? "var(--bg-raised)" : "transparent",
              }}
            >
              <span
                className="badge shrink-0 text-[9px] font-mono font-semibold"
                style={{
                  color: style.color,
                  background: `color-mix(in srgb, ${style.color} 12%, transparent)`,
                }}
              >
                {style.label}
              </span>
              <span
                className="text-xs truncate flex-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {a.detail}
              </span>
              {a.amount_usdt != null && a.amount_usdt > 0 && (
                <span
                  className="text-xs font-mono shrink-0 tabular-nums"
                  style={{ color: style.color }}
                >
                  ${a.amount_usdt.toFixed(2)}
                </span>
              )}
              <span
                className="text-[10px] font-mono shrink-0 tabular-nums"
                style={{ color: "var(--text-dim)" }}
              >
                {timeAgo(a.created_at)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
