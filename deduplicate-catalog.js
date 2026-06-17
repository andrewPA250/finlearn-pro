#!/usr/bin/env node
/**
 * Catalog deduplication and validation script.
 *
 * Strategy:
 * 1. Parse catalog to extract all create() calls
 * 2. Group by symbol
 * 3. For each group, keep only the "best" entry:
 *    - Prefer entries with yahooSymbol
 *    - Prefer more complete metadata
 *    - Keep first occurrence if tied
 * 4. Validate the deduplicated result
 * 5. Report statistics
 */

const fs = require("fs");
const path = require("path");

const catalogPath = path.join(__dirname, "lib/markets/catalog.ts");
const content = fs.readFileSync(catalogPath, "utf-8");

// ─────────────────────────────────────────────────────────────────────────────
// Parse catalog to extract assets
// ─────────────────────────────────────────────────────────────────────────────

const assetPattern = /create(Stock|ETF|Crypto|Index|Commodity|Forex|Bond)\(\s*({[^}]+(?:{[^}]*}[^}]*)*})\s*\)/g;

const assets = [];
let match;

while ((match = assetPattern.exec(content)) !== null) {
  const type = match[1];
  const paramsStr = match[2];

  // Extract key-value pairs
  const asset = { type, paramsStr, index: match.index };

  // Parse symbol
  const symbolMatch = paramsStr.match(/symbol:\s*"([^"]+)"/);
  if (symbolMatch) asset.symbol = symbolMatch[1];

  // Parse yahooSymbol
  const yahooMatch = paramsStr.match(/yahooSymbol:\s*"([^"]+)"/);
  if (yahooMatch) asset.yahooSymbol = yahooMatch[1];

  // Parse name
  const nameMatch = paramsStr.match(/name:\s*"([^"]+)"/);
  if (nameMatch) asset.name = nameMatch[1];

  // Parse category (if present in object)
  const categoryMatch = paramsStr.match(/category:\s*"([^"]+)"/);
  if (categoryMatch) asset.category = categoryMatch[1];

  assets.push(asset);
}

console.log(`Total create() calls found: ${assets.length}`);

// ─────────────────────────────────────────────────────────────────────────────
// Deduplication: group by symbol and keep best entry
// ─────────────────────────────────────────────────────────────────────────────

const bySymbol = {};
const duplicates = [];

for (const asset of assets) {
  if (!asset.symbol) {
    console.warn(`Skipping asset with no symbol: ${asset.paramsStr.substring(0, 50)}`);
    continue;
  }

  if (!bySymbol[asset.symbol]) {
    bySymbol[asset.symbol] = [];
  }
  bySymbol[asset.symbol].push(asset);
}

const deduplicated = [];

for (const symbol in bySymbol) {
  const group = bySymbol[symbol];

  if (group.length > 1) {
    duplicates.push({
      symbol,
      count: group.length,
      entries: group.map(a => ({ type: a.type, yahoo: a.yahooSymbol ? "✓" : "✗", name: a.name }))
    });
  }

  // Select best entry: prefer one with yahooSymbol, else first
  let best = group[0];
  for (const candidate of group) {
    if (candidate.yahooSymbol && !best.yahooSymbol) {
      best = candidate;
      break;
    }
  }

  deduplicated.push(best);
}

console.log(`\nDuplicate groups found: ${duplicates.length}`);
console.log(`Total unique symbols: ${deduplicated.length}`);
console.log(`Assets to remove: ${assets.length - deduplicated.length}`);

if (duplicates.length > 0) {
  console.log(`\nTop 20 duplicates:`);
  duplicates.slice(0, 20).forEach(d => {
    console.log(`  ${d.symbol}: ${d.count}x (${d.entries.map(e => e.type).join(", ")})`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

const validation = {
  missing_symbol: 0,
  missing_name: 0,
  missing_yahoo: 0,
  total_valid: 0,
  by_type: {}
};

for (const asset of deduplicated) {
  if (!asset.symbol) validation.missing_symbol++;
  if (!asset.name) validation.missing_name++;
  if (!asset.yahooSymbol && asset.type !== 'Bond') validation.missing_yahoo++;

  if (!validation.by_type[asset.type]) {
    validation.by_type[asset.type] = 0;
  }
  validation.by_type[asset.type]++;

  if (asset.symbol && asset.name) {
    validation.total_valid++;
  }
}

console.log(`\nValidation results:`);
console.log(`  Missing symbol: ${validation.missing_symbol}`);
console.log(`  Missing name: ${validation.missing_name}`);
console.log(`  Missing yahooSymbol (non-bonds): ${validation.missing_yahoo}`);
console.log(`  Total valid entries: ${validation.total_valid}`);

console.log(`\nBreakdown by type:`);
for (const type in validation.by_type) {
  console.log(`  ${type}: ${validation.by_type[type]}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate deduplicated catalog code
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n✓ Analysis complete.`);
console.log(`\nTo apply deduplication, run: node apply-deduplication.js`);

// Export for use by apply-deduplication.js
fs.writeFileSync(
  path.join(__dirname, ".dedup-data.json"),
  JSON.stringify({ deduplicated, duplicates, validation }, null, 2)
);
