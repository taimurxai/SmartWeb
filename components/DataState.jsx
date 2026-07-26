"use client";

export function LoadingState({ label = "লোড হচ্ছে..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-navy-900/60 p-12 text-sm text-slate-400 shadow-xl backdrop-blur-xl transition-all duration-300">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <span className="absolute inset-0 animate-pulse-slow rounded-full bg-violet-500/20" />
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
      </div>
      <span className="animate-pulse">{label}</span>
    </div>
  );
}

export function EmptyState({ label = "কোনো তথ্য নেই।" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-navy-900/60 p-12 text-center text-slate-500 shadow-xl backdrop-blur-xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
        <span className="text-xl">📭</span>
      </div>
      <p className="font-medium text-slate-400">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center text-sm shadow-xl backdrop-blur-xl">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
        <span className="text-lg">⚠️</span>
      </div>
      <p className="text-rose-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-2 text-xs font-semibold text-rose-200 transition active:scale-[0.98] hover:bg-rose-500/20 hover:text-rose-100"
        >
          আবার চেষ্টা করুন
        </button>
      )}
    </div>
  );
}
