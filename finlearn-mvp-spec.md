# FinLearn Pro — MVP Spec per Sviluppatore AI

---

## 1. Obiettivo del Prodotto

Web app educativa che guida un utente completamente principiante attraverso 6 lezioni fondamentali su investimenti, inflazione, rischio e statistica applicata. Dopo ogni lezione, un quiz a risposta multipla verifica la comprensione. Al superamento del quiz, si sblocca un grafico interattivo che mostra il concetto appena studiato su dati di mercato reali (S&P 500, Oro, US Treasury 10Y).

**Ipotesi da validare:** gli utenti apprendono meglio quando la teoria è immediatamente collegata a dati reali interattivi.

---

## 2. Stack Consigliato

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Grafici:** Recharts
- **Progressi (beta):** localStorage — nessun backend, nessuna auth
- **Dati di mercato:** file JSON statici nel repository, esportati da FRED — nessuna dipendenza da API esterne
- **Deploy:** Vercel
- **Auth + DB:** Supabase — introdotto solo al lancio pubblico, non nella beta

---

## 3. Pagine da Creare

| Route | Descrizione |
|---|---|
| `/` | Homepage pubblica con CTA "Inizia" |
| `/dashboard` | Home utente — progressi e prossima lezione |
| `/lessons/[id]` | Pagina lezione singola |
| `/lessons/[id]/quiz` | Quiz post-lezione |
| `/workbench` | Grafico interattivo (accesso post-quiz) |

Totale: 5 pagine. Nessuna registrazione o login nella beta — accesso diretto da homepage.

---

## 4. Componenti Principali

**Layout:**
- `Sidebar` — navigazione desktop con progress tracker delle 6 lezioni
- `BottomNav` — navigazione mobile (Home · Lezioni · Grafico)
- `ProgressBar` — barra sottile in cima alla pagina lezione

**Dashboard:**
- `ContinueCard` — card "Continua da dove eri" con titolo lezione e CTA
- `LessonTracker` — 6 cerchi connessi: completato / attivo / bloccato
- `WorkbenchCard` — card statica con tasto "Apri grafico" (nessun rendering grafico)

**Lezione:**
- `LessonContent` — renderer Markdown del contenuto testuale
- `KeyConceptCallout` — card evidenziata per il concetto principale
- `NumericExample` — blocco con font monospace per esempi numerici
- `CompleteLessonButton` — tasto **"Ho completato la lezione"** in fondo alla pagina; il click salva `lesson_completed = true` in localStorage e reindirizza al quiz

**Quiz:**
- `QuestionCard` — testo domanda + 4 opzioni selezionabili
- `AnswerOption` — card selezionabile (stati: default / hover / selected / correct / wrong)
- `FeedbackBlock` — testo spiegazione post-risposta (sempre presente, obbligatorio)
- `QuizResult` — schermata finale con punteggio e CTA sblocco grafico

**Workbench:**
- `ContextBanner` — banner semplice in cima: una riga di testo contestuale alla lezione corrente
- `ChartContainer` — grafico linea principale con asse X date e asse Y normalizzato base 100
- `AssetSelector` — dropdown: S&P 500 / Oro / US Treasury 10Y
- `TimeframeSelector` — pill: 1Y · 5Y · 10Y
- `OverlayControls` — 2 checkbox: Deviazione Standard Mobile / Media Mobile 200gg
- `LessonLink` — card "Lezione collegata" con tasto "Rivedi"
- `ChartTooltip` — tooltip hover con data, valore, variazione %

---

## 5. Dati Necessari

**Contenuto lezioni — file Markdown statici:**

