"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore, sumHistory } from "@/lib/store";
import UserActivityDashboard, { InfoPanel, InfoRow } from "@/components/UserActivityDashboard";

const NAV = [
  { key: "overview", label: "Dashboard Overview", icon: "▤" },
  { key: "users", label: "User List", icon: "☰" },
  { key: "logs", label: "System Log", icon: "≡" },
];

export default function AdminDashboard() {
  const { session, ready, users, logs, addUser, deleteUser, updateUser, freezeUser, unfreezeUser, logout } =
    useStore();
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [modal, setModal] = useState(null); // { mode: 'add'|'edit', user }
  const [selectedId, setSelectedId] = useState(null); // individual user dashboard
  const [recordView, setRecordView] = useState(null); // 'logins'|'attempts'|'success'|'failed'|'inReview'

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/");
    else if (session.role !== "Admin") router.replace("/dashboard");
  }, [ready, session, router]);

  // Global totals derived from every user's date-wise history. These are
  // platform-wide numbers and are kept completely separate from the per-user
  // figures shown inside UserDetail.
  const summary = useMemo(() => {
    return users.reduce(
      (acc, u) => {
        const t = sumHistory(u.history);
        acc.totalUsers += 1;
        acc.totalLogins += t.logins;
        acc.totalAttempts += t.attempts;
        acc.totalSuccess += t.success;
        acc.totalFailed += t.failed;
        acc.totalInReview += t.inReview;
        return acc;
      },
      {
        totalUsers: 0,
        totalLogins: 0,
        totalAttempts: 0,
        totalSuccess: 0,
        totalFailed: 0,
        totalInReview: 0,
      }
    );
  }, [users]);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedId) || null,
    [users, selectedId]
  );

  if (!ready || !session || session.role !== "Admin") return null;

  function handleLogout() {
    logout();
    router.replace("/");
  }

  function goToUsers() {
    setSelectedId(null);
    setRecordView(null);
    setTab("users");
  }

  // A summary card was clicked. Total Users opens the full user list; every
  // other card opens its own dedicated, filtered record view — no two cards
  // ever land on the same screen.
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
    setSelectedId(null);
    setRecordView(null);
    setTab("overview");
  }

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

        <nav className="flex-1 space-y-1">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setSelectedId(null);
                setRecordView(null);
                setTab(item.key);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                tab === item.key
                  ? "bg-violet-500/15 text-violet-200 ring-1 ring-violet-500/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <span className="text-base">{item.icon}</span>
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
              onClick={() => {
                setSelectedId(null);
                setRecordView(null);
                setTab(item.key);
              }}
              className={`rounded-lg px-3 py-2 text-xs font-medium ${
                tab === item.key ? "bg-violet-500/20 text-violet-200" : "bg-white/5 text-slate-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {selectedUser
              ? selectedUser.name
              : recordView
              ? RECORD_META[recordView].title
              : NAV.find((n) => n.key === tab)?.label}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {selectedUser
              ? selectedUser.email
              : recordView
              ? RECORD_META[recordView].subtitle
              : `স্বাগতম, ${session.name}`}
          </p>
        </div>

        {/* Global summary — only on overview, and only when not drilled in */}
        {tab === "overview" && !selectedUser && !recordView && (
          <SummarySection summary={summary} onCard={handleCard} />
        )}

        {/* Per-card record drill-down */}
        {recordView && !selectedUser && (
          <RecordsView
            type={recordView}
            users={users}
            onOpenUser={(id) => setSelectedId(id)}
            onBack={backToOverview}
          />
        )}

        {tab === "users" && !selectedUser && !recordView && (
          <UserTable
            users={users}
            currentUserId={session.id}
            onOpen={(u) => setSelectedId(u.id)}
            onAdd={() => setModal({ mode: "add", user: null })}
            onEdit={(u) => setModal({ mode: "edit", user: u })}
            onDelete={deleteUser}
            onFreeze={freezeUser}
            onUnfreeze={unfreezeUser}
          />
        )}

        {selectedUser && (
          <UserDetail user={selectedUser} onBack={() => setSelectedId(null)} />
        )}

        {tab === "logs" && !selectedUser && !recordView && <SystemLog logs={logs} />}
      </main>

      {modal && (
        <UserModal
          mode={modal.mode}
          user={modal.user}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal.mode === "add") addUser(data);
            else updateUser(modal.user.id, data);
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Summary section ---------------- */

function SummaryCard({ label, value, accent, icon, hint, onClick }) {
  const ring = {
    violet: "from-violet-500/20 to-violet-500/5 text-violet-300",
    blue: "from-blue-500/20 to-blue-500/5 text-blue-300",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-300",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-300",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-300",
  }[accent];
  return (
    <button
      onClick={onClick}
      className="group text-left rounded-2xl border border-white/10 bg-navy-900/60 p-6 shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-glow"
    >
      <div className="flex items-start justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${ring}`}>
          <span className="text-lg">{icon}</span>
        </div>
        <span className="text-slate-600 transition group-hover:text-violet-300">↗</span>
      </div>
      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-white">{value.toLocaleString("en-US")}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </button>
  );
}

