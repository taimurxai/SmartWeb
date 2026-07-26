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
    <header className="sticky top-0 z-30 border-b border-white/5 bg-navy-900/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-glow">
            <span className="text-lg font-black text-white">T</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">Trackr</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <div
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-full bg-navy-700 text-sm font-semibold text-violet-300"
          >
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