| ID | Titolo | Concetto chiave | Asset nel grafico | Overlay default |
|---|---|---|---|---|
| 1 | Cos'è investire | Rendimento del capitale nel tempo | S&P 500 | Nessuno |
| 2 | Inflazione e potere d'acquisto | Erosione reale del denaro | S&P 500 + US Treasury 10Y | Nessuno |
| 3 | Rischio e rendimento | Relazione rischio/rendimento | S&P 500 + US Treasury 10Y | Nessuno |
| 4 | Volatilità | Dispersione dei rendimenti | S&P 500 | Dev. Standard mobile |
| 5 | Diversificazione | Riduzione del rischio specifico | S&P 500 + Oro | Nessuno |
| 6 | Correlazione tra asset | Correlazione e costruzione portafoglio | S&P 500 + Oro | Nessuno |

Ogni lezione: ~600–900 parole in Markdown + 1 immagine statica + 3 domande quiz con risposta corretta e feedback per ogni opzione.

**Dati di mercato — file JSON statici nel repository:**

| Asset | Fonte / Serie | File |
|---|---|---|
| S&P 500 | FRED `SP500` | `/data/sp500.json` |
| Oro | Stooq `XAUUSD` (colonna `Close`) — le serie FRED `GOLDAMGBD228NLBM`/`GOLDPMGBD228NLBM` sono state rimosse da FRED senza sostituto | `/data/gold.json` |
| US Treasury 10Y | FRED `DGS10` | `/data/us10y.json` |

- Range minimo: 2004–2024 (20 anni). Eccezione: l'oro (Stooq `XAUUSD`) copre dal 2020-08-21, quindi il timeframe 10Y non è disponibile per l'oro (vedi SESSION_NOTES.md)
- Formato: `{ date: string, value: number }[]`
- Aggiornamento: manuale, una volta al mese — nessun cron job
- Calcoli overlay eseguiti client-side: deviazione standard mobile a 30 giorni, media mobile a 200 giorni

---

## 6. Stato Utente e Progressi

**Beta — localStorage, nessun backend:**

```
lessonProgress: {
  [lessonId: string]: {
    lesson_completed: boolean,
    quiz_passed: boolean,
    quiz_attempts: number
  }
}
```

**Regole di accesso:**
- Lezione `n` accessibile solo se `lesson_completed = true` per lezione `n-1` (eccetto lezione 1)
- Quiz accessibile solo se `lesson_completed = true` per la lezione corrente
- `/workbench?lesson=[id]` accessibile solo se `quiz_passed = true` per quella lezione
- Dopo il secondo fallimento del quiz: messaggio *"Rileggi la lezione con calma"* e tasto "Riprova" bloccato 60 secondi — nessun blocco definitivo

