// Price Check: compare the owner's dishes with competitor menus they paste in.
import { parseMenu } from "./parser";
import { compareKey, similarity } from "./match";
import { median, round } from "./stats";
import type { BenchmarkRow, Currency, MenuItem } from "./types";

export interface CompetitorMenu { name: string; text: string; url?: string }
export interface PriceCheckRow {
  item: string; yourPrice: number;
  matches: { competitor: string; name: string; price: number; similarity: number }[];
  median: number | null; gap: number | null; confidence: "high" | "medium" | "low";
}

export function priceCheck(own: MenuItem[], competitors: CompetitorMenu[]): PriceCheckRow[] {
  const parsed = competitors.map((c) => ({ c, items: parseMenu(c.text).items.filter((i) => i.price != null) }));
  const rows: PriceCheckRow[] = [];
  for (const it of own) {
    if (it.price == null) continue;
    const key = compareKey(it.name);
    const matches: PriceCheckRow["matches"] = [];
    for (const { c, items } of parsed) {
      let best: { name: string; price: number; similarity: number } | null = null;
      for (const ci of items) {
        const sameKey = compareKey(ci.name) === key;
        const sim = sameKey ? Math.max(0.85, similarity(it.name, ci.name)) : similarity(it.name, ci.name);
        if (sim >= 0.72 && (!best || sim > best.similarity)) best = { name: ci.name, price: ci.price!, similarity: sim };
      }
      if (best) matches.push({ competitor: c.name, ...best });
    }
    if (!matches.length) continue;
    const med = median(matches.map((m) => m.price));
    const minSim = Math.min(...matches.map((m) => m.similarity));
    rows.push({
      item: it.name, yourPrice: it.price, matches, median: med,
      gap: med ? round((it.price - med) / med, 3) : null,
      confidence: minSim >= 0.9 ? "high" : minSim >= 0.8 ? "medium" : "low",
    });
  }
  return rows.sort((a, b) => (a.gap ?? 0) - (b.gap ?? 0));
}

/** Rows to store as benchmark observations (public menus only, with consent). */
export function toBenchmarkRows(competitor: CompetitorMenu, city: string, currency: Currency, area?: string): BenchmarkRow[] {
  const today = new Date().toISOString().slice(0, 10);
  return parseMenu(competitor.text).items
    .filter((i) => i.price != null && i.confidence !== "low")
    .map((i) => ({
      city, area: area ?? null, dish_key: compareKey(i.name), dish_name: i.name, price: i.price!, currency,
      channel: "dine_in" as const, source_url: competitor.url ?? null, collected_at: today,
    }));
}
