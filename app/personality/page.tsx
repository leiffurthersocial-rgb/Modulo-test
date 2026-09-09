import type { Metadata } from "next";
import { PersonalityRunner } from "@/components/PersonalityRunner";

export const metadata: Metadata = { title: "Personality test" };

export default function PersonalityPage() {
  return <PersonalityRunner />;
}
