import type { MenuItem, ParseResult, Section } from "./types";
export declare function sectionFor(heading: string): Section;
export declare function parseMenu(text: string): ParseResult;
/** Re-derive section + dish key after the owner edits a row in the review table. */
export declare function refreshItem(it: MenuItem): MenuItem;
