"use client";

import { useEffect, useMemo, useState } from "react";
import { sumHistory } from "@/lib/historyUtils";
import { Key, Target, CheckCircle2, XCircle, Clock, CalendarDays, Activity, ChevronRight, AlertTriangle, MessageCircle } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";

const ACCENT_STYLES = {
  blue: {
    iconBg: "bg-blue-500/10 text-info border-blue-500/20",
    borderHover: "hover:border-blue-500/40",
  },
  violet: {
    iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    borderHover: "hover:border-indigo-500/40",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 text-success border-emerald-500/20",
    borderHover: "hover:border-emerald-500/40",
  },
  rose: {
    iconBg: "bg-rose-500/10 text-error border-rose-500/20",
    borderHover: "hover:border-rose-500/40",
  },
  amber: {
    iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    borderHover: "hover:border-amber-500/40",
  },
};

export function StatCard({ label, value, accent = "blue", icon: Icon, size = "md", hint }) {
  const isSmall = size === "sm";
  const styling = ACCENT_STYLES[accent] || ACCENT_STYLES.blue;

  return (
    <div
      className={`group relative overflow-hidden rounded-md border border-border-subtle bg-surface-primary ${
        isSmall ? "p-3" : "p-3.5"
      } shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${styling.borderHover} cursor-default`}
    >
      {/* Ambient background glow on hover */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-accent/15 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-center gap-2.5 min-w-0 relative z-10">
        <div
          className={`grid ${
            isSmall ? "h-7 w-7" : "h-8 w-8"
          } shrink-0 place-items-center rounded-sm border transition-transform duration-200 group-hover:scale-110 ${styling.iconBg}`}
        >
          <Icon className={isSmall ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-text-secondary transition-colors group-hover:text-text-primary truncate">
            {label}
          </p>
          {hint && (
            <p className="text-[10px] text-text-muted truncate">
              {hint}
            </p>
          )}
        </div>
      </div>
      <div className="mt-2.5 pt-1.5 border-t border-border-faint relative z-10">
        <p className={`font-bold tracking-tight text-text-primary font-sans ${isSmall ? "text-xl" : "text-2xl"}`}>
          <AnimatedCounter value={value} />
        </p>
      </div>
    </div>
  );
}

export function UserSummaryStats({ history }) {
  const s = sumHistory(history);
  const stats = [
    { label: "Total Logins", value: s.logins, accent: "blue", icon: Key },
    { label: "Total Attempts", value: s.attempts, accent: "violet", icon: Target },
    { label: "Total Success", value: s.success, accent: "emerald", icon: CheckCircle2 },
    { label: "Total Failed", value: s.failed, accent: "rose", icon: XCircle },
    { label: "In Review", value: s.inReview, accent: "amber", icon: Clock },
    { label: "Suspicious", value: s.suspicious, accent: "rose", icon: AlertTriangle },
    { label: "Live Chat", value: s.liveChat, accent: "blue", icon: MessageCircle },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {stats.map((m, idx) => (
        <div key={m.label} className="animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
          <StatCard {...m} size="sm" />
        </div>
      ))}
    </div>
  );
}

export function InfoPanel({ title, children, icon: Icon }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-primary p-4 shadow-sm backdrop-blur-md">
      <h3 className="mb-3.5 flex items-center gap-2 text-xs font-semibold tracking-wider text-text-secondary uppercase">
        {Icon && <Icon className="h-3.5 w-3.5 text-info" />}
        {title}
      </h3>
      <dl className="space-y-2.5">{children}</dl>
    </div>
  );
}

export function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between border-b border-border-faint pb-2 last:border-0 last:pb-0">
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className={`text-xs text-text-primary ${mono ? "font-mono text-text-secondary" : "font-medium"}`}>{value}</dd>
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
    { label: "Logins", value: day.logins?.length || 0, accent: "blue", icon: Key },
    { label: "Attempts", value: day.attempts, accent: "violet", icon: Target },
    { label: "Success", value: day.success, accent: "emerald", icon: CheckCircle2 },
    { label: "Failed", value: day.failed, accent: "rose", icon: XCircle },
    { label: "In Review", value: day.inReview, accent: "amber", icon: Clock },
    { label: "Suspicious", value: day.suspicious, accent: "rose", icon: AlertTriangle },
    { label: "Live Chat", value: day.liveChat, accent: "blue", icon: MessageCircle },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {miniStats.map((m) => (
          <StatCard key={m.label} size="sm" {...m} />
        ))}
      </div>

      <div className="grid gap-3.5 lg:grid-cols-2">
        <InfoPanel title={`Logins — ${formatDateLabel(date)}`} icon={Key}>
          {day.logins?.length ? (
            day.logins.map((l, i) => (
              <InfoRow key={i} label={`Login #${i + 1}`} value={new Date(l.time).toLocaleTimeString("en-GB")} />
            ))
          ) : (
            <p className="text-xs text-text-faint italic">No login records found for this day.</p>
          )}
        </InfoPanel>

        <InfoPanel title="Device Information" icon={Activity}>
          {day.logins?.length ? (
            day.logins.map((l, i) => (
              <InfoRow
                key={i}
                label={new Date(l.time).toLocaleTimeString("en-GB")}
                value={`${l.device?.browser || "—"} · ${l.device?.os || "—"}`}
              />
            ))
          ) : (
            <p className="text-xs text-text-faint italic">No device information available.</p>
          )}
        </InfoPanel>
      </div>

      <div className="rounded-md border border-border-subtle bg-surface-primary p-4 shadow-sm backdrop-blur-md">
        <h4 className="mb-3.5 flex items-center gap-2 text-xs font-semibold tracking-wider text-text-secondary uppercase">
          <Activity className="h-3.5 w-3.5 text-info" />
          Activity Timeline
        </h4>
        <div className="relative border-l border-border-subtle pl-4 space-y-3.5 ml-1">
          {(day.logs || []).map((log, i) => (
            <div key={i} className="relative group">
              <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full border-2 border-surface-secondary bg-accent transition-transform group-hover:scale-125" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-text-muted">
                  {new Date(log.time).toLocaleTimeString("en-GB")}
                </span>
                <span className="text-xs text-text-primary group-hover:text-white transition-colors">{log.event}</span>
              </div>
            </div>
          ))}
          {(!day.logs || day.logs.length === 0) && (
            <p className="text-xs text-text-faint italic py-1">No activity logs available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function DateHistorySection({ history }) {
  const dates = useMemo(() => Object.keys(history || {}).sort((a, b) => (a < b ? 1 : -1)), [history]);
  const [selected, setSelected] = useState(dates[0] || null);

  useEffect(() => {
    if (!dates.includes(selected)) setSelected(dates[0] || null);
  }, [dates, selected]);

  if (dates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-border-subtle bg-surface-primary p-8 text-center shadow-sm backdrop-blur-md">
        <CalendarDays className="h-8 w-8 text-text-tertiary mb-2.5" />
        <h3 className="text-sm font-semibold text-text-secondary">No History Available</h3>
        <p className="mt-1 text-xs text-text-faint">Records will appear here once you start using the system.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <div className="rounded-md border border-border-subtle bg-surface-primary shadow-sm backdrop-blur-md p-2">
        <ul className="max-h-[460px] space-y-1 overflow-y-auto pr-1">
          {dates.map((d) => {
            const day = history[d];
            const isSelected = d === selected;
            return (
              <li key={d}>
                <button
                  onClick={() => setSelected(d)}
                  className={`group relative flex w-full items-center justify-between rounded-sm px-3 py-2 text-left transition-all ${
                    isSelected
                      ? "bg-blue-600/15 border border-blue-500/30 text-blue-200"
                      : "hover:bg-surface-secondary text-text-secondary"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">
                      {formatDateLabel(d)}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {day.attempts} attempts
                    </span>
                  </div>
                  <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? "text-info" : "text-text-tertiary opacity-0 group-hover:opacity-100"}`} />
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

export default function UserActivityDashboard({ history }) {
  const s = sumHistory(history);
  const successRate = s.attempts ? Math.round((s.success / s.attempts) * 100) : 0;

  return (
    <div className="space-y-6">
      <UserSummaryStats history={history} />

      <div className="rounded-md border border-border-subtle bg-surface-primary p-4 shadow-sm backdrop-blur-md">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-xs font-semibold tracking-wider text-text-muted uppercase flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-info" />
            Overall Success Rate
          </h3>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-text-primary">
              {successRate}%
            </span>
            <span className="text-xs text-text-faint">
              ({s.attempts} attempts)
            </span>
          </div>
        </div>
        
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-secondary border border-border-subtle">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3.5 flex items-center gap-2 text-sm font-semibold tracking-tight text-text-primary">
          <CalendarDays className="h-4 w-4 text-info" />
          Date-wise Activity History
        </h3>
        <DateHistorySection history={history} />
      </div>
    </div>
  );
}
