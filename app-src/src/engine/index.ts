// PIHOCO Menu X-ray — the API the UI uses. Thin adapter over ./core (the tested,
// deterministic engine). No AI. Only network use: findNearby (OpenStreetMap).
import * as core from "./core";

export type Confidence = "high" | "med" | "low";

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number | null;
  confidence: Confidence;
  flags?: string[];             // why a row is not high confidence (show as tooltip)
  prices?: number[];            // all prices on the line, e.g. sizes 14 / 18
  weeklyUnits?: number | null;  // optional, typed by the owner
}

export interface AuditInputs {
  restaurantName: string;
  city: string;
  area?: string;
  country: string;   // "UAE" | "UK" | "US" | "India" | "Singapore" or ISO code
  currency: string;
  concept: string;   // restaurant | café | bar | cloud kitchen | QSR
  cuisine: string;
  coversPerWeek?: number | null;
  avgBill?: number | null;
  lastPriceChange?: string | null; // YYYY-MM
}

export type Tone = "gain" | "leak" | "neutral";
export interface Dimension {
  key: string;
  label: string;
  weight: number;            // 0..1
  score: number | null;      // 0..100, null = not assessed
  evidence: string[];
  evidenceDetail: { text: string; tone: Tone }[]; // same lines, with gain/leak colour
  missing: string[];         // what would let us assess / improve this
}

export interface MoneyRange { low: number; high: number; assumptions?: string[] }

export interface Finding {
  lever: string;             // stable id, e.g. "addons", "reprice", "anchor:MAINS"
  title: string;
  evidence: string;
  action: string;
  money?: MoneyRange | null;
  items?: string[];
  perSale?: { item: string; from: number; to: number }[]; // suggested test prices
  confidence?: "high" | "medium" | "low";
}

export interface LeverAssumption {
  key: string; label: string; unit: string; min: number; max: number; step: number; default: number;
}

export interface Rewrite { itemId: string; name: string; before: string; after: string; note?: string }

export interface XrayResult {
  score: number;
  assessed: number;
  total: number;
  coverage: number;          // share of score weight assessed, 0..1
  verdict: string;
  currency: string;
  dimensions: Dimension[];
  findings: Finding[];
  levers: LeverAssumption[];
  rewrites: Rewrite[];
  drift: number | null;      // price-index movement since last price change
  disclaimer: string;
  engineVersion: string;
}

export interface CompetitorMenu { name: string; text: string; url?: string }
export interface PriceRow {
  dish: string;
  yours: number | null;
  theirs: { name: string; price: number | null; dish?: string }[]; // name = competitor, dish = their dish name
  median: number | null;
  gapPct: number | null;      // e.g. -12.5 means 12.5% below the median
  confidence?: "high" | "medium" | "low";
}
export interface NearbyPlace {
  name: string; type: string; lat: number; lon: number; cuisine?: string;
  website?: string; distanceM?: number; address?: string;
}

export type BenchmarkRow = core.BenchmarkRow;
export type PriceIndexPoint = core.PriceIndexPoint;
export interface XrayData {
  benchmark?: BenchmarkRow[];    // rows from benchmark_items for this city
  priceIndex?: PriceIndexPoint[]; // rows from price_index for this country
}
export const OSM_ATTRIBUTION = core.OSM_ATTRIBUTION;
export const ENGINE_VERSION = core.ENGINE_VERSION;

// ------------------------------------------------------------------ mapping
const COUNTRY: Record<string, core.Country> = {
  uae: "AE", ae: "AE", "united arab emirates": "AE", uk: "GB", gb: "GB", "united kingdom": "GB",
  us: "US", usa: "US", "united states": "US", india: "IN", in: "IN", singapore: "SG", sg: "SG",
};
export const toCountry = (c: string): core.Country => COUNTRY[c.trim().toLowerCase()] ?? "AE";
export function toConcept(c: string): core.Concept {
  const t = c.toLowerCase();
  if (t.includes("caf")) return "cafe";
  if (t.includes("bar") || t.includes("pub")) return "bar";
  if (t.includes("cloud") || t.includes("delivery")) return "cloud_kitchen";
  if (t.includes("qsr") || t.includes("quick")) return "qsr";
  return "restaurant";
}
const toUiConf = (c: core.Confidence): Confidence => (c === "medium" ? "med" : c);
const toCoreConf = (c: Confidence): core.Confidence => (c === "med" ? "medium" : c);

