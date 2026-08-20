import { canAccess } from "@/lib/auth/permissions";
import {
  ReguaImportacoesPage,
  ReguaShell,
} from "@/features/gkli-regua/components";
import {
  getReguaData,
  requireReguaContext,
} from "@/features/gkli-regua/queries";

export default async function ImportacoesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await requireReguaContext("/modulos/gkli-regua/importacoes");
  const data = await getReguaData();
  const params = await searchParams;
  const one = (value: string | string[] | undefined) =>
    Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  return (
    <ReguaShell
      usuario={context.usuario}
      eyebrow="Operação"
      title="Importações"
      description="Atualize a referência de credores e processe as bases operacionais."
    >
      <ReguaImportacoesPage
        data={data}
        canWrite={canAccess(context.permissions, "gkli_regua.write")}
        q={one(params.q)}
        status={one(params.status)}
      />
    </ReguaShell>
  );
}
