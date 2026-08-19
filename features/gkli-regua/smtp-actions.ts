'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireWriteRegua } from './write-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { encryptSmtpPassword, sendSmtpEmail } from './smtp'

const PAGE = '/modulos/gkli-regua/configuracoes/smtp'
function value(form: FormData, key: string) { return String(form.get(key) ?? '').trim() }
function checked(form: FormData, key: string) { return form.get(key) === 'on' }
function carteira(form: FormData) { const id = value(form, 'carteira_id'); return id === 'global' ? null : id || null }
function result(type: 'saved' | 'tested' | 'error', message: string, carteiraId?: string | null): never {
  const params = new URLSearchParams({ smtp: type, msg: message.slice(0, 360) }); if (carteiraId) params.set('carteira', carteiraId)
  redirect(`${PAGE}?${params}`)
}

export async function salvarSmtpRegua(formData: FormData) {
  const context = await requireWriteRegua(PAGE)
  const carteiraId = carteira(formData)
  const host = value(formData, 'host'); const porta = Number(value(formData, 'porta') || 587)
  const usuario = value(formData, 'usuario') || null; const senha = value(formData, 'senha')
  const remetente = value(formData, 'remetente') || usuario; const replyTo = value(formData, 'reply_to') || null
  const secure = checked(formData, 'secure'); const starttls = !secure && checked(formData, 'starttls')
  if (!host) result('error', 'Informe o servidor SMTP.', carteiraId)
  if (!Number.isInteger(porta) || porta < 1 || porta > 65535) result('error', 'Informe uma porta válida.', carteiraId)
  if (!remetente || !remetente.includes('@')) result('error', 'Informe um remetente válido.', carteiraId)
  const db = createSupabaseAdminClient() as any
  let query = db.schema('gkli_regua').from('smtp_configuracoes').select('id,senha_encriptada')
  query = carteiraId ? query.eq('carteira_id', carteiraId) : query.is('carteira_id', null)
  const { data: atual, error: currentError } = await query.maybeSingle()
  if (currentError) result('error', currentError.message, carteiraId)
  let encrypted = atual?.senha_encriptada ?? null
  if (senha) {
    try { encrypted = encryptSmtpPassword(senha) } catch (error) { result('error', error instanceof Error ? error.message : 'Falha ao proteger a senha.', carteiraId) }
  }
  const payload = { carteira_id: carteiraId, ativo: checked(formData, 'ativo'), host, porta, usuario, senha_encriptada: encrypted, remetente, reply_to: replyTo, secure, starttls, ehlo_domain: value(formData, 'ehlo_domain') || 'gekali.com.br', atualizado_por: context.usuario.id, atualizado_em: new Date().toISOString() }
  const save = atual?.id ? db.schema('gkli_regua').from('smtp_configuracoes').update(payload).eq('id', atual.id) : db.schema('gkli_regua').from('smtp_configuracoes').insert(payload)
  const { error } = await save
  if (error) result('error', error.message, carteiraId)
  revalidatePath(PAGE); result('saved', 'Configuração SMTP salva.', carteiraId)
}

export async function testarSmtpRegua(formData: FormData) {
  await requireWriteRegua(PAGE)
  const carteiraId = carteira(formData); const destinatario = value(formData, 'destinatario_teste')
  if (!destinatario.includes('@')) result('error', 'Informe um destinatário válido.', carteiraId)
  try {
    await sendSmtpEmail({ to: destinatario, subject: 'Teste SMTP · GKLI Régua', text: `Teste SMTP enviado pelo GKLI Régua em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}.` }, carteiraId)
  } catch (error) { result('error', `Teste falhou: ${error instanceof Error ? error.message : String(error)}`, carteiraId) }
  revalidatePath(PAGE); result('tested', `E-mail de teste enviado para ${destinatario}.`, carteiraId)
}
