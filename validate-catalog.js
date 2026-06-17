#!/usr/bin/env node
/**
 * Validation script for Phase 8A asset catalog.
 * Tests all 600 assets against their quote providers.
 */

const YahooFinanceClass = require("yahoo-finance2").default;
const yahooFinance = new YahooFinanceClass({ suppressNotices: ["yahooSurvey", "ripHistorical"] });
const fs = require("fs");
const path = require("path");

// Load catalog
const catalogPath = path.join(__dirname, "lib/markets/catalog.ts");
const catalogContent = fs.readFileSync(catalogPath, "utf-8");

// Extract all create* calls with multi-line support
const regex = /create(Stock|ETF|Crypto|Index|Commodity|Forex|Bond)\(\{\s*symbol:\s*"([^"]+)"[^}]*?\byahooSymbol:\s*"([^"]+)"[^}]*?\}/gs;

const assets = [];
let match;
while ((match = regex.exec(catalogContent)) !== null) {
  const type = match[1].toLowerCase();
  const symbol = match[2];
  const yahooSymbol = match[3];
  assets.push({ type, symbol, yahooSymbol });
}

console.log(`Total assets found: ${assets.length}\n`);

// Test function
async function testAsset(asset) {
  try {
    const quote = await yahooFinance.quote(asset.yahooSymbol);
    const price = quote?.regularMarketPrice;

    // Validation criteria
    if (!price && price !== 0) return { status: "FAIL", reason: "No price" };
    if (price === 0) return { status: "FAIL", reason: "Price is zero" };
    if (isNaN(price)) return { status: "FAIL", reason: "Price is NaN" };

    return { status: "OK", price };
  } catch (err) {
    const msg = String(err?.message || err || "Unknown error");
    // Some errors are expected for certain asset types (indices, forex, etc)
    return { status: "FAIL", reason: msg.substring(0, 50) };
  }
}

// Run validation
async function validateAll() {
  const results = {
    ok: [],
    failed: [],
    byCategory: {},
  };

  console.log("Validating quotes (this may take 2-3 minutes)...\n");

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const result = await testAsset(asset);

    if (!results.byCategory[asset.type]) {
      results.byCategory[asset.type] = { ok: 0, failed: 0 };
    }

    if (result.status === "OK") {
      results.ok.push(asset);
      results.byCategory[asset.type].ok++;
    } else {
      results.failed.push({ ...asset, reason: result.reason });
      results.byCategory[asset.type].failed++;
    }

    if ((i + 1) % 50 === 0) {
      console.log(`  Progress: ${i + 1}/${assets.length} (${Math.round((i + 1) / assets.length * 100)}%)`);
    }

    // Rate limiting to avoid hitting API limits
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Report
  console.log("\n" + "=".repeat(80));
  console.log("VALIDATION REPORT");
  console.log("=".repeat(80) + "\n");

  console.log(`Total assets:         ${assets.length}`);
  console.log(`Working quotes:       ${results.ok.length} ✓`);
  console.log(`Failed quotes:        ${results.failed.length} ✗`);
  console.log();

  console.log("By Category:");
  for (const [cat, counts] of Object.entries(results.byCategory)) {
    const total = counts.ok + counts.failed;
    const pct = total > 0 ? Math.round((counts.ok / total) * 100) : 0;
    console.log(`  ${cat.padEnd(12)} ${counts.ok.toString().padStart(3)}/${total.toString().padStart(3)} (${pct.toString().padStart(3)}%)`);
  }
  console.log();

  if (results.failed.length > 0) {
    console.log("Failed assets:");
    results.failed.forEach(asset => {
      console.log(`  ${asset.symbol.padEnd(12)} (${asset.type.padEnd(8)}) yahooSymbol="${asset.yahooSymbol}" — ${asset.reason}`);
    });
    console.log();
  }

  console.log("=".repeat(80));
  process.exit(results.failed.length === 0 ? 0 : 1);
}

validateAll().catch(err => {
  console.error("Validation error:", err);
  process.exit(1);
});
