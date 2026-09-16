const FORWARD_TIMEOUT_MS = 8000;

export async function forwardToLeadDashboard(data) {
  const webhookUrl = process.env.LEADGEN_WEBHOOK_URL;
  const sharedSecret = process.env.FORM_SHARED_SECRET;

  if (!webhookUrl || !sharedSecret) {
    console.warn("lead dashboard forwarding is not configured");
    return { skipped: true };
  }

  const payload = {
    email: data.email,
    companyName: data.company,
    contactName: data.name,
    phone: data.phone || undefined,
    source: "lp-form",
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FORWARD_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Form-Secret": sharedSecret,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const body = await response.text();

    if (!response.ok) {
      throw new Error(`lead dashboard webhook responded with ${response.status}: ${body}`);
    }

    return { ok: true, status: response.status, body };
  } finally {
    clearTimeout(timeout);
  }
}
