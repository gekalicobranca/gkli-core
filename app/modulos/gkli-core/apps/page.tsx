import { Plus } from "lucide-react";
import { createAppAction } from "@/features/gkli-core/actions";
import { getCoreData } from "@/features/gkli-core/repository";
import { CoreShell, InlineNotice, PageHeader, Panel, StatusBadge } from "@/features/gkli-core/ui";

export const dynamic = "force-dynamic";

export default async function AppsPage() {
  const { apps } = await getCoreData();

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

      <div className="grid cols-2 stack-lg">
        <Panel title="Novo app" note="Namespace">
          <form action={createAppAction} className="form-grid">
            <label>
              Nome
              <input name="nome" placeholder="GKLI Novo App" required />
            </label>
            <label>
              Namespace
              <input name="namespace" placeholder="gkli_novo_app" required />
            </label>
            <label className="span-2">
              Descricao
              <input name="descricao" placeholder="Rotina operacional governada pelo Core" />
            </label>
            <label>
              Status
              <select name="status" defaultValue="ativo">
                <option value="ativo">Ativo</option>
                <option value="sistema">Sistema</option>
                <option value="inativo">Inativo</option>
              </select>
            </label>
            <button className="button" type="submit">
              <Plus size={16} />
              Salvar app
            </button>
          </form>
        </Panel>

        <InlineNotice
          title="Regra estrutural"
          description="Um usuario sem app permitido nao deve aparecer no menu nem conseguir abrir rotas protegidas desse app."
          tone="blue"
        />
      </div>
    </CoreShell>
  );
}
