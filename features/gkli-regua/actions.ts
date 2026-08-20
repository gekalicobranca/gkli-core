"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import * as XLSX from "xlsx";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireWriteRegua } from "./write-access";

function admin() {
  return createSupabaseAdminClient() as any;
}
function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}
function normalize(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}
function cleanDocument(value: unknown) {
  return String(value ?? "").replace(/\D/g, "") || null;
}
function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function emails(value: unknown) {
  return [
    ...new Set(
      String(value ?? "")
        .replace(/^"|"$/g, "")
        .split(/[;,]/)
        .map((item) => item.trim().toLowerCase())
        .filter(validEmail),
    ),
  ];
}
async function workbookFromFile(arquivo: File) {
  const buffer = await arquivo.arrayBuffer();
  if (arquivo.name.toLowerCase().endsWith(".csv")) {
    const bytes = new Uint8Array(buffer);
    const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    const replacementRate =
      (utf8.match(/\uFFFD/g)?.length ?? 0) / Math.max(utf8.length, 1);
    const content =
      replacementRate > 0.001
        ? new TextDecoder("windows-1252").decode(bytes)
        : utf8.replace(/^\uFEFF/, "");
    return XLSX.read(content, { type: "string", cellDates: true, FS: ";", raw: true });
  }
  return XLSX.read(buffer, { type: "array", cellDates: true });
}
function isoDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime()))
    return value.toISOString().slice(0, 10);
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed)
      return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
  }
  const raw = String(value).trim();
  const br = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2].padStart(2, "0")}-${br[1].padStart(2, "0")}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}
function money(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const raw = String(value ?? "")
    .trim()
    .replace(/R\$\s?/i, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}
function render(source: string, values: Record<string, string>) {
  return source.replace(
    /{{\s*([a-zA-Z0-9_]+)\s*}}/g,
    (_match, key) => values[key] ?? "",
  );
}

function codigoLote() {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const suffix = randomUUID().slice(0, 4).toUpperCase();
  return `LOT-${stamp}-${suffix}`;
}

async function requireWrite() {
  return requireWriteRegua("/modulos/gkli-regua");
}

export async function criarCarteiraRegua(formData: FormData) {
  await requireWrite();
  const nome = text(formData, "nome");
  const codigo = normalize(text(formData, "codigo") || nome)
    .replace(/_/g, "-")
    .toUpperCase();
  if (!nome || !codigo) throw new Error("Informe o nome do credor.");
  const { error } = await admin()
    .schema("gkli_regua")
    .from("carteiras")
    .insert({ nome, codigo, descricao: text(formData, "descricao") || null });
  if (error) throw new Error(error.message);
  revalidatePath("/modulos/gkli-regua");
  revalidatePath("/modulos/gkli-regua/credores");
}

export async function criarTemplateRegua(formData: FormData) {
  await requireWrite();
  const nome = text(formData, "nome");
  const assunto = text(formData, "assunto");
  const corpoHtml = text(formData, "corpo_html");
  if (!nome || !assunto || !corpoHtml)
    throw new Error("Informe nome, assunto e conteúdo do template.");
  const { error } = await admin()
    .schema("gkli_regua")
    .from("templates")
    .insert({
      nome,
      assunto,
      corpo_html: corpoHtml,
      corpo_texto: text(formData, "corpo_texto") || null,
    });
  if (error) throw new Error(error.message);
  revalidatePath("/modulos/gkli-regua");
  revalidatePath("/modulos/gkli-regua/templates");
}

export async function importarCredoresRegua(formData: FormData) {
  await requireWrite();
  const arquivo = formData.get("arquivo_referencia");
  if (!(arquivo instanceof File) || !arquivo.size)
    throw new Error("Selecione o arquivo REL_CREDOR.csv.");
  const workbook = await workbookFromFile(arquivo);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: true });
  const credoresPorCodigo = new Map<string, any>();
  rows
    .map((raw) => {
      const row = Object.fromEntries(
        Object.entries(raw).map(([key, value]) => [
          normalize(key.replace(/^\uFEFF/, "")),
          value,
        ]),
      );
      const codigo = String(row.cod_credor ?? "").trim();
      const nome = String(row.nome_credor ?? "").trim();
      if (!codigo || !nome) return null;
      return {
        codigo,
        nome,
        cnpj: cleanDocument(row.cnpj),
        email: emails(row.email)[0] ?? null,
        descricao: "Credor importado da referência de credores.",
        metadata: {
          telefone: String(row.fone ?? "").trim() || null,
          responsavel_legal: String(row.responsavel_legal ?? "").trim() || null,
          cpf_responsavel: cleanDocument(row.cpf_resp_legal),
          cep: String(row.cep ?? "").trim() || null,
          endereco: String(row.endereco ?? "").trim() || null,
          numero: String(row.numero ?? "").trim() || null,
          complemento: String(row.complemento ?? "").trim() || null,
          bairro: String(row.bairro ?? "").trim() || null,
          cidade: String(row.cidade ?? "").trim() || null,
          estado: String(row.estado ?? "").trim() || null,
        },
        status: "ativo",
        updated_at: new Date().toISOString(),
      };
    })
    .filter(Boolean)
    .forEach((credor: any) => credoresPorCodigo.set(credor.codigo, credor));
  const carteiras = [...credoresPorCodigo.values()];
  if (!carteiras.length)
    throw new Error(
      "Nenhum credor válido foi encontrado no arquivo de referência.",
    );
  const { error } = await admin()
    .schema("gkli_regua")
    .from("carteiras")
    .upsert(carteiras, { onConflict: "codigo" });
  if (error) throw new Error(error.message);
  revalidatePath("/modulos/gkli-regua");
  revalidatePath("/modulos/gkli-regua/importacoes");
  revalidatePath("/modulos/gkli-regua/credores");
}

