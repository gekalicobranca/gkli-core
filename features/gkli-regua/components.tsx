import Link from 'next/link'
import type { ReactNode } from 'react'
import { FileText, Gauge, Layers, Mail, Settings, Upload, UserRound, Users } from 'lucide-react'
import { BrandLogo } from '@/features/shared/brand-logo'
import type { PlatformUsuario } from '@/lib/auth/platform'
import { criarCarteiraRegua, criarClienteRegua, criarTemplateRegua, gerarLoteRegua, importarBaseRegua, importarCredoresRegua } from './actions'
import type { ReguaData } from './types'

export function ReguaShell({ children, usuario }: { children: ReactNode; usuario: PlatformUsuario }) {
  return (
    <main className="gkli-regua-shell cob-shell">
      <aside className="cob-sidebar">
        <div className="cob-sidebar-brand"><BrandLogo className="cob-sidebar-logo" label="GKLI Régua" /><div><span>GKLI</span><strong>Régua</strong></div></div>
        <nav aria-label="Navegação GKLI Régua">
          <Link className="cob-featured-link" href="/modulos/gkli-regua"><span><Gauge size={16} /></span><div><strong>Cockpit operacional</strong><small>Visão geral da régua</small></div></Link>
          <section><p>OPERAÇÃO</p><Link href="/modulos/gkli-regua#importacoes"><span><Upload size={16} /></span>Importações</Link><Link href="/modulos/gkli-regua#lotes"><span><Layers size={16} /></span>Lotes de e-mail</Link></section>
          <section><p>CADASTROS</p><Link href="/modulos/gkli-regua#carteiras"><span><FileText size={16} /></span>Carteiras</Link><Link href="/modulos/gkli-regua#clientes"><span><Users size={16} /></span>Clientes</Link><Link href="/modulos/gkli-regua#templates"><span><Mail size={16} /></span>Templates</Link></section>
          <section><p>CONFIGURAÇÕES</p><Link href="/modulos/gkli-regua/configuracoes/smtp"><span><Settings size={16} /></span>Integração SMTP</Link></section>
        </nav>
        <div className="cob-sidebar-user"><span><UserRound size={16} /></span><div><strong>{usuario.nome}</strong><small>{usuario.email}</small></div><Link href="/logout">Sair</Link></div>
      </aside>
      <section className="cob-main">
        <header className="cob-topbar"><span>GKLI Régua</span><div className="cob-topbar-actions"><Link href="/modulos/gkli-regua/configuracoes/smtp"><Settings size={16} />Configurações</Link></div></header>
        <div className="cob-content">
          <section className="cob-page-hero"><div><span>OPERAÇÃO TRANSITÓRIA</span><h1>Régua de transição</h1><p>Importe a base atual, prepare lotes auditáveis e faça a transição segura para o GKLI Cob.</p></div><span className="cob-hero-badge"><Mail size={16} />Mensageria</span></section>
          <div className="module-page-content">{children}</div>
        </div>
      </section>
    </main>
  )
}

function carteiraNome(data: ReguaData, id: string | null) { return id ? data.carteiras.find((item) => item.id === id)?.nome ?? 'Carteira' : 'Múltiplas carteiras' }
function templateNome(data: ReguaData, id: string) { return data.templates.find((item) => item.id === id)?.nome ?? 'Template' }
function date(value: string) { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) }

