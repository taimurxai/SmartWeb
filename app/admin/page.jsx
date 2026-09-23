"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, isAuthError } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { sumHistory } from "@/lib/historyUtils";
import { useDebouncedValue } from "@/lib/hooks";
import UserActivityDashboard, { InfoPanel, InfoRow } from "@/components/UserActivityDashboard";
import { LoadingState, EmptyState, ErrorState } from "@/components/DataState";
import Pager from "@/components/Pager";
import SearchInput from "@/components/SearchInput";
import MetricsOverview from "@/components/MetricsOverview";
import AnimatedCounter from "@/components/AnimatedCounter";
import { LayoutDashboard, Users, FileText, Key, Target, CheckCircle2, XCircle, Clock, ChevronRight, LogOut, AlertTriangle, MessageCircle, Download } from "lucide-react";

const NAV = [
  { key: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
  { key: "users", label: "User List", icon: Users },
  { key: "logs", label: "System Log", icon: FileText },
];

export default function AdminDashboard() {
  const { user, ready, logout, forceLogout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [modal, setModal] = useState(null); // { mode: 'add'|'edit', user }
  const [selectedId, setSelectedId] = useState(null);
  const [recordView, setRecordView] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [cleanModalOpen, setCleanModalOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/");
    else if (user.role !== "ADMIN") router.replace("/dashboard");
  }, [ready, user, router]);

  // Shared by every section below: if a call comes back 401/403 (session
  // expired, or this admin got frozen in another tab), bounce to login
  // instead of rendering a confusing error in place.
  const handleApiError = useCallback(
    (err) => {
      if (isAuthError(err)) {
        forceLogout("Session expired. Please log in again.");
        return true;
      }
      return false;
    },
    [forceLogout]
  );

  if (!ready || !user || user.role !== "ADMIN") return null;

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  function resetDrill() {
    setSelectedId(null);
    setRecordView(null);
  }

  function handleNav(key) {
    resetDrill();
    setTab(key);
  }

  function handleCard(type) {
    setSelectedId(null);
    if (type === "users") {
      setRecordView(null);
      setTab("users");
    } else {
      setRecordView(type);
      setTab("overview");
    }
  }

  function backToOverview() {
    resetDrill();
    setTab("overview");
  }

  function bump() {
    setRefreshKey((k) => k + 1);
  }

  const selectedUserView = Boolean(selectedId);

  return (
    <div className="flex min-h-screen bg-surface-secondary text-text-primary">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border-subtle bg-surface-secondary p-4 backdrop-blur-md md:flex">
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <div className="grid h-8 w-8 place-items-center rounded-sm bg-accent shadow-sm text-text-primary font-bold text-sm">
            D
          </div>
          <span className="text-sm font-semibold tracking-tight text-text-primary">Dashboard Admin</span>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`group flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-medium transition-all ${
                  active
                    ? "bg-blue-600/15 text-info border border-blue-500/30"
                    : "text-text-muted hover:bg-surface-secondary hover:text-text-primary"
                }`}
              >
                <item.icon className={`h-4 w-4 transition-transform ${active ? "text-info" : "text-text-faint group-hover:text-text-primary"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <a
            href="/downloads/AgeSmartEnterprise.exe"
            download
            className="group flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-medium text-text-muted transition-all hover:bg-emerald-500/10 hover:text-emerald-400"
          >
            <Download className="h-4 w-4 text-success" />
            <span>Download Client</span>
          </a>
        </nav>

        <div className="mt-auto space-y-1 border-t border-border-subtle pt-3">
          <button
            onClick={() => setCleanModalOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-medium text-error transition hover:bg-rose-500/10"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>System Log Clear</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-medium text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 md:px-6">
        {/* Mobile tabs */}
        <div className="mb-4 flex gap-1.5 md:hidden overflow-x-auto pb-1">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNav(item.key)}
              className={`rounded-sm px-2.5 py-1.5 text-xs font-medium ${
                tab === item.key ? "bg-blue-600/20 text-blue-300 border border-blue-500/30" : "bg-surface-primary text-text-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
          <a
            href="/downloads/AgeSmartEnterprise.exe"
            download
            className="flex items-center gap-1 rounded-sm px-2.5 py-1.5 text-xs font-medium bg-emerald-500/10 text-success whitespace-nowrap"
          >
            <Download className="h-3 w-3" /> App
          </a>
          <button
            onClick={() => setCleanModalOpen(true)}
            className="rounded-sm px-2.5 py-1.5 text-xs font-medium bg-rose-500/10 text-error ml-auto whitespace-nowrap"
          >
            Clear Log
          </button>
        </div>

        {!selectedUserView && (
          <div className="mb-6 animate-fade-in">
            <h1 className="text-xl font-bold tracking-tight text-text-primary">
              {recordView ? RECORD_META[recordView].title : NAV.find((n) => n.key === tab)?.label}
            </h1>
            <p className="mt-0.5 text-xs text-text-muted">
              {recordView ? RECORD_META[recordView].subtitle : `Administrative control panel · Logged in as ${user.name}`}
            </p>
          </div>
        )}

        {tab === "overview" && !selectedUserView && !recordView && (
          <OverviewSection onCard={handleCard} onAuthError={handleApiError} refreshKey={refreshKey} />
        )}

        {recordView && !selectedUserView && (
          <RecordsView
            type={recordView}
            onOpenUser={(id) => setSelectedId(id)}
            onBack={backToOverview}
            onAuthError={handleApiError}
          />
        )}

        {tab === "users" && !selectedUserView && !recordView && (
          <UsersSection
            currentUserId={user.id}
            onOpen={(u) => setSelectedId(u.id)}
            onAdd={() => setModal({ mode: "add", user: null })}
            onEdit={(u) => setModal({ mode: "edit", user: u })}
            onAuthError={handleApiError}
            onChanged={bump}
            refreshKey={refreshKey}
          />
        )}

        {selectedUserView && (
          <UserDetail userId={selectedId} onBack={() => setSelectedId(null)} onAuthError={handleApiError} />
        )}

        {tab === "logs" && !selectedUserView && !recordView && <LogsSection onAuthError={handleApiError} />}
      </main>

      {modal && (
        <UserModal
          mode={modal.mode}
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            bump();
          }}
          onAuthError={handleApiError}
        />
      )}

      {cleanModalOpen && (
        <CleanDataModal
          onClose={() => setCleanModalOpen(false)}
          onCleaned={() => {
            setCleanModalOpen(false);
            bump();
          }}
          onAuthError={handleApiError}
        />
      )}
    </div>
  );
}

