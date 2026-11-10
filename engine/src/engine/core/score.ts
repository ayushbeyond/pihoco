// The five-part PIHOCO menu score. Every point has evidence; a dimension with no
// data is "not assessed" and the total is re-weighted over what was assessed.
import {
  ADDON_MARKERS, COMBO_MARKERS, CONCEPT_NORMS, DIETARY_MARKERS, DRINK_SECTIONS,
  FOOD_SECTIONS, METHODS, ORIGIN, SENSORY, SIGNATURE_MARKERS,
} from "./lexicon";
import { clamp, endingStyle, median, monthsBetween, currentMonth, round } from "./stats";
import type { BenchmarkRow, DimensionScore, Evidence, MenuItem, PriceIndexPoint, XrayInputs } from "./types";
import { compareKey } from "./match";

export const WEIGHTS = { structure: 0.2, pricing: 0.25, merchandising: 0.15, upsell: 0.2, market: 0.2 } as const;
export const MIN_BENCHMARK_OBS = 5;   // never compare a dish against fewer than this many local prices
export const MIN_BENCHMARK_DISHES = 3; // need at least this many comparable dishes to score the market

export function groupByCategory(items: MenuItem[]): Map<string, MenuItem[]> {
  const m = new Map<string, MenuItem[]>();
  for (const it of items) { const a = m.get(it.category) ?? []; a.push(it); m.set(it.category, a); }
  return m;
}
const isFood = (it: MenuItem) => FOOD_SECTIONS.includes(it.section) || it.section === "other";
const pct = (n: number) => `${Math.round(n * 100)}%`;
const wordHit = (text: string, words: string[]) => { const t = ` ${text.toLowerCase()} `; return words.some((w) => t.includes(` ${w}`) ); };

// ---------------------------------------------------------------- 1 Structure
export function scoreStructure(items: MenuItem[], inputs: XrayInputs): DimensionScore {
  const norm = CONCEPT_NORMS[inputs.concept];
  const ev: Evidence[] = [];
  let s = 100;
  const n = items.length;
  const cats = groupByCategory(items);
  const [lo, hi] = norm.totalItems;
  if (n > hi) { const over = (n - hi) / hi; s -= clamp(over * 60, 8, 35); ev.push({ text: `${n} items is more than a ${inputs.concept.replace("_", " ")} usually needs (${lo}–${hi}). Long menus slow decisions and spread prep thin.`, tone: "leak" }); }
  else if (n < lo) { s -= 10; ev.push({ text: `${n} items is a tight menu (typical ${lo}–${hi}). Good for speed; check every guest type has an option.`, tone: "neutral" }); }
  else ev.push({ text: `${n} items sits in the usual range for this concept (${lo}–${hi}).`, tone: "gain" });

  const [clo, chi] = norm.categories;
  if (cats.size > chi) { s -= 12; ev.push({ text: `${cats.size} sections. Guests scan best with ${clo}–${chi}; merge the thin ones.`, tone: "leak" }); }
  if (cats.size < clo && n > 12) { s -= 12; ev.push({ text: `Only ${cats.size} section${cats.size === 1 ? "" : "s"} for ${n} items. Headings help guests find what they want and spend more.`, tone: "leak" }); }

  const [plo, phi] = norm.perCategory;
  const crowded: string[] = [], thin: string[] = [];
  for (const [c, its] of cats) {
    if (its.length > phi + 2) crowded.push(`${c} (${its.length})`);
    else if (its.length < Math.max(2, plo - 1) && !its.every((i) => DRINK_SECTIONS.includes(i.section) || i.section === "extras" || i.section === "sides")) thin.push(`${c} (${its.length})`);
  }
  if (crowded.length) { s -= Math.min(30, crowded.length * 10); ev.push({ text: `Crowded sections: ${crowded.join(", ")}. Above ~${phi} choices, guests default to what they know or the cheapest.`, tone: "leak" }); }
  if (thin.length) { s -= Math.min(15, thin.length * 5); ev.push({ text: `Thin sections: ${thin.join(", ")}. Fold them in or build them out.`, tone: "neutral" }); }

  const food = items.filter((i) => FOOD_SECTIONS.includes(i.section)).length;
  const drinks = items.filter((i) => DRINK_SECTIONS.includes(i.section)).length;
  if (inputs.concept !== "bar" && n >= 12 && drinks === 0) ev.push({ text: "No drinks found on this menu. If drinks are on a separate list, paste it in too: drinks are usually the highest-margin line.", tone: "neutral" });
  if (inputs.concept === "cafe" && food > 0 && drinks > 0 && food > drinks * 3) ev.push({ text: `Food outnumbers drinks ${food} to ${drinks}. For a café, drinks usually carry the margin.`, tone: "neutral" });

  return { key: "structure", label: "Structure & balance", weight: WEIGHTS.structure, score: round(clamp(s)), evidence: ev, missing: [] };
}

