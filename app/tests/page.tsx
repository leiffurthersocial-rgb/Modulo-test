import type { Metadata } from "next";
import { TestCard } from "@/components/TestCard";
import { Disclaimer, Eyebrow } from "@/components/ui";
import { QUESTION_BANK } from "@/lib/iq/bank";
import { TESTS } from "@/lib/iq/tests";

export const metadata: Metadata = { title: "IQ tests" };

export default function TestsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <Eyebrow>IQ tests</Eyebrow>
      <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-fog-100 sm:text-4xl">
        {TESTS.length} assessments, one scoring model
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-fog-300">
        Every test draws from the same bank of {QUESTION_BANK.length} questions, samples all
        five domains, and is scored with the same ability model, so results are directly
        comparable across all three.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TESTS.map((test) => <TestCard key={test.id} test={test} />)}
      </div>
      <div className="mt-10 max-w-3xl">
        <Disclaimer>
          Modulo: Test is an unsupervised practice assessment. It is not clinically validated and
          does not produce an official IQ. Scores are estimates with real error bars.
        </Disclaimer>
      </div>
    </div>
  );
}
