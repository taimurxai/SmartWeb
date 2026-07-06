"use client";

import { createContext, useContext, useEffect, useState } from "react";

/*
 * Mock in-memory + localStorage backed store.
 * Replace these functions with real API calls when you wire up a backend.
 */

const STORAGE_KEY = "tracking_dashboard_state_v1";
const SESSION_KEY = "tracking_dashboard_session_v1";
const FROZEN_NOTICE_KEY = "tracking_dashboard_frozen_notice_v1";

// Per-user activity, keyed by "YYYY-MM-DD". Each day tracks its own
// attempts/success/failed/inReview counters plus that day's logins & logs —
// this is the single source of truth; aggregate totals are always derived
// from it via sumHistory() rather than kept as a separate stale counter.
const seedUsers = [
  {
    id: 1,
    name: "Admin",
    email: "admin@demo.com",
    password: "admin123",
    role: "Admin",
    status: "active",
    lastLogin: "2026-07-06T05:40:00Z",
    device: { name: "MacBook Pro", os: "macOS 15.3", browser: "Chrome 126", ip: "103.21.44.10" },
    history: {
      "2026-07-06": {
        attempts: 0,
        success: 0,
        failed: 0,
        inReview: 0,
        logins: [
          {
            time: "2026-07-06T05:40:00Z",
            device: { name: "MacBook Pro", os: "macOS 15.3", browser: "Chrome 126", ip: "103.21.44.10" },
          },
        ],
        logs: [{ time: "2026-07-06T05:40:00Z", event: "লগইন করেছেন" }],
      },
    },
  },
  {
    id: 2,
    name: "User 1",
    email: "user1@demo.com",
    password: "user123",
    role: "Normal",
    status: "active",
    lastLogin: "2026-07-06T09:12:00Z",
    device: { name: "Windows PC", os: "Windows 11", browser: "Edge 126", ip: "115.187.60.22" },
    history: {
      "2026-07-06": {
        attempts: 5,
        success: 3,
        failed: 1,
        inReview: 1,
        logins: [
          {
            time: "2026-07-06T09:12:00Z",
            device: { name: "Windows PC", os: "Windows 11", browser: "Edge 126", ip: "115.187.60.22" },
          },
        ],
        logs: [
          { time: "2026-07-06T09:12:00Z", event: "লগইন করেছেন" },
          { time: "2026-07-06T09:14:00Z", event: "কোড ট্র্যাক করা হয়েছে (In Review)" },
          { time: "2026-07-06T09:20:00Z", event: "স্ট্যাটাস আপডেট: Account Success" },
        ],
      },
      "2026-07-05": {
        attempts: 8,
        success: 6,
        failed: 2,
        inReview: 0,
        logins: [
          {
            time: "2026-07-05T08:50:00Z",
            device: { name: "Windows PC", os: "Windows 11", browser: "Edge 126", ip: "115.187.60.22" },
          },
        ],
        logs: [
          { time: "2026-07-05T08:50:00Z", event: "লগইন করেছেন" },
          { time: "2026-07-05T14:30:00Z", event: "স্ট্যাটাস আপডেট: Account Success" },
        ],
      },
      "2026-07-04": {
        attempts: 4,
        success: 3,
        failed: 0,
        inReview: 1,
        logins: [
          {
            time: "2026-07-04T10:05:00Z",
            device: { name: "Windows PC", os: "Windows 11", browser: "Edge 126", ip: "115.187.60.22" },
          },
        ],
        logs: [{ time: "2026-07-04T10:05:00Z", event: "লগইন করেছেন" }],
      },
    },
  },
  {
    id: 3,
    name: "User 2",
    email: "user2@demo.com",
    password: "user123",
    role: "Normal",
    status: "active",
    lastLogin: "2026-07-05T21:05:00Z",
    device: { name: "iPhone 15", os: "iOS 18.2", browser: "Safari 18", ip: "42.0.11.90" },
    history: {
      "2026-07-05": {
        attempts: 6,
        success: 4,
        failed: 2,
        inReview: 0,
        logins: [
          { time: "2026-07-05T21:05:00Z", device: { name: "iPhone 15", os: "iOS 18.2", browser: "Safari 18", ip: "42.0.11.90" } },
        ],
        logs: [
          { time: "2026-07-05T21:05:00Z", event: "লগইন করেছেন" },
          { time: "2026-07-05T21:20:00Z", event: "স্ট্যাটাস আপডেট: Failed" },
        ],
      },
      "2026-07-03": {
        attempts: 3,
        success: 2,
        failed: 1,
        inReview: 0,
        logins: [
          { time: "2026-07-03T11:15:00Z", device: { name: "iPhone 15", os: "iOS 18.2", browser: "Safari 18", ip: "42.0.11.90" } },
        ],
        logs: [{ time: "2026-07-03T11:15:00Z", event: "লগইন করেছেন" }],
      },
    },
  },
  {
    id: 4,
    name: "User 3",
    email: "user3@demo.com",
    password: "user123",
    role: "Normal",
    status: "active",
    lastLogin: "2026-07-06T07:48:00Z",
    device: { name: "Galaxy S24", os: "Android 15", browser: "Chrome 126", ip: "180.211.137.4" },
    history: {
      "2026-07-06": {
        attempts: 9,
        success: 7,
        failed: 1,
        inReview: 1,
        logins: [
          { time: "2026-07-06T07:48:00Z", device: { name: "Galaxy S24", os: "Android 15", browser: "Chrome 126", ip: "180.211.137.4" } },
        ],
        logs: [
          { time: "2026-07-06T07:48:00Z", event: "লগইন করেছেন" },
          { time: "2026-07-06T08:02:00Z", event: "স্ট্যাটাস আপডেট: Account Success" },
        ],
      },
      "2026-07-05": {
        attempts: 7,
        success: 6,
        failed: 1,
        inReview: 0,
        logins: [
          { time: "2026-07-05T07:30:00Z", device: { name: "Galaxy S24", os: "Android 15", browser: "Chrome 126", ip: "180.211.137.4" } },
        ],
        logs: [{ time: "2026-07-05T07:30:00Z", event: "লগইন করেছেন" }],
      },
    },
  },
];

