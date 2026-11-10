// Runs the whole X-ray: scores, findings, rewrites, verdict.
import { DISH_BY_KEY } from "./dishes";
import { COUNTRY_CURRENCY, DRINK_SECTIONS, FOOD_SECTIONS, SIGNATURE_MARKERS } from "./lexicon";
import { DEFAULT_ASSUMPTIONS, addonLever, closerLever, repriceLever, testPrice, type LeverAssumptions } from "./money";
import {
  categoryPricing, compareToBenchmark, priceDrift, scoreMarket, scoreMerchandising, scorePricing,
  scoreStructure, scoreUpsell,
} from "./score";
import { median, round } from "./stats";
import type { BenchmarkRow, Currency, Finding, MenuItem, PriceIndexPoint, Rewrite, XrayInputs, XrayResult } from "./types";

export const ENGINE_VERSION = "xray-1.0.0";

export interface XrayOptions {
  benchmark?: BenchmarkRow[];
  priceIndex?: PriceIndexPoint[];
  currencySymbolsOnItems?: number;
  assumptions?: LeverAssumptions;
  currency?: Currency;
}

function verdictFor(score: number, coverage: number): string {
  const v = score >= 80 ? "A well-built menu. The gains are in the details."
    : score >= 65 ? "Solid, with money left on the table."
    : score >= 50 ? "Busy, but not earning in the right places."
    : "This menu is working against you.";
  return coverage < 0.75 ? `${v} (Partial read: add the missing inputs for a full score.)` : v;
}

export function buildRewrites(items: MenuItem[], max = 3): Rewrite[] {
  const candidates = items
    .filter((i) => i.dishKey && DISH_BY_KEY[i.dishKey] && (i.description.trim().split(/\s+/).filter(Boolean).length < 6))
    .filter((i) => FOOD_SECTIONS.includes(i.section) || DRINK_SECTIONS.includes(i.section))
    // prefer the dearer dishes: a better description is worth more there
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  const seen = new Set<string>();
  const out: Rewrite[] = [];
  for (const it of candidates) {
    if (seen.has(it.dishKey!)) continue;
    seen.add(it.dishKey!);
    out.push({ item: it.name, before: it.description || "(no description)", after: DISH_BY_KEY[it.dishKey!].desc, note: "Starting point from the classic recipe. Edit it to match yours." });
    if (out.length >= max) break;
  }
  return out;
}

