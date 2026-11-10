import type { Currency, MoneyRange, XrayInputs } from "./types";
export declare const WEEKS_PER_MONTH: number;
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
export declare const DEFAULT_ASSUMPTIONS: LeverAssumptions;
export declare function monthlyRevenue(inputs: XrayInputs): number | null;
/** Catching up with price-index drift across the menu. */
export declare function repriceLever(inputs: XrayInputs, drift: number, currency: Currency, a?: LeverAssumptions): MoneyRange | null;
/** Adding an add-on prompt (extra shot, add cheese, add a side). */
export declare function addonLever(inputs: XrayInputs, currency: Currency, a?: LeverAssumptions): MoneyRange | null;
/** A stronger dessert or drink close. */
export declare function closerLever(inputs: XrayInputs, currency: Currency, a?: LeverAssumptions): MoneyRange | null;
/** Per-dish uplift when moving a dish part-way to the local median. */
export declare function testPrice(price: number, median: number, step?: number): number;
export declare function sumRanges(rs: (MoneyRange | null | undefined)[], currency: Currency): MoneyRange | null;
