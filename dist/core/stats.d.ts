export declare const round: (n: number, dp?: number) => number;
export declare const clamp: (n: number, lo?: number, hi?: number) => number;
export declare function quantile(sorted: number[], q: number): number;
export declare function median(xs: number[]): number | null;
/** Months between two "YYYY-MM" strings (b − a). */
export declare function monthsBetween(a: string, b: string): number;
export declare function currentMonth(d?: Date): string;
/** Round a money figure to a sensible, non-fake-precise step. */
export declare function roundMoney(n: number): number;
/** Ending style of a price: "whole", ".5", ".9", ".95", ".99", "other". */
export declare function endingStyle(p: number): string;
