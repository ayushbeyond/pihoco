// node workspace-src/engine.test.js
const assert = require("node:assert/strict");
const E = require("./engine.js");
let pass = 0;
const t = (name, fn) => { try { fn(); pass++; } catch (e) { console.error("FAIL", name); throw e; } };

// Piyush's illustrative sample (prices excl. VAT for a clean textbook check)
const menuRows = [["Truffle Fries","Sides",32],["Classic Burger","Mains",68],["Grilled Chicken","Mains",72],["Sea Bass","Mains",96],["Mushroom Risotto","Mains",78],["Caesar Salad","Starters",48],["Burrata Salad","Starters",58],["Chocolate Fondant","Desserts",42],["Cheesecake","Desserts",38],["Lemon Tart","Desserts",40],["Iced Latte","Drinks",26],["Fresh Juice","Drinks",28]];
const units = { "Truffle Fries":520,"Classic Burger":460,"Grilled Chicken":380,"Sea Bass":95,"Mushroom Risotto":130,"Caesar Salad":310,"Burrata Salad":85,"Chocolate Fondant":210,"Cheesecake":240,"Lemon Tart":65,"Iced Latte":620,"Fresh Juice":180 };
const cost = { "Truffle Fries":11,"Classic Burger":29,"Grilled Chicken":25,"Sea Bass":48,"Mushroom Risotto":26,"Caesar Salad":18,"Burrata Salad":31,"Chocolate Fondant":12,"Cheesecake":13,"Lemon Tart":12,"Iced Latte":7,"Fresh Juice":10 };
const data = {
  menu: menuRows.map(([item, category, price]) => ({ item, category, price })),
  sales: menuRows.map(([item, , price]) => ({ item, qty: units[item], sales: units[item] * price })),
  costs: menuRows.map(([item]) => ({ item, direct: cost[item], indirect: 0 })),
};
const base = { pricesIncludeVat: false, salesIncludeVat: false, vatRate: 5 };

t("textbook classes per section (fixes total-vs-per-dish bug)", () => {
  const r = E.analyse(data, base);
  const cls = Object.fromEntries(r.items.map((x) => [x.item, x.cls]));
  assert.equal(cls["Sea Bass"], "Puzzle");
  assert.equal(cls["Mushroom Risotto"], "Puzzle");
  assert.equal(cls["Lemon Tart"], "Puzzle");
  assert.equal(cls["Classic Burger"], "Plowhorse");
  assert.equal(cls["Chocolate Fondant"], "Star");
  assert.equal(cls["Grilled Chicken"], "Star");
  assert.equal(cls["Cheesecake"], "Plowhorse");
  assert.equal(cls["Burrata Salad"], "Dog");
});

t("weighted contribution threshold, by hand (Mains)", () => {
  const r = E.analyse(data, base);
  const mains = r.items.filter((x) => x.category === "Mains");
  // (39*460 + 47*380 + 48*95 + 52*130) / (460+380+95+130)
  const expect = (39*460 + 47*380 + 48*95 + 52*130) / 1065;
  assert.ok(Math.abs(mains[0].cmThreshold - expect) < 1e-9);
  assert.ok(Math.abs(mains[0].popThreshold - 0.7 * 1065 / 4) < 1e-9);
});

t("VAT: inclusive prices are netted before contribution", () => {
  const d = { menu: [{ item: "A", category: "X", price: 105 }, { item: "B", category: "X", price: 52.5 }], sales: [{ item: "A", qty: 10, sales: null }, { item: "B", qty: 10, sales: null }], costs: [{ item: "A", direct: 30 }, { item: "B", direct: 20 }] };
  const r = E.analyse(d, { pricesIncludeVat: true, vatRate: 5 });
  assert.equal(Math.round(r.items[0].avgPrice * 100) / 100, 100);
  assert.equal(Math.round(r.items[0].unitCM * 100) / 100, 70);
});

t("commission reduces contribution", () => {
  const d = { menu: [{ item: "A", category: "X", price: 100 }], sales: [{ item: "A", qty: 1, sales: 100 }], costs: [{ item: "A", direct: 30 }] };
  const r = E.analyse(d, { pricesIncludeVat: false, commissionPct: 20 });
  assert.equal(r.items[0].unitCM, 50);
});

t("missing cost is not classified and not counted in thresholds", () => {
  const d = JSON.parse(JSON.stringify(data)); d.costs = d.costs.filter((c) => c.item !== "Sea Bass");
  const r = E.analyse(d, base);
  const sb = r.items.find((x) => x.item === "Sea Bass");
  assert.equal(sb.cls, "Needs costing"); assert.equal(sb.unitCM, null);
  assert.equal(r.totals.needsCosting, 1);
  const actions = E.buildActions(r);
  assert.equal(actions.find((a) => a.item === "Sea Bass").decision, "Get recipe cost");
});

t("matching: order of words and small spelling differences", () => {
  const find = E.matcher([{ item: "Chicken Burger" }, { item: "Truffle fries (large)" }, { item: "Mushroom Risotto" }]);
  assert.equal(find("Burger Chicken").row.item, "Chicken Burger");
  assert.equal(find("Truffle Fries").row.item, "Truffle fries (large)");
  assert.equal(find("Mushrom Risotto").row.item, "Mushroom Risotto");
  assert.equal(find("Sea Bass"), null);
});

t("CSV parsing: quotes, semicolons, BOM, thousands, combined file", () => {
  const rows = E.parseCSV('﻿Item;Category;Price;Quantity Sold;Net Sales;Direct Cost\n"Burger, classic";Mains;"68,00";460;"31.280";29\n');
  const { menu, sales, costs } = E.readRows(rows);
  assert.equal(menu[0].item, "Burger, classic"); assert.equal(menu[0].price, 68);
  assert.equal(sales[0].qty, 460); assert.equal(costs[0].direct, 29);
  assert.equal(E.num("AED 1,250.50"), 1250.5); assert.equal(E.num("1,250"), 1250);
});

t("sales rows are summed (per-day exports)", () => {
  const m = E.mergeSales([{ item: "A", qty: 2, sales: 20 }, { item: "a", qty: 3, sales: 30 }]);
  assert.equal(m.length, 1); assert.equal(m[0].qty, 5); assert.equal(m[0].sales, 50);
});

t("opportunities: plowhorse price test and puzzle lift, monthly", () => {
  const r = E.analyse(data, Object.assign({ tradingDays: 30.4, priceTestPct: 5 }, base));
  const burger = r.items.find((x) => x.item === "Classic Burger");
  assert.ok(Math.abs(burger.opportunity - 68 * 0.05 * 460) < 1e-6);
  const risotto = r.items.find((x) => x.item === "Mushroom Risotto");
  assert.ok(Math.abs(risotto.opportunity - (0.7 * 1065 / 4 - 130) * 52) < 1e-6);
});

t("whole-menu scope and loaded basis run", () => {
  const r = E.analyse(data, Object.assign({ scope: "menu", basis: "loaded", overhead: 4500 }, base));
  assert.equal(r.groups.length, 1);
  assert.ok(Math.abs(r.items.reduce((a, x) => a + x.overheadAlloc, 0) - 4500) < 1e-6);
});

console.log(`ok — ${pass} tests passed`);
