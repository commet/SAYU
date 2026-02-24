# 2026-02-21: Exhibition Worldcup Optimization

## Commit
- `a6a55b54` - `feat: optimize exhibition worldcup with client-side bracket progression`
- Pushed to `main`

## What Was Done

### 1. Client-Side Bracket Progression (Core Fix)
**Problem**: Server-driven bracket progression caused 2 critical issues:
- ~5.4s delay per match (400ms animation + ~4s API await + 500ms setTimeout)
- 8/8 match freeze: API uses "snake bracket" (interleaves rounds), `nextMatch` returns null when next-round match only has 1 participant filled, frontend does nothing

**Solution**: Moved bracket progression entirely to client. API calls are now fire-and-forget (background).

**Files changed**:
- `frontend/lib/stores/worldcup-store.ts`
  - Added `currentRoundMatches`, `currentRoundIndex`, `roundWinners` state
  - Added `advanceInRound()` - moves to next match within current round
  - Added `generateNextRound()` - pairs winners into next round matches
  - `selectWinner()` now tracks winners in `roundWinners` array
  - `startTournament()` initializes bracket state
  - All new state persisted in localStorage for recovery

- `frontend/components/worldcup/WorldcupContainer.tsx`
  - `handleMatchResult` is no longer `async`
  - API call fires in background with `.catch()` for error logging only
  - Client-side progression after 200ms: `advanceInRound()` -> `generateNextRound()` -> `completeTournament()`
  - Removed `advanceToNextMatch` dependency (was server-driven)

### 2. UI Color Changes (violet -> neutral white)
**Problem**: Purple/violet selection color looked "AI-designed", not elegant

**File**: `frontend/components/worldcup/MatchView.tsx`
- Header round label: `text-violet-400/80` -> `text-white/70`
- Progress bar: `from-violet-500/80 to-indigo-400/80` -> `from-white/60 to-white/40`
- VS badge border: `border-violet-500/60` -> `border-white/30`
- VS text: `text-violet-400` -> `text-white/50`
- Selection overlay: `bg-violet-500/20 border-violet-400/30` -> `bg-white/10 border-white/30`
- Checkmark: `text-violet-400` -> `text-white`
- Selected gradient: `from-violet-900/80` -> `from-black/90`
- Category badges: `text-violet-300/80` -> `text-white/60`
- No-image selected gradient: `from-violet-900/30` -> `from-white/[0.06]`

### 3. Card Layout Improvements
**File**: `frontend/components/worldcup/MatchView.tsx`
- Reduced card size: added `max-h-[70vh]`, changed `min-h-[40vh]` -> `min-h-[35vh]`
- Added description to image cards (was only on no-image cards):
  ```
  {participant.description && (
    <p className="text-white/35 text-xs font-light mt-1.5 line-clamp-2">
      {participant.description}
    </p>
  )}
  ```
- No-image cards: description `line-clamp-2` -> `line-clamp-3`
- Faster animations: `duration: 0.4` -> `0.3`, delays `0.2` -> `0.15`

### 4. Animation Speed
- Selection timeout: 400ms -> 200ms (MatchView `handleSelect`)
- Post-selection progression: 500ms setTimeout removed, replaced with 200ms in container
- Total per-match time: ~5.4s -> ~400ms

### 5. Non-Exhibition Content Filter
**Problem**: Yoga classes, concerts, workshops mixed in from source APIs

**File**: `frontend/app/api/worldcup/sessions/exhibition/route.ts`
- Added keyword exclusion list:
  ```
  yoga, concert, workshop, class, lecture, seminar,
  film, movie, screening, recital, festival, fair,
  marathon, run, walk, tour, camp, retreat
  ```
- Filters by checking if `title.toLowerCase()` contains any keyword
- Applied before shuffle/selection, after fetching from DB

## Flow Diagram (After)
```
User clicks exhibition ->
  1. selectWinner() in store (instant, records winner in roundWinners[])
  2. fetch() API in background (fire-and-forget)
  3. setTimeout 200ms (selection animation visible)
  4. advanceInRound()
     - Has more matches in round? -> show next match (instant)
     - Round complete? -> generateNextRound()
       - Has next round? -> pair winners, show first match
       - Was final? -> completeTournament(), show result
```

## Session 2 (2026-02-23)

### 6. Fixed Round 2+ API 404 Bug
**Problem**: Client-generated matches (round 2+) have IDs like `client-round2-match0` that don't exist on the server. API calls returned 404.

**Fix**: Skip API call when `currentMatch.id.startsWith('client-')` in `WorldcupContainer.tsx`.
- Round 1 results still persist to DB (server-generated IDs)
- Round 2+ results only live in client localStorage (acceptable for personal use)

### 7. Removed ALL Violet/Purple Colors
Replaced violet with neutral white/cream across ALL worldcup components:

**Files changed**:
- `ResultView.tsx` - 9 violet references replaced (header gradient, icon, APT analysis box, progress bars, download button)
- `ExhibitionSetupPhase.tsx` - 7 violet references replaced (header icon, selected states, round selection, start button)
- `ModeSelector.tsx` - 3 violet references replaced (exhibition mode accent, border, icon)
- **0 violet/indigo references remain** across all worldcup components

## What's NOT Done / Next Steps

### Remaining Improvements
- Mobile layout could be further optimized (vertical stacking with smaller cards)
- No artist info shown on image cards (only description added)
- Round 2+ match results not persisted to server (only round 1). Full server persistence would require pre-creating all round matches at session start.

### Broader Project
- See MEMORY.md for full project context
- International exhibition sources (Cleveland, Whitney, Paris, Berlin, e-flux) tables still need creation in Supabase
- 3 auth systems still need unification
