function qs(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  return new URLSearchParams(clean).toString();
}

async function request(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || "একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    error.status = res.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/auth/me"),

  track: (input) => request("/api/track", { method: "POST", body: JSON.stringify({ input }) }),
  trackStatus: (code) => request(`/api/track/${encodeURIComponent(code)}`),

  dashboardHistory: (params) => request(`/api/dashboard/history?${qs(params)}`),

  adminStats: () => request("/api/admin/stats"),
  adminUsers: (params) => request(`/api/admin/users?${qs(params)}`),
  adminAddUser: (data) => request("/api/admin/users", { method: "POST", body: JSON.stringify(data) }),
  adminUpdateUser: (id, data) =>
    request(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  adminDeleteUser: (id) => request(`/api/admin/users/${id}`, { method: "DELETE" }),
  adminFreezeUser: (id) => request(`/api/admin/users/${id}/freeze`, { method: "POST" }),
  adminUnfreezeUser: (id) => request(`/api/admin/users/${id}/unfreeze`, { method: "POST" }),
  adminUserHistory: (id, params) => request(`/api/admin/users/${id}/history?${qs(params)}`),
  adminRecords: (params) => request(`/api/admin/records?${qs(params)}`),
  adminLogs: (params) => request(`/api/admin/logs?${qs(params)}`),
};
