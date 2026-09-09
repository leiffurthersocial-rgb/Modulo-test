import type { Metadata } from "next";
import Link from "next/link";
import { Disclaimer, Eyebrow } from "@/components/ui";
import { QUESTION_BANK } from "@/lib/iq/bank";
import { DIFFICULTY_THRESHOLD } from "@/lib/iq/scoring";
import { TESTS } from "@/lib/iq/tests";
import { ARCHETYPES } from "@/lib/personality/archetypes";
import { PERSONALITY_ITEMS } from "@/lib/personality/items";
import { SHORT_ITEM_COUNT } from "@/lib/personality/scoring";

export const metadata: Metadata = { title: "Method" };

const SECTIONS = [
  {
    heading: "Why the score is not a percentage",
    body: [
      "Reporting the share of questions you answered correctly would make the score a property of the paper rather than of you: an easy paper would produce a high number and a hard one a low number, for identical reasoning.",
      "Instead each question carries a difficulty threshold expressed directly on the IQ scale — the ability level at which a taker has an even chance of solving it honestly. Your reported score is the ability value that best explains the exact pattern of items you solved and missed, estimated under a normal population prior centred on 100 with a standard deviation of 15.",
      "Two consequences follow. Solving a hard item moves the estimate more than solving an easy one. And because the model knows how many options each question had, it discounts what could plausibly have been a guess — a free-entry numerical answer counts for more than a one-in-four choice.",
    ],
  },
  {
    heading: "Why retakes do not inflate the number",
    body: [
      "Practice effects are real: take any assessment repeatedly and your score drifts upwards for reasons that have nothing to do with reasoning ability. Reporting your best attempt, or even the plain average, rewards that drift.",
      "Modulo combines attempts with a weighted median. A median is already resistant to a single unusually good or bad sitting. The weights then shrink an attempt's influence when it covers few domains, contains few items, reuses questions you have already been served, or comes later in a long run of retakes.",
      "The practical result: three attempts of 115, 121 and 118 settle at about 118, and a fourth attempt at 145 built from questions you have already seen barely moves it.",
    ],
  },
  {
    heading: "Why you rarely see the same question twice",
    body: [
      `The bank holds ${QUESTION_BANK.length} questions across five domains and five difficulty levels. Each attempt builds a fresh paper: the test's difficulty profile is expanded into a target for every slot, and the selector fills each slot with the best available match.`,
      "Questions you have already been served are ranked last, so a retake draws entirely new items until the relevant pool runs dry. When it does, the attempt is marked as low-novelty and counts for less in your combined estimate rather than being silently treated as fresh evidence.",
    ],
  },
  {
    heading: "How the archetypes are derived",
    body: [
      `The personality assessment is ${PERSONALITY_ITEMS.length} statements rated from one to five — eight per trait, of which exactly four are reverse-worded. That balance matters: acquiescence bias, the tendency to agree with whatever is put in front of you, cancels exactly when a trait has as many reversed items as forward ones, and only approximately when it does not. A balanced ${SHORT_ITEM_COUNT}-item short form is also offered.`,
      "Statements are interleaved rather than grouped, so consecutive questions never measure the same trait. A run of five leadership items in a row invites you to answer the theme rather than the statement.",
      `Trait scores are centred on your own average, so what counts is the shape of the profile — which traits stand out relative to your others — not how strongly you agreed overall. Archetype vectors are centred the same way, which stops archetypes built mostly from positive weights matching everyone slightly better. That shape is compared against ${ARCHETYPES.length} archetypes by cosine similarity.`,
      "The secondary archetype is not simply the runner-up. Several archetypes describe substantially the same person — The Scholar and The Craftsman correlate at 0.87 — so reporting the runner-up would often tell you nothing new. Modulo instead reports the highest-ranked archetype whose shape genuinely differs from the primary.",
      "Because the comparison uses all nine traits at once, no single answer can decide the outcome.",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <Eyebrow>Method</Eyebrow>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fog-100 sm:text-4xl">
        How Modulo scores what you do
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-fog-300">
        Most online tests hide their scoring. This page describes ours in enough detail that you
        can judge how much the number is worth.
      </p>

      <div className="mt-10 space-y-12">
        {SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold tracking-tight text-fog-100">{section.heading}</h2>
            <div className="mt-3 space-y-3">
              {section.body.map((paragraph, index) => (
                <p key={index} className="text-[14.5px] leading-relaxed text-fog-300">{paragraph}</p>
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="text-xl font-semibold tracking-tight text-fog-100">Difficulty thresholds</h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-fog-300">
            The ability level at which each difficulty level is solved roughly half the time,
            before any allowance for guessing.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[26rem] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-ink-700 text-fog-400">
                  <th className="py-2 pr-4 font-medium">Difficulty</th>
                  <th className="py-2 pr-4 font-medium">Threshold</th>
                  <th className="py-2 font-medium">Reads as</th>
                </tr>
              </thead>
              <tbody className="text-fog-200">
                {([1, 2, 3, 4, 5] as const).map((level) => (
                  <tr key={level} className="border-b border-ink-800">
                    <td className="tabular py-2.5 pr-4">Level {level}</td>
                    <td className="tabular py-2.5 pr-4">{DIFFICULTY_THRESHOLD[level]}</td>
                    <td className="py-2.5 text-fog-400">
                      {["Warm-up", "Straightforward", "Moderate", "Demanding", "Hard"][level - 1]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight text-fog-100">Your data</h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-fog-300">
            Everything — attempts, answers, personality results and the record of which questions
            you have seen — is stored in this browser&apos;s local storage. Nothing is sent to a
            server, there is no account, and you can delete individual attempts or wipe everything
            from the{" "}
            <Link href="/history" className="text-fog-100 underline underline-offset-2">history page</Link>.
            Clearing your browser data also clears your results.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight text-fog-100">Limits</h2>
          <div className="mt-4">
            <Disclaimer>
              Modulo: Test is an unsupervised practice assessment covering {TESTS.length} tests. It is
              not clinically validated, it is not administered under controlled conditions, and it
              does not produce an official or diagnostic IQ. The Modulo archetypes are our own
              construction and are not a scientifically established personality typology. Treat both
              as structured self-reflection, not as measurement you should act on.
            </Disclaimer>
          </div>
        </section>
      </div>
    </div>
  );
}
