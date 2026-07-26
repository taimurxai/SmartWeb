"use client";

import { useFirestoreDoc } from "@/lib/hooks";
import { StatCard } from "@/components/UserActivityDashboard";
import { LoadingState, ErrorState } from "@/components/DataState";

// Assumes a single aggregate document at metrics/summary, e.g.:
//   { totalLogin: 1240, totalAttempt: 980, totalFail: 62, totalInReview: 14 }
// Something else (a Cloud Function, an admin backend) increments these
// fields on write; this component only ever reads. Adjust the field/
// collection names below to match your actual schema.
const METRIC_CARDS = [
  { key: "totalLogin", label: "Total Login", accent: "blue", icon: "🔑" },
  { key: "totalAttempt", label: "Total Attempt", accent: "violet", icon: "🎯" },
  { key: "totalFail", label: "Total Fail", accent: "rose", icon: "❌" },
  { key: "totalInReview", label: "Total In Review", accent: "amber", icon: "⏳" },
];

export default function MetricsOverview() {
  const { data: metrics, loading, error } = useFirestoreDoc("metrics", "summary");

  if (error) return <ErrorState message={error} />;
  if (loading || !metrics) return <LoadingState label="মেট্রিক্স লোড হচ্ছে..." />;

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {METRIC_CARDS.map((m) => (
        <StatCard key={m.key} label={m.label} value={metrics[m.key] || 0} accent={m.accent} icon={m.icon} />
      ))}
    </div>
  );
}