// Tracking codes keyed by the 15/16-digit code (or full URL). status: in_review | success | failed
const seedCodes = {
  "1234567890123456": { status: "in_review", stage: 2, updatedAt: "2026-07-06T09:12:00Z" },
  "9876543210987654": { status: "success", stage: 3, updatedAt: "2026-07-05T14:30:00Z" },
  "1111222233334444": { status: "failed", stage: 1, updatedAt: "2026-07-04T18:05:00Z" },
};

const seedStats = { totalUsers: 120, totalSuccess: 450, totalFailed: 32 };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// Best-effort client-side device detection. IP can't be determined without a
// backend, so it's left as "—" for live-captured logins (seed history above
// uses illustrative fake IPs).
function detectDevice() {
  if (typeof navigator === "undefined") return { name: "—", os: "—", browser: "—", ip: "—" };
  const ua = navigator.userAgent;
  let os = "Unknown OS";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iOS/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "Unknown Browser";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";

  return { name: navigator.platform || "—", os, browser, ip: "—" };
}

const emptyDay = () => ({ attempts: 0, success: 0, failed: 0, inReview: 0, logins: [], logs: [] });

// Aggregate totals are always derived from history, never stored separately,
// so the per-day breakdown and the headline numbers can never drift apart.
export function sumHistory(history) {
  return Object.values(history || {}).reduce(
    (acc, day) => {
      acc.logins += day.logins?.length || 0;
      acc.attempts += day.attempts || 0;
      acc.success += day.success || 0;
      acc.failed += day.failed || 0;
      acc.inReview += day.inReview || 0;
      return acc;
    },
    { logins: 0, attempts: 0, success: 0, failed: 0, inReview: 0 }
  );
}

