"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const { login, session, ready, consumeFrozenNotice } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && session) {
      router.replace(session.role === "Admin" ? "/admin" : "/dashboard");
    }
  }, [ready, session, router]);

  useEffect(() => {
    if (ready && consumeFrozenNotice()) {
      setError("আপনার অ্যাকাউন্টটি ফ্রিজ করা হয়েছে। এডমিনের সাথে যোগাযোগ করুন।");
    }
  }, [ready]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = login(email, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.replace(res.user.role === "Admin" ? "/admin" : "/dashboard");
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
          className="rounded-2xl border border-white/10 bg-navy-900/60 p-7 shadow-2xl backdrop-blur-xl"
        >
          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-300">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-white/10 bg-navy-950/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-300">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-navy-950/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
            />
          </label>

          {error && (
            <p className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:from-violet-500 hover:to-blue-500 disabled:opacity-60"
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
