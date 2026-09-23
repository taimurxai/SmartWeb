"use client";

import { Search, X } from "lucide-react";

export default function SearchInput({ value, onChange, placeholder, ariaLabel }) {
  return (
    <div className="relative w-full sm:w-64">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        className="w-full rounded-sm border border-border-subtle bg-surface-secondary py-1.5 pl-8 pr-7 text-xs text-text-primary placeholder-text-muted outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
          title="Clear search"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
