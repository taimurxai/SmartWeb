import Redis from "ioredis";

// Cache the connection in global object to prevent connection leaks
// during hot-reloads in development or multiple lambda invocations.
const globalForRedis = globalThis;

function createRedisClient() {
  if (!process.env.REDIS_URL) {
    console.warn("⚠️ REDIS_URL is not set. Rate limiting and sessions will fall back to memory or fail.");
    return null;
  }
  return new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null; // stop retrying
      return Math.min(times * 50, 2000);
    },
  });
}

export const redis = globalForRedis.__redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.__redis = redis;
}