// ---------------------------------------------------------------- 2 Pricing
export interface CategoryPricing { category: string; n: number; min: number; max: number; median: number; spread: number; hasAnchor: boolean; ascending: boolean }

export function categoryPricing(items: MenuItem[]): CategoryPricing[] {
  const out: CategoryPricing[] = [];
  for (const [c, its] of groupByCategory(items)) {
    const ps = its.map((i) => i.price).filter((p): p is number => p != null);
    if (ps.length < 3) continue;
    const sorted = [...ps].sort((a, b) => a - b);
    const med = median(ps)!;
    const ascending = ps.length >= 4 && ps.every((p, i) => i === 0 || p >= ps[i - 1]) && sorted[0] !== sorted[sorted.length - 1];
    out.push({ category: c, n: ps.length, min: sorted[0], max: sorted[sorted.length - 1], median: med, spread: sorted[sorted.length - 1] / sorted[0], hasAnchor: sorted[sorted.length - 1] >= med * 1.3, ascending });
  }
  return out;
}

export function scorePricing(items: MenuItem[], currencySymbolsOnItems: number): DimensionScore {
  const ev: Evidence[] = [];
  const missing: string[] = [];
  const priced = items.filter((i) => i.price != null);
  if (priced.length < 5) return { key: "pricing", label: "Price architecture", weight: WEIGHTS.pricing, score: null, evidence: [], missing: ["At least 5 priced items"] };
  let s = 100;
  const cp = categoryPricing(items).filter((c) => c.category !== "Menu" || items.every((i) => i.category === "Menu"));

  const flat = cp.filter((c) => c.spread < 1.25 && c.n >= 4);
  const wide = cp.filter((c) => c.spread > 3.2);
  const noAnchor = cp.filter((c) => !c.hasAnchor && c.n >= 4);
  const ladders = cp.filter((c) => c.ascending);
  if (flat.length) { s -= Math.min(25, flat.length * 9); ev.push({ text: `Flat pricing in ${flat.map((c) => c.category).join(", ")}: every dish costs about the same, so nothing steers guests to the dishes that earn most.`, tone: "leak" }); }
  if (wide.length) { s -= Math.min(20, wide.length * 7); ev.push({ text: `Very wide price range in ${wide.map((c) => `${c.category} (${round(c.spread, 1)}×)`).join(", ")}. Guests anchor on the cheapest; consider splitting premium items into their own section.`, tone: "leak" }); }
  if (noAnchor.length) { s -= Math.min(20, noAnchor.length * 6); ev.push({ text: `No premium "anchor" dish in ${noAnchor.map((c) => c.category).join(", ")}. One clearly higher-priced dish makes the rest feel like good value.`, tone: "leak" }); }
  if (ladders.length) { s -= Math.min(15, ladders.length * 5); ev.push({ text: `Prices listed cheapest to dearest in ${ladders.map((c) => c.category).join(", ")}. A ranked list invites guests to shop by price; order by what you want to sell.`, tone: "leak" }); }
  const goodCats = cp.length - new Set([...flat, ...wide, ...noAnchor, ...ladders].map((c) => c.category)).size;
  if (goodCats > 0) ev.push({ text: `${goodCats} of ${cp.length} sections ${goodCats === 1 ? "has" : "have"} a healthy price ladder.`, tone: "gain" });

  // ending consistency
  const styles = new Map<string, number>();
  for (const it of priced) { const st = endingStyle(it.price!); styles.set(st, (styles.get(st) ?? 0) + 1); }
  const top = Math.max(...styles.values());
  if (top / priced.length < 0.75) { s -= 8; ev.push({ text: `Price endings are mixed (${[...styles.keys()].join(", ")}). Pick one style; consistency reads as confidence.`, tone: "neutral" }); }

  // currency signs
  const signShare = currencySymbolsOnItems / priced.length;
  if (signShare > 0.5) { s -= 7; ev.push({ text: `Currency signs on ${pct(signShare)} of prices. Research from Cornell found guests spent more when menus showed plain numbers without currency signs.`, tone: "leak" }); }

  if (!cp.length) missing.push("Sections with 3+ priced dishes to judge the price ladder");
  return { key: "pricing", label: "Price architecture", weight: WEIGHTS.pricing, score: round(clamp(s)), evidence: ev, missing };
}

