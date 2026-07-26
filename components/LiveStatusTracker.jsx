"use client";

import { useState } from "react";
import { useLiveApi } from "@/lib/hooks";
import StatusBadge from "@/components/StatusBadge";

// Real-time replacement for setInterval-based status polling. Assumes each
// tracked item is a document at submissions/{code} shaped like:
//   { status: "IN_REVIEW" | "SUCCESS" | "FAILED", stage: 1|2|3, updatedAt }
// Whoever writes that document (admin action, Cloud Function, backend job)
// triggers this listener the instant the write lands — no interval needed.
export default function LiveStatusTracker() {
  const [code, setCode] = useState("");
  const [activeCode, setActiveCode] = useState(null);
  const { data: result, loading, error } = useLiveApi(activeCode ? `/api/track/${activeCode}` : null, 2500);

  function handleTrack(e) {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed) setActiveCode(trimmed);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-6 shadow-xl backdrop-blur-xl">
      <form onSubmit={handleTrack} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. 1234 5678 9012 3456"
          className="flex-1 rounded-xl border border-white/10 bg-navy-950/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
        />
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:from-violet-500 hover:to-blue-500"
        >
          Track
        </button>
      </form>

      {activeCode && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">ট্র্যাকিং কোড</p>
            <p className="mt-1 font-mono text-lg text-white">{activeCode}</p>
          </div>
          <div className="text-right">
            <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">বর্তমান স্ট্যাটাস · লাইভ</p>
            {error && <p className="text-sm text-rose-300">{error}</p>}
            {!error && loading && <span className="text-sm text-slate-400">লোড হচ্ছে...</span>}
            {!error && !loading && result && <StatusBadge status={result.status} stage={result.stage} />}
            {!error && !loading && !result && (
              <span className="text-sm text-rose-300">এই কোডে কোনো ডকুমেন্ট পাওয়া যায়নি</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
