import { prisma } from "../db";
import { resolveTrackingStatus } from "../tracking";

function dateKey(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function emptyDay() {
  return { attempts: 0, success: 0, failed: 0, inReview: 0, suspicious: 0, liveChat: 0, logins: [], logs: [] };
}

// Builds the same per-day { attempts, success, failed, inReview, logins, logs }
// shape the UI already expects, entirely derived from LoginEvent and
// TrackingSubmission rows for one user — there's no stored per-day counter
// that could drift from the raw events.
export async function getUserDailyHistory(userId, { from, to } = {}) {
  const hasRange = Boolean(from || to);
  const range = {};
  if (from) range.gte = new Date(from);
  if (to) range.lte = new Date(to);

  const [logins, submissions] = await Promise.all([
    prisma.loginEvent.findMany({
      where: { userId, success: true, ...(hasRange ? { time: range } : {}) },
      orderBy: { time: "asc" },
    }),
    prisma.trackingSubmission.findMany({
      where: { userId, ...(hasRange ? { createdAt: range } : {}) },
      include: { trackingCode: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const days = {};
  function ensureDay(key) {
    if (!days[key]) days[key] = emptyDay();
    return days[key];
  }

  for (const l of logins) {
    const day = ensureDay(dateKey(l.time));
    day.logins.push({ time: l.time.toISOString(), device: { os: l.os, browser: l.browser, ip: l.ip } });
    day.logs.push({ time: l.time.toISOString(), event: "লগইন করেছেন" });
  }

  for (const s of submissions) {
    const day = ensureDay(dateKey(s.createdAt));
    const { status } = resolveTrackingStatus(s.trackingCode);
    day.attempts += 1;
    if (status === "SUCCESS") {
      day.success += 1;
      day.logs.push({ time: s.createdAt.toISOString(), event: "স্ট্যাটাস আপডেট: Account Success" });
    } else if (status === "FAILED") {
      day.failed += 1;
      day.logs.push({ time: s.createdAt.toISOString(), event: "স্ট্যাটাস আপডেট: Failed" });
    } else if (status === "SUSPICIOUS") {
      day.suspicious += 1;
      day.logs.push({ time: s.createdAt.toISOString(), event: "স্ট্যাটাস আপডেট: Suspicious" });
    } else if (status === "LIVE_CHAT") {
      day.liveChat += 1;
      day.logs.push({ time: s.createdAt.toISOString(), event: "লাইভ চ্যাট রিকোয়েস্ট" });
    } else {
      day.inReview += 1;
      day.logs.push({ time: s.createdAt.toISOString(), event: "কোড ট্র্যাক করা হয়েছে (In Review)" });
    }
  }

  for (const day of Object.values(days)) {
    day.logs.sort((a, b) => (a.time < b.time ? -1 : 1));
  }

  return days;
}