function SummarySection({ summary, onCard }) {
  const cards = [
    { type: "users", label: "Total Users", value: summary.totalUsers, accent: "violet", icon: "👥", hint: "সম্পূর্ণ ইউজার লিস্ট" },
    { type: "logins", label: "Total Logins", value: summary.totalLogins, accent: "blue", icon: "🔑", hint: "সব লগইন রেকর্ড" },
    { type: "attempts", label: "Total Attempts", value: summary.totalAttempts, accent: "violet", icon: "🎯", hint: "সব Attempt রেকর্ড" },
    { type: "success", label: "Total Success", value: summary.totalSuccess, accent: "emerald", icon: "✅", hint: "শুধু Success রেকর্ড" },
    { type: "failed", label: "Total Failed", value: summary.totalFailed, accent: "rose", icon: "❌", hint: "শুধু Failed রেকর্ড" },
    { type: "inReview", label: "Total In Review", value: summary.totalInReview, accent: "amber", icon: "⏳", hint: "শুধু In Review রেকর্ড" },
  ];
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((c) => (
        <SummaryCard key={c.type} {...c} onClick={() => onCard(c.type)} />
      ))}
    </div>
  );
}

/* ---------------- Per-card record views ---------------- */

const RECORD_META = {
  logins: { title: "Total Logins", subtitle: "সব ইউজারের লগইন রেকর্ড", accent: "blue", icon: "🔑" },
  attempts: { title: "Total Attempts", subtitle: "সব ইউজারের সম্পূর্ণ Attempt রেকর্ড", accent: "violet", icon: "🎯" },
  success: { title: "Total Success", subtitle: "শুধুমাত্র Success রেকর্ড", accent: "emerald", icon: "✅" },
  failed: { title: "Total Failed", subtitle: "শুধুমাত্র Failed রেকর্ড", accent: "rose", icon: "❌" },
  inReview: { title: "Total In Review", subtitle: "শুধুমাত্র Review-এ থাকা রেকর্ড", accent: "amber", icon: "⏳" },
};

const STATUS_STYLE = {
  success: { label: "Account Success", cls: "bg-emerald-500/15 text-emerald-300", dot: "bg-emerald-400" },
  failed: { label: "Failed", cls: "bg-rose-500/15 text-rose-300", dot: "bg-rose-400" },
  inReview: { label: "In Review", cls: "bg-amber-500/15 text-amber-300", dot: "bg-amber-400" },
};

