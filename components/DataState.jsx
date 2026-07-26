"use client";

export function LoadingState({ label = "লোড হচ্ছে..." }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-navy-900/60 p-10 text-sm text-slate-400 shadow-xl backdrop-blur-xl">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-400" />
      {label}
    </div>
  );
}

export function EmptyState({ label = "কোনো তথ্য নেই।" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-10 text-center text-slate-500 shadow-xl backdrop-blur-xl">
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-sm text-rose-300 shadow-xl">
      <p>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20"
        >
          আবার চেষ্টা করুন
        </button>
      )}
    </div>
  );
}
