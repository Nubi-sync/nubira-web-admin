/**
 * In-memory Sliding Window Rate Limiter
 * 
 * Industry Standard (Cloudflare / Stripe pattern):
 * Limits repeated actions (e.g. login brute-force attempts) within a rolling time window.
 * Avoids rigid fixed-bucket reset vulnerabilities.
 */

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetInSeconds: number;
}

// Global cache across hot reloads in dev / server runtime
const globalRateLimitMap = new Map<string, number[]>();

// Periodic cleanup interval (every 5 minutes)
let lastCleanup = Date.now();
function cleanupStaleBuckets(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;

  for (const [key, timestamps] of globalRateLimitMap.entries()) {
    const valid = timestamps.filter((t) => t > now - windowMs);
    if (valid.length === 0) {
      globalRateLimitMap.delete(key);
    } else {
      globalRateLimitMap.set(key, valid);
    }
  }
}

/**
 * Checks and records an attempt for a given identifier (e.g. IP address).
 *
 * @param key Unique key (e.g., client IP or username)
 * @param limit Maximum attempts allowed within the window (default: 5)
 * @param windowMs Time window in milliseconds (default: 60,000 ms / 1 minute)
 */
export function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60 * 1000
): RateLimitResult {
  cleanupStaleBuckets(windowMs);

  const now = Date.now();
  const windowStart = now - windowMs;

  const existingTimestamps = globalRateLimitMap.get(key) || [];
  // Retain only attempts that occurred within the current sliding window
  const activeTimestamps = existingTimestamps.filter((t) => t > windowStart);

  if (activeTimestamps.length >= limit) {
    // Oldest timestamp in current window determines when the next slot frees up
    const oldestTimestamp = activeTimestamps[0];
    const resetTimeMs = oldestTimestamp + windowMs;
    const resetInSeconds = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

    return {
      success: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  // Record this attempt
  activeTimestamps.push(now);
  globalRateLimitMap.set(key, activeTimestamps);

  return {
    success: true,
    remaining: limit - activeTimestamps.length,
    resetInSeconds: Math.ceil(windowMs / 1000),
  };
}

/**
 * Resets the rate limit for a given key upon successful authentication
 */
export function resetRateLimit(key: string): void {
  globalRateLimitMap.delete(key);
}
