import { validateSubmission } from "../lib/validate.js";
import { checkRateLimit } from "../lib/rateLimit.js";
import { sendDocumentEmail, sendNotificationEmail } from "../lib/mailer.js";

function applyCors(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  const origin = req.headers.origin;

  if (allowedOrigin && origin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  const ip = getClientIp(req);
  const rateLimitResult = await checkRateLimit(ip);
  if (!rateLimitResult.success) {
    res.status(429).json({ error: "too many requests" });
    return;
  }

  const { valid, errors, data } = validateSubmission(req.body || {});
  if (!valid) {
    res.status(400).json({ error: "invalid input", details: errors });
    return;
  }

  try {
    await sendDocumentEmail({ toEmail: data.email, name: data.name, company: data.company });
    console.log("document email sent", data.company);
  } catch (err) {
    console.error("failed to send document email", err);
    res.status(500).json({ error: "failed to send document email" });
    return;
  }

  try {
    await sendNotificationEmail(data);
    console.log("notification email sent", data.company);
  } catch (err) {
    console.error("failed to send notification email", err);
  }

  res.status(200).json({ ok: true });
}
