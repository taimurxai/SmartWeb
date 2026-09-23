"use client";

import { useState, useEffect, useRef } from "react";
import { useLiveApi } from "@/lib/hooks";
import StatusBadge from "@/components/StatusBadge";
import { Radio, Copy, Check, Terminal, Clock, ShieldCheck, X, Trash2, ArrowRight } from "lucide-react";

export default function LiveStatusTracker() {
  const [code, setCode] = useState("");
  const [activeCode, setActiveCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedLog, setCopiedLog] = useState(false);
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  const { data: result, loading, error } = useLiveApi(
    activeCode ? `/api/track/${encodeURIComponent(activeCode)}` : null,
    2500
  );

  function handleTrack(e) {
    if (e) e.preventDefault();
    const trimmed = code.trim();
    if (trimmed) {
      setActiveCode(trimmed);
      const time = new Date().toLocaleTimeString("en-GB");
      setLogs([
        { time, tag: "SYS", color: "text-info", text: `Subscribed to stream for target: ${trimmed}` },
        { time, tag: "NET", color: "text-brand-400", text: "Connecting to neural verification node..." },
        { time, tag: "POLL", color: "text-text-muted", text: "Autonomous polling interval set to 2500ms" },
      ]);
    }
  }

  useEffect(() => {
    if (result && activeCode) {
      const time = new Date().toLocaleTimeString("en-GB");
      setLogs((prev) => {
        const last = prev[prev.length - 1];
        const statusText = `Status updated: ${result.status} (Stage ${result.stage || 1}/3)`;
        if (last && last.text === statusText) return prev;
        return [
          ...prev,
          {
            time,
            tag: result.status === "SUCCESS" ? "OK" : result.status === "FAILED" ? "ERR" : "STAGE",
            color: result.status === "SUCCESS" ? "text-success" : result.status === "FAILED" ? "text-error" : "text-accent",
            text: statusText,
          },
        ];
      });
    }
  }, [result, activeCode]);

  function handleCopy(text) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCopyLogs() {
    if (logs.length === 0) return;
    const text = logs.map((l) => `[${l.time}] [${l.tag}] ${l.text}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  }

  function handleClearLogs() {
    setLogs([]);
  }

  return (
    <div className="bg-surface-primary rounded-md p-5 border border-border-subtle shadow-sm card-interactive">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-sm bg-accent/15 border border-accent/30 text-accent">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-wide uppercase text-text-secondary">
              Live Real-Time Telemetry
            </h3>
            <p className="text-[11px] text-text-muted">Autonomous verification stream & log observer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-success">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {activeCode ? "Stream Active" : "Stream Standby"}
          </span>
        </div>
      </div>

      <form onSubmit={handleTrack} className="flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter tracking code (e.g. 1234567890123456)"
            className="bg-surface-secondary w-full rounded-sm px-3.5 py-2 pr-16 text-xs font-mono text-text-primary placeholder-text-muted outline-none transition border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          {code && (
            <button
              type="button"
              onClick={() => setCode("")}
              className="absolute right-9 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1"
              title="Clear input"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border-subtle bg-surface-primary px-1.5 py-0.5 text-[9px] font-mono text-text-muted">
            ↵
          </span>
        </div>
        <button
          type="submit"
          className="btn-press inline-flex items-center justify-center gap-1.5 rounded-sm bg-accent hover:opacity-90 px-4 py-2 text-xs font-semibold text-text-primary shadow-sm transition"
        >
          <Radio className="h-3.5 w-3.5" />
          <span>Monitor Code</span>
        </button>
      </form>

      {activeCode && (
        <div className="mt-4 rounded-sm border border-border-subtle terminal-bg p-4 font-mono text-xs animate-fade-in shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle/40 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-accent" />
              <span className="text-[11px] text-text-faint uppercase tracking-wider">Target:</span>
              <span className="font-semibold text-text-primary bg-surface-primary/10 px-2 py-0.5 rounded border border-white/5">
                {activeCode}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(activeCode)}
                className="btn-press inline-flex items-center gap-1 rounded bg-surface-primary/20 border border-white/10 px-1.5 py-0.5 text-[10px] text-text-faint hover:text-white transition"
                title="Copy code"
              >
                {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              {error && <span className="text-error text-[11px]">{error}</span>}
              {!error && loading && <span className="text-accent text-[11px] animate-pulse">Syncing telemetry...</span>}
              {!error && !loading && result && <StatusBadge status={result.status} stage={result.stage} />}

              <div className="flex items-center gap-1 ml-2 border-l border-white/10 pl-2">
                <button
                  type="button"
                  onClick={handleCopyLogs}
                  className="p-1 rounded text-text-muted hover:text-white hover:bg-white/10 transition"
                  title="Copy log buffer"
                >
                  {copiedLog ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                </button>
                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="p-1 rounded text-text-muted hover:text-error hover:bg-white/10 transition"
                  title="Clear terminal buffer"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Telemetry live feed log */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-[11px]">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2.5 font-mono leading-relaxed opacity-90 hover:opacity-100 hover:bg-white/5 px-1 py-0.5 rounded transition-colors">
                <span className="text-text-muted/60 shrink-0 select-none">[{log.time}]</span>
                <span className={`font-bold w-12 shrink-0 ${log.color}`}>[{log.tag}]</span>
                <span className="text-text-faint flex-1">{log.text}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1 text-accent select-none">
              <span>&gt;</span>
              <span className="h-3 w-1.5 bg-accent animate-cursor inline-block" />
            </div>
            <div ref={logsEndRef} />
          </div>

          {result && (
            <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-text-muted">
              <span className="flex items-center gap-1 text-text-faint">
                <ShieldCheck className="h-3 w-3 text-success" /> Stage {result.stage || 1} of 3
              </span>
              <span className="flex items-center gap-1 text-text-muted/80">
                <Clock className="h-3 w-3 text-text-muted/60" /> Updated: {new Date(result.updatedAt).toLocaleTimeString("en-GB")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
