import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit = null;

function getRatelimit() {
  if (ratelimit) return ratelimit;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    return null;
  }
  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
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
