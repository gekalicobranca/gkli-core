import Link from 'next/link'
import { BrandLogo } from '@/features/shared/brand-logo'
import { canAccess } from '@/lib/auth/permissions'
import { requirePlatformContext } from '@/lib/auth/platform'
import type { PlatformModule } from '@/lib/auth/platform'

type IconName = 'core' | 'fix' | 'intr' | 'flex' | 'crm' | 'ciclo' | 'grid' | 'shield' | 'clock'

type ModuleCard = PlatformModule & {
  area: string
  icon: IconName
  external?: boolean
}

const adminModule: ModuleCard = {
  id: 'admin-core',
  codigo: 'core',
  nome: 'GKLI Core',
  descricao: 'Usuários, carteiras, perfis, módulos e auditoria.',
  status: 'ativo',
  href: '/admin',
  area: 'Administração',
  icon: 'core',
}

const moduleMeta: Record<string, Pick<ModuleCard, 'area' | 'icon'>> = {
  core: { area: 'Administração', icon: 'core' },
  ciclo: { area: 'Governança', icon: 'ciclo' },
  'gkli-ate': { area: 'Atendimento', icon: 'clock' },
  'gkli-dir': { area: 'Diretório', icon: 'grid' },
  'gkli-flex': { area: 'Financial Xperience', icon: 'flex' },
  'gkit-jur': { area: 'Juridico', icon: 'shield' },
  'gkli-new': { area: 'Novos negocios', icon: 'crm' },
  'gkli-regua': { area: 'Mensageria transitória', icon: 'clock' },
  'gkit-performa': { area: 'Performance', icon: 'clock' },
  colab: { area: 'Portal do colaborador', icon: 'grid' },
  painel: { area: 'Entrada unificada', icon: 'grid' },
  sind: { area: 'Portal do síndico', icon: 'ciclo' },
}

const moduleDisplay: Record<string, Pick<ModuleCard, 'nome' | 'descricao' | 'area' | 'icon'> & { href?: string }> = {
  ciclo: {
    nome: 'GKLI Ciclo',
    descricao: 'Lifecycle, onboarding, documentos e cadastro mestre.',
    area: 'Governança',
    icon: 'ciclo',
  },
  'gkli-new': {
    nome: 'GKLI New',
    descricao: 'CRM 2.0 enxuto: clientes, contatos, oportunidades e workflow.',
    area: 'Novos negocios',
    icon: 'crm',
    href: '/modulos/gkli-new',
  },
  'gkli-ate': {
    nome: 'GKLI ATE',
    descricao: 'Atendimentos consultivos do ASTREA com tarefas vinculadas.',
    area: 'Atendimento',
    icon: 'clock',
    href: '/modulos/gkli-ate',
  },
  'gkli-dir': {
    nome: 'GKLI DIR',
    descricao: 'Diretório de clientes com dados cadastrais vindos do Ciclo.',
    area: 'Diretório',
    icon: 'grid',
    href: '/modulos/gkli-dir',
  },
  'gkli-flex': {
    nome: 'GKLI Flex',
    descricao: 'Comissoes, contas a pagar, cadastros financeiros e auditoria mensal.',
    area: 'Financial Xperience',
    icon: 'flex',
    href: '/modulos/gkli-flex',
  },
  'gkli-regua': {
    nome: 'GKLI Régua',
    descricao: 'Importação, templates e lotes de e-mail para a transição ao GKLI Cob.',
    area: 'Mensageria transitória',
    icon: 'clock',
    href: '/modulos/gkli-regua',
  },
  'gkit-jur': {
    nome: 'GKLI Jur',
    descricao: 'Operacao juridica integrada: processos, prazos, agenda e documentos.',
    area: 'Juridico',
    icon: 'shield',
    href: '/modulos/gkit-jur/inbox',
  },
  'gkit-performa': {
    nome: 'GKLI Performa',
    descricao: 'Ranking de performance do time a partir da agenda operacional.',
    area: 'Performance',
    icon: 'clock',
    href: '/modulos/gkit-performa',
  },
  colab: {
    nome: 'GKLI Colab',
    descricao: 'Portal individual de colaboradores, pagamentos, comissões e documentos.',
    area: 'Portal do colaborador',
    icon: 'grid',
  },
}

function canonicalCode(codigo: string) {
  return codigo
}

