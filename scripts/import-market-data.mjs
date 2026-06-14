#!/usr/bin/env node

// Converte un export CSV (FRED o Stooq) nel formato JSON statico richiesto da
// FinLearn Pro: [{ "date": "YYYY-MM-DD", "value": number }, ...]
//
// Uso:
//   node scripts/import-market-data.mjs <input.csv> <output.json>
//
// Formati CSV supportati (rilevati automaticamente dall'header):
// - FRED (https://fred.stlouisfed.org): header "DATE,<SERIE>" (2 colonne),
//   righe "YYYY-MM-DD,<valore o ".">". Le righe con valore mancante ("." nei
//   dati giornalieri FRED) vengono scartate.
//   Esempio: node scripts/import-market-data.mjs ~/Downloads/SP500.csv public/data/sp500.json
//
// - Stooq (https://stooq.com): header "Date,Open,High,Low,Close,Volume,..."
//   (OHLC), righe "YYYY-MM-DD,<open>,<high>,<low>,<close>,...". Viene usata la
//   colonna "Close" come valore.
//   Esempio: node scripts/import-market-data.mjs ~/Downloads/xauusd_d.csv public/data/gold.json

import fs from "fs";
import path from "path";

const [, , inputArg, outputArg] = process.argv;

if (!inputArg || !outputArg) {
  console.error("Uso: node scripts/import-market-data.mjs <input.csv> <output.json>");
  process.exit(1);
}

const inputPath = path.resolve(inputArg);
const outputPath = path.resolve(outputArg);

const raw = fs.readFileSync(inputPath, "utf-8");
const lines = raw.trim().split(/\r?\n/);

if (lines.length < 2) {
  console.error("Il file CSV non contiene dati.");
  process.exit(1);
}

const header = lines[0].split(",").map((column) => column.trim());
if (header.length < 2) {
  console.error(`Header CSV inatteso: "${lines[0]}". Sono richieste almeno 2 colonne.`);
  process.exit(1);
}

const dateColumn = header.findIndex((column) => column.toLowerCase() === "date");
if (dateColumn === -1) {
  console.error(`Header CSV inatteso: "${lines[0]}". Manca una colonna "Date"/"DATE".`);
  process.exit(1);
}

const closeColumn = header.findIndex((column) => column.toLowerCase() === "close");

// FRED: header a 2 colonne "DATE,<SERIE>" -> valore = seconda colonna.
// Stooq/OHLC: header con colonna "Close" -> valore = colonna "Close".
let valueColumn;
let format;
if (closeColumn !== -1) {
  valueColumn = closeColumn;
  format = "OHLC (Stooq)";
} else if (header.length === 2) {
  valueColumn = 1;
  format = "FRED";
} else {
  console.error(
    `Header CSV inatteso: "${lines[0]}". Formato non riconosciuto (né FRED a 2 colonne, né OHLC con colonna "Close").`
  );
  process.exit(1);
}

const points = [];
for (const line of lines.slice(1)) {
  const columns = line.split(",");
  const date = columns[dateColumn]?.trim();
  const rawValue = columns[valueColumn];
  if (!date || rawValue === undefined) continue;

  const value = rawValue.trim();
  if (value === "." || value === "") continue; // valore mancante (es. FRED)

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) continue;

  points.push({ date, value: numericValue });
}

points.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

if (points.length === 0) {
  console.error("Nessun punto valido trovato nel CSV.");
  process.exit(1);
}

fs.writeFileSync(outputPath, JSON.stringify(points, null, 2) + "\n");
console.log(
  `Formato rilevato: ${format}. Scritti ${points.length} punti in ${path.relative(process.cwd(), outputPath)} ` +
    `(${points[0].date} → ${points[points.length - 1].date})`
);
