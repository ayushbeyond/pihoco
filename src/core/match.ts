// Dish-name normalisation and fuzzy matching. No dependencies, no AI.
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

/** Similarity of two dish names: best of whole-string Dice and token overlap. */
export function similarity(a: string, b: string): number {
  const na = tokens(a).join(" "), nb = tokens(b).join(" ");
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const ta = new Set(na.split(" ")), tb = new Set(nb.split(" "));
  let common = 0;
  for (const w of ta) if (tb.has(w)) common++;
  const overlap = common / Math.max(ta.size, tb.size);
  // containment: "butter chicken" inside "house butter chicken bowl"
  const contained = (na.includes(nb) || nb.includes(na)) ? 0.9 * Math.min(na.length, nb.length) / Math.max(na.length, nb.length) + 0.1 : 0;
  return Math.max(dice(na, nb), overlap, contained);
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
export function matchDish(name: string, threshold = 0.62): DishMatch | null {
  let best: DishMatch | null = null;
  for (const c of index()) {
    const s = similarity(name, c.label);
    if (!best || s > best.score) best = { dish: c.dish, score: s };
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
