"use client";

import { useState } from "react";
import { postTask } from "../hooks/useApi";

const CAPABILITIES = [
  "stock-data",
  "web-search",
  "chart-gen",
  "translate",
  "news",
];

export default function PostTaskForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bounty, setBounty] = useState("1.00");
  const [caps, setCaps] = useState<string[]>(["stock-data", "web-search"]);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (cap: string) =>
    setCaps((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    await postTask({
      title: title.trim(),
      description: description.trim(),
      bounty_usdt: parseFloat(bounty) || 1,
      required_capabilities: caps,
      creator_address:
        process.env.NEXT_PUBLIC_DEMO_CREATOR_ADDRESS ||
        "0xDemoUser000000000000000000000000000000",
    });
    setTitle("");
    setDescription("");
    setBounty("1.00");
    setOpen(false);
    setSubmitting(false);
    onCreated();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors"
        style={{
          border: "1px dashed var(--border-mid)",
          color: "var(--text-dim)",
          background: "transparent",
        }}
      >
        + Post Task
      </button>
    );
  }

  return (
    <div
      className="rounded p-3 space-y-2.5"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border-mid)",
      }}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        className="w-full px-3 py-2 rounded text-sm font-medium"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-dim)",
          color: "var(--text-primary)",
        }}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe what the agent should do..."
        rows={2}
        className="w-full px-3 py-2 rounded text-xs resize-none"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-dim)",
          color: "var(--text-secondary)",
        }}
      />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-mono"
            style={{ color: "var(--text-dim)" }}
          >
            BOUNTY
          </span>
          <input
            value={bounty}
            onChange={(e) => setBounty(e.target.value)}
            className="w-16 px-2 py-1 rounded text-xs font-mono text-right"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-dim)",
              color: "var(--accent)",
            }}
          />
          <span
            className="text-[10px] font-mono"
            style={{ color: "var(--text-dim)" }}
          >
            USDT
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CAPABILITIES.map((cap) => (
          <button
            key={cap}
            onClick={() => toggle(cap)}
            className="px-2 py-0.5 rounded text-[10px] font-mono transition-colors"
            style={{
              background: caps.includes(cap)
                ? "var(--accent-dim)"
                : "var(--bg-panel)",
              color: caps.includes(cap) ? "var(--accent)" : "var(--text-dim)",
              border: `1px solid ${
                caps.includes(cap) ? "var(--accent)" : "var(--border-dim)"
              }`,
            }}
          >
            {cap}
          </button>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSubmit}
          disabled={submitting || !title.trim()}
          className="px-4 py-1.5 rounded text-[11px] font-semibold uppercase tracking-wider transition-opacity disabled:opacity-40"
          style={{ background: "var(--accent)", color: "var(--bg-base)" }}
        >
          {submitting ? "Posting..." : "Post"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 rounded text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-dim)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
