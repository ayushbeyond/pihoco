// Small numeric helpers. Deterministic and unit-tested.
export const round = (n: number, dp = 0) => { const f = 10 ** dp; return Math.round(n * f) / f; };
export const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}
export function median(xs: number[]): number | null {
  if (!xs.length) return null;
  return quantile([...xs].sort((a, b) => a - b), 0.5);
}

/** Months between two "YYYY-MM" strings (b − a). */
export function monthsBetween(a: string, b: string): number {
  const [ya, ma] = a.split("-").map(Number), [yb, mb] = b.split("-").map(Number);
  return (yb - ya) * 12 + (mb - ma);
}
export function currentMonth(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Round a money figure to a sensible, non-fake-precise step. */
export function roundMoney(n: number): number {
  const a = Math.abs(n);
  const step = a >= 100000 ? 5000 : a >= 10000 ? 500 : a >= 1000 ? 50 : a >= 100 ? 10 : 1;
  return Math.round(n / step) * step;
}

/** Ending style of a price: "whole", ".5", ".9", ".95", ".99", "other". */
export function endingStyle(p: number): string {
  const cents = Math.round((p - Math.floor(p)) * 100);
  if (cents === 0) {
    const last = Math.floor(p) % 10;
    return last === 9 ? "9" : last === 5 || last === 0 ? "0/5" : "whole";
  }
  if (cents === 50) return ".50";
  if (cents === 95) return ".95";
  if (cents === 99) return ".99";
  if (cents % 10 === 9 || cents === 90) return ".x9";
  return "other";
}
