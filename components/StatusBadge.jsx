"use client";

import { STATUS_META } from "@/lib/statusMeta";

const styles = {
  amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  rose: "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

export default function StatusBadge({ status, stage }) {
  const meta = STATUS_META[status] || STATUS_META.IN_REVIEW;
  const label = status === "IN_REVIEW" && stage ? `${meta.label} ${stage}` : meta.label;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${styles[meta.color]}`}
    >
      <span>{meta.icon}</span>
      {label}
    </span>
  );
}
