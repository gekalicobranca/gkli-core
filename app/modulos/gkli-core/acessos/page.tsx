import { ShieldPlus } from "lucide-react";
import { accessTypes } from "@/features/gkli-core/mock-data";
import { corePermissions } from "@/features/gkli-core/module-config";
import { CoreShell, PageHeader, Panel, StatusBadge } from "@/features/gkli-core/ui";

export default function AcessosPage() {
  return (
    <CoreShell
      activeHref="/modulos/gkli-core/acessos"
      title="Tipos de acesso"
      description="Perfis base para governar permissao por usuario."
    >
      <PageHeader
        eyebrow="Identidade"
        title="Tipos de acesso"
        description="O tipo de acesso define o nivel de governo do usuario. O escopo fino continua sendo aplicado pelos apps permitidos e pelas carteiras vinculadas."
        actions={
          <button className="button">
            <ShieldPlus size={16} />
            Novo tipo
          </button>
        }
      />

      <div className="grid cols-2">
        <Panel title="Perfis base" note="Core">
          <div className="list">
            {accessTypes.map((type) => (
              <div className="list-item" key={type.id}>
                <div>
                  <div className="item-title">{type.nome}</div>
                  <div className="item-meta">{type.descricao}</div>
                </div>
                <StatusBadge>{type.nivel}</StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Catalogo de permissoes" note="Namespace gkli_core">
          <div className="list">
            {corePermissions.map((permission) => (
              <div className="list-item" key={permission}>
                <div>
                  <div className="item-title">{permission}</div>
                  <div className="item-meta">Permissao estrutural do Core.</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </CoreShell>
  );
}
