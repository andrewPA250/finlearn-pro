#!/usr/bin/env node
const YahooFinanceClass = require("yahoo-finance2").default;
const yahooFinance = new YahooFinanceClass({ suppressNotices: ["yahooSurvey"] });

const symbols = ["BK", "FI", "MMC", "HES", "MRO", "CFLT", "ABB", "PARA", "^SSEC"];

async function test() {
  for (const sym of symbols) {
    try {
      const q = await yahooFinance.quote(sym);
      const price = q?.regularMarketPrice;
      const name = q?.shortName || q?.longName || "?";
      console.log(`${sym.padEnd(8)} ✓ $${price?.toFixed(2) || "N/A"} — ${name}`);
    } catch (e) {
      console.log(`${sym.padEnd(8)} ✗ ${String(e?.message || e).substring(0, 40)}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }
}

test().catch(console.error);
