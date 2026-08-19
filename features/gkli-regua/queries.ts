import { redirect } from 'next/navigation'
import { canAccess } from '@/lib/auth/permissions'
import { requireModuleAccess } from '@/lib/auth/platform'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { ReguaCarteira, ReguaCliente, ReguaData, ReguaImportacao, ReguaLote, ReguaTemplate } from './types'

function admin() {
  return createSupabaseAdminClient() as any
}

export async function requireReguaContext(target = '/modulos/gkli-regua') {
  const context = await requireModuleAccess('gkli-regua', target)
  if (!canAccess(context.permissions, 'gkli_regua.read')) redirect('/plataforma')
  return context
}

export async function getReguaData(): Promise<ReguaData> {
  const db = admin().schema('gkli_regua')
  const [carteirasResult, clientesResult, templatesResult, importacoesResult, lotesResult] = await Promise.all([
    db.from('carteiras').select('id,codigo,nome,cnpj,email,descricao,status').order('nome'),
    db.from('clientes').select('id,carteira_id,nome,documento,email,status,created_at').order('created_at', { ascending: false }).limit(100),
    db.from('templates').select('id,nome,assunto,corpo_html,corpo_texto,status').order('nome'),
    db.from('importacoes').select('id,carteira_id,arquivo_nome,status,total_linhas,linhas_validas,linhas_invalidas,created_at').order('created_at', { ascending: false }).limit(30),
    db.from('lotes').select('id,carteira_id,importacao_id,template_id,nome,status,total_itens,created_at').order('created_at', { ascending: false }).limit(30),
  ])

  const firstError = [carteirasResult, clientesResult, templatesResult, importacoesResult, lotesResult].find((result) => result.error)?.error
  if (firstError) {
    return {
      databaseReady: false,
      errorMessage: 'A estrutura independente do GKLI Régua ainda não foi aplicada ao banco.',
      carteiras: [], clientes: [], templates: [], importacoes: [], lotes: [],
      resumo: { carteiras: 0, clientes: 0, templates: 0, importados: 0, preparados: 0 },
    }
  }

  const carteiras = (carteirasResult.data ?? []) as ReguaCarteira[]
  const clientes = (clientesResult.data ?? []) as ReguaCliente[]
  const templates = (templatesResult.data ?? []) as ReguaTemplate[]
  const importacoes = (importacoesResult.data ?? []) as ReguaImportacao[]
  const lotes = (lotesResult.data ?? []) as ReguaLote[]

  return {
    databaseReady: true,
    carteiras, clientes, templates, importacoes, lotes,
    resumo: {
      carteiras: carteiras.filter((item) => item.status === 'ativo').length,
      clientes: clientes.filter((item) => item.status === 'ativo').length,
      templates: templates.filter((item) => item.status === 'ativo').length,
      importados: importacoes.reduce((sum, item) => sum + item.linhas_validas, 0),
      preparados: lotes.reduce((sum, item) => sum + item.total_itens, 0),
    },
  }
}
