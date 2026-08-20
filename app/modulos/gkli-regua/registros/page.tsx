import { ReguaRegistrosPage, ReguaShell } from "@/features/gkli-regua/components";
import { getReguaData, requireReguaContext } from "@/features/gkli-regua/queries";

export default async function RegistrosPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const context = await requireReguaContext("/modulos/gkli-regua/registros");
  const data = await getReguaData();
  const params = await searchParams;
  const one = (value: string | string[] | undefined) => Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  return (
    <ReguaShell usuario={context.usuario} eyebrow="Importações" title="Registros" description="Cada linha importada representa uma cobrança, com credor e dados do devedor.">
      <ReguaRegistrosPage data={data} q={one(params.q)} status={one(params.status)} carteira={one(params.carteira)} />
    </ReguaShell>
  );
}
