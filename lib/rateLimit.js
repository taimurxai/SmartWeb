import { redis } from "./redis";

// Fallback in-memory map if Redis is not configured
const buckets = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (now - b.start > b.windowMs) buckets.delete(k);
  }
}, 60000).unref();

export async function checkRateLimit(key, { max, windowMs }) {
  if (redis) {
    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.pexpire(key, windowMs);
      }
      if (current > max) {
        const ttl = await redis.pttl(key);
        return { allowed: false, retryAfterMs: ttl > 0 ? ttl : windowMs };
      }
      return { allowed: true };
    } catch (error) {
      console.error("Redis rate limit error:", error);
      // Fallback to memory if Redis fails
    }
  }

  // Fallback memory rate limiting
  const now = Date.now();
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
