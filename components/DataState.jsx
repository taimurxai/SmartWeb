"use client";

import { Loader2, Inbox, AlertCircle, RefreshCw } from "lucide-react";

export function LoadingState({ label = "Loading data..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 rounded-md border border-border-subtle bg-surface-primary p-8 text-xs text-text-muted shadow-sm">
      <div className="relative flex h-5 w-5 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-30" />
        <Loader2 className="relative h-5 w-5 animate-spin text-accent" />
      </div>
      <span className="font-mono text-[11px] tracking-wide mt-1">{label}</span>
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-md border border-border-subtle bg-surface-primary p-3.5 shadow-sm"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-surface-secondary/60 to-transparent animate-shimmer" />
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-sm bg-surface-secondary animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-20 rounded bg-surface-secondary animate-pulse" />
              <div className="h-2 w-28 rounded bg-surface-secondary animate-pulse" />
            </div>
          </div>
          <div className="mt-3.5 pt-2 border-t border-border-subtle">
            <div className="h-7 w-16 rounded bg-surface-secondary animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="overflow-hidden rounded-md border border-border-subtle bg-surface-primary shadow-sm relative">
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-surface-secondary/40 to-transparent animate-shimmer" />
      <div className="border-b border-border-subtle px-4 py-3">
        <div className="h-4 w-32 rounded bg-surface-secondary animate-pulse" />
      </div>
      <div className="divide-y divide-border-faint p-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-surface-secondary animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 rounded bg-surface-secondary animate-pulse" />
                <div className="h-2 w-40 rounded bg-surface-secondary animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-20 rounded bg-surface-secondary animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ label = "No records found." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-border-subtle bg-surface-primary p-8 text-center text-text-faint shadow-sm">
      <Inbox className="h-7 w-7 text-text-tertiary" />
      <p className="text-xs font-medium text-text-muted">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-2 rounded-md border border-rose-500/20 bg-rose-500/5 p-6 text-center text-xs shadow-sm backdrop-blur-md">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10 text-error">
        <AlertCircle className="h-4 w-4" />
      </div>
      <p className="text-xs text-rose-300 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-1.5 rounded-sm border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
