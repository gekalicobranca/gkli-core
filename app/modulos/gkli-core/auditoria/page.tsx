import { CoreShell, InlineNotice, PageHeader, Panel, StatusBadge } from "@/features/gkli-core/ui";

const auditRows = [
  {
    evento: "Criacao de usuario",
    origem: "Core",
    status: "Planejado"
  },
  {
    evento: "Alteracao de apps permitidos",
    origem: "Core",
    status: "Planejado"
  },
  {
    evento: "Alteracao de carteiras",
    origem: "Core",
    status: "Planejado"
  }
];

export default function AuditoriaPage() {
  return (
    <CoreShell
      activeHref="/modulos/gkli-core/auditoria"
      title="Chaves e auditoria"
      description="Trilha de mudancas estruturais e acessos sensiveis."
    >
      <PageHeader
        eyebrow="Controle"
        title="Auditoria do Core"
        description="Toda mudanca em usuario, tipo de acesso, app permitido e carteira precisa deixar trilha para investigacao e suporte."
      />

      <div className="grid cols-2">
        <Panel title="Eventos auditaveis" note="Governanca">
          <div className="list">
            {auditRows.map((row) => (
              <div className="list-item" key={row.evento}>
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
          description="A proxima etapa deve criar tabelas, policies e repositories. A UI ja separa os dominios que precisam ser persistidos."
          tone="blue"
        />
      </div>
    </CoreShell>
  );
}
