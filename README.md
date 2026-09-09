# Modulo: Test

IQ-style cognitive assessments and personality archetypes. Next.js 15 (App Router) +
TypeScript + Tailwind v4. No backend, no accounts — everything is stored in the visitor's
browser and can be deleted from the history page.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm test         # scoring/selection unit tests (vitest)
npm run lint
npm run typecheck
```

Deploying to Vercel needs no configuration: import the repository and it builds with the
defaults.

## What's here

- **8 IQ tests** — Quick, Standard and Challenge (full-spectrum) plus focused Logic,
  Pattern, Numerical, Spatial and Verbal tests.
- **276 questions** across logical, numerical, pattern, spatial and verbal reasoning, in
  five formats: multiple choice, free numeric entry, symbolic series, 3×3 abstract
  matrices and figure choice. Visual items are generated from explicit rules with a fixed
  seed, so every figure has a provably unique answer and never shifts between renders.
- **Personality profile** — 45 statements on a 1–5 scale scoring nine traits, matched
  against 10 Modulo archetypes.
- **Keyboard-drivable tests** — number keys answer, arrow keys navigate, and answer
  options carry proper `radiogroup` semantics.

## Architecture

Scoring is pure and framework-free, which is what makes it testable:

| Module | Responsibility |
| --- | --- |
| `lib/iq/types.ts` | Question/answer model, correctness, guess rates |
| `lib/iq/bank/` | The question bank + structural validation |
| `lib/iq/select.ts` | Randomised, seen-aware paper construction |
| `lib/iq/scoring.ts` | Ability estimation, percentile, bands, domain breakdown |
| `lib/iq/stable.ts` | Combining repeat attempts |
| `lib/personality/` | Items, traits, archetypes, cosine matching |
| `lib/storage.ts` | Versioned, defensively-parsed localStorage layer |

### Scoring is not percentage correct

Each item carries a difficulty threshold on the IQ scale (level 1 → 82 … level 5 → 130).
The reported score is the ability that best explains the observed pattern of right and
wrong answers — a MAP estimate under a `N(100, 15)` prior, using a three-parameter
logistic with a guessing term set from the number of options. Hard items therefore move
the estimate more than easy ones, and a one-in-four guess counts for less than a free
numeric entry. Extreme patterns are pulled toward the population mean, and each result
ships with a standard error and a 68% interval.

### Retakes settle rather than inflate

Attempts are combined with a **weighted median**, never the maximum. Weights are the
product of four factors: test breadth (single-domain tests count roughly half), item count,
novelty (share of questions never served before, floored at 0.35), and a practice decay by
attempt order. So 115 → 121 → 118 settles at 118, and a fourth 145 built from recycled
questions barely moves it.

### Repeat protection

Every served question id is recorded. The selector ranks unseen questions ahead of seen
ones, so a retake draws an entirely new paper until the pool is exhausted; once it is, the
attempt is flagged as low-novelty and down-weighted rather than silently trusted.

`validateBank` enforces the invariants this depends on — unique ids, in-range answers, no
repeated options, exactly one blank per matrix, and no two questions with identical
prompt + stimulus + options. The generated visual items are deduplicated at build time for
the same reason: a repeat served as if it were new would quietly corrupt the novelty
weighting.

### Archetypes

Trait scores are centred on the taker's own mean before matching, so the result depends on
the *shape* of the profile — relative strengths — not on how agreeable the taker was.
Cosine similarity against 10 archetype vectors yields the primary and secondary. Every
archetype is reachable, which the tests assert.

## Honesty

Modulo: Test is an unsupervised practice assessment. It is not clinically validated and
does not produce an official or diagnostic IQ. The archetypes are Modulo's own construction
and are not a scientifically established personality typology. Both claims are stated in
the product, not just here.
