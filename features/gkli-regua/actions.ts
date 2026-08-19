'use server'

import { revalidatePath } from 'next/cache'
import * as XLSX from 'xlsx'
import { canAccess } from '@/lib/auth/permissions'
import { requireModuleAccess } from '@/lib/auth/platform'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

function admin() { return createSupabaseAdminClient() as any }
function text(formData: FormData, key: string) { return String(formData.get(key) ?? '').trim() }
function normalize(value: unknown) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}
function cleanDocument(value: unknown) { return String(value ?? '').replace(/\D/g, '') || null }
function validEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) }
function isoDate(value: unknown) {
  if (!value) return null
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10)
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (parsed) return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`
  }
  const raw = String(value).trim()
  const br = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (br) return `${br[3]}-${br[2].padStart(2, '0')}-${br[1].padStart(2, '0')}`
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null
}
function money(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const raw = String(value ?? '').trim().replace(/R\$\s?/i, '').replace(/\./g, '').replace(',', '.')
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}
function render(source: string, values: Record<string, string>) {
  return source.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key) => values[key] ?? '')
}

async function requireWrite() {
  const context = await requireModuleAccess('gkli-regua', '/modulos/gkli-regua')
  if (!canAccess(context.permissions, 'gkli_regua.write')) throw new Error('Você não tem permissão para operar o GKLI Régua.')
  return context
}

export async function criarCarteiraRegua(formData: FormData) {
  await requireWrite()
  const nome = text(formData, 'nome')
  const codigo = normalize(text(formData, 'codigo') || nome).replace(/_/g, '-').toUpperCase()
  if (!nome || !codigo) throw new Error('Informe o nome da carteira.')
  const { error } = await admin().schema('gkli_regua').from('carteiras').insert({ nome, codigo, descricao: text(formData, 'descricao') || null })
  if (error) throw new Error(error.message)
  revalidatePath('/modulos/gkli-regua')
}

export async function criarClienteRegua(formData: FormData) {
  await requireWrite()
  const carteiraId = text(formData, 'carteira_id')
  const nome = text(formData, 'nome')
  const email = text(formData, 'email').toLowerCase()
  if (!carteiraId || !nome) throw new Error('Informe carteira e cliente.')
  if (email && !validEmail(email)) throw new Error('Informe um e-mail válido.')
  const { error } = await admin().schema('gkli_regua').from('clientes').insert({
    carteira_id: carteiraId, nome, email: email || null, documento: cleanDocument(text(formData, 'documento')),
  })
  if (error) throw new Error(error.message)
  revalidatePath('/modulos/gkli-regua')
}

export async function criarTemplateRegua(formData: FormData) {
  await requireWrite()
  const nome = text(formData, 'nome')
  const assunto = text(formData, 'assunto')
  const corpoHtml = text(formData, 'corpo_html')
  if (!nome || !assunto || !corpoHtml) throw new Error('Informe nome, assunto e conteúdo do template.')
  const { error } = await admin().schema('gkli_regua').from('templates').insert({
    nome, assunto, corpo_html: corpoHtml, corpo_texto: text(formData, 'corpo_texto') || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/modulos/gkli-regua')
}

export async function importarBaseRegua(formData: FormData) {
  const context = await requireWrite()
  const carteiraId = text(formData, 'carteira_id')
  const arquivo = formData.get('arquivo')
  if (!carteiraId) throw new Error('Selecione a carteira da importação.')
  if (!(arquivo instanceof File) || !arquivo.size) throw new Error('Selecione um arquivo XLSX, XLS ou CSV.')

  const workbook = XLSX.read(await arquivo.arrayBuffer(), { type: 'array', cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
  const db = admin().schema('gkli_regua')
  const { data: importacao, error: importError } = await db.from('importacoes').insert({
    carteira_id: carteiraId, arquivo_nome: arquivo.name, status: 'processando', total_linhas: rows.length, criado_por: context.usuario.id,
  }).select('id').single()
  if (importError) throw new Error(importError.message)

  let validas = 0
  let invalidas = 0
  const itens: any[] = []
  for (let index = 0; index < rows.length; index += 1) {
    const raw = rows[index]
    const row = Object.fromEntries(Object.entries(raw).map(([key, value]) => [normalize(key), value]))
    const nome = String(row.nome ?? row.cliente ?? row.devedor ?? '').trim()
    const email = String(row.email ?? row.e_mail ?? '').trim().toLowerCase()
    const documento = cleanDocument(row.documento ?? row.cpf_cnpj ?? row.cpf ?? row.cnpj)
    const motivo = !nome ? 'Nome não informado' : !validEmail(email) ? 'E-mail ausente ou inválido' : null
    const status = motivo ? 'invalido' : 'apto'
    if (motivo) invalidas += 1; else validas += 1
    itens.push({
      importacao_id: importacao.id, linha: index + 2, nome: nome || `Linha ${index + 2}`, email: email || null, documento,
      valor: money(row.valor ?? row.valor_devido ?? row.saldo), vencimento: isoDate(row.vencimento ?? row.data_vencimento),
      referencia: String(row.referencia ?? row.contrato ?? row.unidade ?? '').trim() || null,
      dados: raw, status, motivo,
    })
  }

  if (itens.length) {
    const { error } = await db.from('importacao_itens').insert(itens)
    if (error) throw new Error(error.message)
  }
  const { error: finishError } = await db.from('importacoes').update({ status: 'processado', linhas_validas: validas, linhas_invalidas: invalidas }).eq('id', importacao.id)
  if (finishError) throw new Error(finishError.message)
  revalidatePath('/modulos/gkli-regua')
}

export async function gerarLoteRegua(formData: FormData) {
  const context = await requireWrite()
  const importacaoId = text(formData, 'importacao_id')
  const templateId = text(formData, 'template_id')
  const nome = text(formData, 'nome')
  if (!importacaoId || !templateId || !nome) throw new Error('Informe importação, template e nome do lote.')
  const db = admin().schema('gkli_regua')
  const [{ data: importacao, error: importError }, { data: template, error: templateError }, { data: itens, error: itemError }] = await Promise.all([
    db.from('importacoes').select('id,carteira_id').eq('id', importacaoId).single(),
    db.from('templates').select('id,assunto,corpo_html,corpo_texto').eq('id', templateId).eq('status', 'ativo').single(),
    db.from('importacao_itens').select('*').eq('importacao_id', importacaoId).eq('status', 'apto'),
  ])
  if (importError || !importacao) throw new Error('Importação não encontrada.')
  if (templateError || !template) throw new Error('Template não encontrado.')
  if (itemError) throw new Error(itemError.message)
  if (!itens?.length) throw new Error('A importação não possui destinatários aptos para este lote.')

  const { data: lote, error: loteError } = await db.from('lotes').insert({
    carteira_id: importacao.carteira_id, importacao_id: importacaoId, template_id: templateId, nome,
    status: 'preparado', total_itens: itens.length, criado_por: context.usuario.id,
  }).select('id').single()
  if (loteError) throw new Error(loteError.message)

  const loteItens = itens.map((item: any) => {
    const values = {
      nome: item.nome ?? '', documento: item.documento ?? '', email: item.email ?? '',
      valor: item.valor == null ? '' : Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      vencimento: item.vencimento ?? '', referencia: item.referencia ?? '',
    }
    return {
      lote_id: lote.id, importacao_item_id: item.id, cliente_id: item.cliente_id, destinatario: item.email,
      assunto: render(template.assunto, values), corpo_html: render(template.corpo_html, values),
      corpo_texto: template.corpo_texto ? render(template.corpo_texto, values) : null, status: 'preparado',
    }
  })
  const { error: insertError } = await db.from('lote_itens').insert(loteItens)
  if (insertError) throw new Error(insertError.message)
  await db.from('importacao_itens').update({ status: 'incluido' }).in('id', itens.map((item: any) => item.id))
  revalidatePath('/modulos/gkli-regua')
}
