import { getCoreData } from "@/features/gkli-core/repository";
import { CoreShell, InlineNotice, PageHeader, Panel, StatusBadge } from "@/features/gkli-core/ui";

export const dynamic = "force-dynamic";

export default async function AuditoriaPage() {
  const { auditRows } = await getCoreData();

  return (
    <CoreShell
      activeHref="/modulos/gkli-core/auditoria"
      title="Chaves e auditoria"
      description="Trilha de mudanças estruturais e acessos sensíveis."
    >
      <PageHeader
        eyebrow="Controle"
        title="Auditoria do Core"
        description="Toda mudança em usuário, tipo de acesso, app permitido e carteira precisa deixar trilha para investigação e suporte."
      />

      <div className="grid cols-2">
        <Panel title="Eventos auditáveis" note="Governança">
          <div className="list">
            {auditRows.map((row) => (
              <div className="list-item" key={row.id}>
                <div>
                  <div className="item-title">{row.evento}</div>
                  <div className="item-meta">{row.origem}</div>
                </div>
                <StatusBadge tone="yellow">{row.status}</StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <InlineNotice
          title="Antes do backend"
          description="A próxima etapa deve criar tabelas, policies e repositories. A UI já separa os domínios que precisam ser persistidos."
          tone="blue"
        />
      </div>
    </CoreShell>
  );
}