export function ReguaPage({ data, canWrite }: { data: ReguaData; canWrite: boolean }) {
  return (
    <>
      {!data.databaseReady ? <div className="suite-empty-block warning">{data.errorMessage}</div> : null}

      <section className="suite-kpi-grid compact">
        <article className="metric-card"><span className="metric-label">Carteiras próprias</span><strong className="metric-value">{data.resumo.carteiras}</strong><span className="metric-hint">independentes do Cob</span></article>
        <article className="metric-card"><span className="metric-label">Clientes ativos</span><strong className="metric-value">{data.resumo.clientes}</strong><span className="metric-hint">base desta régua</span></article>
        <article className="metric-card"><span className="metric-label">Registros importados</span><strong className="metric-value">{data.resumo.importados}</strong><span className="metric-hint">aptos acumulados</span></article>
        <article className="metric-card"><span className="metric-label">E-mails preparados</span><strong className="metric-value">{data.resumo.preparados}</strong><span className="metric-hint">em lotes auditáveis</span></article>
      </section>

      <section className="suite-panel" id="importacoes">
        <div className="suite-panel-heading"><div><p className="suite-section-kicker">Entrada controlada</p><h2>Importar base da régua atual</h2><p>Use XLSX, XLS ou CSV. Colunas reconhecidas: nome/cliente, e-mail, documento, valor, vencimento e referência.</p></div></div>
        <form action={importarCredoresRegua} className="regua-form regua-form-reference">
          <label><span>1. Referência de credores</span><input accept=".csv,.xlsx,.xls" name="arquivo_referencia" type="file" required disabled={!canWrite} /></label>
          <button className="button secondary" type="submit" disabled={!canWrite}>Atualizar códigos e carteiras</button>
        </form>
        <form action={importarBaseRegua} className="regua-form regua-form-import">
          <label><span>2. Planilha de carga</span><input accept=".xlsx,.xls,.csv" name="arquivo" type="file" required disabled={!canWrite} /></label>
          <button className="button" type="submit" disabled={!canWrite || !data.carteiras.length}>Cruzar códigos e importar</button>
        </form>
        <div className="suite-table-list compact">
          {data.importacoes.map((item) => <article key={item.id}><div><h3>{item.arquivo_nome}</h3><p>{carteiraNome(data, item.carteira_id)} · {date(item.created_at)}</p></div><span className="suite-pill success">{item.status}</span><strong>{item.linhas_validas} aptos</strong><small>{item.linhas_invalidas} inválidos</small></article>)}
          {!data.importacoes.length ? <div className="suite-empty-block">Nenhuma importação realizada.</div> : null}
        </div>
      </section>

      <section className="suite-panel" id="lotes">
        <div className="suite-panel-heading"><div><p className="suite-section-kicker">Mensageria</p><h2>Gerar lote de e-mails</h2><p>O lote congela assunto, conteúdo e destinatário para revisão e envio posterior.</p></div></div>
        <form action={gerarLoteRegua} className="regua-form regua-form-lote">
          <label><span>Nome do lote</span><input name="nome" placeholder="Ex.: Régua agosto · Carteira Centro" required disabled={!canWrite} /></label>
          <label><span>Carteira</span><select name="carteira_id" required disabled={!canWrite}><option value="">Selecione</option>{data.carteiras.filter((item) => item.status === 'ativo').map((item) => <option key={item.id} value={item.id}>{item.codigo} · {item.nome}</option>)}</select></label>
          <label><span>Importação</span><select name="importacao_id" required disabled={!canWrite}><option value="">Selecione</option>{data.importacoes.filter((item) => item.linhas_validas > 0).map((item) => <option key={item.id} value={item.id}>{item.arquivo_nome} · {item.linhas_validas} aptos</option>)}</select></label>
          <label><span>Template</span><select name="template_id" required disabled={!canWrite}><option value="">Selecione</option>{data.templates.filter((item) => item.status === 'ativo').map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label>
          <button className="button" type="submit" disabled={!canWrite || !data.importacoes.length || !data.templates.length}>Preparar lote</button>
        </form>
        <div className="suite-table-list compact">
          {data.lotes.map((item) => <article key={item.id}><div><h3>{item.nome}</h3><p>{carteiraNome(data, item.carteira_id)} · {templateNome(data, item.template_id)}</p></div><span className="suite-pill primary">{item.status.replace('_', ' ')}</span><strong>{item.total_itens} e-mails</strong><small>{date(item.created_at)}</small></article>)}
          {!data.lotes.length ? <div className="suite-empty-block">Nenhum lote preparado.</div> : null}
        </div>
      </section>

      <div className="regua-cadastros-grid">
        <section className="suite-panel" id="carteiras">
          <div className="suite-panel-heading"><div><h2>Carteiras</h2><p>Cadastro exclusivo deste app.</p></div></div>
          <form action={criarCarteiraRegua} className="regua-form stacked"><label><span>Nome</span><input name="nome" required disabled={!canWrite} /></label><label><span>Código opcional</span><input name="codigo" disabled={!canWrite} /></label><label><span>Descrição</span><input name="descricao" disabled={!canWrite} /></label><button className="button" disabled={!canWrite}>Criar carteira</button></form>
          <div className="regua-chip-list">{data.carteiras.map((item) => <span className="suite-pill primary" key={item.id}>{item.nome}</span>)}</div>
        </section>

        <section className="suite-panel" id="clientes">
          <div className="suite-panel-heading"><div><h2>Clientes</h2><p>Base própria, sem vínculo com o GKLI Cob.</p></div></div>
          <form action={criarClienteRegua} className="regua-form stacked"><label><span>Carteira</span><select name="carteira_id" required disabled={!canWrite}><option value="">Selecione</option>{data.carteiras.map((item) => <option value={item.id} key={item.id}>{item.nome}</option>)}</select></label><label><span>Nome</span><input name="nome" required disabled={!canWrite} /></label><label><span>E-mail</span><input name="email" type="email" disabled={!canWrite} /></label><label><span>CPF/CNPJ</span><input name="documento" disabled={!canWrite} /></label><button className="button" disabled={!canWrite}>Criar cliente</button></form>
          <p className="regua-record-count">{data.clientes.length} cliente(s) carregado(s)</p>
        </section>
      </div>

      <section className="suite-panel" id="templates">
        <div className="suite-panel-heading"><div><p className="suite-section-kicker">Conteúdo controlado</p><h2>Templates de e-mail</h2><p>Variáveis disponíveis: {'{{nome}}'}, {'{{documento}}'}, {'{{email}}'}, {'{{valor}}'}, {'{{vencimento}}'} e {'{{referencia}}'}.</p></div></div>
        <form action={criarTemplateRegua} className="regua-template-form">
          <div className="regua-form stacked"><label><span>Nome</span><input name="nome" required disabled={!canWrite} /></label><label><span>Assunto</span><input name="assunto" required placeholder="Comunicado para {{nome}}" disabled={!canWrite} /></label></div>
          <label><span>Conteúdo HTML</span><textarea name="corpo_html" rows={8} required placeholder="<p>Olá, {{nome}}...</p>" disabled={!canWrite} /></label>
          <label><span>Versão em texto</span><textarea name="corpo_texto" rows={8} placeholder="Olá, {{nome}}..." disabled={!canWrite} /></label>
          <button className="button" disabled={!canWrite}>Salvar template</button>
        </form>
        <div className="regua-chip-list">{data.templates.map((item) => <span className="suite-pill success" key={item.id}>{item.nome}</span>)}</div>
      </section>
    </>
  )
}
