import type { AiChatRequest, AiChatResponse, AiMessage } from "@/lib/ai/types";
import {
  resolveAiProvider,
  buildSystemPrompt,
  getConfiguredProviderId,
} from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

/** Lightweight capability probe used by the UI to render the correct state. */
export async function GET(): Promise<Response> {
  const provider = getConfiguredProviderId();
  return Response.json({ configured: provider !== null, provider });
}

const MAX_MESSAGES = 20;
const MAX_CHARS = 4000;

function isValidMessage(m: unknown): m is AiMessage {
  if (typeof m !== "object" || m === null) return false;
  const msg = m as Record<string, unknown>;
  return (
    (msg.role === "user" || msg.role === "assistant") &&
    typeof msg.content === "string" &&
    msg.content.length > 0
  );
}

export async function POST(request: Request): Promise<Response> {
  let body: AiChatRequest;
  try {
    body = (await request.json()) as AiChatRequest;
  } catch {
    return json({ ok: false, error: "bad_request", message: "Invalid JSON body." }, 400);
  }

  const messages = Array.isArray(body?.messages) ? body.messages : [];
  if (messages.length === 0 || !messages.every(isValidMessage)) {
    return json(
      { ok: false, error: "bad_request", message: "A non-empty list of messages is required." },
      400
    );
  }

  // Trim to recent history and clamp content length to keep requests bounded.
  const trimmed: AiMessage[] = messages.slice(-MAX_MESSAGES).map((m) => ({
    role: m.role,
    content: m.content.slice(0, MAX_CHARS),
  }));

  // No provider configured → honest "not configured" response. Never faked.
  const provider = resolveAiProvider();
  if (!provider) {
    return json({
      ok: false,
      error: "not_configured",
      message: "AI provider not configured yet.",
    });
  }

  try {
    const system = buildSystemPrompt(body.context);
    const reply = await provider.generate(system, trimmed);
    return json({ ok: true, reply, provider: provider.id, model: provider.model });
  } catch (err) {
    console.error("[AI] provider error:", err);
    return json({
      ok: false,
      error: "provider_error",
      message: "The AI provider could not complete the request. Please try again.",
    });
  }
}

function json(payload: AiChatResponse, status = 200): Response {
  return Response.json(payload, { status });
}
