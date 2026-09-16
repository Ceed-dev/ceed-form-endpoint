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
  try {
    return await rl.limit(ip);
  } catch (err) {
    // レート制限は迷惑防止の脇役であり、資料送信・リード通知という本来の役割を
    // 止めてまで守るべきものではない。Redis に繋がらない間は制限を諦めて通す
    // (Issue #2: Upstash のデータベース消失で全送信が500になっていた)
    console.error("rate limit check failed, allowing request", err);
    return { success: true, skipped: true };
  }
}
