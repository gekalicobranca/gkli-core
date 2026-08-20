import { canAccess } from "@/lib/auth/permissions";
import { ReguaCarteirasPage, ReguaShell } from "@/features/gkli-regua/components";
import { getReguaData, requireReguaContext } from "@/features/gkli-regua/queries";

export default async function CredoresPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const context = await requireReguaContext("/modulos/gkli-regua/credores");
  const data = await getReguaData();
  const params = await searchParams;
  const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";
  return (
    <ReguaShell usuario={context.usuario} eyebrow="Cadastros" title="Credores" description="Consulte e mantenha os condomínios credores da régua.">
      <ReguaCarteirasPage data={data} canWrite={canAccess(context.permissions, "gkli_regua.write")} q={one(params.q)} status={one(params.status)} />
    </ReguaShell>
  );
}
