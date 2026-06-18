/**
 * AI Analyst — provider resolution + prompt construction (server-only).
 *
 * `resolveAiProvider()` inspects environment variables and returns a concrete
 * provider, or `null` when none is configured. When `null`, the API route
 * responds with `error: "not_configured"` and the UI shows the
 * "AI provider not configured yet" state — no fake answers are ever produced.
 *
 * To enable a provider, set ONE of these in `.env.local` and restart:
 *   ANTHROPIC_API_KEY   (optionally AI_ANTHROPIC_MODEL)
 *   OPENAI_API_KEY      (optionally AI_OPENAI_MODEL)
 *   GEMINI_API_KEY      (optionally AI_GEMINI_MODEL)
 *
 * Priority when several are present: Anthropic → OpenAI → Gemini.
 */

import type { AiContext, AiProvider, AiProviderId } from "./types";

// ─── Provider resolution ─────────────────────────────────────────────────────

export function getConfiguredProviderId(): AiProviderId | null {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return null;
}

export function isAiConfigured(): boolean {
  return getConfiguredProviderId() !== null;
}

export function resolveAiProvider(): AiProvider | null {
  const id = getConfiguredProviderId();
  if (id === "anthropic") return createAnthropicProvider();
  if (id === "openai") return createOpenAiProvider();
  if (id === "gemini") return createGeminiProvider();
  return null;
}

// ─── System prompt + context formatting ──────────────────────────────────────

const BASE_RULES_EN = `You are "AI Analyst", an educational assistant inside FinanceHub, a market-data and learning platform.

Your role:
- Explain market data, assets, portfolios, watchlists, alerts, and financial concepts clearly and objectively.
- Help users *understand* what they are looking at. Be explanatory, not advisory.

Hard rules:
- This is for EDUCATIONAL purposes only. You do NOT give financial advice.
- Never recommend buying, selling, or holding any asset. Do not produce "buy/sell/hold" calls, price targets, or allocation advice.
- Use ONLY the market data provided in the context below. Do NOT invent or estimate prices, percentages, fundamentals, or news. If a value is not in the context, say it is unavailable.
- If the user asks for a recommendation, explain the relevant factors and trade-offs instead, and remind them this is educational, not advice.
- Be concise and structured. Prefer short paragraphs and bullet points.
- Answer in English.`;

const BASE_RULES_IT = `Sei "AI Analyst", un assistente didattico all'interno di FinanceHub, una piattaforma di dati di mercato e apprendimento.

Il tuo ruolo:
- Spiegare dati di mercato, asset, portafogli, watchlist, avvisi e concetti finanziari in modo chiaro e oggettivo.
- Aiutare gli utenti a *capire* ciò che stanno guardando. Sii esplicativo, non consultivo.

Regole tassative:
- Questo serve solo a scopo EDUCATIVO. NON fornisci consulenza finanziaria.
- Non raccomandare mai di comprare, vendere o mantenere alcun asset. Niente indicazioni "compra/vendi/mantieni", target di prezzo o consigli di allocazione.
- Usa SOLO i dati di mercato forniti nel contesto qui sotto. NON inventare né stimare prezzi, percentuali, fondamentali o notizie. Se un valore non è nel contesto, di' che non è disponibile.
- Se l'utente chiede una raccomandazione, spiega invece i fattori rilevanti e i compromessi, ricordando che è materiale educativo, non consulenza.
- Sii conciso e strutturato. Preferisci paragrafi brevi ed elenchi puntati.
- Rispondi in italiano.`;

function fmtNum(n: number | null, opts?: Intl.NumberFormatOptions): string {
  if (n == null || Number.isNaN(n)) return "unavailable";
  return n.toLocaleString("en-US", opts);
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
        `- 52-week range: ${fmtNum(a.fiftyTwoWeekLow)} – ${fmtNum(a.fiftyTwoWeekHigh)}`,
        `- P/E: ${fmtNum(a.pe)}`,
        `- Market cap: ${fmtNum(a.marketCap)}`,
      ].join("\n")
    );
  }

  if (context.portfolio && context.portfolio.holdingsCount > 0) {
    const p = context.portfolio;
    const lines = p.holdings
      .map(
        (h) =>
          `  • ${h.symbol}: qty ${h.quantity}, avg ${fmtNum(h.avgPrice, { maximumFractionDigits: 2 })}, ` +
          `price ${h.price == null ? "unavailable" : fmtNum(h.price, { maximumFractionDigits: 2 })}, ` +
          `value ${h.marketValue == null ? "unavailable" : fmtNum(h.marketValue, { maximumFractionDigits: 2 })}, ` +
          `P/L ${fmtPct(h.plPct)}`
      )
      .join("\n");
    parts.push(
      [
        `PORTFOLIO (${p.holdingsCount} holdings, values in ${p.currency}):`,
        `- Total cost basis: ${fmtNum(p.totalCostBasis, { maximumFractionDigits: 2 })}`,
        `- Total market value: ${p.totalMarketValue == null ? "unavailable" : fmtNum(p.totalMarketValue, { maximumFractionDigits: 2 })}`,
        `- Holdings:`,
        lines,
      ].join("\n")
    );
  }

  if (context.watchlist && context.watchlist.length > 0) {
    parts.push(`WATCHLIST (${context.watchlist.length}): ${context.watchlist.join(", ")}`);
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
          max_tokens: 1024,
          system,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) {
        throw new Error(`Anthropic API error ${res.status}: ${await safeText(res)}`);
      }
      const data = await res.json();
      const text = Array.isArray(data?.content)
        ? data.content.map((b: { text?: string }) => b?.text ?? "").join("").trim()
        : "";
      if (!text) throw new Error("Anthropic returned an empty response");
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
          max_tokens: 1024,
          messages: [
            { role: "system", content: system },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });
      if (!res.ok) {
        throw new Error(`OpenAI API error ${res.status}: ${await safeText(res)}`);
      }
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.trim() ?? "";
      if (!text) throw new Error("OpenAI returned an empty response");
      return text;
    },
  };
}

function createGeminiProvider(): AiProvider {
  const model = process.env.AI_GEMINI_MODEL || "gemini-1.5-flash";
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
          generationConfig: { maxOutputTokens: 1024 },
        }),
      });
      if (!res.ok) {
        throw new Error(`Gemini API error ${res.status}: ${await safeText(res)}`);
      }
      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p?.text ?? "")
          .join("")
          .trim() ?? "";
      if (!text) throw new Error("Gemini returned an empty response");
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
