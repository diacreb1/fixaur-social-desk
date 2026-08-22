import { db, ensureSchema } from "../_db.mjs";

export default async function handler(req, res) {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: "Database is not configured" });
  try {
    await ensureSchema();
    const sql = db();
    if (req.method === "GET") return res.status(200).json(await sql`SELECT recipient,reason,source,created_at FROM fixaur_outreach_suppressions ORDER BY created_at DESC`);
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const recipient = String(req.body?.recipient || "").trim().toLowerCase();
    const reason = String(req.body?.reason || "manual suppression").trim().slice(0, 120);
    if (!recipient || !recipient.includes("@")) return res.status(400).json({ error: "A valid recipient is required" });
    await sql`INSERT INTO fixaur_outreach_suppressions (recipient,reason,source) VALUES (${recipient},${reason},'app') ON CONFLICT (recipient) DO UPDATE SET reason=EXCLUDED.reason,source=EXCLUDED.source`;
    return res.status(200).json({ ok: true, recipient, reason });
  } catch { return res.status(500).json({ error: "Suppression update failed" }); }
}
