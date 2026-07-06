"use client";

import { useEffect, useMemo, useState } from "react";
import { sumHistory } from "@/lib/store";

const RING = {
  violet: "from-violet-500/20 to-violet-500/5 text-violet-300",
  emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-300",
  rose: "from-rose-500/20 to-rose-500/5 text-rose-300",
  amber: "from-amber-500/20 to-amber-500/5 text-amber-300",
  blue: "from-blue-500/20 to-blue-500/5 text-blue-300",
};

export function StatCard({ label, value, accent, icon, size = "lg" }) {
  const big = size === "lg";
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-navy-900/60 ${
        big ? "p-6" : "p-5"
      } shadow-xl backdrop-blur-xl`}
    >
      <div
        className={`mb-4 grid ${big ? "h-11 w-11" : "h-9 w-9"} place-items-center rounded-xl bg-gradient-to-br ${
          RING[accent]
        }`}
      >
        <span className={big ? "text-lg" : "text-base"}>{icon}</span>
      </div>
      <p className={`${big ? "text-sm" : "text-xs"} text-slate-400`}>{label}</p>
      <p className={`mt-1 ${big ? "text-3xl" : "text-2xl"} font-bold text-white`}>
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}

// Per-user summary — always computed from that single user's own history, so
// this can be dropped into either the admin's per-user view or a user's own
// dashboard without ever pulling in another user's numbers.
export function UserSummaryStats({ history }) {
  const s = sumHistory(history);
  const stats = [
    { label: "Total Logins", value: s.logins, accent: "blue", icon: "🔑" },
    { label: "Total Attempts", value: s.attempts, accent: "violet", icon: "🎯" },
    { label: "Total Success", value: s.success, accent: "emerald", icon: "✅" },
    { label: "Total Failed", value: s.failed, accent: "rose", icon: "❌" },
    { label: "Total In Review", value: s.inReview, accent: "amber", icon: "⏳" },
  ];
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((m) => (
        <StatCard key={m.label} {...m} />
      ))}
    </div>
  );
}

export function InfoPanel({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-6 shadow-xl backdrop-blur-xl">
      <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>
      <dl className="space-y-3">{children}</dl>
    </div>
  );
}

export function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <dt className="text-sm text-slate-400">{label}</dt>
      <dd className={`text-sm text-white ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

function formatDateLabel(dateKey) {
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function DayDetail({ date, day }) {
  const miniStats = [
    { label: "Total Logins", value: day.logins?.length || 0, accent: "blue", icon: "🔑" },
    { label: "Total Attempts", value: day.attempts, accent: "violet", icon: "🎯" },
    { label: "Total Success", value: day.success, accent: "emerald", icon: "✅" },
    { label: "Total Failed", value: day.failed, accent: "rose", icon: "❌" },
    { label: "Total In Review", value: day.inReview, accent: "amber", icon: "⏳" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {miniStats.map((m) => (
          <StatCard key={m.label} size="sm" {...m} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <InfoPanel title={`Login Time(s) — ${formatDateLabel(date)}`}>
          {day.logins?.length ? (
            day.logins.map((l, i) => (
              <InfoRow key={i} label={`Login ${i + 1}`} value={new Date(l.time).toLocaleTimeString("en-GB")} />
            ))
          ) : (
            <p className="text-sm text-slate-500">এই দিনে কোনো লগইন রেকর্ড নেই।</p>
          )}
        </InfoPanel>

        <InfoPanel title="Device Information">
          {day.logins?.length ? (
            day.logins.map((l, i) => (
              <InfoRow
                key={i}
                label={new Date(l.time).toLocaleTimeString("en-GB")}
                value={`${l.device?.browser || "—"} · ${l.device?.os || "—"}`}
              />
            ))
          ) : (
            <p className="text-sm text-slate-500">ডিভাইস তথ্য নেই।</p>
          )}
        </InfoPanel>
      </div>

      <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-2 shadow-xl backdrop-blur-xl">
        <h4 className="px-4 pt-3 text-sm font-semibold text-white">Activity Logs</h4>
        <ul className="divide-y divide-white/5">
          {(day.logs || []).map((log, i) => (
            <li key={i} className="px-4 py-3 text-sm text-slate-300">
              <span className="text-slate-500">{new Date(log.time).toLocaleTimeString("en-GB")}</span> — {log.event}
            </li>
          ))}
          {(!day.logs || day.logs.length === 0) && (
            <li className="px-4 py-6 text-center text-sm text-slate-500">কোনো Activity Log নেই।</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export function DateHistorySection({ history }) {
  const dates = useMemo(() => Object.keys(history || {}).sort((a, b) => (a < b ? 1 : -1)), [history]);
  const [selected, setSelected] = useState(dates[0] || null);

  useEffect(() => {
    if (!dates.includes(selected)) setSelected(dates[0] || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dates]);

  if (dates.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-10 text-center text-slate-500 shadow-xl backdrop-blur-xl">
        এখনো কোনো Date-wise History নেই।
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <div className="rounded-2xl border border-white/10 bg-navy-900/60 shadow-xl backdrop-blur-xl">
        <ul className="max-h-[420px] space-y-1 overflow-y-auto p-2">
          {dates.map((d) => {
            const day = history[d];
            return (
              <li key={d}>
                <button
                  onClick={() => setSelected(d)}
                  className={`flex w-full flex-col items-start rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    d === selected
                      ? "bg-violet-500/15 text-violet-200 ring-1 ring-violet-500/30"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span className="font-medium">{formatDateLabel(d)}</span>
                  <span className="text-xs text-slate-500">{day.attempts} attempts</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {selected && <DayDetail date={selected} day={history[selected]} />}
    </div>
  );
}

// Full per-user activity block: summary cards, success rate, and the
// clickable date-wise history. Scoped entirely to the `history` passed in —
// callers are responsible for making sure that's the one user's own record.
export default function UserActivityDashboard({ history }) {
  const s = sumHistory(history);
  const successRate = s.attempts ? Math.round((s.success / s.attempts) * 100) : 0;

  return (
    <div className="space-y-6">
      <UserSummaryStats history={history} />

      <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-6 shadow-xl backdrop-blur-xl">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-400">Success Rate</span>
          <span className="font-semibold text-white">
            {successRate}% ({s.attempts} মোট)
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-navy-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-violet-500 transition-all"
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Date-wise Activity History</h3>
        <DateHistorySection history={history} />
      </div>
    </div>
  );
}
