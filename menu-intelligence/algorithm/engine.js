/** PIHOCO Menu Engineering Analysis Engine — v1.0.0
 * Input: canonical, reconciled menu item records. Import/matching is upstream.
 * All rates are decimals (5% = 0.05). Money scenarios are estimates, not promises.
 */
"use strict";

const DEFAULTS = {
  vatRate: 0.05, pricesIncludeVat: true,
  commissionRate: 0, commissionBasis: "delivery_only",
  comparisonMode: "section", contributionBasis: "direct",
  popularityFactor: 0.70, tradingDays: 30,
  targetCostRate: null, priceTestRate: null,
  overheadAmount: 0, overheadAllocationBasis: "sales"
};
const STATUS = {
  READY: "Ready", COST: "Needs costing", SALES: "No sales",
  CHANNEL: "Needs channel mix", INDIRECT: "Needs indirect costing", INVALID: "Needs data correction"
};

const num = v => (v === null || v === undefined || v === "" || !Number.isFinite(Number(v))) ? null : Number(v);
const div = (a, b) => (Number.isFinite(a) && Number.isFinite(b) && b !== 0) ? a / b : null;
const rnd = (v, d = 2) => (v === null || v === undefined || !Number.isFinite(v)) ? null : Math.round((v + Number.EPSILON) * 10 ** d) / 10 ** d;
const norm = v => String(v ?? "").normalize("NFKC").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");

function validateSettings(input = {}) {
  const s = { ...DEFAULTS, ...input };
  const errors = [];
  if (!(s.vatRate >= 0 && s.vatRate <= 1)) errors.push("VAT rate must be between 0 and 1.");
  if (!(s.commissionRate >= 0 && s.commissionRate <= 1)) errors.push("Commission rate must be between 0 and 1.");
  if (!['section', 'whole_menu'].includes(s.comparisonMode)) errors.push("Invalid comparison mode.");
  if (!['direct', 'fully_loaded'].includes(s.contributionBasis)) errors.push("Invalid contribution basis.");
  if (!['delivery_only', 'all_sales'].includes(s.commissionBasis)) errors.push("Invalid commission basis.");
  if (!['sales', 'units', 'direct_cost', 'equal'].includes(s.overheadAllocationBasis)) errors.push("Invalid overhead allocation basis.");
  if (!(s.popularityFactor > 0 && s.popularityFactor <= 1)) errors.push("Popularity factor must be > 0 and <= 1.");
  if (!(s.tradingDays > 0)) errors.push("Trading days must be greater than zero.");
  if (s.targetCostRate !== null && !(s.targetCostRate > 0 && s.targetCostRate < 1)) errors.push("Target cost rate must be between 0 and 1.");
  if (s.priceTestRate !== null && !(s.priceTestRate >= 0 && s.priceTestRate <= 1)) errors.push("Price test rate must be between 0 and 1.");
  if (!(s.overheadAmount >= 0)) errors.push("Overhead amount cannot be negative.");
  return { settings: s, errors };
}

function commissionShare(item, s) {
  if (s.commissionRate === 0) return { share: 0, needsMix: false };
  if (s.commissionBasis === 'all_sales') return { share: 1, needsMix: false };
  const channel = norm(item.channel);
  if (['delivery', 'delivery app', 'aggregator'].includes(channel)) return { share: 1, needsMix: false };
  if (['dine in', 'takeaway', 'pickup', 'collection'].includes(channel)) return { share: 0, needsMix: false };
  const share = num(item.deliveryShare);
  if (share !== null && share >= 0 && share <= 1) return { share, needsMix: false };
  return { share: null, needsMix: true };
}

