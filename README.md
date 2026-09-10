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

### Answer position

Questions are authored with the correct option written first — readable for maintenance,
useless for a taker, since it would put the answer at A every time (it did: all 146
hand-authored multiple-choice items). Options are therefore shuffled per attempt, keyed to
the attempt seed, so the answer lands in each position about equally often *and* moves
between retakes, making a remembered position worthless. The order is derived from
`(question id, attempt seed)` rather than stored, so the runner and the review agree without
persisting a permutation per question; attempts saved before this existed have no seed and
fall back to the authored order, so their reviews still line up.

### Repeat protection

Every served question id is recorded. The selector ranks unseen questions ahead of seen
ones, so a retake draws an entirely new paper until the pool is exhausted; once it is, the
attempt is flagged as low-novelty and down-weighted rather than silently trusted.

`validateBank` enforces the invariants this depends on — unique ids, in-range answers, no
repeated options, exactly one blank per matrix, and no two questions with identical
prompt + stimulus + options. The generated visual items are deduplicated at build time for
the same reason: a repeat served as if it were new would quietly corrupt the novelty
weighting.

### The King / Warrior / Magician / Lover assessment

Robert Moore and Douglas Gillette's model of the mature masculine (1990), from Jungian
archetype theory. Two properties of the model shape the whole implementation:

**It is not a personality typology.** You are not "a Warrior" the way you might be an INTJ.
Every man has all four energies, so the result never names a type — it reports *access*
across all four, the spread between them, which shadow you fall into, and the gap between
what you value and what you reach for.

**Each archetype has a bipolar shadow** — an active/inflated and a passive/deflated pole —
plus an immature "boy psychology" precursor. Tyrant/Weakling (King), Sadist/Masochist
(Warrior), Manipulator/Denying Innocent One (Magician), Addicted/Impotent Lover. Those are
Moore and Gillette's terms; omitting them would make the model a horoscope, since the
shadows are where most men actually live.

Each archetype carries what it **desires**, what it **fears**, its function, how it shows
up at work and in relationships, what is missing without it, both shadows with their tells,
its immature form, and concrete development practices.

#### Built from situations, not statements

Every situation is set in school life — a Friday deadline and a group that has done nothing,
a group chat that has turned on someone, a mark that came back lower than expected with two
lines of feedback. A scenario only measures behaviour if the taker can picture being inside
it; an abstract prompt gets answered by the person you believe you are, a concrete one by the
person you are. Each is also tagged with a **context** (group work, friendships, conflict,
teachers and rules, your own time), so the result can report which energy you reach for
*where* — a gap between two contexts is a finding in itself.


| Form | Items | Time |
| --- | --- | --- |
| Core | 18 situations + 8 priorities | ~6 min |
| Deep | 34 situations + 12 priorities | ~11 min |

A statement announces what it measures, so it records self-image — and needs a great many
items for a stable reading. A situation with four defensible answers does not, and because
exactly one can be chosen the format is ipsative: you can't claim all four energies the way
you can agree with every statement. That's what makes a six-minute assessment workable.

Each option also carries a sub-archetype, so reaching for the King repeatedly reveals *which
kind*. Every sub-archetype is offered exactly eight times, enforced by test, so none wins on
availability. The trait signature is derived from the same answers rather than asked for
separately.

#### Confidence

Both assessments report confidence as a percentage with a range, on the result page and in
history.

For an **IQ attempt** it is driven by the standard error — expressed as a fraction of the
population SD, so 0% means no better than the population prior — then reduced by unanswered
questions (scored wrong but carrying no information) and by recycled questions (where a
correct answer may be recall). The combined estimate across attempts gets its own figure,
weighted by each attempt's confidence and tightened by how much independent evidence exists.

For the **archetype assessment**, reported as a percentage with an approximate range on the
result page and in history. Three
inputs: how many situations were answered, how concentrated the choices were (spreading
evenly across four genuinely reveals no dominant energy), and the margin over the runner-up.
The range is a **Wilson score interval** — the normal approximation collapses to ±0 when
every choice goes the same way, reporting a short perfectly-consistent form as having no
uncertainty, which is exactly backwards.

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
