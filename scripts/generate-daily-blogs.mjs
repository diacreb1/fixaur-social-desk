#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const API_KEY = process.env.MINIMAX_API_KEY;
const DATE = process.env.POST_DATE || new Date().toISOString().slice(0, 10);
const OUT = path.join(ROOT, "public", "data", "daily-blogs.json");
const IMAGE_DIR = path.join(ROOT, "public", "generated", "blogs", DATE);
if (!API_KEY) throw new Error("MINIMAX_API_KEY is required");
const topics = [
  "fleet downtime checklist for Saskatoon businesses",
  "what to check when a work van will not start on a cold morning",
  "mobile maintenance versus sending every vehicle to a shop",
  "how to reduce repeat battery failures across a fleet",
  "pre-trip inspection for local delivery and landscaping fleets",
];
async function chat(prompt) {
  const res = await fetch("https://api.minimax.io/v1/chat/completions", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${API_KEY}` }, body: JSON.stringify({ model: "MiniMax-M2.7", messages: [{ role: "system", content: "You write useful, accurate local-service blog drafts for Fixaur Mobile Mechanic in Saskatoon. Return JSON only. Never invent prices, guarantees, certifications, competitor claims, or unsafe advice." }, { role: "user", content: prompt }], max_completion_tokens: 12000, response_format: { type: "json_object" } }), signal: AbortSignal.timeout(120000) });
  if (!res.ok) throw new Error(`MiniMax ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.choices?.[0]?.message?.content || "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}
function json(text) { const start = text.indexOf("{"); const end = text.lastIndexOf("}"); if (start < 0 || end < start) throw new Error("MiniMax did not return JSON"); return JSON.parse(text.slice(start, end + 1)); }
async function image(prompt) { const res = await fetch("https://api.minimax.io/v1/image_generation", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${API_KEY}` }, body: JSON.stringify({ model: "image-01", prompt: `${prompt}. Brand-safe Fixaur automotive editorial image, realistic Saskatoon setting, no readable text, no logos, no identifiable people.`, aspect_ratio: "16:9", response_format: "base64" }), signal: AbortSignal.timeout(120000) }); if (!res.ok) throw new Error(`MiniMax image ${res.status}: ${await res.text()}`); return res.json(); }
await fs.mkdir(IMAGE_DIR, { recursive: true });
const result = json(await chat(`Create five distinct blog drafts for ${DATE}, one per topic: ${topics.join("; ")}. Each object must include title, slug, body (700-1000 words), seoTitle (under 60 characters), metaDescription (150-160 characters), focusKeyword, geoAnswer (a direct answer mentioning Saskatoon naturally), faqQuestion, faqAnswer, imagePrompt, imageAlt, internalLink. Return {"blogs":[...]}.`));
const blogs = [];
for (let i = 0; i < topics.length; i++) {
  const b = result.blogs?.[i]; if (!b) throw new Error(`Missing blog ${i + 1}`);
  const imageData = await image(b.imagePrompt);
  const file = `${DATE}-${i + 1}.png`;
  await fs.writeFile(path.join(IMAGE_DIR, file), Buffer.from(imageData.data?.image_base64?.[0] || "", "base64"));
  blogs.push({ id: `${DATE}-blog-${i + 1}`, date: DATE, type: "Blog", status: "Draft ready", ...b, image: `/generated/blogs/${DATE}/${file}` });
}
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(blogs, null, 2) + "\n");
console.log(`Generated ${blogs.length} daily blogs and images for ${DATE}`);
