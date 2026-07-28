"use client";

import { useEffect, useMemo, useState } from "react";
import { sumHistory } from "@/lib/historyUtils";
import { Key, Target, CheckCircle2, XCircle, Clock, CalendarDays, Activity, ChevronRight, AlertTriangle, MessageCircle } from "lucide-react";

const RING = {
  violet: "from-violet-500/20 to-violet-500/5 text-violet-400 group-hover:text-violet-300",
  emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 group-hover:text-emerald-300",
  rose: "from-rose-500/20 to-rose-500/5 text-rose-400 group-hover:text-rose-300",
  amber: "from-amber-500/20 to-amber-500/5 text-amber-400 group-hover:text-amber-300",
  blue: "from-blue-500/20 to-blue-500/5 text-blue-400 group-hover:text-blue-300",
};

const GLOW = {
  violet: "rgba(139,92,246,0.3)",
  blue: "rgba(59,130,246,0.3)",
  emerald: "rgba(16,185,129,0.3)",
  rose: "rgba(244,63,94,0.3)",
  amber: "rgba(245,158,11,0.3)",
};

export function StatCard({ label, value, accent, icon: Icon, size = "lg" }) {
  const big = size === "lg";
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-navy-900/60 ${
        big ? "p-6" : "p-5"
      } shadow-xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/[0.04]`}
      style={{
        boxShadow: `0 4px 20px -5px rgba(0,0,0,0.5), inset 0 0 0 1px transparent`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 10px 30px -10px ${GLOW[accent]}, inset 0 0 0 1px ${GLOW[accent]}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 20px -5px rgba(0,0,0,0.5), inset 0 0 0 1px transparent`;
      }}
    >
      <div
        className={`mb-4 grid ${big ? "h-12 w-12" : "h-10 w-10"} place-items-center rounded-xl bg-gradient-to-br transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_0_15px_-3px_var(--icon-glow)] ${
          RING[accent]
        }`}
        style={{ '--icon-glow': GLOW[accent] }}
      >
        <Icon className={big ? "w-6 h-6" : "w-5 h-5"} strokeWidth={2.5} />
      </div>
      <p className={`${big ? "text-sm" : "text-xs"} font-medium text-slate-400 group-hover:text-slate-300 transition-colors`}>{label}</p>
      <p className={`mt-1.5 ${big ? "text-3xl" : "text-2xl"} font-bold tracking-tight text-white font-display`}>
        {value.toLocaleString("en-US")}
      </p>
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
    { label: "Total In Review", value: s.inReview, accent: "amber", icon: Clock },
    { label: "Suspicious", value: s.suspicious, accent: "rose", icon: AlertTriangle },
    { label: "Live Chat", value: s.liveChat, accent: "blue", icon: MessageCircle },
  ];
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {stats.map((m) => (
        <StatCard key={m.label} {...m} />
      ))}
    </div>
  );
}

export function InfoPanel({ title, children, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-white/20">
      <h3 className="mb-6 flex items-center gap-2 text-sm font-semibold tracking-wide text-white uppercase">
        {Icon && <Icon className="h-4 w-4 text-violet-400" />}
        {title}
      </h3>
      <dl className="space-y-4">{children}</dl>
    </div>
  );
}

export function InfoRow({ label, value, mono }) {
  return (
    <div className="group flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0 transition-colors">
      <dt className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{label}</dt>
      <dd className={`text-sm text-slate-200 ${mono ? "font-mono" : "font-semibold"}`}>{value}</dd>
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
    <div className="space-y-6 animate-[fadeIn_.4s_ease-out]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {miniStats.map((m) => (
          <StatCard key={m.label} size="sm" {...m} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InfoPanel title={`Logins — ${formatDateLabel(date)}`} icon={Key}>
          {day.logins?.length ? (
            day.logins.map((l, i) => (
              <InfoRow key={i} label={`Login ${i + 1}`} value={new Date(l.time).toLocaleTimeString("en-GB")} />
            ))
          ) : (
            <p className="text-sm text-slate-500 italic">No login records found for this day.</p>
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
            <p className="text-sm text-slate-500 italic">No device information available.</p>
          )}
        </InfoPanel>
      </div>

      <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-6 shadow-xl backdrop-blur-xl">
        <h4 className="mb-6 flex items-center gap-2 text-sm font-semibold tracking-wide text-white uppercase">
          <Activity className="h-4 w-4 text-violet-400" />
          Activity Timeline
        </h4>
        <div className="relative border-l border-white/10 pl-6 space-y-6 ml-2">
          {(day.logs || []).map((log, i) => (
            <div key={i} className="relative group">
              <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-navy-900 bg-violet-500 transition-all duration-300 group-hover:scale-125 group-hover:shadow-[0_0_10px_0_rgba(139,92,246,0.6)]" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-400 tracking-wider">
                  {new Date(log.time).toLocaleTimeString("en-GB")}
                </span>
                <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{log.event}</span>
              </div>
            </div>
          ))}
          {(!day.logs || day.logs.length === 0) && (
            <p className="text-sm text-slate-500 italic py-2">No activity logs available.</p>
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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-navy-900/60 p-12 text-center shadow-xl backdrop-blur-xl">
        <CalendarDays className="h-12 w-12 text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-slate-300">No History Available</h3>
        <p className="mt-2 text-sm text-slate-500">Records will appear here once you start using the system.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="rounded-2xl border border-white/10 bg-navy-900/60 shadow-xl backdrop-blur-xl p-3">
        <ul className="max-h-[600px] space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          {dates.map((d) => {
            const day = history[d];
            const isSelected = d === selected;
            return (
              <li key={d}>
                <button
                  onClick={() => setSelected(d)}
                  className={`group relative flex w-full items-center justify-between overflow-hidden rounded-xl px-4 py-3 text-left transition-all duration-300 ${
                    isSelected
                      ? "bg-gradient-to-r from-violet-500/20 to-blue-500/10 shadow-inner"
                      : "hover:bg-white/5"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute inset-y-0 left-0 w-1 rounded-r-md bg-gradient-to-b from-violet-400 to-blue-500" />
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-sm font-semibold transition-colors ${isSelected ? "text-violet-200" : "text-slate-300 group-hover:text-white"}`}>
                      {formatDateLabel(d)}
                    </span>
                    <span className={`text-xs ${isSelected ? "text-violet-300/70" : "text-slate-500 group-hover:text-slate-400"}`}>
                      {day.attempts} attempts
                    </span>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${isSelected ? "text-violet-400 translate-x-0" : "text-slate-600 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"}`} />
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
  
  // Custom scrollbar style for the date selector
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <UserSummaryStats history={history} />

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-navy-900/60 p-8 shadow-xl backdrop-blur-xl group hover:border-violet-500/20 transition-colors duration-500">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-violet-500/10 to-blue-500/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-slate-400 uppercase flex items-center gap-2">
                <Target className="h-4 w-4 text-violet-400" />
                Overall Success Rate
              </h3>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-white font-display">
                {successRate}%
              </span>
              <span className="ml-2 text-sm font-medium text-slate-500">
                ({s.attempts} total)
              </span>
            </div>
          </div>
          
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-navy-950/80 shadow-inner">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-violet-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(52,211,153,0.6)]"
              style={{ width: `${successRate}%` }}
            >
              <div className="absolute inset-0 w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-6 flex items-center gap-3 text-xl font-bold tracking-tight text-white font-display">
          <CalendarDays className="h-5 w-5 text-violet-400" />
          Date-wise Activity History
        </h3>
        <DateHistorySection history={history} />
      </div>
      
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
