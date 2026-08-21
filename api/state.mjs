import { db, ensureSchema } from "./_db.mjs";

export default async function handler(req, res) {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: "Database is not configured" });
  try {
    await ensureSchema();
    const sql = db();
    if (req.method === "GET") {
      const key = String(req.query?.key || "");
      if (!key) return res.status(400).json({ error: "key is required" });
      const rows = await sql`SELECT value, updated_at FROM fixaur_state WHERE key=${key}`;
      return res.status(200).json(rows[0] || { value: null });
    }
    if (req.method === "POST") {
      const { key, value } = req.body || {};
      if (!key || value === undefined) return res.status(400).json({ error: "key and value are required" });
      await sql`INSERT INTO fixaur_state (key,value,updated_at) VALUES (${key},${JSON.stringify(value)}::jsonb,now()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()`;
      return res.status(200).json({ ok: true, key });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ error: "Database request failed", detail: error.message });
  }
}
