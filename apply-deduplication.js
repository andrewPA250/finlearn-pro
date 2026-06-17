#!/usr/bin/env node
/**
 * Apply deduplication to catalog.ts by removing duplicate entries.
 *
 * Strategy: Parse the catalog, identify duplicates, keep the best entry per symbol,
 * and write back a deduplicated version.
 */

const fs = require("fs");
const path = require("path");

const catalogPath = path.join(__dirname, "lib/markets/catalog.ts");
const dedupDataPath = path.join(__dirname, ".dedup-data.json");

// Load deduplication data
const dedupData = JSON.parse(fs.readFileSync(dedupDataPath, "utf-8"));
const deduplicatedAssets = dedupData.deduplicated;
const duplicates = dedupData.duplicates;

console.log(`Applying deduplication...`);
console.log(`Removing ${duplicates.length} duplicate groups (${dedupData.validation.total_valid} unique assets kept)`);

// Read original catalog
const originalContent = fs.readFileSync(catalogPath, "utf-8");
const lines = originalContent.split("\n");

// Identify which create() calls to keep vs remove
const symbolsToKeep = new Set();
for (const asset of deduplicatedAssets) {
  symbolsToKeep.add(asset.symbol);
}

// Find indices of duplicates to remove
// Strategy: match create() calls by symbol, keep the first occurrence of each
const seenSymbols = new Set();
const linesToRemove = new Set();

const assetPattern = /create(Stock|ETF|Crypto|Index|Commodity|Forex|Bond)\(\s*({[^}]+(?:{[^}]*}[^}]*)*})\s*\)/;

let i = 0;
while (i < lines.length) {
  let currentLine = lines[i];

  // Check if this line starts a create() call
  const match = currentLine.match(assetPattern);
  if (match) {
    const paramsStr = match[2];
    const symbolMatch = paramsStr.match(/symbol:\s*"([^"]+)"/);

    if (symbolMatch) {
      const symbol = symbolMatch[1];

      if (seenSymbols.has(symbol)) {
        // This is a duplicate - mark for removal
        console.log(`  Removing duplicate: ${symbol}`);
        linesToRemove.add(i);

        // If the create() call spans multiple lines, remove those too
        let j = i + 1;
        while (j < lines.length && !lines[j].includes("),")) {
          linesToRemove.add(j);
          j++;
        }
        if (j < lines.length) {
          linesToRemove.add(j); // Remove the closing "),"
        }
      } else {
        seenSymbols.add(symbol);
      }
    }
  }

  i++;
}

// Filter out removed lines and write back
const filteredLines = lines.filter((_, idx) => !linesToRemove.has(idx));
const dedupContent = filteredLines.join("\n");

fs.writeFileSync(catalogPath, dedupContent, "utf-8");

console.log(`\n✓ Deduplication applied.`);
console.log(`  Removed ${linesToRemove.size} lines`);
console.log(`  Unique assets: ${deduplicatedAssets.length}`);
console.log(`  Breakdown by type:`);

const byType = {};
for (const asset of deduplicatedAssets) {
  byType[asset.type] = (byType[asset.type] || 0) + 1;
}
for (const type in byType) {
  console.log(`    ${type}: ${byType[type]}`);
}

console.log(`\nNext: Run npm run build to verify the deduplicated catalog compiles.`);
