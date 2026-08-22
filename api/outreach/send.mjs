import { db, ensureSchema } from "../_db.mjs";
import crypto from "node:crypto";

export default async function handler(req, res) {
  const json = (body, status = 200) => res.status(status).json(body);
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "notifications@mail.fixaur.com";
  if (!key) return json({ error: "Resend is not configured" }, 503);
  const input = req.body || {};
  const { to, subject, html, text, sourceUrl, approved, campaignKey = "fixaur-fleet-outreach-v1" } = input || {};
  const cc = "diacre@fixaur.com";
  if (!approved) return json({ error: "Approval is required before sending" }, 400);
  if (!to || !subject || (!html && !text) || !sourceUrl) return json({ error: "to, subject, content, and sourceUrl are required" }, 400);
  if (!process.env.DATABASE_URL) return json({ error: "Database is required for duplicate protection" }, 503);
  await ensureSchema();
  const sql = db();
  const recipient = String(to).trim().toLowerCase();
  const suppressed = await sql`SELECT recipient,reason FROM fixaur_outreach_suppressions WHERE recipient=${recipient}`;
  if (suppressed.length) return json({ error: `Send blocked: recipient is suppressed (${suppressed[0].reason})` }, 409);
  const contentHash = crypto.createHash("sha256").update(`${subject}\n${html || text}`).digest("hex");
  const dedupeKey = `${campaignKey}:${recipient}`;
  const claim = await sql`INSERT INTO fixaur_outreach_sends (dedupe_key,recipient,campaign_key,content_hash,status) VALUES (${dedupeKey},${recipient},${campaignKey},${contentHash},'sending') ON CONFLICT (dedupe_key) DO NOTHING RETURNING id`;
  if (!claim.length) return json({ error: "Duplicate blocked: this recipient already has a send in this campaign" }, 409);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({ from, to: [to], cc: [cc], subject, html: html || `<p>${text}</p>`, text }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    await sql`UPDATE fixaur_outreach_sends SET status='failed' WHERE id=${claim[0].id}`;
    return json({ error: data.message || "Resend failed" }, response.status);
  }
  const sentAt = new Date().toISOString();
  try {
      await sql`UPDATE fixaur_outreach_sends SET status='sent',resend_id=${data.id},sent_at=${sentAt} WHERE id=${claim[0].id}`;
      await sql`UPDATE fixaur_state SET value = (SELECT jsonb_agg(CASE WHEN lower(item->>'email')=CAST(${recipient} AS text) THEN item || jsonb_build_object('status','Sent','resendId',CAST(${data.id} AS text),'lastActivity',CAST(${sentAt} AS text),'replyStatus','Awaiting reply') ELSE item END) FROM jsonb_array_elements(value) item), updated_at=now() WHERE key='outreach'`;
      await sql`INSERT INTO fixaur_outreach_followups (recipient,parent_resend_id,step,due_at) VALUES (${recipient},${data.id},1,now()+interval '3 days'),(${recipient},${data.id},2,now()+interval '7 days'),(${recipient},${data.id},3,now()+interval '14 days')`;
    } catch (error) {
      return json({ error: "Email sent, but delivery record could not be saved", id: data.id, detail: error.message }, 502);
    }
  return json({ id: data.id, status: "sent", to, cc, sourceUrl, sentAt, replyStatus: "Awaiting reply" });
}
