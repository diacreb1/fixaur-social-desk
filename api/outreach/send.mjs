import { db, ensureSchema } from "../_db.mjs";

export default async function handler(req, res) {
  const json = (body, status = 200) => res.status(status).json(body);
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "notifications@mail.fixaur.com";
  if (!key) return json({ error: "Resend is not configured" }, 503);
  const input = req.body || {};
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
  const sentAt = new Date().toISOString();
  if (process.env.DATABASE_URL) {
    try {
      await ensureSchema();
      const sql = db();
      await sql`UPDATE fixaur_state SET value = (SELECT jsonb_agg(CASE WHEN item->>'email'=${to} THEN item || jsonb_build_object('status','Sent','resendId',${data.id},'lastActivity',${sentAt},'replyStatus','Awaiting reply') ELSE item END) FROM jsonb_array_elements(value) item), updated_at=now() WHERE key='outreach'`;
    } catch (error) {
      return json({ error: "Email sent, but delivery record could not be saved", id: data.id, detail: error.message }, 502);
    }
  }
  return json({ id: data.id, status: "sent", to, sourceUrl, sentAt, replyStatus: "Awaiting reply" });
}