export async function importarBaseRegua(formData: FormData) {
  const context = await requireWrite();
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || !arquivo.size)
    throw new Error("Selecione um arquivo XLSX, XLS ou CSV.");

  const workbook = await workbookFromFile(arquivo);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });
  const db = admin().schema("gkli_regua");
  const credoresResult = await db.from("carteiras").select("id,codigo").eq("status", "ativo");
  if (credoresResult.error) throw new Error(credoresResult.error.message);
  const credorPorCodigo = new Map<string, string>(
    (credoresResult.data ?? []).map((item: any) => [String(item.codigo).trim(), String(item.id)]),
  );
  const { data: importacao, error: importError } = await db
    .from("importacoes")
    .insert({
      codigo_lote: codigoLote(),
      carteira_id: null,
      arquivo_nome: arquivo.name,
      status: "processando",
      total_linhas: rows.length,
      criado_por: context.usuario.id,
    })
    .select("id")
    .single();
  if (importError) throw new Error(importError.message);

  let validas = 0;
  let invalidas = 0;
  const itens: any[] = [];
  for (let index = 0; index < rows.length; index += 1) {
    const raw = rows[index];
    const row = Object.fromEntries(
      Object.entries(raw).map(([key, value]) => [normalize(key), value]),
    );
    const codigoCredor = String(row.credor ?? row.cod_credor ?? "").trim();
    const codigoCliente = String(row.cod_devedor ?? row.codigo_cliente ?? "").trim();
    const carteiraId = credorPorCodigo.get(codigoCredor) ?? null;
    const nome = String(
      row.nome ?? row.cliente ?? row.devedor ?? row.nome_devedor ?? "",
    ).trim();
    const destinatarios = emails(row.email ?? row.e_mail);
    const email = destinatarios[0] ?? "";
    const documento = cleanDocument(
      row.documento ?? row.cpf_cnpj ?? row.cpf ?? row.cnpj,
    );
    const motivo = !carteiraId
      ? `Credor ${codigoCredor || "não informado"} não encontrado na referência`
      : !nome
        ? "Nome não informado"
        : !destinatarios.length
          ? "E-mail ausente ou inválido"
          : null;
    const status = motivo ? "invalido" : "apto";
    if (motivo) invalidas += 1;
    else validas += 1;
    itens.push({
      importacao_id: importacao.id,
      carteira_id: carteiraId,
      linha: index + 2,
      nome: nome || `Linha ${index + 2}`,
      email: email || null,
      documento,
      valor: money(
        row.valor ??
          row.valor_devido ??
          row.saldo ??
          row.vl_titulo ??
          row.vl_saldo,
      ),
      vencimento: isoDate(
        row.vencimento ?? row.data_vencimento ?? row.dt_vencimento,
      ),
      referencia:
        String(
          row.referencia ??
            row.contrato ??
            row.unidade ??
            row.cod_devedor ??
            row.cod_titulo ??
            "",
        ).trim() || null,
      dados: { ...raw, _emails: destinatarios, _codigo_credor: codigoCredor },
      status,
      motivo,
    });
  }

  if (itens.length) {
    const { error } = await db.from("importacao_itens").insert(itens);
    if (error) throw new Error(error.message);
  }
  const { error: finishError } = await db
    .from("importacoes")
    .update({
      status: "processado",
      linhas_validas: validas,
      linhas_invalidas: invalidas,
    })
    .eq("id", importacao.id);
  if (finishError) throw new Error(finishError.message);
  revalidatePath("/modulos/gkli-regua");
  revalidatePath("/modulos/gkli-regua/importacoes");
}

