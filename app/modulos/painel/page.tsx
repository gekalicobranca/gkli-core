import Link from 'next/link'
import { BrandLogo } from '@/features/shared/brand-logo'
import { canAccess } from '@/lib/auth/permissions'
import { requirePlatformContext } from '@/lib/auth/platform'

const moduleArea: Record<string, string> = {
  core: 'Administracao',
  'gkli-new': 'Novos negocios',
  'gkli-ate': 'Atendimento',
  'gkli-dir': 'Diretorio',
  'gkli-flex': 'Financial Xperience',
  ciclo: 'Governanca',
  colab: 'Portal do colaborador',
}

const shortcutGroups = [
  {
    codigo: 'core',
    title: 'Core',
    description: 'Administracao e seguranca central.',
    links: [
      { href: '/admin', label: 'Visao geral' },
      { href: '/admin/usuarios', label: 'Usuarios' },
      { href: '/admin/carteiras', label: 'Carteiras' },
      { href: '/admin/perfis', label: 'Perfis' },
      { href: '/admin/permissoes', label: 'Permissoes' },
      { href: '/admin/apps', label: 'Modulos' },
      { href: '/admin/auditoria', label: 'Auditoria' },
    ],
    pending: [],
  },
  {
    codigo: 'gkli-new',
    title: 'GKLI New',
    description: 'CRM 2.0 com clientes, contatos e workflow comercial.',
    links: [
      { href: '/modulos/gkli-new', label: 'Cockpit' },
      { href: '/modulos/gkli-new/clientes', label: 'Clientes' },
      { href: '/modulos/gkli-new/contatos', label: 'Contatos' },
      { href: '/modulos/gkli-new/oportunidades', label: 'Oportunidades' },
      { href: '/modulos/gkli-new/base/workflow', label: 'Workflow' },
      { href: '/modulos/gkli-new/tarefas', label: 'Tarefas' },
      { href: '/modulos/gkli-new/gestao', label: 'Gestao' },
    ],
    pending: [],
  },
  {
    codigo: 'gkli-ate',
    title: 'GKLI ATE',
    description: 'Atendimentos consultivos importados do ASTREA com tarefas vinculadas.',
    links: [
      { href: '/modulos/gkli-ate', label: 'Cockpit' },
      { href: '/modulos/gkli-ate/atendimentos', label: 'Atendimentos' },
      { href: '/modulos/gkli-ate/tarefas', label: 'Tarefas' },
      { href: '/modulos/gkli-ate/importacoes', label: 'Importacoes' },
      { href: '/modulos/gkli-ate/cadastros', label: 'Cadastros' },
    ],
    pending: [],
  },
  {
    codigo: 'gkli-dir',
    title: 'GKLI DIR',
    description: 'Diretorio de clientes com dados cadastrais vindos do Ciclo.',
    links: [
      { href: '/modulos/gkli-dir', label: 'Diretorio' },
    ],
    pending: [],
  },
  {
    codigo: 'gkli-flex',
    title: 'GKLI Flex',
    description: 'App financeiro independente para comissoes, contas a pagar, cadastros e auditoria.',
    links: [
      { href: '/modulos/gkli-flex', label: 'Abrir app' },
      { href: '/modulos/gkli-flex', label: 'Comissoes' },
      { href: '/modulos/gkli-flex', label: 'Contas a pagar' },
      { href: '/modulos/gkli-flex/colaboradores', label: 'Colaboradores' },
      { href: '/modulos/gkli-flex', label: 'Cadastros' },
      { href: '/modulos/gkli-flex', label: 'Auditoria' },
    ],
    pending: [],
  },
  {
    codigo: 'ciclo',
    title: 'Ciclo',
    description: 'Funcionalidades operacionais ja publicadas no app unificado.',
    links: [
      { href: '/modulos/ciclo', label: 'Cockpit' },
      { href: '/modulos/ciclo/clientes', label: 'Clientes' },
      { href: '/modulos/ciclo/administradoras', label: 'Administradoras' },
      { href: '/modulos/ciclo/documentos', label: 'Documentos' },
      { href: '/modulos/ciclo/alertas', label: 'Alertas' },
      { href: '/modulos/ciclo/onboarding', label: 'Onboarding' },
      { href: '/modulos/ciclo/regularidade', label: 'Regularidade' },
      { href: '/modulos/ciclo/timeline', label: 'Timeline' },
      { href: '/modulos/ciclo/ocorrencias', label: 'Ocorrencias' },
      { href: '/modulos/ciclo/dashboard', label: 'Gestao' },
    ],
    pending: [],
  },
  {
    codigo: 'colab',
    title: 'Colab',
    description: 'Portal individual sem menu lateral.',
    links: [
      { href: '/modulos/colab', label: 'Inicio' },
      { href: '/modulos/colab/pagamentos', label: 'Pagamentos' },
      { href: '/modulos/colab/comissoes', label: 'Comissoes' },
      { href: '/modulos/colab/beneficios', label: 'Beneficios' },
      { href: '/modulos/colab/documentos', label: 'Documentos' },
      { href: '/modulos/colab/perfil', label: 'Perfil' },
    ],
    pending: [],
  },
]

