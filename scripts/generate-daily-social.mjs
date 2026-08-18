#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const API_KEY = process.env.MINIMAX_API_KEY;
const DATE = process.env.POST_DATE || new Date().toISOString().slice(0, 10);
const OUT = path.join(ROOT, "src", "data", "daily-posts.json");
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
const parsed = JSON.parse(raw.slice(raw.indexOf("{")));
const posts = [];
await fs.mkdir(IMAGE_DIR, { recursive: true });
for (let i = 0; i < pillars.length; i++) {
  const p =
    parsed.posts?.find((x) => x.pillar === pillars[i]) || parsed.posts?.[i];
  if (!p) throw new Error(`Missing ${pillars[i]} post`);
  const imageRes = await fetch("https://api.minimax.io/v1/image_generation", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "image-01",
      prompt: `${p.image_prompt}. Brand-safe automotive editorial image for Fixaur, realistic Saskatoon setting, no readable text, no logos, no identifiable people.`,
      aspect_ratio: "1:1",
      response_format: "base64",
    }),
  });
  if (!imageRes.ok)
    throw new Error(
      `MiniMax image ${imageRes.status}: ${await imageRes.text()}`,
    );
  const imageData = await imageRes.json();
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
