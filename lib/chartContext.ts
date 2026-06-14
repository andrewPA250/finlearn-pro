/**
 * Testo contestuale per il `ContextBanner` del workbench, una riga per
 * lezione (sez. 4 spec). Modulo separato da `lib/lessons.ts` perché
 * quest'ultimo usa `fs`/`path` (solo server) mentre `WorkbenchView` è un
 * client component — stesso motivo per cui `lib/access.ts` è separato
 * (vedi SESSION_NOTES.md, decisioni tecniche).
 */
export const CHART_CONTEXT: Record<number, string> = {
  1: "Osserva come il valore dell'S&P 500 (indice base 100) cresce nel tempo.",
  2: "Confronta l'S&P 500 (indice base 100) con il rendimento del Treasury USA a 10 anni: il Treasury è una percentuale, non un prezzo.",
  3: "Confronta il rendimento atteso dell'S&P 500 (indice base 100) con il rendimento, più stabile, del Treasury USA a 10 anni (percentuale).",
  4: "Attiva la deviazione standard mobile per vedere quanto varia, periodo per periodo, il valore dell'S&P 500.",
  5: "Confronta S&P 500 e Oro (entrambi indice base 100): nota come si muovono in modo diverso nello stesso periodo.",
  6: "Osserva se S&P 500 e Oro (entrambi indice base 100) si muovono nella stessa direzione o in direzioni opposte.",
};
