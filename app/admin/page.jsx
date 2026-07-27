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

const NAV = [
  { key: "overview", label: "Dashboard Overview", icon: "▤" },
  { key: "users", label: "User List", icon: "☰" },
  { key: "logs", label: "System Log", icon: "≡" },
];

export default function AdminDashboard() {
  const { user, ready, logout, forceLogout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [modal, setModal] = useState(null); // { mode: 'add'|'edit', user }
  const [selectedId, setSelectedId] = useState(null);
  const [recordView, setRecordView] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
        forceLogout("সেশন শেষ হয়ে গেছে। আবার লগইন করুন।");
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
              <span className={`text-base transition-transform ${tab === item.key ? "scale-110" : "group-hover:scale-110"}`}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
        >
          <span className="text-base">⏻</span> Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-5 py-8 md:px-8">
        {/* Mobile tabs */}
        <div className="mb-6 flex gap-2 md:hidden">
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
        </div>

        {!selectedUserView && (
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-2xl font-bold tracking-tight text-white font-display">
              {recordView ? RECORD_META[recordView].title : NAV.find((n) => n.key === tab)?.label}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-400">
              {recordView ? RECORD_META[recordView].subtitle : `স্বাগতম, ${user.name}`}
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
    </div>
  );
}

/* ---------------- Overview / summary cards ---------------- */

function SummaryCard({ label, value, accent, icon, hint, onClick }) {
  const ring = {
    violet: "from-violet-500/20 to-violet-500/5 text-violet-300",
    blue: "from-blue-500/20 to-blue-500/5 text-blue-300",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-300",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-300",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-300",
  }[accent];
  
  const hoverRing = {
    violet: "group-hover:border-violet-500/40 group-hover:shadow-[0_0_20px_-5px_rgba(139,92,246,0.4)]",
    blue: "group-hover:border-blue-500/40 group-hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)]",
    emerald: "group-hover:border-emerald-500/40 group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]",
    rose: "group-hover:border-rose-500/40 group-hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.4)]",
    amber: "group-hover:border-amber-500/40 group-hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]",
  }[accent];

  return (
    <button
      onClick={onClick}
      className={`group text-left rounded-2xl border border-white/10 bg-navy-900/60 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${hoverRing}`}
    >
      <div className="flex items-start justify-between">
        <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br transition-transform group-hover:scale-110 group-hover:rotate-3 ${ring}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <span className="text-slate-600 transition-colors group-hover:text-white">↗</span>
      </div>
      <p className="mt-5 text-sm font-semibold tracking-wide text-slate-400 group-hover:text-slate-300">{label}</p>
      <p className="mt-1 text-4xl font-bold text-white tracking-tight font-display">{value.toLocaleString("en-US")}</p>
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
    { type: "users", label: "Total Users", value: summary.totalUsers, accent: "violet", icon: "👥", hint: "সম্পূর্ণ ইউজার লিস্ট" },
    { type: "logins", label: "Total Logins", value: summary.totalLogins, accent: "blue", icon: "🔑", hint: "সব লগইন রেকর্ড" },
    { type: "attempts", label: "Total Attempts", value: summary.totalAttempts, accent: "violet", icon: "🎯", hint: "সব Attempt রেকর্ড" },
    { type: "success", label: "Total Success", value: summary.totalSuccess, accent: "emerald", icon: "✅", hint: "শুধু Success রেকর্ড" },
    { type: "failed", label: "Total Failed", value: summary.totalFailed, accent: "rose", icon: "❌", hint: "শুধু Failed রেকর্ড" },
    { type: "inReview", label: "Total In Review", value: summary.totalInReview, accent: "amber", icon: "⏳", hint: "শুধু In Review রেকর্ড" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
  logins: { title: "Total Logins", subtitle: "সব ইউজারের লগইন রেকর্ড", icon: "🔑" },
  attempts: { title: "Total Attempts", subtitle: "সব ইউজারের সম্পূর্ণ Attempt রেকর্ড", icon: "🎯" },
  success: { title: "Total Success", subtitle: "শুধুমাত্র Success রেকর্ড", icon: "✅" },
  failed: { title: "Total Failed", subtitle: "শুধুমাত্র Failed রেকর্ড", icon: "❌" },
  inReview: { title: "Total In Review", subtitle: "শুধুমাত্র Review-এ থাকা রেকর্ড", icon: "⏳" },
};

const STATUS_STYLE = {
  SUCCESS: { label: "Account Success", cls: "bg-emerald-500/15 text-emerald-300", dot: "bg-emerald-400" },
  FAILED: { label: "Failed", cls: "bg-rose-500/15 text-rose-300", dot: "bg-rose-400" },
  IN_REVIEW: { label: "In Review", cls: "bg-amber-500/15 text-amber-300", dot: "bg-amber-400" },
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
          ← Overview-এ ফিরে যান
        </button>
        <SearchInput value={rawQ} onChange={setRawQ} placeholder="নাম বা ইমেইল খুঁজুন..." />
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
              {data.total.toLocaleString("en-US")} টি রেকর্ড
            </span>
          </div>

          <ul className="divide-y divide-white/5">
            {data.rows.map((r) => (
              <li key={r.id} className="group flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-all duration-300 hover:bg-white/[0.03] relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 opacity-0 transition-opacity group-hover:opacity-100 rounded-r-md"></div>
                <UserChip userId={r.userId} userName={r.userName} email={r.email} onOpenUser={onOpenUser} />
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
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${STATUS_STYLE[r.status].cls}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[r.status].dot} animate-pulse`} />
                      {STATUS_STYLE[r.status].label}
                    </span>
                  )}
                </div>
              </li>
            ))}
            {data.rows.length === 0 && (
              <li>
                <EmptyState label="কোনো রেকর্ড নেই।" />
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
        <SearchInput value={rawQ} onChange={setRawQ} placeholder="নাম বা ইমেইল খুঁজুন..." />
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
                  <SortHeader label="ইউজারের নাম" sortKey="name" sort={sort} order={order} onSort={toggleSort} />
                  <SortHeader label="ইমেইল" sortKey="email" sort={sort} order={order} onSort={toggleSort} />
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
                                if (confirm(`${u.name} এর পিসি/ডিভাইস বাইন্ডিং মুছে ফেলবেন?`)) withBusy(u.id, () => api.adminResetDevice(u.id));
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
                                if (confirm(`${u.name} কে আনফ্রিজ / এক্টিভেট করবেন?`)) withBusy(u.id, () => api.adminUnfreezeUser(u.id));
                              }}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-emerald-500/40 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Unfreeze
                            </button>
                          ) : (
                            <button
                              disabled={self || busy}
                              title={self ? "নিজের অ্যাকাউন্ট ফ্রিজ করা যাবে না" : undefined}
                              onClick={() => {
                                if (confirm(`${u.name} কে ফ্রিজ করবেন? ইউজার আর লগইন করতে পারবে না।`))
                                  withBusy(u.id, () => api.adminFreezeUser(u.id));
                              }}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-amber-500/40 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:text-slate-200"
                            >
                              Freeze
                            </button>
                          )}
                          <button
                            disabled={self || busy}
                            title={self ? "নিজের অ্যাকাউন্ট ডিলিট করা যাবে না" : undefined}
                            onClick={() => {
                              if (confirm(`${u.name} কে ডিলিট করবেন?`)) withBusy(u.id, () => api.adminDeleteUser(u.id));
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
          {data.users.length === 0 && <EmptyState label="কোনো ইউজার নেই।" />}
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
      ← User List-এ ফিরে যান
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
  const lastLoginText = lastLogin ? new Date(lastLogin.time).toLocaleString("en-GB") : "কখনো লগইন করেনি";

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
        <InfoPanel title="অ্যাক্টিভিটি">
          <InfoRow label="সর্বশেষ Login" value={lastLoginText} />
          <InfoRow label="মোট রেকর্ড" value={s.attempts.toLocaleString("en-US")} />
          <InfoRow label="User ID" value={`#${user.id}`} />
        </InfoPanel>

        <InfoPanel title="Device Information">
          <InfoRow label="অপারেটিং সিস্টেম" value={lastLogin?.os || "—"} />
          <InfoRow label="ব্রাউজার" value={lastLogin?.browser || "—"} />
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
          aria-label="লেভেল ফিল্টার"
          className="rounded-xl border border-white/10 bg-navy-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
        >
          <option value="">সব লেভেল</option>
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
          {data.logs.length === 0 && <EmptyState label="কোনো লগ নেই।" />}
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
      setError("পাসওয়ার্ড কমপক্ষে ৮ ক্যারেক্টারের হতে হবে।");
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
          {mode === "add" ? "নতুন ইউজার যোগ করুন" : "ইউজার এডিট করুন"}
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
            {mode === "add" ? "Password" : "নতুন Password (ঐচ্ছিক)"}
          </span>
          <input
            id="modal-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "add" ? "কমপক্ষে ৮ ক্যারেক্টার" : "খালি রাখলে অপরিবর্তিত থাকবে"}
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
            {saving ? "সেভ হচ্ছে..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
