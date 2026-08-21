import { db, ensureSchema } from "../_db.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: "Database is not configured" });
  try {
    await ensureSchema();
    const event = req.body || {};
    const type = event.type || "unknown";
    const data = event.data || event;
    const emailId = String(data.email_id || data.id || "");
    const to = String(Array.isArray(data.to) ? (data.to[0] || "") : (data.to || ""));
    const status = type.includes("delivered") ? "Delivered" : type.includes("bounced") ? "Bounced" : type.includes("complained") ? "Complained" : type.includes("received") ? "Replied" : null;
    const sql = db();
    await sql`CREATE TABLE IF NOT EXISTS fixaur_outreach_events (id bigserial PRIMARY KEY, event_type text NOT NULL, email_id text, recipient text, payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`;
    await sql`INSERT INTO fixaur_outreach_events (event_type,email_id,recipient,payload) VALUES (${type},${emailId},${to},${JSON.stringify(event)}::jsonb)`;
    if (status && (emailId || to)) {
      await sql`UPDATE fixaur_state SET value = (SELECT jsonb_agg(CASE WHEN (item->>'resendId'=${emailId} OR item->>'email'=${to}) THEN item || jsonb_build_object('replyStatus',${status},'lastActivity',now()::text) ELSE item END) FROM jsonb_array_elements(value) item), updated_at=now() WHERE key='outreach'`;
    }
    return res.status(200).json({ received: true, type });
  } catch (error) {
    return res.status(500).json({ error: "Webhook processing failed", detail: error.message });
  }
}
