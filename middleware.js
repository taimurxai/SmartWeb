import { NextResponse } from "next/server";

const SESSION_COOKIE = "trackr_session";

// UX-only guard: middleware runs on the Edge runtime and can't reach Prisma,
// so it can only check whether a session cookie exists, not whether it's
// still valid, unexpired, or belongs to a non-frozen user. The real
// authorization boundary is every API route re-checking the session against
// the database on each request (see lib/rbac.js) — never trust this redirect
// alone for anything security-sensitive.
export function middleware(request) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
