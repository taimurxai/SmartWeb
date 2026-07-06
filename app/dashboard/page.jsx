"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import UserActivityDashboard from "@/components/UserActivityDashboard";

export default function UserDashboard() {
  const { session, ready, users, trackCode, recordAttempt, resolveAttempt } = useStore();
  const router = useRouter();
  const currentUser = useMemo(() => users.find((u) => u.id === session?.id) || null, [users, session]);

  const [code, setCode] = useState("");
  const [result, setResult] = useState(null); // { code, status, stage, updatedAt }
  const [error, setError] = useState("");
  const timer = useRef(null);

  // Route guard
  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/");
    else if (session.role === "Admin") router.replace("/admin");
  }, [ready, session, router]);

  useEffect(() => () => clearInterval(timer.current), []);

  function handleTrack(e) {
    e.preventDefault();
    setError("");
    const res = trackCode(code);
    if (!res.ok) {
      setError(res.error);
      setResult(null);
      return;
    }
    const initial = { code: res.code, ...res.record };
    const dateKey = recordAttempt(session.id, initial.status);
    setResult(initial);
    startLiveSimulation(initial, dateKey);
  }

  // Simulates a real-time status stream (In Review 1 -> 2 -> success/failed).
  // Swap this for a websocket / polling call to your backend.
  function startLiveSimulation(initial, dateKey) {
    clearInterval(timer.current);
    if (initial.status !== "in_review") return;
    let stage = initial.stage || 1;
    timer.current = setInterval(() => {
      stage += 1;
      if (stage <= 3) {
        setResult((r) => (r ? { ...r, stage, updatedAt: new Date().toISOString() } : r));
      } else {
        const finalStatus = Math.random() > 0.25 ? "success" : "failed";
        setResult((r) =>
          r ? { ...r, status: finalStatus, updatedAt: new Date().toISOString() } : r
        );
        resolveAttempt(session.id, dateKey, finalStatus);
        clearInterval(timer.current);
      }
    }, 2500);
  }

  if (!ready || !session || session.role === "Admin") return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            স্বাগতম, {session.name} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            আপনার কোড বা লিংক দিন এবং রিয়েল-টাইম স্ট্যাটাস ট্র্যাক করুন।
          </p>
        </div>

        {/* Code input */}
        <form
          onSubmit={handleTrack}
          className="rounded-2xl border border-white/10 bg-navy-900/60 p-6 shadow-xl backdrop-blur-xl"
        >
          <label className="mb-2 block text-sm font-medium text-slate-300">
            URL বা ১৫/১৬ ডিজিটের কোড দিন
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. 1234 5678 9012 3456"
              className="flex-1 rounded-xl border border-white/10 bg-navy-950/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
            />
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:from-violet-500 hover:to-blue-500"
            >
              Verify &amp; Track
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
          <p className="mt-3 text-xs text-slate-500">
            ডেমো কোড: 1234567890123456 (In Review), 9876543210987654 (Success), 1111222233334444 (Failed)
          </p>
        </form>

        {/* Status card */}
        {result && (
          <div className="mt-6 animate-[fadeIn_.3s_ease] rounded-2xl border border-white/10 bg-navy-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">ট্র্যাকিং কোড</p>
                <p className="mt-1 font-mono text-lg text-white">{result.code}</p>
              </div>
              <div className="text-right">
                <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">বর্তমান স্ট্যাটাস</p>
                <StatusBadge status={result.status} stage={result.stage} />
              </div>
            </div>

            {/* Progress steps */}
            <div className="mt-6">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => {
                  const done =
                    result.status === "success" ||
                    (result.status === "in_review" && result.stage >= step);
                  const failed = result.status === "failed" && step >= (result.stage || 1);
                  return (
                    <div key={step} className="flex flex-1 items-center gap-2">
                      <div
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          failed
                            ? "bg-rose-500/60"
                            : done
                            ? "bg-gradient-to-r from-violet-500 to-blue-500"
                            : "bg-navy-700"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Submitted</span>
                <span>In Review</span>
                <span>Result</span>
              </div>
            </div>

            <p className="mt-5 text-xs text-slate-500">
              সর্বশেষ আপডেট: {new Date(result.updatedAt).toLocaleString("en-GB")}
              {result.status === "in_review" && " · লাইভ আপডেট হচ্ছে..."}
            </p>
          </div>
        )}

        {/* Personal summary + date-wise history — scoped to this account only */}
        {currentUser && (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-white">আপনার অ্যাক্টিভিটি সামারি</h2>
            <UserActivityDashboard history={currentUser.history} />
          </div>
        )}
      </main>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