function fmtDate(dateKey) {
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function recSortKey(r) {
  return r.time || `${r.date}T00:00:00Z`;
}

// Expand a user's daily status counters into individual records, borrowing
// real timestamps from that day's status-update logs where available.
function statusRecords(users, statusKey) {
  const needle = statusKey === "inReview" ? "In Review" : statusKey === "success" ? "Success" : "Failed";
  const rows = [];
  for (const u of users) {
    const hist = u.history || {};
    for (const date of Object.keys(hist)) {
      const day = hist[date];
      const count = day?.[statusKey] || 0;
      if (!count) continue;
      const times = (day.logs || [])
        .filter((l) => l.event && l.event.includes(needle))
        .map((l) => l.time);
      for (let i = 0; i < count; i++) {
        rows.push({
          key: `${u.id}-${date}-${statusKey}-${i}`,
          userId: u.id,
          userName: u.name,
          email: u.email,
          date,
          time: times[i] || null,
          status: statusKey,
        });
      }
    }
  }
  return rows;
}

function loginRecords(users) {
  const rows = [];
  for (const u of users) {
    const hist = u.history || {};
    for (const date of Object.keys(hist)) {
      (hist[date].logins || []).forEach((l, i) => {
        rows.push({
          key: `${u.id}-${date}-login-${i}`,
          userId: u.id,
          userName: u.name,
          email: u.email,
          date,
          time: l.time,
          device: l.device,
        });
      });
    }
  }
  return rows;
}

function buildRecords(type, users) {
  let rows;
  if (type === "logins") rows = loginRecords(users);
  else if (type === "attempts")
    rows = [
      ...statusRecords(users, "success"),
      ...statusRecords(users, "failed"),
      ...statusRecords(users, "inReview"),
    ];
  else rows = statusRecords(users, type);
  return rows.sort((a, b) => (recSortKey(a) < recSortKey(b) ? 1 : -1));
}

function UserChip({ record, onOpenUser }) {
  return (
    <button
      onClick={() => onOpenUser(record.userId)}
      className="group flex items-center gap-3 text-left"
    >
      <div className="grid h-9 w-9 place-items-center rounded-full bg-navy-700 text-xs font-semibold text-violet-300">
        {record.userName?.[0]?.toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-medium text-white underline-offset-4 group-hover:text-violet-300 group-hover:underline">
          {record.userName}
        </p>
        <p className="text-xs text-slate-500">{record.email}</p>
      </div>
    </button>
  );
}

function RecordsView({ type, users, onOpenUser, onBack }) {
  const meta = RECORD_META[type];
  const records = useMemo(() => buildRecords(type, users), [type, users]);
  const isLogin = type === "logins";

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
      >
        ← Overview-এ ফিরে যান
      </button>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-navy-900/60 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">{meta.icon}</span>
            <h2 className="text-sm font-semibold text-white">{meta.title}</h2>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
            {records.length.toLocaleString("en-US")} টি রেকর্ড
          </span>
        </div>

        <ul className="divide-y divide-white/5">
          {records.map((r) => (
            <li
              key={r.key}
              className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition hover:bg-white/[0.02]"
            >
              {/* Left: the user the record belongs to */}
              <UserChip record={r} onOpenUser={onOpenUser} />

              {/* Right: status / time + date */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-white">{fmtDate(r.date)}</p>
                  <p className="text-xs text-slate-500">
                    {r.time ? new Date(r.time).toLocaleTimeString("en-GB") : "সময় অজানা"}
                    {isLogin && r.device ? ` · ${r.device.browser || "—"} · ${r.device.os || "—"}` : ""}
                  </p>
                </div>
                {isLogin ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-medium text-blue-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Login
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[r.status].cls}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[r.status].dot}`} />
                    {STATUS_STYLE[r.status].label}
                  </span>
                )}
              </div>
            </li>
          ))}
          {records.length === 0 && (
            <li className="px-6 py-12 text-center text-slate-500">কোনো রেকর্ড নেই।</li>
          )}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- User table ---------------- */

function UserTable({ users, currentUserId, onOpen, onAdd, onEdit, onDelete, onFreeze, onUnfreeze }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-navy-900/60 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <h2 className="text-sm font-semibold text-white">ইউজার ম্যানেজমেন্ট</h2>
        <button
          onClick={onAdd}
          className="rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:from-violet-500 hover:to-blue-500"
        >
          + Add New User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400">
              <th className="px-6 py-3 font-medium">ইউজারের নাম</th>
              <th className="px-6 py-3 font-medium">ইমেইল</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-white/5 transition hover:bg-white/[0.02]">
                <td className="px-6 py-4">
                  <button
                    onClick={() => onOpen(u)}
                    className="group flex items-center gap-3 text-left"
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-navy-700 text-xs font-semibold text-violet-300">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-white underline-offset-4 group-hover:text-violet-300 group-hover:underline">
                      {u.name}
                    </span>
                  </button>
                </td>
                <td className="px-6 py-4 text-slate-300">{u.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      u.role === "Admin"
                        ? "bg-violet-500/15 text-violet-300"
                        : "bg-slate-500/15 text-slate-300"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <FreezeStatusBadge status={u.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(u)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-violet-500/40 hover:text-violet-300"
                    >
                      Edit
                    </button>
                    {u.status === "frozen" ? (
                      <button
                        onClick={() => {
                          if (confirm(`${u.name} কে আনফ্রিজ / এক্টিভেট করবেন?`)) onUnfreeze(u.id);
                        }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-emerald-500/40 hover:text-emerald-300"
                      >
                        Unfreeze
                      </button>
                    ) : (
                      <button
                        disabled={u.id === currentUserId}
                        title={u.id === currentUserId ? "নিজের অ্যাকাউন্ট ফ্রিজ করা যাবে না" : undefined}
                        onClick={() => {
                          if (confirm(`${u.name} কে ফ্রিজ করবেন? ইউজার আর লগইন করতে পারবে না।`))
                            onFreeze(u.id);
                        }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-amber-500/40 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:text-slate-200"
                      >
                        Freeze
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`${u.name} কে ডিলিট করবেন?`)) onDelete(u.id);
                      }}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-rose-500/40 hover:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                  কোনো ইউজার নেই।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FreezeStatusBadge({ status }) {
  const frozen = status === "frozen";
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

function UserDetail({ user, onBack }) {
  const s = sumHistory(user.history);

  const lastLogin = user.lastLogin
    ? new Date(user.lastLogin).toLocaleString("en-GB")
    : "কখনো লগইন করেনি";

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
      >
        ← User List-এ ফিরে যান
      </button>

      {/* Profile header */}
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
              user.role === "Admin"
                ? "bg-violet-500/15 text-violet-300"
                : "bg-slate-500/15 text-slate-300"
            }`}
          >
            {user.role}
          </span>
          <FreezeStatusBadge status={user.status} />
        </div>
      </div>

      {/* Details grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        <InfoPanel title="অ্যাক্টিভিটি">
          <InfoRow label="সর্বশেষ Login" value={lastLogin} />
          <InfoRow label="মোট রেকর্ড" value={s.attempts.toLocaleString("en-US")} />
          <InfoRow label="User ID" value={`#${user.id}`} />
        </InfoPanel>

        <InfoPanel title="Device Information">
          <InfoRow label="ডিভাইস" value={user.device?.name || "—"} />
          <InfoRow label="অপারেটিং সিস্টেম" value={user.device?.os || "—"} />
          <InfoRow label="ব্রাউজার" value={user.device?.browser || "—"} />
          <InfoRow label="IP Address" value={user.device?.ip || "—"} mono />
        </InfoPanel>
      </div>

      {/* Summary + Date-wise Activity History — scoped to this user's own history only */}
      <div className="mt-6">
        <UserActivityDashboard history={user.history} />
      </div>
    </div>
  );
}

/* ---------------- System log ---------------- */

function SystemLog({ logs }) {
  const dot = { info: "bg-blue-400", success: "bg-emerald-400", error: "bg-rose-400" };
  return (
    <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-2 shadow-xl backdrop-blur-xl">
      <ul className="divide-y divide-white/5">
        {logs.map((log) => (
          <li key={log.id} className="flex items-start gap-3 px-4 py-4">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot[log.level]}`} />
            <div className="flex-1">
              <p className="text-sm text-white">{log.event}</p>
              <p className="text-xs text-slate-500">
                {log.actor} · {log.time}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Add / edit modal ---------------- */

function UserModal({ mode, user, onClose, onSave }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "Normal");

  function submit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSave({ name: name.trim(), email: email.trim(), role });
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

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm text-slate-300">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-navy-950/60 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm text-slate-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-navy-950/60 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-1.5 block text-sm text-slate-300">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-navy-950/60 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="Normal">Normal</option>
            <option value="Admin">Admin</option>
          </select>
        </label>

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
            className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:from-violet-500 hover:to-blue-500"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
