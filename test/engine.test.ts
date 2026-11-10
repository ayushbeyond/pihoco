import assert from "node:assert/strict";
import {
  parseMenu, runXray, priceCheck, compareKey, matchDish, repriceLever, addonLever, roundMoney, testPrice, refreshItem,
  type BenchmarkRow, type PriceIndexPoint, type XrayInputs,
} from "../src/core";
import { parseOverpass, haversine } from "../src/core/osm";
import { endingStyle, median, monthsBetween } from "../src/core/stats";

let pass = 0;
const t = (name: string, fn: () => void) => { try { fn(); pass++; } catch (e) { console.error("FAIL", name); throw e; } };

const MENU = `
STARTERS
Paneer Tikka ........ 38
Charred cottage cheese with peppers
Chicken Tikka - boneless chicken in yoghurt and spices, smoky from the tandoor  42
Veg Samosa (2 pcs)  AED 18
Chilli Chicken 39
Hummus 24

MAINS
Dal Tadka 32
Paneer Butter Masala 44
Butter Chicken 46
Chicken Tikka Masala 48
Lamb Rogan Josh 54
Mutton Biryani 52
Chicken Biryani 49

BREADS
Butter Naan 8
Garlic Naan 10
Roti 6

DRINKS
Masala Chai 12
Sweet Lassi 16
Fresh Lime Soda 14 / 18
`;

const inputs: XrayInputs = { restaurantName: "Test Dhaba", city: "Dubai", country: "AE", concept: "restaurant", cuisine: "North Indian", coversPerWeek: 600, avgBill: 85, lastPriceChange: "2025-01" };

t("parses items, headings, prices", () => {
  const r = parseMenu(MENU);
  assert.equal(r.items.length, 18);
  const pt = r.items.find((i) => i.name === "Paneer Tikka")!;
  assert.equal(pt.price, 38); assert.equal(pt.category, "STARTERS"); assert.equal(pt.section, "starters");
  assert.match(pt.description, /Charred cottage cheese/);
  const ct = r.items.find((i) => i.name === "Chicken Tikka")!;
  assert.equal(ct.price, 42); assert.match(ct.description, /boneless/);
  const sam = r.items.find((i) => /Samosa/.test(i.name))!;
  assert.equal(sam.price, 18);
  assert.equal(r.currencyDetected, "AED");
  const soda = r.items.find((i) => /Lime/.test(i.name))!;
  assert.deepEqual(soda.prices, [14, 18]); assert.equal(soda.price, 14);
  assert.equal(r.items.find((i) => i.name === "Roti")!.section, "rice_breads");
});

t("price on next line and £ decimals", () => {
  const r = parseMenu("DESSERTS\nSticky Toffee Pudding\n£7.50\nChocolate fondant £8.95\nwarm, molten centre");
  assert.equal(r.items[0].price, 7.5);
  assert.equal(r.items[1].price, 8.95);
  assert.equal(r.items[1].description, "warm, molten centre");
  assert.equal(r.currencyDetected, "GBP");
  assert.equal(r.items[0].section, "desserts");
});

t("rupee and /- formats, thousands", () => {
  const r = parseMenu("MAINS\nDal Makhani ₹ 345\nThali Rs. 1,250/-\nKadai Paneer 320/-");
  assert.deepEqual(r.items.map((i) => i.price), [345, 1250, 320]);
  assert.equal(r.currencyDetected, "INR");
});

t("dish matching + compare keys keep proteins apart", () => {
  assert.equal(matchDish("Murgh Makhani")?.dish.key, "butter_chicken");
  assert.equal(matchDish("Chkn Tikka Masala")?.dish.key, "chicken_tikka_masala");
  assert.equal(matchDish("Flat White")?.dish.key, "flat_white");
  assert.equal(matchDish("Grandma's secret stew"), null);
  assert.notEqual(compareKey("Chicken Biryani"), compareKey("Mutton Biryani"));
  assert.equal(compareKey("Mutton Biryani"), compareKey("Lamb Dum Biryani"));
});

t("stats helpers", () => {
  assert.equal(median([3, 1, 2]), 2); assert.equal(median([1, 2, 3, 4]), 2.5);
  assert.equal(monthsBetween("2025-01", "2026-11"), 22);
  assert.equal(endingStyle(7.95), ".95"); assert.equal(endingStyle(46), "whole"); assert.equal(endingStyle(49), "9");
  assert.equal(roundMoney(12345), 12500); assert.equal(roundMoney(487), 490);
  assert.equal(testPrice(38, 45), 41); assert.equal(testPrice(10, 10.4), 10.5);
});

t("money levers reconcile by hand", () => {
  // revenue = 600 × 85 × 52/12 = 221,000/month
  const r = repriceLever(inputs, 0.05, "AED")!;
  assert.equal(r.high, roundMoney(221000 * 0.05 * 0.75)); // 8,287.5 → 8,300
  assert.equal(r.low, roundMoney(221000 * 0.025 * 0.75));
  const a = addonLever(inputs, "AED")!;
  // 600 × 0.04..0.10 × (85×0.12=10.2) × 4.333
  assert.equal(a.low, roundMoney(600 * 0.04 * 10.2 * 52 / 12));
  assert.equal(a.high, roundMoney(600 * 0.1 * 10.2 * 52 / 12));
  assert.equal(repriceLever({ ...inputs, coversPerWeek: null }, 0.05, "AED"), null);
});

