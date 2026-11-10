import * as core from "./core";
export type Confidence = "high" | "med" | "low";
export interface MenuItem {
    id: string;
    category: string;
    name: string;
    description: string;
    price: number | null;
    confidence: Confidence;
    flags?: string[];
    prices?: number[];
    weeklyUnits?: number | null;
}
export interface AuditInputs {
    restaurantName: string;
    city: string;
    area?: string;
    country: string;
    currency: string;
    concept: string;
    cuisine: string;
    coversPerWeek?: number | null;
    avgBill?: number | null;
    lastPriceChange?: string | null;
}
export type Tone = "gain" | "leak" | "neutral";
export interface Dimension {
    key: string;
    label: string;
    weight: number;
    score: number | null;
    evidence: string[];
    evidenceDetail: {
        text: string;
        tone: Tone;
    }[];
    missing: string[];
}
export interface MoneyRange {
    low: number;
    high: number;
    assumptions?: string[];
}
export interface Finding {
    lever: string;
    title: string;
    evidence: string;
    action: string;
    money?: MoneyRange | null;
    items?: string[];
    perSale?: {
        item: string;
        from: number;
        to: number;
    }[];
    confidence?: "high" | "medium" | "low";
}
export interface LeverAssumption {
    key: string;
    label: string;
    unit: string;
    min: number;
    max: number;
    step: number;
    default: number;
}
export interface Rewrite {
    itemId: string;
    name: string;
    before: string;
    after: string;
    note?: string;
}
export interface XrayResult {
    score: number;
    assessed: number;
    total: number;
    coverage: number;
    verdict: string;
    currency: string;
    dimensions: Dimension[];
    findings: Finding[];
    levers: LeverAssumption[];
    rewrites: Rewrite[];
    drift: number | null;
    disclaimer: string;
    engineVersion: string;
}
export interface CompetitorMenu {
    name: string;
    text: string;
    url?: string;
}
export interface PriceRow {
    dish: string;
    yours: number | null;
    theirs: {
        name: string;
        price: number | null;
        dish?: string;
    }[];
    median: number | null;
    gapPct: number | null;
    confidence?: "high" | "medium" | "low";
}
export interface NearbyPlace {
    name: string;
    type: string;
    lat: number;
    lon: number;
    cuisine?: string;
    website?: string;
    distanceM?: number;
    address?: string;
}
export type BenchmarkRow = core.BenchmarkRow;
export type PriceIndexPoint = core.PriceIndexPoint;
export interface XrayData {
    benchmark?: BenchmarkRow[];
    priceIndex?: PriceIndexPoint[];
}
export declare const OSM_ATTRIBUTION = "\u00A9 OpenStreetMap contributors";
export declare const ENGINE_VERSION = "xray-1.0.0";
export declare const toCountry: (c: string) => core.Country;
export declare function toConcept(c: string): core.Concept;
export declare function parseMenu(text: string): MenuItem[];
/** Currency the menu text itself shows, if any (e.g. "AED"). */
export declare function detectCurrency(text: string): string | null;
export declare function newItem(category?: string): MenuItem;
/** Re-check a row after the owner edits it (call on blur). */
export declare function reviewItem(u: MenuItem): MenuItem;
export declare const LEVERS: LeverAssumption[];
export declare function runXray(items: MenuItem[], inputs: AuditInputs, data?: XrayData, assumptions?: Record<string, number>): XrayResult;
/** Live total for the "Money on the table" sliders. Null without covers + bill. */
export declare function estimateScenario(result: XrayResult, inputs: AuditInputs, assumptions: Record<string, number>): MoneyRange | null;
export declare function matchCompetitors(items: MenuItem[], competitors: CompetitorMenu[]): PriceRow[];
/** Benchmark rows to save from a competitor menu (only with the owner's consent). */
export declare function competitorToBenchmark(c: CompetitorMenu, inputs: AuditInputs): BenchmarkRow[];
/** `where` = "area, city" or a full address. Call on a button press only (fair-use limits). */
export declare function findNearby(where: string, concept: string, cuisine?: string, radiusM?: number): Promise<NearbyPlace[]>;
export { DISHES } from "./core";