function prepareItem(raw, s) {
  const price = num(raw.price), units = num(raw.unitsSold), cost = num(raw.directCostPerUnit);
  const issues = [];
  if (price === null || price < 0) issues.push('Missing or invalid menu price.');
  if (units === null || units < 0) issues.push('Missing or invalid units sold.');
  if (cost !== null && cost < 0) issues.push('Direct cost cannot be negative.');
  const section = String(raw.section || 'Unassigned').trim() || 'Unassigned';
  const netPrice = price === null ? null : (s.pricesIncludeVat ? price / (1 + s.vatRate) : price);
  const channel = commissionShare(raw, s);
  const commission = netPrice !== null && channel.share !== null ? netPrice * s.commissionRate * channel.share : null;
  let status = STATUS.READY;
  if (issues.length || price === null || units === null || (cost !== null && cost < 0)) status = STATUS.INVALID;
  else if (units === 0) status = STATUS.SALES;
  else if (cost === null) status = STATUS.COST;
  else if (channel.needsMix) status = STATUS.CHANNEL;
  const directCM = status === STATUS.READY ? netPrice - cost - commission : null;
  const periodSalesInput = num(raw.netSales);
  const periodSales = periodSalesInput !== null ? Math.max(0, periodSalesInput) : (netPrice !== null && units !== null ? netPrice * units : 0);
  return {
    id: raw.id ?? null, name: String(raw.name || '').trim(), normalizedName: norm(raw.name),
    section, price: rnd(price), priceExVat: rnd(netPrice), unitsSold: units,
    periodSales: rnd(periodSales), directCostPerUnit: rnd(cost), deliveryShare: channel.share,
    commissionPerUnit: rnd(commission), directContribution: rnd(directCM),
    directContributionRaw: directCM, foodCostRate: rnd(div(cost, netPrice), 4),
    status, issues, consultantRemark: raw.consultantRemark || '',
    consultantDecision: raw.consultantDecision || null,
    indirectCostPerUnit: num(raw.indirectCostPerUnit), allocatedOverheadPerUnit: 0,
    fullyLoadedContributionRaw: null, contribution: null, contributionRate: null,
    classification: null, thresholds: null
  };
}

