#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const date = process.env.POST_DATE || new Date().toISOString().slice(0, 10);
const checks = [
  ["social", path.join(root, "public/data/daily-posts.json"), 5, ["title", "caption", "image", "pillar"]],
  ["blogs", path.join(root, "public/data/daily-blogs.json"), 5, ["title", "body", "image", "slug", "seoTitle", "metaDescription", "focusKeyword", "geoAnswer", "faqAnswer", "imageAlt"]],
];
const selected = process.env.CONTENT_KIND ? checks.filter(([name]) => name === process.env.CONTENT_KIND) : checks;
if (!selected.length) throw new Error(`Unknown CONTENT_KIND: ${process.env.CONTENT_KIND}`);
for (const [name, file, count, fields] of selected) {
  const items = JSON.parse(await fs.readFile(file, "utf8"));
  if (!Array.isArray(items) || items.length !== count) throw new Error(`${name}: expected exactly ${count} records`);
  for (const [index, item] of items.entries()) {
    for (const field of fields) if (typeof item[field] !== "string" || !item[field].trim()) throw new Error(`${name}[${index}]: missing ${field}`);
    if (name === "blogs" && item.body.trim().split(/\s+/).length < 150) throw new Error(`${name}[${index}]: body is too short`);
    const image = path.join(root, "public", item.image.replace(/^\//, ""));
    const stat = await fs.stat(image);
    if (!stat.size) throw new Error(`${name}[${index}]: image is empty`);
  }
}
console.log(`Validated ${selected.map(([name]) => name).join(" and ")} content for ${date}`);
