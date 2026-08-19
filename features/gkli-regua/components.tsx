import type { ReactNode } from 'react'
import { ModuleShell, type ModuleNavGroup } from '@/features/shared/module-shell'
import type { PlatformUsuario } from '@/lib/auth/platform'
import { criarCarteiraRegua, criarClienteRegua, criarTemplateRegua, gerarLoteRegua, importarBaseRegua } from './actions'
import type { ReguaData } from './types'

const navGroups: ModuleNavGroup[] = [
  { href: '/modulos/gkli-regua', title: 'Cockpit' },
  { title: 'Operação', items: [
    { href: '/modulos/gkli-regua#importacoes', label: 'Importações' },
    { href: '/modulos/gkli-regua#lotes', label: 'Lotes de e-mail' },
  ] },
  { title: 'Cadastros', items: [
    { href: '/modulos/gkli-regua#carteiras', label: 'Carteiras' },
    { href: '/modulos/gkli-regua#clientes', label: 'Clientes' },
    { href: '/modulos/gkli-regua#templates', label: 'Templates' },
  ] },
]

export function ReguaShell({ children, usuario }: { children: ReactNode; usuario: PlatformUsuario }) {
  return (
    <ModuleShell
      activeHref="/modulos/gkli-regua"
      brand="Operação transitória de mensageria"
      description="Importe a base atual, prepare lotes auditáveis e faça a transição segura para o GKLI Cob."
      eyebrow="GKLI RÉGUA"
      navGroups={navGroups}
      product="GKLI Régua"
      title="Régua de transição"
      usuario={usuario}
      variantClassName="gkli-regua-shell"
    >{children}</ModuleShell>
  )
}

function carteiraNome(data: ReguaData, id: string) { return data.carteiras.find((item) => item.id === id)?.nome ?? 'Carteira' }
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
        <form action={importarBaseRegua} className="regua-form regua-form-import">
          <label><span>Carteira</span><select name="carteira_id" required disabled={!canWrite}><option value="">Selecione</option>{data.carteiras.filter((item) => item.status === 'ativo').map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label>
          <label><span>Arquivo</span><input accept=".xlsx,.xls,.csv" name="arquivo" type="file" required disabled={!canWrite} /></label>
          <button className="button" type="submit" disabled={!canWrite || !data.carteiras.length}>Importar e validar</button>
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
