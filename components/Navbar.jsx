"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LogOut, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface-primary/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-sm bg-accent text-surface-primary font-bold text-sm shadow-sm transition-transform hover:scale-105">
            D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-text-primary">AgeSmart Verifier</span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-text-primary border border-accent/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Enterprise
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-text-primary leading-tight">{user?.name}</p>
            <p className="text-[10px] text-text-muted">{user?.email}</p>
          </div>
          <div
            aria-hidden="true"
            className="grid h-7 w-7 place-items-center rounded-full border border-border-subtle bg-surface-secondary text-xs font-semibold text-text-primary shadow-inner"
          >
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <button
            onClick={handleLogout}
            className="btn-press inline-flex items-center gap-1.5 rounded-sm border border-border-subtle bg-surface-secondary px-2.5 py-1.5 text-xs font-medium text-text-secondary transition hover:border-error/40 hover:text-error"
          >
            <LogOut className="h-3.5 w-3.5 text-text-muted group-hover:text-error" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
