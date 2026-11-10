// Dish-name normalisation and matching. No dependencies, no AI.
// Rule of thumb: a menu item matches a dictionary dish when every word of the dish name
// (or an alias) is in the item's name, and the item's extra words don't turn it into a
// different product (a roll, a cake, an iced or Spanish version...). Typos are caught by a
// strict whole-string similarity check.
import { ABBREVIATIONS, PROTEINS, STOPWORDS } from "./lexicon";
import { DISHES, type Dish } from "./dishes";

export function normalise(s: string): string {
  let t = s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const [re, rep] of ABBREVIATIONS) t = t.replace(re, rep);
  t = t.replace(/\(.*?\)/g, " ")          // (v), (gf), (2 pcs)
       .replace(/[^a-z0-9\s'-]/g, " ")
       .replace(/['-]/g, " ")
       .replace(/\s+/g, " ").trim();
  return t;
}

export function tokens(s: string): string[] {
  return normalise(s).split(" ").filter((w) => w && !STOPWORDS.has(w) && !/^\d+$/.test(w));
}

function bigrams(s: string): Map<string, number> {
  const m = new Map<string, number>();
  const t = ` ${s} `;
  for (let i = 0; i < t.length - 1; i++) {
    const g = t.slice(i, i + 2);
    m.set(g, (m.get(g) ?? 0) + 1);
  }
  return m;
}

/** Sørensen–Dice coefficient on character bigrams, 0–1. */
export function dice(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const A = bigrams(a), B = bigrams(b);
  let inter = 0, total = 0;
  for (const [g, n] of A) { inter += Math.min(n, B.get(g) ?? 0); total += n; }
  for (const n of B.values()) total += n;
  return (2 * inter) / total;
}

/** Words that make an item a different product from the dish it mentions. */
const FORM_WORDS = new Set([
  "roll", "rolls", "wrap", "sandwich", "burger", "pizza", "flatbread", "salad", "soup", "biryani", "pulao", "pav",
  "kulcha", "paratha", "naan", "croissant", "muffin", "cake", "cookie", "cookies", "shake", "milkshake", "smoothie",
  "frappe", "latte", "tea", "juice", "soda", "lemonade", "bowl", "pasta", "fries", "chaat", "sauce", "combo",
  "platter", "thali", "meal", "box", "toastie", "panini", "bagel", "taco", "tacos", "noodles", "rice", "curry",
  "masala", "tikka", "kebab", "shawarma", "pudding", "bhature", "fatteh", "fattah", "manakeesh", "pie", "fatayer", "omelette", "waffle", "pancakes",
  "macchiato", "cortado", "mocha", "affogato", "tonic", "mojito", "plate", "sizzler", "kadhi", "bhurji", "chilli",
]);
/** Words that make it a priced variant (iced, flavoured, double...). */
const VARIANT_WORDS = new Set([
  "iced", "ice", "cold", "frozen", "spanish", "chai", "matcha", "vanilla", "caramel", "hazelnut", "rose", "saffron",
  "pistachio", "lotus", "karak", "double", "triple", "mango", "strawberry", "chocolate", "nutella", "almond",
  "zaatar", "truffle", "dirty", "white", "ube", "date", "honey", "turkish", "arabic", "salted", "peanut", "oreo",
  "meat", "jumbo", "family", "mini", "large", "small", "big", "half", "full", "kids", "protein", "keto", "vegan",
]);

function tokenEq(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length >= 5 && b.length >= 5) return dice(a, b) >= 0.8; // typos: "tikkah", "biriyani"
  return false;
}

/**
 * How well a menu item name matches a reference dish name/alias, 0–1.
 * 0 when the item contains the reference but is a different product or variant.
 */
export function matchScore(item: string, ref: string): number {
  const a = tokens(item), b = tokens(ref);
  if (!a.length || !b.length) return 0;
  const na = a.join(" "), nb = b.join(" ");
  if (na === nb) return 1;
  const unmatched = a.filter((w) => !b.some((r) => tokenEq(w, r)));
  const covered = b.every((r) => a.some((w) => tokenEq(w, r)));
  if (covered) {
    if (unmatched.some((w) => FORM_WORDS.has(w) || VARIANT_WORDS.has(w))) return 0;
    if (unmatched.length > Math.max(2, b.length)) return 0.6; // too much else going on
    return 0.8 + 0.2 * (b.length / a.length);
  }
  // typo fallback: same number of words, nearly the same letters
  if (a.length !== b.length) return 0;
  const d = dice(na, nb);
  return d >= 0.86 ? d : 0;
}

/** Symmetric similarity for comparing two menus' item names (price check). */
export function similarity(a: string, b: string): number {
  return Math.max(matchScore(a, b), matchScore(b, a));
}

interface Candidate { label: string; dish: Dish }
let INDEX: Candidate[] | null = null;
function index(): Candidate[] {
  if (!INDEX) {
    INDEX = [];
    for (const d of DISHES) {
      INDEX.push({ label: d.name, dish: d });
      for (const a of d.aliases) INDEX.push({ label: a, dish: d });
    }
  }
  return INDEX;
}

export interface DishMatch { dish: Dish; score: number }

/** Best dictionary dish for a menu item name, or null under the threshold. */
export function matchDish(name: string, threshold = 0.8): DishMatch | null {
  let best: DishMatch | null = null;
  for (const c of index()) {
    const s = matchScore(name, c.label);
    // prefer the longer (more specific) label on ties: "chicken tikka masala" over "chicken tikka"
    if (s > 0 && (!best || s > best.score || (s === best.score && c.label.length > best.dish.name.length))) best = { dish: c.dish, score: s };
  }
  return best && best.score >= threshold ? best : null;
}

export function detectProtein(text: string): string | null {
  for (const [p, re] of PROTEINS) if (re.test(text)) return p;
  return null;
}

/** Key used to compare items across menus: dictionary key, else protein + normalised name. */
export function compareKey(name: string): string {
  const m = matchDish(name);
  if (m) {
    // keep protein variants apart: chicken biryani ≠ mutton biryani
    const p = detectProtein(name);
    return p ? `${m.dish.key}:${p}` : m.dish.key;
  }
  return "x:" + tokens(name).sort().join("_");
}
