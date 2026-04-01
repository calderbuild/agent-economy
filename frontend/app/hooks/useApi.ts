"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4021";

export interface Task {
  id: string;
  title: string;
  description: string;
  bounty_usdt: number;
  required_capabilities: string[];
  creator_address: string;
  agent_address?: string;
  status: "open" | "in_progress" | "submitted" | "completed";
  result?: string;
  created_at: string;
  updated_at: string;
}

export interface Metrics {
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  totalVolume: number;
  agentEarnings: number;
  agentSpending: number;
  agentProfit: number;
}

export interface Activity {
  action: string;
  detail: string;
  task_id?: string;
  amount_usdt?: number;
  created_at: string;
}

export interface Transaction {
  type: string;
  from_address: string;
  to_address: string;
  amount_usdt: number;
  tool_id?: string;
  task_id?: string;
  tx_hash?: string;
  created_at: string;
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function usePolling<T>(path: string, interval = 3000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    const result = await apiFetch<T>(path);
    if (!mountedRef.current) return;
    if (result !== null) {
      setData(result);
      setError(false);
    } else {
      setError(true);
    }
    setLoading(false);
  }, [path]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    const id = setInterval(fetchData, interval);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchData, interval]);

  return { data, loading, error, refetch: fetchData };
}

export function useBackendHealth() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const result = await apiFetch<{ status: string }>("/health");
      if (mounted) setConnected(result !== null);
    };
    check();
    const id = setInterval(check, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return connected;
}

export async function postTask(task: {
  title: string;
  description: string;
  bounty_usdt: number;
  required_capabilities: string[];
  creator_address: string;
}) {
  return apiFetch<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(task),
  });
}

export async function approveTask(taskId: string) {
  return apiFetch<Task>(`/tasks/${taskId}/approve`, { method: "POST" });
}

export async function rejectTask(taskId: string) {
  return apiFetch<Task>(`/tasks/${taskId}/reject`, { method: "POST" });
}