const executiveFlow = [
  { codigo: 'gkli-new', title: 'Conquistar 2.0', description: 'GKLI New registra clientes, contatos, oportunidades e workflow.' },
  { codigo: 'gkli-ate', title: 'Atender', description: 'GKLI ATE organiza atendimentos consultivos e tarefas operacionais.' },
  { codigo: 'gkli-dir', title: 'Consultar', description: 'GKLI DIR consulta o diretorio de clientes do Ciclo.' },
  { codigo: 'ciclo', title: 'Acompanhar', description: 'Ciclo assume onboarding e vida diaria do cliente.' },
  { codigo: 'gkli-flex', title: 'Comissionar', description: 'GKLI Flex calcula comissoes, contas a pagar e auditoria financeira.' },
  { codigo: 'colab', title: 'Publicar', description: 'Colab mostra pagamentos e comissoes para cada colaborador.' },
]

const legacyModuleCodes = new Set(['fix', 'intr', 'flex'])

export default async function PainelPage() {
  const context = await requirePlatformContext('/modulos/painel')
  const hasAdmin = canAccess(context.permissions, 'admin.dashboard.read')
  const availableCodes = new Set(context.modules.map((modulo) => modulo.codigo))

  for (const codigo of legacyModuleCodes) {
    availableCodes.delete(codigo)
  }

  const availableShortcutGroups = shortcutGroups.filter((group) => (
    group.codigo === 'core' ? hasAdmin : availableCodes.has(group.codigo)
  ))
  const modules = [
    ...(hasAdmin
      ? [{ codigo: 'core', nome: 'GKLI Core', descricao: 'Usuarios, perfis, carteiras e permissoes.', href: '/admin' }]
      : []),
    ...context.modules.filter((modulo) => !legacyModuleCodes.has(modulo.codigo)),
  ]
  const operationalModules = executiveFlow.filter((item) => availableCodes.has(item.codigo))
  const publishedShortcutCount = availableShortcutGroups.reduce((sum, group) => sum + group.links.length, 0)
  const pendingCount = availableShortcutGroups.reduce((sum, group) => sum + group.pending.length, 0)

  return (
    <main className="suite-page">
      <div className="platform-bg" />
      <div className="suite-wrap no-sidebar">
        <section className="suite-hero-card">
          <div className="suite-hero-main">
            <BrandLogo className="suite-brand-mark" label="Suite GKLI" />
            <div>
              <p className="platform-kicker">Painel</p>
              <h1>Suite GKLI</h1>
              <p>Entrada unificada para os modulos internos, com sessao unica e acesso determinado pelo Core.</p>
            </div>
          </div>
        </section>

        <section className="suite-executive-grid">
          <article className="suite-executive-card featured">
            <span>Fluxo operacional</span>
            <h2>{operationalModules.length} de {executiveFlow.length} modulos ativos</h2>
            <p>Leitura executiva da esteira: venda, onboarding, comissionamento e publicacao ao colaborador.</p>
          </article>
          <article className="suite-executive-card">
            <span>Atalhos publicados</span>
            <h2>{publishedShortcutCount}</h2>
            <p>Acessos principais visiveis conforme permissoes do Core.</p>
          </article>
          <article className="suite-executive-card">
            <span>Pontos de atencao</span>
            <h2>{pendingCount}</h2>
            <p>Itens mapeados para evolucao, sem bloquear o uso atual.</p>
          </article>
        </section>

        <section className="suite-flow-map">
          {executiveFlow.map((item) => {
            const active = availableCodes.has(item.codigo)
            return (
              <article className={active ? 'active' : ''} key={item.codigo}>
                <span>{moduleArea[item.codigo]}</span>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </article>
            )
          })}
        </section>

        <section className="suite-module-grid">
          {modules.map((modulo) => (
            <Link className="suite-module-card" href={modulo.href} key={`${modulo.codigo}-${modulo.href}`}>
              <span>{moduleArea[modulo.codigo] ?? 'Modulo GKLI'}</span>
              <h2>{modulo.nome}</h2>
              <p>{modulo.descricao}</p>
              <strong>Acessar</strong>
            </Link>
          ))}
        </section>

        <section className="suite-shortcut-grid">
          {availableShortcutGroups.map((group) => (
            <article className="suite-shortcut-card" key={group.title}>
              <div>
                <span>{group.title}</span>
                <h2>{group.description}</h2>
              </div>

              <div className="suite-shortcut-links">
                {group.links.map((link) => (
                  <Link href={link.href} key={link.href}>{link.label}</Link>
                ))}
              </div>

              {group.pending.length ? (
                <details>
                  <summary>{group.pending.length} itens pendentes de migracao</summary>
                  <p>{group.pending.join(', ')}</p>
                </details>
              ) : (
                <p className="suite-shortcut-complete">Atalhos principais publicados.</p>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}


