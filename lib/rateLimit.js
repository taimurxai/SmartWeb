// In-memory sliding-window limiter. Good enough for a single-instance
// deployment; horizontally-scaled deployments would need a shared store
// (e.g. Redis) since each instance would otherwise keep its own counters.
const buckets = new Map();

export function checkRateLimit(key, { max, windowMs }) {
  const now = Date.now();

  // Bound the map's growth instead of letting it accumulate one entry per
  // distinct key forever.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (now - b.start > windowMs) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || now - bucket.start > windowMs) {
    buckets.set(key, { start: now, count: 1 });
    return { allowed: true };
  }
  if (bucket.count >= max) {
    return { allowed: false, retryAfterMs: windowMs - (now - bucket.start) };
  }
  bucket.count += 1;
  return { allowed: true };
}
