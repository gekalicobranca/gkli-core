import { ShieldPlus } from "lucide-react";
import { createAccessTypeAction } from "@/features/gkli-core/actions";
import { corePermissions } from "@/features/gkli-core/module-config";
import { getCoreData } from "@/features/gkli-core/repository";
import { CoreShell, PageHeader, Panel, StatusBadge } from "@/features/gkli-core/ui";

export const dynamic = "force-dynamic";

export default async function AcessosPage() {
  const { accessTypes } = await getCoreData();

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

      <div className="stack-lg">
        <Panel title="Novo tipo de acesso" note="Permissoes iniciais">
          <form action={createAccessTypeAction} className="form-grid">
            <label>
              Nome
              <input name="nome" placeholder="Operacao avancada" required />
            </label>
            <label>
              Nivel
              <select name="nivel" defaultValue="carteira">
                <option value="carteira">Carteira</option>
                <option value="global">Global</option>
              </select>
            </label>
            <label className="span-2">
              Descricao
              <input name="descricao" placeholder="Resumo do que este perfil pode operar" />
            </label>
            <fieldset>
              <legend>Permissoes do Core</legend>
              <div className="check-grid">
                {corePermissions.map((permission) => (
                  <label className="check-row" key={permission}>
                    <input name="permissions" type="checkbox" value={permission} />
                    {permission}
                  </label>
                ))}
              </div>
            </fieldset>
            <button className="button" type="submit">
              <ShieldPlus size={16} />
              Salvar tipo
            </button>
          </form>
        </Panel>
      </div>
    </CoreShell>
  );
}
