import type { Metadata } from "next";
import Link from "next/link";
import { Disclaimer, Eyebrow } from "@/components/ui";
import { QUESTION_BANK } from "@/lib/iq/bank";
import { DIFFICULTY_THRESHOLD } from "@/lib/iq/scoring";
import { TESTS } from "@/lib/iq/tests";

export const metadata: Metadata = { title: "Method" };

const SECTIONS = [
  {
    heading: "Why the score is not a percentage",
    body: [
      "Reporting the share of questions you answered correctly would make the score a property of the paper rather than of you: an easy paper would produce a high number and a hard one a low number, for identical reasoning.",
      "Instead each question carries a difficulty threshold expressed directly on the IQ scale — the ability level at which a taker has an even chance of solving it honestly. Your reported score is the ability value that best explains the exact pattern of items you solved and missed, estimated under a normal population prior centred on 100 with a standard deviation of 15.",
      "Two consequences follow. Solving a hard item moves the estimate more than solving an easy one. And because the model knows how many options each question had, it discounts what could plausibly have been a guess — a free-entry numerical answer counts for more than a one-in-four choice.",
      "The reportable range runs from 45 to 170. It is wider at the top than a short test can actually resolve, which is why the adaptive test exists: a fixed paper runs out of hard items long before it runs out of scale. The bottom of the scale is blunt for a different reason — with four-option questions a taker who knows nothing still scores about 25%, so very low abilities cannot be told apart, and estimates there sit closer to 60 than to the floor.",
    ],
  },
  {
    heading: "The adaptive test",
    body: [
      "A fixed paper spends most of its questions in the wrong place. An item only carries information about ability near its own difficulty, so a strong taker wastes time on questions he was always going to solve and a weaker one grinds through questions he was never going to. Neither tells us much.",
      "The adaptive test re-estimates ability after every answer and asks next whichever unseen item carries the most information at that estimate. It stops as soon as the standard error reaches its target, or at 24 questions, whichever comes first.",
      "The effect is not cosmetic. Simulated against takers of known ability, the adaptive test recovers the true figure to within about 3.5 points at the centre of the scale, against 4.9 for the fixed short test — and at the top of the range the gap is far larger, because a fixed paper simply runs out of hard items. For a taker whose true ability is 145, the short test is off by roughly 23 points on average; the adaptive test by under 7.",
      "It also balances coverage as it goes: pure information-maximising would happily serve one domain repeatedly if those items happened to sit nearest the estimate, which would wreck the per-domain breakdown. Domains that are behind on coverage are preferred, so all five are always sampled.",
      "The trade is that you cannot go back. Changing an earlier answer would invalidate every question chosen after it.",
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
    heading: "The archetype assessment is not a personality test",
    body: [
      "King, Warrior, Magician, Lover is Robert Moore and Douglas Gillette's model of the mature masculine (1990), drawn from Jungian archetype theory. It is not a typology. You are not \u201ca Warrior\u201d the way you might be an INTJ \u2014 every man has all four energies, and the questions worth asking are how much access you have to each, whether they are in balance, and whether you meet them in their mature form or in one of their two shadows.",
      "So the result never names a type. It reports access across all four, the spread between them, which sub-archetype of the leading energy you actually expressed, which shadow you fall into under pressure, and the gap between what you say you value and what you reach for.",
      "Each archetype also has a bipolar shadow \u2014 an active, inflated pole and a passive, deflated one \u2014 and an immature 'boy psychology' precursor it matures out of. The Tyrant and the Weakling for the King; the Sadist and the Masochist for the Warrior; the Manipulator and the Denying Innocent One for the Magician; the Addicted and the Impotent Lover. Those are Moore and Gillette's terms. Leaving them out would turn the model into a horoscope, because the shadows are where most men actually live.",
    ],
  },
  {
    heading: "Why it is built from situations rather than statements",
    body: [
      "A statement like \u201cI take charge when a group has no direction\u201d announces exactly what it measures, so a questionnaire built from statements records self-image as much as behaviour \u2014 and it takes a great many of them to get a stable reading.",
      "Situations do not announce themselves. Each offers four responses a reasonable man might all choose, so picking one reveals disposition rather than aspiration. And because exactly one option can be chosen, the format is ipsative: you cannot claim all four energies at once, the way you can agree with every statement on a rating scale. That property is what makes a short assessment workable \u2014 eighteen forced choices carry more information than a hundred ratings, which is why the core form takes about six minutes.",
      "Each option also carries a sub-archetype, so reaching for the King repeatedly reveals not just King but which kind. Every sub-archetype is offered exactly eight times across the situations, so none can win on availability rather than on your choices. The trait signature is derived from the same answers rather than asked for separately.",
      "Several situations describe things going wrong, and their options map to the two shadow poles. Nobody selects an option labelled as a flaw, so each is written to sound reasonable from the inside, which is how shadows actually operate.",
    ],
  },
  {
    heading: "The confidence figure",
    body: [
      "Three things move it. How many situations you answered \u2014 more choices, less noise. How concentrated your choices were \u2014 a man who spreads evenly across all four has genuinely not revealed a dominant energy, and saying otherwise would be inventing a finding. And how far the leading energy is clear of the next.",
      "The range beside it is the binomial standard error on the leading share, carried through the same mapping used for the score itself. It widens honestly on the shorter form, which is the trade you make by taking six minutes instead of eleven.",
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
