/**
 * AI Analyst — provider resolution + prompt construction (server-only).
 *
 * `resolveAiProvider()` inspects environment variables and returns a concrete
 * provider, or `null` when none is configured. When `null`, the API route
 * responds with `error: "not_configured"` and the UI shows the
 * "AI provider not configured yet" state — no fake answers are ever produced.
 *
 * To enable a provider, set ONE of these in `.env.local` and restart:
 *   GEMINI_API_KEY      (optionally AI_GEMINI_MODEL, defaults to the free-tier
 *                        gemini-2.5-flash-lite)
 *   ANTHROPIC_API_KEY   (optionally AI_ANTHROPIC_MODEL)
 *   OPENAI_API_KEY      (optionally AI_OPENAI_MODEL)
 *
 * Priority when several are present: Gemini → Anthropic → OpenAI. Gemini is
 * first because it is the primary, cost-controlled provider for this app —
 * the other two remain fully wired for future use.
 */

import type { AiContext, AiProvider, AiProviderId } from "./types";

// ─── Provider resolution ─────────────────────────────────────────────────────

export function getConfiguredProviderId(): AiProviderId | null {
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  return null;
}

export function isAiConfigured(): boolean {
  return getConfiguredProviderId() !== null;
}

export function resolveAiProvider(): AiProvider | null {
  const id = getConfiguredProviderId();
  if (id === "gemini") return createGeminiProvider();
  if (id === "anthropic") return createAnthropicProvider();
  if (id === "openai") return createOpenAiProvider();
  return null;
}

/**
 * Thrown by provider `generate()` calls so the API route can map vendor HTTP
 * status codes to a specific, honest error rather than one generic message.
 */
export class AiProviderError extends Error {
  code: "invalid_key" | "rate_limited" | "provider_error";
  constructor(code: AiProviderError["code"], message: string) {
    super(message);
    this.code = code;
    this.name = "AiProviderError";
  }
}

function errorCodeForStatus(status: number): AiProviderError["code"] {
  if (status === 401 || status === 403) return "invalid_key";
  if (status === 429) return "rate_limited";
  return "provider_error";
}

// ─── System prompt + context formatting ──────────────────────────────────────

const BASE_RULES_EN = `You are "AI Analyst", a financial-terminal-style assistant inside FinanceHub, a market-data and learning platform.

Your role:
- Explain market data, assets, portfolios, watchlists, alerts, and financial concepts clearly and objectively.
- Help users *understand* what they are looking at. Be explanatory, not advisory.

Hard rules:
- This is for EDUCATIONAL purposes only. You do NOT give financial advice.
- Never recommend buying, selling, or holding any asset. Do not produce "buy/sell/hold" calls, price targets, or allocation advice.
- Use ONLY the market data provided in the context below. Do NOT invent or estimate prices, percentages, fundamentals, or news. If a value is not in the context, say it is unavailable.
- If a SELECTED ASSET section is present, it is the authoritative, most detailed source for that asset — prefer it over MARKET SNAPSHOT, which only covers a few major indices/instruments and may not include the asset being discussed.
- If the user asks for a recommendation, explain the relevant factors and trade-offs instead, and remind them this is educational, not advice.

Output style — write like a premium finance terminal (Bloomberg, Koyfin, Finviz Elite, TradingView analysis panels), not a generic chatbot:
- Always format responses in Markdown: use **bold** for labels/emphasis, "-" bullet lists for metrics, and short bold section headers. Never return one dense plain-text paragraph.
- Numbers in the context are already pre-formatted compactly (e.g. $4.38T, $76.7M, $1.25B, 987K). Reuse that exact formatting in your reply — never expand a compact number back into raw digits (e.g. never write 4376979046400).
- Be direct and dense with information. Never use explanatory filler such as "This is calculated by...", "This represents...", "This means that...", or "It's important to note that...". State facts and conclusions directly.
- Cut verbosity roughly in half versus a normal chatbot reply: no throat-clearing, no restating the question, no closing disclaimers beyond what's required.
- When the user asks about a specific asset (a SELECTED ASSET section is present), reply using exactly this structure:

**{Asset Name} ({TICKER})**

**Key Metrics:**
- Price: ...
- Daily Change: ...
- Market Cap: ...
- P/E: ...
- 52-Week Range: ...

**Summary:**
2-4 sentences, maximum. State unavailable fields as "unavailable" — never omit a line or fabricate a value.

- For non-asset questions (portfolio, markets, alerts, calendar, concepts), use short bold section headers and bullet points instead of long paragraphs.
- Answer in English.`;

