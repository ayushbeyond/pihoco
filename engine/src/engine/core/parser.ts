// Turns raw menu text (pasted, from a PDF text layer, or from OCR) into items.
// Deterministic: a line with a trailing price is an item; short price-less lines
// are headings; other price-less lines are descriptions of the item above.
import { CURRENCY_TOKENS, SECTION_KEYWORDS } from "./lexicon";
import { matchDish } from "./match";
import type { Currency, MenuItem, ParseResult, Section } from "./types";

const NUM = String.raw`\d{1,3}(?:[,\s]\d{3})+(?:\.\d{1,2})?|\d{1,6}(?:[.,]\d{1,2})?`;
const CUR = String.raw`AED|Dhs?\.?|Dirhams?|£|GBP|S\$|SGD|US\$|USD|\$|₹|Rs\.?|INR|€`;
// one price, optionally with a currency token on either side
const PRICE = String.raw`(?:(?:${CUR})\s?)?(?:${NUM})(?:\s?(?:${CUR}))?(?:\/-)?`;
// trailing prices: "... 45", "... AED 45", "... 12 / 15", "... £8.50 | £12"
const TRAILING = new RegExp(String.raw`(?:^|[\s.·…_|:–—-])((?:${PRICE})(?:\s*(?:\/|\||,|–|-|or)\s*(?:${PRICE}))*)\s*$`, "i");
const PRICE_ONLY = new RegExp(String.raw`^\s*((?:${PRICE})(?:\s*(?:\/|\||,|–|-)\s*(?:${PRICE}))*)\s*$`, "i");
const NUMBER_RE = new RegExp(NUM, "g");
const CUR_RE = new RegExp(String.raw`(${CUR})`, "i");

let idSeq = 0;
const newId = () => `i${Date.now().toString(36)}${(idSeq++).toString(36)}`;

export function sectionFor(heading: string): Section {
  for (const [s, re] of SECTION_KEYWORDS) if (re.test(heading)) return s;
  return "other";
}

function currencyOf(token: string | undefined): Currency | null {
  if (!token) return null;
  const t = token.trim().replace(/\.$/, "");
  for (const [re, c] of CURRENCY_TOKENS) if (re.test(t)) return c;
  return null;
}

function toNumber(s: string): number {
  const t = s.replace(/\s/g, "");
  // "1,250" thousands vs "12,50" decimal comma
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) return parseFloat(t.replace(/,/g, ""));
  if (/^\d+,\d{1,2}$/.test(t)) return parseFloat(t.replace(",", "."));
  return parseFloat(t.replace(/,/g, ""));
}

function readPrices(s: string): { prices: number[]; currency: Currency | null; hasSymbol: boolean } {
  const cm = s.match(CUR_RE);
  const nums = (s.match(NUMBER_RE) ?? []).map(toNumber).filter((n) => isFinite(n) && n > 0);
  return { prices: nums, currency: currencyOf(cm?.[1]), hasSymbol: !!cm };
}

function cleanName(s: string): string {
  return s.replace(/[.·…_]{2,}/g, " ").replace(/[\s|:–—-]+$/g, "").replace(/^[\s•*·\-–—]+/, "").replace(/\s+/g, " ").trim();
}

function looksLikeHeading(line: string, next: string | undefined): boolean {
  const words = line.split(/\s+/).length;
  if (words > 6 || line.length > 48) return false;
  if (/[.!?]$/.test(line)) return false;
  const letters = line.replace(/[^A-Za-z]/g, "");
  const caps = letters.length >= 3 && letters === letters.toUpperCase();
  if (next && PRICE_ONLY.test(next)) return false; // "Dish name" then "£7.50" = an item
  const keyword = sectionFor(line) !== "other";
  const nextIsItem = !!next && TRAILING.test(next);
  return caps || (keyword && words <= 4) || (nextIsItem && words <= 3 && /^[A-Z]/.test(line));
}

/** Split "Name - description" or "Name: description" written on one line. */
function splitInline(nameDesc: string): [string, string] {
  const m = nameDesc.match(/^(.{3,60}?)\s+(?:[–—-]|:)\s+(.{8,})$/);
  if (m) return [m[1].trim(), m[2].trim()];
  return [nameDesc, ""];
}

