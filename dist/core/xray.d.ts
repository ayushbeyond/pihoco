import { type LeverAssumptions } from "./money";
import type { BenchmarkRow, Currency, MenuItem, PriceIndexPoint, Rewrite, XrayInputs, XrayResult } from "./types";
export declare const ENGINE_VERSION = "xray-1.0.0";
export interface XrayOptions {
    benchmark?: BenchmarkRow[];
    priceIndex?: PriceIndexPoint[];
    currencySymbolsOnItems?: number;
    assumptions?: LeverAssumptions;
    currency?: Currency;
}
export declare function buildRewrites(items: MenuItem[], max?: number): Rewrite[];
export declare function runXray(items: MenuItem[], inputs: XrayInputs, opts?: XrayOptions): XrayResult;
