"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white font-semibold text-sm shadow-sm">
            D
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">Dashboard</span>
          <span className="hidden sm:inline-block rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-400 border border-blue-500/20">
            Enterprise
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-slate-200">{user?.name}</p>
            <p className="text-[11px] text-slate-400">{user?.email}</p>
          </div>
          <div
            aria-hidden="true"
            className="grid h-7 w-7 place-items-center rounded-full border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300"
          >
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
