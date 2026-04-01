"use client";

import { usePolling, type Activity } from "../hooks/useApi";
import { useRef, useEffect } from "react";

function getActivityStyle(action: string) {
  if (action.includes("complete") || action.includes("approve")) {
    return {
      color: "text-accent-green",
      bg: "bg-accent-green/10",
      icon: "check",
    };
  }
  if (action.includes("accept") || action.includes("progress")) {
    return {
      color: "text-accent-yellow",
      bg: "bg-accent-yellow/10",
      icon: "bolt",
    };
  }
  if (action.includes("submit")) {
    return {
      color: "text-accent-purple",
      bg: "bg-accent-purple/10",
      icon: "arrow-up",
    };
  }
  if (
    action.includes("tool") ||
    action.includes("purchase") ||
    action.includes("spend")
  ) {
    return { color: "text-accent-red", bg: "bg-accent-red/10", icon: "cart" };
  }
  if (action.includes("create") || action.includes("post")) {
    return { color: "text-accent-blue", bg: "bg-accent-blue/10", icon: "plus" };
  }
  if (action.includes("reject")) {
    return { color: "text-accent-red", bg: "bg-accent-red/10", icon: "x" };
  }
  return { color: "text-slate-400", bg: "bg-surface-700", icon: "dot" };
}

function ActivityIcon({ type }: { type: string }) {
  const cls = "w-3.5 h-3.5 shrink-0";
  switch (type) {
    case "check":
      return (
        <svg
          width={14}
          height={14}
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      );
    case "bolt":
      return (
        <svg
          width={14}
          height={14}
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
          />
        </svg>
      );
    case "arrow-up":
      return (
        <svg
          width={14}
          height={14}
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
          />
        </svg>
      );
    case "cart":
      return (
        <svg
          width={14}
          height={14}
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>
      );
    case "plus":
      return (
        <svg
          width={14}
          height={14}
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      );
    case "x":
      return (
        <svg
          width={14}
          height={14}
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      );
    default:
      return <span className="w-1.5 h-1.5 rounded-full bg-current" />;
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export default function ActivityFeed() {
  const { data: activityData, loading } = usePolling<{
    activities: Activity[];
  }>("/tasks/api/activity");
  const activities = activityData?.activities;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activities]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white tracking-tight">
          Activity Feed
        </h2>
        <span className="text-xs text-slate-500">Live</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {loading && !activities ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 bg-surface-700/30 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : !activities?.length ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            Waiting for agent activity...
          </div>
        ) : (
          activities.map((activity, i) => {
            const style = getActivityStyle(activity.action);
            return (
              <div
                key={`${activity.created_at}-${i}`}
                className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-700/30 transition-colors duration-150 animate-fade-in"
              >
                <div
                  className={`shrink-0 w-7 h-7 rounded-full ${style.bg} ${style.color} flex items-center justify-center mt-0.5`}
                >
                  <ActivityIcon type={style.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 leading-snug">
                    <span className={`font-medium ${style.color}`}>
                      {activity.action}
                    </span>
                    {activity.detail && (
                      <span className="text-slate-500">
                        {" "}
                        -- {activity.detail}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-600">
                      {timeAgo(activity.created_at)}
                    </span>
                    {activity.amount_usdt !== undefined &&
                      activity.amount_usdt > 0 && (
                        <span
                          className={`text-[10px] font-medium ${style.color}`}
                        >
                          ${activity.amount_usdt.toFixed(2)}
                        </span>
                      )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
