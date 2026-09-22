"use client";

import { useState } from "react";
import { useLiveApi } from "@/lib/hooks";
import StatusBadge from "@/components/StatusBadge";
import { Radio, Copy, Check, Terminal, Clock, ShieldCheck } from "lucide-react";

export default function LiveStatusTracker() {
  const [code, setCode] = useState("");
  const [activeCode, setActiveCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const { data: result, loading, error } = useLiveApi(activeCode ? `/api/track/${encodeURIComponent(activeCode)}` : null, 2500);

  function handleTrack(e) {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed) setActiveCode(trimmed);
  }

  function handleCopy(text) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="glass-card rounded-xl p-5 border border-white/5 shadow-card">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-300">
              Live Real-Time Telemetry
            </h3>
            <p className="text-[11px] text-slate-500">Autonomous verification status monitor</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          Active Polling
        </span>
      </div>

      <form onSubmit={handleTrack} className="flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter tracking code (e.g. 1234567890123456)"
            className="glass-input w-full rounded-lg px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 outline-none transition"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition active:scale-[0.98]"
        >
          <Radio className="h-3.5 w-3.5" />
          <span>Monitor Code</span>
        </button>
      </form>

      {activeCode && (
        <div className="mt-4 rounded-lg border border-white/5 terminal-bg p-3.5 font-mono text-xs animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5 mb-2.5">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-brand-400" />
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">Target:</span>
              <span className="font-semibold text-slate-200">{activeCode}</span>
              <button
                type="button"
                onClick={() => handleCopy(activeCode)}
                className="inline-flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400 hover:bg-white/10 hover:text-white transition"
                title="Copy code"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div>
              {error && <span className="text-rose-400 text-[11px]">{error}</span>}
              {!error && loading && <span className="text-slate-500 text-[11px] animate-pulse">Syncing...</span>}
              {!error && !loading && result && <StatusBadge status={result.status} stage={result.stage} />}
            </div>
          </div>

          {result && (
            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" /> Verification Stage
                </span>
                <span className="text-slate-200">{result.stage || 3} of 3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="h-3 w-3 text-slate-500" /> Server Timestamp
                </span>
                <span className="text-slate-300">{new Date(result.updatedAt).toLocaleTimeString("en-GB")}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