export function parseMenu(text: string): ParseResult {
  const lines = text.replace(/\r/g, "").split("\n").map((l) => l.replace(/\t/g, " ").trim()).filter(Boolean);
  const items: MenuItem[] = [];
  const unparsed: string[] = [];
  const currencyVotes = new Map<Currency, number>();
  let symbolItems = 0;
  let category = "Menu";
  let section: Section = "other";
  let last: MenuItem | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1];

    // A price on its own line belongs to the item above if it has none.
    const only = line.match(PRICE_ONLY);
    if (only) {
      const r = readPrices(only[1]);
      if (last && last.price == null && r.prices.length) {
        last.prices = r.prices; last.price = Math.min(...r.prices);
        last.rawLine += " " + line;
        if (r.currency) currencyVotes.set(r.currency, (currencyVotes.get(r.currency) ?? 0) + 1);
        if (r.hasSymbol) symbolItems++;
        continue;
      }
      unparsed.push(line); continue;
    }

    const t = line.match(TRAILING);
    if (t && t.index !== undefined) {
      const before = line.slice(0, t.index + (t[0].length - t[1].length)).trim();
      const r = readPrices(t[1]);
      const [name0, desc0] = splitInline(cleanName(before));
      const name = cleanName(name0);
      if (name.length >= 2 && /[a-z]/i.test(name) && r.prices.length) {
        if (r.currency) currencyVotes.set(r.currency, (currencyVotes.get(r.currency) ?? 0) + 1);
        if (r.hasSymbol) symbolItems++;
        const item: MenuItem = {
          id: newId(), category, section, name, description: desc0,
          price: Math.min(...r.prices), prices: r.prices, rawLine: line,
          confidence: "high", flags: [],
        };
        items.push(item); last = item; continue;
      }
    }

    if (looksLikeHeading(line, next)) {
      category = cleanName(line).replace(/\s+/g, " ");
      section = sectionFor(category);
      last = null; continue;
    }

    if (last && line.length > 6) {
      last.description = (last.description ? last.description + " " : "") + line;
      continue;
    }

    // A dish name whose price is on the next line, or a dish with no price at all.
    if (line.length <= 60 && /[a-z]/i.test(line)) {
      const item: MenuItem = {
        id: newId(), category, section, name: cleanName(line), description: "",
        price: null, prices: [], rawLine: line, confidence: "low", flags: ["no price found"],
      };
      items.push(item); last = item; continue;
    }
    unparsed.push(line);
  }

  // Post-pass: section from dish dictionary when heading gave none, and confidence.
  const priced = items.map((x) => x.price).filter((p): p is number => p != null).sort((a, b) => a - b);
  const med = priced.length ? priced[Math.floor(priced.length / 2)] : null;
  for (const it of items) {
    const m = matchDish(it.name);
    it.dishKey = m?.dish.key ?? null;
    it.dishScore = m?.score ?? 0;
    if (it.section === "other" && m) it.section = m.dish.section;
    if (it.price == null) { it.confidence = "low"; if (!it.flags.length) it.flags.push("no price found"); }
    else {
      if (it.price < 0.5) { it.flags.push("price looks too small"); it.confidence = "low"; }
      if (med && (it.price > med * 12 || it.price < med / 12)) { it.flags.push("price far from the rest of the menu"); it.confidence = "low"; }
      if (it.name.split(" ").length > 9) { it.flags.push("name is long: description may be merged in"); if (it.confidence === "high") it.confidence = "medium"; }
      if (it.category === "Menu") { it.flags.push("no section heading above it"); if (it.confidence === "high") it.confidence = "medium"; }
      if (/^\d/.test(it.name)) { it.flags.push("name starts with a number"); if (it.confidence === "high") it.confidence = "medium"; }
    }
  }

  let currencyDetected: Currency | null = null;
  let best = 0;
  for (const [c, n] of currencyVotes) if (n > best) { best = n; currencyDetected = c; }

  return { items, currencyDetected, currencySymbolsOnItems: symbolItems, unparsedLines: unparsed };
}

/** Re-derive section + dish key after the owner edits a row in the review table. */
export function refreshItem(it: MenuItem): MenuItem {
  const m = matchDish(it.name);
  const fromHeading = sectionFor(it.category);
  return {
    ...it,
    section: fromHeading !== "other" ? fromHeading : (m?.dish.section ?? "other"),
    dishKey: m?.dish.key ?? null,
    dishScore: m?.score ?? 0,
    // the table edits `price`; keep `prices` in step with it
    prices: it.price == null ? [] : it.prices.includes(it.price) ? it.prices : [it.price],
    confidence: it.price != null && it.name.trim() ? "high" : "low",
    flags: it.price != null && it.name.trim() ? [] : ["needs a name and a price"],
  };
}
