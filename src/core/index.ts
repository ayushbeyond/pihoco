// PIHOCO Menu X-ray engine — public API. Deterministic, no AI, runs in the browser.
export * from "./types";
export { parseMenu, refreshItem, sectionFor } from "./parser";
export { runXray, buildRewrites, ENGINE_VERSION, type XrayOptions } from "./xray";
export { WEIGHTS, MIN_BENCHMARK_OBS, compareToBenchmark, priceDrift, categoryPricing } from "./score";
export { DEFAULT_ASSUMPTIONS, monthlyRevenue, repriceLever, addonLever, closerLever, sumRanges, testPrice, type LeverAssumptions } from "./money";
export { priceCheck, toBenchmarkRows, type CompetitorMenu, type PriceCheckRow } from "./pricecheck";
export { nearbyCompetitors, geocode, OSM_ATTRIBUTION, type NearbyPlace } from "./osm";
export { matchDish, compareKey, similarity, normalise } from "./match";
export { DISHES, DISH_BY_KEY } from "./dishes";
export { COUNTRY_CURRENCY, CURRENCY_SYMBOL } from "./lexicon";
export { roundMoney } from "./stats";
