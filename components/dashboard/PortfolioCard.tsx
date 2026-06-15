import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { WalletIcon } from "@/components/layout/icons";

/** Card del modulo Portfolio nel command center della Home: placeholder "Soon". */
export function PortfolioCard() {
  return (
    <ModuleCard
      icon={<WalletIcon className="h-4 w-4" />}
      iconClassName="bg-accent-blue/15 text-accent-blue"
      eyebrow="Portfolio"
      title="Multi-portfolio e performance"
      description="Holding, allocazione e performance dei tuoi investimenti, in arrivo."
      soon
    />
  );
}
