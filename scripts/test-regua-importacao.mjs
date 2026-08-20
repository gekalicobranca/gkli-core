import fs from "node:fs";
import { randomUUID } from "node:crypto";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import { readLocalEnv } from "./env.mjs";

const source = process.argv[2];
if (!source || !fs.existsSync(source)) throw new Error("Informe uma planilha de lote válida.");
const env = readLocalEnv();
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }).schema("gkli_regua");
const normalize = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const document = (value) => String(value ?? "").replace(/\D/g, "") || null;
const emails = (value) => [...new Set(String(value ?? "").split(/[;,]/).map((item) => item.trim().toLowerCase()).filter((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item)))];
const money = (value) => { const parsed = Number(String(value ?? "").trim().replace(/R\$\s?/i, "").replace(/\./g, "").replace(",", ".")); return Number.isFinite(parsed) ? parsed : null; };
const date = (value) => { const raw = String(value ?? "").trim(); const br = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); return br ? `${br[3]}-${br[2].padStart(2, "0")}-${br[1].padStart(2, "0")}` : null; };

const bytes = fs.readFileSync(source);
const utf8 = new TextDecoder("utf-8").decode(bytes).replace(/^\uFEFF/, "");
const workbook = XLSX.read(utf8, { type: "string", FS: ";", raw: true });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: true });
const credores = await db.from("carteiras").select("id,codigo,nome").eq("status", "ativo");
if (credores.error) throw new Error(credores.error.message);
const credorMap = new Map(credores.data.map((item) => [String(item.codigo).trim(), item]));
const codigoLote = `LOT-${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)}-${randomUUID().slice(0, 4).toUpperCase()}`;
const importacao = await db.from("importacoes").insert({ codigo_lote: codigoLote, carteira_id: null, arquivo_nome: source.split(/[\\/]/).at(-1), status: "processando", total_linhas: rows.length }).select("id,codigo_lote").single();
if (importacao.error) throw new Error(importacao.error.message);

const parsed = rows.map((raw, index) => {
  const row = Object.fromEntries(Object.entries(raw).map(([key, value]) => [normalize(key), value]));
  const codigoCredor = String(row.credor ?? "").trim();
  const credor = credorMap.get(codigoCredor);
  const nome = String(row.nome_devedor ?? row.devedor ?? "").trim();
  const listaEmails = emails(row.email);
  const documento = document(row.cnpj_cpf);
  const codigoCliente = String(row.cod_devedor ?? "").trim();
  const motivo = !credor ? `Credor ${codigoCredor} não encontrado` : !nome ? "Cliente não informado" : !listaEmails.length ? "E-mail ausente ou inválido" : null;
  return { index, row, credor, codigoCredor, codigoCliente, nome, listaEmails, documento, motivo };
});

const aptos = parsed.filter((item) => !item.motivo);
const novosClientesMap = new Map();
for (const item of aptos) {
  const key = `${item.credor.id}|${item.documento ? `doc:${item.documento}` : `codigo:${item.codigoCliente}`}`;
  if (!novosClientesMap.has(key)) novosClientesMap.set(key, { carteira_id: item.credor.id, nome: item.nome, documento: item.documento, email: item.listaEmails[0], status: "ativo", metadata: { codigo_devedor: item.codigoCliente, origem: "teste_importacao_regua", codigo_lote: codigoLote } });
}
const novosClientes = [...novosClientesMap.values()];
const clientes = novosClientes.length ? await db.from("clientes").insert(novosClientes).select("id,carteira_id,documento,metadata") : { data: [], error: null };
if (clientes.error) throw new Error(clientes.error.message);
const clienteMap = new Map(clientes.data.map((item) => [`${item.carteira_id}|codigo:${item.metadata.codigo_devedor}`, item.id]));
for (const item of clientes.data) if (item.documento) clienteMap.set(`${item.carteira_id}|doc:${item.documento}`, item.id);
const itens = parsed.map((item) => { const key = item.credor ? `${item.credor.id}|${item.documento ? `doc:${item.documento}` : `codigo:${item.codigoCliente}`}` : ""; return { importacao_id: importacao.data.id, carteira_id: item.credor?.id ?? null, cliente_id: clienteMap.get(key) ?? null, linha: item.index + 2, nome: item.nome || `Linha ${item.index + 2}`, documento: item.documento, email: item.listaEmails[0] ?? null, valor: money(item.row.vl_titulo ?? item.row.vl_saldo), vencimento: date(item.row.dt_vencimento), referencia: item.codigoCliente || null, dados: { ...item.row, _emails: item.listaEmails, _codigo_credor: item.codigoCredor }, status: item.motivo ? "invalido" : "apto", motivo: item.motivo }; });
const savedItems = await db.from("importacao_itens").insert(itens);
if (savedItems.error) throw new Error(savedItems.error.message);
const finished = await db.from("importacoes").update({ status: "processado", linhas_validas: aptos.length, linhas_invalidas: parsed.length - aptos.length }).eq("id", importacao.data.id);
if (finished.error) throw new Error(finished.error.message);

console.log(JSON.stringify({ codigoLote, linhas: rows.length, credoresNoArquivo: new Set(parsed.map((item) => item.codigoCredor)).size, clientesCriados: clientes.data.length, aptos: aptos.length, invalidos: parsed.length - aptos.length, motivosInvalidos: parsed.filter((item) => item.motivo).map((item) => ({ linha: item.index + 2, cliente: item.nome, motivo: item.motivo })) }, null, 2));
