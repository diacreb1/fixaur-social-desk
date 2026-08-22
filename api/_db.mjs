import { neon } from "@neondatabase/serverless";

let sql;
let ready;

export function db() {
  if (!sql) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

export async function ensureSchema() {
  if (!ready) {
    ready = (async () => {
      const query = db();
      await query`CREATE TABLE IF NOT EXISTS fixaur_state (key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`;
      await query`CREATE TABLE IF NOT EXISTS fixaur_outreach_sends (id bigserial PRIMARY KEY, dedupe_key text NOT NULL UNIQUE, recipient text NOT NULL, campaign_key text NOT NULL, content_hash text NOT NULL, resend_id text, status text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz)`;
      await query`CREATE UNIQUE INDEX IF NOT EXISTS fixaur_outreach_recipient_content ON fixaur_outreach_sends (recipient, content_hash)`;
      await query`CREATE TABLE IF NOT EXISTS fixaur_outreach_suppressions (recipient text PRIMARY KEY, reason text NOT NULL, source text, created_at timestamptz NOT NULL DEFAULT now())`;
      await query`CREATE TABLE IF NOT EXISTS fixaur_outreach_followups (id bigserial PRIMARY KEY, recipient text NOT NULL, parent_resend_id text, step integer NOT NULL, due_at timestamptz NOT NULL, status text NOT NULL DEFAULT 'queued', created_at timestamptz NOT NULL DEFAULT now())`;
      await query`CREATE TABLE IF NOT EXISTS fixaur_outreach_events (id bigserial PRIMARY KEY, event_type text NOT NULL, email_id text, recipient text, payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`;
    })();
  }
  await ready;
}