// ---------------------------------------------------------------- 3 Merchandising
export function scoreMerchandising(items: MenuItem[]): DimensionScore {
  const ev: Evidence[] = [];
  const food = items.filter((i) => isFood(i) && i.section !== "extras" && i.section !== "sides");
  if (food.length < 4) return { key: "merchandising", label: "Descriptions & merchandising", weight: WEIGHTS.merchandising, score: null, evidence: [], missing: ["At least 4 food items"] };
  const withDesc = food.filter((i) => i.description.trim().split(/\s+/).length >= 3);
  const coverage = withDesc.length / food.length;
  const words = withDesc.map((i) => i.description.trim().split(/\s+/).length);
  const avgWords = words.length ? words.reduce((a, b) => a + b, 0) / words.length : 0;
  const vivid = withDesc.filter((i) => wordHit(`${i.name} ${i.description}`, SENSORY) || wordHit(`${i.name} ${i.description}`, METHODS));
  const origin = food.filter((i) => wordHit(`${i.name} ${i.description}`, ORIGIN));
  const signature = items.filter((i) => SIGNATURE_MARKERS.test(`${i.name} ${i.description} ${i.category}`));
  const dietary = items.filter((i) => DIETARY_MARKERS.test(`${i.name} ${i.description}`));

  let s = 0;
  s += clamp(coverage / 0.7, 0, 1) * 40;                                        // 40: most dishes described
  s += avgWords === 0 ? 0 : avgWords < 6 ? 8 : avgWords <= 22 ? 15 : 9;        // 15: right length
  s += withDesc.length ? clamp((vivid.length / withDesc.length) / 0.6, 0, 1) * 20 : 0; // 20: vivid language
  s += signature.length >= 1 && signature.length <= Math.max(3, food.length * 0.15) ? 15 : signature.length ? 7 : 0; // 15: a few highlighted
  s += dietary.length ? 10 : 0;                                                  // 10: dietary cues

  ev.push({ text: `${pct(coverage)} of dishes have a description${coverage < 0.7 ? "; aim for 70%+ on the dishes you most want to sell." : "."}`, tone: coverage >= 0.7 ? "gain" : "leak" });
  if (withDesc.length) ev.push({ text: `Average description: ${round(avgWords)} words${avgWords > 22 ? ": trim to the 2–3 details that make guests want it." : avgWords < 6 ? ": too short to sell the dish." : "."}`, tone: avgWords >= 6 && avgWords <= 22 ? "gain" : "neutral" });
  if (withDesc.length) ev.push({ text: `${vivid.length} of ${withDesc.length} descriptions use taste or cooking words (crisp, slow-cooked, charred…).`, tone: vivid.length / withDesc.length >= 0.6 ? "gain" : "leak" });
  ev.push({ text: signature.length ? `${signature.length} dish${signature.length > 1 ? "es are" : " is"} highlighted as signature or chef's pick.` : "Nothing is highlighted as a signature or chef's pick. Guests look for a recommendation.", tone: signature.length && signature.length <= 3 ? "gain" : signature.length ? "neutral" : "leak" });
  if (origin.length) ev.push({ text: `${origin.length} dish${origin.length > 1 ? "es mention" : " mentions"} provenance or house-made. Good, use it on your best earners.`, tone: "gain" });
  if (!dietary.length) ev.push({ text: "No dietary markers (V, VG, GF, Jain, halal). Guests who need them will ask, or go elsewhere.", tone: "neutral" });

  return { key: "merchandising", label: "Descriptions & merchandising", weight: WEIGHTS.merchandising, score: round(clamp(s)), evidence: ev, missing: [] };
}