function Icon({ name }: { name: IconName }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
  }

  if (name === 'crm') {
    return (
      <svg {...common}>
        <path d="M16 18.5c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
        <path d="M12 11.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
        <path d="M5 17.5c-.8-.9-1.2-1.9-1.2-3 0-1.8 1.1-3.3 2.7-3.9" />
        <path d="M19 17.5c.8-.9 1.2-1.9 1.2-3 0-1.8-1.1-3.3-2.7-3.9" />
      </svg>
    )
  }

  if (name === 'ciclo') {
    return (
      <svg {...common}>
        <path d="M7 7.5A6.8 6.8 0 0 1 18.5 10" />
        <path d="M18.5 6.5V10H15" />
        <path d="M17 16.5A6.8 6.8 0 0 1 5.5 14" />
        <path d="M5.5 17.5V14H9" />
      </svg>
    )
  }

  if (name === 'fix' || name === 'intr' || name === 'flex') {
    return (
      <svg {...common}>
        <path d="M4 19.5h16" />
        <path d="M7 16.5V11" />
        <path d="M12 16.5V7.5" />
        <path d="M17 16.5v-4" />
        <path d="M5.5 7.5 10 4l4 3 4.5-3.5" />
        <path d="M18.5 3.5V8h-4.5" />
      </svg>
    )
  }

  if (name === 'grid') {
    return (
      <svg {...common}>
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" />
      </svg>
    )
  }

  if (name === 'clock') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3.2 2" />
      </svg>
    )
  }

  if (name === 'shield' || name === 'core') {
    return (
      <svg {...common}>
        <path d="M12 3.5 19 6v5.5c0 4.4-2.7 7.4-7 9-4.3-1.6-7-4.6-7-9V6Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  )
}

function toModuleCard(modulo: PlatformModule): ModuleCard {
  const codigo = canonicalCode(modulo.codigo)
  const display = moduleDisplay[codigo]
  const meta = moduleMeta[codigo] ?? { area: 'Módulo integrado', icon: 'grid' as IconName }

  return {
    ...modulo,
    codigo,
    area: display?.area ?? meta.area,
    icon: display?.icon ?? meta.icon,
    nome: display?.nome ?? modulo.nome.replace(/^GKIT\b/, 'GKLI'),
    descricao: display?.descricao ?? modulo.descricao,
    href: display?.href ?? modulo.href,
  }
}

function uniqueModules(modules: PlatformModule[]) {
  const ordered = modules.map(toModuleCard)
  const byCode = new Map<string, ModuleCard>()

  for (const item of ordered) {
    const existing = byCode.get(item.codigo)
    if (!existing) {
      byCode.set(item.codigo, item)
      continue
    }

    if (item.codigo === 'fix' && existing.id !== 'fix') {
      byCode.set(item.codigo, item)
    }
  }

  return Array.from(byCode.values())
}

function ModuleTile({ module }: { module: ModuleCard }) {
  return (
    <article className={module.external ? 'platform-module-card external' : 'platform-module-card'}>
      <>
        <div className="module-top-line" />
        <span className={module.external ? 'module-status external' : 'module-status'}>
          {module.external ? 'Link externo' : 'Operacional'}
        </span>
        <img
          src="/GKLI_ico.png"
          alt={module.nome}
          className="module-app-mark"
        />
        <h3>{module.nome}</h3>
        <p>{module.descricao}</p>
        <span className="module-area">{module.area}</span>
        <div className="module-footer">
          {!module.external ? (
            <span className="module-manual" aria-disabled="true" title="Manual ainda não disponível">Manual</span>
          ) : null}
          {module.external ? (
            <a className="module-action" href={module.href} target="_blank" rel="noopener noreferrer">Acessar</a>
          ) : (
            <Link className="module-action" href={module.href}>Acessar</Link>
          )}
        </div>
      </>
    </article>
  )
}

export default async function PlataformaPage() {
  const { usuario, permissions, modules } = await requirePlatformContext()
  const hasAdmin = canAccess(permissions, 'admin.dashboard.read')
  const integratedModules = uniqueModules(modules).filter((module) => (
    !['cobranca', 'crm', 'din', 'fix', 'flex', 'intr'].includes(module.codigo)
  ))
  const visibleModules: ModuleCard[] = hasAdmin
    ? [adminModule, ...integratedModules]
    : [...integratedModules]
  return (
    <main className="platform-page">
      <style>{`
        .platform-page h1,
        .platform-page h2,
        .platform-page h3,
        .platform-page strong,
        .platform-page .platform-summary-value,
        .platform-page .module-area,
        .platform-page .module-action,
        .platform-page .module-status,
        .platform-page .platform-user-name,
        .platform-page .platform-brand-name,
        .platform-page .platform-environment-name {
          font-weight: 400 !important;
        }
      `}</style>
      <div className="platform-bg" />
      <div className="platform-wrap">
        <header className="platform-entry-header">
          <div className="platform-brand">
            <BrandLogo className="platform-brand-mark" label="GKLI Suite" />
            <div>
              <span className="platform-brand-name">GKLI Suite</span>
              <span>Gekali</span>
            </div>
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
            <h1>
              Painel de Sistemas
              <span>Gekali</span>
            </h1>
            <div className="platform-rule" />
            <p className="platform-hero-copy">
              Acesso centralizado aos modulos integrados da GKLI, com controle unico de usuarios, perfis e permissoes.
            </p>
          </div>
        </section>

        <section className="platform-modules-section">
          <div className="platform-section-heading">
            <h2>Sistemas disponíveis</h2>
            <p>Selecione o sistema desejado para acessar.</p>
          </div>

          <div className="platform-modules-grid">
            {visibleModules.map((module) => (
              <ModuleTile key={`${module.codigo}-${module.id}`} module={module} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

