// In-memory sliding-window limiter. Good enough for a single-instance
// deployment; horizontally-scaled deployments would need a shared store
// (e.g. Redis) since each instance would otherwise keep its own counters.
const buckets = new Map();

// Run cleanup asynchronously every 1 minute to prevent O(N) synchronous sweeps
// blocking the event loop on every request.
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (now - b.start > b.windowMs) buckets.delete(k);
  }
}, 60000).unref(); // unref() ensures this timer doesn't keep the process alive

export function checkRateLimit(key, { max, windowMs }) {
  const now = Date.now();

  // Hard bound map to prevent memory exhaustion, deleting the oldest entry (Map iterates in insertion order).
  if (buckets.size > 10000) {
    const oldestKey = buckets.keys().next().value;
    buckets.delete(oldestKey);
  }

  const bucket = buckets.get(key);
  if (!bucket || now - bucket.start > windowMs) {
    buckets.set(key, { start: now, count: 1, windowMs });
    return { allowed: true };
  }
  if (bucket.count >= max) {
    return { allowed: false, retryAfterMs: windowMs - (now - bucket.start) };
  }
  bucket.count += 1;
  return { allowed: true };
}
