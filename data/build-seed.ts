// Turns data/*.txt menus + price index into SQL for Supabase, using the engine's own dish keys.
// Run: esbuild data/build-seed.ts --bundle --platform=node --outfile=/tmp/seed.cjs && node /tmp/seed.cjs
import fs from "node:fs";
import path from "node:path";
import { compareKey } from "../src/core";
// @ts-ignore plain JS module
import { PRICE_INDEX } from "./price-index.mjs";

const dir = path.resolve(process.argv[2] ?? "data");
const q = (s: string | null) => (s == null ? "null" : `'${s.replace(/'/g, "''")}'`);
const rows: string[] = [];
const menus: { name: string; area: string; concept: string; url: string; items: number }[] = [];
const keys = new Map<string, Set<string>>();

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".txt"))) {
  const collected = (f.match(/(\d{4}-\d{2})/)?.[1] ?? "2026-11") + "-10";
  let cur: (typeof menus)[number] | null = null;
  for (const raw of fs.readFileSync(path.join(dir, f), "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#") && !line.startsWith("##")) continue;
    if (line.startsWith("##")) {
      const [name, area, concept, url] = line.slice(2).split("|").map((s) => s.trim());
      cur = { name, area, concept, url, items: 0 }; menus.push(cur); continue;
    }
    if (!cur) continue;
    const m = line.match(/^(.+?)\s*\|\s*([\d.]+)/);
    if (!m) continue;
    const dish = m[1].trim(), price = Number(m[2]);
    const key = compareKey(dish);
    cur.items++;
    if (!keys.has(key)) keys.set(key, new Set());
    keys.get(key)!.add(cur.name);
    rows.push(`(${q("Dubai")},${q(cur.area === "Dubai" ? null : cur.area)},${q(key)},${q(dish)},${price},'AED','dine_in',${q(cur.url)},'${collected}','pihoco_research',true)`);
  }
}

const sql = [
  "delete from public.benchmark_items where added_by = 'pihoco_research';",
  `insert into public.benchmark_items (city, area, dish_key, dish_name, price, currency, channel, source_url, collected_at, added_by, verified) values\n${rows.join(",\n")};`,
  "delete from public.price_index;",
  `insert into public.price_index (country, month, value, source) values\n${PRICE_INDEX.map((p: { country: string; month: string; value: number; source: string }) => `(${q(p.country)},${q(p.month)},${p.value},${q(p.source)})`).join(",\n")};`,
].join("\n");
fs.writeFileSync(path.join(dir, "seed.sql"), sql);

const comparable = [...keys.entries()].filter(([, s]) => s.size >= 5).sort((a, b) => b[1].size - a[1].size);
console.log(JSON.stringify({
  menus: menus.length, items: rows.length,
  restaurants: menus.filter((m) => m.concept === "restaurant").length, cafes: menus.filter((m) => m.concept === "cafe").length,
  distinctDishes: keys.size, comparableDishes: comparable.length,
  comparable: comparable.map(([k, s]) => `${k} (${s.size})`),
  priceIndex: PRICE_INDEX.length,
}, null, 1));
