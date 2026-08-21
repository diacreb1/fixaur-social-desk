#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const API_KEY = process.env.MINIMAX_API_KEY;
const DATE = process.env.POST_DATE || new Date().toISOString().slice(0, 10);
const OUT = path.join(ROOT, "public", "data", "daily-posts.json");
const IMAGE_DIR = path.join(ROOT, "public", "generated", "daily", DATE);
const pillars = [
  "Educational",
  "Meme",
  "Entertaining",
  "Serious",
  "Competitive",
];
if (!API_KEY) throw new Error("MINIMAX_API_KEY is required");

async function minimax(messages, json = false) {
  const body = { model: "MiniMax-M2.7", messages, max_completion_tokens: 3500 };
  if (json) body.response_format = { type: "json_object" };
  const res = await fetch("https://api.minimax.io/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`MiniMax ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.choices?.[0]?.message?.content || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .trim();
}

const raw = await minimax(
  [
    {
      role: "system",
      content:
        "You create concise, original social posts for Fixaur Mobile Mechanic in Saskatoon. Return only JSON.",
    },
    {
      role: "user",
      content: `Create exactly five posts for ${DATE}, one each in this order: ${pillars.join(", ")}. Each object needs pillar,title,caption,image_prompt. Be useful, human, local, and competitive only through convenience claims such as avoiding an unnecessary tow or shop wait. No prices, guarantees, invented competitor claims, or unsafe advice. JSON: {"posts":[...]}`,
    },
  ],
  true,
);
function extractJson(text) {
  const start = text.indexOf("{");
  if (start < 0) throw new Error("MiniMax did not return a JSON object");
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') quoted = false;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return text.slice(start, i + 1);
  }
  throw new Error("MiniMax returned incomplete JSON");
}
const parsed = JSON.parse(extractJson(raw));
const posts = [];
await fs.mkdir(IMAGE_DIR, { recursive: true });
async function generateImage(prompt) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const imageRes = await fetch("https://api.minimax.io/v1/image_generation", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({ model: "image-01", prompt, aspect_ratio: "1:1", response_format: "base64" }),
        signal: AbortSignal.timeout(120000),
      });
      if (!imageRes.ok) throw new Error(`MiniMax image ${imageRes.status}: ${await imageRes.text()}`);
      return await imageRes.json();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }
  throw lastError;
}
for (let i = 0; i < pillars.length; i++) {
  const p =
    parsed.posts?.find((x) => x.pillar === pillars[i]) || parsed.posts?.[i];
  if (!p) throw new Error(`Missing ${pillars[i]} post`);
  const imageData = await generateImage(`${p.image_prompt}. Brand-safe automotive editorial image for Fixaur, realistic Saskatoon setting, no readable text, no logos, no identifiable people.`);
  const imageFile = `${DATE}-${i + 1}-${pillars[i].toLowerCase()}.png`;
  await fs.writeFile(
    path.join(IMAGE_DIR, imageFile),
    Buffer.from(imageData.data?.image_base64?.[0] || "", "base64"),
  );
  posts.push({
    id: `${DATE}-${i + 1}`,
    date: DATE,
    time: ["07:30", "10:15", "12:45", "16:30", "19:00"][i],
    ...p,
    image: `/generated/daily/${DATE}/${imageFile}`,
    status: "Draft",
    platforms: ["Facebook", "Instagram", "Google Business"],
  });
}
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(posts, null, 2) + "\n");
console.log(`Generated ${posts.length} social posts and images for ${DATE}`);
