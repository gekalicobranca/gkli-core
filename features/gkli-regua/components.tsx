import Link from "next/link";
import type { ReactNode } from "react";
import {
  FileText,
  Gauge,
  Layers,
  Mail,
  Settings,
  Upload,
  UserRound,
  Users,
} from "lucide-react";
import { BrandLogo } from "@/features/shared/brand-logo";
import type { PlatformUsuario } from "@/lib/auth/platform";
import { criarCarteiraRegua, criarTemplateRegua, gerarLoteRegua, importarCredoresRegua } from "./actions";
import type { ReguaData } from "./types";
import { ReguaImportPreview } from "./import-preview";

const routes = {
  cockpit: "/modulos/gkli-regua",
  importacoes: "/modulos/gkli-regua/importacoes",
  lotes: "/modulos/gkli-regua/lotes",
  carteiras: "/modulos/gkli-regua/credores",
  registros: "/modulos/gkli-regua/registros",
  templates: "/modulos/gkli-regua/templates",
  smtp: "/modulos/gkli-regua/configuracoes/smtp",
};

export function ReguaShell({
  children,
  usuario,
  eyebrow = "OPERAÇÃO TRANSITÓRIA",
  title = "Régua de comunicação",
  description = "Importe bases, organize cadastros e prepare lotes auditáveis de e-mail.",
}: {
  children: ReactNode;
  usuario: PlatformUsuario;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <main className="gkli-regua-shell cob-shell">
      <aside className="cob-sidebar">
        <div className="cob-sidebar-brand">
          <BrandLogo className="cob-sidebar-logo" label="GKLI Régua" />
          <div>
            <span>GKLI</span>
            <strong>Régua</strong>
          </div>
        </div>
        <nav aria-label="Navegação GKLI Régua">
          <Link className="cob-featured-link" href={routes.cockpit}>
            <span>
              <Gauge size={16} />
            </span>
            <div>
              <strong>Cockpit operacional</strong>
              <small>Visão geral da régua</small>
            </div>
          </Link>
          <section>
            <p>OPERAÇÃO</p>
            <Link href={routes.importacoes}>
              <span>
                <Upload size={16} />
              </span>
              Importações
            </Link>
            <Link href={routes.lotes}>
              <span>
                <Layers size={16} />
              </span>
              Lotes de e-mail
            </Link>
          </section>
          <section>
            <p>CADASTROS</p>
            <Link href={routes.carteiras}>
              <span>
                <FileText size={16} />
              </span>
              Credores
            </Link>
            <Link href={routes.registros}>
              <span>
                <Users size={16} />
              </span>
              Registros
            </Link>
            <Link href={routes.templates}>
              <span>
                <Mail size={16} />
              </span>
              Templates
            </Link>
          </section>
          <section>
            <p>CONFIGURAÇÕES</p>
            <Link href={routes.smtp}>
              <span>
                <Settings size={16} />
              </span>
              Integração SMTP
            </Link>
          </section>
        </nav>
        <div className="cob-sidebar-user">
          <span>
            <UserRound size={16} />
          </span>
          <div>
            <strong>{usuario.nome}</strong>
            <small>{usuario.email}</small>
          </div>
          <Link href="/logout">Sair</Link>
        </div>
      </aside>
      <section className="cob-main">
        <header className="cob-topbar">
          <span>GKLI Régua</span>
          <div className="cob-topbar-actions">
            <Link href={routes.smtp}>
              <Settings size={16} />
              Configurações
            </Link>
          </div>
        </header>
        <div className="cob-content">
          <section className="cob-page-hero">
            <div>
              <span>{eyebrow}</span>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
            <span className="cob-hero-badge">
              <Mail size={16} />
              Mensageria
            </span>
          </section>
          <div className="module-page-content">{children}</div>
        </div>
      </section>
    </main>
  );
}

function DatabaseWarning({ data }: { data: ReguaData }) {
  return data.databaseReady ? null : (
    <div className="suite-empty-block warning">{data.errorMessage}</div>
  );
}

