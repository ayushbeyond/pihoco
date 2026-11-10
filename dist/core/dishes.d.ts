import type { Section } from "./types";
export interface Dish {
    key: string;
    name: string;
    section: Section;
    cuisine: string;
    aliases: string[];
    desc: string;
}
export declare const DISHES: Dish[];
export declare const DISH_BY_KEY: Record<string, Dish>;
