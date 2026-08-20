import { ReguaCockpitPage, ReguaShell } from "@/features/gkli-regua/components";
import {
  getReguaData,
  requireReguaContext,
} from "@/features/gkli-regua/queries";

export default async function GkliReguaRoute() {
  const context = await requireReguaContext();
  const data = await getReguaData();
  return (
    <ReguaShell
      usuario={context.usuario}
      eyebrow="Visão geral"
      title="Cockpit operacional"
      description="Indicadores e acessos rápidos para a rotina da régua."
    >
      <ReguaCockpitPage data={data} />
    </ReguaShell>
  );
}
