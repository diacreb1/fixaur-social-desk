import fs from "node:fs/promises";
const target = Number(process.env.OUTREACH_DAILY_TARGET || 10);
const date = new Date(process.env.POST_DATE || Date.now()).toISOString().slice(0, 10);
const rows = JSON.parse(await fs.readFile("public/data/daily-outreach.json", "utf8"));
if (rows.length !== target) throw new Error(`Expected ${target} daily outreach drafts, found ${rows.length}`);
if (rows.some((x) => x.date !== date || x.emailStatus !== "verified" || !x.email || !x.body || !x.subject)) throw new Error("Daily outreach contains stale or incomplete records");
if (new Set(rows.map((x) => x.email.toLowerCase())).size !== target) throw new Error("Daily outreach contains duplicate recipients");
if (new Set(rows.map((x) => `${x.email.toLowerCase()}|${x.body}`)).size !== target) throw new Error("Daily outreach contains duplicate messages");
console.log(`Validated exactly ${target} unique drafts for ${date}`);
