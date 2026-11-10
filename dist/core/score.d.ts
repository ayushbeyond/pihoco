import type { BenchmarkRow, DimensionScore, MenuItem, PriceIndexPoint, XrayInputs } from "./types";
export declare const WEIGHTS: {
    readonly structure: 0.2;
    readonly pricing: 0.25;
    readonly merchandising: 0.15;
    readonly upsell: 0.2;
    readonly market: 0.2;
};
export declare const MIN_BENCHMARK_OBS = 5;
export declare const MIN_BENCHMARK_DISHES = 3;
export declare function groupByCategory(items: MenuItem[]): Map<string, MenuItem[]>;
export declare function scoreStructure(items: MenuItem[], inputs: XrayInputs): DimensionScore;
export interface CategoryPricing {
    category: string;
    n: number;
    min: number;
    max: number;
    median: number;
    spread: number;
    hasAnchor: boolean;
    ascending: boolean;
}
export declare function categoryPricing(items: MenuItem[]): CategoryPricing[];
export declare function scorePricing(items: MenuItem[], currencySymbolsOnItems: number): DimensionScore;
export declare function scoreMerchandising(items: MenuItem[]): DimensionScore;
export declare function scoreUpsell(items: MenuItem[], inputs: XrayInputs): DimensionScore;
export interface DishComparison {
    item: string;
    price: number;
    key: string;
    n: number;
    median: number;
    p25: number;
    p75: number;
    gap: number;
}
export declare function compareToBenchmark(items: MenuItem[], rows: BenchmarkRow[], inputs: XrayInputs, minObs?: number): DishComparison[];
/** Price-index drift since the last price change, e.g. 0.06 = 6% (null if unknown). */
export declare function priceDrift(points: PriceIndexPoint[], inputs: XrayInputs, now?: string): {
    drift: number;
    from: string;
    to: string;
    months: number;
} | null;
export declare function scoreMarket(items: MenuItem[], inputs: XrayInputs, rows: BenchmarkRow[], index: PriceIndexPoint[]): DimensionScore;
