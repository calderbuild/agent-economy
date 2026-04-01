"use client";

import { useState } from "react";
import { postTask } from "../hooks/useApi";

const CAPABILITIES = [
  "web_search",
  "code_analysis",
  "data_processing",
  "text_generation",
  "image_analysis",
  "translation",
];

export default function PostTaskForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bounty, setBounty] = useState("1.00");
  const [caps, setCaps] = useState<string[]>([]);

  const toggleCap = (cap: string) => {
    setCaps((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    await postTask({
      title: title.trim(),
      description: description.trim(),
      bounty_usdt: parseFloat(bounty) || 1.0,
      required_capabilities: caps,
      creator_address: "0xHumanOperator",
    });
    setTitle("");
    setDescription("");
    setBounty("1.00");
    setCaps([]);
    setSubmitting(false);
    setOpen(false);
    onCreated();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2.5 rounded-lg border border-dashed border-surface-600 text-slate-400 text-sm font-medium hover:border-accent-blue/40 hover:text-accent-blue transition-all duration-200"
      >
        + Post New Task
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card p-4 space-y-3 animate-slide-up"
    >
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-semibold text-white">New Task</h4>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-slate-500 hover:text-slate-300 text-xs"
        >
          Cancel
        </button>
      </div>

      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-lg bg-surface-900/60 border border-surface-600 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue/50 transition-colors"
      />

      <textarea
        placeholder="Task description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        rows={3}
        className="w-full px-3 py-2 rounded-lg bg-surface-900/60 border border-surface-600 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue/50 transition-colors resize-none"
      />

      <div className="flex items-center gap-3">
        <label className="text-xs text-slate-400">Bounty (USDT)</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={bounty}
          onChange={(e) => setBounty(e.target.value)}
          className="w-24 px-2 py-1.5 rounded-lg bg-surface-900/60 border border-surface-600 text-sm text-accent-green font-mono focus:outline-none focus:border-accent-green/50 transition-colors"
        />
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">
          Required Capabilities
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CAPABILITIES.map((cap) => (
            <button
              key={cap}
              type="button"
              onClick={() => toggleCap(cap)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-200 ${
                caps.includes(cap)
                  ? "border-accent-purple/40 bg-accent-purple/15 text-accent-purple"
                  : "border-surface-600 bg-surface-700/50 text-slate-500 hover:text-slate-300"
              }`}
            >
              {cap}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || !title.trim() || !description.trim()}
        className="w-full py-2.5 rounded-lg bg-accent-blue/15 text-accent-blue border border-accent-blue/20 font-medium text-sm hover:bg-accent-blue/25 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Posting..." : "Post Task"}
      </button>
    </form>
  );
}
