import Link from 'next/link'
import { BrandLogo } from '@/features/shared/brand-logo'
import { canAccess } from '@/lib/auth/permissions'
import { requirePlatformContext } from '@/lib/auth/platform'

export default async function PlataformaPage() {
  const { usuario, permissions, modules } = await requirePlatformContext()
  const hasAdmin = canAccess(permissions, 'admin.dashboard.read')
  const regua = modules.find((module) => module.codigo === 'gkli-regua')

  return (
    <main className="platform-page">
      <div className="platform-bg" />
      <div className="platform-wrap">
        <header className="platform-entry-header">
          <div className="platform-brand">
            <BrandLogo className="platform-brand-mark" label="GKLI Core" />
            <div><span className="platform-brand-name">GKLI Core</span><span>Gekali</span></div>
          </div>
          <div className="platform-user-panel">
            <span className="platform-user-status">Sessão ativa</span>
            <span className="platform-user-name">{usuario.nome}</span>
            <span>{usuario.email}</span>
            <a className="button secondary" href="/logout">Sair</a>
          </div>
        </header>

        <section className="platform-hero">
          <div>
            <p className="platform-kicker">Plataforma operacional</p>
            <h1>Painel de Sistemas<span>Gekali</span></h1>
            <div className="platform-rule" />
            <p className="platform-hero-copy">Administração central e operação da régua de comunicação.</p>
          </div>
        </section>

        <section className="platform-modules-section">
          <div className="platform-section-heading"><h2>Sistemas disponíveis</h2><p>Selecione o sistema desejado.</p></div>
          <div className="platform-modules-grid">
            {hasAdmin ? (
              <article className="platform-module-card">
                <div className="module-top-line" /><span className="module-status">Operacional</span>
                <img src="/GKLI_ico.png" alt="GKLI Core" className="module-app-mark" />
                <h3>GKLI Core</h3><p>Usuários, carteiras, perfis, módulos e auditoria.</p>
                <span className="module-area">Administração</span>
                <div className="module-footer"><Link className="module-action" href="/admin">Acessar</Link></div>
              </article>
            ) : null}
            {regua ? (
              <article className="platform-module-card">
                <div className="module-top-line" /><span className="module-status">Operacional</span>
                <img src="/GKLI_ico.png" alt="GKLI Régua" className="module-app-mark" />
                <h3>GKLI Régua</h3><p>Importações, templates e lotes de e-mail.</p>
                <span className="module-area">Mensageria</span>
                <div className="module-footer"><Link className="module-action" href="/modulos/gkli-regua">Acessar</Link></div>
              </article>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  )
}