/* ---------------- Overview / summary cards ---------------- */

function SummaryCard({ label, value, accent, icon: Icon, hint, onClick }) {
  const ACCENT_STYLES = {
    violet: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 group-hover:border-indigo-500/40",
    blue: "bg-blue-500/10 text-info border-blue-500/20 group-hover:border-blue-500/40",
    emerald: "bg-emerald-500/10 text-success border-emerald-500/20 group-hover:border-emerald-500/40",
    rose: "bg-rose-500/10 text-error border-rose-500/20 group-hover:border-rose-500/40",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20 group-hover:border-amber-500/40",
  };

  const style = ACCENT_STYLES[accent] || ACCENT_STYLES.blue;

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-md border border-border-subtle bg-surface-primary p-3.5 text-left shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-secondary hover:border-border-subtle"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-sm border transition-transform duration-200 group-hover:scale-105 ${style}`}>
            <Icon className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-primary group-hover:text-blue-400 transition-colors truncate">
              {label}
            </p>
            {hint && (
              <p className="text-[11px] text-text-secondary/90 truncate">
                {hint}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-text-tertiary transition-colors group-hover:text-text-primary mt-1" />
      </div>
      <div className="mt-3 pt-2 border-t border-border-faint flex items-baseline justify-between">
        <p className="text-2xl font-bold tracking-tight text-text-primary font-sans">
          <AnimatedCounter value={value} />
        </p>
      </div>
    </button>
  );
}

function OverviewSection({ onCard, onAuthError, refreshKey }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const stats = await api.adminStats();
      setSummary(stats);
      setError("");
    } catch (err) {
      if (onAuthError(err)) return;
      setError(err.message);
    }
  }, [onAuthError]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!summary) return <LoadingState label="Loading overview metrics..." />;

  const cards = [
    { type: "users", label: "Total Users", value: summary.totalUsers, accent: "violet", icon: Users, hint: "All users list" },
    { type: "logins", label: "Total Logins", value: summary.totalLogins, accent: "blue", icon: Key, hint: "All login records" },
    { type: "attempts", label: "Total Attempts", value: summary.totalAttempts, accent: "violet", icon: Target, hint: "All attempt records" },
    { type: "success", label: "Total Success", value: summary.totalSuccess, accent: "emerald", icon: CheckCircle2, hint: "Success records only" },
    { type: "failed", label: "Total Failed", value: summary.totalFailed, accent: "rose", icon: XCircle, hint: "Failed records only" },
    { type: "inReview", label: "Total In Review", value: summary.totalInReview, accent: "amber", icon: Clock, hint: "In Review records only" },
    { type: "suspicious", label: "Total Suspicious", value: summary.totalSuspicious, accent: "rose", icon: AlertTriangle, hint: "Suspicious records only" },
    { type: "liveChat", label: "Total Live Chat", value: summary.totalLiveChat, accent: "blue", icon: MessageCircle, hint: "Live Chat records only" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, idx) => (
          <div key={c.type} className="animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
            <SummaryCard {...c} onClick={() => onCard(c.type)} />
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Live Real-time Metrics</h2>
        <MetricsOverview />
      </div>
    </div>
  );
}

