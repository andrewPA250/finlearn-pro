import type { Metadata } from "next";
import { AiView } from "@/components/ai/AiView";

export const metadata: Metadata = {
  title: "AI Analyst",
  description:
    "Understand markets, assets, and your portfolio with the AI Analyst — an educational assistant. Not financial advice.",
};

export default function AiPage() {
  return <AiView />;
}
