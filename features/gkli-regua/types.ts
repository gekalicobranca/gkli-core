export type ReguaCarteira = { id: string; codigo: string; nome: string; cnpj?: string | null; email?: string | null; descricao: string | null; status: string }
export type ReguaCliente = { id: string; carteira_id: string; nome: string; documento: string | null; email: string | null; status: string; created_at: string }
export type ReguaTemplate = { id: string; nome: string; assunto: string; corpo_html: string; corpo_texto: string | null; status: string }
export type ReguaImportacao = { id: string; carteira_id: string | null; arquivo_nome: string; status: string; total_linhas: number; linhas_validas: number; linhas_invalidas: number; created_at: string }
export type ReguaLote = { id: string; carteira_id: string; importacao_id: string; template_id: string; nome: string; status: string; total_itens: number; created_at: string }

export type ReguaData = {
  databaseReady: boolean
  errorMessage?: string
  carteiras: ReguaCarteira[]
  clientes: ReguaCliente[]
  templates: ReguaTemplate[]
  importacoes: ReguaImportacao[]
  lotes: ReguaLote[]
  resumo: { carteiras: number; clientes: number; templates: number; importados: number; preparados: number }
}
