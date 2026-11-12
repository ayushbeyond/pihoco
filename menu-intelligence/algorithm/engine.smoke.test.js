const assert = require('node:assert/strict');
const { analyzeMenu } = require('./engine');
const result = analyzeMenu({
  settings: { vatRate: 0.05, pricesIncludeVat: true, commissionRate: 0.20, commissionBasis: 'delivery_only', comparisonMode: 'section', contributionBasis: 'direct', popularityFactor: 0.70 },
  items: [
    { id: '1', name: 'A', section: 'Mains', price: 105, unitsSold: 100, directCostPerUnit: 30, channel: 'delivery' },
    { id: '2', name: 'B', section: 'Mains', price: 105, unitsSold: 80, directCostPerUnit: 40, channel: 'dine-in' },
    { id: '3', name: 'C', section: 'Mains', price: 105, unitsSold: 60, directCostPerUnit: 50, channel: 'dine-in' }
  ]
});
assert.equal(result.ok, true);
assert.equal(result.items[0].priceExVat, 100);
assert.equal(result.items[0].commissionPerUnit, 20);
assert.equal(result.items[0].directContribution, 50);
assert.equal(result.thresholds.Mains.popularityLine, 56);
const missing = analyzeMenu({ items: [{ name: 'Missing cost', section: 'Mains', price: 20, unitsSold: 10 }] });
assert.equal(missing.items[0].status, 'Needs costing');
assert.equal(missing.items[0].classification, null);
console.log('PIHOCO engine smoke tests passed.');
const loaded = analyzeMenu({
  settings: { contributionBasis: 'fully_loaded' },
  items: [{ name: 'No indirect cost', section: 'Mains', price: 50, unitsSold: 10, directCostPerUnit: 15 }]
});
assert.equal(loaded.items[0].status, 'Needs indirect costing');
assert.equal(loaded.items[0].classification, null);
