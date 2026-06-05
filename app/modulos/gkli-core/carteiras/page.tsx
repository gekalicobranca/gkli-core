import { BriefcaseBusiness } from "lucide-react";
import { createWalletAction } from "@/features/gkli-core/actions";
import { getCoreData } from "@/features/gkli-core/repository";
import { CoreShell, InlineNotice, PageHeader, Panel, StatusBadge } from "@/features/gkli-core/ui";

export const dynamic = "force-dynamic";

export default async function CarteirasPage() {
  const { apps, wallets } = await getCoreData();

  return (
    <CoreShell
      activeHref="/modulos/gkli-core/carteiras"
      title="Carteiras"
      description="Escopo operacional por usuario e por app."
    >
      <PageHeader
        eyebrow="Permissoes"
        title="Carteiras de cada usuario"
        description="Carteiras ficam centralizadas no Core para que COB, Flex e futuros apps usem a mesma regra de visibilidade e operacao."
        actions={
          <button className="button">
            <BriefcaseBusiness size={16} />
            Nova carteira
          </button>
        }
      />

      <Panel title="Carteiras cadastradas" note="Escopo">
        <table className="table">
          <thead>
            <tr>
              <th>Carteira</th>
              <th>Codigo</th>
              <th>App de origem</th>
              <th>Usuarios</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {wallets.length === 0 ? (
              <tr>
                <td colSpan={5}>Nenhuma carteira cadastrada ainda.</td>
              </tr>
            ) : (
              wallets.map((wallet) => (
                <tr key={wallet.id}>
                  <td>{wallet.nome}</td>
                  <td>{wallet.codigo}</td>
                  <td>{wallet.appOrigem}</td>
                  <td>{wallet.usuarios}</td>
                  <td>
                    <StatusBadge tone="green">{wallet.status}</StatusBadge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Panel>

      <div className="grid cols-2 stack-lg">
        <Panel title="Nova carteira" note="Cadastro">
          <form action={createWalletAction} className="form-grid">
            <label>
              Nome
              <input name="nome" placeholder="Carteira operacional" required />
            </label>
            <label>
              Codigo
              <input name="codigo" placeholder="COB-RJ" required />
            </label>
            <label>
              App de origem
              <select name="app_origem_id">
                <option value="">Sem app</option>
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.nome}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select name="status" defaultValue="ativa">
                <option value="ativa">Ativa</option>
                <option value="inativa">Inativa</option>
              </select>
            </label>
            <button className="button" type="submit">
              <BriefcaseBusiness size={16} />
              Salvar carteira
            </button>
          </form>
        </Panel>

        <InlineNotice
          title="Escopo esperado"
          description="Administrador pode ter escopo global; usuarios comuns precisam de pelo menos uma carteira vinculada para operar dados restritos."
          tone="yellow"
        />
      </div>
    </CoreShell>
  );
}
