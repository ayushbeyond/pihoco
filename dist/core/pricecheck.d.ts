import type { BenchmarkRow, Currency, MenuItem } from "./types";
export interface CompetitorMenu {
    name: string;
    text: string;
    url?: string;
}
export interface PriceCheckRow {
    item: string;
    yourPrice: number;
    matches: {
        competitor: string;
        name: string;
        price: number;
        similarity: number;
    }[];
    median: number | null;
    gap: number | null;
    confidence: "high" | "medium" | "low";
}
export declare function priceCheck(own: MenuItem[], competitors: CompetitorMenu[]): PriceCheckRow[];
/** Rows to store as benchmark observations (public menus only, with consent). */
export declare function toBenchmarkRows(competitor: CompetitorMenu, city: string, currency: Currency, area?: string): BenchmarkRow[];
