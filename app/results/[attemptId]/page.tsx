import type { Metadata } from "next";
import { ResultView } from "@/components/ResultView";

export const metadata: Metadata = { title: "Your result" };

export default async function ResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  return <ResultView attemptId={attemptId} />;
}