function PageHeading({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <div className="suite-panel-heading">
      <div>
        <p className="suite-section-kicker">{kicker}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function FilterBar({
  children,
  query = "",
  searchPlaceholder = "Buscar por nome",
}: {
  children?: ReactNode;
  query?: string;
  searchPlaceholder?: string;
}) {
  return (
    <form className="regua-filter-bar" method="get">
      <label className="regua-filter-search">
        <span>Busca</span>
        <input name="q" defaultValue={query} placeholder={searchPlaceholder} />
      </label>
      {children}
      <div className="regua-filter-actions">
        <button className="button secondary" type="submit">
          Filtrar
        </button>
        <Link href="?">Limpar</Link>
      </div>
    </form>
  );
}

function carteiraNome(data: ReguaData, id: string | null) {
  return id
    ? (data.carteiras.find((item) => item.id === id)?.nome ?? "Credor")
    : "Múltiplos credores";
}
function templateNome(data: ReguaData, id: string) {
  return data.templates.find((item) => item.id === id)?.nome ?? "Template";
}
function importacaoCodigo(data: ReguaData, id: string) {
  return data.importacoes.find((item) => item.id === id)?.codigo_lote ?? "Lote de importação";
}
function date(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ReguaCockpitPage({ data }: { data: ReguaData }) {
  const shortcuts = [
    {
      href: routes.importacoes,
      icon: <Upload size={20} />,
      title: "Importações",
      text: "Atualizar credores e carregar a base da régua.",
    },
    {
      href: routes.lotes,
      icon: <Layers size={20} />,
      title: "Lotes de e-mail",
      text: "Preparar e acompanhar lotes auditáveis.",
    },
    {
      href: routes.carteiras,
      icon: <FileText size={20} />,
      title: "Credores",
      text: "Administrar os condomínios credores da operação.",
    },
    {
      href: routes.registros,
      icon: <Users size={20} />,
      title: "Registros",
      text: "Consultar as linhas importadas e seus dados de cobrança.",
    },
    {
      href: routes.templates,
      icon: <Mail size={20} />,
      title: "Templates",
      text: "Criar os conteúdos usados nas comunicações.",
    },
    {
      href: routes.smtp,
      icon: <Settings size={20} />,
      title: "Integração SMTP",
      text: "Configurar e testar a conta de envio.",
    },
  ];
  return (
    <>
      <DatabaseWarning data={data} />
      <section className="suite-kpi-grid compact">
        <article className="metric-card">
          <span className="metric-label">Credores ativos</span>
          <strong className="metric-value">{data.resumo.carteiras}</strong>
          <span className="metric-hint">condomínios na régua</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Registros</span>
          <strong className="metric-value">{data.resumo.registros}</strong>
          <span className="metric-hint">linhas importadas</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Registros importados</span>
          <strong className="metric-value">{data.resumo.importados}</strong>
          <span className="metric-hint">aptos acumulados</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">E-mails preparados</span>
          <strong className="metric-value">{data.resumo.preparados}</strong>
          <span className="metric-hint">em lotes auditáveis</span>
        </article>
      </section>
      <section className="suite-panel">
        <PageHeading
          kicker="Rotinas"
          title="O que você precisa fazer?"
          description="Cada rotina agora possui sua própria página de trabalho."
        />
        <div className="regua-routine-grid">
          {shortcuts.map((item) => (
            <Link
              className="regua-routine-card"
              href={item.href}
              key={item.href}
            >
              <span>{item.icon}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
              <strong>Acessar</strong>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export function ReguaImportacoesPage({
  data,
  canWrite,
  q = "",
  status = "",
}: {
  data: ReguaData;
  canWrite: boolean;
  q?: string;
  status?: string;
}) {
  const items = data.importacoes.filter(
    (item) =>
      (!q || `${item.codigo_lote} ${item.arquivo_nome}`.toLowerCase().includes(q.toLowerCase())) &&
      (!status || item.status === status),
  );
  return (
    <>
      <DatabaseWarning data={data} />
      <section className="suite-panel">
        <PageHeading
          kicker="Entrada controlada"
          title="Importações"
          description="Atualize a referência de credores e depois carregue a planilha operacional."
        />
        <form
          action={importarCredoresRegua}
          className="regua-form regua-form-reference"
        >
          <label>
            <span>1. Referência de credores</span>
            <input
              accept=".csv,.xlsx,.xls"
              name="arquivo_referencia"
              type="file"
              required
              disabled={!canWrite}
            />
          </label>
          <button
            className="button secondary"
            type="submit"
            disabled={!canWrite}
          >
            Atualizar credores
          </button>
        </form>
        <ReguaImportPreview
          credores={data.carteiras.map((item) => ({ codigo: item.codigo, nome: item.nome }))}
          canWrite={canWrite && Boolean(data.carteiras.length)}
        />
      </section>
      <section className="suite-panel">
        <PageHeading
          kicker="Histórico"
          title="Importações realizadas"
          description="Últimas cargas processadas pela régua."
        />
        <FilterBar searchPlaceholder="Buscar código ou arquivo">
          <label>
            <span>Status</span>
            <select name="status" defaultValue={status}>
              <option value="">Todos</option>
              <option value="processando">Processando</option>
              <option value="processado">Processado</option>
              <option value="falhou">Falhou</option>
            </select>
          </label>
        </FilterBar>
        <div className="suite-table-list compact">
          {items.map((item) => (
            <article key={item.id}>
              <div>
                <h3>{item.codigo_lote}</h3>
                <p>
                  {item.arquivo_nome} · {carteiraNome(data, item.carteira_id)} ·{" "}
                  {date(item.created_at)}
                </p>
              </div>
              <span className="suite-pill success">{item.status}</span>
              <strong>{item.linhas_validas} aptos</strong>
              <small>{item.linhas_invalidas} inválidos</small>
            </article>
          ))}
          {!items.length ? (
            <div className="suite-empty-block">
              Nenhuma importação encontrada.
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}

export function ReguaLotesPage({
  data,
  canWrite,
  q = "",
  status = "",
  carteira = "",
}: {
  data: ReguaData;
  canWrite: boolean;
  q?: string;
  status?: string;
  carteira?: string;
}) {
  const items = data.lotes.filter(
    (item) =>
      (!q || item.nome.toLowerCase().includes(q.toLowerCase())) &&
      (!status || item.status === status) &&
      (!carteira || item.carteira_id === carteira),
  );
  return (
    <>
      <DatabaseWarning data={data} />
      <section className="suite-panel">
        <PageHeading
          kicker="Mensageria"
          title="Preparar lote de e-mails"
          description="Escolha o credor, uma importação processada e o template da comunicação."
        />
        <form action={gerarLoteRegua} className="regua-form regua-form-lote">
          <label>
            <span>Nome do lote</span>
            <input
              name="nome"
              placeholder="Ex.: Régua agosto · Credor Cedrus"
              required
              disabled={!canWrite}
            />
          </label>
          <label>
            <span>Credor</span>
            <select name="carteira_id" required disabled={!canWrite}>
              <option value="">Selecione</option>
              {data.carteiras
                .filter((item) => item.status === "ativo")
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.codigo} · {item.nome}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span>Importação</span>
            <select name="importacao_id" required disabled={!canWrite}>
              <option value="">Selecione</option>
              {data.importacoes
                .filter((item) => item.linhas_validas > 0)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.codigo_lote} · {item.arquivo_nome} · {item.linhas_validas} aptos
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span>Template</span>
            <select name="template_id" required disabled={!canWrite}>
              <option value="">Selecione</option>
              {data.templates
                .filter((item) => item.status === "ativo")
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
            </select>
          </label>
          <button
            className="button"
            type="submit"
            disabled={
              !canWrite || !data.importacoes.length || !data.templates.length
            }
          >
            Preparar lote
          </button>
        </form>
      </section>
      <section className="suite-panel">
        <PageHeading
          kicker="Histórico"
          title="Lotes preparados"
          description="Lotes gerados para revisão e envio."
        />
        <FilterBar searchPlaceholder="Buscar lote">
          <label>
            <span>Credor</span>
            <select name="carteira" defaultValue={carteira}>
              <option value="">Todas</option>
              {data.carteiras.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select name="status" defaultValue={status}>
              <option value="">Todos</option>
              <option value="preparado">Preparado</option>
              <option value="em_envio">Em envio</option>
              <option value="concluido">Concluído</option>
              <option value="falhou">Falhou</option>
            </select>
          </label>
        </FilterBar>
        <div className="suite-table-list compact">
          {items.map((item) => (
            <article key={item.id}>
              <div>
                <h3>{item.nome}</h3>
                <p>
                {carteiraNome(data, item.carteira_id)} · {templateNome(data, item.template_id)} · {importacaoCodigo(data, item.importacao_id)}
                </p>
              </div>
              <span className="suite-pill primary">
                {item.status.replace("_", " ")}
              </span>
              <strong>{item.total_itens} e-mails</strong>
              <small>{date(item.created_at)}</small>
            </article>
          ))}
          {!items.length ? (
            <div className="suite-empty-block">Nenhum lote encontrado.</div>
          ) : null}
        </div>
      </section>
    </>
  );
}

export function ReguaCarteirasPage({
  data,
  canWrite,
  q = "",
  status = "",
}: {
  data: ReguaData;
  canWrite: boolean;
  q?: string;
  status?: string;
}) {
  const items = data.carteiras.filter(
    (item) =>
      (!q ||
        `${item.nome} ${item.codigo}`
          .toLowerCase()
          .includes(q.toLowerCase())) &&
      (!status || item.status === status),
  );
  return (
    <>
      <DatabaseWarning data={data} />
      <section className="suite-panel">
        <PageHeading
          kicker="Cadastros"
          title="Novo credor"
          description="Cadastre o condomínio credor para uso nesta régua."
        />
        <form
          action={criarCarteiraRegua}
          className="regua-form regua-cadastro-form"
        >
          <label>
            <span>Nome</span>
            <input name="nome" required disabled={!canWrite} />
          </label>
          <label>
            <span>Código opcional</span>
            <input name="codigo" disabled={!canWrite} />
          </label>
          <label>
            <span>Descrição</span>
            <input name="descricao" disabled={!canWrite} />
          </label>
          <button className="button" disabled={!canWrite}>
            Criar credor
          </button>
        </form>
      </section>
      <section className="suite-panel">
        <PageHeading
          kicker="Base atual"
          title="Credores cadastrados"
          description={`${data.carteiras.length} registro(s) na base.`}
        />
        <FilterBar searchPlaceholder="Buscar nome ou código">
          <label>
            <span>Status</span>
            <select name="status" defaultValue={status}>
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </label>
        </FilterBar>
        <div className="suite-table-list compact">
          {items.map((item) => (
            <article key={item.id}>
              <div>
                <h3>{item.nome}</h3>
                <p>
                  {item.codigo} · {item.descricao || "Sem descrição"}
                </p>
              </div>
              <span className="suite-pill primary">{item.status}</span>
            </article>
          ))}
          {!items.length ? (
            <div className="suite-empty-block">
              Nenhum credor encontrado.
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}

export function ReguaRegistrosPage({
  data,
  q = "",
  status = "",
  carteira = "",
}: {
  data: ReguaData;
  q?: string;
  status?: string;
  carteira?: string;
}) {
  const items = data.registros.filter(
    (item) =>
      (!q ||
        `${item.nome} ${item.email ?? ""} ${item.documento ?? ""}`
          .toLowerCase()
          .includes(q.toLowerCase())) &&
      (!status || item.status === status) &&
      (!carteira || item.carteira_id === carteira),
  );
  return (
    <>
      <DatabaseWarning data={data} />
      <section className="suite-panel">
        <PageHeading
          kicker="Importações"
          title="Registros importados"
          description={`${data.registros.length} linha(s) de cobrança carregada(s).`}
        />
        <FilterBar searchPlaceholder="Buscar nome, e-mail ou documento">
          <label>
            <span>Credor</span>
            <select name="carteira" defaultValue={carteira}>
              <option value="">Todas</option>
              {data.carteiras.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select name="status" defaultValue={status}>
              <option value="">Todos</option>
              <option value="apto">Apto</option>
              <option value="invalido">Inválido</option>
              <option value="incluido">Incluído em lote</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
          </label>
        </FilterBar>
        <div className="suite-table-list compact">
          {items.map((item) => (
            <article key={item.id}>
              <div>
                <h3>{item.nome}</h3>
                <p>
                  {carteiraNome(data, item.carteira_id)} ·{" "}
                  {item.email || "Sem e-mail"}
                </p>
              </div>
              <span className={`suite-pill ${item.status === "invalido" ? "danger" : "success"}`}>{item.status}</span>
              <small>{item.documento || "Sem documento"} · {item.valor == null ? "Sem valor" : Number(item.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</small>
            </article>
          ))}
          {!items.length ? (
            <div className="suite-empty-block">Nenhum registro encontrado.</div>
          ) : null}
        </div>
      </section>
    </>
  );
}

export function ReguaTemplatesPage({
  data,
  canWrite,
  q = "",
  status = "",
}: {
  data: ReguaData;
  canWrite: boolean;
  q?: string;
  status?: string;
}) {
  const items = data.templates.filter(
    (item) =>
      (!q ||
        `${item.nome} ${item.assunto}`
          .toLowerCase()
          .includes(q.toLowerCase())) &&
      (!status || item.status === status),
  );
  return (
    <>
      <DatabaseWarning data={data} />
      <section className="suite-panel">
        <PageHeading
          kicker="Conteúdo controlado"
          title="Novo template de e-mail"
          description="Use variáveis como {{nome}}, {{documento}}, {{email}}, {{valor}}, {{vencimento}} e {{referencia}}."
        />
        <form action={criarTemplateRegua} className="regua-template-form">
          <div className="regua-form stacked">
            <label>
              <span>Nome</span>
              <input name="nome" required disabled={!canWrite} />
            </label>
            <label>
              <span>Assunto</span>
              <input
                name="assunto"
                required
                placeholder="Comunicado para {{nome}}"
                disabled={!canWrite}
              />
            </label>
          </div>
          <label>
            <span>Conteúdo HTML</span>
            <textarea
              name="corpo_html"
              rows={8}
              required
              placeholder="<p>Olá, {{nome}}...</p>"
              disabled={!canWrite}
            />
          </label>
          <label>
            <span>Versão em texto</span>
            <textarea
              name="corpo_texto"
              rows={8}
              placeholder="Olá, {{nome}}..."
              disabled={!canWrite}
            />
          </label>
          <button className="button" disabled={!canWrite}>
            Salvar template
          </button>
        </form>
      </section>
      <section className="suite-panel">
        <PageHeading
          kicker="Biblioteca"
          title="Templates cadastrados"
          description={`${data.templates.length} conteúdo(s) na biblioteca.`}
        />
        <FilterBar searchPlaceholder="Buscar nome ou assunto">
          <label>
            <span>Status</span>
            <select name="status" defaultValue={status}>
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </label>
        </FilterBar>
        <div className="suite-table-list compact">
          {items.map((item) => (
            <article key={item.id}>
              <div>
                <h3>{item.nome}</h3>
                <p>{item.assunto}</p>
              </div>
              <span className="suite-pill success">{item.status}</span>
            </article>
          ))}
          {!items.length ? (
            <div className="suite-empty-block">Nenhum template encontrado.</div>
          ) : null}
        </div>
      </section>
    </>
  );
}