/* ---------------- Per-card record views (global, across all users) ---------------- */

const RECORD_META = {
  logins: { title: "Total Logins", subtitle: "All users login records" },
  attempts: { title: "Total Attempts", subtitle: "All users attempt records" },
  success: { title: "Total Success", subtitle: "Success records only" },
  failed: { title: "Total Failed", subtitle: "Failed records only" },
  inReview: { title: "Total In Review", subtitle: "In Review records only" },
  suspicious: { title: "Total Suspicious", subtitle: "Suspicious records only" },
  liveChat: { title: "Total Live Chat", subtitle: "Live Chat records only" },
};

const STATUS_STYLE = {
  SUCCESS: { label: "Account Success", cls: "bg-emerald-500/15 text-emerald-300", dot: "bg-emerald-400" },
  FAILED: { label: "Failed", cls: "bg-rose-500/15 text-rose-300", dot: "bg-rose-400" },
  IN_REVIEW: { label: "In Review", cls: "bg-amber-500/15 text-amber-300", dot: "bg-amber-400" },
  SUSPICIOUS: { label: "Suspicious", cls: "bg-rose-500/15 text-rose-300", dot: "bg-rose-400" },
  LIVE_CHAT: { label: "Live Chat", cls: "bg-blue-500/15 text-blue-300", dot: "bg-blue-400" },
};

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function UserChip({ userId, userName, email, onOpenUser }) {
  return (
    <button onClick={() => onOpenUser(userId)} className="group flex items-center gap-2.5 text-left">
      <div className="grid h-7 w-7 place-items-center rounded-full bg-surface-primary text-[11px] font-semibold text-info border border-border-subtle">
        {userName?.[0]?.toUpperCase()}
      </div>
      <div>
        <p className="text-xs font-medium text-text-primary group-hover:text-blue-400 group-hover:underline">
          {userName}
        </p>
        <p className="text-[11px] text-text-faint">{email}</p>
      </div>
    </button>
  );
}

function RecordsView({ type, onOpenUser, onBack, onAuthError }) {
  const meta = RECORD_META[type];
  const isLogin = type === "logins";
  const pageSize = 12;

  const [rawQ, setRawQ] = useState("");
  const q = useDebouncedValue(rawQ, 300);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await api.adminRecords({ type, page, pageSize, q });
      setData(res);
      setError("");
    } catch (err) {
      if (onAuthError(err)) return;
      setError(err.message);
    }
  }, [type, page, q, onAuthError]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [type, q]);

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border-subtle bg-surface-primary px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
        >
          ← Back to Overview
        </button>
        <SearchInput value={rawQ} onChange={setRawQ} placeholder="Search name or email..." />
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && !data && <LoadingState label="Loading records..." />}

      {!error && data && (
        <div className="overflow-hidden rounded-md border border-border-subtle bg-surface-primary shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{meta.title}</h2>
            <span className="rounded-md bg-surface-primary px-2 py-0.5 text-[11px] font-medium text-text-secondary">
              {data.total.toLocaleString("en-US")} total
            </span>
          </div>

          <ul className="divide-y divide-slate-800/60">
            {data.rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-surface-secondary">
                <div className="flex flex-col gap-0.5">
                  <UserChip userId={r.userId} userName={r.userName} email={r.email} onOpenUser={onOpenUser} />
                  {!isLogin && r.code && (
                    <span className="text-[11px] text-text-muted pl-9">
                      Code: <span className="font-mono text-text-secondary">{r.code}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-text-primary">{fmtDate(r.time)}</p>
                    <p className="text-[11px] text-text-faint">
                      {new Date(r.time).toLocaleTimeString("en-GB")}
                      {isLogin ? ` · ${r.browser || "—"} · ${r.os || "—"}` : ""}
                    </p>
                  </div>
                  {isLogin ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      Login
                    </span>
                  ) : (
                    (() => {
                      const style = STATUS_STYLE[r.status] || STATUS_STYLE.IN_REVIEW;
                      return (
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.cls}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {style.label}
                        </span>
                      );
                    })()
                  )}
                </div>
              </li>
            ))}
            {data.rows.length === 0 && (
              <li>
                <EmptyState label="No records found." />
              </li>
            )}
          </ul>

          <Pager page={page} pageSize={pageSize} total={data.total} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