function toCoreInputs(i: AuditInputs): core.XrayInputs {
  return {
    restaurantName: i.restaurantName, city: i.city, area: i.area, country: toCountry(i.country),
    concept: toConcept(i.concept), cuisine: i.cuisine,
    coversPerWeek: i.coversPerWeek ?? null, avgBill: i.avgBill ?? null, lastPriceChange: i.lastPriceChange || null,
  };
}

function toCoreItem(u: MenuItem): core.MenuItem {
  const base: core.MenuItem = {
    id: u.id, category: u.category || "Menu", section: "other", name: u.name, description: u.description ?? "",
    price: u.price, prices: u.prices?.length ? u.prices : u.price != null ? [u.price] : [],
    rawLine: u.name, confidence: toCoreConf(u.confidence), flags: u.flags ?? [], weeklyUnits: u.weeklyUnits ?? null,
  };
  const r = core.refreshItem(base);
  return { ...r, confidence: base.confidence, flags: base.flags }; // keep the reviewer's state
}

// remembered from the last parse so the X-ray can judge currency signs
let lastSymbolShare = 0;

// ------------------------------------------------------------------ parsing
export function parseMenu(text: string): MenuItem[] {
  const r = core.parseMenu(text);
  const priced = r.items.filter((i) => i.price != null).length || 1;
  lastSymbolShare = r.currencySymbolsOnItems / priced;
  return r.items.map((i) => ({
    id: i.id, category: i.category, name: i.name, description: i.description, price: i.price,
    confidence: toUiConf(i.confidence), flags: i.flags, prices: i.prices, weeklyUnits: null,
  }));
}

/** Currency the menu text itself shows, if any (e.g. "AED"). */
export function detectCurrency(text: string): string | null {
  return core.parseMenu(text).currencyDetected;
}

