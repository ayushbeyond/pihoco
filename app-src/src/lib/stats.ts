// Public, live numbers about PIHOCO's data. Every figure is counted from the database at view time.
import { db } from "./db";
import { DISH_BY_KEY } from "../engine/core";

export interface PublicStats {
  menus: number; prices: number; dishes: number; comparable_dishes: number; cities: string[];
  collected_to: string | null; xrays: number; index_countries: string[]; index_latest: string | null;
}

export async function loadStats(): Promise<PublicStats | null> {
  const { data, error } = await db.rpc("public_stats");
  return error || !data ? null : (data as PublicStats);
}

export interface DishPrice { key: string; name: string; n: number; median: number; low: number; high: number; p25: number; p75: number }

const q = (s: number[], p: number) => { const pos = (s.length - 1) * p; const lo = Math.floor(pos); return s[lo] + (s[Math.ceil(pos)] - s[lo]) * (pos - lo); };

/** Median and range per comparable dish in a city: only dishes seen on at least `minMenus` menus. */
export async function cityPriceIndex(city: string, minMenus = 5): Promise<{ rows: DishPrice[]; menus: number; collected: string | null }> {
  const { data, error } = await db.from("benchmark_items").select("dish_key,dish_name,price,source_url,collected_at").ilike("city", city).limit(10000);
  if (error || !data) return { rows: [], menus: 0, collected: null };
  const by = new Map<string, { names: Map<string, number>; perMenu: Map<string, number> }>();
  const menus = new Set<string>();
  let collected: string | null = null;
  for (const r of data as { dish_key: string; dish_name: string; price: number; source_url: string | null; collected_at: string | null }[]) {
    const menu = r.source_url ?? "unknown";
    menus.add(menu);
    if (r.collected_at && (!collected || r.collected_at > collected)) collected = r.collected_at;
    if (r.dish_key.startsWith("x:")) continue;
    const g = by.get(r.dish_key) ?? { names: new Map(), perMenu: new Map() };
    g.names.set(r.dish_name, (g.names.get(r.dish_name) ?? 0) + 1);
    // one price per menu per dish (the lowest, e.g. the regular size)
    const prev = g.perMenu.get(menu);
    g.perMenu.set(menu, prev == null ? Number(r.price) : Math.min(prev, Number(r.price)));
    by.set(r.dish_key, g);
  }
  const rows: DishPrice[] = [];
  for (const [key, g] of by) {
    const prices = [...g.perMenu.values()].sort((a, b) => a - b);
    if (prices.length < minMenus) continue;
    const base = key.split(":")[0];
    const name = DISH_BY_KEY[base] && !key.includes(":") ? DISH_BY_KEY[base].name : [...g.names.entries()].sort((a, b) => b[1] - a[1])[0][0];
    rows.push({ key, name, n: prices.length, median: q(prices, 0.5), low: prices[0], high: prices[prices.length - 1], p25: q(prices, 0.25), p75: q(prices, 0.75) });
  }
  rows.sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
  return { rows, menus: menus.size, collected };
}
