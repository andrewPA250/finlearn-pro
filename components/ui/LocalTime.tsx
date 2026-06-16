"use client";

import { useState, useEffect } from "react";

interface LocalTimeProps {
  /** Unix timestamp in secondi. */
  timestamp: number;
  /**
   * Formato di visualizzazione:
   * - "time": solo orario, es. "16:21"
   * - "datetime": data + orario, es. "15 Jun 22:00"
   */
  format: "time" | "datetime";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatUTC(ts: number, format: "time" | "datetime"): string {
  const d = new Date(ts * 1000);
  const hh = d.getUTCHours().toString().padStart(2, "0");
  const mm = d.getUTCMinutes().toString().padStart(2, "0");
  if (format === "time") return `${hh}:${mm}`;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${hh}:${mm}`;
}

function formatLocal(ts: number, format: "time" | "datetime"): string {
  const d = new Date(ts * 1000);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  if (format === "time") return `${hh}:${mm}`;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${hh}:${mm}`;
}

/**
 * Renderizza un timestamp Unix come orario nel fuso locale dell'utente.
 *
 * - Server-side (SSR): mostra l'orario in UTC come fallback sicuro.
 * - Client-side (hydration): aggiorna con l'orario locale reale via `useEffect`.
 * - `suppressHydrationWarning`: evita warning React per il cambio UTC→locale.
 *
 * Usato in AssetHero per "Updated 16:21" e "Last Trade 15 Jun 22:00".
 */
export function LocalTime({ timestamp, format }: LocalTimeProps) {
  const [text, setText] = useState(() => formatUTC(timestamp, format));

  useEffect(() => {
    setText(formatLocal(timestamp, format));
  }, [timestamp, format]);

  return <span suppressHydrationWarning>{text}</span>;
}
