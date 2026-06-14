# FinLearn Pro — Session Notes

> Handoff dello stato del progetto. Aggiornare ad ogni step completato.

---

## Stato attuale: Step 7.5 (extra, fuori spec) completato — UI/UX polish: sidebar/bottom nav con stati attivi e icone, branding FinLearn, dashboard e homepage più ricche visivamente, microanimazioni leggere.

Riferimento spec: [finlearn-mvp-spec.md](finlearn-mvp-spec.md)

---

## 1. File creati/modificati

### Step 1 — Setup, design tokens, routing, tipi base

- Progetto Next.js 14 (App Router) + TypeScript + Tailwind scaffoldato alla radice del repo (`package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `.eslintrc.json`, `.gitignore`)
- `app/globals.css` — design tokens come CSS variables (colori da sez. 8 della spec)
- `tailwind.config.ts` — mapping dei tokens (colori, font, font-size scale, border radius, breakpoint mobile, max-width "reading", spacing sidebar/touch-target)
- `app/layout.tsx` — root layout, font Inter (UI) + JetBrains Mono (dati/numeri) via `next/font/google`, include `Sidebar` + `BottomNav`
- `app/page.tsx` — homepage placeholder con CTA "Inizia" → `/dashboard`
- `app/dashboard/page.tsx` — placeholder
- `app/lessons/[id]/page.tsx` — placeholder + `ProgressBar`
- `app/lessons/[id]/quiz/page.tsx` — placeholder
- `app/workbench/page.tsx` — placeholder, legge `?lesson=`
- `components/layout/Sidebar.tsx` — nav desktop (240px, link a Dashboard/Lezioni 1-6/Grafico)
- `components/layout/BottomNav.tsx` — nav mobile (Home/Lezioni/Grafico, altezza 48px)
- `components/layout/ProgressBar.tsx` — barra sottile, prop `progress: number` (0-100)
- `types/lesson.ts`, `types/quiz.ts`, `types/progress.ts`, `types/market.ts`, `types/index.ts` — tipi base condivisi
- `lib/progress/types.ts` — interfaccia astratta `ProgressStore` (nessuna implementazione ancora)

### Step 2 — Contenuti, quiz, dati di mercato

- `content/lessons/lesson-1.md` … `lesson-6.md` — 6 lezioni in Markdown (437–500 parole ciascuna)
- `content/lessons/quizzes/quiz-1.json` … `quiz-6.json` — 3 domande × 4 opzioni × feedback per opzione, `passThreshold: 2`
- `lib/lessons.ts` — `LESSON_META` (metadati tipizzati), `getAllLessonIds`, `getLessonMeta`, `getLessonContent`, `getQuiz`
- `public/data/sp500.json`, `public/data/gold.json`, `public/data/us10y.json` — **placeholder** (5 punti mensili, solo 2024)

### Step 3 — Stato e accesso

- `lib/access.ts` — regole lock/unlock pure (sez. 6-7 spec): `isLessonUnlocked`, `isQuizUnlocked`, `isWorkbenchUnlocked`, `getNextAccessibleLessonId`, costanti `TOTAL_LESSONS`/`LESSON_IDS`
- `lib/progress/localStorageProgressStore.ts` — implementazione di `ProgressStore` (interfaccia già definita in `lib/progress/types.ts`) su localStorage (`finlearn:lessonProgress`)
- `lib/progress/ProgressContext.tsx` — `ProgressProvider` + hook `useProgress()`: stato progressi, `isLoaded`, getter/setter (`setLessonCompleted`, `setQuizPassed`, `incrementQuizAttempts`) e check di accesso
- `app/layout.tsx` — root layout avvolto in `ProgressProvider`
- `components/layout/Sidebar.tsx` — ora client component, collegato a `useProgress()`: lezioni bloccate mostrate come non cliccabili (🔒, opacity 40%), lezioni completate con ✓
- `components/progress/LessonAccessGuard.tsx` — guard client-side per `/lessons/[id]`: se la lezione è bloccata, redirect a `getNextAccessibleLessonId()`
- `components/progress/CourseProgressBar.tsx` — wrapper client di `ProgressBar` collegato ai progressi reali (% lezioni completate sul totale)
- `app/lessons/[id]/page.tsx` — usa `LessonAccessGuard` e `CourseProgressBar`

### Pagina lezione (spec Step 3) — contenuto reale, Markdown, CompleteLessonButton

- `package.json` — aggiunta dipendenza `react-markdown@10`
- `components/lesson/LessonContent.tsx` — renderer Markdown (server component) del contenuto in `content/lessons/lesson-N.md`, tramite `react-markdown` con mapping di `h1/h2/h3/p/ul/ol/li/strong/em` allo stile del design system
- `components/lesson/CompleteLessonButton.tsx` — client component: chiama `setLessonCompleted(lessonId, true)` da `useProgress()` e fa `router.push` a `/lessons/[id]/quiz`; etichetta dinamica ("Ho completato la lezione" / "Vai al quiz" se già completata)
- `app/lessons/[id]/page.tsx` — ora carica `getLessonMeta(id)` + `getLessonContent(id)` da `lib/lessons.ts`, chiama `notFound()` per id non validi (es. `/lessons/99`), mostra titolo + concetto chiave della lezione (`meta.title`, `meta.keyConcept`), renderizza il Markdown con `LessonContent` e include `CompleteLessonButton`. `LessonAccessGuard` e `CourseProgressBar` (Step 3 precedente) invariati.

### Completamento Step 3 (spec) — KeyConceptCallout e NumericExample

- `components/lesson/KeyConceptCallout.tsx` — nuovo componente: card evidenziata (bordo viola, `bg-bg-card`, `rounded-card`) per `meta.keyConcept`, con etichetta "Concetto chiave"
- `components/lesson/NumericExample.tsx` — nuovo componente: blocco dedicato (bordo viola, `bg-bg-card`, `rounded-card`, `font-mono`) per gli esempi pratici/numerici
- `components/lesson/LessonContent.tsx` — aggiunta `splitLessonContent()`: isola la sezione `## Esempio pratico` dal resto del Markdown (senza modificare i file `.md`) e la renderizza dentro `NumericExample` con uno set di `markdownComponents` dedicato (`numericMarkdownComponents`, testo `text-sm`, font-mono ereditato dal contenitore)
- `app/lessons/[id]/page.tsx` — rimossa la visualizzazione del concetto chiave come riga di testo sopra il titolo (rimane solo "Lezione N di 6"); aggiunta `<KeyConceptCallout keyConcept={meta.keyConcept} />` subito sotto il titolo, prima di `LessonContent`

### Step 4 (spec) — Quiz funzionante

- `components/quiz/AnswerOption.tsx` — card selezionabile per una opzione di risposta, stati `default` / `selected` / `correct` / `wrong` (bordo+sfondo `accent-purple`/`accent-green`/`error`, icone ✓/✕ per `correct`/`wrong`)
- `components/quiz/FeedbackBlock.tsx` — blocco di spiegazione sempre visibile dopo la conferma della risposta, con etichetta "Risposta corretta"/"Risposta non corretta" e testo `option.feedback`
- `components/quiz/QuestionCard.tsx` — domanda + 4 `AnswerOption` + `FeedbackBlock` (dopo conferma) + tasto "Conferma risposta" / "Domanda successiva" / "Vedi risultato" (ultima domanda)
- `components/quiz/QuizResult.tsx` — schermata finale: punteggio `score/total` (font-mono), confronto con `passThreshold`; se superato → CTA "Sblocca il grafico" (`Link` a `/workbench?lesson=[id]`); se non superato → messaggio ed eventuale tasto "Riprova" (bloccato se `retryLockedSeconds > 0`)
- `components/quiz/QuizRunner.tsx` — client component, orchestratore: stato domanda corrente, risposta selezionata/confermata, calcolo punteggio finale su `quiz.passThreshold`, chiamata a `incrementQuizAttempts`/`setQuizPassed` da `useProgress()`, logica di retry-lock 60s dopo il secondo fallimento
- `components/progress/QuizAccessGuard.tsx` — guard client-side per `/lessons/[id]/quiz`: se `isQuizUnlocked(lessonId)` è `false` (lezione non completata), redirect a `/lessons/[id]`
- `app/lessons/[id]/quiz/page.tsx` — non più placeholder: carica `getLessonMeta(id)` + `getQuiz(id)` da `lib/lessons.ts`, `notFound()` per id non validi, avvolge `QuizRunner` in `QuizAccessGuard`

### Step 5 (spec) — Workbench / grafico interattivo

- `package.json` — aggiunta dipendenza `recharts@^3.8.1` e script `import-market-data`
- `lib/market.ts` — utility pure (nessuna dipendenza `fs`, importabile da client component):
  - `ASSET_LABELS`, `ASSET_FILE_NAMES`, `ASSET_SOURCE_LABELS`, `ASSET_UNITS` (`"index"` per sp500/gold, `"percent"` per us10y), `TIMEFRAMES`, `REQUIRED_RANGE_LABEL`
  - `sanitizeSeries` — filtra punti non validi e ordina per data
  - `hasSufficientData(data, timeframe)` — vero se la serie copre almeno il 90% del timeframe richiesto e ha ≥50 punti; usata per distinguere dati reali da placeholder senza marcatori espliciti
  - `filterByTimeframe` — filtro sugli ultimi N anni rispetto all'ultimo punto della serie
  - `normalizeBase100` — normalizzazione sul primo punto della serie passata (va chiamata dopo `filterByTimeframe`)
  - `movingAverage(data, 200)`, `rollingStdDev(data, 30)` (deviazione standard dei rendimenti giornalieri %, su dati grezzi non filtrati)
  - `forwardFillOnDates` — allinea una serie secondaria sulle date della serie primaria propagando l'ultimo valore noto
  - tipi `ChartPoint`, `SeriesMeta`, `AssetUnit`
- `lib/chartContext.ts` — `CHART_CONTEXT`: una riga di testo per `ContextBanner` per ciascuna delle 6 lezioni. Modulo separato da `lib/lessons.ts` (che usa `fs`) per essere importabile da `WorkbenchView` (client component) — stesso pattern di `lib/access.ts`
- `components/workbench/ContextBanner.tsx` — banner semplice (testo da `CHART_CONTEXT`)
- `components/workbench/AssetSelector.tsx` — dropdown S&P 500 / Oro / US Treasury 10Y, controlla l'asset primario
- `components/workbench/TimeframeSelector.tsx` — pill 1Y / 5Y / 10Y
- `components/workbench/OverlayControls.tsx` — checkbox "Deviazione standard mobile (30gg)" e "Media mobile (200gg)"
- `components/workbench/ChartTooltip.tsx` — `createChartTooltip(series, points)`: factory che ritorna il componente tooltip Recharts, mostra data, valore e variazione per ogni serie visibile (% relativa per serie "index", punti percentuali per serie "percent")
- `components/workbench/ChartContainer.tsx` — `ComposedChart` Recharts: asse X date, asse Y sinistro "Indice (base 100)" (serie `index`) e/o asse Y destro "%" (serie `percent`), linee per `primary`/`secondary`/`ma200`/`stdDev`, legenda
- `components/workbench/LessonLink.tsx` — card "Lezione collegata" con tasto "Rivedi" → `/lessons/[id]`
- `components/workbench/EmptyState.tsx` — stato "Dati reali non ancora caricati": elenca, per ogni asset richiesto che non ha dati sufficienti, il file `public/data/*.json` mancante, la serie FRED e il formato atteso
- `components/workbench/WorkbenchView.tsx` — client component orchestratore: stato locale (`primaryAsset`, `timeframe`, `overlays`) inizializzato da `lessonMeta` (chartAssets/defaultOverlays), calcola la serie combinata (normalizzazione, overlay, allineamento) con `useMemo`, decide se mostrare `ChartContainer` o `EmptyState` in base a `hasSufficientData`
- `components/progress/WorkbenchAccessGuard.tsx` — guard client-side per `/workbench?lesson=[id]`: se `isWorkbenchUnlocked(lessonId)` è `false`, redirect a `/lessons/[id]/quiz`
- `app/workbench/page.tsx` — non più placeholder: server component, legge i 3 JSON da `public/data/` via `fs`, valida `?lesson=` (1-6), passa `rawData` + `lessonMeta` a `WorkbenchView`, avvolge il tutto in `WorkbenchAccessGuard` se `lesson` è valido
- `scripts/import-market-data.mjs` — script Node per convertire un CSV esportato da FRED nel formato `{date, value}[]` richiesto (vedi sez. "Dati reali da scaricare" sotto)

### Step 6 (spec) — Dashboard

- `lib/access.ts` — nuova funzione pura `isPathCompleted(state)`: vero se `quizPassed = true` per l'ultima lezione (lezione 6), coerente col flusso "torna alla dashboard dopo il quiz 6" (sez. 7 spec)
- `components/dashboard/LessonTracker.tsx` — client component, `useProgress()`: 6 cerchi connessi da una linea, stato per cerchio (`completed` ✓ verde / `active` evidenziato viola = prima lezione non completata / `locked` 🔒 opacity 40%); ogni cerchio sbloccato è un `Link` a `/lessons/[id]`
- `components/dashboard/ContinueCard.tsx` — card "Continua da dove eri": titolo + concetto chiave della prossima lezione accessibile (`lessonMeta` passato come prop), CTA "Continua" → `/lessons/[id]`
- `components/dashboard/WorkbenchCard.tsx` — card statica (nessun rendering grafico), tasto "Apri grafico" → `/workbench` (modalità esplorazione libera, nessun guard)
- `components/dashboard/CompletionScreen.tsx` — schermata di completamento percorso, mostrata al posto di `ContinueCard` quando `isPathCompleted(state)` è vero; CTA "Esplora il grafico" → `/workbench`
- `components/dashboard/DashboardView.tsx` — client component orchestratore: legge `state` da `useProgress()`, calcola `nextLessonId` (`getNextAccessibleLessonId`) e `pathCompleted` (`isPathCompleted`), assembla `LessonTracker` + (`ContinueCard` o `CompletionScreen`) + `WorkbenchCard`
- `app/dashboard/page.tsx` — non più placeholder: server component, importa `LESSON_META` da `lib/lessons.ts` (fs) e lo passa come prop a `DashboardView`
- `app/page.tsx` — invariata: homepage pubblica con CTA "Inizia" → `/dashboard` (nessun redirect automatico, per scelta — vedi "Decisioni tecniche prese")

### Step 7 (spec) — Mobile e QA

Solo fix di layout/CSS, nessuna nuova funzionalità.

- `app/globals.css` — `overflow-x: hidden` su `html, body`: difesa contro overflow orizzontale su mobile (es. tooltip del grafico vicino al bordo dello schermo)
- `app/page.tsx` (homepage) — `min-h-screen` → `min-h-[calc(100vh-3rem)] md:min-h-screen`: evitava uno scroll verticale di 48px su mobile (il `<main>` in `app/layout.tsx` ha già `pb-touch-target` per il `BottomNav`, quindi `min-h-screen` + quel padding superava il 100vh); CTA "Inizia" ora `flex min-h-touch-target items-center` per garantire l'altezza minima touch target (48px)
- `components/dashboard/LessonTracker.tsx` — cerchi `h-10 w-10` → `h-8 w-8 sm:h-10 sm:w-10` (e `text-xs sm:text-sm`), padding card `p-5` → `p-4 sm:p-5`: evita layout troppo compresso sui 6 cerchi connessi su schermi ≤375px
- `components/dashboard/ContinueCard.tsx` e `components/dashboard/CompletionScreen.tsx` — CTA (`Continua` / `Esplora il grafico`) ora `w-full md:w-auto` (prima `inline-flex` a larghezza intrinseca), per coerenza con le altre CTA dell'app (`CompleteLessonButton`, `QuizResult`) e touch target a piena larghezza su mobile
- `components/workbench/ChartContainer.tsx` — altezza `h-[360px]` → `h-[420px] sm:h-[360px]` + `overflow-hidden`: su mobile la legenda (fino a 4 serie con overlay attivi) può andare su più righe, l'altezza extra evita che l'area del grafico si comprima troppo; `overflow-hidden` evita che il tooltip di Recharts causi scroll orizzontale della pagina vicino ai bordi
- `components/workbench/ChartTooltip.tsx` — tooltip ora `max-w-[240px]`, righe `flex-wrap` con `break-words`/`whitespace-nowrap` sul valore: evita che etichette lunghe (es. "US Treasury 10Y (%, rendimento)") forzino un tooltip più largo dello schermo su mobile

### Step 7.5 (extra, fuori spec) — UI/UX Polish

Solo modifiche visive/CSS e markup presentazionale. Nessuna nuova funzionalità, nessuna modifica a logica di progressi/quiz/dati/workbench.

- `components/layout/icons.tsx` — **nuovo file**: set di icone SVG inline leggere (nessuna dipendenza esterna) — `LogoMark` (logomark FinLearn, quadrato con gradiente viola→verde), `DashboardIcon`, `BookIcon`, `ChartIcon`, `LockIcon`, `CheckIcon`, `ArrowRightIcon`, `TrophyIcon`
- `app/globals.css` — aggiunto glow ambientale sottile (due `radial-gradient` viola/verde in `background-image` di `html, body`, `background-attachment: fixed`) per una percezione "premium" del tema scuro; aggiunti `::selection` (colore viola), `:focus-visible` (outline viola, accessibilità tastiera) e `scrollbar-color` (viola su sfondo sidebar)
- `tailwind.config.ts` — aggiunta keyframe/animation `fade-in-up` (fade + piccolo slide verso l'alto, 0.4s) per microanimazioni leggere su card e sezioni hero
- `components/layout/Sidebar.tsx` — redesign: logomark + wordmark "Fin**Learn**" con tagline "Investire, capito."; nuova sezione "Percorso" con contatore `X/6` e barra di progresso reale (`ProgressBar`, dati da `useProgress()`); link di navigazione raggruppati in sezioni "Lezioni"/"Strumenti" con icone (`DashboardIcon`, `BookIcon`, `ChartIcon`, `LockIcon`, `CheckIcon`); **nuovo stato attivo** basato su `usePathname()` (evidenziazione `bg-accent-purple/15` + grassetto sulla voce corrente) e micro-hover (`hover:translate-x-0.5`)
- `components/layout/BottomNav.tsx` — stessa logica di stato attivo via `usePathname()` (icona+testo colorati `accent-purple` sulla voce corrente), icone (`DashboardIcon`, `BookIcon`, `ChartIcon`) accanto alle label, layout a colonna (icona sopra, testo sotto)
- `app/page.tsx` (homepage) — redesign: logomark grande, titolo "Fin**Learn** **Pro**" con colori accento per "Learn"/"Pro", CTA "Inizia" con icona freccia animata al hover (`group-hover:translate-x-1`) e `shadow-accent-purple/30` al hover; aggiunta griglia di 3 card "feature" (Lezioni brevi / Dati di mercato reali / Grafico interattivo) con icone, hover lift (`hover:-translate-y-0.5`) e bordo accent al hover; intera sezione con `animate-fade-in-up` a cascata (delay incrementali)
- `components/dashboard/DashboardView.tsx` — aggiunto header con saluto ("Bentornato" / "Percorso completato 🎉") e sottotitolo con conteggio lezioni completate (`X di 6`, da `useProgress()`); ogni blocco (header, `LessonTracker`, card centrale, `WorkbenchCard`) ha `animate-fade-in-up` con delay a cascata (0/60/120/180ms)
- `components/dashboard/LessonTracker.tsx` — aggiunta intestazione con stato corrente ("Lezione N" / "Completato"); cerchio "attivo" ora con anello `animate-ping` (pulsazione leggera) per evidenziare la prossima lezione; cerchi sbloccati con `hover:scale-110`; connettori tra cerchi con transizione
- `components/dashboard/ContinueCard.tsx` — aggiunta icona (`BookIcon`) in badge colorato, hover lift sulla card (`hover:-translate-y-0.5 hover:border-accent-purple/70`), CTA con icona freccia animata al hover
- `components/dashboard/CompletionScreen.tsx` — aggiunta icona (`TrophyIcon`) in badge colorato verde, hover lift sulla card, CTA con icona freccia animata al hover
- `components/dashboard/WorkbenchCard.tsx` — aggiunta icona (`ChartIcon`) in badge colorato, hover lift sulla card, CTA con icona freccia animata al hover

---

## 2. Funzionalità implementate

- Routing completo per le 5 pagine previste dalla spec (`/`, `/dashboard`, `/lessons/[id]`, `/lessons/[id]/quiz`, `/workbench`)
- Layout responsive: Sidebar desktop (≥768px) + BottomNav mobile (<768px)
- Design system applicato (colori, font, border radius, spacing) tramite Tailwind + CSS variables
- Tipi TypeScript condivisi per Lesson, Quiz, Progress, MarketData
- Caricamento e parsing server-side dei contenuti lezione (Markdown) e quiz (JSON) tramite `lib/lessons.ts`
- 6 lezioni complete e 6 quiz completi, pronti per essere renderizzati
- `ProgressContext` con persistenza localStorage, conforme all'interfaccia `ProgressStore`
- Regole lock/unlock (`lib/access.ts`): accesso lezione/quiz/workbench secondo sez. 6-7 spec
- Redirect automatico se si tenta di apertura una lezione bloccata (`/lessons/[id]` → prima lezione non completata)
- Sidebar collegata ai progressi reali (lock/unlock/completato)
- `ProgressBar` nella pagina lezione collegata ai progressi reali (% lezioni completate)
- `/lessons/[id]` mostra il contenuto Markdown reale della lezione (titolo, corpo testuale renderizzato via `react-markdown`)
- `KeyConceptCallout` — card evidenziata per `meta.keyConcept`, mostrata sotto il titolo
- `NumericExample` — blocco dedicato (font monospace) per la sezione "Esempio pratico" di ogni lezione, estratto automaticamente dal Markdown
- `CompleteLessonButton` funzionante: salva `lesson_completed = true` tramite `ProgressContext` e reindirizza al quiz
- `/lessons/[id]` con `id` non valido (es. `/lessons/99`) → pagina 404 (`notFound()`)
- `/lessons/[id]/quiz` funzionante: carica `getQuiz(id)`, 3 domande × 4 opzioni, `AnswerOption` (stati default/selected/correct/wrong), `FeedbackBlock` sempre visibile dopo la conferma
- Valutazione quiz client-side rispetto a `quiz.passThreshold` (2/3); `QuizResult` con punteggio e CTA in base all'esito
- Salvataggio `quiz_passed` e `quiz_attempts` tramite `setQuizPassed`/`incrementQuizAttempts` (`ProgressContext`)
- Quiz superato → CTA "Sblocca il grafico" verso `/workbench?lesson=[id]`
- Quiz non superato → tasto "Riprova"; dal secondo fallimento, messaggio "Rileggi la lezione con calma" e "Riprova" bloccato 60s (countdown a video)
- `QuizAccessGuard` su `/lessons/[id]/quiz`: redirect a `/lessons/[id]` se la lezione non è completata (`isQuizUnlocked`)
- `/workbench` funzionante: `ContextBanner`, `AssetSelector`, `TimeframeSelector`, `OverlayControls`, `ChartContainer` (Recharts), `ChartTooltip`, `LessonLink`
- Normalizzazione base 100 per asset "prezzo" (S&P 500, Oro), ricalcolata sul primo punto del timeframe selezionato; US Treasury 10Y mostrato come rendimento percentuale (asse dedicato, non normalizzato), con messaggio esplicito quando è primario o secondario nel confronto
- Overlay client-side: media mobile 200gg e deviazione standard mobile 30gg (sui rendimenti giornalieri, in %)
- Allineamento robusto tra serie con calendari diversi (forward-fill) e gestione valori mancanti/non numerici (`sanitizeSeries`)
- `WorkbenchAccessGuard` su `/workbench?lesson=[id]`: redirect a `/lessons/[id]/quiz` se `quiz_passed` non è ancora `true` per quella lezione
- Stato "Dati reali non ancora caricati" (`EmptyState`): se i dati per gli asset richiesti non coprono il timeframe selezionato, il grafico non viene mai disegnato con dati placeholder/sintetici — viene mostrato invece l'elenco esatto dei file/serie FRED/formato necessari
- `/dashboard` reale: `LessonTracker` (6 cerchi connessi, stato completato/attivo/bloccato collegato a `useProgress()`), `ContinueCard` (prossima lezione accessibile, titolo + concetto chiave + CTA), `WorkbenchCard` (statica, link a `/workbench`), `CompletionScreen` (al posto di `ContinueCard` quando il quiz della lezione 6 è superato)

## Funzionalità NON implementate (volutamente, fuori scope MVP)

- `/workbench` senza `?lesson=` (esplorazione libera): nessun guard, nessun `ContextBanner`/`LessonLink`, default S&P 500 / 5Y / nessun overlay — comportamento minimo, non lega a nessuna lezione
- Redirect automatico `/` → `/dashboard`: la spec (sez. 10, Step 6) lo menziona ma sez. 3/7 descrivono `/` come homepage pubblica con CTA "Inizia" → `/dashboard`; per scelta si è mantenuto questo secondo comportamento (vedi "Decisioni tecniche prese")

---

## 3. Struttura del progetto

```
Finlearn-Pro/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                       # /
│   ├── dashboard/page.tsx             # /dashboard
│   ├── lessons/[id]/page.tsx          # /lessons/[id]
│   ├── lessons/[id]/quiz/page.tsx     # /lessons/[id]/quiz
│   └── workbench/page.tsx             # /workbench
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx                # client, collegata a useProgress()
│   │   ├── BottomNav.tsx
│   │   └── ProgressBar.tsx
│   ├── progress/
│   │   ├── LessonAccessGuard.tsx      # redirect se lezione bloccata
│   │   ├── QuizAccessGuard.tsx        # redirect se quiz non accessibile
│   │   ├── WorkbenchAccessGuard.tsx   # redirect a /lessons/[id]/quiz se quiz non superato
│   │   └── CourseProgressBar.tsx      # ProgressBar collegata ai progressi
│   ├── lesson/
│   │   ├── LessonContent.tsx          # renderer Markdown (react-markdown) + estrazione "Esempio pratico"
│   │   ├── KeyConceptCallout.tsx      # card evidenziata per meta.keyConcept
│   │   ├── NumericExample.tsx         # blocco dedicato (font-mono) per esempi numerici
│   │   └── CompleteLessonButton.tsx   # client, setLessonCompleted + redirect a quiz
│   ├── quiz/
│   │   ├── AnswerOption.tsx           # stati default/selected/correct/wrong
│   │   ├── FeedbackBlock.tsx          # spiegazione post-conferma, sempre visibile
│   │   ├── QuestionCard.tsx           # domanda + 4 opzioni + feedback
│   │   ├── QuizResult.tsx             # punteggio + CTA workbench / retry
│   │   └── QuizRunner.tsx             # client, orchestratore stato quiz + retry-lock 60s
│   ├── workbench/
│   │   ├── ContextBanner.tsx          # riga di testo contestuale alla lezione
│   │   ├── AssetSelector.tsx          # dropdown S&P 500 / Oro / US Treasury 10Y
│   │   ├── TimeframeSelector.tsx      # pill 1Y / 5Y / 10Y
│   │   ├── OverlayControls.tsx        # checkbox stdDev30 / MA200
│   │   ├── ChartTooltip.tsx           # factory tooltip Recharts (data, valore, variazione)
│   │   ├── ChartContainer.tsx         # ComposedChart Recharts (assi index/percent, overlay)
│   │   ├── LessonLink.tsx             # card "Lezione collegata" + tasto "Rivedi"
│   │   ├── EmptyState.tsx             # "Dati reali non ancora caricati" + file/serie/formato richiesti
│   │   └── WorkbenchView.tsx          # client, orchestratore stato + calcolo serie del grafico
│   └── dashboard/
│       ├── LessonTracker.tsx          # client, 6 cerchi connessi (completato/attivo/bloccato)
│       ├── ContinueCard.tsx           # card "Continua da dove eri" + CTA
│       ├── WorkbenchCard.tsx          # card statica, tasto "Apri grafico" → /workbench
│       ├── CompletionScreen.tsx       # schermata completamento percorso (dopo quiz lezione 6)
│       └── DashboardView.tsx          # client, orchestratore dashboard
├── content/
│   └── lessons/
│       ├── lesson-1.md ... lesson-6.md
│       └── quizzes/
│           └── quiz-1.json ... quiz-6.json
├── lib/
│   ├── lessons.ts
│   ├── chartContext.ts                # CHART_CONTEXT per ContextBanner (no fs, vedi access.ts)
│   ├── market.ts                      # utility dati di mercato (sez. 5 spec)
│   ├── access.ts                      # regole lock/unlock (sez. 6-7 spec)
│   └── progress/
│       ├── types.ts                   # interfaccia ProgressStore
│       ├── localStorageProgressStore.ts # implementazione su localStorage
│       └── ProgressContext.tsx        # ProgressProvider + useProgress()
├── scripts/
│   └── import-market-data.mjs         # CSV FRED o Stooq (OHLC) → public/data/*.json
├── public/
│   └── data/
│       ├── sp500.json   (dati reali — FRED SP500, 2016-06-13 → 2026-06-12, daily, 2515 punti)
│       ├── gold.json    (dati reali — Stooq XAUUSD (Close), 2020-08-21 → 2026-06-12, daily, 1500 punti)
│       └── us10y.json   (dati reali — FRED DGS10, 2004-01-02 → 2026-06-11, daily, 5615 punti)
├── types/
│   ├── lesson.ts
│   ├── quiz.ts
│   ├── progress.ts
│   ├── market.ts
│   └── index.ts
├── tailwind.config.ts
├── finlearn-mvp-spec.md
└── SESSION_NOTES.md
```

---

## 4. Decisioni tecniche prese

- **Stack confermato**: Next.js 14 App Router + TypeScript, Tailwind, Recharts (non ancora installato), localStorage in beta, Supabase solo a lancio pubblico
- **Metadati lezione** (asset nel grafico, overlay default) tenuti in un modulo TS tipizzato (`lib/lessons.ts`), non nel frontmatter Markdown — routing/workbench li leggono senza parsing
- **Quiz superato**: almeno 2 risposte corrette su 3 (`passThreshold: 2` in ogni `quiz-N.json`)
- **Tono contenuti**: lezioni 400–600 parole, linguaggio semplice per principianti, ogni lezione con un esempio pratico, nessuna consulenza finanziaria — disclaimer espliciti dove rilevante
- **US Treasury 10Y (`DGS10`)**: trattato come rendimento percentuale, NON normalizzato "base 100" come prezzo, per evitare confusione didattica nelle lezioni 2 e 3
- **Interfaccia astratta progressi**: `ProgressStore` (in `lib/progress/types.ts`) definita prima dell'implementazione, per permettere in futuro la migrazione da localStorage a Supabase senza modificare i componenti consumer
- **Font**: Inter (UI) + JetBrains Mono (dati/numeri) via `next/font/google`, self-hosted
- **`lib/access.ts` senza dipendenze da `fs`**: regole lock/unlock tenute pure (operano su `ProgressState`) e separate da `lib/lessons.ts`, così possono essere importate sia da server component sia da client component (es. `Sidebar`, `ProgressContext`) senza tirare dentro Node `fs`/`path`
- **Stato progressi**: `ProgressProvider` legge da localStorage in `useEffect` (con flag `isLoaded`) per evitare mismatch di hydration SSR/client — durante il primo render lo stato è `{}` (tutto bloccato tranne lezione 1), poi viene aggiornato lato client
- **Redirect lezione bloccata**: calcolato come prima lezione non completata (`getNextAccessibleLessonId`); se tutte le lezioni sono completate, punta alla lezione 6
- **`LessonContent` come server component**: `react-markdown@10` non richiede hook client, quindi resta server-side, in linea con `getLessonContent`/`getLessonMeta` (fs) già usati in `app/lessons/[id]/page.tsx`. Solo `CompleteLessonButton` (interazione + `useProgress`) è client component
- **Metadati lezione in pagina**: titolo (`meta.title`) mostrato come testo semplice sopra il contenuto Markdown; il concetto chiave (`meta.keyConcept`) è ora mostrato tramite `KeyConceptCallout` (card dedicata) subito sotto il titolo
- **`NumericExample` senza modificare i file `.md`**: `LessonContent` isola la sezione `## Esempio pratico` dal Markdown grezzo (ricerca testuale del titolo di sezione + prossimo `## `) e ne renderizza il corpo dentro `NumericExample`. Approccio scelto per evitare di introdurre una sintassi Markdown custom (es. blockquote) nei 6 file di contenuto. Se in futuro una lezione non contiene `## Esempio pratico`, `LessonContent` renderizza semplicemente tutto il contenuto senza il blocco (nessun crash)
- **Stile `NumericExample`**: `font-mono` applicato al contenitore (eredita JetBrains Mono per tutto il testo del blocco, inclusi numeri e percentuali), bordo `accent-purple/30`, `bg-bg-card`, `rounded-card`, testo `text-sm` per distinguerlo visivamente dal corpo lezione (`text-base`)
- **ID lezione non valido**: `getLessonMeta(id)` ritorna `undefined` per id fuori dall'intervallo 1-6 → `notFound()` (pagina 404 standard Next.js), evitando errori `fs` su file Markdown inesistenti
- **`QuizRunner` come unico client component "stateful"**: `QuestionCard`, `AnswerOption`, `FeedbackBlock`, `QuizResult` sono presentazionali (props in, JSX out); tutta la logica (indice domanda, risposta selezionata/confermata, punteggio, retry-lock) vive in `QuizRunner`, che è l'unico a usare `useProgress()` nel flusso quiz
- **Conferma risposta in due passi**: click su un'opzione → stato `selected` (non ancora valutato); tasto "Conferma risposta" (disabilitato finché nulla è selezionato) blocca la domanda, mostra `FeedbackBlock` e colora le opzioni (`correct`/`wrong`). Scelto per dare modo di leggere tutte le opzioni prima di "giocarsi" la risposta, e per dare un uso concreto allo stato `selected` richiesto dalla spec
- **Calcolo `quizAttempts`/retry-lock**: `incrementQuizAttempts` viene chiamato una volta per ogni tentativo completato (sia superato che fallito). Il numero di tentativi "dopo" l'incremento viene calcolato localmente (`previousAttempts + 1`, letto da `getLessonProgress` prima di chiamare `incrementQuizAttempts`) per evitare di dipendere dal re-render asincrono dello stato del `ProgressContext`. Se il tentativo fallisce e il totale tentativi ≥ 2, il tasto "Riprova" viene bloccato 60s (countdown client-side via `setInterval`, nessuna persistenza del lock — un refresh della pagina lo azzera)
- **`quiz_passed` impostato solo su successo**: `setQuizPassed(lessonId, true)` viene chiamato solo se il punteggio raggiunge `passThreshold`; in caso di fallimento il valore resta quello già presente (di norma `false`)
- **Rilevamento "dati placeholder" senza marcatori**: `hasSufficientData` (in `lib/market.ts`) considera una serie "non pronta" se ha meno di 50 punti o copre meno del 90% del timeframe selezionato. Scelto per evitare di introdurre un flag esplicito nei JSON: appena i file `public/data/*.json` verranno sostituiti con le serie reali 2004-2024, il check passa automaticamente senza modifiche al codice
- **Requisiti dati per lezione = `chartAssets`**: se la lezione corrente usa 2 asset (es. lezione 2: sp500 + us10y), `EmptyState` viene mostrato se ANCHE UNO SOLO dei due non ha dati sufficienti — evita di mostrare un grafico "parziale" che sembri completo
- **`AssetSelector` come selettore dell'asset primario**: singolo dropdown (come da spec), controlla `primaryAsset`. Il secondo asset di `lessonMeta.chartAssets` (se presente e diverso dal primario) è mostrato come serie "secondaria" fissa per quella lezione, non selezionabile — è il modo in cui il workbench riflette il confronto a 2 asset previsto per le lezioni 2/3/5/6 (sez. 5 spec) restando comunque entro "max 2 asset simultanei" (sez. 9 spec)
- **Normalizzazione base 100 ricalcolata sul timeframe**: `normalizeBase100` viene chiamata DOPO `filterByTimeframe`, quindi la base 100 è sempre il primo punto del periodo selezionato (1Y/5Y/10Y), non un riferimento fisso, come richiesto
- **US Treasury 10Y mai normalizzato**: `ASSET_UNITS.us10y = "percent"`; quando è asset primario o secondario, viene mostrato sul proprio asse (`%`, a destra) con etichetta `"... (%, rendimento)"` nella legenda/tooltip, e `WorkbenchView` mostra un avviso testuale esplicito che non è un prezzo normalizzato — per evitare confusione con le serie "indice base 100" (lezioni 2, 3)
- **Overlay sempre relativi all'asset primario**: MA200 e deviazione standard mobile 30gg sono calcolati sulla serie grezza dell'asset primario (non su quello secondario). La MA200 viene scalata con lo stesso fattore usato per normalizzare il primario a base 100, per restare leggibile sullo stesso asse; la deviazione standard (rendimenti %) va sempre sull'asse "%" a destra, indipendentemente dall'unità del primario
- **Deviazione standard mobile = volatilità dei rendimenti**, non dei prezzi: `rollingStdDev` calcola prima i rendimenti giornalieri in % (`(v[i]-v[i-1])/v[i-1]*100`), poi la deviazione standard su una finestra di 30 di questi rendimenti — coerente con "Dispersione dei rendimenti" (lezione 4, sez. 5 spec)
- **Allineamento serie con calendari diversi**: `forwardFillOnDates` propaga l'ultimo valore noto della serie secondaria su tutte le date della serie primaria (filtrata per timeframe). Gestisce robustamente i gap (Oro/Treasury chiusi quando il mercato azionario è aperto, festività diverse) senza introdurre `null`/buchi nel grafico
- **`/workbench` senza `?lesson=` valido**: nessun guard, nessun `ContextBanner`/`LessonLink`; default `primaryAsset = "sp500"`, `timeframe = "5Y"`, overlay disattivati — modalità di esplorazione libera minima, non collegata a una lezione specifica
- **`lib/chartContext.ts` separato da `lib/lessons.ts`**: stesso motivo di `lib/access.ts` — `WorkbenchView` è un client component e non può importare moduli che usano `fs`/`path`
- **Fonte dell'oro spostata da FRED a Stooq**: sia `GOLDAMGBD228NLBM` sia `GOLDPMGBD228NLBM` (le due serie LBMA fix AM/PM in USD) sono state rimosse dal database FRED senza sostituto ufficiale. L'oro è quindi importato da **Stooq.com** (`https://stooq.com/q/d/l/?s=xauusd&i=d`, CSV statico gratuito senza autenticazione, ticker `XAUUSD` = prezzo spot oro in USD/oz, daily). `ASSET_FRED_SERIES` in `lib/market.ts` è stato rinominato in **`ASSET_SOURCE_LABELS`** (`{ sp500: "FRED: SP500", gold: "Stooq: XAUUSD", us10y: "FRED: DGS10" }`) per riflettere fonti diverse per asset; `EmptyState` ora mostra "Fonte: ..." invece di "Serie FRED: ...". `ASSET_UNITS.gold = "index"` resta corretto (prezzo in USD, normalizzabile a base 100)
- **`scripts/import-market-data.mjs` ora supporta 2 formati CSV**: rileva automaticamente FRED (header a 2 colonne `DATE,<SERIE>`, valore = 2ª colonna) vs. Stooq/OHLC (header con colonna `Close`, valore = colonna `Close`, individuata per nome quindi robusta anche se l'header ha più colonne delle righe dati, come nel CSV Stooq che ha header `Date,Open,High,Low,Close,Volume,Openint` ma righe dati senza Volume/Openint)
- **Oro non coperto per timeframe 10Y**: `gold.json` (Stooq XAUUSD) parte dal 2020-08-21 (~5.8 anni). `hasSufficientData` richiede ≥90% del timeframe richiesto, quindi 10Y risulta insufficiente per l'oro (1Y/5Y invece OK). Per le lezioni 5/6, selezionando 10Y appare `EmptyState` solo per l'oro. Accettato per l'MVP: il default è 5Y

---

## 5. Problemi aperti

- **RISOLTO — Dati di mercato reali per tutti i 3 asset**: `public/data/sp500.json` (2515 punti, 2016-06-13 → 2026-06-12, FRED `SP500`), `public/data/us10y.json` (5615 punti, 2004-01-02 → 2026-06-11, FRED `DGS10`) e `public/data/gold.json` (1500 punti, 2020-08-21 → 2026-06-12, Stooq `XAUUSD`, colonna `Close`) contengono ora dati reali. Entrambe le serie FRED per l'oro (`GOLDAMGBD228NLBM` e `GOLDPMGBD228NLBM`) sono state rimosse dal database FRED senza sostituto; l'oro è quindi importato da **Stooq.com** (CSV statico, `https://stooq.com/q/d/l/?s=xauusd&i=d`), non più da FRED — vedi voce dedicata in "Decisioni tecniche prese".
- **Limitazione residua — Oro non coperto per il timeframe 10Y**: `gold.json` parte dal 2020-08-21 (~5.8 anni di storico), quindi `hasSufficientData` è `false` per `gold` con timeframe `10Y` (richiede ≥90% di 10 anni). Per le lezioni 5 e 6 (sp500 + gold) e per "Oro" come asset selezionato, il timeframe `10Y` mostra `EmptyState`; i timeframe `1Y` e `5Y` (incluso il default) mostrano il grafico reale normalmente. Non bloccante per l'MVP (default è 5Y), ma da segnalare se in futuro si vuole coprire 10Y anche per l'oro (richiederebbe uno storico XAUUSD più lungo, es. dal 2016).
- **Allineamento date tra serie**: risolto via `forwardFillOnDates` (`lib/market.ts`) — la serie secondaria viene propagata (ultimo valore noto) sulle date della serie primaria. Da verificare con i dati reali che il forward-fill non introduca artefatti visibili su gap lunghi (es. festività non coincidenti Oro/Treasury vs Borsa USA).
- **Normalizzazione base 100**: risolto — `normalizeBase100` viene applicata dopo `filterByTimeframe`, quindi la base è sempre il primo punto del timeframe selezionato (1Y/5Y/10Y).
- Nessun problema di build/typecheck: `npm run build` e `npx tsc --noEmit` passano senza errori (verificato anche dopo lo Step 5).
- Il blocco "Riprova" 60s è solo client-side in memoria (`retryAvailableAt` in `QuizRunner`): se l'utente ricarica la pagina durante il blocco, il countdown si azzera e il tasto torna disponibile. Non persistito in `ProgressStore`/localStorage — accettabile per la beta, da rivalutare se diventa un problema in Step 8 (beta privata)
- **`OverlayControls` sempre visibili**: anche per lezioni dove non sono il focus (es. lezione 1), l'utente può attivare MA200/stdDev liberamente. Coerente con "stato gestito con React Context" generico della spec (sez. 6), non limitato per lezione. **Rivalutato in Step 7**: con l'altezza grafico responsive (`h-[420px]` su mobile) la legenda extra resta leggibile anche con 4 serie attive — lasciato invariato, non bloccante.
- **Ambiguità spec sez. 10 (Step 6) risolta**: la sez. 10 dice "Redirect da `/` a `/dashboard`", ma sez. 3 e 7 descrivono `/` come homepage pubblica con CTA "Inizia" → `/dashboard` (comportamento già presente in `app/page.tsx` da Step 2). Scelta confermata: **nessun redirect automatico**, `/` resta la homepage pubblica. La riga di sez. 10 è interpretata come riferimento al flusso "Inizia → /dashboard" già implementato, non come requisito di redirect a livello di route.
- **`isPathCompleted`**: "percorso completato" definito come `quizPassed = true` per la lezione 6 (non solo `lessonCompleted`), perché il flusso utente (sez. 7) torna alla dashboard solo dopo aver superato il quiz 6 e visitato il workbench. Aggiunta come funzione pura in `lib/access.ts` (stesso modulo di `getNextAccessibleLessonId`, nessuna dipendenza `fs`).
- **`DashboardView` come unico client component "stateful" della dashboard**: `app/dashboard/page.tsx` resta server component e passa `LESSON_META` (da `lib/lessons.ts`, fs) come prop — stesso pattern di `app/workbench/page.tsx` con `WorkbenchView`. `ContinueCard`, `WorkbenchCard`, `CompletionScreen`, `LessonTracker` sono presentazionali/derivati, `LessonTracker` usa `useProgress()` direttamente per il proprio stato (non riceve props da `DashboardView`).
- **`WorkbenchCard` punta a `/workbench` senza `?lesson=`**: usa la modalità "esplorazione libera" già esistente (nessun guard, default S&P 500/5Y), conforme a "card statica, nessun rendering grafico nella dashboard" (sez. 4, 9 spec) — la card stessa non renderizza alcun grafico, si limita al link.

---

## 6. Prossimo step consigliato

Step 7 (spec) — Mobile e QA — completato (vedi "Come testare lo Step 7" sotto). Step 7.5 (extra, fuori spec) — UI/UX Polish — completato (vedi "Come testare lo Step 7.5" sotto). Prossimo step:

**Step 8 (spec) — Beta privata**
- Deploy produzione su Vercel
- Onboarding 10-20 utenti beta, raccolta feedback strutturato
- Fix problemi bloccanti emersi dal feedback

---

## Dati reali importati — fonti e stato (Step 5 completo)

| Asset | Fonte | Serie/Ticker | File | Punti | Intervallo |
|---|---|---|---|---|---|
| S&P 500 | FRED | `SP500` | `public/data/sp500.json` | 2515 | 2016-06-13 → 2026-06-12 |
| US Treasury 10Y | FRED | `DGS10` | `public/data/us10y.json` | 5615 | 2004-01-02 → 2026-06-11 |
| Oro | Stooq | `XAUUSD` (colonna `Close`) | `public/data/gold.json` | 1500 | 2020-08-21 → 2026-06-12 |

Tutti e 3 i file sono ora dati reali nel formato `{ "date": "YYYY-MM-DD", "value": number }[]`. `EmptyState` non viene più mostrato per il timeframe di default (5Y) su nessuna lezione — vedi limitazione 10Y per l'oro in "Problemi aperti".

### Procedura di import (per aggiornare/rinfrescare i dati in futuro)

`scripts/import-market-data.mjs <input.csv> <output.json>` rileva automaticamente il formato dall'header del CSV:

- **FRED** (`https://fred.stlouisfed.org/series/<SERIE>`, "Download" → "CSV (.csv)"): header a 2 colonne `DATE,<SERIE>`, valore = seconda colonna. Righe con valore `.` (mancante) scartate.
  ```bash
  node scripts/import-market-data.mjs <percorso-csv> public/data/sp500.json
  node scripts/import-market-data.mjs <percorso-csv> public/data/us10y.json
  ```
- **Stooq** (`https://stooq.com/q/d/l/?s=<ticker>&i=d`, es. `xauusd` per l'oro): header OHLC `Date,Open,High,Low,Close,Volume,...`, valore = colonna `Close`.
  ```bash
  node scripts/import-market-data.mjs <percorso-csv> public/data/gold.json
  ```

(oppure `npm run import-market-data -- <input.csv> <output.json>`)

---

## Comandi utili

```bash
npm run dev      # avvia il dev server (localhost:3000)
npm run build    # build di produzione
npx tsc --noEmit # type-check
```

---

## Come testare lo Step 3

Con `npm run dev`:

1. **Stato iniziale (nessun progresso)**
   - Sidebar: "Lezione 1" cliccabile, "Lezione 2"–"Lezione 6" mostrate con 🔒 e non cliccabili
   - `/lessons/1` accessibile, mostra la `ProgressBar` (0%)
   - `/lessons/2`, ..., `/lessons/6` digitati direttamente nell'URL → redirect automatico a `/lessons/1`

2. **Simulare progresso** (non c'è ancora UI per farlo — usare la console del browser su qualsiasi pagina dell'app):
   ```js
   localStorage.setItem("finlearn:lessonProgress", JSON.stringify({
     "1": { lessonCompleted: true, quizPassed: true, quizAttempts: 1 },
     "2": { lessonCompleted: true, quizPassed: false, quizAttempts: 1 }
   }));
   location.reload();
   ```
   - Sidebar: "Lezione 1" e "Lezione 2" con ✓, "Lezione 3" ancora 🔒, "Lezione 4-6" 🔒
   - `/lessons/3` → redirect a `/lessons/3`? No: con lezione 1 e 2 completate, lezione 3 è sbloccata (`lesson_completed` di lezione 2 = true) → resta su `/lessons/3`, `ProgressBar` al 33%
   - `/lessons/4` → redirect a `/lessons/3` (prima lezione non completata)

3. **Reset progresso**: `localStorage.removeItem("finlearn:lessonProgress")` e reload — torna allo stato iniziale.

---

## Come testare la pagina lezione (contenuto reale)

Con `npm run dev`:

1. **`/lessons/1`**
   - Titolo "Cos'è investire" e riga "Lezione 1 di 6" in alto
   - Subito sotto il titolo, card `KeyConceptCallout` con etichetta "Concetto chiave" e testo "Rendimento del capitale nel tempo"
   - Corpo della lezione renderizzato da Markdown (titoli, paragrafi, elenchi, grassetti — confronta con [content/lessons/lesson-1.md](content/lessons/lesson-1.md))
   - In corrispondenza della sezione "Esempio pratico", il testo dell'esempio (Anno 1/2/3) è dentro un blocco `NumericExample` con bordo viola e font monospace (JetBrains Mono), distinto dal resto del corpo lezione
   - In fondo, tasto "Ho completato la lezione"

2. **Click su "Ho completato la lezione"**
   - Redirect a `/lessons/1/quiz` (ora funzionante, vedi sezione dedicata sotto)
   - In console: `JSON.parse(localStorage.getItem("finlearn:lessonProgress"))` → `{"1":{"lessonCompleted":true,...}}`
   - Tornando su `/lessons/1`, il tasto mostra ora "Vai al quiz"
   - Sidebar: "Lezione 1" ha la ✓, "Lezione 2" è ora sbloccata (cliccabile)
   - `ProgressBar` in alto alla lezione passa da 0% a ~17% (1/6)

3. **ID non valido**: `/lessons/99` → pagina 404 standard di Next.js (nessun crash)

4. **Reset**: `localStorage.removeItem("finlearn:lessonProgress")` e reload.

5. **Verifica su tutte le lezioni**: ripetere il controllo di `KeyConceptCallout` e `NumericExample` su `/lessons/2` … `/lessons/6` — ogni lezione ha una card "Concetto chiave" sotto il titolo e una sezione "Esempio pratico" che deve apparire nel blocco `NumericExample` dedicato

---

## Come testare il quiz (Step 4)

Con `npm run dev`. Prerequisito: la lezione deve essere completata (`lessonCompleted: true`), altrimenti `/lessons/[id]/quiz` reindirizza a `/lessons/[id]` (`QuizAccessGuard`).

1. **Accesso diretto a un quiz bloccato**
   - Reset progressi (`localStorage.removeItem("finlearn:lessonProgress")` + reload)
   - Vai a `/lessons/1/quiz` → redirect automatico a `/lessons/1` (lezione 1 non ancora completata)

2. **Flusso quiz — risposta corretta**
   - Completa la lezione 1 ("Ho completato la lezione") → arrivi su `/lessons/1/quiz`
   - "Domanda 1 di 3", 4 `AnswerOption`
   - Click su un'opzione → diventa evidenziata (stato `selected`, bordo viola)
   - Tasto "Conferma risposta" si abilita → click
   - Se l'opzione era corretta: si colora di verde (✓) e appare `FeedbackBlock` verde "Risposta corretta" con il testo di spiegazione
   - Se l'opzione era sbagliata: l'opzione scelta diventa rossa (✕), l'opzione corretta diventa verde, `FeedbackBlock` rosso "Risposta non corretta"
   - Tasto cambia in "Domanda successiva" (o "Vedi risultato" sulla domanda 3) → click

3. **Quiz superato (≥2/3 corrette)**
   - `QuizResult`: punteggio "2/3" o "3/3" in font monospace, messaggio verde "Quiz superato!"
   - Tasto/link verde "Sblocca il grafico" → naviga a `/workbench?lesson=1`
   - In console: `JSON.parse(localStorage.getItem("finlearn:lessonProgress"))` → `{"1":{"lessonCompleted":true,"quizPassed":true,"quizAttempts":1}}`
   - Tornando su `/lessons/1/quiz`, il quiz si ripresenta da capo (Domanda 1) — nessun blocco, può essere rifatto liberamente

4. **Quiz non superato, primo tentativo (≤1/3 corrette)**
   - Rispondi sbagliato ad almeno 2 domande su 3
   - `QuizResult`: punteggio rosso, messaggio "Quiz non superato...", tasto "Riprova" **subito disponibile** (nessun messaggio "Rileggi la lezione")
   - `quizAttempts` → `1`, `quizPassed` resta `false`

5. **Quiz non superato, secondo tentativo consecutivo**
   - Click "Riprova" → quiz riparte da Domanda 1
   - Rispondi di nuovo sbagliato ad almeno 2 domande
   - `QuizResult`: appare anche il messaggio "Rileggi la lezione con calma." e il tasto diventa "Riprova (disponibile in 60s)", disabilitato
   - Il countdown scende ogni secondo (59s, 58s, ...) finché non raggiunge 0s, poi il tasto torna "Riprova" e si riabilita
   - `quizAttempts` → `2`

6. **Verifica su altre lezioni**: ripetere il flusso su `/lessons/2/quiz` … `/lessons/6/quiz` (3 domande × 4 opzioni ciascuno, da `content/lessons/quizzes/quiz-N.json`)

---

## Come testare il workbench (Step 5)

Con `npm run dev`. **Stato dati attuale**: `sp500.json`, `us10y.json` e `gold.json` contengono tutti dati reali. Con il timeframe di default (5Y), tutte le 6 lezioni mostrano il grafico reale. L'unica eccezione è il timeframe **10Y per l'oro** (lezioni 5/6, o "Oro" come asset selezionato): `gold.json` parte dal 2020, quindi 10Y mostra `EmptyState` — comportamento corretto e voluto (vedi `EmptyState` e "Limitazione residua" in "Problemi aperti").

1. **Guard di accesso**
   - Reset progressi (`localStorage.removeItem("finlearn:lessonProgress")` + reload)
   - Vai a `/workbench?lesson=1` → redirect automatico a `/lessons/1/quiz` (`quiz_passed` non ancora `true` per la lezione 1, `WorkbenchAccessGuard`)
   - Completa lezione 1 e supera il quiz (vedi sezioni precedenti) → da `QuizResult` click su "Sblocca il grafico" → questa volta `/workbench?lesson=1` resta accessibile

2. **Grafico reale (lezioni 1-4, sp500/us10y già importati)**
   - Su `/workbench?lesson=1`: titolo "Workbench", `ContextBanner` con il testo della lezione 1 ("Osserva come il valore dell'S&P 500...")
   - Sotto i controlli (`AssetSelector` = "S&P 500", `TimeframeSelector` con "5Y" attivo, `OverlayControls`) appare il grafico reale (`ChartContainer`), non `EmptyState`
   - In fondo, card `LessonLink` "Lezione collegata" → "Cos'è investire" con tasto "Rivedi" → `/lessons/1`

3. **Controlli interattivi**
   - `AssetSelector`: cambia tra S&P 500 / Oro / US Treasury 10Y — tutti mostrano il grafico reale per 1Y/5Y; selezionando "Oro" + timeframe "10Y" appare `EmptyState` (unico caso, vedi limitazione sopra)
   - `TimeframeSelector`: 1Y / 5Y / 10Y (default 5Y all'apertura) — il grafico si aggiorna e la normalizzazione base 100 si ricalcola sul primo punto del nuovo timeframe
   - `OverlayControls`: per la lezione 4, "Deviazione standard mobile (30gg)" risulta già spuntata (default da `LESSON_META.defaultOverlays`)

4. **Lezioni con 2 asset (2, 3 — sp500/us10y)**
   - `/workbench?lesson=2` (dopo aver sbloccato): `ContextBanner` menziona il confronto S&P 500 / Treasury; sotto i controlli appare anche l'avviso "Attenzione: US Treasury 10Y è un rendimento percentuale... non è normalizzato a base 100"; il grafico mostra entrambe le serie (S&P 500 su asse sinistro "indice base 100", Treasury su asse destro "%")

5. **Lezioni con oro (5, 6 — sp500/gold)**
   - `/workbench?lesson=5` e `/workbench?lesson=6` (dopo aver sbloccato): con timeframe 1Y o 5Y (default), il grafico mostra S&P 500 e Oro entrambi normalizzati a base 100
   - Cambiando il timeframe a "10Y", appare `EmptyState` "Dati reali non ancora caricati" che elenca `public/data/gold.json`, fonte `Stooq: XAUUSD`, formato `{date, value}[]`

6. **`/workbench` senza `?lesson=`**
   - Nessun redirect, nessun `ContextBanner`/`LessonLink`; `AssetSelector` su "S&P 500", timeframe "5Y", overlay disattivati; grafico reale visibile

7. **Verifica generale grafico/overlay (tutti gli asset reali)**:
   - Il grafico mostra una linea per l'asset primario (e una seconda per l'asset secondario, se previsto dalla lezione) normalizzate a "base 100" che parte da 100 sul primo punto del periodo selezionato (cambiando timeframe, la base si ricalcola)
   - Per US Treasury 10Y (primario o secondario): valori in asse destro "%", non partono da 100
   - Overlay MA200/stdDev: attivabili dalle checkbox, linee tratteggiate aggiuntive
   - Hover sul grafico: `ChartTooltip` mostra data, valore di ciascuna serie e variazione (% per serie indice, punti percentuali per serie "%")
   - Cambiare `AssetSelector`/`TimeframeSelector`/`OverlayControls` aggiorna il grafico senza ricaricare la pagina

---

## Come testare lo Step 6 (Dashboard)

Con `npm run dev`.

1. **Stato iniziale (nessun progresso)**
   - Reset progressi: `localStorage.removeItem("finlearn:lessonProgress")` + reload
   - `/dashboard`: `LessonTracker` mostra il cerchio "1" evidenziato in viola (attivo), cerchi "2"-"6" in grigio/opacity con 🔒, nessun cerchio verde
   - `ContinueCard`: "Continua da dove eri" → "Lezione 1 — Cos'è investire", concetto chiave "Rendimento del capitale nel tempo", tasto "Continua" → `/lessons/1`
   - `WorkbenchCard`: card statica "Esplora i dati di mercato", tasto "Apri grafico" → `/workbench` (nessun grafico renderizzato nella dashboard)
   - Nessuna `CompletionScreen`

2. **Progresso parziale**
   - In console:
     ```js
     localStorage.setItem("finlearn:lessonProgress", JSON.stringify({
       "1": { lessonCompleted: true, quizPassed: true, quizAttempts: 1 },
       "2": { lessonCompleted: true, quizPassed: false, quizAttempts: 1 }
     }));
     location.reload();
     ```
   - `/dashboard`: cerchi "1" e "2" verdi con ✓, cerchio "3" evidenziato in viola (prossima lezione accessibile, perché lezione 2 è `lessonCompleted`), cerchi "4"-"6" bloccati
   - `ContinueCard`: "Lezione 3 — Rischio e rendimento"
   - Click sui cerchi "1"/"2"/"3" (sbloccati) → naviga a `/lessons/1`, `/lessons/2`, `/lessons/3`; i cerchi "4"-"6" non sono cliccabili

3. **Percorso completato**
   - In console:
     ```js
     const p = {};
     for (let i = 1; i <= 6; i++) p[i] = { lessonCompleted: true, quizPassed: true, quizAttempts: 1 };
     localStorage.setItem("finlearn:lessonProgress", JSON.stringify(p));
     location.reload();
     ```
   - `/dashboard`: tutti i 6 cerchi verdi con ✓, nessun cerchio "attivo"
   - `ContinueCard` non visibile, sostituita da `CompletionScreen` ("Hai completato tutte le 6 lezioni"), con tasto "Esplora il grafico" → `/workbench`
   - `WorkbenchCard` sempre presente sotto

4. **Homepage**
   - `/` mostra ancora la homepage pubblica con CTA "Inizia" → `/dashboard` (nessun redirect automatico)

5. **Reset**: `localStorage.removeItem("finlearn:lessonProgress")` e reload — torna allo stato iniziale (punto 1)

---

## Come testare lo Step 7 (Mobile + QA)

Con `npm run dev`. Usare i DevTools del browser in modalità responsive, testare almeno **iPhone SE (375×667)** e **320px di larghezza** (worst case), oltre a desktop (≥1024px).

1. **Nessuno scroll orizzontale**
   - Su tutte le pagine (`/`, `/dashboard`, `/lessons/1`, `/lessons/1/quiz`, `/workbench`, `/workbench?lesson=2`), a 320px e 375px di larghezza non deve apparire una scrollbar orizzontale né essere possibile uno swipe laterale
   - Su `/workbench`, passare il mouse/dito sul grafico vicino al bordo sinistro/destro: il tooltip non deve causare overflow orizzontale della pagina

2. **Homepage (`/`) mobile**
   - A 375px: contenuto centrato verticalmente, CTA "Inizia" ben visibile, nessuno scroll verticale residuo (prima del fix c'erano ~48px di spazio vuoto scrollabile in fondo, dovuti al `BottomNav`)
   - CTA "Inizia": altezza ≥48px (verificabile a vista o via inspector)

3. **Dashboard (`/dashboard`) mobile**
   - `LessonTracker`: i 6 cerchi connessi sono tutti visibili su una riga, senza overflow, anche a 320px
   - `ContinueCard` e (a percorso completo) `CompletionScreen`: CTA a piena larghezza, facilmente toccabile
   - `WorkbenchCard`: card e tasto "Apri grafico" a piena larghezza su mobile, affiancati su desktop (≥640px)

4. **Pagina lezione (`/lessons/[id]`) mobile**
   - Testo leggibile (16px, line-height 1.6), nessun overflow orizzontale anche con `KeyConceptCallout`/`NumericExample`
   - Tasto "Ho completato la lezione" / "Vai al quiz" a piena larghezza su mobile, larghezza naturale su desktop

5. **Quiz (`/lessons/[id]/quiz`) mobile**
   - 4 opzioni risposta leggibili e toccabili (altezza ≥48px), testo lungo va a capo senza overflow
   - `FeedbackBlock` e `QuizResult` (punteggio, CTA) leggibili e senza overflow a 320px

6. **Workbench (`/workbench?lesson=...`) mobile — il punto più critico**
   - Controlli (`AssetSelector`, `TimeframeSelector`, `OverlayControls`) vanno a capo (`flex-wrap`) senza overflow a 320px
   - `ChartContainer`: a mobile l'altezza è 420px (contro 360px da `sm:` in su) per dare spazio alla legenda quando va su più righe (es. lezioni 2/3/5/6 con overlay attivi → 4 serie)
   - Hover/tap su un punto del grafico vicino al bordo: il tooltip resta leggibile (`max-w-[240px]`, testo a capo) e non causa scroll orizzontale
   - `EmptyState` (es. Oro + 10Y): leggibile, nessun overflow del blocco `font-mono`
   - `LessonLink` in fondo: card e tasto "Rivedi" leggibili e toccabili

7. **Sidebar desktop / BottomNav mobile**
   - Desktop (≥768px): `Sidebar` (240px) visibile, `BottomNav` assente; voci lezione bloccate (🔒, opacity 40%) non cliccabili
   - Mobile (<768px): `BottomNav` fisso in basso (Home / Lezioni / Grafico), altezza 48px, sempre sopra il contenuto senza sovrapporsi (il `<main>` ha `pb-touch-target`)

8. **Stati vuoti e redirect (regressione)**
   - Reset progressi → `/lessons/2`, `/lessons/2/quiz`, `/workbench?lesson=2` reindirizzano correttamente (vedi sezioni Step 3/4/5) anche su viewport mobile
   - `/workbench?lesson=5` (o 6) con timeframe "10Y" → `EmptyState` leggibile su mobile, nessun overflow

---

## Come testare lo Step 7.5 (UI/UX Polish)

Con `npm run dev`, su desktop (≥1024px) e mobile (375px/320px).

1. **Branding e logomark**
   - Sidebar (desktop) e homepage mostrano il logomark FinLearn (quadrato con gradiente viola→verde e segno di spunta/trend)
   - Sidebar: wordmark "Fin**Learn**" (con "Learn" in viola) + tagline "Investire, capito."

2. **Sidebar desktop — stati attivi e progresso**
   - Naviga tra `/dashboard`, `/lessons/1`, `/workbench`: la voce corrispondente nella sidebar si evidenzia (sfondo viola tenue + grassetto), le altre restano in `text-secondary`
   - In cima alla sezione "Lezioni" è presente una barra di progresso con contatore `X/6` coerente con le lezioni completate (confrontare con `LessonTracker` in dashboard)
   - Hover su una voce non attiva: leggero spostamento verso destra (`translate-x`) + cambio colore
   - Voci lezione bloccate: icona lucchetto a destra, non cliccabili, opacity 40% (invariato)

3. **Bottom nav mobile — stati attivi**
   - A <768px, la voce corrente (Home/Lezioni/Grafico) è evidenziata in viola con icona; le altre restano grigie
   - Icone visibili sopra le label, nessun overflow

4. **Homepage (`/`)**
   - Al caricamento: logomark, titolo e CTA appaiono con una leggera animazione fade-in + slide verso l'alto (in sequenza, non tutti insieme)
   - Sotto la CTA "Inizia": 3 card "feature" (Lezioni brevi, Dati di mercato reali, Grafico interattivo) con icona, su una riga da `sm:` in su e impilate su mobile
   - Hover (desktop) sulle feature card: leggero "lift" verso l'alto e bordo viola; hover sulla CTA "Inizia": icona freccia si sposta a destra e appare un leggero glow viola

5. **Dashboard (`/dashboard`)**
   - In alto: saluto "Bentornato" (o "Percorso completato 🎉" se il percorso è completo) + sottotitolo con "Hai completato X di 6 lezioni"
   - `LessonTracker`: intestazione mostra "Lezione N" (prossima da fare) o "Completato"; il cerchio della lezione attiva ha un anello che pulsa leggermente (`animate-ping`); hover su un cerchio sbloccato lo ingrandisce leggermente
   - `ContinueCard` / `CompletionScreen` / `WorkbenchCard`: ciascuna ha un'icona in un badge colorato in alto, hover (desktop) con lift + bordo accentuato, CTA con icona freccia che si sposta al hover
   - Tutti i blocchi compaiono con una leggera animazione a cascata (fade-in + slide) al caricamento

6. **Regressione mobile (Step 7)**
   - Ripetere i punti 1-2 di "Come testare lo Step 7" (nessuno scroll orizzontale a 320px/375px, homepage senza scroll verticale extra) — il polish non deve reintrodurre overflow
   - Verificare che `prefers-reduced-motion` non sia un blocco: le animazioni sono leggere e non essenziali alla comprensione (nessun contenuto dipende dall'animazione per essere visibile)

7. **Nessuna regressione funzionale**
   - Quiz, sbloccamento lezioni, progressi (localStorage) e workbench (grafico, overlay, timeframe) si comportano esattamente come prima — solo l'aspetto è cambiato

---

## Handoff — Step 7.5 completato (stato finale MVP, pronto per Step 8)

**Stato complessivo**: Step 1-7 della spec + Step 7.5 (extra, UI/UX polish) completati. `npx tsc --noEmit` e `npm run build` passano senza errori (7 route: `/`, `/_not-found`, `/dashboard`, `/lessons/[id]`, `/lessons/[id]/quiz`, `/workbench`).

**Dataset reali in uso (Step 5, invariati):**

| Asset | Fonte | Punti | Intervallo |
|---|---|---|---|
| S&P 500 | FRED `SP500` | 2515 | 2016-06-13 → 2026-06-12 |
| US Treasury 10Y | FRED `DGS10` | 5615 | 2004-01-02 → 2026-06-11 |
| Oro | Stooq `XAUUSD` (Close) | 1500 | 2020-08-21 → 2026-06-12 |

**Copertura grafico per lezione/timeframe:**

| Lezione | 1Y | 5Y (default) | 10Y |
|---|---|---|---|
| 1 (sp500) | ✅ | ✅ | ✅ |
| 2, 3 (sp500+us10y) | ✅ | ✅ | ✅ |
| 4 (sp500) | ✅ | ✅ | ✅ |
| 5, 6 (sp500+gold) | ✅ | ✅ | ❌ `EmptyState` (oro insufficiente per 10Y) |

**Limitazione residua**: con timeframe `10Y`, l'oro (storico dal 2020) non soddisfa `hasSufficientData` (richiede ≥90% di 10 anni) → `EmptyState` per lezioni 5/6 e per "Oro" come asset selezionato, solo con `10Y`. Il default `5Y` e `1Y` funzionano sempre. Non bloccante per l'MVP.

**Riepilogo Step 6, 7 e 7.5** (dettagli nelle sezioni dedicate sopra):
- Step 6 — Dashboard reale (`LessonTracker`, `ContinueCard`/`CompletionScreen`, `WorkbenchCard`) in `app/dashboard/page.tsx`, basata su `useProgress()` e `isPathCompleted`. `/` resta homepage pubblica con CTA "Inizia" (nessun redirect automatico, per decisione esplicita).
- Step 7 — QA mobile/desktop: fix overflow orizzontale (`overflow-x: hidden` globale, tooltip grafico contenuto), touch target ≥48px su CTA dashboard, layout `LessonTracker` e grafico workbench responsive su schermi piccoli. Solo CSS/layout, nessuna nuova funzionalità.
- Step 7.5 (extra, fuori spec) — UI/UX polish: nuovo set di icone SVG inline (`components/layout/icons.tsx`), logomark/branding FinLearn, sidebar e bottom nav con stati attivi basati su `usePathname()` e progresso reale, homepage con feature card e microanimazioni `fade-in-up`, dashboard con header di saluto e card più curate (icone, hover lift, CTA animate). Solo modifiche visive/markup, nessuna modifica a logica/dati.

**Prossimo step**: Step 8 (spec) — Beta privata (deploy Vercel, onboarding 10-20 utenti, raccolta feedback strutturato, fix problemi bloccanti). Vedi sezione "## 6. Prossimo step consigliato" per i dettagli.
