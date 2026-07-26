"use client";

export default function Pager({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-6 py-3 text-xs text-slate-400">
      <span>{total === 0 ? "কোনো রেকর্ড নেই" : `${start}–${end} / ${total.toLocaleString("en-US")}`}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-slate-200 transition hover:border-violet-500/40 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:text-slate-200"
        >
          আগের
        </button>
        <span className="px-1 tabular-nums">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-slate-200 transition hover:border-violet-500/40 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:text-slate-200"
        >
          পরের
        </button>
      </div>
    </div>
  );
}
