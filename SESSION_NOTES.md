# FinanceHub (ex FinLearn Pro) — Session Notes

> Handoff dello stato del progetto. Aggiornare ad ogni step completato.
>
> **Rebranding (deciso in Step 10, Step 10.1 implementato)**: il prodotto si chiama **FinanceHub**. "FinLearn" è ora il nome del modulo **Learn** (mostrato come "Modulo Learn" nella sidebar). Rebranding testuale principale e nuovo logomark "hub" applicati (Step 10.1) — vedi "Handoff — Step 10.1 completato" in fondo. Header globale, search, nuova Home e gli altri sotto-step restano da implementare (10.2+).

---

## Stato attuale: Step 9 (spec) completato — Auth e lancio pubblico: Supabase Auth (email+password, conferma email, reset password), route protection, progressi cloud con migrazione one-time da localStorage, pagina profilo (modifica nome, reset progressi, logout). Step 10.1 (Brand Identity + Design System), 10.2 (Header globale), 10.2bis (Search Overlay), 10.4 (Nuova Home FinanceHub), 10.3 (Sidebar contestuale Learn), 10.5 (Markets Module Foundation), 10.6 (Search + Markets Integration), 10.7 (Asset Page Foundation), 11 (Real Market Data Expansion — catalogo a 34 strumenti), 12 (Data Provider Architecture), 13 (Finnhub Provider Integration) e **13.x (Crypto + Forex Provider — CoinGecko + Frankfurter)** **completati** — vedi rispettive sezioni "Handoff" in fondo. Micro-fix UX "toggle mostra/nascondi password" (Login/Register/Reset) **completato**. Prossimo step: da definire con l'utente.

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

### Step 9 (spec) — Auth e lancio pubblico

Schema SQL eseguito manualmente su Supabase (progetto EU/Ireland, piano Free): tabelle `profiles` e `lesson_progress`, RLS + policy `_own` (select/insert/update/delete), trigger `handle_new_user` (crea riga `profiles` alla registrazione) e `set_updated_at`. Email confirmation ON, redirect URL configurati lato Supabase.

