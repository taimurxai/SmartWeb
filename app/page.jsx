"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login, user, ready, consumeNotice } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) {
      router.replace(user.role === "ADMIN" ? "/admin" : "/dashboard");
    }
  }, [ready, user, router]);

  useEffect(() => {
    if (!ready) return;
    const notice = consumeNotice();
    if (notice) setError(notice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedIn = await login(email, password);
      router.replace(loggedIn.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-glow">
            <span className="text-2xl font-black text-white">T</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Trackr</h1>
          <p className="mt-1 text-sm text-slate-400">সাইন ইন করে আপনার ড্যাশবোর্ডে প্রবেশ করুন</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="group rounded-2xl border border-white/10 bg-navy-900/60 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-violet-500/20 hover:shadow-glow-lg"
        >
          <label className="mb-4 block" htmlFor="login-email">
            <span className="mb-1.5 block text-sm font-semibold text-slate-300">Email</span>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-white/10 bg-navy-950/60 px-5 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-violet-500/60 focus:bg-navy-900/80 focus:ring-4 focus:ring-violet-500/10 focus:shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]"
            />
          </label>

          <label className="mb-6 block" htmlFor="login-password">
            <span className="mb-1.5 block text-sm font-semibold text-slate-300">Password</span>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-navy-950/60 px-5 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-violet-500/60 focus:bg-navy-900/80 focus:ring-4 focus:ring-violet-500/10 focus:shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]"
            />
          </label>

          {error && (
            <div
              role="alert"
              className="mb-6 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 shadow-inner"
            >
              <span className="text-lg">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3.5 text-sm font-bold tracking-wide text-white shadow-glow transition-all active:scale-95 hover:from-violet-500 hover:to-blue-500 hover:shadow-glow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-5 rounded-xl border border-white/5 bg-navy-900/40 p-4 text-xs text-slate-400">
          <p className="mb-1 font-semibold text-slate-300">ডেমো লগইন:</p>
          <p>Admin — admin@demo.com / admin123</p>
          <p>User — user1@demo.com / user123</p>
        </div>
      </div>
    </main>
  );
}
