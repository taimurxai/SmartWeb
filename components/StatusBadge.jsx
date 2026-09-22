"use client";

import { STATUS_META } from "@/lib/statusMeta";
import { Clock, CheckCircle2, XCircle, AlertTriangle, MessageCircle } from "lucide-react";

const ICONS = {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageCircle,
};

const STYLES = {
  amber: "bg-amber-500/10 text-amber-300 border-amber-500/25",
  emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
  rose: "bg-rose-500/10 text-rose-300 border-rose-500/25",
  blue: "bg-blue-500/10 text-blue-300 border-blue-500/25",
};

export default function StatusBadge({ status, stage }) {
  const meta = STATUS_META[status] || STATUS_META.IN_REVIEW;
  const Icon = ICONS[meta.iconType] || Clock;
  const label = status === "IN_REVIEW" && stage ? `${meta.label} (${stage}/3)` : meta.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${
        STYLES[meta.color] || STYLES.amber
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
      <span>{label}</span>
    </span>
  );
}

