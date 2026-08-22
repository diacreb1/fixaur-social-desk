import fs from "node:fs/promises";

const target = Number(process.env.OUTREACH_DAILY_TARGET || 10);
const records = JSON.parse(await fs.readFile("public/data/outreach-contacts.json", "utf8"));
const eligible = records.filter((r) => r.emailStatus === "verified" && r.email);
const emails = eligible.map((r) => r.email.toLowerCase());
if (eligible.length !== target) throw new Error(`Expected exactly ${target} verified outreach contacts, found ${eligible.length}`);
if (new Set(emails).size !== emails.length) throw new Error("Duplicate outreach email addresses detected");
console.log(`Validated exactly ${target} unique verified outreach contacts`);
