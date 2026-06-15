import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { ChartIcon } from "@/components/layout/icons";

/** Card del modulo Workbench nel command center della Home. */
export function WorkbenchCard() {
  return (
    <ModuleCard
      icon={<ChartIcon className="h-4 w-4" />}
      iconClassName="bg-accent-green/15 text-accent-green"
      eyebrow="Workbench"
      title="Grafico interattivo"
      description="S&P 500, Oro e US Treasury 10Y — normalizzati a base 100, con overlay statistici."
      cta={{ label: "Apri grafico", href: "/workbench" }}
    />
  );
}