**Punto 1 — Setup Supabase client/middleware:**
- `package.json` — aggiunte dipendenze `@supabase/supabase-js` e `@supabase/ssr`
- `lib/supabase/client.ts` — **nuovo file**: client Supabase per componenti client (`createBrowserClient`)
- `lib/supabase/server.ts` — **nuovo file**: client Supabase per Server Component/Route Handler (`createServerClient` + cookies)
- `lib/supabase/middleware.ts` — **nuovo file**: `updateSession()`, refresh sessione via `supabase.auth.getUser()`
- `middleware.ts` — **nuovo file**: root middleware, invoca `updateSession()`
- `.env.local.example` — **nuovo file**: template `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Punto 2 — Login/Register/Callback:**
- `app/login/page.tsx`, `app/register/page.tsx` — **nuovi file**: pagine server component, redirect a `/dashboard` se già autenticati
- `components/auth/LoginForm.tsx` — **nuovo file**: form email/password, `signInWithPassword`, errori in italiano, link "Password dimenticata?"
- `components/auth/RegisterForm.tsx` — **nuovo file**: form displayName (opzionale)/email/password/confirmPassword, `signUp` con `emailRedirectTo` verso `/auth/callback`, messaggio di successo (conferma email richiesta)
- `app/auth/callback/route.ts` — **nuovo file**: route handler, `exchangeCodeForSession`, redirect a `next` (default `/dashboard`) o a `/login?error=auth_callback_error`

**Punto 3 — Password reset:**
- `app/forgot-password/page.tsx`, `app/reset-password/page.tsx` — **nuovi file**
- `components/auth/ForgotPasswordForm.tsx` — **nuovo file**: `resetPasswordForEmail`, messaggio generico anti-enumerazione
- `components/auth/ResetPasswordForm.tsx` — **nuovo file**: `updateUser({ password })`, redirect a `/dashboard`

**Punto 4 — Route protection:**
- `lib/supabase/middleware.ts` — aggiunta logica di redirect: utenti non autenticati su `/dashboard`, `/lessons/*`, `/workbench`, `/profile` → `/login`; utenti autenticati su `/login`/`/register` → `/dashboard`. `/`, `/forgot-password`, `/reset-password` restano pubbliche/gestite a parte

**Punto 5 — Progressi cloud + migrazione localStorage:**
- `lib/progress/localStorageProgressStore.ts` — esportata costante `LESSON_PROGRESS_STORAGE_KEY`
- `lib/progress/supabaseProgressStore.ts` — **nuovo file**: `SupabaseProgressStore` con `fetchState`, `upsertLessonProgress`, `migrateFromLocalState` su tabella `lesson_progress`
- `lib/progress/ProgressContext.tsx` — riscritto: sottoscrizione a `supabase.auth.onAuthStateChange`, switch automatico tra `LocalStorageProgressStore` (utente anonimo) e `SupabaseProgressStore` (utente autenticato), migrazione one-time al primo login (marker `finlearn:progressMigrated:${userId}` in localStorage), aggiornamento ottimistico, nuovo campo `error` nel context. API pubblica invariata per dashboard/lezioni/quiz/guards/workbench

**Punto 6 — Pagina profilo:**
- `components/layout/icons.tsx` — aggiunta `UserIcon`
- `lib/progress/supabaseProgressStore.ts` — aggiunto metodo `resetProgress()` (DELETE su `lesson_progress` filtrato per `user_id`)
- `lib/progress/ProgressContext.tsx` — aggiunto `resetProgress()` al context (azzera stato locale o remoto, ottimistico, con gestione errori)
- `components/profile/ProfileForm.tsx` — **nuovo file**: modifica `display_name` (update su `profiles`)
- `components/profile/LogoutButton.tsx` — **nuovo file**: `signOut()` + redirect a `/login`
- `components/profile/ResetProgressButton.tsx` — **nuovo file**: reset progressi con conferma in due passi
- `app/profile/page.tsx` — **nuovo file**: server component, email utente (read-only), `ProfileForm`, `ResetProgressButton`, `LogoutButton`
- `components/layout/Sidebar.tsx` — aggiunta sezione "Account" con link "Profilo"
- `components/layout/BottomNav.tsx` — aggiunta voce "Profilo" (4° item)

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

Step 7 (spec) — Mobile e QA — completato (vedi "Come testare lo Step 7" sotto). Step 7.5 (extra, fuori spec) — UI/UX Polish — completato (vedi "Come testare lo Step 7.5" sotto). Step 8 (spec) — Beta privata — completato: deploy di produzione su Vercel, repository GitHub collegato, app pubblica su https://finlearn-pro.vercel.app (vedi "Handoff — Step 8 completato" in fondo per il workflow di deploy). Step 9 (spec) — Auth e lancio pubblico — completato: Supabase Auth (email+password, conferma email, reset password), route protection, progressi cloud con migrazione one-time da localStorage, pagina profilo (vedi "Handoff — Step 9 completato" in fondo). Prossimo step:

**Lancio pubblico**
- Push su GitHub → deploy automatico su Vercel
- Configurare le variabili d'ambiente Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) anche su Vercel (Project Settings → Environment Variables)
- Aggiornare su Supabase Site URL / Redirect URLs con il dominio di produzione (oltre a quello già configurato per la beta)

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

## Handoff — Step 8 completato (Beta privata online, pronto per Step 9)

**Stato complessivo**: Step 1-8 della spec + Step 7.5 (extra, UI/UX polish) completati. `npx tsc --noEmit` e `npm run build` passano senza errori (7 route: `/`, `/_not-found`, `/dashboard`, `/lessons/[id]`, `/lessons/[id]/quiz`, `/workbench`).

**Deploy (Step 8)**:
- Repository GitHub creato e collegato al progetto Vercel
- Deploy di produzione completato — app pubblica su **https://finlearn-pro.vercel.app**
- Workflow di deploy (deploy automatico ad ogni push):
  ```
  git add .
  git commit -m "..."
  git push
  -> Vercel rileva il push ed esegue il deploy automaticamente
  ```
- Nessun file di codice modificato per questo step (solo setup repo/hosting)

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
- Step 8 — Beta privata: repository GitHub creato e collegato a Vercel, deploy in produzione completato. URL pubblico: https://finlearn-pro.vercel.app. Deploy automatico ad ogni push su GitHub (vedi "Workflow di deploy" sotto). Nessuna modifica al codice in questo step.

**Prossimo step**: Step 9 (spec) — Auth e lancio pubblico — completato (vedi "Handoff — Step 9 completato" sotto). Step 10 (extra, fuori spec) — Brand Identity + Platform UI — **approvato, non ancora implementato** (vedi "Handoff — Step 10 approvato" in fondo al documento).

---

## Handoff — Step 9 completato (Auth e lancio pubblico)

**Stato complessivo**: Step 1-9 della spec + Step 7.5 (extra, UI/UX polish) completati. `npx tsc --noEmit` e `npm run build` passano senza errori (12 route: `/`, `/_not-found`, `/auth/callback`, `/dashboard`, `/forgot-password`, `/lessons/[id]`, `/lessons/[id]/quiz`, `/login`, `/profile`, `/register`, `/reset-password`, `/workbench`).

**Supabase (progetto EU/Ireland, piano Free)**:
- Tabelle `profiles` (1:1 con `auth.users`, `display_name`) e `lesson_progress` (`user_id`, `lesson_id`, `lesson_completed`, `quiz_passed`, `quiz_attempts`, vincolo `unique(user_id, lesson_id)`)
- RLS attiva su entrambe le tabelle, policy `_own` (select/insert/update/delete solo per `auth.uid()`)
- Trigger `handle_new_user` (crea riga `profiles` alla registrazione), `set_updated_at`
- Email confirmation ON; Site URL e Redirect URLs configurati per l'ambiente di beta

**Riepilogo Punti 1-6** (dettagli file in "### Step 9" sopra):
- Punto 1 — Setup client Supabase (browser/server), middleware di refresh sessione, `.env.local.example`
- Punto 2 — `/login`, `/register`, `LoginForm`, `RegisterForm`, `/auth/callback` (conferma email)
- Punto 3 — `/forgot-password`, `/reset-password`, reset password via email
- Punto 4 — Route protection nel middleware (`/dashboard`, `/lessons/*`, `/workbench`, `/profile` → richiedono login; `/login`, `/register` → richiedono utente anonimo)
- Punto 5 — `SupabaseProgressStore`, `ProgressContext` riscritto con switch automatico locale/cloud e migrazione one-time da localStorage al primo login
- Punto 6 — `/profile`: modifica `display_name`, email read-only, reset progressi (con conferma), logout; link "Profilo" in sidebar e bottom nav

### Come testare Step 9

**1. Profilo**
- Login con un utente esistente → cliccare "Profilo" nella sidebar (desktop) o nella bottom nav (mobile)
- Verificare che la pagina mostri l'email dell'utente autenticato (read-only) e il nome attuale (vuoto se non impostato)
- Da disconnesso, navigare a `/profile` → redirect automatico a `/login` (route protection)

**2. Modifica nome**
- In `/profile`, inserire un nome nel campo "Nome" e cliccare "Salva"
- Verificare il messaggio "Nome aggiornato."
- Ricaricare la pagina (F5): il nome inserito deve persistere (letto da `profiles.display_name` su Supabase, verificabile anche da Table Editor)
- Svuotare il campo e salvare di nuovo: il nome deve tornare vuoto (salvato come `null`)

**3. Logout**
- In `/profile`, cliccare "Esci"
- Verificare il redirect a `/login`
- Provare a navigare a `/dashboard` o `/profile` → redirect a `/login` (sessione terminata)

**4. Reset progressi**
- Completare almeno una lezione/quiz prima del test (per avere righe in `lesson_progress`)
- In `/profile`, cliccare "Reset progressi" → appare il messaggio di conferma con "Sì, azzera i progressi" / "Annulla"
- Cliccare "Annulla": nessuna modifica
- Cliccare "Sì, azzera i progressi": messaggio "Progressi azzerati."
- Verificare in Supabase (Table Editor → `lesson_progress`) che le righe dell'utente siano state eliminate
- Tornare in `/dashboard`: lo stato deve riflettere l'azzeramento (solo Lezione 1 sbloccata, nessuna lezione completata)

**5. Sincronizzazione progressi cloud**
- Da disconnesso, completare lezione/quiz (progressi salvati in localStorage)
- Registrarsi/loggarsi: al primo login, i progressi locali vengono migrati su Supabase (verificabile in `lesson_progress`) e `finlearn:lessonProgress` viene rimosso da localStorage
- Completare un'altra lezione/quiz da autenticato: verificare in Supabase che la riga corrispondente in `lesson_progress` venga creata/aggiornata (`upsert`)
- Ricaricare la pagina: i progressi devono persistere (letti da Supabase)
- Fare logout e login da un altro browser/dispositivo con lo stesso account: i progressi devono essere identici (letti dallo stesso `user_id` su Supabase)

---

## Handoff — Step 10 approvato (Brand Identity + Platform UI)

> Questa sezione documenta la decisione strategica e il piano di redesign **discussi e approvati** in sessione. **Step 10.1 è stato implementato** (vedi "Handoff — Step 10.1 completato" più sotto, dopo questa sezione). Step 10.2, 10.2bis e successivi restano **non implementati**.

### Decisione strategica: rebranding FinanceHub

- Il prodotto **torna a chiamarsi FinanceHub** (nome originario/visione di lungo periodo).
- **FinLearn non viene eliminato**: diventa il **modulo "Learn"** interno a FinanceHub — tutto ciò che oggi esiste (lezioni 1-6, quiz, contenuti, `lib/access.ts`, `lib/lessons.ts`, `ProgressContext`, progressi cloud) resta valido e diventa la base del modulo Learn.
- **Learn non è più "il prodotto"**: è uno dei moduli, importante ma non centrale come oggi (oggi la sidebar globale è quasi solo elenco lezioni — questo è il problema principale identificato).

### Visione futura della piattaforma — architettura moduli

```
FinanceHub
├─ Home       (hub/punto di incontro tra Learn, Markets, Workbench)
├─ Learn      (= FinLearn attuale: 6 lezioni, quiz, progressi — modulo interno)
├─ Markets    (modulo FONDAMENTALE, non un addon — azioni, ETF, indici, forex, crypto, commodities, bond)
├─ Portfolio  (multi-portfolio, holding, performance, allocazione)
├─ AI         (assistente contestuale: spiega concetti Learn, commenta dati Markets, analizza Portfolio)
└─ Workbench  (esiste già — grafico/overlay; in futuro motore grafico condiviso con Markets/Asset page)
```

### Vincolo di scala — obiettivo a medio/lungo termine

La UI deve essere progettata **fin da ora** per poter ospitare senza redesign:
- 5.000+ azioni globali, centinaia di ETF, indici, forex, crypto, commodities, bond
- ricerca veloce su catalogo enorme, watchlist, portfolio multipli, pagine asset complete, dati live/quasi-live, grafici professionali

Questo non significa implementare questi dati ora — significa che le scelte di navigazione/ricerca/layout fatte in Step 10 **non devono richiedere un secondo redesign** quando questi dati arriveranno.

### Decisioni di design chiave (validate, da rispettare nell'implementazione)

1. **Search è un elemento di primo livello**: non un'icona nascosta, ma una search bar visibile nel header (desktop) + overlay/command palette a schermo intero (Ctrl/Cmd+K). Categorie fin da subito: **"Vai a"** (navigazione sezioni), **"Lezioni"** (titoli reali da `LESSON_META`), **"Asset"** (slot vuoto/placeholder "Catalogo in arrivo" — pronto per il futuro catalogo).
2. **Pagina Asset generica (`/asset/[symbol]` o equivalente)** è un concetto architetturale centrale: futura destinazione comune di risultati di ricerca, righe Markets, voci Watchlist e holding Portfolio. La convenzione di routing va decisa presto (in 10.1) perché la search la userà.
3. **Markets è un modulo fondamentale**, non un "extra": in nav primaria va posizionato vicino a Home (ordine proposto: **Home, Markets°, Learn, Portfolio°, AI°, Workbench** — °= "Soon" per ora). Il "ticker strip" con dati reali già disponibili (`public/data/sp500.json`, `gold.json`, `us10y.json` via `lib/market.ts`) è il modo per rendere Markets "vivo" da subito senza nuovi dati — pianificato per 10.4 (Home) / 10.6 (stub Markets), non in questa iterazione.
4. **Learn non è più il centro visivo**: nella nuova Home, Learn è una card tra altre (con la metrica "Knowledge Capital" = progresso lezioni), non l'elemento dominante.
5. **Componente "riga densa" (ticker/list row)**: nuovo pattern di UI (font mono, riga compatta ~40-48px, valore + variazione %) per ticker strip, liste Markets, Watchlist, Portfolio — da introdurre quando arriva il primo consumer reale (10.4), non come token isolato.
6. **Due varianti di layout**: `reading` (esistente, `max-w-reading` 680px, per contenuti testuali come le lezioni) e una variante **"larga/platform"** (nuova, per Home/Markets/Portfolio) — da definire in 10.1 e usare subito nel Header (10.2).
7. **Direzione estetica**: Bloomberg × Apple × Linear, dark fintech premium, "piattaforma finanziaria seria" — NO stile LMS/corso online/Duolingo/admin dashboard generica. Palette esistente (`bg-primary`/`bg-card`/`bg-sidebar` + `accent-purple`/`accent-green`/`error`) resta la base; possibile nuovo token `accent-blue` per badge "Soon"/info.
8. **Homepage pubblica `/`**: l'attuale landing "da corso" (hero + 3 feature card) va eventualmente sostituita da un teaser con ticker strip dati reali — **rimandato a 10.4bis**, non in questa iterazione.

### Step 10 — sotto-step approvati per QUESTA iterazione

- **10.1 — Brand Identity + Design System**: rebranding testuale (FinanceHub), nuovo logomark (concetto "hub"/rete di nodi, non più solo "trend line"), eventuale token `accent-blue`, definizione variante layout "larga/platform" (usata subito dal Header).
- **10.2 — Header globale**: nuovo componente `Header.tsx` — logo FinanceHub, nav primaria (Home, Markets°, Learn, Portfolio°, AI°, Workbench — °="Soon" disabilitati), search bar visibile, account menu (avatar/dropdown con Profilo/Esci, riusando auth esistente). Sidebar attuale **resta** per questa iterazione (la sua trasformazione in sidebar contestuale a Learn è 10.3, non approvato ora) — verrà solo rimosso il blocco logo duplicato (il brand vive nel Header).
- **10.2bis — Search overlay**: command palette Ctrl/Cmd+K con categorie "Vai a" / "Lezioni" (reali, da `LESSON_META`) / "Asset" (placeholder vuoto).

### Step 10 — elementi esplicitamente RIMANDATI (non toccare)

- **Watchlist** (anche solo come icona/slot visivo nel Header)
- **Pagine Asset complete** (`/asset/[symbol]`) — solo la *convenzione di routing* va eventualmente fissata in 10.1, senza creare la pagina
- **Portfolio** (modulo, pagine, dati)
- **AI** (modulo, pagine)
- **Markets completo** (ticker strip, stub catalogo, pagina `/markets`) — fa parte di 10.4/10.6, non di questa iterazione. In 10.2 "Markets" esiste solo come voce di nav disabilitata "Soon".
- **10.3** (sidebar → contestuale Learn), **10.4** (nuova Home), **10.4bis** (restyle homepage pubblica), **10.5** (bottom nav modulo), **10.6/10.6bis** (stub Markets + Asset page), **10.7** (QA finale) — tutti pianificati ma non approvati per questa iterazione.

### Note tecniche raccolte (analisi già fatta, utile per chi implementa 10.2/10.2bis)

- **Occorrenze testuali "FinLearn"/"FinLearn Pro" — aggiornate in 10.1**: `app/layout.tsx` (metadata `title`/`description`), `app/page.tsx` (wordmark hero), `app/login/page.tsx` (sottotitolo), `app/register/page.tsx` (sottotitolo), `components/layout/Sidebar.tsx` (wordmark + tagline). `scripts/import-market-data.mjs`, `finlearn-mvp-spec.md` e questo file sono documentazione/storico — non modificati (per scelta, vedi "Handoff — Step 10.1 completato").
- **Logomark — aggiornato in 10.1**: `LogoMark` in `components/layout/icons.tsx` è ora un quadrato arrotondato gradiente viola→verde con nodo centrale + 4 nodi collegati (concetto "hub"/rete).
- **Sidebar (`components/layout/Sidebar.tsx`)**: il blocco logo/wordmark in cima (righe iniziali, `Link href="/"` con `LogoMark` + "Finance**Hub**" + "Modulo Learn") va rimosso quando il Header globale viene introdotto (10.2), per evitare doppio branding verticale. Il resto della Sidebar (Percorso, elenco lezioni, Strumenti, Account) resta invariato.
- **Search su "Lezioni" (10.2bis) — refactor necessario**: `lib/lessons.ts` importa `fs`/`path` a livello di modulo → **non importabile da un client component** (la search overlay lo è). `LESSON_META`, `getAllLessonIds`, `getLessonMeta` sono dati/funzioni pure (nessun uso di `fs`). Soluzione individuata: estrarre questi tre elementi in un nuovo modulo fs-free (es. `lib/lessonsMeta.ts`), far re-esportare `lib/lessons.ts` da lì (mantenendo `getLessonContent`/`getQuiz` con `fs` dove sono) — stesso pattern già usato per `lib/access.ts` e `lib/chartContext.ts` (separati da `fs` per essere importabili da client component). Nessun import esistente (`app/dashboard/page.tsx`, `app/workbench/page.tsx`, `app/lessons/[id]/*`) cambia.
- **Header — dati utente**: per mostrare avatar/email nel account menu, il Header (client component) dovrà leggere lo stato auth via `supabase.auth.onAuthStateChange`/`getUser()` (stesso pattern già usato in `ProgressContext`). Se nessun utente (pagine pubbliche `/`, `/login`, `/register`), mostrare link "Accedi" invece dell'avatar.
- **Integrazione nel layout**: `Header` va aggiunto in `app/layout.tsx` sopra al wrapper `<div className="flex">` che contiene `Sidebar` + `main`, restando sopra anche a `BottomNav`. Nessuna modifica a `ProgressProvider`, middleware, o route esistenti.
- **Token `accent-blue`** (aggiunto in 10.1, `app/globals.css` + `tailwind.config.ts`, `#4DA3FF`): non ancora usato in nessun componente — disponibile per badge "Soon" (nav Markets°/Portfolio°/AI° in 10.2) o elementi informativi futuri.
- **`maxWidth: platform` (1440px)** (aggiunto in 10.1 in `tailwind.config.ts`): token pronto per la variante di layout "larga/platform" (Home/Markets/Portfolio), non ancora applicato a nessuna pagina/componente — da usare in 10.2 per il contenitore del Header e delle pagine platform.

### Handoff per una nuova chat — come riprendere

Se questa conversazione viene ripresa in una nuova chat, il prompt di avvio dovrebbe essere equivalente a:

> "Step 9 è completo (vedi 'Handoff — Step 9 completato'). Step 10.1 (Brand Identity + Design System), Step 10.2 (Header globale), Step 10.2bis (Search overlay), Step 10.4 (Nuova Home FinanceHub), Step 10.3 (Sidebar contestuale Learn), Step 10.5 (Markets Module Foundation), Step 10.6 (Search + Markets Integration), Step 10.7 (Asset Page Foundation), Step 11 (Real Market Data Expansion) e Step 12 (Data Provider Architecture) sono **completati** (vedi le rispettive sezioni 'Handoff — Step 10.x/11/12 completato'): rebranding FinanceHub, nuovo logomark 'hub', Header globale fisso con nav primaria/account menu/search, command palette Ctrl/Cmd+K con categorie Vai a/Lezioni/Asset, nuova Home "command center" con ticker Markets reale (`lib/market/ticker.ts`, `components/dashboard/MarketTicker.tsx`) e card Learn/Workbench/Portfolio a peso uguale (`components/dashboard/ModuleCard.tsx`), sidebar trasformata in `LearnSidebar` contestuale al modulo Learn (renderizzata da `components/sidebar/ContextSidebar.tsx` solo su `/lessons/*`), nuovo modulo Markets (`/markets`) con sezioni per categoria (Azioni/ETF/Indici/Crypto/Forex/Commodities/Bond, ora rinominata "Bond / Rates"), Market List Pattern riutilizzabile (`components/markets/MarketListRow.tsx`, `MarketListSection.tsx`), catalogo asset (`lib/markets/catalog.ts`, `types/markets.ts`) e route definitiva per le pagine asset (`/asset/[symbol]`). Il catalogo `MARKET_INSTRUMENTS` è stato esteso in Step 11 da 12 a **34 strumenti** (Indici: SPX/NDX/DJI/RUT; Azioni: AAPL/MSFT/NVDA/AMZN/GOOGL/META/TSLA/AMD/PLTR; ETF: SPY/QQQ/VOO/VTI/SCHD/AGG/BND; Crypto: BTCUSD/ETHUSD/XRPUSD/ADAUSD; Forex: EURUSD/GBPUSD/USDJPY; Commodities: XAUUSD/XAGUSD/WTI/NATGAS; Bond/Rates: US10Y/US02Y/US30Y), ma solo SPX/XAUUSD/US10Y restano `status: "live"` con `assetId` (gli stessi 3 dataset reali `sp500`/`gold`/`us10y`); tutti gli altri 31 sono `status: "soon"`, nessun prezzo finto. Lo Step 12 ha introdotto il livello **data provider** (`lib/providers/`): tipi condivisi `MarketDataProvider`/`QuoteProvider`/`CandleProvider`/`ProviderQuote`/`ProviderCandles`/`DataFreshness`/`ProviderSource`/`AssetAvailability` (`lib/providers/types.ts`), un provider locale `localStaticProvider` (`lib/providers/localStaticProvider.ts`, legge `sp500`/`gold`/`us10y` da `public/data/*.json`, `freshness: "eod"`, `source: "local-static"`) e un registro `lib/providers/index.ts` (`PROVIDERS_BY_ASSET`, `getAssetQuote`/`getAssetCandles`/`getInstrumentQuote`/`getAllAssetQuotes`/`getAssetAvailability`). `lib/market/ticker.ts` ha ora `quoteFromProvider(ProviderQuote): TickerQuote` (con `freshness`/`source`) al posto di `buildTickerQuote`/`buildTickerQuotes` (rimossi); `app/dashboard/page.tsx`, `app/markets/page.tsx`, `app/asset/[symbol]/page.tsx` e `app/workbench/page.tsx` non leggono più `fs`/`public/data/*.json` direttamente: passano dal provider. La Search Overlay (`lib/search/searchIndex.ts`, `components/search/SearchOverlay.tsx`) è collegata allo stesso catalogo Markets: la sezione "Asset" mostra simbolo/nome/categoria/stato (live/soon, badge `components/markets/MarketStatusBadge.tsx`) e naviga a `/asset/[symbol]`, ricerca per simbolo/nome/categoria, max 8 risultati (`MAX_ASSET_RESULTS`, invariato). La pagina `/asset/[symbol]` (Step 10.7, `components/asset/`) è ora una vera pagina FinanceHub: hero con categoria/badge stato (`AssetStatusBadge`: "Dati EOD" per i 3 strumenti live, "Soon" per gli altri)/quotazione/CTA Workbench (`AssetHero`), sezione Overview con i fatti chiave (`AssetOverviewSection`), e 4 sezioni placeholder Chart/Stats/News/Learn references (`AssetSectionPlaceholder`), tutte composte in `AssetView` — funziona automaticamente per tutti i 34 strumenti del catalogo. Inoltre è stato completato un micro-fix UX: toggle mostra/nascondi password in Login/Register/Reset (`components/auth/PasswordInput.tsx`). Step 10 (Brand Identity + Platform UI) resta **approvato** secondo quanto descritto in 'Handoff — Step 10 approvato' per i sotto-step successivi — segui le decisioni di design lì documentate (Markets centrale, Learn non più al centro, stile Bloomberg×Apple×Linear). Il prossimo step non è ancora definito: chiedi conferma all'utente sulla prossima priorità (es. primo provider esterno reale per azioni/ETF/crypto/forex dietro `lib/providers`, Watchlist/Portfolio, bottom nav modulo, grafico reale in Asset/Chart usando `getAssetCandles`). NON toccare Watchlist, Portfolio, AI, integrazioni provider esterni, e NON modificare auth/Supabase/progressi/quiz/lezioni/workbench oltre a quanto necessario. NON generare prezzi/dati finti per gli strumenti 'soon': restano 'soon' finché non c'è un provider reale registrato in `lib/providers/index.ts`."

---

## Handoff — Step 10.1 completato (Brand Identity + Design System)

**Stato complessivo**: Step 1-9 + Step 7.5 (extra) + Step 10.1 completati. `npx tsc --noEmit` e `npm run build` passano senza errori (12 route, invariate rispetto a Step 9).

**Cosa è cambiato (solo branding/testi/token, nessuna modifica architetturale o funzionale)**:

- `app/layout.tsx` — metadata `title` → `"FinanceHub"`, `description` aggiornata (menziona il modulo Learn)
- `app/page.tsx` — hero "Fin**Learn** **Pro**" → "Finance**Hub**" (titolo) e sottotitolo aggiornato (menziona il modulo Learn); card feature invariate
- `components/layout/Sidebar.tsx` — wordmark "Fin**Learn**" → "Finance**Hub**", tagline "Investire, capito." → "Modulo Learn"; resto della sidebar (Percorso, lezioni, Strumenti, Account) invariato
- `components/layout/icons.tsx` — `LogoMark` ridisegnato: stesso quadrato arrotondato con gradiente viola→verde, ma ora con nodo centrale + 4 nodi collegati (concetto "hub"/rete) invece della linea di trend
- `app/login/page.tsx` — sottotitolo "...account FinLearn Pro..." → "...account FinanceHub..."
- `app/register/page.tsx` — sottotitolo "...su FinLearn Pro." → "...su FinanceHub."
- `app/globals.css` — nuovo token `--accent-blue: #4DA3FF` (non ancora usato in UI, pronto per badge "Soon" in 10.2)
- `tailwind.config.ts` — colore `"accent-blue": "var(--accent-blue)"` e `maxWidth.platform: "1440px"` (non ancora usati, pronti per la variante layout "larga/platform" in 10.2)

**Cosa NON è cambiato** (volutamente, per restare entro lo scope di 10.1):

- Nessun Header globale, nessuna search/command palette
- Auth, Supabase, progressi cloud, quiz, lezioni, dashboard, workbench: nessuna modifica funzionale (solo testi minimi dove richiesto dal rebranding)
- Nessuna nuova route, nessun modulo Markets/Portfolio/AI
- `package.json` (`name: "finlearn-pro"`), `scripts/import-market-data.mjs`, `finlearn-mvp-spec.md`: non modificati (riferimenti interni/storico, non visibili in UI)
- `README.md`: è il boilerplate standard di `create-next-app`, non contiene riferimenti al brand — non modificato

**Prossimo step**: 10.2 — Header globale (vedi "Note tecniche raccolte" sopra per i dettagli tecnici già analizzati). In attesa di conferma per procedere.

---

## Handoff — Step 10.2 completato (Header globale)

**Stato complessivo**: Step 1-9 + Step 7.5 (extra) + Step 10.1 + Step 10.2 completati. `npx tsc --noEmit` e `npm run build` passano senza errori (12 route, invariate rispetto a Step 9/10.1).

**Cosa è cambiato**:

- `components/layout/Header.tsx` (**nuovo**) — Header globale `sticky top-0 z-30`, alto `3.5rem` (`h-14`): logo FinanceHub a sinistra (link a `/`), nav primaria al centro (Home → `/dashboard`, Markets °Soon, Learn → `/lessons/{prossima lezione accessibile}` via `getNextAccessibleLessonId`, Portfolio °Soon, AI °Soon, Workbench → `/workbench`), placeholder search "Cerca... Ctrl K" (disabilitato, visibile da `lg:`), account menu a destra (avatar con iniziale email + dropdown Profilo/Esci se autenticato, altrimenti link "Accedi"). Stato auth letto via `supabase.auth.getUser()` + `onAuthStateChange` (stesso pattern di `ProgressContext`/`LogoutButton`).
- `components/layout/icons.tsx` — aggiunte due icone: `SearchIcon` (lente, per il placeholder search) e `ChevronDownIcon` (per il dropdown account)
- `app/layout.tsx` — `Header` montato sopra al wrapper `flex` (Sidebar + main), sopra anche a `BottomNav`; `min-h-screen` → `min-h-[calc(100vh-3.5rem)]` su wrapper e `main` (compensa l'altezza fissa del nuovo Header)
- `components/layout/Sidebar.tsx` — rimosso il blocco logo/wordmark in cima (Link "/" con `LogoMark` + "FinanceHub" + "Modulo Learn"); la sidebar inizia ora direttamente con la sezione "Percorso". Rimosso import non utilizzato di `LogoMark`. Resto invariato (Percorso, lezioni, Strumenti, Account)
- `app/page.tsx` — sottotitolo "...con il modulo Learn..." → "...con Learn..." (risolve il feedback "Modulo Learn non convince"); ricalcolo altezza contenitore (`min-h-[calc(100vh-3rem)] md:min-h-screen` → `min-h-[calc(100vh-6.5rem)] md:min-h-[calc(100vh-3.5rem)]`)
- `app/login/page.tsx`, `app/register/page.tsx`, `app/forgot-password/page.tsx`, `app/reset-password/page.tsx` — stesso ricalcolo altezza contenitore di `app/page.tsx` (per compensare il nuovo Header sticky + BottomNav mobile)
- `.claude/launch.json` (creato e poi rimosso, tooling locale non necessario al repository — configurazione per l'avvio di `npm run dev` tramite gli strumenti di preview)

**Cosa NON è cambiato** (volutamente, per restare entro lo scope di 10.2):

- Nessuna search overlay/command palette (10.2bis) — solo placeholder visivo disabilitato nel Header
- Nessuna modifica a logica auth/Supabase/progressi cloud/quiz/lezioni/workbench
- Sidebar: solo rimosso il blocco logo duplicato, resto invariato (la trasformazione in sidebar contestuale Learn è 10.3, non approvato)
- Nessun nuovo modulo Markets/Portfolio/AI (solo voci di nav disabilitate con badge "Soon" usando il token `accent-blue`)
- Nessuna nuova dipendenza

**Verifica visuale** (via preview tool, 1280×800 e mobile):
- Header desktop: logo + nav (Home/Markets°/Learn/Portfolio°/AI°/Workbench) + search placeholder + "Accedi" (utente anonimo)
- Sidebar: 240px, inizia con "PERCORSO 0/6", nessun blocco logo
- Nessuno scroll verticale extra introdotto (`scrollHeight === innerHeight` su `/`, `/login`)
- Mobile: Header mostra solo logo + "Accedi" (nav/search nascosti da `md:`/`lg:`), BottomNav invariata
- `/workbench` da anonimo → redirect a `/login` (comportamento middleware preesistente, non impattato)

**Prossimo step**: 10.2bis — Search overlay (Ctrl/Cmd+K, categorie "Vai a" / "Lezioni" / "Asset" placeholder). Richiede il refactor di `lib/lessons.ts` descritto in "Note tecniche raccolte" (estrazione di `LESSON_META`/`getAllLessonIds`/`getLessonMeta` in un modulo fs-free). In attesa di conferma per procedere.

---

## Handoff — Step 10.2bis completato (Search Overlay)

**Stato complessivo**: Step 1-9 + Step 7.5 (extra) + Step 10.1 + Step 10.2 + Step 10.2bis completati. `npx tsc --noEmit` e `npm run build` passano senza errori (12 route, invariate).

**Cosa è cambiato**:

- `lib/lessonsMeta.ts` (**nuovo**, fs-free) — estratti `LESSON_META`, `getAllLessonIds`, `getLessonMeta` da `lib/lessons.ts`, ora importabili da componenti client (stesso pattern già usato per `lib/access.ts`)
- `lib/lessons.ts` — ri-esporta `LESSON_META`/`getAllLessonIds`/`getLessonMeta` da `lib/lessonsMeta.ts`; mantiene `getLessonContent`/`getQuiz` (uso di `fs`, solo server). Nessun import esistente (`app/dashboard`, `app/workbench`, `app/lessons/[id]/*`) richiede modifiche
- `lib/search/searchIndex.ts` (**nuovo**, fs-free) — modulo che definisce l'architettura della search:
  - tipi `SearchResultItem` (`id`, `type: "nav" | "lesson" | "asset"`, `title`, `subtitle?`, `href?`, `assetClass?`) e `SearchSection` (`id`, `title`, `items`, `emptyMessage?`)
  - tipo `AssetClass = "equity" | "etf" | "crypto" | "forex" | "commodity" | "bond"` (non usato oggi, pronto per il futuro catalogo Markets)
  - `buildSearchSections(query, destinations)` → restituisce le sezioni filtrate per query: "Vai a" (Home/Learn/Workbench/Profilo), "Lezioni" (da `LESSON_META`, titolo + key concept), "Asset" (array vuoto oggi, `emptyMessage: "Catalogo asset in arrivo"`)
- `components/search/SearchOverlay.tsx` (**nuovo**) — command palette: overlay full-screen con backdrop blur, input con focus automatico, sezioni renderizzate da `buildSearchSections`, navigazione da tastiera (`↑`/`↓` per spostare la selezione tra tutti i risultati, `Enter` per navigare, `Esc` o click sul backdrop per chiudere)
- `components/layout/Header.tsx`:
  - il placeholder search "Cerca... Ctrl K" è ora cliccabile e apre l'overlay (non più `disabled`)
  - aggiunto un secondo pulsante search (solo icona, visibile sotto `lg:`) per l'accesso da mobile/tablet, dove il campo search è nascosto
  - listener globale `keydown` per `Ctrl+K` / `Cmd+K` che apre l'overlay da qualsiasi punto della pagina
  - `<SearchOverlay>` montato in coda al `<header>`, riceve `learnHref` (stesso link dinamico "prossima lezione" già usato dalla voce nav "Learn")

**Cosa NON è cambiato** (volutamente, per restare entro lo scope di 10.2bis):

- Nessun nuovo modulo Markets/Watchlist/Portfolio/AI, nessuna pagina Asset
- Nessuna modifica ad auth/Supabase/progressi cloud/quiz/lezioni/workbench (la search legge solo `LESSON_META` e lo stato di progresso già esposto da `useProgress()`/`lib/access.ts`)
- Nessuna nuova dipendenza (command palette implementata con React/Tailwind puri)

**Decisioni architetturali per la futura integrazione di migliaia di asset**:

- La search è organizzata in **sezioni indipendenti** (`SearchSection[]`), ciascuna con un `id`, un `title` e una lista di `SearchResultItem`. Il componente `SearchOverlay` itera su questo array senza conoscere il numero o il tipo di sezioni: aggiungere una categoria "Markets" in futuro significa aggiungere una entry a `buildSearchSections`, senza toccare la UI.
- Ogni risultato è uno `SearchResultItem` generico (`type`, `title`, `subtitle?`, `href?`, `assetClass?`). Il campo `type: "asset"` e l'enum `AssetClass` (`equity`/`etf`/`crypto`/`forex`/`commodity`/`bond`) sono già definiti ma non popolati: quando arriverà un catalogo/provider dati, basterà far restituire a `getAssetItems()` (in `lib/search/searchIndex.ts`) gli item reali — filtro, rendering, navigazione e keyboard nav restano invariati.
- La sezione "Asset" è già presente in UI con `emptyMessage: "Catalogo asset in arrivo"`: il passaggio da placeholder a dati reali è quindi solo un cambiamento di dati, non di struttura/UX.
- Il filtro (`matchesQuery`) opera su `title`/`subtitle` in modo case-insensitive ed è già pensato per scalare: con un catalogo di migliaia di asset, la stessa funzione di matching potrà essere sostituita da una ricerca indicizzata/remota dietro la stessa interfaccia (`buildSearchSections` resta il punto di integrazione).
- La navigazione da tastiera opera su una lista "flattenata" (`flatItems`) calcolata dalle sezioni correnti: indipendente dal numero di sezioni/risultati, quindi non richiede modifiche quando le sezioni cresceranno.

**Verifica funzionale** (via preview tool, 1280×800 e 375×700):

- `Ctrl+K` e `Cmd+K` aprono l'overlay da qualsiasi pagina; `Esc` e click sul backdrop chiudono
- Input riceve il focus automaticamente all'apertura
- Sezioni "VAI A" (Home, Learn, Workbench, Profilo), "LEZIONI" (tutte le 6 lezioni con titolo e key concept) e "ASSET" ("Catalogo asset in arrivo") renderizzate correttamente
- Digitando una query (es. "lezione 4") i risultati si filtrano correttamente, le sezioni senza match scompaiono
- Navigazione da tastiera (`↓`×4 poi `Enter`) seleziona ed apre "Lezione 1" → redirect a `/login` (comportamento middleware preesistente per utenti anonimi, non impattato)
- Su mobile (375px): pulsante search dedicato nel Header apre l'overlay correttamente, nessun overflow orizzontale (`scrollWidth === 375`)
- Nessuna regressione di altezza/scroll introdotta rispetto a 10.2

**Prossimo step**: 10.3 — Sidebar contestuale al modulo Learn (vedi "Handoff — Step 10 approvato" per i vincoli). In attesa di conferma per procedere.

---

## Handoff — Step 10.4 completato (Nuova Home FinanceHub)

**Stato complessivo**: Step 1-9 + Step 7.5 (extra) + Step 10.1 + Step 10.2 + Step 10.2bis + Step 10.4 completati. `npx tsc --noEmit` e `npm run build` passano senza errori (13 route, invariate). Step 10.3 resta il prossimo step (eseguito dopo 10.4 per decisione di roadmap dell'utente: "la Home ha un impatto visivo e di branding molto maggiore").

**Cosa è cambiato**:

- `lib/market/ticker.ts` (**nuovo**, fs-free) — modulo che trasforma le serie `MarketDataPoint[]` già disponibili in `TickerQuote[]` per la ticker strip:
  - `TickerQuote { id, label, unit, value, change, changePercent, date }`
  - `buildTickerQuote(id, data)` — ultimo punto vs penultimo, calcola `change`/`changePercent` (null se la serie ha meno di 2 punti)
  - `buildTickerQuotes(rawData: Record<AssetId, MarketDataPoint[]>)` — itera su `Object.keys(rawData)`, filtra i `null`. La Home non conosce a priori quanti/quali asset esistono: estendere il ticker in futuro significa solo estendere `rawData`
- `app/dashboard/page.tsx` (**riscritto**) — server component: legge `sp500.json`/`gold.json`/`us10y.json` da `public/data/` via un piccolo helper `readMarketData` locale (stesso pattern di `app/workbench/page.tsx`, duplicato apposta per non toccare il workbench), costruisce `Record<AssetId, MarketDataPoint[]>` con `ASSET_FILE_NAMES`, chiama `buildTickerQuotes(...)` e passa `lessonMeta={LESSON_META}` + `tickerQuotes` a `<DashboardView>`
- `components/dashboard/ModuleCard.tsx` (**nuovo**) — shell generica per le card del "command center": icon badge, eyebrow, titolo, descrizione, CTA opzionale (`Link` con freccia) o badge "Soon", `children` per contenuto extra (es. barra di progresso). Usata da `LearnCard`, `WorkbenchCard`, `PortfolioCard` per garantire peso visivo identico
- `components/dashboard/MarketTicker.tsx` (**nuovo**) — ticker strip "riga densa": riceve `TickerQuote[]`, mostra label + valore (formattato secondo `unit`: `index` → numero IT a 2 decimali, `percent` → `%`) + variazione (verde/rosso, `pp` per i tassi, `%` per gli indici). Riga scorrevole orizzontalmente (`overflow-x-auto`) per supportare in futuro decine di asset senza modifiche; header con badge "Catalogo completo · Soon" per anticipare il futuro catalogo Markets
- `components/dashboard/LearnCard.tsx` (**nuovo**, client) — estrae la logica della vecchia dashboard (prossima lezione/percorso completato, progress bar, CTA "Continua"/"Esplora il grafico") in una `ModuleCard`, usando `useProgress()` + `lib/access.ts` (nessuna logica di progresso modificata)
- `components/dashboard/WorkbenchCard.tsx` (**riscritto**) — ora una semplice `ModuleCard` con CTA "Apri grafico" → `/workbench`, stesso peso visivo delle altre card
- `components/dashboard/PortfolioCard.tsx` (**nuovo**) — `ModuleCard` con badge "Soon", placeholder per il futuro modulo Portfolio
- `components/dashboard/DashboardView.tsx` (**riscritto**) — nuovo layout "command center": header FinanceHub + saluto, `MarketTicker`, poi grid `md:grid-cols-3` con `LearnCard`/`WorkbenchCard`/`PortfolioCard` a peso uguale. Learn non è più la sezione dominante: è una delle tre card
- `components/layout/SoonBadge.tsx` (**nuovo**) — badge "Soon" estratto da `Header.tsx` in componente condiviso, riusato da `ModuleCard`/`MarketTicker`
- `components/layout/Header.tsx` — rimossa la definizione locale di `SoonBadge`, ora importata da `@/components/layout/SoonBadge` (nessun cambiamento funzionale)
- `components/layout/icons.tsx` — aggiunta `WalletIcon` (usata da `PortfolioCard`)
- `components/dashboard/ContinueCard.tsx`, `components/dashboard/CompletionScreen.tsx`, `components/dashboard/LessonTracker.tsx` — **eliminati**: funzionalità assorbita da `LearnCard`, nessun altro file li referenziava (verificato via grep)
- `app/layout.tsx` — aggiunta la classe `min-w-0` al `<main>`: fix di un bug di overflow orizzontale su mobile pre-esistente nel layout flex (`main` con `flex-1` e `min-width: auto` di default si allargava al "min-content" del contenuto, es. la riga ticker con elementi `shrink-0`, spingendo la Home a ~634px su un viewport di 375px e tagliando le card a destra). `min-w-0` permette a `main` di restringersi alla viewport disponibile; nessun effetto visibile su desktop o sulle altre pagine (verificato)

**Cosa NON è cambiato** (volutamente, per restare entro lo scope di 10.4):

- Nessuna sidebar contestuale (10.3 resta da fare)
- Nessuna watchlist, nessun portfolio reale, nessuna AI, nessun catalogo Markets completo, nessuna Asset Page
- Nessun nuovo provider/fonte dati: il ticker usa gli stessi `public/data/sp500.json` / `gold.json` / `us10y.json` e le utility già esistenti in `lib/market.ts` (`ASSET_LABELS`, `ASSET_UNITS`, `ASSET_FILE_NAMES`, `sanitizeSeries`)
- Nessuna modifica ad auth/Supabase/progressi cloud/quiz/lezioni/workbench
- `lib/access.ts`, `lib/progress/ProgressContext.tsx`, `components/layout/ProgressBar.tsx` riusati invariati

**Decisioni architetturali per la futura espansione (decine di asset nel ticker, migliaia nel catalogo Markets)**:

- `MarketTicker` itera su `TickerQuote[]` senza assumere un numero fisso di elementi: passare da 3 a N asset richiede solo di estendere `rawData` in `app/dashboard/page.tsx` (e l'eventuale mappa `ASSET_*` in `lib/market.ts`), non di toccare `MarketTicker`/`ticker.ts`
- La riga ticker è già "densa" e scorrevole orizzontalmente (`overflow-x-auto`, elementi `shrink-0`): pensata per ospitare molti più asset senza wrap o redesign
- `buildTickerQuote`/`buildTickerQuotes` sono pure funzioni fs-free che operano su dati già caricati: in futuro, se i dati arriveranno da un provider/API invece che da `public/data/*.json`, basterà cambiare come viene popolato `rawData` in `app/dashboard/page.tsx` — l'intera UI (ticker + card) resta invariata
- Il badge "Catalogo completo · Soon" nel `MarketTicker` e la card "Portfolio (Soon)" anticipano visivamente i moduli futuri (Markets, Portfolio) senza implementarli, mantenendo coerente la promessa di "command center" della Home
- `ModuleCard` è il punto di estensione per nuovi moduli del command center (es. un futuro modulo "AI" o "Watchlist"): basta una nuova card che la usa, senza modificare `DashboardView` oltre ad aggiungerla alla grid

**Verifica eseguita** (via preview tool, build server temporaneo + route temporanea `app/devpreviewtmp` non protetta da auth, rimossa a fine verifica):

- `npx tsc --noEmit`: nessun errore
- `npm run build`: 13 route generate correttamente, nessun errore (solo warning preesistente su Edge Runtime/Supabase, non correlato)
- Desktop (1280×800): `MarketTicker` mostra S&P 500 7431,46 (+0.50%), Oro 4211,12 (+0.00%), US Treasury 10Y 4.45% (-0.10 pp), colori verde/rosso coerenti con il segno; grid command center a 3 colonne da 320px ciascuna, nessun overflow (`scrollWidth === 1280`)
- Mobile (375px): dopo il fix `min-w-0`, `main` e le card si adattano correttamente a 375px (card a 327px, ticker scrollabile orizzontalmente senza overflow di pagina), card impilate verticalmente
- Nessuna regressione visiva sulle altre pagine (il fix `min-w-0` su `main` non altera larghezze/scroll su desktop)

**Prossimo step**: 10.3 — Sidebar contestuale al modulo Learn (vedi "Handoff — Step 10 approvato" per i vincoli). In attesa di conferma per procedere.

---

## Handoff — Micro-fix completato (toggle mostra/nascondi password)

**Stato complessivo**: Step 1-9 + Step 7.5 (extra) + Step 10.1 + Step 10.2 + Step 10.2bis + Step 10.4 + micro-fix completati. `npx tsc --noEmit` e `npm run build` passano senza errori (13 route, invariate).

**Cosa è cambiato**:

- `components/layout/icons.tsx` — aggiunte `EyeIcon` e `EyeOffIcon` (stesso stile delle icone esistenti: `viewBox 0 0 24 24`, `stroke="currentColor"`)
- `components/auth/PasswordInput.tsx` (**nuovo**) — input controllato con toggle mostra/nascondi: `type` alterna `password`/`text` in base a uno stato locale `visible`; bottone con `aria-label` ("Mostra password"/"Nascondi password") e `aria-pressed`, icona occhio/occhio-barrato, stile coerente (`pr-12` per lo spazio del bottone)
- `components/auth/LoginForm.tsx`, `RegisterForm.tsx`, `ResetPasswordForm.tsx` — i campi password (incluso "Conferma password"/"Conferma nuova password") usano ora `PasswordInput` invece di `<input type="password">`; nessuna modifica a validazioni, `mapAuthError`, chiamate Supabase o redirect

**Cosa NON è cambiato**: flusso auth, Supabase, validazioni (`minLength`, `required`, controllo coincidenza password), layout pagine, `ForgotPasswordForm` (nessun campo password).

**Verifica**: toggle testato via preview tool — alterna correttamente `type` (`password`↔`text`), `aria-label` e `aria-pressed`, mantenendo il valore digitato.

---

## Handoff — Step 10.3 completato (Sidebar contestuale Learn)

**Stato complessivo**: Step 1-9 + Step 7.5 (extra) + Step 10.1 + Step 10.2 + Step 10.2bis + Step 10.4 + Step 10.3 + micro-fix password completati. `npx tsc --noEmit` e `npm run build` passano senza errori (13 route, invariate).

**Cosa è cambiato**:

- `components/sidebar/LearnSidebar.tsx` (**nuovo**) — sidebar contestuale del modulo Learn:
  - sezione "Percorso Learn" con conteggio lezioni completate (`N/6`) e `ProgressBar`
  - elenco lezioni 1-6: stato bloccato (icona lucchetto, opacità ridotta, non cliccabile) o sbloccato (link a `/lessons/{id}`, evidenziato se attivo, icona check se completata) — stessa logica di `isLessonUnlocked`/`getLessonProgress` di prima, invariata
  - blocco "Workbench" in fondo: link a `/workbench?lesson={lezione corrente}` se `isWorkbenchUnlocked` per la lezione attiva (dedotta dal pathname `/lessons/[id]`, fallback lezione 1), altrimenti voce disabilitata con lucchetto
  - **rimossi** rispetto alla vecchia sidebar: link "Dashboard" (duplicato con "Home" del Header) e sezione "Account" → "Profilo" (ora nell'avatar menu del Header)
  - stile più compatto: padding `p-5` (era `p-6`), gap `gap-5` (era `gap-8`), voci nav `px-2.5 py-1.5 text-xs` (era `px-3 py-2`, testo via classe genitore), niente più intestazioni di sezione "Lezioni"/"Strumenti"/"Account" — solo blocco progresso + lista lezioni + blocco Workbench
- `components/sidebar/ContextSidebar.tsx` (**nuovo**) — componente "router" client-side: legge `usePathname()` e renderizza `LearnSidebar` solo per route che iniziano con `/lessons`, altrimenti `null`. Punto di estensione futuro per `MarketsSidebar` (`/markets`) e `PortfolioSidebar` (`/portfolio`), già commentato nel file
- `app/layout.tsx` — `<Sidebar />` → `<ContextSidebar />` (import aggiornato a `@/components/sidebar/ContextSidebar`); resto del layout (Header, wrapper flex, `main`, `BottomNav`) invariato
- `components/layout/Sidebar.tsx` — **eliminato**, sostituito dalla coppia `ContextSidebar`/`LearnSidebar`

**Cosa NON è cambiato** (volutamente, per restare entro lo scope di 10.3):

- Nessuna modifica ad auth/Supabase/progressi cloud/quiz/logica lezioni/Workbench (solo aggiunto un link in entrata da `LearnSidebar`, già esistente come pattern `/workbench?lesson=N`)
- `BottomNav` invariata (nav mobile globale, non tocca la sidebar)
- Nessuna nuova route, nessun modulo Markets/Portfolio/AI
- `MarketsSidebar`/`PortfolioSidebar` non implementate: solo struttura `ContextSidebar` pronta ad accoglierle

**Architettura — sidebar come variante contestuale**:

- `ContextSidebar` è ora l'unico punto in cui `app/layout.tsx` monta una sidebar: decide *quale* sidebar (se una) mostrare in base alla sezione attiva, senza che `layout.tsx` conosca i dettagli dei singoli moduli
- Aggiungere `MarketsSidebar` o `PortfolioSidebar` in futuro significa: creare `components/sidebar/MarketsSidebar.tsx` (o `PortfolioSidebar.tsx`) con la stessa firma (`"use client"`, nessuna prop, `<aside className="hidden w-sidebar ... md:flex">`), e aggiungere un ramo `if (pathname.startsWith("/markets")) return <MarketsSidebar />;` in `ContextSidebar` — nessuna modifica a `layout.tsx` o alle altre sidebar
- Su tutte le route che non iniziano con `/lessons` (Home, Markets°, Portfolio°, Workbench, Profilo, auth) `ContextSidebar` restituisce `null`: nessuna sidebar, `main` occupa l'intera larghezza — coerente con "Header/Search/Home sono ora la navigazione primaria, la sidebar è solo per Learn"

**Verifica eseguita** (via preview tool, build server temporaneo + route temporanea `app/devpreviewtmp` non protetta da auth, rimossa a fine verifica — `/lessons/*` richiede login e non è stato eseguito un login reale):

- `npx tsc --noEmit`: nessun errore (dopo `rm -rf .next` per pulire i riferimenti stale alla route temporanea)
- `npm run build`: 13 route generate correttamente, nessun errore (solo warning preesistente su Edge Runtime/Supabase, non correlato)
- `/login`, `/dashboard` (redirect a `/login` da anonimo): nessun `<aside>` nel DOM — la sidebar non appare più fuori da Learn
- Desktop (1280×800), `LearnSidebar` renderizzata in isolamento: `<aside>` largo 240px (`w-sidebar`), sfondo `bg-sidebar`, contenuto "PERCORSO LEARN · 0/6 · Lezione 1-6 · Workbench" (lucchetto su lezioni 2-6 e su Workbench, coerente con progresso 0/6)
- Mobile (375px): `<aside>` ha `display: none` (classe `hidden md:flex` invariata), `document.body.scrollWidth === 375` — nessun overflow orizzontale

**Prossimo step**: 10.5 — Markets Module Foundation — completato (vedi "Handoff — Step 10.5 completato" in fondo).

---

## Handoff — Step 10.5 completato (Markets Module Foundation)

**Stato complessivo**: Step 1-9 + Step 7.5 (extra) + Step 10.1 + Step 10.2 + Step 10.2bis + Step 10.4 + Step 10.3 + Step 10.5 + micro-fix password completati. `npx tsc --noEmit` e `npm run build` passano senza errori (14 route: aggiunte `/markets` statica e `/asset/[symbol]` dinamica).

**Cosa è cambiato**:

- `types/markets.ts` (**nuovo**) — tipi del catalogo Markets: `MarketCategoryId` (`equity`/`etf`/`index`/`crypto`/`forex`/`commodity`/`bond`), `MarketCategory`, `MarketInstrumentStatus` (`live`/`soon`), `MarketInstrument` (con `assetId?: AssetId` opzionale per collegare uno strumento ai dati reali esistenti)
- `lib/markets/catalog.ts` (**nuovo**) — `MARKET_CATEGORIES` (7 categorie con label IT) e `MARKET_INSTRUMENTS` (12 strumenti placeholder, 3 "live" collegati ai dati esistenti: SPX→`sp500`, XAUUSD→`gold`, US10Y→`us10y`; gli altri 9 sono "soon"), più `getInstrumentsByCategory()` e `getInstrumentBySymbol()`
- `lib/market/ticker.ts` (**esteso**) — aggiunte `formatQuoteValue(quote)` e `formatQuoteChange(quote)`, helper di formattazione condivisi (estratti dalla vecchia logica inline di `MarketTicker`) usati ora sia dal ticker che dal Market List Pattern e dalle pagine asset
- `components/dashboard/MarketTicker.tsx` (**esteso**) — nuova prop `variant?: "compact" | "full"`: `"compact"` (default, invariato per la Home) mostra "Markets"; `"full"` (usata in `/markets`) mostra "Live now" e aggiunge la data di aggiornamento per ogni quote
- `components/markets/MarketListRow.tsx` (**nuovo**) — riga del Market List Pattern: simbolo + nome, valore, variazione, indicatore stato (pallino verde "live" con link a `/asset/[symbol]`, oppure badge "Soon" non cliccabile)
- `components/markets/MarketListSection.tsx` (**nuovo**) — sezione per categoria: header con nome categoria (+ badge "Soon" se nessuno strumento della categoria è live) ed elenco `MarketListRow`; non assume un numero fisso di righe
- `components/markets/MarketsView.tsx` (**nuovo**) — composizione della pagina Markets: titolo, `MarketTicker` variant `"full"` ("Live now" con SPX/Oro/US10Y), griglia responsive (1/2/3 colonne) di `MarketListSection` per ognuna delle 7 categorie
- `app/markets/page.tsx` (**nuovo**) — route `/markets`, server component: legge i 3 dataset JSON esistenti (`public/data/*.json`) con lo stesso pattern fs già usato in `app/dashboard/page.tsx`/`app/workbench/page.tsx`, costruisce le `TickerQuote` con `buildTickerQuotes` e renderizza `MarketsView`
- `app/asset/[symbol]/page.tsx` (**nuovo**) — route dinamica `/asset/[symbol]`: risolve lo strumento da `getInstrumentBySymbol`, `notFound()` se lo symbol non esiste nel catalogo; per strumenti "live" mostra la quotazione reale (valore, variazione, data) con gli stessi helper del ticker; per strumenti "soon" mostra un testo placeholder che dichiara la pagina come shell stabile per il futuro catalogo
- `components/layout/Header.tsx` — voce nav "Markets": da `{ label: "Markets", soon: true }` a link reale `{ label: "Markets", href: "/markets", isActive: (p) => p.startsWith("/markets") || p.startsWith("/asset") }`

**Cosa NON è cambiato** (volutamente, per restare entro lo scope di 10.5):

- Nessuna modifica ad auth/Supabase/progressi cloud/quiz/lezioni/Search Overlay/`LearnSidebar`/`ContextSidebar`
- Nessun provider esterno, nessuna API realtime aggiuntiva, nessun catalogo asset massivo: i dati "live" sono gli stessi 3 dataset già usati da Home/Dashboard/Workbench (`sp500`, `gold`, `us10y`)
- Nessuna Watchlist reale, nessun Portfolio reale, nessuna integrazione AI
- `AssetClass` esistente in `lib/search/searchIndex.ts` (usato dalla Search Overlay) non toccato: `MarketCategoryId` è un tipo separato (stessi 7 valori) con nota nel codice per una futura unificazione, ma lo Step 10.5 non modifica la Search Overlay
- `MarketsSidebar`/`PortfolioSidebar` ancora non implementate: `/markets` non ha sidebar laterale (coerente con `ContextSidebar`, che restituisce `null` fuori da `/lessons/*`)

**Architettura — pronta per un catalogo di migliaia di asset**:

- **Estendere il catalogo non richiede modifiche ai componenti**: aggiungere strumenti significa solo aggiungere voci a `MARKET_INSTRUMENTS` in `lib/markets/catalog.ts` (con `status: "soon"` finché non ci sono dati reali, o `status: "live"` + `assetId` quando il dato è disponibile). `MarketListSection` e `MarketsView` iterano sul catalogo senza assumere un numero fisso di righe/categorie
- **Market List Pattern riutilizzabile**: `MarketListRow`/`MarketListSection` sono pensati per essere riusati identici in una futura Watchlist e in Portfolio — stessa riga (simbolo/nome/valore/variazione/stato), stesso componente di sezione
- **Routing asset stabile**: `/asset/[symbol]` è già la route definitiva per ogni strumento (azioni, ETF, indici, crypto, forex, commodities, bond — un solo namespace, nessuna route per-categoria). Quando arriverà il catalogo completo, basterà popolare `MARKET_INSTRUMENTS` con migliaia di voci (es. da un file generato o da un provider) e la pagina `/asset/[symbol]` mostrerà automaticamente la quotazione reale per ogni strumento con `assetId` valido, mantenendo il placeholder per gli altri
- **Disaccoppiamento dati/UI**: `formatQuoteValue`/`formatQuoteChange` centralizzano la formattazione numerica (valuta per indici/oro, percentuale per i tassi) in `lib/market/ticker.ts`, usati identicamente da Home, `/markets` e `/asset/[symbol]` — un futuro provider con più unità/valute richiederà di estendere questi helper in un solo posto
- **Separazione dei tipi**: `MarketCategoryId` (Markets) e `AssetClass` (Search Overlay) restano tipi distinti per non accoppiare i due moduli durante questa fase di costruzione; una futura unificazione è possibile ma non necessaria ora

**Verifica eseguita** (via preview tool):

- `npx tsc --noEmit`: nessun errore
- `npm run build`: 14 route generate correttamente (`/markets` statica 179B, `/asset/[symbol]` dinamica 179B), nessun errore (solo warning preesistente su Edge Runtime/Supabase, non correlato)
- Desktop (1280×800), `/markets`: 7 sezioni di categoria (Azioni 3, ETF 2, Indici 1, Crypto 2, Forex 2, Commodities 1, Bond 1 = 12 strumenti totali), nessun overflow, ticker "Live now" mostra S&P 500/Oro/US Treasury 10Y con data di aggiornamento, riga live (SPX) collegata a `/asset/SPX`
- Desktop, `/asset/SPX` (live): mostra valore/variazione/data reali; `/asset/AAPL` (soon): mostra testo placeholder; `/asset/UNKNOWN`: `notFound()` → 404 corretto
- Mobile (375px), `/markets`: `document.body.scrollWidth === 375` — nessun overflow orizzontale, 7 sezioni renderizzate correttamente
- Mobile (375px), `/asset/SPX`: `document.body.scrollWidth === 375` — nessun overflow, quotazione live mostrata correttamente

**Prossimo step**: 10.6 — Search + Markets Integration — completato (vedi "Handoff — Step 10.6 completato" in fondo).

---

## Handoff — Step 10.6 completato (Search + Markets Integration)

**Stato complessivo**: Step 1-9 + Step 7.5 (extra) + Step 10.1 + Step 10.2 + Step 10.2bis + Step 10.4 + Step 10.3 + Step 10.5 + Step 10.6 + micro-fix password completati. `npx tsc --noEmit` e `npm run build` passano senza errori (14 route, invariate).

**Cosa è cambiato**:

- `lib/search/searchIndex.ts` (**modificato**):
  - rimosso il tipo locale `AssetClass` (placeholder, vuoto); `SearchResultItem.assetClass` ora è tipizzato `MarketCategoryId` (da `types/markets.ts`)
  - nuovo campo opzionale `SearchResultItem.assetStatus?: MarketInstrumentStatus` (`"live"` | `"soon"`)
  - `getAssetItems()` non ritorna più `[]`: mappa `MARKET_INSTRUMENTS` (da `lib/markets/catalog.ts`) in risultati di ricerca — `title` = simbolo, `subtitle` = `"Nome · Categoria"` (label da `MARKET_CATEGORIES`), `href` = `/asset/[symbol]`, `assetClass`/`assetStatus` dallo strumento
  - `matchesQuery` invariato (controlla `title + subtitle`): copre già ricerca per simbolo, nome e categoria perché entrambi sono nel subtitle
  - sezione "Asset": `emptyMessage` cambiato da "Catalogo asset in arrivo" a "Nessun asset trovato"; risultati limitati a `MAX_ASSET_RESULTS = 8` (nuova costante) per mantenere la overlay compatta
- `components/markets/MarketStatusBadge.tsx` (**nuovo**) — componente condiviso: pallino verde "Dati live" per `status: "live"`, `SoonBadge` per `status: "soon"`. Estratto dalla logica già presente in `MarketListRow` per essere riusato anche nella Search Overlay
- `components/markets/MarketListRow.tsx` (**modificato**) — usa `MarketStatusBadge` al posto della logica inline (stesso comportamento: dipende da `live = status === "live" && quote !== undefined`)
- `components/search/SearchOverlay.tsx` (**modificato**) — i risultati `type: "asset"` mostrano ora `MarketStatusBadge` a destra (allineato con `justify-between`); aggiunto `min-w-0`/`truncate` al blocco titolo/sottotitolo per evitare overflow su mobile con subtitle lunghi (es. "Dollaro USA / Yen Giapponese · Forex")

**Cosa NON è cambiato** (volutamente, per restare entro lo scope di 10.6):

- Nessuna nuova route: `/markets`, `/asset/[symbol]` e tutte le altre route invariate (14 totali)
- Nessuna modifica ad auth/Supabase/progressi cloud/quiz/lezioni
- Nessun provider esterno, nessun catalogo asset massivo: `MARKET_INSTRUMENTS` resta lo stesso array di 12 strumenti definito in Step 10.5
- Nessuna Watchlist reale, nessun Portfolio reale, nessuna integrazione AI
- `getNavItems`/`getLessonItems`/struttura `SearchSection`/keyboard navigation (freccie, Enter, Esc) invariati

**Markets come fonte unica**:

- `MARKET_INSTRUMENTS`/`MARKET_CATEGORIES` (`lib/markets/catalog.ts`) sono ora l'unica fonte per **tre** consumer: `/markets` (Step 10.5, invariato), la sezione "Asset" della Search Overlay (nuovo) e `/asset/[symbol]` (Step 10.5, invariato — risolto via `getInstrumentBySymbol`). Aggiungere/modificare uno strumento nel catalogo si riflette automaticamente in tutti e tre, senza altre modifiche

**Architettura — pronta per la ricerca su un catalogo di migliaia di asset**:

- **Nessuna struttura dati duplicata**: la search non mantiene un proprio indice asset — legge `MARKET_INSTRUMENTS` a ogni `buildSearchSections`. Un futuro catalogo più grande (es. generato da un provider) richiede solo di popolare quell'array; `getAssetItems`/`matchesQuery`/UI non cambiano
- **Limite risultati incorporato**: `MAX_ASSET_RESULTS = 8` applica già ora il pattern "mostra i primi N risultati rilevanti" necessario quando il catalogo avrà migliaia di voci — evita di dover aggiungere questo limite in un secondo momento
- **Match testuale semplice ma estendibile**: `matchesQuery` confronta su `title + subtitle` (quindi simbolo, nome e categoria); con un catalogo più grande lo stesso punto di estensione può evolvere verso un indice/ranking più sofisticato senza cambiare la firma di `buildSearchSections` né il componente `SearchOverlay`
- **Stato live/soon riusabile**: `MarketStatusBadge` è l'unico punto che traduce `MarketInstrumentStatus` in UI — usato da Market List Pattern e Search oggi, pronto per Watchlist/Portfolio in futuro
- **Routing coerente**: ogni risultato Asset (live o soon) punta a `/asset/[symbol]`, la stessa route definitiva di Step 10.5 — click su un asset "soon" mostra il placeholder, click su un asset "live" mostra la quotazione reale, senza logica condizionale aggiuntiva nella Search Overlay

**Verifica eseguita** (via preview tool):

- `npx tsc --noEmit`: nessun errore
- `npm run build`: 14 route, nessun errore (solo warning preesistente su Edge Runtime/Supabase, non correlato)
- Desktop (1280×800), `/markets` → Ctrl/Cmd+K: sezione "Asset" mostra 8 risultati (primi 8 di `MARKET_INSTRUMENTS`: AAPL, MSFT, NVDA, SPY, QQQ, SPX, BTCUSD, ETHUSD), ognuno con simbolo/nome/categoria; SPX (live) senza badge "Soon" (pallino verde), gli altri con badge "Soon"
- Ricerca per nome ("oro") → 1 risultato `XAUUSDOro · Commodities`; ricerca per categoria ("crypto") → `BTCUSD`/`ETHUSD` (entrambi `· Crypto`)
- Click su risultato asset "soon" (AAPL) → naviga a `/asset/AAPL`, mostra placeholder corretto
- Click su risultato asset "live" (SPX) → naviga a `/asset/SPX`, mostra quotazione reale (valore/variazione/data)
- Mobile (375px), `/markets` → overlay search apribile, 8 risultati Asset visibili con subtitle troncato correttamente (`document.body.scrollWidth === 375`, nessun overflow); click su SPX → naviga a `/asset/SPX` correttamente

**Prossimo step**: 10.7 — Asset Page Foundation — completato (vedi "Handoff — Step 10.7 completato" in fondo). A seguire, Step 11 — Real Market Data Expansion — completato (vedi "Handoff — Step 11 completato" in fondo).

---

## Handoff — Step 10.7 completato (Asset Page Foundation)

**Stato complessivo**: Step 1-9 + Step 7.5 (extra) + Step 10.1 + Step 10.2 + Step 10.2bis + Step 10.4 + Step 10.3 + Step 10.5 + Step 10.6 + Step 10.7 + micro-fix password completati. `npx tsc --noEmit` e `npm run build` passano senza errori (14 route, invariate — `/asset/[symbol]` resta dinamica 179B).

**Cosa è cambiato**:

- `components/asset/AssetStatusBadge.tsx` (**nuovo**) — badge di stato per l'header asset: "Dati EOD" (pillola verde) per `status: "live"`, `SoonBadge` per `status: "soon"`. Variante più descrittiva di `MarketStatusBadge` (Step 10.6, usato nelle liste/Search): qui comunica che i 3 strumenti live hanno serie storiche reali ma di fine giornata, non quotazioni realtime
- `components/asset/AssetHero.tsx` (**nuovo**) — header della pagina: breadcrumb "← Markets", riga categoria + `AssetStatusBadge`, titolo (nome + simbolo), quotazione (valore/variazione/data, se disponibile) o messaggio placeholder, e — solo per strumenti con `assetId` (i 3 live) — CTA "Apri in Workbench →" verso `/workbench` (stesso dataset già visualizzabile lì)
- `components/asset/AssetOverviewSection.tsx` (**nuovo**) — sezione "Overview": griglia di fatti (Simbolo, Nome, Categoria, Stato, + Valore/Variazione/Aggiornato al se c'è una quotazione). Stessi campi per ogni strumento; per i "soon" mostra in più una nota che i dati arriveranno con il catalogo completo
- `components/asset/AssetSectionPlaceholder.tsx` (**nuovo**) — card generica riusabile per le sezioni future: header (titolo + `SoonBadge`) + testo descrittivo. Usata per Chart, Stats, News, Learn references
- `components/asset/AssetView.tsx` (**nuovo**) — composizione della pagina: `AssetHero` + `AssetOverviewSection` + griglia 2 colonne (1 su mobile) con le 4 `AssetSectionPlaceholder` (Chart/Stats/News/Learn references). Stessa struttura per asset live e soon — cambia solo il contenuto delle singole sezioni
- `app/asset/[symbol]/page.tsx` (**modificato**) — la logica fs/quotazione resta invariata (stesso pattern `readMarketData` + `buildTickerQuote` di Step 10.5); il rendering ora delega a `<AssetView instrument={...} categoryLabel={...} quote={...} />` invece del markup inline precedente

**Cosa NON è cambiato** (volutamente, per restare entro lo scope di 10.7):

- Route `/asset/[symbol]` invariata: stesso `notFound()` per simboli non in `MARKET_INSTRUMENTS`, stessa risoluzione `getInstrumentBySymbol`/`MARKET_CATEGORIES`
- Nessun nuovo dato/provider: `quote` viene calcolata esattamente come in Step 10.5 (`buildTickerQuote` sui 3 dataset `public/data/*.json` esistenti)
- `MARKET_INSTRUMENTS`/`MARKET_CATEGORIES`/`MarketStatusBadge`/Search Overlay (Step 10.5/10.6) non toccati — `AssetStatusBadge` è un componente nuovo e separato, non una modifica di `MarketStatusBadge`
- Nessuna Watchlist, Portfolio, AI, provider esterni; nessun catalogo asset massivo (sempre 12 strumenti)
- Auth/Supabase/progressi/quiz/lezioni/Workbench non modificati: il link "Apri in Workbench" punta a `/workbench` (route protetta esistente, comportamento di redirect a `/login` per utenti anonimi invariato — stesso pattern del link "Workbench" nel Header)

**Architettura — pronta per dati live e migliaia di asset**:

- **Stessa composizione per ogni stato**: `AssetView` non ha rami condizionali sulla struttura — `AssetHero`/`AssetOverviewSection` decidono internamente cosa mostrare in base a `quote` (presente o `null`) e `instrument.status`. Un futuro provider che rende "live" un nuovo strumento (aggiungendo `assetId`/dati) fa apparire automaticamente quotazione, CTA Workbench e i fatti aggiuntivi in Overview, senza toccare `AssetView`/`AssetPage`
- **Sezioni placeholder pronte a "diventare vere"**: `AssetSectionPlaceholder` definisce lo slot visivo (header + contenuto) per Chart/Stats/News/Learn references. Implementare il grafico reale, ad es., significa creare un `AssetChartSection` con la stessa interfaccia (props `instrument`/dati) e sostituirlo nel punto corrispondente di `AssetView` — il resto della pagina non cambia
- **Nessun catalogo duplicato**: la pagina continua a leggere `MARKET_INSTRUMENTS`/`MARKET_CATEGORIES` via `getInstrumentBySymbol` (Step 10.5/10.6); aggiungere migliaia di strumenti al catalogo rende automaticamente disponibile per ognuno la stessa pagina (hero + Overview + placeholder), live o soon in base a `status`/`assetId`
- **Badge di stato a due livelli**: `MarketStatusBadge` (liste/Search, Step 10.6) resta minimale (pallino/Soon); `AssetStatusBadge` (hero asset) è più descrittivo ("Dati EOD"/"Soon") — quando arriveranno dati realtime, `AssetStatusBadge` potrà aggiungere un terzo stato (es. "Live") senza impatti sulle liste

**Verifica eseguita** (via preview tool):

- `npx tsc --noEmit`: nessun errore
- `npm run build`: 14 route, nessun errore (solo warning preesistente su Edge Runtime/Supabase, non correlato)
- Desktop (1280×800):
  - `/asset/SPX`: hero "Indici · Dati EOD · S&P 500 · SPX · 7431,46 · +0.50% · aggiornato al 2026-06-12" + CTA "Apri in Workbench →"; Overview con 7 fatti (Simbolo/Nome/Categoria/Stato/Valore/Variazione/Aggiornato al); 4 sezioni placeholder con badge "Soon"
  - `/asset/XAUUSD`: hero "Commodities · Dati EOD · Oro · XAUUSD · 4211,12 · +0.00% · aggiornato al 2026-06-12" + CTA Workbench; Overview e placeholder coerenti
  - `/asset/US10Y`: hero "Bond · Dati EOD · US Treasury 10Y · US10Y · 4.45% · -0.10 pp · aggiornato al 2026-06-11" + CTA Workbench
  - `/asset/AAPL` (soon): hero "Azioni · Soon · Apple Inc. · AAPL" + testo placeholder, nessuna CTA Workbench; Overview con Stato "Soon" + nota catalogo completo; 4 sezioni placeholder
  - `/asset/UNKNOWN`: `notFound()` → pagina 404 corretta
- Mobile (375px):
  - `/asset/SPX` e `/asset/AAPL`: `document.body.scrollWidth === 375` — nessun overflow, stesso contenuto del desktop
  - Griglia Overview: 2 colonne (`grid-cols-2`) su mobile, 4 su desktop (`sm:grid-cols-4`); griglia placeholder Chart/Stats/News/Learn references: 1 colonna su mobile (327px ciascuna), 2 su desktop (`sm:grid-cols-2`)

---

## Handoff — Step 11 completato (Real Market Data Expansion)

**Stato complessivo**: Step 1-9 + Step 7.5 (extra) + Step 10.1 + Step 10.2 + Step 10.2bis + Step 10.4 + Step 10.3 + Step 10.5 + Step 10.6 + Step 10.7 + Step 11 + micro-fix password completati. `npx tsc --noEmit` e `npm run build` passano senza errori (14 route, invariate).

**Cosa è cambiato**:

- `lib/markets/catalog.ts` (**modificato**):
  - `MARKET_INSTRUMENTS` esteso da 12 a **34 strumenti**, organizzati per categoria:
    - Indici (4): SPX (**live**, `assetId: "sp500"`), NDX, DJI, RUT (soon)
    - Azioni (9): AAPL, MSFT, NVDA, AMZN, GOOGL, META, TSLA, AMD, PLTR (tutti soon)
    - ETF (7): SPY, QQQ, VOO, VTI, SCHD, AGG, BND (tutti soon)
    - Crypto (4): BTCUSD, ETHUSD, XRPUSD, ADAUSD (tutti soon)
    - Forex (3): EURUSD, GBPUSD, USDJPY (tutti soon)
    - Commodities (4): XAUUSD (**live**, `assetId: "gold"`), XAGUSD, WTI, NATGAS (soon)
    - Bond / Rates (3): US10Y (**live**, `assetId: "us10y"`), US02Y, US30Y (soon)
  - `MARKET_CATEGORIES`: label della categoria `bond` rinominata da "Bond" a "**Bond / Rates**" (più chiara ora che il gruppo contiene anche US02Y/US30Y, tassi e non solo lo strumento principale)
  - Aggiornato il commento di intestazione: descrive esplicitamente la separazione tra catalogo (anagrafica strumento), disponibilità dati (`status`/`assetId`) e rendering (componenti `MarketListRow`/`AssetHero`/Search), più i passi concreti per collegare un futuro provider a uno strumento "soon"
  - Nessun nuovo file, nessuna nuova funzione: `getInstrumentsByCategory`/`getInstrumentBySymbol` invariate (filtri puri su `MARKET_INSTRUMENTS`, indipendenti dalla dimensione del catalogo)

**Cosa NON è cambiato** (volutamente, per restare entro lo scope di Step 11):

- `types/markets.ts`, `types/market.ts` (`AssetId` resta `"sp500" | "gold" | "us10y"`, solo 3 valori — nessun nuovo dataset reale)
- `public/data/*.json`: ancora solo `sp500.json`, `gold.json`, `us10y.json` — nessun prezzo/valore finto introdotto per i 31 nuovi strumenti "soon" (nessun campo `assetId`, nessuna serie storica)
- `lib/search/searchIndex.ts`: `getAssetItems()`/`matchesQuery`/`MAX_ASSET_RESULTS = 8` invariati — leggono `MARKET_INSTRUMENTS` e si aggiornano automaticamente con il catalogo più grande
- `components/markets/MarketListRow.tsx`/`MarketListSection.tsx`/`MarketsView.tsx`, `components/asset/AssetView.tsx`/`AssetHero.tsx`/`AssetOverviewSection.tsx`/`AssetSectionPlaceholder.tsx`, `components/markets/MarketStatusBadge.tsx`/`components/asset/AssetStatusBadge.tsx`: nessuna modifica — già generici rispetto al numero di strumenti/categorie (Step 10.5-10.7)
- `components/dashboard/MarketTicker.tsx`/`buildTickerQuotes`: invariati — il ticker continua a mostrare solo i 3 strumenti con dati reali (`AssetId` ha ancora solo 3 valori), coerente con "il ticker mostra solo strumenti con dati reali disponibili"
- Nessuna modifica ad auth/Supabase/progressi/quiz/lezioni/Workbench
- Nessun provider esterno, nessuna API key, nessuno scraping, nessun dato sintetico
- Nessuna Watchlist, Portfolio, AI

**Architettura — pronta per migliaia di asset reali**:

- **Catalogo, disponibilità dati e rendering restano tre livelli separati**: `MARKET_INSTRUMENTS` è solo anagrafica (simbolo/nome/categoria); `status`/`assetId` codificano la disponibilità dati; tutti i componenti UI (Markets, Search, Asset page) leggono questi due livelli senza logica per-simbolo. Aggiungere altri strumenti "soon" (verso le migliaia) significa solo aggiungere voci a `MARKET_INSTRUMENTS` — zero modifiche a componenti
- **Passaggio "soon" → "live" è un'operazione locale e incrementale**: per ognuno dei 31 strumenti "soon", il giorno in cui arriverà un dataset reale basterà (1) aggiungere il suo id a `AssetId` e alle mappe `ASSET_*`/`ASSET_FILE_NAMES` in `lib/market.ts`, (2) fornire `public/data/<id>.json`, (3) impostare `status: "live"` + `assetId: "<id>"` nel catalogo. Markets, Search e `/asset/[symbol]` mostreranno automaticamente la quotazione reale per quello strumento, senza alcuna modifica a `MarketListRow`/`AssetHero`/`SearchOverlay`
- **Nessun dato finto come garanzia strutturale, non solo come scelta puntuale**: la UI non ha mai bisogno di un valore numerico per uno strumento "soon" (badge `SoonBadge`/`AssetStatusBadge` bastano) — quindi un domani con migliaia di strumenti "soon" il sistema resta corretto senza alcun placeholder numerico da rimuovere in seguito
- **Search e Asset page già scalano per costruzione**: `getAssetItems()` mappa l'intero catalogo e `MAX_ASSET_RESULTS = 8` limita già i risultati mostrati; `/asset/[symbol]` risolve qualsiasi simbolo presente nel catalogo (`getInstrumentBySymbol`, case-insensitive) con `notFound()` per quelli assenti — entrambi i meccanismi restano validi indipendentemente dal fatto che il catalogo abbia 34 o 5.000 strumenti
- **Categoria "Bond / Rates"**: la rinomina della label rende esplicito che la categoria copre sia lo strumento "Treasury" come prodotto sia i tassi/rendimenti correlati (US02Y/US10Y/US30Y) — utile quando arriveranno altri tassi (es. Bund, Gilt) nello stesso gruppo

**Verifica eseguita** (via preview tool):

- `npx tsc --noEmit`: nessun errore
- `npm run build`: 14 route generate correttamente, nessun errore (solo warning preesistente su Edge Runtime/Supabase, non correlato)
- `/markets`: tutte le 7 categorie renderizzate con i nuovi conteggi (Indici 4, Azioni 9, ETF 7, Crypto 4, Forex 3, Commodities 4, Bond / Rates 3 = 34 totali), nessun overflow; SPX/XAUUSD/US10Y mostrano ancora valore/variazione reali con pallino verde, tutti gli altri 31 mostrano badge "Soon"; categorie senza strumenti live (es. Azioni, ETF, Crypto, Forex) mostrano badge "Soon" a livello di sezione
- Search Overlay (Ctrl/Cmd+K): query "TSLA" → 1 risultato "TSLA · Tesla Inc. · Azioni" con badge "Soon"; query vuota → sezione "Asset" mostra i primi 8 strumenti del catalogo (SPX live con pallino verde, NDX/DJI soon, ecc.), limite a 8 confermato
- Asset page per nuovi strumenti "soon" (`/asset/NDX`, `/asset/TSLA`, `/asset/XAGUSD`, `/asset/US02Y`): tutte 200 OK, badge "Soon" nell'hero, nessun "Dati EOD", 4 sezioni placeholder
- Asset page per i 3 strumenti "live" (`/asset/SPX`, `/asset/XAUUSD`, `/asset/US10Y`): ancora 200 OK con badge "Dati EOD", quotazione reale invariata
- `/asset/UNKNOWN`: `notFound()` → 404 corretto

**Prossimo step**: 12 — Data Provider Architecture — completato (vedi "Handoff — Step 12 completato" in fondo).

---

## Handoff — Step 12 completato (Data Provider Architecture)

**Stato complessivo**: Step 1-9 + Step 7.5 (extra) + Step 10.1 + Step 10.2 + Step 10.2bis + Step 10.4 + Step 10.3 + Step 10.5 + Step 10.6 + Step 10.7 + Step 11 + Step 12 + micro-fix password completati. `npx tsc --noEmit` e `npm run build` passano senza errori (14 route, invariate).

**Cosa è cambiato**:

- `lib/providers/types.ts` (**nuovo**) — tipi condivisi del livello provider, senza `fs` (importabile anche da codice client):
  - `DataFreshness = "live" | "delayed" | "eod" | "unavailable"`
  - `ProviderSource` — stringa estendibile, oggi solo `"local-static"`
  - `AssetAvailability = "available" | "soon" | "error"` — disponibilità dati per uno strumento, separata da `MarketInstrumentStatus` (catalogo/UI)
  - `ProviderQuote` (assetId/label/unit/value/change/changePercent/date/freshness/source) e `ProviderCandles` (assetId/points/freshness/source)
  - interfacce `QuoteProvider`, `CandleProvider`, `MarketDataProvider` (= `QuoteProvider & CandleProvider`)
- `lib/providers/localStaticProvider.ts` (**nuovo**) — `localStaticProvider`: unico provider concreto oggi, `source: "local-static"`, `freshness: "eod"`. Legge `sp500.json`/`gold.json`/`us10y.json` da `public/data/` (stessa logica `fs.readFileSync` + `JSON.parse` usata prima in ogni `page.tsx`), passa per `sanitizeSeries` (`lib/market.ts`) e calcola quote (ultimo valore vs precedente) come faceva `buildTickerQuote`. `getCandles`/`getQuote` ritornano `null` se il file manca o ha meno di 2 punti validi — **nessun dato finto**
- `lib/providers/index.ts` (**nuovo**) — registro `PROVIDERS_BY_ASSET: Partial<Record<AssetId, MarketDataProvider>>` (oggi `sp500`/`gold`/`us10y` → `localStaticProvider`) e funzioni pubbliche:
  - `getAssetQuote(assetId)` / `getAssetCandles(assetId)` — quote/serie per un `AssetId`, `null`/`[]` se non disponibili
  - `getInstrumentQuote(instrument)` — quote per uno strumento del catalogo Markets (risolve `assetId`, `null` per "soon")
  - `getAllAssetQuotes()` — tutte le quote disponibili (iterando sugli `AssetId` registrati, non un elenco fisso)
  - `getAssetAvailability(instrument)` — `"soon"` (nessun `assetId`) / `"available"` (provider registrato) / `"error"` (assetId senza provider — non dovrebbe accadere oggi)
  - re-esporta tutti i tipi di `./types`
- `lib/market/ticker.ts` (**modificato**) — `TickerQuote` ha ora anche `freshness: DataFreshness` e `source: ProviderSource`; rimossi `buildTickerQuote`/`buildTickerQuotes` (lette/calcolate ora dal provider), aggiunta `quoteFromProvider(ProviderQuote): TickerQuote`. `formatQuoteValue`/`formatQuoteChange` invariate
- `app/dashboard/page.tsx`, `app/markets/page.tsx` (**modificati**) — rimossi `fs`/`path`/`readMarketData`/`ASSET_FILE_NAMES`/`DATA_DIR`; `tickerQuotes = getAllAssetQuotes().map(quoteFromProvider)`
- `app/asset/[symbol]/page.tsx` (**modificato**) — rimossi `fs`/`path`/`readMarketData`/`ASSET_FILE_NAMES`/`buildTickerQuote`; `quote` ora da `getInstrumentQuote(instrument)` + `quoteFromProvider`
- `app/workbench/page.tsx` (**modificato**) — rimossi `fs`/`path`/`readMarketData`/`ASSET_FILE_NAMES`/`DATA_DIR`; `rawData` costruito con `getAssetCandles("sp500"|"gold"|"us10y")` (ritorna serie già sanificate; `WorkbenchView` continua a chiamare `sanitizeSeries`, idempotente)

**Cosa NON è cambiato** (volutamente, per restare entro lo scope di Step 12):

- Nessuna nuova route, nessuna nuova UI/badge visibile: `/markets`, `/asset/[symbol]`, Home, Workbench mostrano esattamente gli stessi valori di prima (verificato via preview)
- `types/market.ts` (`AssetId` resta `"sp500" | "gold" | "us10y"`), `types/markets.ts`, `lib/markets/catalog.ts` (34 strumenti, Step 11) invariati
- `lib/market.ts` (`ASSET_LABELS`/`ASSET_UNITS`/`ASSET_FILE_NAMES`/`ASSET_SOURCE_LABELS`/`sanitizeSeries`/helper di chart) invariato — usato sia da `localStaticProvider` che da `WorkbenchView`/`EmptyState`
- `lib/search/searchIndex.ts`, `components/markets/*`, `components/asset/*`, `components/dashboard/MarketTicker.tsx`, `components/workbench/*`: nessuna modifica — continuano a consumare `TickerQuote`/`MarketInstrument` come prima (i nuovi campi `freshness`/`source` sono presenti nel tipo ma non ancora letti dalla UI)
- Nessun provider esterno, nessuna API key, nessun fetch di rete, nessun dato sintetico
- Nessuna Watchlist, Portfolio, AI
- Auth/Supabase/progressi/quiz/lezioni invariati

**Architettura — pronta per dati live/quasi-live e migliaia di asset**:

- **Tre livelli separati, ciascuno con un solo punto di estensione**: catalogo (`MARKET_INSTRUMENTS`, anagrafica), provider (`lib/providers`, disponibilità + dati), rendering (componenti Markets/Asset/Home/Workbench, già generici dallo Step 10.5-10.7). Aggiungere un asset reale non tocca mai il rendering; aggiungere un provider non tocca mai il catalogo
- **Far diventare "live" un asset "soon" è un'operazione locale in 3 passi**: (1) aggiungere il suo id a `AssetId` (`types/market.ts`) + mappe `ASSET_*` (`lib/market.ts`); (2) implementare/registrare un provider che lo serva in `PROVIDERS_BY_ASSET` (`lib/providers/index.ts`) — può essere un nuovo `localStaticProvider`-style con un file JSON, o un futuro provider esterno; (3) impostare `status: "live"` + `assetId` nel catalogo (`lib/markets/catalog.ts`). Markets/Search/Asset page mostrano automaticamente la quotazione, senza modifiche a componenti
- **Multi-provider e fallback già previsti dal tipo**: `PROVIDERS_BY_ASSET` può mappare asset diversi a provider diversi (es. un provider azioni/ETF, uno crypto, uno forex, uno macro/rates) semplicemente aggiungendo voci; `getAssetQuote`/`getAssetCandles` sono i soli punti che il resto dell'app chiama, quindi un domani possono provare un provider primario e ricadere su uno secondario (es. EOD come backup di un feed live) senza cambiare le pagine
- **Badge di stato dati pronti**: `ProviderQuote`/`TickerQuote` portano già `freshness` (`"live"|"delayed"|"eod"|"unavailable"`) e `source`. Oggi tutti i 3 asset reali sono `"eod"`/`"local-static"` (coerente con `AssetStatusBadge` → "Dati EOD"); quando arriverà un provider realtime, `AssetStatusBadge`/`MarketStatusBadge` potranno leggere `freshness` per mostrare "Live"/"Delayed" senza cambiare il tipo `TickerQuote`
- **`AssetAvailability`** (`"available"|"soon"|"error"`) distingue "non ancora collegato" (placeholder catalogo) da "collegato ma il provider è andato in errore" — utile per una futura Watchlist che debba segnalare un guasto provider in modo diverso da "in arrivo"
- **Nessuna lettura `fs` sparsa**: tutte le letture di `public/data/*.json` passano ora da `localStaticProvider`, in un solo file. Migrare a un provider esterno per quegli stessi 3 asset (o aggiungerne altri) richiede di toccare solo `lib/providers/`, non le pagine

**Verifica eseguita** (via preview tool):

- `npx tsc --noEmit`: nessun errore
- `npm run build`: 14 route, nessun errore, dimensioni invariate o leggermente inferiori (`/dashboard` 1.99 kB vs 2.75 kB prima — rimossa logica fs duplicata)
- `/markets`: ticker "Live now" mostra ancora S&P 500 7431,46 (+0.50%) e Oro 4211,12 (+0.00%); tutte le 7 categorie/34 strumenti invariati, SPX live con pallino verde, resto "Soon"
- `/asset/SPX`: quotazione 7431,46 + badge "Dati EOD" invariati (passa ora da `getInstrumentQuote`/`quoteFromProvider`)
- `/asset/XAUUSD`, `/asset/US10Y`: 200 OK, dati reali invariati; `/asset/AAPL`: 200 OK, badge "Soon", nessun "Dati EOD" (nessun provider per AAPL)
- `/dashboard`: redirect (manual) a `/login` come da route protection esistente — comportamento invariato, nessuna regressione introdotta dal refactor provider

**Prossimo step**: da definire con l'utente (es. primo provider esterno reale per una categoria, Watchlist/Portfolio, grafico reale in Asset/Chart con `getAssetCandles`).


---

## Handoff -- Step 13 completato (Finnhub Provider Integration)

**Stato complessivo**: Step 1-9 + Step 7.5 + Step 10.x + Step 11 + Step 12 + Step 13 + micro-fix password completati. `npx tsc --noEmit` e `npm run build` passano senza errori (14 route invariate).

**File modificati in Step 13**:

- `lib/providers/types.ts` -- interfacce async (Promise<X|null>); `ProviderQuote.symbol: string` (era `assetId: AssetId`); `ProviderSource` include `"finnhub"`
- `lib/providers/localStaticProvider.ts` -- metodi async; parametro `symbol: string` (simbolo catalogo); mappa interna `SYMBOL_TO_ASSET_ID`
- `lib/providers/finnhubProvider.ts` (**NUOVO**) -- `FinnhubQuoteProvider`: `source:"finnhub"`, `freshness:"delayed"`, fetch con `{ next: { revalidate: 60 } }`, `process.env.FINNHUB_API_KEY` (mai NEXT_PUBLIC_*), ritorna null se `c===0` o `t===0`
- `lib/providers/index.ts` -- riscritto: `QUOTE_PROVIDERS: Record<string, QuoteProvider>` (16 simboli) + `CANDLE_PROVIDERS` (3 locali); tutte le funzioni async con `Promise.all`
- `types/markets.ts` -- `MarketInstrumentStatus` aggiunge `"delayed"`; `MarketInstrument` aggiunge `finnhubSymbol?: string`
- `lib/markets/catalog.ts` -- 13 strumenti da `"soon"` a `"delayed"` + `finnhubSymbol` (AAPL/MSFT/NVDA/AMZN/GOOGL/META/TSLA/AMD/SPY/QQQ/BTCUSD/ETHUSD/EURUSD)
- `lib/market/ticker.ts` -- `TickerQuote.id: string` (era `AssetId`); `quoteFromProvider` usa `quote.symbol`
- `app/globals.css` + `tailwind.config.ts` -- design token `--accent-amber: #F59E0B`
- `components/markets/MarketStatusBadge.tsx` -- prop `freshness?: DataFreshness`; pallino ambra per `"delayed"`
- `components/markets/MarketListRow.tsx` -- `hasProvider`/`hasData`; link per tutti strumenti con provider; passa `freshness` al badge
- `components/markets/MarketListSection.tsx` + `MarketsView.tsx` -- `quotesBySymbol` (era `quotesByAssetId`), lookup per `instrument.symbol`
- `components/asset/AssetStatusBadge.tsx` -- "Dati ritardati" (ambra) per delayed, "Non disponibile" (grigio) se no dati
- `components/asset/AssetHero.tsx` + `AssetOverviewSection.tsx` -- freshness propagata al badge e alla label "Stato"
- `app/dashboard/page.tsx`, `app/markets/page.tsx`, `app/asset/[symbol]/page.tsx`, `app/workbench/page.tsx` -- tutti async + await

**Cosa NON e cambiato**: `types/market.ts` (`AssetId` resta `"sp500"|"gold"|"us10y"`), `lib/market.ts`, `components/workbench/*`, auth/Supabase/progressi/quiz/lezioni.

**Dove mettere FINNHUB_API_KEY**:
- `.env.local` (locale): `FINNHUB_API_KEY=<tua_key>` (gia presente al momento dello step)
- **Vercel** (produzione): Project Settings -> Environment Variables -> Name: `FINNHUB_API_KEY` (senza `NEXT_PUBLIC_`, server-only)

**Come aggiungere futuri asset Finnhub** (in 3 passi):
1. `lib/providers/finnhubProvider.ts`: aggiungere a `FINNHUB_SYMBOL_MAP`, `FINNHUB_LABELS`, `FINNHUB_UNITS`
2. `lib/providers/index.ts`: aggiungere `SIMBOLO: finnhubProvider` a `QUOTE_PROVIDERS`
3. `lib/markets/catalog.ts`: impostare `status: "delayed"` + `finnhubSymbol` per lo strumento

**Note su BTCUSD/ETHUSD**: Finnhub free tier non copre il feed Binance crypto -- mostrano "Non disponibile" (comportamento corretto, nessun dato finto). Per abilitarli occorre piano Finnhub con crypto access, o un provider alternativo (l'infrastruttura e pronta).

**Verifica eseguita**:
- `npx tsc --noEmit`: nessun errore
- `npm run build`: 14 route, build pulita
- `/markets`: AAPL/MSFT/NVDA/AMZN/GOOGL/META/TSLA/AMD/SPY/QQQ con prezzi reali + pallino ambra; SPX pallino verde (EOD); PLTR/resto "Soon"
- `/asset/AAPL`: badge "Dati ritardati", prezzo 296,42, variazione +1.82%
- `/asset/NVDA`: "Dati ritardati", prezzo 212,45 (confermato via fetch)
- `/asset/BTCUSD`: "Non disponibile" -- fallback corretto per free tier

---

## Handoff -- Step 13.x completato (Crypto + Forex Provider — CoinGecko + Frankfurter)

**Stato complessivo**: Step 13.x aggiunge dati reali per crypto (BTCUSD, ETHUSD) e forex (EURUSD, GBPUSD, USDJPY) tramite provider gratuiti senza API key. `npx tsc --noEmit` e `npm run build` passano senza errori.

**Problema risolto**: Finnhub free tier restituisce 403 "You don't have access to this resource" per tutti i simboli crypto (BINANCE:BTCUSDT, BINANCE:ETHUSDT, COINBASE:BTC-USD) e forex (OANDA:EUR_USD). Testati esplicitamente, confermato come limite di piano — non errore di simbolo.

**Soluzione**: due provider gratuiti aggiuntivi, nessuna nuova API key.

**File creati in Step 13.x**:

- `lib/providers/coinGeckoProvider.ts` (**NUOVO**) -- `CoinGeckoProvider`: `source:"coingecko"`, `freshness:"delayed"`, fetch batch `bitcoin+ethereum` via `api.coingecko.com/api/v3/simple/price`, `{ next: { revalidate: 60 } }`. Variazione da `usd_24h_change`. Ritorna null se `coin.usd === 0`.
- `lib/providers/frankfurterProvider.ts` (**NUOVO**) -- `FrankfurterProvider`: `source:"frankfurter-ecb"`, `freshness:"eod"`, due fetch parallele (`/latest` + `/3-days-ago`) su `api.frankfurter.app`. Converte da USD-base: EURUSD = `1/rates.EUR`, GBPUSD = `1/rates.GBP`, USDJPY = `rates.JPY`. Variazione calcolata vs chiusura precedente. `{ next: { revalidate: 3600 } }`.

**File modificati in Step 13.x**:

- `lib/providers/types.ts` -- `ProviderSource` aggiunge `"coingecko" | "frankfurter-ecb"`
- `lib/providers/index.ts` -- aggiunge `BTCUSD/ETHUSD: coinGeckoProvider` e `EURUSD/GBPUSD/USDJPY: frankfurterProvider` a `QUOTE_PROVIDERS`; aggiunge import dei due nuovi provider
- `lib/markets/catalog.ts` -- BTCUSD/ETHUSD/EURUSD/GBPUSD/USDJPY: `status: "delayed"` (erano "soon" per GBPUSD/USDJPY, erano "delayed" ma senza provider per BTC/ETH)
- `app/globals.css` + `tailwind.config.ts` -- design token `--accent-amber: #F59E0B` (già presenti da Step 13, confermati)
- `components/asset/AssetStatusBadge.tsx` -- badge freshness-driven: "Dati EOD" (verde) per `"eod"`, "Dati ritardati" (ambra) per `"delayed"`, "Non disponibile" (grigio) per null
- `components/markets/MarketStatusBadge.tsx` -- pallino ambra per tutti i delayed

**Fix TypeScript**: `Array.from(new Set(...))` invece di `[...new Set(...)]` per evitare TS2802 (`downlevelIteration` non abilitato in questo tsconfig).

**Stato dati per simbolo (verificato a runtime)**:

| Simbolo | Provider | Freshness | Badge UI | Note |
|---------|----------|-----------|----------|------|
| SPX | local-static | eod | Dati EOD (verde) | Serie storica JSON locale |
| XAUUSD | local-static | eod | Dati EOD (verde) | Serie storica JSON locale |
| US10Y | local-static | eod | Dati EOD (verde) | Serie storica JSON locale |
| AAPL / MSFT / NVDA / AMZN / GOOGL / META / TSLA / AMD | finnhub | delayed | Dati ritardati (ambra) | Free tier ~15 min ritardo |
| SPY / QQQ | finnhub | delayed | Dati ritardati (ambra) | Free tier ~15 min ritardo |
| BTCUSD | coingecko | delayed | Dati ritardati (ambra) | Prezzo USD + variazione 24h |
| ETHUSD | coingecko | delayed | Dati ritardati (ambra) | Prezzo USD + variazione 24h |
| EURUSD | frankfurter-ecb | eod | Dati EOD (verde) | BCE, aggiornamento giornaliero |
| GBPUSD | frankfurter-ecb | eod | Dati EOD (verde) | BCE, aggiornamento giornaliero |
| USDJPY | frankfurter-ecb | eod | Dati EOD (verde) | BCE, aggiornamento giornaliero |
| NDX / DJI / RUT / PLTR / XRPUSD / ADAUSD / … | — | — | Soon (grigio) | Nessun provider registrato |

**Verifica eseguita**:
- `npx tsc --noEmit`: nessun errore
- `npm run build`: build pulita
- `/asset/BTCUSD`: "Dati ritardati" ✓
- `/asset/ETHUSD`: "Dati ritardati" ✓
- `/asset/EURUSD`: "Dati EOD" ✓
- `/asset/GBPUSD`: "Dati EOD" ✓
- `/asset/USDJPY`: "Dati EOD" ✓
- `/markets`: BTCUSD/ETHUSD/EURUSD/GBPUSD/USDJPY tutti presenti con dati reali

**Come aggiungere nuove crypto (CoinGecko)**:
1. `lib/providers/coinGeckoProvider.ts`: aggiungere a `COINGECKO_ID_MAP` e `COINGECKO_LABELS`
2. `lib/providers/index.ts`: aggiungere `SIMBOLO: coinGeckoProvider`
3. `lib/markets/catalog.ts`: `status: "delayed"`

**Come aggiungere nuove coppie forex (Frankfurter)**:
1. `lib/providers/frankfurterProvider.ts`: aggiungere a `FOREX_CONFIG` con `label`, `currency`, `compute`
2. `lib/providers/index.ts`: aggiungere `SIMBOLO: frankfurterProvider`
3. `lib/markets/catalog.ts`: `status: "delayed"`

**Prossimo step**: da definire con l'utente.
