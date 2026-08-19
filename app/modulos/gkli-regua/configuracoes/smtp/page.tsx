import { Mail, Save, Send, Server, ShieldCheck } from 'lucide-react'
import { ReguaShell } from '@/features/gkli-regua/components'
import { requireReguaContext } from '@/features/gkli-regua/queries'
import { getSmtpStatus } from '@/features/gkli-regua/smtp'
import { salvarSmtpRegua, testarSmtpRegua } from '@/features/gkli-regua/smtp-actions'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

type Params = Record<string, string | string[] | undefined>
function one(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] ?? '' : value ?? '' }

export default async function ReguaSmtpPage({ searchParams }: { searchParams?: Promise<Params> }) {
  const context = await requireReguaContext('/modulos/gkli-regua/configuracoes/smtp')
  const params = await searchParams
  const carteiraId = one(params?.carteira)
  const { data: carteiras } = await (createSupabaseAdminClient() as any).schema('gkli_regua').from('carteiras').select('id,codigo,nome').eq('status', 'ativo').order('nome')
  const status = await getSmtpStatus(carteiraId || null)
  const editing = status.source === 'carteira' || (status.source === 'global' && !carteiraId)
  const resultType = one(params?.smtp); const message = one(params?.msg)
  const selected = (carteiras ?? []).find((item: any) => item.id === carteiraId)
  const label = status.configured && status.active ? 'Pronto' : status.configured ? 'Inativo' : 'Pendente'

  return (
    <ReguaShell usuario={context.usuario}>
      {resultType ? <div className={`suite-empty-block ${resultType === 'error' ? 'danger' : 'success'}`}>{message || (resultType === 'error' ? 'Não foi possível concluir.' : 'Operação concluída.')}</div> : null}
      {status.unavailableReason ? <div className="suite-empty-block warning">Configuração no banco indisponível: {status.unavailableReason}</div> : null}

      <section className="suite-panel regua-smtp-selector cob-filter-card">
        <form method="get" className="regua-form regua-smtp-scope-form">
          <label><span>Carteira de envio</span><select name="carteira" defaultValue={carteiraId}><option value="">Fallback global do app</option>{(carteiras ?? []).map((item: any) => <option key={item.id} value={item.id}>{item.codigo} · {item.nome}</option>)}</select><small>A régua usa primeiro o SMTP da carteira. Se não houver conta ativa, usa o fallback global.</small></label>
          <button className="button secondary">Carregar configuração</button>
        </form>
        <p>Configurando: <strong>{selected?.nome ?? 'Fallback global do app'}</strong>{carteiraId && status.source === 'global' ? ' · esta carteira usa o fallback global' : ''}</p>
      </section>

      <section className="regua-smtp-status-grid">
        <article className="metric-card"><span className="cob-status-icon"><ShieldCheck size={18} /></span><span className="metric-label">Status</span><strong className="metric-value">{label}</strong><span className="metric-hint">{status.configured ? 'Servidor e remetente informados.' : 'Preencha a configuração.'}</span></article>
        <article className="metric-card"><span className="cob-status-icon"><Server size={18} /></span><span className="metric-label">Origem</span><strong className="metric-value">{status.source === 'environment' ? 'Ambiente' : status.source === 'carteira' ? 'Carteira' : status.source === 'global' ? 'Banco de dados' : 'Não configurado'}</strong><span className="metric-hint">Configuração ativa para o escopo.</span></article>
        <article className="metric-card"><span className="cob-status-icon"><Mail size={18} /></span><span className="metric-label">Servidor</span><strong className="metric-value regua-smtp-host">{status.host || '—'}</strong><span className="metric-hint">{status.port} · {status.secure ? 'SSL direto' : status.starttls ? 'STARTTLS' : 'sem TLS'}</span></article>
      </section>

      <section className="regua-smtp-layout">
        <form action={salvarSmtpRegua} className="suite-panel regua-smtp-config-form">
          <input type="hidden" name="carteira_id" value={carteiraId || 'global'} />
          <div className="suite-panel-heading"><div><p className="suite-section-kicker">SMTP</p><h2>Configuração de envio</h2><p>Use os dados do provedor de e-mail. A senha fica armazenada no servidor e não é exibida depois de salva.</p></div><button className="button"><Save size={16} />Salvar SMTP</button></div>
          <div className="regua-smtp-fields">
            <label><span>Servidor SMTP</span><input name="host" required defaultValue={editing ? status.host ?? '' : ''} placeholder="smtp.office365.com" /></label>
            <label><span>Porta</span><input name="porta" type="number" min="1" max="65535" required defaultValue={editing ? status.port : 587} /></label>
            <label><span>Usuário</span><input name="usuario" defaultValue={editing ? status.user ?? '' : ''} placeholder="usuario@gekali.com.br" /></label>
            <label><span>Senha</span><input name="senha" type="password" placeholder={status.hasPassword ? 'Senha já cadastrada' : 'Senha do SMTP'} /><small>{status.hasPassword ? 'Deixe em branco para manter a senha atual.' : 'Armazenada somente de forma criptografada.'}</small></label>
            <label><span>Remetente</span><input name="remetente" type="email" required defaultValue={editing ? status.from ?? '' : ''} /></label>
            <label><span>Responder para</span><input name="reply_to" type="email" defaultValue={editing ? status.replyTo ?? '' : ''} /></label>
            <label><span>Domínio EHLO</span><input name="ehlo_domain" required defaultValue={editing ? status.ehloDomain : 'gekali.com.br'} /></label>
          </div>
          <div className="regua-smtp-toggles">
            <label><input type="checkbox" name="ativo" defaultChecked={editing ? status.active : false} /><span><strong>Ativar envio por SMTP</strong><small>Lotes e testes podem usar esta configuração.</small></span></label>
            <label><input type="checkbox" name="secure" defaultChecked={editing ? status.secure : false} /><span><strong>SSL direto</strong><small>Normalmente usado na porta 465.</small></span></label>
            <label><input type="checkbox" name="starttls" defaultChecked={editing ? status.starttls : true} /><span><strong>STARTTLS</strong><small>Normalmente usado na porta 587.</small></span></label>
          </div>
        </form>

        <form action={testarSmtpRegua} className="suite-panel regua-smtp-test-form">
          <input type="hidden" name="carteira_id" value={carteiraId || 'global'} />
          <p className="suite-section-kicker">Teste</p><h2>Enviar e-mail de teste</h2><p>Usa a configuração ativa da carteira ou o fallback global.</p>
          <label><span>Destinatário</span><input name="destinatario_teste" type="email" required placeholder="email@dominio.com.br" /></label>
          <button className="button" disabled={!status.configured || !status.active}><Send size={16} />Enviar teste</button>
          <div className="regua-smtp-summary"><strong>Resumo atual</strong><span>Remetente: {status.from || '—'}</span><span>Usuário: {status.user || '—'}</span><span>Senha: {status.hasPassword ? 'cadastrada' : 'não cadastrada'}</span></div>
        </form>
      </section>
    </ReguaShell>
  )
}
