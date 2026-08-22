import { db, ensureSchema } from "../_db.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: "Database is not configured" });
  try {
    await ensureSchema();
    const sql = db();
    const [sends, suppressions, followups, events] = await Promise.all([
      sql`SELECT status,count(*)::int AS count FROM fixaur_outreach_sends GROUP BY status`,
      sql`SELECT count(*)::int AS count FROM fixaur_outreach_suppressions`,
      sql`SELECT status,count(*)::int AS count FROM fixaur_outreach_followups GROUP BY status`,
      sql`SELECT event_type,count(*)::int AS count FROM fixaur_outreach_events GROUP BY event_type`,
    ]);
    return res.status(200).json({ sends, suppressions: suppressions[0]?.count || 0, followups, events });
  } catch { return res.status(500).json({ error: "Analytics unavailable" }); }
}
