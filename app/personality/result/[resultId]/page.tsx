import type { Metadata } from "next";
import { PersonalityResultView } from "@/components/PersonalityResultView";

export const metadata: Metadata = { title: "Your archetype" };

export default async function PersonalityResultPage({
  params,
}: {
  params: Promise<{ resultId: string }>;
}) {
  const { resultId } = await params;
  return <PersonalityResultView resultId={resultId} />;
}
