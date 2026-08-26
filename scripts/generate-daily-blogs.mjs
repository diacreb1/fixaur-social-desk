#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const API_KEY = process.env.MINIMAX_API_KEY;
const IMAGE_NO_TEXT = "Photograph only: absolutely no words, letters, numbers, captions, signs, labels, logos, watermarks, license plates, branded clothing, or readable markings anywhere in the image. Use clean unmarked surfaces and blank backgrounds.";
const DATE = new Date(process.env.POST_DATE || Date.now()).toISOString().slice(0, 10);
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
  const res = await fetch("https://api.minimax.io/v1/chat/completions", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${API_KEY}` }, body: JSON.stringify({ model: "MiniMax-M2.7", messages: [{ role: "system", content: "You write useful, accurate local-service blog drafts for Fixaur Mobile Mechanic in Saskatoon. Return JSON only. Never invent prices, guarantees, certifications, competitor claims, or unsafe advice." }, { role: "user", content: prompt }], max_completion_tokens: 5000, response_format: { type: "json_object" } }), signal: AbortSignal.timeout(45000) });
  if (!res.ok) throw new Error(`MiniMax ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.choices?.[0]?.message?.content || "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}
function json(text) { const start = text.indexOf("{"); const end = text.lastIndexOf("}"); if (start < 0 || end < start) throw new Error("MiniMax did not return JSON"); return JSON.parse(text.slice(start, end + 1)); }
function fallbackBlog(topic, i) {
  const title = topic[0].toUpperCase() + topic.slice(1);
  return { title, slug: topic.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, ""), body: `${title} is a practical concern for local operators who need dependable vehicles. Start with a simple written checklist and record what happened, when it happened and which vehicle was affected. That history helps a technician see patterns instead of treating every visit as an isolated problem.\n\nFor Saskatoon businesses, seasonal conditions and daily stop-and-go work can expose weak batteries, tire concerns, warning lights and maintenance gaps quickly. Before a vehicle leaves, check the items that affect safety and reliability. If something looks unsafe, park the vehicle and arrange an appropriate assessment.\n\nMobile service can be convenient when the vehicle is safely accessible and the work is appropriate for an on-site visit. More complex repairs may still belong in a shop. Fixaur helps local businesses understand the next practical step without making promises about a problem that has not been inspected.\n\nKeep the checklist consistent across the fleet, review repeat issues and ask for help when the symptoms are unclear. A small amount of documentation can make the next decision faster and give your team a clearer maintenance process.`, seoTitle: `${title.slice(0, 56)} | Fixaur`, metaDescription: `A practical Saskatoon guide to ${topic}, with safe checks, fleet context and when mobile mechanic support may help.`, focusKeyword: topic, geoAnswer: `Fixaur serves Saskatoon, Warman and Martensville with mobile mechanic support for eligible, safely accessible vehicle issues.`, faqQuestion: `What should a Saskatoon business do about ${topic}?`, faqAnswer: `Use a consistent checklist, document the symptoms and arrange an assessment when the vehicle is not safe or reliable to operate.`, imagePrompt: `A mobile mechanic inspecting a work vehicle related to ${topic}`, imageAlt: `Mobile mechanic inspection for ${topic} in Saskatoon`, internalLink: "/fleet-service" };
}
async function image(prompt) { const res = await fetch("https://api.minimax.io/v1/image_generation", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${API_KEY}` }, body: JSON.stringify({ model: "image-01", prompt: `${prompt}. Brand-safe Fixaur automotive editorial image, realistic Saskatoon setting, no identifiable people. ${IMAGE_NO_TEXT}`, aspect_ratio: "16:9", response_format: "base64" }), signal: AbortSignal.timeout(45000) }); if (!res.ok) throw new Error(`MiniMax image ${res.status}: ${await res.text()}`); return res.json(); }
await fs.mkdir(IMAGE_DIR, { recursive: true });
const blogs = [];
for (let i = 0; i < topics.length; i++) {
  let b;
  for (let attempt = 1; attempt <= 1 && !b; attempt++) {
    try {
      const result = json(await chat(`Write one publish-ready blog draft for ${DATE} about: ${topics[i]}. Return exactly one JSON object under the key blog. Include title, slug, body (500-750 words), seoTitle (under 60 characters), metaDescription (150-160 characters), focusKeyword, geoAnswer (a direct answer mentioning Saskatoon naturally), faqQuestion, faqAnswer, imagePrompt, imageAlt, internalLink. No markdown fences.`));
      b = result.blog || result;
      if (!b?.title || !b?.body || b.body.split(/\s+/).length < 150 || !b.slug || !b.seoTitle || !b.metaDescription || !b.focusKeyword || !b.geoAnswer || !b.faqAnswer || !b.imagePrompt || !b.imageAlt) throw new Error("MiniMax returned an incomplete blog object");
    } catch (error) {
      b = fallbackBlog(topics[i], i);
    }
  }
  const file = `${DATE}-${i + 1}.png`;
  try {
    const imageData = await image(b.imagePrompt);
    const bytes = Buffer.from(imageData.data?.image_base64?.[0] || "", "base64");
    if (bytes.length < 1000) throw new Error("Image response was empty");
    await fs.writeFile(path.join(IMAGE_DIR, file), bytes);
  } catch {
    const dailyRoot = path.join(ROOT, "public", "generated", "daily");
    const folders = (await fs.readdir(dailyRoot, { withFileTypes: true }).catch(() => []))
      .filter((entry) => entry.isDirectory() && entry.name !== DATE)
      .map((entry) => entry.name)
      .sort()
      .reverse();
    const sourceFolder = folders[0] || DATE;
    const sourceDir = path.join(dailyRoot, sourceFolder);
    const sourceFiles = (await fs.readdir(sourceDir).catch(() => []))
      .filter((name) => name.endsWith(".png"))
      .sort();
    if (!sourceFiles.length) throw new Error("No prior generated image is available for blog fallback");
    await fs.copyFile(path.join(sourceDir, sourceFiles[i % sourceFiles.length]), path.join(IMAGE_DIR, file));
  }
  blogs.push({ id: `${DATE}-blog-${i + 1}`, date: DATE, type: "Blog", status: "Draft ready", ...b, image: `/generated/blogs/${DATE}/${file}` });
}
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(blogs, null, 2) + "\n");
console.log(`Generated ${blogs.length} daily blogs and images for ${DATE}`);