// ---------------------------------------------------------------- 4 Upsell
export function scoreUpsell(items: MenuItem[], inputs: XrayInputs): DimensionScore {
  const ev: Evidence[] = [];
  const all = (i: MenuItem) => `${i.name} ${i.description} ${i.category}`;
  const addons = items.filter((i) => i.section === "extras" || ADDON_MARKERS.test(all(i)) || /\+\s?\d/.test(i.description));
  const sides = items.filter((i) => i.section === "sides" || i.section === "rice_breads");
  const sizes = items.filter((i) => i.prices.length >= 2);
  const combos = items.filter((i) => COMBO_MARKERS.test(all(i)) || i.section === "sharing");
  const desserts = items.filter((i) => i.section === "desserts" || i.section === "bakery");
  const drinks = items.filter((i) => DRINK_SECTIONS.includes(i.section));
  const isCafe = inputs.concept === "cafe";

  const checks: [boolean, number, string, string][] = [
    [addons.length > 0, 25, `${addons.length} add-on or extra option${addons.length === 1 ? "" : "s"} found.`, "No add-ons or extras (add cheese, extra shot, add a side). That is the easiest money on a menu."],
    [sides.length >= 2 || isCafe, 15, `${sides.length} sides to pair with mains.`, "Fewer than 2 sides. Sides are a natural second item on every order."],
    [sizes.length > 0, 15, `${sizes.length} item${sizes.length === 1 ? "" : "s"} offered in more than one size.`, "No size options. A regular/large choice lifts the average spend without adding new dishes."],
    [combos.length > 0, 20, `${combos.length} combo, set or sharing option${combos.length === 1 ? "" : "s"}.`, "No combos, sets or sharing plates. Bundles raise the bill and speed up ordering."],
    [desserts.length >= 2, 10, `${desserts.length} desserts or bakes to close the meal.`, "Fewer than 2 desserts. A short, strong dessert list is a reliable add-on."],
    [drinks.length >= 4 || inputs.concept === "qsr", 15, `${drinks.length} drinks on this menu.`, "Few or no drinks on this menu. If they're on another list, add it to the X-ray."],
  ];
  let s = 0;
  for (const [ok, pts, good, bad] of checks) { if (ok) s += pts; ev.push({ text: ok ? good : bad, tone: ok ? "gain" : "leak" }); }
  return { key: "upsell", label: "Upsell paths", weight: WEIGHTS.upsell, score: round(clamp(s)), evidence: ev, missing: [] };
}

// ---------------------------------------------------------------- 5 Market
export interface DishComparison { item: string; price: number; key: string; n: number; median: number; p25: number; p75: number; gap: number }