export function runXray(items: MenuItem[], inputs: XrayInputs, opts: XrayOptions = {}): XrayResult {
  const currency = opts.currency ?? COUNTRY_CURRENCY[inputs.country];
  const a = opts.assumptions ?? DEFAULT_ASSUMPTIONS;
  const bench = opts.benchmark ?? [];
  const idx = opts.priceIndex ?? [];
  const symbols = opts.currencySymbolsOnItems ?? 0;

  const dims = [
    scoreStructure(items, inputs),
    scorePricing(items, symbols),
    scoreMerchandising(items),
    scoreUpsell(items, inputs),
    scoreMarket(items, inputs, bench, idx),
  ];
  const assessed = dims.filter((d) => d.score != null);
  const wSum = assessed.reduce((s, d) => s + d.weight, 0);
  const score = wSum ? round(assessed.reduce((s, d) => s + d.score! * d.weight, 0) / wSum) : 0;
  const coverage = round(wSum, 2);

  // ---------- findings
  const F: Finding[] = [];
  const drift = priceDrift(idx, inputs);
  if (drift && drift.drift > 0.02) {
    F.push({
      id: "reprice", lever: "Catch up with rising costs",
      why: `Restaurant prices in your market have moved ${Math.round(drift.drift * 100)}% since you last changed yours (${drift.from}).`,
      action: "Reprice in one planned step: raise your strongest sellers and dishes with no close competitor first; hold your entry-price items.",
      items: [], priority: 90 + drift.drift * 100, confidence: "high",
      money: repriceLever(inputs, drift.drift, currency, a),
    });
  }

  const comps = compareToBenchmark(items, bench, inputs).filter((c) => c.gap < -0.08).sort((x, y) => x.gap - y.gap);
  if (comps.length) {
    const perSale = comps.slice(0, 6).map((c) => ({ item: c.item, from: c.price, to: testPrice(c.price, c.median) }));
    const unitsKnown = items.filter((i) => i.weeklyUnits && comps.some((c) => c.item === i.name));
    let money = null;
    if (unitsKnown.length) {
      const m = unitsKnown.reduce((s, i) => { const p = perSale.find((x) => x.item === i.name); return s + (p ? (p.to - p.from) * i.weeklyUnits! * 52 / 12 : 0); }, 0);
      money = { low: Math.round(m * 0.6), high: Math.round(m), currency, period: "month" as const, assumptions: ["Weekly units you entered", "Low end assumes 40% of the gain is lost to fewer orders"] };
    }
    F.push({
      id: "underpriced", lever: "Dishes priced below the local market",
      why: `${comps.length} dish${comps.length > 1 ? "es sit" : " sits"} more than 8% under what comparable places in ${inputs.city} charge.`,
      action: "Test a small step toward the local median on these dishes for 4 weeks and watch orders.",
      items: comps.map((c) => c.item), priority: 85, confidence: "medium", money, perSale,
    });
  }

  const up = dims.find((d) => d.key === "upsell")!;
  const hasAddons = up.evidence[0]?.tone === "gain";
  if (!hasAddons) {
    F.push({
      id: "addons", lever: "Add an add-on line",
      why: "Nothing on the menu invites a second purchase on the same dish.",
      action: "Add 3–5 add-ons where they fit naturally: extra shot, add cheese, add a side, make it a meal. Price them as round, easy numbers.",
      items: [], priority: 80, confidence: "medium", money: addonLever(inputs, currency, a),
    });
  }
  const desserts = items.filter((i) => i.section === "desserts" || i.section === "bakery").length;
  const drinks = items.filter((i) => DRINK_SECTIONS.includes(i.section)).length;
  if (desserts < 2 || (drinks < 4 && inputs.concept !== "qsr")) {
    F.push({
      id: "closer", lever: desserts < 2 ? "Build the dessert close" : "Give drinks a proper section",
      why: desserts < 2 ? "There is almost nothing to order after the main course." : "Drinks are thin on this menu, and they usually carry the best margin.",
      action: desserts < 2 ? "Offer 3–4 desserts, including one to share, and have staff mention them as plates are cleared." : "List 6–10 drinks with short descriptions and one house signature.",
      items: [], priority: 60, confidence: "medium", money: closerLever(inputs, currency, a),
    });
  }

  for (const c of categoryPricing(items)) {
    if (!c.hasAnchor && c.n >= 4) {
      const top = items.filter((i) => i.category === c.category && i.price != null).sort((x, y) => y.price! - x.price!)[0];
      F.push({
        id: `anchor:${c.category}`, lever: `Add a premium anchor to ${c.category}`,
        why: `${c.category} runs ${round(c.min, 1)}–${round(c.max, 1)} with no stand-out dish. Without a high anchor, mid-priced dishes don't look like good value.`,
        action: `Add one premium version (bigger cut, better ingredient, sharing size) priced about 30–40% above ${top?.name ?? "the current top dish"}, and place it first.`,
        items: [], priority: 55 + c.n, confidence: "medium",
      });
    }
    if (c.ascending) {
      F.push({
        id: `order:${c.category}`, lever: `Stop listing ${c.category} cheapest-first`,
        why: "A list that climbs in price invites guests to choose by price, and they choose the cheapest.",
        action: "Put your best-earning dish first or boxed, and scatter prices so they don't form a column to scan.",
        items: [], priority: 50, confidence: "high",
      });
    }
  }

  const mer = dims.find((d) => d.key === "merchandising")!;
  if (mer.score != null && mer.score < 60) {
    F.push({
      id: "descriptions", lever: "Make the dishes you want to sell sound worth it",
      why: "Most dishes are listed by name only, or with flat wording.",
      action: "Write 10–20 words for your top 8 earners: one taste word, one cooking method, one detail of origin. See the suggested rewrites below.",
      items: [], priority: 58, confidence: "medium",
    });
  }
  if (!items.some((i) => SIGNATURE_MARKERS.test(`${i.name} ${i.description} ${i.category}`)) && items.length >= 10) {
    F.push({
      id: "signature", lever: "Point guests to two or three dishes",
      why: "Nothing is marked as a signature or chef's pick, so guests default to what they already know.",
      action: "Mark 2–3 high-earning dishes as \"Chef's pick\" or box them. Not more: if everything is special, nothing is.",
      items: [], priority: 52, confidence: "medium",
    });
  }
  const st = dims.find((d) => d.key === "structure")!;
  if (st.score != null && st.score < 70) {
    F.push({
      id: "structure", lever: "Cut and regroup the menu",
      why: st.evidence.find((e) => e.tone === "leak")?.text ?? "The menu structure makes choosing harder than it needs to be.",
      action: "Remove the slowest sellers in crowded sections and merge thin sections. Fewer choices usually means faster orders and less waste.",
      items: [], priority: 48, confidence: "medium",
    });
  }

  // money findings first, then by priority
  F.sort((x, y) => (y.money ? y.money.high : 0) - (x.money ? x.money.high : 0) || y.priority - x.priority);

  const priced = items.map((i) => i.price).filter((p): p is number => p != null);
  return {
    version: ENGINE_VERSION,
    score, coverage, assessed: assessed.length,
    verdict: verdictFor(score, coverage),
    dimensions: dims,
    findings: F,
    rewrites: buildRewrites(items),
    stats: {
      items: items.length, priced: priced.length,
      categories: new Set(items.map((i) => i.category)).size,
      withDescription: items.filter((i) => i.description.trim()).length,
      medianPrice: median(priced), currency,
    },
    disclaimer: "A PIHOCO diagnostic, not an industry rating. Scores come from the menu text only; money figures are scenarios from your own numbers, not forecasts. Profitability needs recipe costs and sales data, which the full audit covers.",
  };
}
