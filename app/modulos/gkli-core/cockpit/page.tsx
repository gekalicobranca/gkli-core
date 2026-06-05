import { AlertTriangle, CheckCircle2, Clock3, Database } from "lucide-react";
import { cockpitTasks } from "@/features/gkli-core/mock-data";
import { getCoreData } from "@/features/gkli-core/repository";
import { CoreShell, PageHeader, Panel, StatusBadge } from "@/features/gkli-core/ui";

export const dynamic = "force-dynamic";

export default async function CoreCockpitPage() {
  const { accessTypes, apps, users, wallets } = await getCoreData();

  return (
    <CoreShell
      activeHref="/modulos/gkli-core/cockpit"
      title="Cockpit Core"
      description="Base central para identidade, acesso, apps permitidos e carteiras."
    >
      <PageHeader
        eyebrow="Governança"
        title="Controle estrutural da GKLI"
        description="O Core concentra os cadastros que os outros apps devem consultar: quem é o usuário, qual tipo de acesso ele possui, quais apps pode abrir e quais carteiras entram no seu escopo."
      />

      <div className="grid cols-3">
        <Panel title="Usuários" note="Diretório">
          <div className="metric">{users.length}</div>
          <p className="item-meta">Usuários cadastrados na base central.</p>
        </Panel>
        <Panel title="Apps governados" note="Permissão">
          <div className="metric">{apps.length}</div>
          <p className="item-meta">Aplicativos com namespace e acesso controlado.</p>
        </Panel>
        <Panel title="Carteiras" note="Escopo">
          <div className="metric">{wallets.length}</div>
          <p className="item-meta">Carteiras disponíveis para vínculo por usuário.</p>
        </Panel>
      </div>

      <div className="grid cols-2 stack-lg">
        <Panel title="Prioridades de implantação" note="Estrutura">
          <div className="list">
            {cockpitTasks.map((task) => (
              <div className="list-item" key={task.title}>
                <div>
                  <div className="item-title">{task.title}</div>
                  <div className="item-meta">{task.meta}</div>
                </div>
                <StatusBadge tone={task.tone as "blue" | "yellow" | "red"}>
                  {task.status}
                </StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Modelo atual" note="Visão lógica">
          <div className="list">
            {[
              ["Usuários", "Pessoa, email, status e identidade de login.", CheckCircle2],
              ["Tipos de acesso", "Perfil base que define permissões e nível.", Clock3],
              ["Apps permitidos", "Lista de apps autorizados por usuário.", Database],
              ["Carteiras", "Escopo operacional aplicado aos apps.", AlertTriangle]
            ].map(([title, meta, Icon]) => {
              const TypedIcon = Icon as typeof CheckCircle2;

              return (
                <div className="list-item" key={title as string}>
                  <div style={{ alignItems: "center", display: "flex", gap: 10 }}>
                    <TypedIcon color="#0f4c81" size={17} />
                    <div>
                      <div className="item-title">{title as string}</div>
                      <div className="item-meta">{meta as string}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="stack-lg">
        <Panel title="Tipos de acesso ativos" note="Perfis base">
          <table className="table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Nível</th>
                <th>Usuários</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {accessTypes.map((item) => (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>
                    <StatusBadge>{item.nivel}</StatusBadge>
                  </td>
                  <td>{item.usuarios}</td>
                  <td>{item.descricao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </CoreShell>
  );
}
