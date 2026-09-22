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
import { Copy, Check, Sparkles, Shield, ArrowRight } from "lucide-react";

export default function UserDashboard() {
  const { user, ready, forceLogout } = useAuth();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [result, setResult] = useState(null); // { code, status, stage, updatedAt }
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const timer = useRef(null);

  const [history, setHistory] = useState(null);
  const [historyError, setHistoryError] = useState("");

  // Route guard — UX only. Real boundary is every API call re-checking session server-side.
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

  function handleCopy(text) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  if (!ready || !user || user.role === "ADMIN") return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Welcome back, {user.name}
              <span className="text-xs font-normal text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                Enterprise User
              </span>
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">
              Verify tracking codes and inspect real-time system performance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Engine Online
            </span>
          </div>
        </div>

        {/* Code input form */}
        <form
          onSubmit={handleTrack}
          className="glass-card rounded-xl p-5 border border-white/5 shadow-card transition-all animate-fade-in"
        >
          <div className="flex items-center justify-between mb-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300" htmlFor="track-code">
              Verification Code or Key
            </label>
            <span className="text-[11px] font-mono text-slate-500">15–50 chars required</span>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <input
                id="track-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 1234567890123456"
                className="glass-input w-full rounded-lg px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{submitting ? "Verifying..." : "Verify Code"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {error && (
            <p role="alert" className="mt-2.5 text-xs text-rose-400 font-medium">
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-white/5 text-[11px] text-slate-400">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-brand-400" /> Quick Samples:
            </span>
            <button
              type="button"
              onClick={() => setCode("1234567890123456")}
              className="rounded border border-white/5 bg-white/5 px-2.5 py-1 font-mono text-slate-300 hover:border-brand-500/40 hover:text-brand-300 transition"
            >
              1234567890123456 (In Review)
            </button>
            <button
              type="button"
              onClick={() => setCode("9876543210987654")}
              className="rounded border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 font-mono text-emerald-400 hover:border-emerald-500/40 hover:text-emerald-300 transition"
            >
              9876543210987654 (Success)
            </button>
            <button
              type="button"
              onClick={() => setCode("1111222233334444")}
              className="rounded border border-rose-500/20 bg-rose-500/5 px-2.5 py-1 font-mono text-rose-400 hover:border-rose-500/40 hover:text-rose-300 transition"
            >
              1111222233334444 (Failed)
            </button>
          </div>
        </form>

        {/* Status result card */}
        {result && (
          <div className="mt-5 glass-card rounded-xl p-5 border border-white/5 shadow-card animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tracking Code</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="font-mono text-base font-semibold text-white">{result.code}</p>
                    <button
                      type="button"
                      onClick={() => handleCopy(result.code)}
                      className="inline-flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400 hover:bg-white/10 hover:text-white transition"
                    >
                      {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedCode ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</p>
                <StatusBadge status={result.status} stage={result.stage} />
              </div>
            </div>

            {/* Progress steps */}
            <div className="mt-5">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => {
                  const done =
                    result.status === "SUCCESS" || (result.status === "IN_REVIEW" && result.stage >= step);
                  const failed = result.status === "FAILED" && step >= (result.stage || 1);
                  return (
                    <div key={step} className="flex-1">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          failed
                            ? "bg-rose-500"
                            : done
                            ? "bg-brand-500 shadow-glow"
                            : "bg-white/5"
                        } ${result.status === "IN_REVIEW" && result.stage === step ? "animate-pulse" : ""}`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-2.5 flex justify-between text-[11px] text-slate-400 font-mono">
                <span>01. SUBMITTED</span>
                <span>02. IN REVIEW</span>
                <span>03. VERIFIED</span>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-500 border-t border-white/5 pt-2.5 font-mono">
              Last synchronized: {new Date(result.updatedAt).toLocaleString("en-GB")}
              {result.status === "IN_REVIEW" && " · Active polling interval 2.5s"}
            </p>
          </div>
        )}

        {/* Live Status Tracker */}
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold tracking-tight text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-400" />
            Live Status Tracker
          </h2>
          <LiveStatusTracker />
        </div>

        {/* Activity Overview */}
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold tracking-tight text-white">
            Personal Activity & Verification History
          </h2>
          {historyError && <ErrorState message={historyError} onRetry={loadHistory} />}
          {!history && !historyError && <LoadingState label="Loading activity logs..." />}
          {history && <UserActivityDashboard history={history} />}
        </div>
      </main>
    </div>
  );
}
