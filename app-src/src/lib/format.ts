const SYM: Record<string, string> = { AED: "AED ", GBP: "£", USD: "$", INR: "₹", SGD: "S$" };

export function money(n: number, currency: string): string {
  const s = SYM[currency] ?? `${currency} `;
  const v = Math.round(n).toLocaleString(currency === "INR" ? "en-IN" : "en-GB");
  return `${s}${v}`;
}
export function moneyRange(r: { low: number; high: number }, currency: string): string {
  return r.low === r.high ? money(r.low, currency) : `${money(r.low, currency)}–${money(r.high, currency).replace(SYM[currency] ?? "", "")}`;
}
export function price(n: number | null | undefined): string {
  if (n == null) return "—";
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}
