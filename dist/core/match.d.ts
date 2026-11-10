import { type Dish } from "./dishes";
export declare function normalise(s: string): string;
export declare function tokens(s: string): string[];
/** Sørensen–Dice coefficient on character bigrams, 0–1. */
export declare function dice(a: string, b: string): number;
/**
 * How well a menu item name matches a reference dish name/alias, 0–1.
 * 0 when the item contains the reference but is a different product or variant.
 */
export declare function matchScore(item: string, ref: string): number;
/** Symmetric similarity for comparing two menus' item names (price check). */
export declare function similarity(a: string, b: string): number;
export interface DishMatch {
    dish: Dish;
    score: number;
}
/** Best dictionary dish for a menu item name, or null under the threshold. */
export declare function matchDish(name: string, threshold?: number): DishMatch | null;
export declare function detectProtein(text: string): string | null;
/** Key used to compare items across menus: dictionary key, else protein + normalised name. */
export declare function compareKey(name: string): string;
