"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, isAuthError } from "@/lib/auth-context";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import UserActivityDashboard from "@/components/UserActivityDashboard";
import { LoadingState, ErrorState } from "@/components/DataState";
import LiveStatusTracker from "@/components/LiveStatusTracker";

export default function UserDashboard() {
  const { user, ready, forceLogout } = useAuth();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [result, setResult] = useState(null); // { code, status, stage, updatedAt }
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef(null);

  const [history, setHistory] = useState(null);
  const [historyError, setHistoryError] = useState("");

  // Route guard — UX only. The real boundary is every API call re-checking
  // the session server-side (see lib/rbac.js).
  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/");
    else if (user.role === "ADMIN") router.replace("/admin");
  }, [ready, user, router]);

  const loadHistory = useCallback(async () => {
    try {
      const { history } = await api.dashboardHistory({});
      setHistory(history);
      setHistoryError("");
    } catch (err) {
      if (isAuthError(err)) {
        forceLogout("Session expired. Please log in again.");
        return;
      }
      setHistoryError(err.message);
    }
  }, [forceLogout]);

  useEffect(() => {
    if (ready && user && user.role !== "ADMIN") loadHistory();
  }, [ready, user, loadHistory]);

  useEffect(() => () => clearInterval(timer.current), []);

  async function handleTrack(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.track(code);
      setResult(res);
      startPolling(res);
    } catch (err) {
      if (isAuthError(err)) {
        forceLogout("Session expired. Please log in again.");
        return;
      }
      setError(err.message);
      setResult(null);
    } finally {
      setSubmitting(false);
    }
  }

  // Polls the server for the same code every 2.5s while it's in review. The
  // server derives status/stage from elapsed time (lib/tracking.js), so this
  // is just reading real state, not driving a client-side simulation.
  function startPolling(initial) {
    clearInterval(timer.current);
    if (initial.status !== "IN_REVIEW") return;
    timer.current = setInterval(async () => {
      try {
        const next = await api.trackStatus(initial.code);
        setResult(next);
        if (next.status !== "IN_REVIEW") {
          clearInterval(timer.current);
          loadHistory();
        }
      } catch {
        clearInterval(timer.current);
      }
    }, 2500);
  }

  if (!ready || !user || user.role === "ADMIN") return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Welcome back, {user.name} 👋</h1>
          <p className="mt-2 text-sm font-medium text-slate-400">
            Enter your tracking URL or code to track real-time status.
          </p>
        </div>

        {/* Code input */}
        <form
          onSubmit={handleTrack}
          className="rounded-2xl border border-white/10 bg-navy-900/60 p-8 shadow-xl backdrop-blur-xl transition-all hover:border-violet-500/30 animate-fade-in-up animate-delay-100"
        >
          <label className="mb-3 block text-sm font-semibold tracking-wide text-slate-300 uppercase" htmlFor="track-code">
            Enter tracking URL or 15/16-digit code
          </label>
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              id="track-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. 1234 5678 9012 3456"
              className="flex-1 rounded-xl border border-white/10 bg-navy-950/60 px-5 py-3.5 text-sm font-medium text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-violet-500/60 focus:bg-navy-900/80 focus:ring-2 focus:ring-violet-500/20 focus:shadow-glow-inner"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-3.5 text-sm font-bold tracking-wide text-white shadow-glow transition-all duration-300 active:scale-95 hover:from-violet-500 hover:to-blue-500 hover:shadow-glow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Verifying..." : "Verify & Track"}
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-4 text-sm font-medium text-rose-300">
              {error}
            </p>
          )}
          <p className="mt-4 text-xs font-medium text-slate-500">
            Demo codes: 1234567890123456 (In Review), 9876543210987654 (Success), 1111222233334444 (Failed)
          </p>
        </form>

        {/* Status card */}
        {result && (
          <div className="mt-8 animate-[fadeIn_.4s_ease-out] rounded-2xl border border-white/10 bg-navy-900/60 p-8 shadow-xl backdrop-blur-xl animate-fade-in-up animate-delay-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tracking Code</p>
                <p className="mt-1.5 font-mono text-xl font-medium text-white">{result.code}</p>
              </div>
              <div className="text-right">
                <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Current Status</p>
                <StatusBadge status={result.status} stage={result.stage} />
              </div>
            </div>

            {/* Progress steps */}
            <div className="mt-6">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => {
                  const done =
                    result.status === "SUCCESS" || (result.status === "IN_REVIEW" && result.stage >= step);
                  const failed = result.status === "FAILED" && step >= (result.stage || 1);
                  return (
                    <div key={step} className="flex flex-1 items-center gap-2">
                      <div
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          failed
                            ? "bg-rose-500/60 shadow-[0_0_10px_-2px_rgba(244,63,94,0.5)]"
                            : done
                            ? "bg-gradient-to-r from-violet-500 to-blue-500 shadow-[0_0_10px_-2px_rgba(139,92,246,0.5)]"
                            : "bg-navy-700"
                        } ${result.status === "IN_REVIEW" && result.stage === step ? "animate-pulse" : ""}`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex justify-between text-xs font-medium text-slate-500">
                <span>Submitted</span>
                <span>In Review</span>
                <span>Result</span>
              </div>
            </div>

            <p className="mt-6 text-xs font-medium text-slate-500 border-t border-white/5 pt-4">
              Last updated: {new Date(result.updatedAt).toLocaleString("en-GB")}
              {result.status === "IN_REVIEW" && " · Live updating..."}
            </p>
          </div>
        )}

        {/* Separate from the form above — that one creates/polls a record via
            the Prisma-backed API. This reads a Firestore doc at
            submissions/{code} directly via onSnapshot, so status changes
            show up instantly with no polling interval. */}
        <div className="mt-12 animate-fade-in-up animate-delay-200">
          <h2 className="mb-5 text-xl font-bold tracking-tight text-white font-display">Live Status Tracker (Firestore)</h2>
          <LiveStatusTracker />
        </div>

        {/* Personal summary + date-wise history — scoped to this account only */}
        <div className="mt-12 animate-fade-in-up animate-delay-300">
          <h2 className="mb-5 text-xl font-bold tracking-tight text-white font-display">Your Activity Overview</h2>
          {historyError && <ErrorState message={historyError} onRetry={loadHistory} />}
          {!history && !historyError && <LoadingState />}
          {history && <UserActivityDashboard history={history} />}
        </div>
      </main>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
