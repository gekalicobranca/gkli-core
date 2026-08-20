export type ReguaCarteira = { id: string; codigo: string; nome: string; cnpj?: string | null; email?: string | null; descricao: string | null; status: string }
export type ReguaRegistro = { id: string; importacao_id: string; carteira_id: string | null; linha: number; nome: string; documento: string | null; email: string | null; valor: number | null; vencimento: string | null; referencia: string | null; status: string; motivo: string | null; created_at: string }
export type ReguaTemplate = { id: string; nome: string; assunto: string; corpo_html: string; corpo_texto: string | null; status: string }
export type ReguaImportacao = { id: string; codigo_lote: string; carteira_id: string | null; arquivo_nome: string; status: string; total_linhas: number; linhas_validas: number; linhas_invalidas: number; created_at: string }
export type ReguaLote = { id: string; carteira_id: string; importacao_id: string; template_id: string; nome: string; status: string; total_itens: number; created_at: string }

export type ReguaData = {
  databaseReady: boolean
  errorMessage?: string
  carteiras: ReguaCarteira[]
  registros: ReguaRegistro[]
  templates: ReguaTemplate[]
  importacoes: ReguaImportacao[]
  lotes: ReguaLote[]
  resumo: { carteiras: number; registros: number; templates: number; importados: number; preparados: number }
}
