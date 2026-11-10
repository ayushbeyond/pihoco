export type Country = "AE" | "GB" | "US" | "IN" | "SG";
export type Currency = "AED" | "GBP" | "USD" | "INR" | "SGD";
export type Concept = "restaurant" | "cafe" | "bar" | "cloud_kitchen" | "qsr";
export type Confidence = "high" | "medium" | "low";
export type Section = "breakfast" | "starters" | "soups" | "salads" | "mains" | "grill" | "pasta_pizza" | "burgers_sandwiches" | "rice_breads" | "sides" | "desserts" | "bakery" | "coffee" | "tea" | "drinks" | "alcohol" | "kids" | "sharing" | "extras" | "other";
export interface MenuItem {
    id: string;
    category: string;
    section: Section;
    name: string;
    description: string;
    price: number | null;
    prices: number[];
    rawLine: string;
    confidence: Confidence;
    flags: string[];
    dishKey?: string | null;
    dishScore?: number;
    weeklyUnits?: number | null;
}
export interface ParseResult {
    items: MenuItem[];
    currencyDetected: Currency | null;
    currencySymbolsOnItems: number;
    unparsedLines: string[];
}
export interface XrayInputs {
    restaurantName: string;
    city: string;
    area?: string;
    country: Country;
    concept: Concept;
    cuisine?: string;
    coversPerWeek?: number | null;
    avgBill?: number | null;
    lastPriceChange?: string | null;
}
export interface BenchmarkRow {
    city: string;
    area?: string | null;
    dish_key: string;
    dish_name?: string;
    price: number;
    currency: Currency;
    channel?: "dine_in" | "takeaway" | "delivery" | null;
    source_url?: string | null;
    collected_at?: string | null;
}
export interface PriceIndexPoint {
    country: Country;
    month: string;
    value: number;
    source?: string;
}
export interface Evidence {
    text: string;
    tone?: "gain" | "leak" | "neutral";
}
export interface DimensionScore {
    key: "structure" | "pricing" | "merchandising" | "upsell" | "market";
    label: string;
    weight: number;
    score: number | null;
    evidence: Evidence[];
    missing: string[];
}
export interface MoneyRange {
    low: number;
    high: number;
    currency: Currency;
    period: "month";
    assumptions: string[];
}
export interface Finding {
    id: string;
    lever: string;
    why: string;
    action: string;
    items: string[];
    priority: number;
    confidence: Confidence;
    money?: MoneyRange | null;
    perSale?: {
        item: string;
        from: number;
        to: number;
    }[];
}
export interface Rewrite {
    item: string;
    before: string;
    after: string;
    note: string;
}
export interface XrayResult {
    version: string;
    score: number;
    coverage: number;
    assessed: number;
    verdict: string;
    dimensions: DimensionScore[];
    findings: Finding[];
    rewrites: Rewrite[];
    stats: {
        items: number;
        priced: number;
        categories: number;
        withDescription: number;
        medianPrice: number | null;
        currency: Currency;
    };
    disclaimer: string;
}
