import { Plus } from "lucide-react";
import { apps } from "@/features/gkli-core/mock-data";
import { CoreShell, InlineNotice, PageHeader, Panel, StatusBadge } from "@/features/gkli-core/ui";

export default function AppsPage() {
  return (
    <CoreShell
      activeHref="/modulos/gkli-core/apps"
      title="Apps permitidos"
      description="Aplicativos que podem consumir identidade e escopo do Core."
    >
      <PageHeader
        eyebrow="Permissoes"
        title="Apps permitidos por usuario"
        description="Cada app deve ter namespace, status e vinculo explicito com usuarios autorizados. O Core vira a fonte para login e menu entre sistemas."
        actions={
          <button className="button">
            <Plus size={16} />
            Novo app
          </button>
        }
      />

      <div className="grid cols-3">
        {apps.map((app) => (
          <Panel key={app.id} title={app.nome} note={app.namespace}>
            <div className="metric">{app.usuarios}</div>
            <p className="item-meta">{app.descricao}</p>
            <div className="stack-lg">
              <StatusBadge tone={app.status === "Ativo" ? "green" : "blue"}>
                {app.status}
              </StatusBadge>
            </div>
          </Panel>
        ))}
      </div>

      <div className="stack-lg">
        <InlineNotice
          title="Regra estrutural"
          description="Um usuario sem app permitido nao deve aparecer no menu nem conseguir abrir rotas protegidas desse app."
          tone="blue"
        />
      </div>
    </CoreShell>
  );
}
