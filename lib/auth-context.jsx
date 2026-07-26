"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.me();
      setUser(user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, [refresh]);

  async function login(email, password) {
    const { user } = await api.login(email, password);
    setUser(user);
    return user;
  }

  async function logout() {
    await api.logout().catch(() => {});
    setUser(null);
  }

  // Called by any page when a protected API call comes back 401/403 mid-session
  // (e.g. an admin froze this account, or the session expired) — clears local
  // state and surfaces a one-time message on the next login screen.
  function forceLogout(message) {
    setUser(null);
    setNotice(message);
  }

  function consumeNotice() {
    if (!notice) return "";
    const n = notice;
    setNotice("");
    return n;
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, refresh, forceLogout, consumeNotice }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function isAuthError(err) {
  return err?.status === 401 || err?.status === 403;
}
