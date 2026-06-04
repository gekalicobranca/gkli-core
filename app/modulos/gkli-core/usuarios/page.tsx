import { UserPlus } from "lucide-react";
import { users } from "@/features/gkli-core/mock-data";
import { CoreShell, PageHeader, Panel, StatusBadge } from "@/features/gkli-core/ui";

export default function UsuariosPage() {
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

      <Panel title="Usuarios cadastrados" note="Base inicial">
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
            {users.map((user) => (
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
            ))}
          </tbody>
        </table>
      </Panel>
    </CoreShell>
  );
}
