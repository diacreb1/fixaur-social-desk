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
    ready = db()`CREATE TABLE IF NOT EXISTS fixaur_state (key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`;
  }
  await ready;
}
