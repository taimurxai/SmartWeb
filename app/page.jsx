"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, X, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { login, user, ready, consumeNotice } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  function fillDemo(e, p) {
    setEmail(e);
    setPassword(p);
  }

  return (
    <main className="relative flex flex-col min-h-screen items-center justify-center px-4 py-12 pb-24 overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-success/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animate-delay-200" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-info/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animate-delay-400" />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand Header */}
        <div className="mb-6 text-center animate-fade-in-up">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-accent text-surface-primary font-bold text-xl shadow-lg transition-transform hover:scale-105 duration-300">
            D
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Dashboard Portal</h1>
          <p className="mt-1 text-xs text-text-muted">Sign in to access your enterprise telemetry dashboard</p>
        </div>

        {/* Card with ambient glow and floating effect */}
        <div className="relative rounded-xl border border-border-subtle bg-surface-primary/90 backdrop-blur-xl p-6 shadow-2xl overflow-hidden animate-fade-in-up animate-delay-100 animate-float">
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/20 blur-2xl" />

          <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
            <div className="group">
              <label className="mb-1.5 block text-xs font-medium text-text-secondary transition-colors group-focus-within:text-accent" htmlFor="login-email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted transition-colors group-focus-within:text-accent" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-sm border border-border-subtle bg-surface-secondary/50 py-2.5 pl-9 pr-8 text-xs font-mono text-text-primary placeholder-text-muted outline-none transition-all duration-300 focus:border-accent focus:ring-4 focus:ring-accent/10 focus:bg-surface-primary"
                />
                {email && (
                  <button
                    type="button"
                    onClick={() => setEmail("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
                    title="Clear email"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="group">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-text-secondary transition-colors group-focus-within:text-accent" htmlFor="login-password">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted transition-colors group-focus-within:text-accent" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-sm border border-border-subtle bg-surface-secondary/50 py-2.5 pl-9 pr-9 text-xs text-text-primary placeholder-text-muted outline-none transition-all duration-300 focus:border-accent focus:ring-4 focus:ring-accent/10 focus:bg-surface-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 transition"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-sm border border-error/30 bg-error/10 px-3 py-2 text-xs font-medium text-error animate-fade-in"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-error" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-press button-primary w-full shadow-lg hover:shadow-xl hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-300 mt-2"
            >
              <span>{loading ? "Authenticating..." : "Sign In"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
