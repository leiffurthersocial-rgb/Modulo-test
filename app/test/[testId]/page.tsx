import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TestRunner } from "@/components/TestRunner";
import { TESTS, getTest } from "@/lib/iq/tests";

export function generateStaticParams() {
  return TESTS.map((test) => ({ testId: test.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ testId: string }>;
}): Promise<Metadata> {
  const { testId } = await params;
  const test = getTest(testId);
  return { title: test ? test.name : "Test not found" };
}

export default async function TestPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  const test = getTest(testId);
  if (!test) notFound();
  return <TestRunner test={test} />;
}
