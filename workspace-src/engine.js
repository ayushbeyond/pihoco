/* PIHOCO Menu Intelligence — audit engine.
 * Pure functions, no DOM. Textbook menu engineering (Kasavana & Smith):
 *   contribution per dish = net price − direct cost (− channel commission)
 *   popularity threshold  = 70% of the average units per dish in the group (configurable)
 *   contribution threshold = sales-weighted average contribution per dish in the same group
 * Groups are menu sections by default (compare mains with mains), or the whole menu.
 */
(function (root) {
  "use strict";

  // ---------------------------------------------------------------- text & numbers
  const norm = (s) =>
    String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/&/g, " and ").replace(/\(.*?\)/g, " ").replace(/[^a-z0-9]+/g, " ").trim();

  function num(v) {
    if (v == null) return NaN;
    if (typeof v === "number") return v;
    let s = String(v).trim().replace(/[^\d.,\-]/g, "");
    if (!s) return NaN;
    if (s.includes(",") && s.includes(".")) s = s.replace(/,/g, "");
    else if (/^-?\d{1,3}(,\d{3})+$/.test(s)) s = s.replace(/,/g, "");
    else s = s.replace(",", ".");
    const n = parseFloat(s);
    return isFinite(n) ? n : NaN;
  }

  function parseCSV(text) {
    text = String(text || "").replace(/^﻿/, "");
    const first = text.split(/\r?\n/, 1)[0] || "";
    const delim = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ";" : (first.includes("\t") && !first.includes(",") ? "\t" : ",");
    const rows = []; let row = [], v = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"' && q && text[i + 1] === '"') { v += '"'; i++; }
      else if (c === '"') q = !q;
      else if (c === delim && !q) { row.push(v); v = ""; }
      else if ((c === "\n" || c === "\r") && !q) {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(v); if (row.some((x) => x.trim())) rows.push(row); row = []; v = "";
      } else v += c;
    }
    row.push(v); if (row.some((x) => x.trim())) rows.push(row);
    if (!rows.length) return [];
    const headers = rows.shift().map((h) => norm(h).replace(/\s+/g, "_"));
    return rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] || "").trim()])));
  }

  const pick = (r, keys) => { for (const k of keys) if (r[k] != null && r[k] !== "") return r[k]; return ""; };
  const ITEM = ["item", "item_name", "dish", "name", "menu_item", "product"];

  /** Normalise any CSV into menu / sales / costs rows. A combined file fills all three. */
  function readRows(rows) {
    const menu = [], sales = [], costs = [];
    for (const r of rows) {
      const item = pick(r, ITEM).trim(); if (!item) continue;
      const price = num(pick(r, ["price", "selling_price", "menu_price", "unit_price"]));
      const qty = num(pick(r, ["quantity_sold", "qty", "units", "units_sold", "quantity", "sold"]));
      const net = num(pick(r, ["net_sales", "sales", "revenue", "net_revenue", "gross_sales"]));
      const direct = num(pick(r, ["direct_cost_per_unit", "direct_cost", "unit_cost", "food_cost", "recipe_cost", "cost"]));
      const indirect = num(pick(r, ["indirect_cost_per_unit", "indirect_cost"]));
      if (isFinite(price)) menu.push({ item, category: pick(r, ["category", "section", "menu_category", "group"]) || "Uncategorised", price, description: pick(r, ["description", "desc"]) });
      if (isFinite(qty)) sales.push({ item, qty, sales: isFinite(net) ? net : null });
      if (isFinite(direct)) costs.push({ item, direct, indirect: isFinite(indirect) ? indirect : 0 });
    }
    return { menu, sales, costs };
  }

  // ---------------------------------------------------------------- matching
  function bigrams(s) { const m = new Map(); const t = ` ${s} `; for (let i = 0; i < t.length - 1; i++) { const g = t.slice(i, i + 2); m.set(g, (m.get(g) || 0) + 1); } return m; }
  function dice(a, b) {
    if (!a || !b) return 0; if (a === b) return 1;
    const A = bigrams(a), B = bigrams(b); let inter = 0, tot = 0;
    for (const [g, n] of A) { inter += Math.min(n, B.get(g) || 0); tot += n; }
    for (const n of B.values()) tot += n;
    return (2 * inter) / tot;
  }
  const sortedTokens = (s) => norm(s).split(" ").filter(Boolean).sort().join(" ");

  /** Find each menu item's row in another list: exact, same words in any order, then a close spelling. */
  function matcher(rows) {
    const exact = new Map(), tokens = new Map();
    rows.forEach((r) => { exact.set(norm(r.item), r); tokens.set(sortedTokens(r.item), r); });
    return (item) => {
      const k = norm(item);
      if (exact.has(k)) return { row: exact.get(k), how: "exact" };
      const t = sortedTokens(item);
      if (tokens.has(t)) return { row: tokens.get(t), how: "same words" };
      let best = null, score = 0;
      for (const r of rows) { const d = dice(k, norm(r.item)); if (d > score) { score = d; best = r; } }
      return score >= 0.88 ? { row: best, how: `close spelling (${Math.round(score * 100)}%)` } : null;
    };
  }

  /** Sum duplicate rows (e.g. sales exported per day or per channel). */
  function mergeSales(sales) {
    const m = new Map();
    for (const s of sales) {
      const k = norm(s.item); const z = m.get(k) || { item: s.item, qty: 0, sales: 0, hasSales: true };
      z.qty += s.qty || 0;
      if (s.sales == null) z.hasSales = false; else z.sales += s.sales;
      m.set(k, z);
    }
    return [...m.values()].map((z) => ({ item: z.item, qty: z.qty, sales: z.hasSales ? z.sales : null }));
  }

  // ---------------------------------------------------------------- analysis
  const DEFAULTS = {
    vatRate: 5, pricesIncludeVat: true, salesIncludeVat: false, commissionPct: 0,
    overhead: 0, allocation: "revenue", popMethod: "70", scope: "section", basis: "direct",
    targetCostPct: 32, priceTestPct: 5, tradingDays: 84,
  };

  function quantile(sorted, p) { if (!sorted.length) return 0; const pos = (sorted.length - 1) * p, lo = Math.floor(pos); return sorted[lo] + (sorted[Math.ceil(pos)] - sorted[lo]) * (pos - lo); }

  function analyse(data, opts) {
    const o = Object.assign({}, DEFAULTS, opts || {});
    const vat = 1 + (Number(o.vatRate) || 0) / 100;
    const commission = (Number(o.commissionPct) || 0) / 100;
    const findSale = matcher(mergeSales(data.sales || []));
    const findCost = matcher(data.costs || []);
    const notes = [];

    const items = (data.menu || []).map((m) => {
      const s = findSale(m.item), c = findCost(m.item);
      if (s && s.how !== "exact") notes.push(`Sales for "${m.item}" matched to "${s.row.item}" (${s.how}).`);
      if (c && c.how !== "exact") notes.push(`Cost for "${m.item}" matched to "${c.row.item}" (${c.how}).`);
      const netPrice = m.price / (o.pricesIncludeVat ? vat : 1);
      const qty = s ? s.row.qty : 0;
      const netSales = s && s.row.sales != null ? s.row.sales / (o.salesIncludeVat ? vat : 1) : qty * netPrice;
      const avgPrice = qty > 0 ? netSales / qty : netPrice;
      const unitDirect = c ? c.row.direct : null;
      const unitIndirect = c ? c.row.indirect || 0 : 0;
      const unitCommission = avgPrice * commission;
      const status = !s || qty <= 0 ? "No sales" : unitDirect == null ? "Needs costing" : "ok";
      const unitCM = unitDirect == null ? null : avgPrice - unitDirect - unitCommission;
      return {
        item: m.item, category: m.category || "Uncategorised", description: m.description || "",
        menuPrice: m.price, netPrice, qty, netSales, avgPrice, unitDirect, unitIndirect, unitCommission,
        directCost: unitDirect == null ? null : unitDirect * qty,
        costPct: unitDirect == null || !avgPrice ? null : unitDirect / avgPrice,
        unitCM, totalCM: unitCM == null ? null : unitCM * qty,
        cmPct: unitCM == null || !avgPrice ? null : unitCM / avgPrice,
        status, cls: status === "ok" ? null : status,
      };
    });

    // sales rows that match no menu item
    const menuKeys = matcher((data.menu || []).map((m) => ({ item: m.item })));
    for (const s of mergeSales(data.sales || [])) if (!menuKeys(s.item)) notes.push(`Sales row "${s.item}" has no menu item and was left out.`);

    // overhead allocation over costed, selling items
    const ok = items.filter((x) => x.status === "ok");
    const tot = { qty: 0, sales: 0, direct: 0 };
    ok.forEach((x) => { tot.qty += x.qty; tot.sales += x.netSales; tot.direct += x.directCost; });
    const overhead = Number(o.overhead) || 0;
    ok.forEach((x) => {
      const w = o.allocation === "units" ? x.qty / (tot.qty || 1) : o.allocation === "direct" ? x.directCost / (tot.direct || 1) : o.allocation === "equal" ? 1 / (ok.length || 1) : x.netSales / (tot.sales || 1);
      x.overheadAlloc = overhead * w;
      x.indirectTotal = x.unitIndirect * x.qty + x.overheadAlloc;
      x.loadedCM = x.totalCM - x.indirectTotal;
      x.loadedUnitCM = x.qty ? x.loadedCM / x.qty : 0;
    });

    // classification per group
    const groups = new Map();
    ok.forEach((x) => { const g = o.scope === "menu" ? "Whole menu" : x.category; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(x); });
    const groupInfo = [];
    for (const [name, g] of groups) {
      const n = g.length, Q = g.reduce((a, x) => a + x.qty, 0);
      const units = g.map((x) => x.qty).sort((a, b) => a - b);
      const popT = o.popMethod === "average" ? Q / n : o.popMethod === "median" ? quantile(units, 0.5) : (0.7 * Q) / n;
      const cmOf = (x) => (o.basis === "loaded" ? x.loadedUnitCM : x.unitCM);
      const cmT = Q ? g.reduce((a, x) => a + cmOf(x) * x.qty, 0) / Q : 0;
      g.forEach((x) => {
        x.group = name; x.popThreshold = popT; x.cmThreshold = cmT; x.cmBasis = cmOf(x);
        const popular = x.qty >= popT, earns = x.cmBasis >= cmT;
        x.cls = popular ? (earns ? "Star" : "Plowhorse") : (earns ? "Puzzle" : "Dog");
        x.popIndex = popT > 0 ? x.qty / popT : 1;
        x.cmIndex = cmT > 0 ? x.cmBasis / cmT : (x.cmBasis >= cmT ? 1.05 : 0.95);
      });
      groupInfo.push({ name, n, units: Q, popThreshold: popT, cmThreshold: cmT, small: n < 3 });
      if (n < 3) notes.push(`"${name}" has only ${n} costed dish${n === 1 ? "" : "es"}; its classes are weak evidence.`);
    }

    // opportunities (scenarios at constant volume), monthly
    const perMonth = 30.4 / (Number(o.tradingDays) || 30.4);
    items.forEach((x) => {
      x.opportunity = 0; x.opportunityNote = "";
      if (x.cls === "Plowhorse") {
        x.opportunity = x.avgPrice * (o.priceTestPct / 100) * x.qty * perMonth;
        x.opportunityNote = `A ${o.priceTestPct}% price test if volume holds`;
      } else if (x.cls === "Puzzle" && x.popThreshold > x.qty) {
        x.opportunity = (x.popThreshold - x.qty) * x.unitCM * perMonth;
        x.opportunityNote = "If promotion lifts sales to the section's popularity line";
      } else if (x.cls === "Dog" && x.totalCM > 0) {
        x.atRisk = x.totalCM * perMonth;
      }
      if (x.costPct != null && x.costPct * 100 > o.targetCostPct) x.overTarget = true;
    });

    // totals
    const sum = (f) => ok.reduce((a, x) => a + (f(x) || 0), 0);
    const allSales = items.reduce((a, x) => a + (x.qty > 0 ? x.netSales : 0), 0);
    const totals = {
      items: items.length, costed: ok.length,
      needsCosting: items.filter((x) => x.status === "Needs costing").length,
      noSales: items.filter((x) => x.status === "No sales").length,
      netSales: allSales, analysedSales: sum((x) => x.netSales), directCost: sum((x) => x.directCost),
      directCM: sum((x) => x.totalCM), loadedCM: sum((x) => x.loadedCM), units: sum((x) => x.qty),
      opportunityMonth: items.reduce((a, x) => a + (x.opportunity || 0), 0),
      perMonth,
    };
    totals.costPct = totals.analysedSales ? totals.directCost / totals.analysedSales : null;
    totals.avgCM = totals.units ? totals.directCM / totals.units : null;
    totals.mix = ["Star", "Plowhorse", "Puzzle", "Dog", "Needs costing", "No sales"].map((c) => ({ cls: c, n: items.filter((x) => x.cls === c).length }));

    return { items, groups: groupInfo, totals, notes, settings: o };
  }

  // ---------------------------------------------------------------- actions
  const PLAYBOOK = {
    Star: { decision: "Protect", priority: "Medium", time: "Ongoing", effort: "Low", owner: "Head chef",
      finding: "Popular, and earns at or above the section average per dish.",
      why: "This dish carries the section. Any drop in quality, portion or availability costs real money.",
      step: "Lock the recipe card and portion; keep it in the best menu position; watch supplier prices monthly.",
      measure: "Units sold, contribution per dish, stock-outs" },
    Plowhorse: { decision: "Re-cost or reprice", priority: "High", time: "0–14 days", effort: "Medium", owner: "Owner + head chef",
      finding: "Popular, but earns below the section average per dish.",
      why: "Small gains per plate multiply across high volume.",
      step: "Check portion and yield, renegotiate the main ingredient, add a paid add-on, then test a small price step for 4 weeks.",
      measure: "Contribution per dish, units sold, guest feedback" },
    Puzzle: { decision: "Promote and test", priority: "Medium", time: "1–3 weeks", effort: "Low", owner: "Owner + floor manager",
      finding: "Earns above the section average per dish, but sells below the popularity line.",
      why: "Every extra one sold is good money; guests just aren't choosing it.",
      step: "Rename and rewrite the description, move it to a prime spot or box it, brief staff to recommend it, review the price.",
      measure: "Menu mix %, units sold" },
    Dog: { decision: "Rework or retire", priority: "High", time: "1–3 weeks", effort: "Medium", owner: "Owner + head chef",
      finding: "Below the popularity line and below the section average per dish.",
      why: "It takes menu space, prep time and stock without paying for them.",
      step: "Check if it has a strategic role (dietary option, signature). If not, rework it into a Puzzle or retire it.",
      measure: "Prep time, waste, units sold, contribution" },
    "Needs costing": { decision: "Get recipe cost", priority: "High", time: "0–7 days", effort: "Low", owner: "Head chef",
      finding: "No direct cost per dish was supplied.",
      why: "Without a cost, its earnings are unknown; it is left out of the matrix.",
      step: "Cost the recipe card (ingredients × yield) and re-run the analysis.",
      measure: "Recipe costed" },
    "No sales": { decision: "Check sales data", priority: "Low", time: "0–7 days", effort: "Low", owner: "Consultant",
      finding: "No sales rows matched this dish in the period.",
      why: "It may be new, renamed in the POS, or not selling at all.",
      step: "Confirm the POS name; if it truly didn't sell, treat it as a Dog.",
      measure: "Sales row found" },
  };
  const RANK = { High: 0, Medium: 1, Low: 2 };

  function buildActions(result, reviews) {
    reviews = reviews || {};
    return result.items.map((x) => {
      const p = PLAYBOOK[x.cls] || PLAYBOOK["No sales"];
      const r = reviews[norm(x.item)] || {};
      const extra = x.overTarget ? ` Direct cost is ${Math.round(x.costPct * 100)}% of the net price, above the ${result.settings.targetCostPct}% target.` : "";
      return {
        item: x.item, category: x.category, cls: x.cls,
        priority: x.overTarget && p.priority !== "High" ? "High" : p.priority,
        decision: r.decision || p.decision, systemDecision: p.decision,
        finding: p.finding + extra, why: p.why, step: p.step, measure: p.measure,
        owner: r.owner || p.owner, time: r.time || p.time, effort: p.effort,
        note: r.text || "", money: x.opportunity || 0, moneyNote: x.opportunityNote || "", atRisk: x.atRisk || 0,
      };
    }).sort((a, b) => RANK[a.priority] - RANK[b.priority] || b.money - a.money || a.item.localeCompare(b.item));
  }

  const api = { norm, num, parseCSV, readRows, matcher, mergeSales, analyse, buildActions, DEFAULTS, PLAYBOOK };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.PIHOCO_ENGINE = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