/* ---------------- User table (search, sort, pagination) ---------------- */

function SortHeader({ label, sortKey, sort, order, onSort }) {
  const active = sort === sortKey;
  return (
    <th className="px-6 py-3 font-medium">
      <button
        onClick={() => onSort(sortKey)}
        className={`flex items-center gap-1 transition hover:text-text-primary ${active ? "text-violet-300" : ""}`}
      >
        {label}
        {active && <span className="text-[10px]">{order === "asc" ? "▲" : "▼"}</span>}
      </button>
    </th>
  );
}

function UsersSection({ currentUserId, onOpen, onAdd, onEdit, onAuthError, onChanged, refreshKey }) {
  const pageSize = 8;
  const [rawQ, setRawQ] = useState("");
  const q = useDebouncedValue(rawQ, 300);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.adminUsers({ q, page, pageSize, sort, order });
      setData(res);
      setError("");
    } catch (err) {
      if (onAuthError(err)) return;
      setError(err.message);
    }
  }, [q, page, sort, order, onAuthError]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  useEffect(() => {
    setPage(1);
  }, [q, sort, order]);

  function toggleSort(key) {
    if (sort === key) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSort(key);
      setOrder("asc");
    }
  }

  async function withBusy(id, fn) {
    setBusyId(id);
    setActionError("");
    try {
      await fn();
      await load();
      onChanged();
    } catch (err) {
      if (!onAuthError(err)) setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <SearchInput value={rawQ} onChange={setRawQ} placeholder="Search name or email..." />
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-sm bg-accent px-3.5 py-1.5 text-xs font-semibold text-text-primary shadow-sm transition hover:bg-blue-500 active:scale-[0.98]"
        >
          + Add User
        </button>
      </div>

      {actionError && (
        <p role="alert" className="mb-3 rounded-sm border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300">
          {actionError}
        </p>
      )}

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && !data && <LoadingState label="Loading users..." />}

      {!error && data && (
        <div className="rounded-md border border-border-subtle bg-surface-primary shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-secondary text-[11px] uppercase tracking-wider text-text-muted font-mono">
                  <SortHeader label="User Name" sortKey="name" sort={sort} order={order} onSort={toggleSort} />
                  <SortHeader label="Email" sortKey="email" sort={sort} order={order} onSort={toggleSort} />
                  <SortHeader label="Role" sortKey="role" sort={sort} order={order} onSort={toggleSort} />
                  <SortHeader label="Status" sortKey="status" sort={sort} order={order} onSort={toggleSort} />
                  <th className="px-4 py-2.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.users.map((u) => {
                  const frozen = u.status === "FROZEN";
                  const self = u.id === currentUserId;
                  const busy = busyId === u.id;
                  return (
                    <tr key={u.id} className="transition-colors hover:bg-surface-secondary">
                      <td className="px-4 py-2.5">
                        <button onClick={() => onOpen(u)} className="flex items-center gap-2.5 text-left">
                          <div className="grid h-7 w-7 place-items-center rounded-full bg-brand-500/10 border border-brand-500/20 text-[11px] font-semibold text-brand-400">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-text-primary hover:text-brand-400 hover:underline">
                            {u.name}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-text-secondary font-mono">{u.email}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            u.role === "ADMIN" ? "bg-brand-500/10 text-accent border border-brand-500/20" : "bg-surface-primary text-text-muted border border-border-subtle"
                          }`}
                        >
                          {u.role === "ADMIN" ? "Admin" : "Normal"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <FreezeStatusBadge status={u.status} />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-1.5">
                          <button
                            disabled={busy}
                            title="Reset device binding and sessions"
                            onClick={() => {
                              if (confirm(`Reset device binding and sessions for ${u.name}?`)) withBusy(u.id, () => api.adminResetDevice(u.id));
                            }}
                            className="rounded border border-border-subtle bg-surface-primary px-2 py-1 text-[11px] font-medium text-text-secondary transition hover:bg-surface-secondary hover:text-brand-300 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => onEdit(u)}
                            className="rounded border border-border-subtle bg-surface-primary px-2 py-1 text-[11px] font-medium text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
                          >
                            Edit
                          </button>
                          {frozen ? (
                            <button
                              disabled={busy}
                              onClick={() => {
                                if (confirm(`Unfreeze / Activate ${u.name}?`)) withBusy(u.id, () => api.adminUnfreezeUser(u.id));
                              }}
                              className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Unfreeze
                            </button>
                          ) : (
                            <button
                              disabled={self || busy}
                              title={self ? "Cannot freeze own account" : undefined}
                              onClick={() => {
                                if (confirm(`Freeze ${u.name}?`)) withBusy(u.id, () => api.adminFreezeUser(u.id));
                              }}
                              className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Freeze
                            </button>
                          )}
                          <button
                            disabled={self || busy}
                            title={self ? "Cannot delete own account" : undefined}
                            onClick={() => {
                              if (confirm(`Delete ${u.name}?`)) withBusy(u.id, () => api.adminDeleteUser(u.id));
                            }}
                            className="rounded border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-white/5">
            {data.users.map((u) => {
              const frozen = u.status === "FROZEN";
              const self = u.id === currentUserId;
              const busy = busyId === u.id;
              return (
                <div key={u.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <button onClick={() => onOpen(u)} className="flex items-center gap-2.5 text-left">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-400">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary text-xs">{u.name}</p>
                        <p className="font-mono text-[11px] text-text-muted">{u.email}</p>
                      </div>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${u.role === "ADMIN" ? "bg-brand-500/10 text-accent border border-brand-500/20" : "bg-surface-primary text-text-muted"}`}>
                        {u.role}
                      </span>
                      <FreezeStatusBadge status={u.status} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1">
                    <button
                      disabled={busy}
                      onClick={() => {
                        if (confirm(`Reset device binding and sessions for ${u.name}?`)) withBusy(u.id, () => api.adminResetDevice(u.id));
                      }}
                      className="rounded border border-border-subtle bg-surface-primary px-2 py-1 text-[11px] font-medium text-text-secondary hover:bg-surface-secondary"
                    >
                      Reset Device
                    </button>
                    <button
                      onClick={() => onEdit(u)}
                      className="rounded border border-border-subtle bg-surface-primary px-2 py-1 text-[11px] font-medium text-text-secondary hover:bg-surface-secondary"
                    >
                      Edit
                    </button>
                    {frozen ? (
                      <button
                        disabled={busy}
                        onClick={() => {
                          if (confirm(`Unfreeze ${u.name}?`)) withBusy(u.id, () => api.adminUnfreezeUser(u.id));
                        }}
                        className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-300"
                      >
                        Unfreeze
                      </button>
                    ) : (
                      <button
                        disabled={self || busy}
                        onClick={() => {
                          if (confirm(`Freeze ${u.name}?`)) withBusy(u.id, () => api.adminFreezeUser(u.id));
                        }}
                        className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-300"
                      >
                        Freeze
                      </button>
                    )}
                    <button
                      disabled={self || busy}
                      onClick={() => {
                        if (confirm(`Delete ${u.name}?`)) withBusy(u.id, () => api.adminDeleteUser(u.id));
                      }}
                      className="rounded border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {data.users.length === 0 && <EmptyState label="No users found." />}
          <Pager page={page} pageSize={pageSize} total={data.total} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

function FreezeStatusBadge({ status }) {
  const frozen = status === "FROZEN";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        frozen ? "bg-rose-500/10 text-error border-rose-500/25" : "bg-emerald-500/10 text-success border-emerald-500/25"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${frozen ? "bg-rose-400" : "bg-emerald-400"}`} />
      {frozen ? "Frozen" : "Active"}
    </span>
  );
}

/* ---------------- Individual user dashboard ---------------- */

function UserDetail({ userId, onBack, onAuthError }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await api.adminUserHistory(userId, {});
      setData(res);
      setError("");
    } catch (err) {
      if (onAuthError(err)) return;
      setError(err.message);
    }
  }, [userId, onAuthError]);

  useEffect(() => {
    load();
  }, [load]);

  const BackButton = (
    <button
      onClick={onBack}
      className="mb-4 inline-flex items-center gap-1.5 rounded-sm border border-border-subtle bg-surface-primary px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
    >
      ← Back to User List
    </button>
  );

  if (error) {
    return (
      <div>
        {BackButton}
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }
  if (!data) {
    return (
      <div>
        {BackButton}
        <LoadingState label="Loading user details..." />
      </div>
    );
  }

  const { user, lastLogin, history } = data;
  const s = sumHistory(history);
  const lastLoginText = lastLogin ? new Date(lastLogin.time).toLocaleString("en-GB") : "Never logged in";

  return (
    <div className="animate-fade-in">
      {BackButton}

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-border-subtle bg-surface-primary p-4 shadow-sm backdrop-blur-md">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-accent text-base font-bold text-text-primary shadow-sm">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-text-primary">{user.name}</h2>
          <p className="text-xs text-text-muted">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
              user.role === "ADMIN" ? "bg-blue-500/10 text-blue-300 border border-blue-500/20" : "bg-surface-primary text-text-muted border border-border-subtle"
            }`}
          >
            {user.role === "ADMIN" ? "Admin" : "Normal"}
          </span>
          <FreezeStatusBadge status={user.status} />
        </div>
      </div>

      <div className="grid gap-3.5 lg:grid-cols-2 mb-4">
        <InfoPanel title="Account Information">
          <InfoRow label="Last Login" value={lastLoginText} />
          <InfoRow label="Total Attempts" value={s.attempts.toLocaleString("en-US")} />
          <InfoRow label="User ID" value={`#${user.id}`} />
        </InfoPanel>

        <InfoPanel title="Device Information">
          <InfoRow label="Operating System" value={lastLogin?.os || "—"} />
          <InfoRow label="Browser" value={lastLogin?.browser || "—"} />
          <InfoRow label="IP Address" value={lastLogin?.ip || "—"} mono />
        </InfoPanel>
      </div>

      <div>
        <UserActivityDashboard history={history} />
      </div>
    </div>
  );
}

