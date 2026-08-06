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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-navy-900/70 p-5 backdrop-blur-xl md:flex">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-glow">
            <span className="text-lg font-black text-white">T</span>
          </div>
          <span className="text-lg font-semibold text-white">Trackr Admin</span>
        </div>

        <nav className="flex-1 space-y-2">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNav(item.key)}
              className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                tab === item.key
                  ? "bg-gradient-to-r from-violet-500/20 to-blue-500/10 text-violet-200 ring-1 ring-violet-500/30 shadow-[inset_2px_0_0_0_#8b5cf6]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:translate-x-1"
              }`}
            >
              <item.icon className={`h-5 w-5 transition-transform ${tab === item.key ? "scale-110" : "group-hover:scale-110"}`} />
              {item.label}
            </button>
          ))}
          <a
            href="/downloads/SmartAgeVerification.rar"
            download
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:bg-emerald-500/10 hover:text-emerald-300 hover:translate-x-1"
          >
            <Download className="h-5 w-5 transition-transform group-hover:scale-110" />
            Download App
          </a>
        </nav>

        <button
          onClick={() => setCleanModalOpen(true)}
          className="mt-auto mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
        >
          <AlertTriangle className="h-5 w-5" /> Clean Data
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
        >
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-5 py-8 md:px-8">
        {/* Mobile tabs */}
        <div className="mb-6 flex gap-2 md:hidden overflow-x-auto pb-2">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNav(item.key)}
              className={`rounded-lg px-3 py-2 text-xs font-medium ${
                tab === item.key ? "bg-violet-500/20 text-violet-200" : "bg-white/5 text-slate-400"
              }`}
            >
              {item.label}
            </button>
          ))}
          <a
            href="/downloads/publish.rar"
            download
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium bg-emerald-500/10 text-emerald-400 whitespace-nowrap"
          >
            <Download className="h-3 w-3" /> App
          </a>
          <button
            onClick={() => setCleanModalOpen(true)}
            className="rounded-lg px-3 py-2 text-xs font-medium bg-rose-500/10 text-rose-400 ml-auto whitespace-nowrap"
          >
            Clean Data
          </button>
        </div>

        {!selectedUserView && (
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-2xl font-bold tracking-tight text-white font-display">
              {recordView ? RECORD_META[recordView].title : NAV.find((n) => n.key === tab)?.label}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-400">
              {recordView ? RECORD_META[recordView].subtitle : `Welcome back, ${user.name}`}
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
  const GLOW = {
    violet: "rgba(139,92,246,0.3)",
    blue: "rgba(59,130,246,0.3)",
    emerald: "rgba(16,185,129,0.3)",
    rose: "rgba(244,63,94,0.3)",
    amber: "rgba(245,158,11,0.3)",
  };

  const RING = {
    violet: "from-violet-500/20 to-violet-500/5 text-violet-400 group-hover:text-violet-300",
    blue: "from-blue-500/20 to-blue-500/5 text-blue-400 group-hover:text-blue-300",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 group-hover:text-emerald-300",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-400 group-hover:text-rose-300",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-400 group-hover:text-amber-300",
  };

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-navy-900/60 p-6 text-left shadow-xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/[0.04]`}
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
      <div className="flex items-start justify-between">
        <div
          className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_0_15px_-3px_var(--icon-glow)] ${
            RING[accent]
          }`}
          style={{ '--icon-glow': GLOW[accent] }}
        >
          <Icon className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <ChevronRight className="h-5 w-5 text-slate-600 transition-colors group-hover:text-white" />
      </div>
      <p className="mt-5 text-sm font-semibold tracking-wide text-slate-400 group-hover:text-slate-300 transition-colors">{label}</p>
      <p className="mt-1 text-4xl font-bold tracking-tight text-white font-display">{value.toLocaleString("en-US")}</p>
      <p className="mt-2 text-xs font-medium text-slate-500">{hint}</p>
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
  if (!summary) return <LoadingState />;

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
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => (
          <SummaryCard key={c.type} {...c} onClick={() => onCard(c.type)} />
        ))}
      </div>

      {/* Separate from the Prisma-backed cards above — reads metrics/summary
          straight from Firestore via onSnapshot, so it updates the instant
          that document changes, with no refresh or polling involved. */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Live Metrics (Firestore Real-time)</h2>
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
    <button onClick={() => onOpenUser(userId)} className="group flex items-center gap-3 text-left">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-navy-700 text-xs font-semibold text-violet-300">
        {userName?.[0]?.toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-medium text-white underline-offset-4 group-hover:text-violet-300 group-hover:underline">
          {userName}
        </p>
        <p className="text-xs text-slate-500">{email}</p>
      </div>
    </button>
  );
}

function RecordsView({ type, onOpenUser, onBack, onAuthError }) {
  const meta = RECORD_META[type];
  const isLogin = type === "logins";
  const pageSize = 10;

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
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
        >
          ← Back to Overview
        </button>
        <SearchInput value={rawQ} onChange={setRawQ} placeholder="Search by name or email..." />
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && !data && <LoadingState />}

      {!error && data && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-navy-900/60 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">{meta.icon}</span>
              <h2 className="text-sm font-semibold text-white">{meta.title}</h2>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              {data.total.toLocaleString("en-US")} records
            </span>
          </div>

          <ul className="divide-y divide-white/5">
            {data.rows.map((r) => (
              <li key={r.id} className="group flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-all duration-300 hover:bg-white/[0.03] relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 opacity-0 transition-opacity group-hover:opacity-100 rounded-r-md"></div>
                <div className="flex flex-col gap-1">
                  <UserChip userId={r.userId} userName={r.userName} email={r.email} onOpenUser={onOpenUser} />
                  {!isLogin && r.code && (
                    <span className="text-xs text-slate-400 pl-12">
                      Token: <span className="font-mono text-slate-300">{r.code}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right transition-transform group-hover:-translate-x-1">
                    <p className="text-sm text-white">{fmtDate(r.time)}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(r.time).toLocaleTimeString("en-GB")}
                      {isLogin ? ` · ${r.browser || "—"} · ${r.os || "—"}` : ""}
                    </p>
                  </div>
                  {isLogin ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1.5 text-xs font-medium text-blue-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                      Login
                    </span>
                  ) : (
                    (() => {
                      const style = STATUS_STYLE[r.status] || STATUS_STYLE.IN_REVIEW;
                      return (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${style.cls}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot} animate-pulse`} />
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
        className={`flex items-center gap-1 transition hover:text-slate-200 ${active ? "text-violet-300" : ""}`}
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
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={rawQ} onChange={setRawQ} placeholder="Search by name or email..." />
        <button
          onClick={onAdd}
          className="rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:from-violet-500 hover:to-blue-500"
        >
          + Add New User
        </button>
      </div>

      {actionError && (
        <p role="alert" className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {actionError}
        </p>
      )}

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && !data && <LoadingState />}

      {!error && data && (
        <div className="rounded-2xl border border-white/10 bg-navy-900/60 shadow-xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-400">
                  <SortHeader label="User Name" sortKey="name" sort={sort} order={order} onSort={toggleSort} />
                  <SortHeader label="Email" sortKey="email" sort={sort} order={order} onSort={toggleSort} />
                  <SortHeader label="Role" sortKey="role" sort={sort} order={order} onSort={toggleSort} />
                  <SortHeader label="Status" sortKey="status" sort={sort} order={order} onSort={toggleSort} />
                  <th className="px-6 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => {
                  const frozen = u.status === "FROZEN";
                  const self = u.id === currentUserId;
                  const busy = busyId === u.id;
                  return (
                    <tr key={u.id} className="group border-t border-white/5 transition-all duration-300 hover:bg-white/[0.03] relative">
                      <td className="px-6 py-4">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 opacity-0 transition-opacity group-hover:opacity-100 rounded-r-md"></div>
                        <button onClick={() => onOpen(u)} className="flex items-center gap-3 text-left">
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-navy-700 border border-white/5 text-xs font-bold text-violet-300 transition-transform group-hover:scale-110">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-semibold text-white transition-colors group-hover:text-violet-300">
                            {u.name}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{u.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            u.role === "ADMIN" ? "bg-violet-500/15 text-violet-300" : "bg-slate-500/15 text-slate-300"
                          }`}
                        >
                          {u.role === "ADMIN" ? "Admin" : "Normal"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <FreezeStatusBadge status={u.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {u.deviceHash && (
                            <button
                              disabled={busy}
                              title="Reset the user's bound PC device"
                              onClick={() => {
                                if (confirm(`Reset device binding for ${u.name}?`)) withBusy(u.id, () => api.adminResetDevice(u.id));
                              }}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-blue-500/40 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Reset Device
                            </button>
                          )}
                          <button
                            onClick={() => onEdit(u)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-violet-500/40 hover:text-violet-300"
                          >
                            Edit
                          </button>
                          {frozen ? (
                            <button
                              disabled={busy}
                              onClick={() => {
                                if (confirm(`Unfreeze / Activate ${u.name}?`)) withBusy(u.id, () => api.adminUnfreezeUser(u.id));
                              }}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-emerald-500/40 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Unfreeze
                            </button>
                          ) : (
                            <button
                              disabled={self || busy}
                              title={self ? "Cannot freeze own account" : undefined}
                              onClick={() => {
                                if (confirm(`Freeze ${u.name}? They will no longer be able to log in.`))
                                  withBusy(u.id, () => api.adminFreezeUser(u.id));
                              }}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-amber-500/40 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:text-slate-200"
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
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-rose-500/40 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:text-slate-200"
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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        frozen ? "bg-rose-500/15 text-rose-300" : "bg-emerald-500/15 text-emerald-300"
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
      className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
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
        <LoadingState />
      </div>
    );
  }

  const { user, lastLogin, history } = data;
  const s = sumHistory(history);
  const lastLoginText = lastLogin ? new Date(lastLogin.time).toLocaleString("en-GB") : "Never logged in";

  return (
    <div>
      {BackButton}

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-navy-900/60 p-6 shadow-xl backdrop-blur-xl">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-2xl font-bold text-white shadow-glow">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">{user.name}</h2>
          <p className="text-sm text-slate-400">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              user.role === "ADMIN" ? "bg-violet-500/15 text-violet-300" : "bg-slate-500/15 text-slate-300"
            }`}
          >
            {user.role === "ADMIN" ? "Admin" : "Normal"}
          </span>
          <FreezeStatusBadge status={user.status} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <InfoPanel title="Activity">
          <InfoRow label="Last Login" value={lastLoginText} />
          <InfoRow label="Total Records" value={s.attempts.toLocaleString("en-US")} />
          <InfoRow label="User ID" value={`#${user.id}`} />
        </InfoPanel>

        <InfoPanel title="Device Information">
          <InfoRow label="Operating System" value={lastLogin?.os || "—"} />
          <InfoRow label="Browser" value={lastLogin?.browser || "—"} />
          <InfoRow label="IP Address" value={lastLogin?.ip || "—"} mono />
        </InfoPanel>
      </div>

      <div className="mt-6">
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
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          aria-label="Level filter"
          className="rounded-xl border border-white/10 bg-navy-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
        >
          <option value="">All levels</option>
          <option value="info">Info</option>
          <option value="error">Error</option>
        </select>
        <label className="flex items-center gap-2 text-xs text-slate-400">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-white/10 bg-navy-950/60 px-3 py-2 text-sm text-white outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-400">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-white/10 bg-navy-950/60 px-3 py-2 text-sm text-white outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
          />
        </label>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && !data && <LoadingState />}

      {!error && data && (
        <div className="rounded-2xl border border-white/10 bg-navy-900/60 shadow-xl backdrop-blur-xl">
          <ul className="divide-y divide-white/5">
            {data.logs.map((log) => (
              <li key={log.id} className="flex items-start gap-3 px-4 py-4">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot[log.level] || dot.info}`} />
                <div className="flex-1">
                  <p className="text-sm text-white">{log.event}</p>
                  <p className="text-xs text-slate-500">
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-navy-850 p-6 shadow-2xl"
      >
        <h3 className="mb-5 text-lg font-semibold text-white">
          {mode === "add" ? "Add New User" : "Edit User"}
        </h3>

        <label className="mb-4 block" htmlFor="modal-name">
          <span className="mb-1.5 block text-sm text-slate-300">Name</span>
          <input
            id="modal-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-navy-950/60 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
          />
        </label>

        <label className="mb-4 block" htmlFor="modal-email">
          <span className="mb-1.5 block text-sm text-slate-300">Email</span>
          <input
            id="modal-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-navy-950/60 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
          />
        </label>

        <label className="mb-4 block" htmlFor="modal-role">
          <span className="mb-1.5 block text-sm text-slate-300">Role</span>
          <select
            id="modal-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-navy-950/60 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="NORMAL">Normal</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>

        <label className="mb-6 block" htmlFor="modal-password">
          <span className="mb-1.5 block text-sm text-slate-300">
            {mode === "add" ? "Password" : "New Password (Optional)"}
          </span>
          <input
            id="modal-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "add" ? "At least 8 characters" : "Leave empty to keep unchanged"}
            autoComplete="new-password"
            className="w-full rounded-xl border border-white/10 bg-navy-950/60 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
          />
        </label>

        {error && (
          <p role="alert" className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:from-violet-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-navy-850 p-6 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/20 text-rose-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">Clean System Data</h3>
        </div>
        
        <p className="mb-6 text-sm text-slate-400">
          Select the types of data you wish to permanently clear from the system. This action cannot be undone and follows international data retention standards.
        </p>

        <label className="mb-4 flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={cleanLogins} 
            onChange={e => setCleanLogins(e.target.checked)} 
            className="h-5 w-5 rounded border-white/20 bg-navy-950/60 accent-violet-500" 
          />
          <span className="text-sm font-medium text-slate-200">Total Logins (Login Events)</span>
        </label>
        
        <label className="mb-4 flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={cleanTracking} 
            onChange={e => setCleanTracking(e.target.checked)} 
            className="h-5 w-5 rounded border-white/20 bg-navy-950/60 accent-violet-500" 
          />
          <span className="text-sm font-medium text-slate-200">Sales / Tracking Data</span>
        </label>

        <label className="mb-6 flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={cleanAuditLogs} 
            onChange={e => setCleanAuditLogs(e.target.checked)} 
            className="h-5 w-5 rounded border-white/20 bg-navy-950/60 accent-violet-500" 
          />
          <span className="text-sm font-medium text-slate-200">System Logs (Audit Trails)</span>
        </label>

        {error && (
          <p role="alert" className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_15px_-3px_rgba(225,29,72,0.4)] transition hover:from-rose-500 hover:to-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Cleaning..." : "Clean Selected Data"}
          </button>
        </div>
      </form>
    </div>
  );
}