function allocateOverheads(items, amount, basis) {
  const weights = items.map(x => {
    if (basis === 'sales') return Math.max(0, x.periodSales || 0);
    if (basis === 'units') return Math.max(0, x.unitsSold || 0);
    if (basis === 'direct_cost') return Math.max(0, (x.directCostPerUnit || 0) * (x.unitsSold || 0));
    return 1;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  return total > 0 ? weights.map(w => amount * w / total) : items.map(() => 0);
}

function thresholdFor(group, popularityFactor, basis) {
  const count = group.length;
  if (!count) return null;
  const totalUnits = group.reduce((a, x) => a + x.unitsSold, 0);
  const pop = popularityFactor * totalUnits / count;
  const weightedCM = totalUnits > 0
    ? group.reduce((a, x) => a + (basis === 'fully_loaded' ? x.fullyLoadedContributionRaw : x.directContributionRaw) * x.unitsSold, 0) / totalUnits
    : null;
  return { itemCount: count, totalUnits, averageUnits: totalUnits / count, popularityLine: pop, contributionLine: weightedCM };
}

function classify(item, t, basis) {
  if (item.status !== STATUS.READY || !t || t.contributionLine === null) return null;
  const cm = basis === 'fully_loaded' ? item.fullyLoadedContributionRaw : item.directContributionRaw;
  if (cm === null) return null;
  const popular = item.unitsSold >= t.popularityLine;
  const highCM = cm >= t.contributionLine;
  if (popular && highCM) return 'Star';
  if (popular && !highCM) return 'Plowhorse';
  if (!popular && highCM) return 'Puzzle';
  return 'Dog';
}

function actionsFor(item, s) {
  const base = { owner: 'Consultant with chef/operations lead', timing: 'Review in the next menu cycle', scenario: null, scenarioNote: 'No financial impact is promised.' };
  if (item.status !== STATUS.READY) {
    const steps = {
      [STATUS.COST]: 'Complete and verify recipe-level direct cost, including relevant variable components.',
      [STATUS.SALES]: 'Confirm reporting period, item mapping and whether the item was available for sale.',
      [STATUS.CHANNEL]: 'Provide delivery sales share or identify sales channel so commission is applied correctly.',
      [STATUS.INDIRECT]: 'Complete item-level indirect cost data, or explicitly enter zero where no applicable indirect cost exists.',
      [STATUS.INVALID]: 'Correct missing or invalid price/sales/cost fields and re-run analysis.'
    };
    return [{ priority: 'P0', finding: item.status, why: 'The item lacks reliable data for menu classification.', step: steps[item.status], measure: 'Data completeness and reconciled POS/menu item.', owner: 'Consultant with client operations/finance', timing: 'Before recommendations are finalised', scenario: null, scenarioNote: 'No financial scenario until data is complete.' }];
  }
  // Keep the calculated class for auditability, but let an approved consultant
  // decision replace the automated action shown in the recommendation queue.
  if (item.consultantDecision) return [{
    ...base, priority: 'Consultant override', finding: 'Consultant decision overrides system suggestion',
    why: 'The rules-based classification is retained, while the consultant-approved decision takes precedence in the final recommendation.',
    step: String(item.consultantDecision),
    measure: 'Consultant approval status, documented rationale and post-change performance.',
    consultantRemark: item.consultantRemark || ''
  }];
  const cls = item.classification;
  if (cls === 'Star') return [{ ...base, priority: 'P2', finding: 'Star — popular and above the contribution line', why: 'A proven customer choice and strong contributor; unnecessary changes may damage performance.', step: 'Protect consistency, availability, portion control and placement. Review price only against customer value and market evidence.', measure: 'Units, contribution per dish, total contribution, complaints and availability.' }];
  if (cls === 'Puzzle') return [{ ...base, priority: 'P2', finding: 'Puzzle — above contribution line but below popularity line', why: 'The item earns well per sale but is not selected often enough.', step: 'Test placement, naming, description, staff recommendation and visual prominence.', measure: 'Units, conversion where available, contribution per dish and total contribution.' }];
  if (cls === 'Dog') return [{ ...base, priority: 'P1', finding: 'Dog — below both lines', why: 'The item is weak on demand and contribution in its comparison group.', step: 'Check strategic/customer role; consider reformulation, repositioning, a limited test or removal after operational review.', measure: 'Units, contribution, waste, prep complexity and guest feedback.' }];
  const suggestedPrice = s.targetCostRate && item.directCostPerUnit !== null ? item.directCostPerUnit / s.targetCostRate : null;
  let scenario = null, scenarioNote = 'Set a price-test rate and validate customer/competitor context before modelling a scenario.';
  if (s.priceTestRate > 0) {
    const commissionRate = s.commissionRate * (s.commissionBasis === 'all_sales' ? 1 : (item.deliveryShare ?? 0));
    scenario = item.priceExVat * s.priceTestRate * (1 - commissionRate) * item.unitsSold * (30 / s.tradingDays);
    scenarioNote = 'Illustrative monthly contribution scenario assuming current sales volume holds after the price test; not a forecast.';
  }
  return [{ ...base, priority: 'P1', finding: 'Plowhorse — popular but below the contribution line', why: 'The item attracts demand but contributes less per sale than the comparison-group benchmark.', step: 'Review recipe yield, portion size, ingredient specification, waste, supplier price and justified price positioning.', measure: 'Direct contribution per dish, food-cost rate and units sold.', suggestedTargetPriceExVat: rnd(suggestedPrice), scenario: rnd(scenario), scenarioNote }];
}

function analyzeMenu(input = {}) {
  const checked = validateSettings(input.settings);
  if (checked.errors.length) return { ok: false, errors: checked.errors, engineVersion: '1.0.0' };
  const s = checked.settings, raw = Array.isArray(input.items) ? input.items : [];
  if (!raw.length) return { ok: false, errors: ['No menu items were supplied.'], engineVersion: '1.0.0' };
  const items = raw.map(x => prepareItem(x, s));
  if (s.contributionBasis === 'fully_loaded') {
    items.forEach(x => {
      if (x.status === STATUS.READY && num(x.indirectCostPerUnit) === null) {
        x.status = STATUS.INDIRECT;
        x.issues.push('Missing item-level indirect cost for fully loaded analysis.');
      }
    });
  }
  const eligible = items.filter(x => x.status === STATUS.READY);
  const overheadShares = allocateOverheads(eligible, s.overheadAmount, s.overheadAllocationBasis);
  eligible.forEach((x, i) => {
    x.allocatedOverheadPerUnit = x.unitsSold > 0 ? overheadShares[i] / x.unitsSold : 0;
    x.fullyLoadedContributionRaw = x.directContributionRaw - x.indirectCostPerUnit - x.allocatedOverheadPerUnit;
  });
  items.forEach(x => {
    x.contribution = s.contributionBasis === 'fully_loaded' ? x.fullyLoadedContributionRaw : x.directContributionRaw;
    x.contributionRate = div(x.contribution, num(x.priceExVat));
  });
  const groups = new Map();
  eligible.forEach(x => {
    const key = s.comparisonMode === 'whole_menu' ? 'Whole menu' : x.section;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(x);
  });
  const thresholds = {};
  for (const [key, group] of groups) {
    const t = thresholdFor(group, s.popularityFactor, s.contributionBasis);
    thresholds[key] = { itemCount: t.itemCount, totalUnits: rnd(t.totalUnits), averageUnits: rnd(t.averageUnits), popularityLine: rnd(t.popularityLine), contributionLine: rnd(t.contributionLine) };
    group.forEach(x => {
      x.thresholds = { group: key, popularityLine: t.popularityLine, contributionLine: t.contributionLine };
      x.classification = classify(x, t, s.contributionBasis);
    });
  }
  const actionPlan = [];
  items.forEach(x => actionsFor(x, s).forEach(a => actionPlan.push({ itemId: x.id, itemName: x.name, ...a })));
  const counts = { Star: 0, Plowhorse: 0, Puzzle: 0, Dog: 0, Unclassified: 0 };
  items.forEach(x => x.classification ? counts[x.classification]++ : counts.Unclassified++);
  const units = eligible.reduce((a, x) => a + x.unitsSold, 0);
  const totalCM = eligible.reduce((a, x) => a + x.directContributionRaw * x.unitsSold, 0);
  const totalSales = eligible.reduce((a, x) => a + x.periodSales, 0);
  items.forEach(x => {
    x.directContribution = rnd(x.directContributionRaw);
    x.fullyLoadedContribution = rnd(x.fullyLoadedContributionRaw);
    x.contribution = rnd(x.contribution);
    x.contributionRate = rnd(x.contributionRate, 4);
    x.foodCostRate = rnd(x.foodCostRate, 4);
    x.thresholds = x.thresholds ? { ...x.thresholds, popularityLine: rnd(x.thresholds.popularityLine), contributionLine: rnd(x.thresholds.contributionLine) } : null;
    delete x.directContributionRaw;
    delete x.fullyLoadedContributionRaw;
  });
  return {
    ok: true, engineVersion: '1.0.0', settings: s,
    summary: { itemCount: items.length, analysedItemCount: eligible.length, unclassifiedItemCount: items.length - eligible.length, totalUnits: rnd(units), totalPeriodSales: rnd(totalSales), totalDirectContribution: rnd(totalCM), weightedDirectContributionPerDish: rnd(div(totalCM, units)), classCounts: counts },
    thresholds, items, actionPlan,
    methodology: {
      contributionPerDish: 'VAT-exclusive menu price − direct cost per unit − applicable delivery commission per unit',
      popularityLine: `${s.popularityFactor * 100}% of average units sold per eligible item in the comparison group`,
      contributionLine: 'Sales-weighted average contribution per dish in the comparison group',
      comparisonMode: s.comparisonMode, contributionBasis: s.contributionBasis,
      missingDataRule: 'Missing costs, no sales, invalid inputs or unresolved delivery commission mix are not classified or counted in thresholds.'
    }
  };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { analyzeMenu, validateSettings, normalizeText: norm, allocateOverheads };