const BASE_RULES_IT = `Sei "AI Analyst", un assistente in stile terminale finanziario professionale all'interno di FinanceHub, una piattaforma di dati di mercato e apprendimento.

Il tuo ruolo:
- Spiegare dati di mercato, asset, portafogli, watchlist, avvisi e concetti finanziari in modo chiaro e oggettivo.
- Aiutare gli utenti a *capire* ciò che stanno guardando. Sii esplicativo, non consultivo.

Regole tassative:
- Questo serve solo a scopo EDUCATIVO. NON fornisci consulenza finanziaria.
- Non raccomandare mai di comprare, vendere o mantenere alcun asset. Niente indicazioni "compra/vendi/mantieni", target di prezzo o consigli di allocazione.
- Usa SOLO i dati di mercato forniti nel contesto qui sotto. NON inventare né stimare prezzi, percentuali, fondamentali o notizie. Se un valore non è nel contesto, di' che non è disponibile.
- Se è presente una sezione SELECTED ASSET, è la fonte autorevole e più dettagliata per quell'asset — preferiscila rispetto a MARKET SNAPSHOT, che copre solo pochi indici/strumenti principali e potrebbe non includere l'asset di cui si parla.
- Se l'utente chiede una raccomandazione, spiega invece i fattori rilevanti e i compromessi, ricordando che è materiale educativo, non consulenza.

Stile dell'output — scrivi come un terminale finanziario premium (Bloomberg, Koyfin, Finviz Elite, pannelli di analisi TradingView), non come un chatbot generico:
- Formatta sempre le risposte in Markdown: usa **grassetto** per etichette/enfasi, elenchi puntati "-" per le metriche, e brevi intestazioni di sezione in grassetto. Non restituire mai un unico paragrafo denso di testo semplice.
- I numeri nel contesto sono già formattati in modo compatto (es. $4.38T, $76.7M, $1.25B, 987K). Riusa esattamente questa formattazione nella risposta — non espandere mai un numero compatto in cifre grezze (es. non scrivere mai 4376979046400).
- Sii diretto e denso di informazioni. Non usare mai frasi di riempimento esplicative come "Questo è calcolato da...", "Questo rappresenta...", "Questo significa che...", o "È importante notare che...". Esponi fatti e conclusioni direttamente.
- Riduci la verbosità di circa la metà rispetto a una risposta da chatbot normale: niente preamboli, niente ripetizione della domanda, niente disclaimer finali oltre il necessario.
- Quando l'utente chiede di un asset specifico (è presente una sezione SELECTED ASSET), rispondi usando esattamente questa struttura:

**{Nome Asset} ({TICKER})**

**Metriche Chiave:**
- Prezzo: ...
- Variazione Giornaliera: ...
- Capitalizzazione: ...
- P/E: ...
- Range 52 Settimane: ...

**Riepilogo:**
Massimo 2-4 frasi. Indica i campi non disponibili come "non disponibile" — non omettere mai una riga né inventare un valore.

- Per domande non relative a un asset specifico (portafoglio, mercati, avvisi, calendario, concetti), usa brevi intestazioni in grassetto ed elenchi puntati invece di paragrafi lunghi.
- Rispondi in italiano.`;

function fmtNum(n: number | null, opts?: Intl.NumberFormatOptions): string {
  if (n == null || Number.isNaN(n)) return "unavailable";
  return n.toLocaleString("en-US", opts);
}