function loadState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function defaultState() {
  return {
    users: seedUsers,
    codes: seedCodes,
    stats: seedStats,
    logs: [
      { id: 1, time: "2026-07-06 09:12", actor: "user1@demo.com", event: "Code submitted", level: "info" },
      { id: 2, time: "2026-07-05 14:30", actor: "system", event: "Account Success on code ...7654", level: "success" },
      { id: 3, time: "2026-07-04 18:05", actor: "system", event: "Failed on code ...4444", level: "error" },
    ],
  };
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    if (loaded) setState({ ...defaultState(), ...loaded });
    try {
      const s = window.localStorage.getItem(SESSION_KEY);
      if (s) setSession(JSON.parse(s));
    } catch (_) {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  useEffect(() => {
    if (!ready) return;
    if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(SESSION_KEY);
  }, [session, ready]);

  // Force-logout a frozen user immediately, even mid-session (e.g. admin freezes
  // them from another tab while their dashboard is open).
  useEffect(() => {
    if (!ready || !session) return;
    const current = state.users.find((u) => u.id === session.id);
    if (!current || current.status === "frozen") {
      try {
        window.localStorage.setItem(FROZEN_NOTICE_KEY, "1");
      } catch (_) {}
      setSession(null);
    }
  }, [ready, session, state.users]);

  // Cross-tab sync so an admin freezing a user in one tab takes effect
  // immediately in any other open tab for that account.
  useEffect(() => {
    function handleStorage(e) {
      if (e.key === STORAGE_KEY) {
        try {
          setState(e.newValue ? { ...defaultState(), ...JSON.parse(e.newValue) } : defaultState());
        } catch (_) {}
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ---- Auth ----
  function login(email, password) {
    const user = state.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!user) return { ok: false, error: "ভুল ইমেইল বা পাসওয়ার্ড।" };
    if (user.status === "frozen") {
      return { ok: false, error: "আপনার অ্যাকাউন্টটি ফ্রিজ করা হয়েছে। এডমিনের সাথে যোগাযোগ করুন।" };
    }
    const now = new Date();
    const dateKey = todayKey();
    const device = detectDevice();
    setState((s) => ({
      ...s,
      users: s.users.map((u) => {
        if (u.id !== user.id) return u;
        const day = u.history?.[dateKey] || emptyDay();
        const updatedDay = {
          ...day,
          logins: [...day.logins, { time: now.toISOString(), device }],
          logs: [...day.logs, { time: now.toISOString(), event: "লগইন করেছেন" }],
        };
        return {
          ...u,
          lastLogin: now.toISOString(),
          device,
          history: { ...u.history, [dateKey]: updatedDay },
        };
      }),
    }));
    const safe = { id: user.id, name: user.name, email: user.email, role: user.role };
    setSession(safe);
    return { ok: true, user: safe };
  }

  // Returns true once and clears the flag — used by the login page to show a
  // one-time notice after a session was force-ended due to freezing.
  function consumeFrozenNotice() {
    try {
      const flagged = window.localStorage.getItem(FROZEN_NOTICE_KEY) === "1";
      if (flagged) window.localStorage.removeItem(FROZEN_NOTICE_KEY);
      return flagged;
    } catch (_) {
      return false;
    }
  }

  function logout() {
    setSession(null);
  }

  // ---- Tracking ----
  function normalizeCode(input) {
    const digits = (input.match(/\d/g) || []).join("");
    return digits;
  }

  function trackCode(input) {
    const code = normalizeCode(input);
    if (code.length < 15 || code.length > 16) {
      return { ok: false, error: "কোডটি ১৫ বা ১৬ ডিজিটের হতে হবে।" };
    }
    const record = state.codes[code];
    if (!record) {
      return {
        ok: true,
        code,
        record: { status: "in_review", stage: 1, updatedAt: new Date().toISOString() },
        isNew: true,
      };
    }
    return { ok: true, code, record };
  }

  // Logs a fresh tracking attempt against today's date for the given user and
  // returns that date's key so the caller can later resolve it (in_review ->
  // success/failed) against the same day even if the resolution completes
  // just after midnight.
  function recordAttempt(userId, status) {
    const dateKey = todayKey();
    const counterKey = status === "in_review" ? "inReview" : status;
    setState((s) => ({
      ...s,
      users: s.users.map((u) => {
        if (u.id !== userId) return u;
        const day = u.history?.[dateKey] || emptyDay();
        const updatedDay = {
          ...day,
          attempts: day.attempts + 1,
          [counterKey]: (day[counterKey] || 0) + 1,
          logs: [
            ...day.logs,
            { time: new Date().toISOString(), event: `কোড ট্র্যাক করা হয়েছে (${STATUS_META[status]?.label || status})` },
          ],
        };
        return { ...u, history: { ...u.history, [dateKey]: updatedDay } };
      }),
    }));
    return dateKey;
  }

  function resolveAttempt(userId, dateKey, toStatus) {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => {
        if (u.id !== userId) return u;
        const day = u.history?.[dateKey];
        if (!day) return u;
        const updatedDay = {
          ...day,
          inReview: Math.max(0, day.inReview - 1),
          [toStatus]: (day[toStatus] || 0) + 1,
          logs: [
            ...day.logs,
            { time: new Date().toISOString(), event: `স্ট্যাটাস আপডেট: ${STATUS_META[toStatus]?.label || toStatus}` },
          ],
        };
        return { ...u, history: { ...u.history, [dateKey]: updatedDay } };
      }),
    }));
  }

  // ---- User management (admin) ----
  function addUser({ name, email, role, password }) {
    const id = Math.max(0, ...state.users.map((u) => u.id)) + 1;
    const user = {
      id,
      name,
      email,
      role,
      status: "active",
      password: password || "user123",
      history: {},
      lastLogin: null,
      device: { name: "—", os: "—", browser: "—", ip: "—" },
    };
    setState((s) => ({ ...s, users: [...s.users, user] }));
    return user;
  }

  function deleteUser(id) {
    setState((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) }));
  }

  function updateUser(id, patch) {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    }));
  }

  function freezeUser(id) {
    updateUser(id, { status: "frozen" });
  }

  function unfreezeUser(id) {
    updateUser(id, { status: "active" });
  }

  const value = {
    ready,
    session,
    users: state.users,
    stats: state.stats,
    logs: state.logs,
    login,
    logout,
    consumeFrozenNotice,
    trackCode,
    recordAttempt,
    resolveAttempt,
    addUser,
    deleteUser,
    updateUser,
    freezeUser,
    unfreezeUser,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export const STATUS_META = {
  in_review: { label: "In Review", color: "amber", icon: "⏳" },
  success: { label: "Account Success", color: "emerald", icon: "✅" },
  failed: { label: "Failed", color: "rose", icon: "❌" },
};
