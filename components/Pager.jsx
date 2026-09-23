"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pager({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle px-4 py-2.5 text-xs text-text-muted">
      <span>{total === 0 ? "No records found" : `${start}–${end} of ${total.toLocaleString("en-US")}`}</span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous Page"
          className="btn-press inline-flex items-center gap-1 rounded-sm border border-border-subtle bg-surface-primary px-2.5 py-1 text-xs font-medium text-text-primary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border-subtle"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Prev</span>
        </button>
        <span className="px-2 tabular-nums text-text-primary font-mono text-[11px] font-medium">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next Page"
          className="btn-press inline-flex items-center gap-1 rounded-sm border border-border-subtle bg-surface-primary px-2.5 py-1 text-xs font-medium text-text-primary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border-subtle"
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
