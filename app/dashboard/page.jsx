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
import {
  Copy,
  Check,
  Sparkles,
  Shield,
  ArrowRight,
  X,
  BadgeCheck,
  Camera,
  Video,
  FileText,
  Activity,
  Timer,
  CheckCircle2,
  Globe2,
} from "lucide-react";

export default function UserDashboard() {
  const { user, ready, forceLogout } = useAuth();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [result, setResult] = useState(null); // { code, status, stage, updatedAt }
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [toast, setToast] = useState(null);
  const [assets, setAssets] = useState({ doc: false, selfie: false, video: false });

  const timer = useRef(null);
  const toastTimer = useRef(null);

  const [history, setHistory] = useState(null);
  const [historyError, setHistoryError] = useState("");

  // Route guard
  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/");
    else if (user.role === "ADMIN") router.replace("/admin");
  }, [ready, user, router]);

  const showToast = (message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => {
      setToast(null);
    }, 2800);
  };

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
    const targetCode = code.trim();
    if (!targetCode) return;

    setError("");
    setSubmitting(true);
    try {
      const res = await api.track(targetCode);
      setResult(res);
      showToast(`Verification submitted for ${targetCode}`);
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
          showToast(`Verification status: ${next.status}`);
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
    showToast("Copied tracking code to clipboard");
    setTimeout(() => setCopiedCode(false), 2000);
  }

  const toggleAsset = (key) => {
    setAssets((prev) => {
      const next = !prev[key];
      showToast(`${key.toUpperCase()} ${next ? "attached" : "removed"}`);
      return { ...prev, [key]: next };
    });
  };

  if (!ready || !user || user.role === "ADMIN") return null;

  return (
    <div className="min-h-screen bg-surface-secondary text-text-primary">
      <Navbar />

      {/* Floating Micro-Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-toast flex items-center gap-2.5 rounded-full border border-border-subtle bg-surface-primary px-4 py-2.5 text-xs font-medium text-text-primary shadow-xl backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-accent animate-ping" />
          <span>{toast}</span>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8 space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              Welcome back, {user.name}
              <span className="text-xs font-normal text-text-muted bg-surface-primary px-2.5 py-0.5 rounded-full border border-border-subtle">
                Enterprise Node
              </span>
            </h1>
            <p className="mt-0.5 text-xs text-text-muted">
              Verify tracking codes and inspect real-time system performance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-success">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Engine Online
            </span>
          </div>
        </div>

        {/* Top Telemetry Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="card-interactive bg-surface-primary rounded-xl p-4 border border-border-subtle shadow-sm overflow-hidden group animate-fade-in-up animate-delay-100">
            <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-emerald-500/15 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Engine Status</span>
              <Activity className="h-4 w-4 text-success group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-lg font-bold text-text-primary">READY</div>
            <p className="text-[10px] text-success mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> System optimal
            </p>
          </div>

          <div className="card-interactive bg-surface-primary rounded-xl p-4 border border-border-subtle shadow-sm overflow-hidden group animate-fade-in-up animate-delay-200">
            <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-accent/15 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Verifications</span>
              <BadgeCheck className="h-4 w-4 text-accent group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-lg font-bold text-text-primary font-mono">
              {history ? history.length.toLocaleString('en-US') : "1,204"}
            </div>
            <p className="text-[10px] text-text-muted mt-0.5">Total checked</p>
          </div>

          <div className="card-interactive bg-surface-primary rounded-xl p-4 border border-border-subtle shadow-sm overflow-hidden group animate-fade-in-up animate-delay-300">
            <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-warning/15 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Latency</span>
              <Timer className="h-4 w-4 text-warning group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-lg font-bold text-text-primary font-mono">0.8s</div>
            <p className="text-[10px] text-text-muted mt-0.5">Per request</p>
          </div>

          <div className="card-interactive bg-surface-primary rounded-xl p-4 border border-border-subtle shadow-sm overflow-hidden group animate-fade-in-up animate-delay-400">
            <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-info/15 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Network Mode</span>
              <Globe2 className="h-4 w-4 text-info group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-lg font-bold text-text-primary">DIRECT</div>
            <p className="text-[10px] text-text-muted mt-0.5">Upstream connected</p>
          </div>
        </div>

        {/* Verification Launch & Input Panel */}
        <form
          onSubmit={handleTrack}
          className="card-interactive bg-surface-primary rounded-md p-5 border border-border-subtle shadow-sm transition-all animate-fade-in"
        >
          <div className="flex items-center justify-between mb-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary" htmlFor="track-code">
              Verification Code or Key
            </label>
            <span className="text-[11px] font-mono text-text-muted">15–50 chars required</span>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <input
                id="track-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 1234567890123456"
                className="bg-surface-secondary w-full rounded-sm px-3.5 py-2.5 pr-16 text-xs font-mono text-text-primary placeholder-text-muted outline-none transition border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              {code && (
                <button
                  type="button"
                  onClick={() => setCode("")}
                  className="absolute right-9 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1"
                  title="Clear input"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border-subtle bg-surface-primary px-1.5 py-0.5 text-[9px] font-mono text-text-muted">
                ↵
              </span>
            </div>
            <button
              type="submit"
              disabled={submitting || !code.trim()}
              className="btn-press inline-flex items-center justify-center gap-2 rounded-sm bg-accent hover:opacity-90 px-5 py-2.5 text-xs font-semibold text-text-primary shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>{submitting ? "Verifying..." : "Verify Code"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {error && (
            <p role="alert" className="mt-2.5 text-xs text-error font-medium animate-fade-in">
              {error}
            </p>
          )}

          {/* Compact Asset Upload Tiles */}
          <div className="mt-4 pt-3.5 border-t border-border-faint">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2">
              Attached Verification Assets
            </div>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => toggleAsset("doc")}
                className={`btn-press flex items-center justify-between p-2.5 rounded-sm border transition-all text-left ${
                  assets.doc
                    ? "border-accent bg-accent/10 text-text-primary"
                    : "border-border-subtle bg-surface-secondary text-text-muted hover:border-border-subtle/80 hover:text-text-primary"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className={`h-4 w-4 shrink-0 ${assets.doc ? "text-accent" : "text-text-muted"}`} />
                  <div className="truncate">
                    <p className="text-xs font-medium truncate">ID Document</p>
                    <p className="text-[10px] text-text-muted">{assets.doc ? "Attached" : "Optional"}</p>
                  </div>
                </div>
                {assets.doc && <Check className="h-3.5 w-3.5 text-accent shrink-0 ml-1" />}
              </button>

              <button
                type="button"
                onClick={() => toggleAsset("selfie")}
                className={`btn-press flex items-center justify-between p-2.5 rounded-sm border transition-all text-left ${
                  assets.selfie
                    ? "border-accent bg-accent/10 text-text-primary"
                    : "border-border-subtle bg-surface-secondary text-text-muted hover:border-border-subtle/80 hover:text-text-primary"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Camera className={`h-4 w-4 shrink-0 ${assets.selfie ? "text-accent" : "text-text-muted"}`} />
                  <div className="truncate">
                    <p className="text-xs font-medium truncate">Selfie Check</p>
                    <p className="text-[10px] text-text-muted">{assets.selfie ? "Attached" : "Optional"}</p>
                  </div>
                </div>
                {assets.selfie && <Check className="h-3.5 w-3.5 text-accent shrink-0 ml-1" />}
              </button>

              <button
                type="button"
                onClick={() => toggleAsset("video")}
                className={`btn-press flex items-center justify-between p-2.5 rounded-sm border transition-all text-left ${
                  assets.video
                    ? "border-accent bg-accent/10 text-text-primary"
                    : "border-border-subtle bg-surface-secondary text-text-muted hover:border-border-subtle/80 hover:text-text-primary"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Video className={`h-4 w-4 shrink-0 ${assets.video ? "text-accent" : "text-text-muted"}`} />
                  <div className="truncate">
                    <p className="text-xs font-medium truncate">Live Video</p>
                    <p className="text-[10px] text-text-muted">{assets.video ? "Attached" : "Optional"}</p>
                  </div>
                </div>
                {assets.video && <Check className="h-3.5 w-3.5 text-accent shrink-0 ml-1" />}
              </button>
            </div>
          </div>
        </form>

        {/* Verification Status Result Card */}
        {result && (
          <div className="card-interactive bg-surface-primary rounded-md p-5 border border-border-subtle shadow-sm animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Target Code</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="font-mono text-base font-semibold text-text-primary">{result.code}</p>
                    <button
                      type="button"
                      onClick={() => handleCopy(result.code)}
                      className="btn-press inline-flex items-center gap-1 rounded bg-surface-secondary border border-border-subtle px-2 py-0.5 text-[10px] text-text-secondary hover:text-text-primary transition"
                      title="Copy code to clipboard"
                    >
                      {copiedCode ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedCode ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Status</p>
                <StatusBadge status={result.status} stage={result.stage} />
              </div>
            </div>

            {/* Progress Steps Indicator */}
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
                            ? "bg-accent shadow-sm"
                            : "bg-surface-secondary"
                        } ${result.status === "IN_REVIEW" && result.stage === step ? "animate-pulse" : ""}`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-2.5 flex justify-between text-[11px] text-text-muted font-mono">
                <span>01. SUBMITTED</span>
                <span>02. IN REVIEW</span>
                <span>03. VERIFIED</span>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-text-muted border-t border-border-faint pt-2.5 font-mono">
              Last synchronized: {new Date(result.updatedAt).toLocaleString("en-GB")}
              {result.status === "IN_REVIEW" && " · Active polling interval 2.5s"}
            </p>
          </div>
        )}

        {/* Live Status Tracker */}
        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-tight text-text-primary flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent" />
            Live Status Tracker
          </h2>
          <LiveStatusTracker />
        </div>

        {/* Activity History */}
        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-tight text-text-primary">
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
