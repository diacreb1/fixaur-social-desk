const json = (body, status = 200) => ({ status, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

export default async function handler(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "notifications@mail.fixaur.com";
  if (!key) return json({ error: "Resend is not configured" }, 503);
  let input;
  try { input = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const { to, subject, html, text, sourceUrl, approved } = input || {};
  if (!approved) return json({ error: "Approval is required before sending" }, 400);
  if (!to || !subject || (!html && !text) || !sourceUrl) return json({ error: "to, subject, content, and sourceUrl are required" }, 400);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({ from, to: [to], subject, html: html || `<p>${text}</p>`, text }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return json({ error: data.message || "Resend failed" }, response.status);
  return json({ id: data.id, status: "sent", to, sourceUrl, sentAt: new Date().toISOString(), replyStatus: "Awaiting reply" });
}