export function newItem(category = "Menu"): MenuItem {
  return { id: `i${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, category, name: "", description: "", price: null, confidence: "med", flags: ["new row"] };
}

/** Re-check a row after the owner edits it (call on blur). */
export function reviewItem(u: MenuItem): MenuItem {
  const ok = !!u.name.trim() && u.price != null && u.price > 0;
  return { ...u, prices: u.price != null ? [u.price] : [], confidence: ok ? "high" : "low", flags: ok ? [] : ["needs a name and a price"] };
}

// ------------------------------------------------------------------ x-ray
export const LEVERS: LeverAssumption[] = [
  { key: "repriceCap", label: "Largest single reprice step", unit: "%", min: 2, max: 10, step: 1, default: 6 },
  { key: "repriceKept", label: "Share of a reprice you keep after any lost orders", unit: "%", min: 40, max: 100, step: 5, default: 75 },
  { key: "addonAttach", label: "Covers that take an add-on", unit: "%", min: 2, max: 20, step: 1, default: 10 },
  { key: "addonPriceShare", label: "Add-on price, as a share of the average bill", unit: "%", min: 5, max: 25, step: 1, default: 12 },
  { key: "closerAttach", label: "Extra covers adding a dessert or drink", unit: "%", min: 1, max: 15, step: 1, default: 8 },
  { key: "closerPriceShare", label: "Dessert or drink price, as a share of the bill", unit: "%", min: 8, max: 30, step: 1, default: 18 },
];
const leverDefaults = () => Object.fromEntries(LEVERS.map((l) => [l.key, l.default]));

function toCoreAssumptions(a: Record<string, number>): core.LeverAssumptions {
  const v = { ...leverDefaults(), ...a };
  const hi = (k: string) => v[k] / 100;
  return {
    repriceCap: hi("repriceCap"), repriceKept: hi("repriceKept"),
    addonAttach: [hi("addonAttach") * 0.4, hi("addonAttach")], addonPriceShare: hi("addonPriceShare"),
    closerAttach: [hi("closerAttach") * 0.4, hi("closerAttach")], closerPriceShare: hi("closerPriceShare"),
  };
}

export function runXray(items: MenuItem[], inputs: AuditInputs, data: XrayData = {}, assumptions: Record<string, number> = {}): XrayResult {
  const coreItems = items.filter((i) => i.name.trim()).map(toCoreItem);
  const ci = toCoreInputs(inputs);
  const currency = (inputs.currency || core.COUNTRY_CURRENCY[ci.country]) as core.Currency;
  const priced = coreItems.filter((i) => i.price != null).length;
  const r = core.runXray(coreItems, ci, {
    benchmark: data.benchmark, priceIndex: data.priceIndex, currency,
    currencySymbolsOnItems: Math.round(lastSymbolShare * priced),
    assumptions: toCoreAssumptions(assumptions),
  });
  const drift = core.priceDrift(data.priceIndex ?? [], ci);
  const byName = new Map(coreItems.map((i) => [i.name, i.id]));
  return {
    score: r.score, assessed: r.assessed, total: r.dimensions.length, coverage: r.coverage,
    verdict: r.verdict, currency,
    dimensions: r.dimensions.map((d) => ({
      key: d.key, label: d.label, weight: d.weight, score: d.score,
      evidence: d.evidence.map((e) => e.text),
      evidenceDetail: d.evidence.map((e) => ({ text: e.text, tone: e.tone ?? "neutral" })),
      missing: d.missing,
    })),
    findings: r.findings.map((f) => ({
      lever: f.id, title: f.lever, evidence: f.why, action: f.action,
      money: f.money ? { low: f.money.low, high: f.money.high, assumptions: f.money.assumptions } : null,
      items: f.items, perSale: f.perSale, confidence: f.confidence,
    })),
    levers: LEVERS,
    rewrites: r.rewrites.map((w) => ({ itemId: byName.get(w.item) ?? "", name: w.item, before: w.before, after: w.after, note: w.note })),
    drift: drift?.drift ?? null,
    disclaimer: r.disclaimer,
    engineVersion: r.version,
  };
}

/** Live total for the "Money on the table" sliders. Null without covers + bill. */
export function estimateScenario(result: XrayResult, inputs: AuditInputs, assumptions: Record<string, number>): MoneyRange | null {
  const ci = toCoreInputs(inputs);
  const cur = result.currency as core.Currency;
  const a = toCoreAssumptions(assumptions);
  const has = (id: string) => result.findings.some((f) => f.lever === id);
  const parts = [
    result.drift != null && has("reprice") ? core.repriceLever(ci, result.drift, cur, a) : null,
    has("addons") ? core.addonLever(ci, cur, a) : null,
    has("closer") ? core.closerLever(ci, cur, a) : null,
  ];
  const underpriced = result.findings.find((f) => f.lever === "underpriced")?.money;
  const sum = core.sumRanges([...parts, underpriced ? { ...underpriced, currency: cur, period: "month", assumptions: [] } : null], cur);
  return sum ? { low: sum.low, high: sum.high, assumptions: sum.assumptions } : null;
}

// ------------------------------------------------------------------ price check
export function matchCompetitors(items: MenuItem[], competitors: CompetitorMenu[]): PriceRow[] {
  const rows = core.priceCheck(items.filter((i) => i.name.trim()).map(toCoreItem), competitors.filter((c) => c.text.trim()));
  return rows.map((r) => ({
    dish: r.item, yours: r.yourPrice,
    theirs: r.matches.map((m) => ({ name: m.competitor, price: m.price, dish: m.name })),
    median: r.median, gapPct: r.gap == null ? null : Math.round(r.gap * 1000) / 10, confidence: r.confidence,
  }));
}

/** Benchmark rows to save from a competitor menu (only with the owner's consent). */
export function competitorToBenchmark(c: CompetitorMenu, inputs: AuditInputs): BenchmarkRow[] {
  const ci = toCoreInputs(inputs);
  return core.toBenchmarkRows(c, inputs.city, (inputs.currency || core.COUNTRY_CURRENCY[ci.country]) as core.Currency, inputs.area);
}

// ------------------------------------------------------------------ nearby (OpenStreetMap)
const cache = new Map<string, NearbyPlace[]>();
/** `where` = "area, city" or a full address. Call on a button press only (fair-use limits). */
export async function findNearby(where: string, concept: string, cuisine?: string, radiusM = 1500): Promise<NearbyPlace[]> {
  const key = `${where}|${concept}|${cuisine}|${radiusM}`;
  if (cache.has(key)) return cache.get(key)!;
  const kinds = toConcept(concept) === "cafe" ? ["cafe", "restaurant"] : toConcept(concept) === "bar" ? ["bar", "pub", "restaurant"] : ["restaurant", "fast_food", "cafe", "food_court"];
  try {
    const { places } = await core.nearbyCompetitors(where, { radiusM, cuisine, kinds, limit: 25 });
    const out = places.map((p) => ({ name: p.name, type: p.kind, lat: p.lat, lon: p.lon, cuisine: p.cuisine.join(", ") || undefined, website: p.website, distanceM: p.distanceM, address: p.address }));
    cache.set(key, out);
    return out;
  } catch {
    return [];
  }
}

export { DISHES } from "./core";
