import { UserPlus } from "lucide-react";
import {
  createUserAction,
  deactivateUserAction,
  updateUserAction
} from "@/features/gkli-core/actions";
import { getCoreData } from "@/features/gkli-core/repository";
import { CoreShell, InlineNotice, PageHeader, Panel, StatusBadge } from "@/features/gkli-core/ui";

export const dynamic = "force-dynamic";

type UsuariosPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function UsuariosPage({ searchParams }: UsuariosPageProps) {
  const params = await searchParams;
  const { accessTypes, apps, users, wallets } = await getCoreData();

  return (
    <CoreShell
      activeHref="/modulos/gkli-core/usuarios"
      title="Usuarios"
      description="Cadastro central de identidade e vinculos operacionais."
    >
      <PageHeader
        eyebrow="Identidade"
        title="Cadastro de usuarios"
        description="Cada usuario nasce no Core e recebe tipo de acesso, apps permitidos e carteiras vinculadas antes de operar COB, Flex ou outros modulos."
        actions={
          <button className="button">
            <UserPlus size={16} />
            Novo usuario
          </button>
        }
      />

      {params?.error ? (
        <div className="stack-lg">
          <InlineNotice title="Nao foi possivel salvar" description={params.error} tone="red" />
        </div>
      ) : null}

      {params?.success ? (
        <div className="stack-lg">
          <InlineNotice title="Operacao concluida" description={params.success} tone="green" />
        </div>
      ) : null}

      <Panel title="Usuarios cadastrados" note="Base operacional">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Apps</th>
              <th>Carteiras</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6}>Nenhum usuario cadastrado ainda.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.nome}</td>
                  <td>{user.email}</td>
                  <td>{user.tipoAcesso}</td>
                  <td>
                    <div className="split-list">
                      {user.apps.map((app) => (
                        <StatusBadge key={app}>{app}</StatusBadge>
                      ))}
                    </div>
                  </td>
                  <td>{user.carteiras.length}</td>
                  <td>
                    <StatusBadge tone={user.status === "Ativo" ? "green" : "yellow"}>
                      {user.status}
                    </StatusBadge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Panel>

      <div className="grid cols-2 stack-lg">
        <Panel title="Novo usuario" note="Cadastro">
          <form action={createUserAction} className="form-grid">
            <label>
              Nome
              <input name="nome" placeholder="Nome completo" required />
            </label>
            <label>
              Email
              <input name="email" placeholder="usuario@gkli.com.br" required type="email" />
            </label>
            <label>
              Tipo de acesso
              <select name="tipo_acesso_id">
                <option value="">Sem tipo</option>
                {accessTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.nome}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select name="status" defaultValue="ativo">
                <option value="ativo">Ativo</option>
                <option value="pendente">Pendente</option>
                <option value="inativo">Inativo</option>
              </select>
            </label>

            <fieldset>
              <legend>Apps permitidos</legend>
              <div className="check-grid">
                {apps.map((app) => (
                  <label className="check-row" key={app.id}>
                    <input name="app_ids" type="checkbox" value={app.id} />
                    {app.nome}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Carteiras</legend>
              <div className="check-grid">
                {wallets.length === 0 ? (
                  <span className="item-meta">Cadastre carteiras antes de vincular.</span>
                ) : (
                  wallets.map((wallet) => (
                    <label className="check-row" key={wallet.id}>
                      <input name="carteira_ids" type="checkbox" value={wallet.id} />
                      {wallet.nome}
                    </label>
                  ))
                )}
              </div>
            </fieldset>

            <button className="button" type="submit">
              <UserPlus size={16} />
              Salvar usuario
            </button>
          </form>
        </Panel>

        <Panel title="Editar acessos" note="Usuarios existentes">
          <div className="details-list">
            {users.length === 0 ? (
              <p className="item-meta">Nenhum usuario cadastrado ainda.</p>
            ) : (
              users.map((user) => (
                <details className="admin-details" key={user.id}>
                  <summary>
                    <span>{user.nome}</span>
                    <StatusBadge tone={user.status === "Ativo" ? "green" : "yellow"}>
                      {user.status}
                    </StatusBadge>
                  </summary>
                  <form action={updateUserAction} className="form-grid">
                    <input name="id" type="hidden" value={user.id} />
                    <label>
                      Nome
                      <input name="nome" required defaultValue={user.nome} />
                    </label>
                    <label>
                      Email
                      <input name="email" required type="email" defaultValue={user.email} />
                    </label>
                    <label>
                      Tipo de acesso
                      <select name="tipo_acesso_id" defaultValue={user.tipoAcessoId ?? ""}>
                        <option value="">Sem tipo</option>
                        {accessTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.nome}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Status
                      <select name="status" defaultValue={user.status.toLowerCase()}>
                        <option value="ativo">Ativo</option>
                        <option value="pendente">Pendente</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </label>

                    <fieldset>
                      <legend>Apps permitidos</legend>
                      <div className="check-grid">
                        {apps.map((app) => (
                          <label className="check-row" key={app.id}>
                            <input
                              defaultChecked={user.appIds.includes(app.id)}
                              name="app_ids"
                              type="checkbox"
                              value={app.id}
                            />
                            {app.nome}
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend>Carteiras</legend>
                      <div className="check-grid">
                        {wallets.length === 0 ? (
                          <span className="item-meta">Nenhuma carteira cadastrada.</span>
                        ) : (
                          wallets.map((wallet) => (
                            <label className="check-row" key={wallet.id}>
                              <input
                                defaultChecked={user.carteiraIds.includes(wallet.id)}
                                name="carteira_ids"
                                type="checkbox"
                                value={wallet.id}
                              />
                              {wallet.nome}
                            </label>
                          ))
                        )}
                      </div>
                    </fieldset>

                    <button className="button" type="submit">
                      Salvar alteracoes
                    </button>
                  </form>
                  <form action={deactivateUserAction} className="inline-form">
                    <input name="id" type="hidden" value={user.id} />
                    <button className="button secondary" type="submit">
                      Desativar usuario
                    </button>
                  </form>
                </details>
              ))
            )}
          </div>
        </Panel>
      </div>
    </CoreShell>
  );
}
