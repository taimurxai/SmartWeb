"use client";

import { useLiveApi } from "@/lib/hooks";
import { StatCard } from "@/components/UserActivityDashboard";
import { LoadingState, ErrorState } from "@/components/DataState";
import { Key, Target, XCircle, Clock } from "lucide-react";

const METRIC_CARDS = [
  { key: "totalLogins", label: "Total Logins", accent: "blue", icon: Key, hint: "All login events" },
  { key: "totalAttempts", label: "Total Attempts", accent: "violet", icon: Target, hint: "Verification attempts" },
  { key: "totalFailed", label: "Total Failed", accent: "rose", icon: XCircle, hint: "Failed records" },
  { key: "totalInReview", label: "Total In Review", accent: "amber", icon: Clock, hint: "Pending review" },
];

export default function MetricsOverview() {
  const { data: metrics, loading, error } = useLiveApi("/api/admin/stats", 5000);

  if (error) return <ErrorState message={error} />;
  if (loading || !metrics) return <LoadingState label="Loading live metrics..." />;

  return (
    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {METRIC_CARDS.map((m) => (
        <StatCard key={m.key} label={m.label} value={metrics[m.key] || 0} accent={m.accent} icon={m.icon} hint={m.hint} size="sm" />
      ))}
    </div>
  );
}
