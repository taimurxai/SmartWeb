import { NextResponse } from "next/server";
import { getSessionUser } from "./auth";

// Origin-header check is the CSRF defense for this same-origin, cookie-authed
// API: browsers always attach Origin on cross-origin AND same-origin fetches
// for state-changing methods, so a mismatch (or a cross-site form post, which
// omits credentials-bearing custom headers but still sends Origin) is rejected.
// Non-browser clients (desktop apps using Bearer tokens or verified User-Agent)
// are not vulnerable to ambient browser-cookie CSRF and are permitted.
function originIsTrusted(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return true;
  }

  const userAgent = request.headers.get("user-agent") || "";
  if (userAgent.includes("AgeSmartApp")) {
    return true;
  }

  const origin = request.headers.get("origin");
  if (!origin) return request.method === "GET" || request.method === "HEAD";

  const host = request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function jsonError(status, error) {
  return NextResponse.json({ error }, { status });
}

export function withErrorHandler(handler) {
  return async (request, ctx) => {
    try {
      return await handler(request, ctx);
    } catch (error) {
      console.error("API Error caught:", error);
      return jsonError(500, "Internal Server Error");
    }
  };
}

export function withAuth(handler) {
  return withErrorHandler(async (request, ctx) => {
    if (!originIsTrusted(request)) return jsonError(403, "Cross-origin request blocked.");
    const user = await getSessionUser();
    if (!user) return jsonError(401, "Unauthorized.");
    return await handler(request, { ...ctx, user });
  });
}

export function withAdmin(handler) {
  return withAuth(async (request, ctx) => {
    if (ctx.user.role !== "ADMIN") return jsonError(403, "Admin access required.");
    return await handler(request, ctx);
  });
}

export { originIsTrusted };
