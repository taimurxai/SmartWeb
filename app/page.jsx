"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

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
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center animate-fade-in-up">
          <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-blue-600 shadow-sm text-white font-bold text-lg">
            D
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Dashboard Portal</h1>
          <p className="mt-1 text-xs text-slate-400">Sign in to access your enterprise dashboard</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-800/90 bg-slate-900/80 p-6 shadow-card backdrop-blur-md transition-all animate-fade-in-up"
        >
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-slate-300" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-lg border border-slate-800 bg-slate-950/70 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-medium text-slate-300" htmlFor="login-password">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-800 bg-slate-950/70 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        {process.env.NODE_ENV !== "production" && (
          <p className="mt-4 text-center text-[11px] text-slate-500">
            Demo Admin: <span className="font-mono text-slate-400">admin@demo.com</span> / <span className="font-mono text-slate-400">admin123</span>
          </p>
        )}
      </div>
    </main>
  );
}
