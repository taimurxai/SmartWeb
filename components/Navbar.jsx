"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-navy-900/70 backdrop-blur-xl transition-all shadow-sm shadow-black/20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-glow-lg transition-transform hover:scale-105">
            <span className="text-xl font-black text-white">T</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Trackr</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <div
            aria-hidden="true"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-navy-800 text-sm font-semibold text-violet-300 shadow-inner"
          >
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-all active:scale-95 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 hover:shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
