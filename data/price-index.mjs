// Official restaurant price data → monthly index points for the X-ray's "reprice" finding.
// US: BLS CPI-U "Food away from home", U.S. city average (CUUR0000SEFV, NSA, 1982-84=100).
//   Levels May–Sep 2026 from FRED; Apr/Mar 2026 chained back with BLS seasonally adjusted
//   monthly changes (+0.3%, +0.2%); Sep 2025 and Mar 2025 from the 12-month changes BLS reported
//   (3.5% to Sep 2026, 3.8% to Mar 2026).
// UK: ONS CPI annual rate, division 11 "Hotels, cafes and restaurants" (D7GI). The ONS index level
//   was not available, so levels are chained from the annual rates: each month moves by
//   (1 + annual rate)^(1/12). That is an estimate, labelled as such in `source`.
// UAE, India, Singapore: not loaded. Dubai's published restaurant series mixes in hotels and was
//   not available month by month; India rebased its CPI in 2026.

const US_SRC = "BLS CPI-U Food away from home (CUUR0000SEFV) via FRED + BLS CPI releases";
const us = [];
const lvl = { "2026-05": 394.728, "2026-06": 395.633, "2026-07": 396.859, "2026-08": 397.868, "2026-09": 398.783 };
lvl["2026-04"] = lvl["2026-05"] / 1.003;
lvl["2026-03"] = lvl["2026-04"] / 1.002;
lvl["2025-09"] = lvl["2026-09"] / 1.035;
lvl["2025-03"] = lvl["2026-03"] / 1.038;
for (const [month, value] of Object.entries(lvl)) us.push({ country: "US", month, value: +value.toFixed(3), source: US_SRC });

const UK_SRC = "ONS CPI annual rate 11: Hotels, cafes and restaurants (D7GI), chained monthly (estimate)";
const ukRates = {
  2024: [7.0, 6.0, 5.8, 6.0, 5.8, 6.2, 4.9, 4.3, 4.1, 4.3, 4.0, 3.4],
  2025: [3.3, 3.4, 3.0, 2.7, 2.8, 2.6, 3.4, 3.8, 3.9, 3.8, 3.5, 3.8],
  2026: [4.1, 4.0, 4.0, 4.4, 4.2, 4.4, 4.0, 4.1, 3.8],
};
const uk = [];
let v = 100;
let first = true;
for (const [y, rates] of Object.entries(ukRates)) {
  rates.forEach((r, i) => {
    if (!first) v *= (1 + r / 100) ** (1 / 12);
    first = false;
    uk.push({ country: "GB", month: `${y}-${String(i + 1).padStart(2, "0")}`, value: +v.toFixed(3), source: UK_SRC });
  });
}

export const PRICE_INDEX = [...us, ...uk].sort((a, b) => (a.country + a.month).localeCompare(b.country + b.month));
