import { canAccess } from "@/lib/auth/permissions";
import { ReguaLotesPage, ReguaShell } from "@/features/gkli-regua/components";
import {
  getReguaData,
  requireReguaContext,
} from "@/features/gkli-regua/queries";

export default async function LotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await requireReguaContext("/modulos/gkli-regua/lotes");
  const data = await getReguaData();
  const params = await searchParams;
  const one = (value: string | string[] | undefined) =>
    Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  return (
    <ReguaShell
      usuario={context.usuario}
      eyebrow="Operação"
      title="Lotes de e-mail"
      description="Prepare e acompanhe os lotes de comunicação da régua."
    >
      <ReguaLotesPage
        data={data}
        canWrite={canAccess(context.permissions, "gkli_regua.write")}
        q={one(params.q)}
        status={one(params.status)}
        carteira={one(params.carteira)}
      />
    </ReguaShell>
  );
}