t("full x-ray without market data: market not assessed, re-weighted", () => {
  const { items, currencySymbolsOnItems } = parseMenu(MENU);
  const res = runXray(items, { ...inputs, lastPriceChange: null }, { currencySymbolsOnItems });
  const market = res.dimensions.find((d) => d.key === "market")!;
  assert.equal(market.score, null);
  assert.equal(res.coverage, 0.8); assert.equal(res.assessed, 4);
  const manual = res.dimensions.filter((d) => d.score != null).reduce((s, d) => s + d.score! * d.weight, 0) / 0.8;
  assert.equal(res.score, Math.round(manual));
  assert.ok(res.findings.some((f) => f.id === "addons"));
  assert.ok(res.findings.length >= 3);
  assert.ok(res.rewrites.length >= 1 && res.rewrites.length <= 3);
  assert.ok(res.score > 0 && res.score <= 100);
});

t("x-ray with price index and benchmark", () => {
  const { items } = parseMenu(MENU);
  const idx: PriceIndexPoint[] = [{ country: "AE", month: "2025-01", value: 100 }, { country: "AE", month: "2026-09", value: 106 }];
  const bench: BenchmarkRow[] = [];
  for (const [name, prices] of [["Butter Chicken", [52, 55, 50, 58, 54]], ["Paneer Tikka", [44, 46, 42, 45, 48]], ["Dal Tadka", [30, 33, 32, 34, 31]]] as const)
    for (const p of prices) bench.push({ city: "Dubai", dish_key: compareKey(name), price: p, currency: "AED" });
  const res = runXray(items, inputs, { benchmark: bench, priceIndex: idx });
  const market = res.dimensions.find((d) => d.key === "market")!;
  assert.notEqual(market.score, null);
  assert.equal(res.coverage, 1);
  const rep = res.findings.find((f) => f.id === "reprice")!;
  assert.ok(rep.money && rep.money.high > 0);
  const under = res.findings.find((f) => f.id === "underpriced")!;
  assert.ok(under.items.includes("Butter Chicken") && under.items.includes("Paneer Tikka"));
  assert.ok(!under.items.includes("Dal Tadka"));
  // a dish with only 4 observations is never compared
  const thin = bench.filter((b) => b.dish_key !== compareKey("Dal Tadka")).slice(0, 9);
  const res2 = runXray(items, inputs, { benchmark: thin, priceIndex: idx });
  assert.ok(!res2.findings.find((f) => f.id === "underpriced")?.items.includes("Paneer Tikka"));
});

t("price check against pasted competitor menus", () => {
  const { items } = parseMenu(MENU);
  const rows = priceCheck(items, [
    { name: "Rival A", text: "MAINS\nMurgh Makhani 55\nDal Tadka 30\nRogan Josh 58" },
    { name: "Rival B", text: "CURRIES\nButter Chicken 52\nLamb Rogan Josh 60" },
  ]);
  const bc = rows.find((r) => r.item === "Butter Chicken")!;
  assert.equal(bc.matches.length, 2); assert.equal(bc.median, 53.5);
  assert.ok(bc.gap! < 0);
  assert.ok(rows.find((r) => r.item === "Lamb Rogan Josh"));
});

t("refreshItem keeps prices in step with an edited price", () => {
  const { items } = parseMenu(MENU);
  const soda = items.find((i) => /Lime/.test(i.name))!;
  const edited = refreshItem({ ...soda, price: 16 });
  assert.equal(edited.price, 16); assert.deepEqual(edited.prices, [16]);
});

t("osm parsing and distance", () => {
  const json = { elements: [
    { type: "node", id: 1, lat: 25.08, lon: 55.14, tags: { name: "Spice Route", amenity: "restaurant", cuisine: "indian;curry", website: "https://x.ae" } },
    { type: "way", id: 2, center: { lat: 25.09, lon: 55.15 }, tags: { name: "Bean There", amenity: "cafe" } },
    { type: "node", id: 3, lat: 25.08, lon: 55.14, tags: { amenity: "restaurant" } },
  ] };
  const p = parseOverpass(json, 25.08, 55.14);
  assert.equal(p.length, 2); assert.equal(p[0].name, "Spice Route"); assert.deepEqual(p[0].cuisine, ["indian", "curry"]);
  assert.ok(Math.abs(haversine(0, 0, 0, 1) - 111195) < 50);
});

t("messy OCR-style text does not crash and flags low confidence", () => {
  const r = parseMenu("WELCOME TO OUR KITCHEN\nOpen 9am - 11pm daily\nCa ppuccino 1 8\nFlat Wh1te 20\n$$$\nTel 04 123 4567");
  assert.ok(r.items.length >= 1);
  const res = runXray(r.items, { ...inputs, concept: "cafe" });
  assert.ok(res.score >= 0);
});

console.log(`ok — ${pass} tests passed`);
