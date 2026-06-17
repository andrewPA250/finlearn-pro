#!/usr/bin/env node
const YahooFinanceClass = require("yahoo-finance2").default;
const yahooFinance = new YahooFinanceClass({ suppressNotices: ["yahooSurvey"] });

const failingSymbols = [
  { symbol: "BK", expected: "Bank of New York Mellon" },
  { symbol: "FI", expected: "Fiserv" },
  { symbol: "MMC", expected: "Marsh & McLennan" },
  { symbol: "HES", expected: "Hess" },
  { symbol: "MRO", expected: "Marathon Oil" },
  { symbol: "CFLT", expected: "Confluent" },
  { symbol: "ABB", expected: "ABB Ltd" },
  { symbol: "PARA", expected: "Paramount" },
  { symbol: "^SSEC", expected: "Shanghai Composite" },
];

async function diagnose() {
  console.log("Diagnosing failing symbols...\n");

  for (const item of failingSymbols) {
    try {
      const q = await yahooFinance.quote(item.symbol);
      console.log(`\n${item.symbol} (${item.expected}):`);
      console.log(`  Market Price: ${q?.regularMarketPrice ?? "MISSING"}`);
      console.log(`  Name: ${q?.shortName || q?.longName || "MISSING"}`);
      console.log(`  Currency: ${q?.currency || "MISSING"}`);
      console.log(`  Quote Type: ${q?.quoteType || "MISSING"}`);
      console.log(`  Market State: ${q?.marketState || "MISSING"}`);
      console.log(`  Exchange: ${q?.exchange || "MISSING"}`);
    } catch (e) {
      console.log(`\n${item.symbol}: ERROR — ${String(e?.message || e).substring(0, 60)}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }
}

diagnose().catch(console.error);