export function compareToBenchmark(items: MenuItem[], rows: BenchmarkRow[], inputs: XrayInputs, minObs = MIN_BENCHMARK_OBS): DishComparison[] {
  const city = inputs.city.trim().toLowerCase();
  const byKey = new Map<string, number[]>();
  for (const r of rows) {
    if (r.city.trim().toLowerCase() !== city) continue;
    const a = byKey.get(r.dish_key) ?? []; a.push(r.price); byKey.set(r.dish_key, a);
  }
  const out: DishComparison[] = [];
  for (const it of items) {
    if (it.price == null) continue;
    const key = compareKey(it.name);
    const obs = byKey.get(key) ?? byKey.get(key.split(":")[0]);
    if (!obs || obs.length < minObs) continue;
    const sorted = [...obs].sort((a, b) => a - b);
    const q = (p: number) => { const pos = (sorted.length - 1) * p; const lo = Math.floor(pos); return sorted[lo] + (sorted[Math.ceil(pos)] - sorted[lo]) * (pos - lo); };
    const med = q(0.5);
    out.push({ item: it.name, price: it.price, key, n: sorted.length, median: med, p25: q(0.25), p75: q(0.75), gap: (it.price - med) / med });
  }
  return out;
}

/** Price-index drift since the last price change, e.g. 0.06 = 6% (null if unknown). */
export function priceDrift(points: PriceIndexPoint[], inputs: XrayInputs, now = currentMonth()): { drift: number; from: string; to: string; months: number } | null {
  if (!inputs.lastPriceChange) return null;
  const series = points.filter((p) => p.country === inputs.country).sort((a, b) => a.month.localeCompare(b.month));
  if (series.length < 2) return null;
  const from = [...series].reverse().find((p) => p.month <= inputs.lastPriceChange!) ?? null;
  const to = [...series].reverse().find((p) => p.month <= now) ?? null;
  if (!from || !to || from.month === to.month) return null;
  return { drift: to.value / from.value - 1, from: from.month, to: to.month, months: monthsBetween(from.month, to.month) };
}

export function scoreMarket(items: MenuItem[], inputs: XrayInputs, rows: BenchmarkRow[], index: PriceIndexPoint[]): DimensionScore {
  const ev: Evidence[] = [];
  const missing: string[] = [];
  const comps = compareToBenchmark(items, rows, inputs);
  const drift = priceDrift(index, inputs);
  const parts: number[] = [];

  if (comps.length >= MIN_BENCHMARK_DISHES) {
    const under = comps.filter((c) => c.gap < -0.08), over = comps.filter((c) => c.gap > 0.15);
    const avgAbs = comps.reduce((a, c) => a + Math.abs(c.gap), 0) / comps.length;
    parts.push(clamp(100 - avgAbs * 250));
    ev.push({ text: `${comps.length} dishes compared with local prices in ${inputs.city} (${Math.min(...comps.map((c) => c.n))}+ menus each).`, tone: "neutral" });
    if (under.length) ev.push({ text: `${under.length} priced more than 8% below the local median: ${under.slice(0, 4).map((c) => c.item).join(", ")}${under.length > 4 ? "…" : ""}.`, tone: "leak" });
    if (over.length) ev.push({ text: `${over.length} priced more than 15% above the local median. Fine if the dish earns it, risky if not.`, tone: "neutral" });
  } else missing.push(`Local price data: we need ${MIN_BENCHMARK_OBS}+ menus per dish in ${inputs.city || "your city"}. Use Price Check to add competitors you know.`);

  if (drift) {
    const d = drift.drift;
    parts.push(d < 0.02 ? 100 : d < 0.05 ? 75 : d < 0.1 ? 50 : 25);
    ev.push({ text: `Restaurant prices in your country have moved ${pct(d)} since your last price change (${drift.from} → ${drift.to}, official price index). Your menu is that much cheaper in real terms.`, tone: d >= 0.03 ? "leak" : "gain" });
  } else if (!inputs.lastPriceChange) missing.push("When you last changed prices");

  const score = parts.length ? round(parts.reduce((a, b) => a + b, 0) / parts.length) : null;
  return { key: "market", label: "Market position", weight: WEIGHTS.market, score, evidence: ev, missing };
}
