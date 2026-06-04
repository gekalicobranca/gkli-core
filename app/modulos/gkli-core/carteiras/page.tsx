import { BriefcaseBusiness } from "lucide-react";
import { wallets } from "@/features/gkli-core/mock-data";
import { CoreShell, InlineNotice, PageHeader, Panel, StatusBadge } from "@/features/gkli-core/ui";

export default function CarteirasPage() {
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
              <th>App origem</th>
              <th>Usuarios</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((wallet) => (
              <tr key={wallet.id}>
                <td>{wallet.nome}</td>
                <td>{wallet.codigo}</td>
                <td>{wallet.appOrigem}</td>
                <td>{wallet.usuarios}</td>
                <td>
                  <StatusBadge tone="green">{wallet.status}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <div className="stack-lg">
        <InlineNotice
          title="Escopo esperado"
          description="Administrador pode ter escopo global; usuarios comuns precisam de pelo menos uma carteira vinculada para operar dados restritos."
          tone="yellow"
        />
      </div>
    </CoreShell>
  );
}
