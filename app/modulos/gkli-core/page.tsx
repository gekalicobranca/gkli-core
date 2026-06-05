import Link from "next/link";
import { ArrowRight, CheckCircle2, KeyRound, Network, ShieldCheck } from "lucide-react";
import { platformApps } from "@/features/gkli-core/mock-data";
import { CoreShell, PageHeader, StatusBadge } from "@/features/gkli-core/ui";

export default function CoreHubPage() {
  return (
    <CoreShell
      activeHref="/modulos/gkli-core"
      title="Hub de Apps"
      description="Acesso central aos aplicativos GKLI."
    >
      <PageHeader
        eyebrow="Plataforma"
        title="Apps da Gekali"
        description="Core, COB, Flex e Colab reunidos em um ponto único para acesso, identidade, perfil e escopo operacional."
      />

      <section className="hub-hero">
        <div>
          <div className="hub-kicker">GKLI Suite</div>
          <h2 className="hub-title">Selecione o sistema desejado para acessar.</h2>
        </div>
        <div className="hub-summary-grid" aria-label="Resumo da plataforma">
          {[
            ["4 apps", "Core, COB, Flex e Colab", Network],
            ["Perfil central", "Acesso ativo no Core", ShieldCheck],
            ["Login único", "Base de identidade centralizada", KeyRound]
          ].map(([title, description, Icon]) => {
            const TypedIcon = Icon as typeof Network;

            return (
              <div className="hub-summary" key={title as string}>
                <span className="hub-summary-icon">
                  <TypedIcon size={18} />
                </span>
                <span>
                  <strong>{title as string}</strong>
                  <small>{description as string}</small>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="section-heading">
        <h2>Sistemas disponíveis</h2>
        <p>Escolha o aplicativo conforme a rotina que deseja executar.</p>
      </div>

      <div className="app-card-grid">
        {platformApps.map((app) => {
          const hasLink = app.href !== "#";

          return (
            <article className="app-card" key={app.id}>
              <div className="app-card-body">
                <div>
                  <div className="app-card-title-row">
                    <span className="app-card-icon">
                      <img alt="" src="/gkit-icon.png" />
                    </span>
                    <h3>{app.nome}</h3>
                  </div>
                  <p>{app.descricao}</p>
                  <span className="app-area">{app.area}</span>
                </div>
                <div className="app-card-footer">
                  <span className="status-inline">
                    <CheckCircle2 size={14} />
                    {app.status}
                  </span>
                  {hasLink ? (
                    <Link className="button secondary app-access-button" href={app.href}>
                      Acessar
                      <ArrowRight size={15} />
                    </Link>
                  ) : (
                    <button className="button secondary app-access-button" disabled>
                      Acessar
                      <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              </div>
              {!hasLink ? <StatusBadge tone="yellow">Link pendente</StatusBadge> : null}
            </article>
          );
        })}
      </div>
    </CoreShell>
  );
}