export async function gerarLoteRegua(formData: FormData) {
  const context = await requireWrite();
  const importacaoId = text(formData, "importacao_id");
  const templateId = text(formData, "template_id");
  const carteiraId = text(formData, "carteira_id");
  const nome = text(formData, "nome");
  if (!importacaoId || !templateId || !carteiraId || !nome)
    throw new Error("Informe credor, importação, template e nome do lote.");
  const db = admin().schema("gkli_regua");
  const { data: existente, error: existenteError } = await db
    .from("lotes")
    .select("id,nome")
    .eq("importacao_id", importacaoId)
    .eq("carteira_id", carteiraId)
    .maybeSingle();
  if (existenteError) throw new Error(existenteError.message);
  if (existente) {
    throw new Error(`Este lote de importação já foi preparado para o credor no lote “${existente.nome}”.`);
  }
  const [
    { data: importacao, error: importError },
    { data: template, error: templateError },
    { data: itens, error: itemError },
  ] = await Promise.all([
    db
      .from("importacoes")
      .select("id,carteira_id")
      .eq("id", importacaoId)
      .single(),
    db
      .from("templates")
      .select("id,assunto,corpo_html,corpo_texto")
      .eq("id", templateId)
      .eq("status", "ativo")
      .single(),
    db
      .from("importacao_itens")
      .select("*")
      .eq("importacao_id", importacaoId)
      .eq("carteira_id", carteiraId)
      .eq("status", "apto"),
  ]);
  if (importError || !importacao) throw new Error("Importação não encontrada.");
  if (templateError || !template) throw new Error("Template não encontrado.");
  if (itemError) throw new Error(itemError.message);
  if (!itens?.length)
    throw new Error(
      "A importação não possui destinatários aptos para este lote.",
    );

  const { data: lote, error: loteError } = await db
    .from("lotes")
    .insert({
      carteira_id: carteiraId,
      importacao_id: importacaoId,
      template_id: templateId,
      nome,
      status: "preparado",
      total_itens: itens.length,
      criado_por: context.usuario.id,
    })
    .select("id")
    .single();
  if (loteError) throw new Error(loteError.message);

  const loteItens = itens.flatMap((item: any) => {
    const values = {
      nome: item.nome ?? "",
      documento: item.documento ?? "",
      email: item.email ?? "",
      valor:
        item.valor == null
          ? ""
          : Number(item.valor).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            }),
      vencimento: item.vencimento ?? "",
      referencia: item.referencia ?? "",
    };
    const destinatarios =
      Array.isArray(item.dados?._emails) && item.dados._emails.length
        ? item.dados._emails
        : [item.email];
    return destinatarios.map((destinatario: string) => ({
      lote_id: lote.id,
      importacao_item_id: item.id,
      destinatario,
      assunto: render(template.assunto, values),
      corpo_html: render(template.corpo_html, values),
      corpo_texto: template.corpo_texto
        ? render(template.corpo_texto, values)
        : null,
      status: "preparado",
    }));
  });
  const { error: insertError } = await db.from("lote_itens").insert(loteItens);
  if (insertError) throw new Error(insertError.message);
  await db
    .from("lotes")
    .update({ total_itens: loteItens.length })
    .eq("id", lote.id);
  await db
    .from("importacao_itens")
    .update({ status: "incluido" })
    .in(
      "id",
      itens.map((item: any) => item.id),
    );
  revalidatePath("/modulos/gkli-regua");
  revalidatePath("/modulos/gkli-regua/lotes");
}
