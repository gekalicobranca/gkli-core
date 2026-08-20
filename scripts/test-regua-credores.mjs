import fs from "node:fs";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import { readLocalEnv } from "./env.mjs";

const source = process.argv[2];
if (!source || !fs.existsSync(source)) throw new Error("Informe um REL_CREDOR.csv válido.");

const env = readLocalEnv();
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase não configurado.");
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }).schema("gkli_regua");
const clean = (value) => String(value ?? "").replace(/\D/g, "") || null;
const normalize = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

const bytes = fs.readFileSync(source);
const utf8 = new TextDecoder("utf-8").decode(bytes).replace(/^\uFEFF/, "");
const workbook = XLSX.read(utf8, { type: "string", FS: ";", raw: true });
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "", raw: true });
const byCode = new Map();
for (const raw of rows) {
  const row = Object.fromEntries(Object.entries(raw).map(([key, value]) => [normalize(key), value]));
  const codigo = String(row.cod_credor ?? "").trim();
  const nome = String(row.nome_credor ?? "").trim();
  if (!codigo || !nome) continue;
  byCode.set(codigo, { codigo, nome, cnpj: clean(row.cnpj), email: String(row.email ?? "").trim() || null, descricao: "Credor importado da referência de credores.", status: "ativo", updated_at: new Date().toISOString() });
}

const payload = [...byCode.values()];
const before = await db.from("carteiras").select("codigo");
if (before.error) throw new Error(before.error.message);
const existing = new Set((before.data ?? []).map((item) => item.codigo));
const saved = await db.from("carteiras").upsert(payload, { onConflict: "codigo" }).select("codigo,nome");
if (saved.error) throw new Error(saved.error.message);
const after = await db.from("carteiras").select("codigo", { count: "exact", head: true });
if (after.error) throw new Error(after.error.message);

console.log(JSON.stringify({ linhasLidas: rows.length, credoresUnicos: payload.length, criados: payload.filter((item) => !existing.has(item.codigo)).length, atualizados: payload.filter((item) => existing.has(item.codigo)).length, totalNoBanco: after.count, codigosComZeroPreservados: ["0", "00", "000", "016", "02"].filter((codigo) => byCode.has(codigo)) }, null, 2));