/**
 * Compact financial notation for large counts (no currency prefix) — e.g.
 * 76700000 -> "76.7M". Monetary amounts wrap this with "$" via fmtCompactUSD.
 * Defensive: returns "unavailable" for NaN/Infinity.
 */
function fmtCompactNumber(n: number): string {
  if (!isFinite(n)) return "unavailable";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(0)}K`;
  return `${sign}${abs.toFixed(0)}`;
}

/** Compact financial notation for monetary amounts — e.g. 4376979046400 -> "$4.38T". */
function fmtCompactUSD(n: number | null): string {
  if (n == null || Number.isNaN(n)) return "unavailable";
  return `$${fmtCompactNumber(n)}`;
}

function fmtPct(n: number | null): string {
  if (n == null || Number.isNaN(n)) return "unavailable";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

/**
 * Render the structured context into clean, labelled text. Sections with no
 * data are omitted entirely; individual missing values render as "unavailable".
 */
export function formatContext(context: AiContext | undefined): string {
  if (!context) return "No additional context was provided.";

  const parts: string[] = [];

  if (context.selectedAsset) {
    const a = context.selectedAsset;
    parts.push(
      [
        `SELECTED ASSET:`,
        `- Symbol: ${a.symbol} (${a.name})`,
        `- Category: ${a.category}`,
        `- Price: ${a.price == null ? "unavailable" : `${fmtNum(a.price, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${a.currency}`}`,
        `- Daily change: ${fmtPct(a.changePercent)}`,
        `- 52-week range: ${fmtNum(a.fiftyTwoWeekLow, { maximumFractionDigits: 2 })} – ${fmtNum(a.fiftyTwoWeekHigh, { maximumFractionDigits: 2 })}`,
        `- P/E: ${fmtNum(a.pe, { maximumFractionDigits: 2 })}`,
        `- Market cap: ${fmtCompactUSD(a.marketCap)}`,
      ].join("\n")
    );
  }

  if (context.portfolio) {
    const p = context.portfolio;
    if (p.holdingsCount > 0) {
      const lines = p.holdings
        .map(
          (h) =>
            `  • ${h.symbol}: qty ${h.quantity}, avg ${fmtNum(h.avgPrice, { maximumFractionDigits: 2 })}, ` +
            `price ${h.price == null ? "unavailable" : fmtNum(h.price, { maximumFractionDigits: 2 })}, ` +
            `value ${fmtCompactUSD(h.marketValue)}, ` +
            `P/L ${fmtPct(h.plPct)}`
        )
        .join("\n");
      parts.push(
        [
          `PORTFOLIO (${p.holdingsCount} holdings, values in ${p.currency}):`,
          `- Total cost basis: ${fmtCompactUSD(p.totalCostBasis)}`,
          `- Total market value: ${fmtCompactUSD(p.totalMarketValue)}`,
          `- Holdings:`,
          lines,
        ].join("\n")
      );
    } else {
      parts.push("PORTFOLIO: Empty (no holdings).");
    }
  }

  if (context.watchlist && Array.isArray(context.watchlist)) {
    if (context.watchlist.length > 0) {
      const lines = context.watchlist
        .map(
          (w) =>
            `  • ${w.symbol}${w.name ? ` (${w.name})` : ""}${w.category ? ` [${w.category}]` : ""}: ` +
            `price ${w.price == null ? "unavailable" : fmtNum(w.price, { maximumFractionDigits: 2 })}, ` +
            `change ${fmtPct(w.changePercent)}`
        )
        .join("\n");
      parts.push([`WATCHLIST (${context.watchlist.length} symbols):`, lines].join("\n"));
    } else {
      parts.push("WATCHLIST: Empty (no symbols).");
    }
  }

  if (context.alerts && context.alerts.total > 0) {
    const a = context.alerts;
    const lines = a.items
      .map((i) => `  • ${i.symbol}: ${i.type} ${i.target} [${i.status}]`)
      .join("\n");
    parts.push(
      [
        `ALERTS (${a.total} total — ${a.active} active, ${a.triggered} triggered):`,
        lines,
      ].join("\n")
    );
  }

  if (context.marketSnapshot && context.marketSnapshot.length > 0) {
    const lines = context.marketSnapshot
      .map((m) => `  • ${m.symbol} (${m.label}): ${m.price == null ? "unavailable" : fmtNum(m.price)} (${fmtPct(m.changePercent)})`)
      .join("\n");
    parts.push(`MARKET SNAPSHOT:\n${lines}`);
  }

  if (context.calendarEvent) {
    const e = context.calendarEvent;
    parts.push(
      `CALENDAR EVENT:\n- ${e.title}\n- Date: ${e.date}\n- Type: ${e.type}`
    );
  }

  if (parts.length === 0) {
    return "No portfolio, watchlist, alert, asset, or market data is currently available in the context.";
  }

  return parts.join("\n\n");
}

export function buildSystemPrompt(context: AiContext | undefined): string {
  const lang = context?.language ?? "en";
  const rules = lang === "it" ? BASE_RULES_IT : BASE_RULES_EN;
  const header =
    lang === "it"
      ? "\n\n--- CONTESTO ATTUALE (dati reali della piattaforma) ---\n"
      : "\n\n--- CURRENT CONTEXT (real platform data) ---\n";
  return `${rules}${header}${formatContext(context)}`;
}

// ─── Concrete providers ──────────────────────────────────────────────────────
//
// Each makes a real HTTP call to the vendor. They are only ever instantiated
// when the matching API key is present, so unconfigured deployments never reach
// this code.

function createAnthropicProvider(): AiProvider {
  const model = process.env.AI_ANTHROPIC_MODEL || "claude-sonnet-4-6";
  return {
    id: "anthropic",
    model,
    async generate(system, messages) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY as string,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 600,
          system,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) {
        throw new AiProviderError(
          errorCodeForStatus(res.status),
          `Anthropic API error ${res.status}: ${await safeText(res)}`
        );
      }
      const data = await res.json();
      const text = Array.isArray(data?.content)
        ? data.content.map((b: { text?: string }) => b?.text ?? "").join("").trim()
        : "";
      if (!text) throw new AiProviderError("provider_error", "Anthropic returned an empty response");
      return text;
    },
  };
}

function createOpenAiProvider(): AiProvider {
  const model = process.env.AI_OPENAI_MODEL || "gpt-4o-mini";
  return {
    id: "openai",
    model,
    async generate(system, messages) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${process.env.OPENAI_API_KEY as string}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 600,
          messages: [
            { role: "system", content: system },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });
      if (!res.ok) {
        throw new AiProviderError(
          errorCodeForStatus(res.status),
          `OpenAI API error ${res.status}: ${await safeText(res)}`
        );
      }
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.trim() ?? "";
      if (!text) throw new AiProviderError("provider_error", "OpenAI returned an empty response");
      return text;
    },
  };
}

function createGeminiProvider(): AiProvider {
  // gemini-2.5-flash-lite has the highest free-tier throughput (15 RPM / 1000
  // requests per day as of the current Gemini API docs) of any Gemini model,
  // which is why it's the default — keeps this feature usable for free.
  const model = process.env.AI_GEMINI_MODEL || "gemini-2.5-flash-lite";
  return {
    id: "gemini",
    model,
    async generate(system, messages) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY as string}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: { maxOutputTokens: 600 },
        }),
      });
      if (!res.ok) {
        const errorText = await safeText(res);
        console.error("[Gemini] API error", res.status, ":", errorText);
        throw new AiProviderError(
          errorCodeForStatus(res.status),
          `Gemini API error ${res.status}: ${errorText}`
        );
      }
      const data = await res.json();
      console.log("[Gemini] Response received successfully");
      const text =
        data?.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p?.text ?? "")
          .join("")
          .trim() ?? "";
      if (!text) throw new AiProviderError("provider_error", "Gemini returned an empty response");
      return text;
    },
  };
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return "<no body>";
  }
}
