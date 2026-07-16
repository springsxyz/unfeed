/**
 * Optional Polar license validate proxy (Vercel).
 * Prefer the extension’s direct call to Polar’s public Customer Portal API.
 * Use this only if you later need a server-side secret or rate-limit shield.
 *
 * Env: POLAR_ACCESS_TOKEN (Organization Access Token with license_keys:write)
 * Deploy: vercel deploy — then point nothing at it unless you switch the popup.
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ valid: false, error: "method_not_allowed" });
  }

  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) {
    return res.status(503).json({ valid: false, error: "not_configured" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ valid: false, error: "invalid_json" });
    }
  }

  const key = String(body?.key || "").trim();
  const organization_id = String(body?.organization_id || "").trim();
  if (!key || !organization_id) {
    return res.status(400).json({ valid: false, error: "missing_fields" });
  }

  const payload = { key, organization_id };
  if (body?.benefit_id) payload.benefit_id = body.benefit_id;

  try {
    const polar = await fetch("https://api.polar.sh/v1/license-keys/validate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (polar.status === 404) {
      return res.status(200).json({ valid: false });
    }
    if (!polar.ok) {
      return res.status(502).json({ valid: false, error: "polar_error" });
    }

    const data = await polar.json();
    return res.status(200).json({
      valid: data?.status === "granted",
      status: data?.status || null,
    });
  } catch {
    return res.status(502).json({ valid: false, error: "network" });
  }
}
