const isProd = process.env.NODE_ENV === "production";

// Next.js dev mode's hot-reload bundles rely on eval(), which a strict CSP
// blocks outright (silently killing all client JS, no console error visible
// beyond a CSP violation) — so 'unsafe-eval' is only added outside production,
// where Next's build output never uses eval().
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    // connect-src/frame-src widened for the Firebase client SDK (Auth,
    // Firestore, Realtime Database, Storage, Analytics) — without these the
    // SDK initializes fine but every network call it makes is silently
    // dropped by the CSP.
    value: `default-src 'self'; script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://*.googleapis.com https://*.firebasedatabase.app wss://*.firebasedatabase.app https://*.google-analytics.com https://*.analytics.google.com; frame-src https://*.firebaseapp.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,
  },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
