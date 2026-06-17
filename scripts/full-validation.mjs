#!/usr/bin/env node
/**
 * Full catalog validation: test EVERY asset for working quotes
 * Output: working, failed, hidden assets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.join(__dirname, '../lib/markets/catalog.ts');

// Parse catalog file to extract assets
function parseCatalog(content) {
  const assets = [];

  // Match all createStock/createETF/createCrypto/etc patterns
  const createPattern = /create\w+\(\{\s*symbol:\s*"([^"]+)",\s*name:\s*"([^"]+)",.*?yahooSymbol:\s*"([^"]+)"/gs;

  let match;
  while ((match = createPattern.exec(content)) !== null) {
    const [_, symbol, name, yahooSymbol] = match;
    assets.push({ symbol, name, yahooSymbol });
  }

  return assets;
}

async function validateAsset(symbol, yahooSymbol) {
  try {
    const response = await fetch(`http://localhost:3000/api/quotes?symbols=${symbol}`, {
      timeout: 5000
    });
    const data = await response.json();
    const quote = data[symbol];

    if (quote && quote.value && quote.value > 0) {
      return { ok: true, value: quote.value };
    }
    return { ok: false, reason: 'No valid price' };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

async function main() {
  const catalogContent = fs.readFileSync(catalogPath, 'utf-8');
  const assets = parseCatalog(catalogContent);

  console.log(`\n📊 FULL CATALOG VALIDATION\n`);
  console.log(`Total assets in catalog: ${assets.length}\n`);

  const working = [];
  const failed = [];

  for (let i = 0; i < assets.length; i++) {
    const { symbol, name, yahooSymbol } = assets[i];
    process.stdout.write(`\r[${i + 1}/${assets.length}] Testing ${symbol.padEnd(12)}...`);

    const result = await validateAsset(symbol, yahooSymbol);

    if (result.ok) {
      working.push({ symbol, name, yahooSymbol, value: result.value });
    } else {
      failed.push({ symbol, name, yahooSymbol, error: result.reason });
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n\n✅ VALIDATION COMPLETE\n`);
  console.log(`Visible Assets (Total): ${assets.length}`);
  console.log(`Quote Working: ${working.length}`);
  console.log(`Quote Failed: ${failed.length}`);
  console.log(`Success Rate: ${Math.round((working.length / assets.length) * 100)}%\n`);

  if (failed.length > 0) {
    console.log(`❌ FAILED ASSETS (${failed.length}):\n`);
    failed.slice(0, 30).forEach(asset => {
      console.log(`  ${asset.symbol.padEnd(12)} ${asset.name.slice(0, 40).padEnd(40)} → ${asset.error}`);
    });
    if (failed.length > 30) {
      console.log(`  ... and ${failed.length - 30} more`);
    }
  }

  // Write report
  const report = {
    timestamp: new Date().toISOString(),
    totalCatalogAssets: assets.length,
    visibleAssets: assets.length,
    quoteWorking: working.length,
    quoteFailed: failed.length,
    successRate: `${Math.round((working.length / assets.length) * 100)}%`,
    failedAssets: failed.map(a => ({ symbol: a.symbol, name: a.name, yahooSymbol: a.yahooSymbol, error: a.error }))
  };

  fs.writeFileSync(
    path.join(__dirname, '../validation-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\n📁 Report saved to: validation-report.json`);
  console.log(`\nNeed to fix/remove ${failed.length} assets for Phase 7A completion.\n`);
}

main().catch(console.error);