/* ---------------- System log ---------------- */

function LogsSection({ onAuthError }) {
  const pageSize = 15;
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await api.adminLogs({ page, pageSize, level, from, to });
      setData(res);
      setError("");
    } catch (err) {
      if (onAuthError(err)) return;
      setError(err.message);
    }
  }, [page, level, from, to, onAuthError]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [level, from, to]);

  const dot = { info: "bg-blue-400", success: "bg-emerald-400", error: "bg-rose-400" };

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          aria-label="Level filter"
          className="rounded-sm border border-border-subtle bg-surface-secondary px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
        >
          <option value="">All levels</option>
          <option value="info">Info</option>
          <option value="error">Error</option>
        </select>
        <label className="flex items-center gap-1.5 text-xs text-text-muted">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-sm border border-border-subtle bg-surface-secondary px-2 py-1 text-xs text-text-primary outline-none focus:border-accent"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-text-muted">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-sm border border-border-subtle bg-surface-secondary px-2 py-1 text-xs text-text-primary outline-none focus:border-accent"
          />
        </label>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && !data && <LoadingState label="Loading system logs..." />}

      {!error && data && (
        <div className="rounded-md border border-border-subtle bg-surface-primary shadow-sm backdrop-blur-md overflow-hidden">
          <ul className="divide-y divide-slate-800/60">
            {data.logs.map((log) => (
              <li key={log.id} className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-surface-secondary/30 transition-colors">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot[log.level] || dot.info}`} />
                <div className="flex-1">
                  <p className="text-xs text-text-primary">{log.event}</p>
                  <p className="text-[11px] text-text-faint">
                    {log.actor} · {new Date(log.time).toLocaleString("en-GB")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {data.logs.length === 0 && <EmptyState label="No logs available." />}
          <Pager page={page} pageSize={pageSize} total={data.total} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

/* ---------------- Add / edit modal ---------------- */

function UserModal({ mode, user, onClose, onSaved, onAuthError }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "NORMAL");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    if (mode === "add" && password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { name: name.trim(), email: email.trim(), role };
      if (password) payload.password = password;
      if (mode === "add") await api.adminAddUser(payload);
      else await api.adminUpdateUser(user.id, payload);
      onSaved();
    } catch (err) {
      if (onAuthError(err)) return;
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-md border border-border-subtle bg-surface-primary p-5 shadow-md"
      >
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          {mode === "add" ? "Add New User" : "Edit User"}
        </h3>

        <label className="mb-3 block" htmlFor="modal-email">
          <span className="mb-1 block text-xs font-medium text-text-secondary">Email</span>
          <input
            id="modal-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-sm border border-border-subtle bg-surface-secondary px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
          />
        </label>

        <label className="mb-3 block" htmlFor="modal-password">
          <span className="mb-1 block text-xs font-medium text-text-secondary">
            {mode === "add" ? "Password" : "Set New Password (Hidden for Security)"}
          </span>
          <input
            id="modal-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "add" ? "At least 8 characters" : "Leave empty to keep unchanged"}
            autoComplete="new-password"
            className="w-full rounded-sm border border-border-subtle bg-surface-secondary px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
          />
        </label>

        <label className="mb-3 block" htmlFor="modal-name">
          <span className="mb-1 block text-xs font-medium text-text-secondary">Name</span>
          <input
            id="modal-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-sm border border-border-subtle bg-surface-secondary px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
          />
        </label>

        <label className="mb-4 block" htmlFor="modal-role">
          <span className="mb-1 block text-xs font-medium text-text-secondary">Role</span>
          <select
            id="modal-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-sm border border-border-subtle bg-surface-secondary px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
          >
            <option value="NORMAL">Normal</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>

        {error && (
          <p role="alert" className="mb-3 rounded-sm border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-300">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-border-subtle bg-surface-primary px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-sm bg-accent px-4 py-1.5 text-xs font-semibold text-text-primary shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save User"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- Clean Data Modal ---------------- */

function CleanDataModal({ onClose, onCleaned, onAuthError }) {
  const [cleanLogins, setCleanLogins] = useState(false);
  const [cleanTracking, setCleanTracking] = useState(false);
  const [cleanAuditLogs, setCleanAuditLogs] = useState(false);
  
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!cleanLogins && !cleanTracking && !cleanAuditLogs) {
      setError("Please select at least one data type to clean.");
      return;
    }
    
    if (!confirm("Are you sure you want to permanently delete the selected data? This action cannot be undone.")) return;

    setSaving(true);
    setError("");
    try {
      await api.adminCleanData({ cleanLogins, cleanTracking, cleanAuditLogs });
      onCleaned();
    } catch (err) {
      if (onAuthError(err)) return;
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-md border border-border-subtle bg-surface-primary p-5 shadow-md"
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div className="grid h-8 w-8 place-items-center rounded-sm bg-rose-500/20 text-error">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">System Log Clear</h3>
        </div>
        
        <p className="mb-4 text-xs text-text-muted">
          Select the data types to permanently clear. This action complies with data retention policies and cannot be undone.
        </p>

        <div className="space-y-2.5 mb-5">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input 
              type="checkbox" 
              checked={cleanLogins} 
              onChange={e => setCleanLogins(e.target.checked)} 
              className="h-4 w-4 rounded border-border-subtle bg-surface-secondary accent-blue-600" 
            />
            <span className="text-xs text-text-secondary">Login Events (Total Logins)</span>
          </label>
          
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input 
              type="checkbox" 
              checked={cleanTracking} 
              onChange={e => setCleanTracking(e.target.checked)} 
              className="h-4 w-4 rounded border-border-subtle bg-surface-secondary accent-blue-600" 
            />
            <span className="text-xs text-text-secondary">Tracking Records & Submissions</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input 
              type="checkbox" 
              checked={cleanAuditLogs} 
              onChange={e => setCleanAuditLogs(e.target.checked)} 
              className="h-4 w-4 rounded border-border-subtle bg-surface-secondary accent-blue-600" 
            />
            <span className="text-xs text-text-secondary">Audit Logs (System Trail)</span>
          </label>
        </div>

        {error && (
          <p role="alert" className="mb-3 rounded-sm border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-300">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-border-subtle bg-surface-primary px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-sm bg-rose-600 px-4 py-1.5 text-xs font-semibold text-text-primary shadow-sm transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Purging..." : "Purge Data"}
          </button>
        </div>
      </form>
    </div>
  );
}
