import Link from "next/link";
import { TestCard } from "@/components/TestCard";
import { ButtonLink, Eyebrow } from "@/components/ui";
import { QUESTION_BANK } from "@/lib/iq/bank";
import { TESTS } from "@/lib/iq/tests";
import { CATEGORIES, CATEGORY_BLURBS, CATEGORY_LABELS } from "@/lib/iq/types";
import { ARCHETYPES } from "@/lib/personality/archetypes";
import { PERSONALITY_ITEMS } from "@/lib/personality/items";
import { TRAITS, TRAIT_LABELS } from "@/lib/personality/types";

const PRINCIPLES = [
  {
    title: "Scored by ability, not by percentage",
    body: "Every item carries a difficulty threshold on the IQ scale. Your score is the ability level that best explains which items you solved — so a hard item you get right counts for more than an easy one, and a lucky guess counts for less.",
  },
  {
    title: "Retakes settle instead of climbing",
    body: "Repeated sittings are combined with a weighted median. Later attempts, narrower tests and papers built from questions you have already seen all carry less weight, so persistence alone will not move the number.",
  },
  {
    title: "Five domains, reported separately",
    body: "Logical, numerical, pattern, spatial and verbal reasoning are estimated on their own as well as together. The shape of the profile usually tells you more than the headline figure.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-8 sm:pt-24">
        <div className="max-w-3xl">
          <Eyebrow>Cognitive assessment · Modulo</Eyebrow>
          <h1 className="text-balance-tight mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-fog-100 sm:text-6xl">
            Measure how you think,
            <br className="hidden sm:block" />
            <span className="text-fog-300"> not how fast you guess.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-fog-300 sm:text-[17px]">
            Modulo: Test is a set of {TESTS.length} reasoning assessments and a{" "}
            {PERSONALITY_ITEMS.length}-item trait profile. Questions are drawn at random from a bank
            of {QUESTION_BANK.length}, scored with a transparent ability model, and combined across
            attempts so the estimate settles rather than inflates.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/test/quick" size="lg">Take the Quick IQ Test</ButtonLink>
            <ButtonLink href="/personality" size="lg" variant="secondary">Find your archetype</ButtonLink>
          </div>
          <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            {[
              { k: `${QUESTION_BANK.length}`, v: "questions in the bank" },
              { k: "5", v: "cognitive domains" },
              { k: `${ARCHETYPES.length}`, v: "Modulo archetypes" },
              { k: "0", v: "accounts required" },
            ].map((stat) => (
              <div key={stat.v}>
                <dt className="tabular text-3xl font-semibold tracking-tight text-fog-100">{stat.k}</dt>
                <dd className="mt-1 text-[12.5px] text-fog-400">{stat.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="iq" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8">
        <div className="flex flex-col gap-4 border-t border-ink-800 pt-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <Eyebrow>IQ tests</Eyebrow>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-fog-100 sm:text-3xl">Pick the depth you want</h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-fog-300">
              Two full-spectrum tests give you an overall estimate. The focused tests go deeper into a
              single domain and are weighted accordingly when your results are combined.
            </p>
          </div>
          <Link href="/tests" className="shrink-0 text-[13.5px] text-sand-400 hover:text-sand-300">View all tests →</Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTS.map((test) => <TestCard key={test.id} test={test} />)}
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((category) => (
            <div key={category} className="rounded-xl border border-ink-800 p-4">
              <h3 className="text-[13.5px] font-medium text-fog-100">{CATEGORY_LABELS[category]}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-fog-400">{CATEGORY_BLURBS[category]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="border-t border-ink-800 pt-10">
          <Eyebrow>How the score works</Eyebrow>
          <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-fog-100 sm:text-3xl">An estimate you can interrogate</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {PRINCIPLES.map((principle, index) => (
              <div key={principle.title} className="rounded-2xl border border-ink-800 p-6">
                <span className="tabular text-[12px] text-sand-500">0{index + 1}</span>
                <h3 className="mt-3 text-[15.5px] font-semibold tracking-tight text-fog-100">{principle.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-fog-300">{principle.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="personality" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8">
        <div className="panel overflow-hidden rounded-3xl">
          <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div>
              <Eyebrow>Personality</Eyebrow>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-fog-100 sm:text-3xl">Nine traits. Ten archetypes.</h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-fog-300">
                Rate {PERSONALITY_ITEMS.length} statements on a five-point scale. Modulo scores nine
                traits, then matches the <em>shape</em> of your profile — relative strengths, not raw
                agreement — against ten archetypes we designed. You get a primary and a secondary, with
                the strengths and the failure modes of each.
              </p>
              <div className="mt-6 flex flex-wrap gap-1.5">
                {TRAITS.map((trait) => (
                  <span key={trait} className="rounded-md border border-ink-700 px-2 py-1 text-[11.5px] text-fog-300">
                    {TRAIT_LABELS[trait]}
                  </span>
                ))}
              </div>
              <div className="mt-8">
                <ButtonLink href="/personality" variant="secondary" size="lg">Take the personality test</ButtonLink>
              </div>
              <p className="mt-6 text-[12px] leading-relaxed text-fog-400">
                Modulo archetypes are created by Modulo. They are a readable summary of your trait
                profile — not a scientifically established personality typology.
              </p>
            </div>
            <ul className="grid grid-cols-2 gap-2.5 self-start">
              {ARCHETYPES.map((archetype) => (
                <li key={archetype.id} className="rounded-xl border border-ink-800 bg-ink-950/40 p-3.5">
                  <p className="text-[13px] font-medium tracking-tight text-fog-100">{archetype.name}</p>
                  <p className="mt-1 text-[11.5px] leading-snug text-fog-400">{archetype.tagline}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
        <div className="rounded-2xl border border-ink-800 bg-ink-900/50 p-6">
          <h2 className="text-[14px] font-semibold text-fog-100">What this is, and what it is not</h2>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-fog-400">
            Modulo: Test is an unsupervised practice assessment. It is not clinically validated, it is
            not administered under controlled conditions, and it does not produce an official or
            diagnostic IQ. Treat the number as an estimate with real error bars — which is why every
            result is reported with a range, a confidence level and the reasoning behind it. Everything
            you do here is stored in your own browser and can be deleted at any time from the{" "}
            <Link href="/history" className="text-fog-200 underline underline-offset-2 hover:text-fog-100">history page</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
