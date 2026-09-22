"use client";

import { Loader2, Inbox, AlertCircle, RefreshCw } from "lucide-react";

export function LoadingState({ label = "Loading data..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-white/5 glass-panel p-8 text-xs text-slate-400 shadow-card">
      <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
      <span className="font-mono text-[11px] tracking-wide">{label}</span>
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-xl border border-white/5 glass-panel p-3.5 shadow-card"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white/5 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
              <div className="h-2 w-28 rounded bg-white/5 animate-pulse" />
            </div>
          </div>
          <div className="mt-3.5 pt-2 border-t border-white/5">
            <div className="h-7 w-16 rounded bg-white/5 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/5 glass-panel shadow-card">
      <div className="border-b border-white/5 px-4 py-3">
        <div className="h-4 w-32 rounded bg-white/5 animate-pulse" />
      </div>
      <div className="divide-y divide-white/5 p-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-white/5 animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 rounded bg-white/5 animate-pulse" />
                <div className="h-2 w-40 rounded bg-white/5 animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-20 rounded bg-white/5 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ label = "No records found." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 glass-panel p-8 text-center text-slate-500 shadow-card">
      <Inbox className="h-7 w-7 text-slate-600" />
      <p className="text-xs font-medium text-slate-400">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 text-center text-xs shadow-card backdrop-blur-md">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
        <AlertCircle className="h-4 w-4" />
      </div>
      <p className="text-xs text-rose-300 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
