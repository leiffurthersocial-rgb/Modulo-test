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
- **Four-pillar personality profile** — 72 statements + 20 situational items + 12
  forced-choice priorities (or a balanced short form), producing a dominant pillar, its
  sub-archetype, the shadow you fall into under pressure, and the gap between what you
  value and how you act.
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

### The four-pillar model

The structure — four domains of character, each with an inflated and a deflated shadow —
follows the King / Warrior / Magician / Lover framework (Moore & Gillette, 1990), drawn
from Jungian archetype theory. The content, sub-archetypes, scenarios and scoring are
Modulo's own. The twelve archetypes map three-per-pillar: Sovereign (Leader, Guardian,
Strategist), Warrior (Competitor, Maverick, Builder), Magician (Scholar, Craftsman,
Explorer), Lover (Diplomat, Advocate, Catalyst).

Each pillar is measured three ways, and the disagreements between them are the output:

| Mode | Question it answers | Items |
| --- | --- | --- |
| Statements (Likert) | How you describe yourself | 72 |
| Situations (SJT) | What you'd actually do | 20 |
| Priorities (forced choice) | What you'd refuse to give up | 12 |

A statement announces what it measures, so it records self-image as much as behaviour.
Situations give four responses a reasonable person might all choose, so picking one reveals
disposition — and because only one can be picked, you can't claim all four pillars the way
you can agree with every statement. Priorities pit two equally creditable things against
each other, so the choice can't be explained by wanting to look good. Situational answers
are weighted above statements (0.62 / 0.38); where the two disagree by more than 18 points,
the result says so — that's usually a trait that's part of your self-image but not yet your
default move.

Six of the situations describe things going wrong, and their options map to the two shadow
poles. Nobody picks an option labelled as a flaw, so each is written to sound reasonable
from the inside — which is how shadows operate.

**Aspiration minus expression** is the headline output: the pillar you value most above how
you currently act, with concrete practices for it. Every pillar appears an equal number of
times in the forced-choice pairs, which a test enforces.

### The trait layer

Four design decisions do most of the work:

**Balanced keying.** Each trait has eight statements, exactly four reverse-worded.
Acquiescence bias — agreeing with whatever is put in front of you — cancels *exactly* at a
50/50 split and only approximately otherwise. The tests assert that answering 1, 2, 4 or 5
to every statement scores precisely 50 on all nine traits.

**Interleaved presentation.** Statements are round-robinned across traits so no two
consecutive items measure the same thing; a run of five leadership items invites you to
answer the theme rather than the statement.

**Response-quality diagnostics** (`quality.ts`). Variation, longest identical run,
midpoint share, and — the strongest signal — how far each trait's forward and reversed
items disagree. A long run only counts as straight-lining when variation is *also* low:
someone genuinely extreme on most traits produces long runs honestly, and must not be
accused of carelessness when their forward and reversed items agree perfectly. Where the
pattern is unreliable the result says so at the top and downgrades match confidence
regardless of the winning margin.

**Honest matching.** Both the profile and the archetype vectors are mean-centred before
cosine similarity, so an archetype built mostly from positive weights doesn't match
everyone slightly better. Match confidence is reported from the margin: inside a couple of
points the page says you sit *between* two archetypes rather than naming one. And the
secondary is not the runner-up — The Scholar and The Craftsman correlate at 0.87, so
reporting both tells you nothing — it's the highest-ranked archetype with a genuinely
different shape.

Retakes are compared against the previous profile (per-trait shifts, correlation, verdict),
the personality-side counterpart to the IQ stability estimate.

## Honesty

Modulo: Test is an unsupervised practice assessment. It is not clinically validated and
does not produce an official or diagnostic IQ. The archetypes are Modulo's own construction
and are not a scientifically established personality typology. Both claims are stated in
the product, not just here.
