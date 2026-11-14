import fs from "node:fs/promises";
import { PURPOSE, draftKey, selectCandidates } from "../src/outreach-policy.mjs";
const date = new Date(process.env.POST_DATE || Date.now()).toISOString().slice(0, 10);
const target = Number(process.env.OUTREACH_DAILY_TARGET || 10);
const contacts = JSON.parse(await fs.readFile("public/data/outreach-contacts.json", "utf8"));
// Missing/unreconciled history must leave the existing queue untouched.
if (!process.env.OUTREACH_HISTORY_FILE) throw new Error("OUTREACH_HISTORY_FILE must supply reconciled private history; generation held");
const history = JSON.parse(await fs.readFile(process.env.OUTREACH_HISTORY_FILE, "utf8"));
const pending = JSON.parse(await fs.readFile("public/data/daily-outreach.json", "utf8"));
if (!Array.isArray(pending)) throw new Error("Invalid existing queue");
const eligible = selectCandidates(contacts, pending, history, new Date().toISOString(), Math.max(0, target - pending.length));
const angles = [["Keep your fleet moving", "keeping vehicles available between jobs"], ["A practical fleet support option", "reducing avoidable trips to a repair shop"], ["Support when a work vehicle is stuck", "getting a safe next step when a vehicle will not cooperate"], ["A simpler maintenance conversation", "making maintenance easier to coordinate for a busy team"], ["Mobile support for local operators", "keeping crews focused on the work instead of vehicle downtime"]];
const rows = eligible.map((x, i) => { const [subject, hook] = angles[(i + Number(date.slice(-2))) % angles.length]; return { ...x, id: draftKey(x.email), date, campaignKey: PURPOSE, status: "Draft", subject, body: `Hi ${x.firstName},\n\nI wanted to introduce Fixaur to ${x.company}. We provide mobile mechanic support for local teams in Saskatoon and nearby communities, with a focus on ${hook}.\n\nWould it be useful to compare notes on keeping your vehicles on the road?\n\nBest,\nDiacre\nFixaur Mobile Mechanic\ndiacre@fixaur.com\n306-992-2827` }; });
await fs.writeFile("public/data/daily-outreach.json", `${JSON.stringify([...pending, ...rows], null, 2)}\n`);
console.log(`Generated ${rows.length} new eligible drafts; preserved ${pending.length} existing records for ${date}`);