**Stato gestito con React Context:**
- Progressi correnti (letti da localStorage all'avvio)
- Risposte quiz nella sessione corrente
- Asset e timeframe selezionati nel grafico

---

## 7. Flusso Utente

```
/ (homepage)
  → [Inizia] → /dashboard
      → /lessons/1 (lettura)
          → [Ho completato la lezione] → /lessons/1/quiz
              → [Quiz superato] → /workbench?lesson=1
                  → [Torna alla dashboard] → /dashboard (progresso aggiornato)
                      → /lessons/2
                          → ... (ripeti per lezioni 2–6)
                              → /dashboard (schermata completamento percorso)
```

**Regola di routing:** se l'utente accede a `/lessons/3` ma ha completato solo la lezione 1, viene reindirizzato a `/lessons/2`.

---

## 8. Design System

**Colori:**
```
--bg-primary:     #0F1117
--bg-card:        #1A1D27
--bg-sidebar:     #13151F
--accent-purple:  #6C63FF
--accent-green:   #00D4A8
--text-primary:   #F0F0F0
--text-secondary: #8B8FA8
--error:          #FF6B6B
```

**Tipografia:**
- Font UI: Inter (Google Fonts)
- Font dati e numeri: JetBrains Mono
- Corpo lezione: 16–17px, line-height 1.6
- Titoli Bold — scala: 14 / 16 / 20 / 28 / 36px

**Specifiche UI:**
- Border radius card: 12px
- Padding card: 20–24px
- Sidebar width desktop: 240px
- Colonna lettura lezione: max-width 680px centrata
- Touch target minimo mobile: 48px height
- Transizioni: 150ms ease-in-out
- Breakpoint mobile: < 768px → sidebar nascosta, BottomNav visibile

---

## 9. Cosa NON Implementare nell'MVP

- Auth, registrazione, login — nessun account nella beta
- Supabase o qualsiasi backend — solo localStorage
- API di mercato live, real-time o intraday — solo JSON statici
- Cron job per aggiornamento dati — aggiornamento manuale mensile
- Yahoo Finance, yfinance o qualsiasi fonte dati esterna a runtime
- BTP 10Y o asset diversi da S&P 500, Oro, US Treasury 10Y
- Lightweight Charts o librerie grafiche diverse da Recharts
- WorkbenchPreview interattiva nella dashboard
- Timer minimo o scroll-tracking per completamento lezione
- Intestazione contestuale complessa pre-grafico — solo banner semplice
- Confronto più di 2 asset simultanei nel grafico
- Statistics Lab, Portfolio Lab, Macro Dashboard
- Certificazioni, badge, gamification
- Glossario, Biblioteca, Enciclopedia
- Export PDF, notifiche, impostazioni profilo
- App nativa iOS/Android
- Feature social o community
- Percorso adattivo o raccomandazioni AI

---

## 10. Piano di Sviluppo in Step

**Step 1 — Contenuti (giorni 1–2)**
Scrivere le 6 lezioni in Markdown (~600–900 parole ciascuna). Scrivere 3 domande quiz per lezione con 4 opzioni, risposta corretta e testo di feedback per ogni opzione. Esportare i 3 file JSON da FRED e salvarli in `/data/`.

**Step 2 — Setup e routing (giorno 3)**
Init Next.js 14 + Tailwind + TypeScript. Creare le 5 route. Implementare `Sidebar` desktop e `BottomNav` mobile. Deploy base su Vercel.

**Step 3 — Pagina lezione (giorno 4)**
Implementare `LessonContent` con renderer Markdown. Aggiungere `KeyConceptCallout` e `NumericExample`. Implementare `CompleteLessonButton`: salva `lesson_completed = true` in localStorage, reindirizza a `/lessons/[id]/quiz`.

**Step 4 — Quiz (giorno 5)**
Implementare `QuestionCard`, `AnswerOption`, `FeedbackBlock`. Logica valutazione client-side. Logica retry: al secondo fallimento, messaggio e blocco tasto 60s. Salvataggio `quiz_passed` e `quiz_attempts` in localStorage. `QuizResult` con CTA "Sblocca il grafico".

**Step 5 — Grafico interattivo (giorni 6–7)**
Implementare `ChartContainer` con Recharts, dati da JSON statici, normalizzazione base 100. Aggiungere `AssetSelector`, `TimeframeSelector`, `OverlayControls`, `ChartTooltip`. Implementare `ContextBanner` con testo contestuale per lezione. Aggiungere `LessonLink` panel.

**Step 6 — Dashboard (giorno 8)**
Implementare `ContinueCard`, `LessonTracker` con logica lock/unlock da localStorage. `WorkbenchCard` statica. Redirect da `/` a `/dashboard`. Schermata di completamento percorso dopo lezione 6.

**Step 7 — Mobile e QA (giorno 9)**
Test flusso completo su mobile (iPhone SE come worst case). Fix touch target, grafico touch, font size. Test end-to-end su desktop e mobile. Fix bug critici.

**Step 8 — Beta privata (giorni 10–11)**
Deploy produzione su Vercel. Accesso diretto, nessuna auth. Onboarding 10–20 utenti beta. Raccolta feedback strutturato. Fix problemi bloccanti.

**Step 9 — Auth e lancio pubblico (giorni 12–14)**
Introdurre Supabase Auth (email + password). Migrare logica progressi da localStorage a DB. Aggiungere pagine `/register` e `/login`. Deploy e lancio pubblico.
