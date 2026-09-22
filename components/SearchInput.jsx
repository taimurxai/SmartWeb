"use client";

import { Search } from "lucide-react";

export default function SearchInput({ value, onChange, placeholder, ariaLabel }) {
  return (
    <div className="relative w-full sm:w-64">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        className="w-full rounded-lg border border-slate-800 bg-slate-950/70 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
      />
    </div>
  );
}
