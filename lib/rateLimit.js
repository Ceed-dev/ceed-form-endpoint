import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit = null;

function getRatelimit() {
  if (ratelimit) return ratelimit;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix: "ceed-form",
  });
  return ratelimit;
}

export async function checkRateLimit(ip) {
  const rl = getRatelimit();
  if (!rl) return { success: true, skipped: true };
  return rl.limit(ip);
}
