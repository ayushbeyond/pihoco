// Money levers. Every figure is a scenario built from the owner's own covers and
// average bill plus assumptions they can see and move. Nothing here is a forecast.
import { roundMoney } from "./stats";
import type { Currency, MoneyRange, XrayInputs } from "./types";

export const WEEKS_PER_MONTH = 52 / 12;

export interface LeverAssumptions {
  /** Share of a reprice that is kept after any lost orders (0–1). Default 0.75. */
  repriceKept: number;
  /** Cap on a single reprice step, e.g. 0.06 = 6%. */
  repriceCap: number;
  /** Share of covers that take an add-on once one is offered (low, high). */
  addonAttach: [number, number];
  /** Add-on price as a share of the average bill. */
  addonPriceShare: number;
  /** Share of covers that add a dessert/drink when prompted (low, high). */
  closerAttach: [number, number];
  closerPriceShare: number;
}

export const DEFAULT_ASSUMPTIONS: LeverAssumptions = {
  repriceKept: 0.75,
  repriceCap: 0.06,
  addonAttach: [0.04, 0.1],
  addonPriceShare: 0.12,
  closerAttach: [0.03, 0.08],
  closerPriceShare: 0.18,
};

export function monthlyRevenue(inputs: XrayInputs): number | null {
  if (!inputs.coversPerWeek || !inputs.avgBill) return null;
  return inputs.coversPerWeek * inputs.avgBill * WEEKS_PER_MONTH;
}

const range = (low: number, high: number, currency: Currency, assumptions: string[]): MoneyRange => ({
  low: roundMoney(Math.min(low, high)), high: roundMoney(Math.max(low, high)), currency, period: "month", assumptions,
});

/** Catching up with price-index drift across the menu. */
export function repriceLever(inputs: XrayInputs, drift: number, currency: Currency, a = DEFAULT_ASSUMPTIONS): MoneyRange | null {
  const rev = monthlyRevenue(inputs);
  if (rev == null || drift <= 0.01) return null;
  const step = Math.min(drift, a.repriceCap);
  const high = rev * step * a.repriceKept;
  const low = rev * (step / 2) * a.repriceKept; // half the step, on the conservative side
  return range(low, high, currency, [
    `${Math.round(step * 100)}% reprice step (catch-up capped at ${Math.round(a.repriceCap * 100)}%)`,
    `${Math.round(a.repriceKept * 100)}% of the gain kept after any lost orders`,
    `Low end assumes only half the step is taken`,
    `Based on ${inputs.coversPerWeek} covers/week × ${inputs.avgBill} average bill`,
  ]);
}

/** Adding an add-on prompt (extra shot, add cheese, add a side). */
export function addonLever(inputs: XrayInputs, currency: Currency, a = DEFAULT_ASSUMPTIONS): MoneyRange | null {
  if (!inputs.coversPerWeek || !inputs.avgBill) return null;
  const price = inputs.avgBill * a.addonPriceShare;
  const per = (r: number) => inputs.coversPerWeek! * r * price * WEEKS_PER_MONTH;
  return range(per(a.addonAttach[0]), per(a.addonAttach[1]), currency, [
    `${Math.round(a.addonAttach[0] * 100)}–${Math.round(a.addonAttach[1] * 100)}% of covers take one add-on`,
    `Add-on priced at about ${Math.round(a.addonPriceShare * 100)}% of the average bill (${Math.round(price)})`,
  ]);
}

/** A stronger dessert or drink close. */
export function closerLever(inputs: XrayInputs, currency: Currency, a = DEFAULT_ASSUMPTIONS): MoneyRange | null {
  if (!inputs.coversPerWeek || !inputs.avgBill) return null;
  const price = inputs.avgBill * a.closerPriceShare;
  const per = (r: number) => inputs.coversPerWeek! * r * price * WEEKS_PER_MONTH;
  return range(per(a.closerAttach[0]), per(a.closerAttach[1]), currency, [
    `${Math.round(a.closerAttach[0] * 100)}–${Math.round(a.closerAttach[1] * 100)}% more covers add a dessert or drink`,
    `Priced at about ${Math.round(a.closerPriceShare * 100)}% of the average bill (${Math.round(price)})`,
  ]);
}

/** Per-dish uplift when moving a dish part-way to the local median. */
export function testPrice(price: number, median: number, step = 0.08): number {
  const target = Math.min(median, price * (1 + step));
  // round to the menu's style: whole numbers above 20, halves below
  return target >= 20 ? Math.round(target) : Math.round(target * 2) / 2;
}

export function sumRanges(rs: (MoneyRange | null | undefined)[], currency: Currency): MoneyRange | null {
  const xs = rs.filter((r): r is MoneyRange => !!r);
  if (!xs.length) return null;
  // levers overlap a little; take 85% of the summed high end to avoid double counting
  return {
    low: roundMoney(xs.reduce((a, r) => a + r.low, 0)),
    high: roundMoney(xs.reduce((a, r) => a + r.high, 0) * 0.85),
    currency, period: "month",
    assumptions: ["Sum of the levers above, with the high end trimmed 15% for overlap"],
  };
}
