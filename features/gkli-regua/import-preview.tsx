"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { importarBaseRegua } from "./actions";

type Credor = { codigo: string; nome: string };
type PreviewRow = { linha: number; credor: string; credorNome: string; cliente: string; documento: string; email: string; status: "apto" | "invalido"; motivo: string };

function normalize(value: unknown) { return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""); }
function validEmails(value: unknown) { return String(value ?? "").replace(/^"|"$/g, "").split(/[;,]/).map((item) => item.trim()).filter((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item)); }

export function ReguaImportPreview({ credores, canWrite }: { credores: Credor[]; canWrite: boolean }) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [error, setError] = useState("");
  const credorMap = new Map(credores.map((item) => [item.codigo.trim(), item.nome]));

  async function preview(file: File | null) {
    setArquivo(file); setRows([]); setError("");
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const utf8 = new TextDecoder("utf-8").decode(bytes);
      const replacementRate = (utf8.match(/\uFFFD/g)?.length ?? 0) / Math.max(utf8.length, 1);
      const source = replacementRate > 0.001 ? new TextDecoder("windows-1252").decode(bytes) : utf8.replace(/^\uFEFF/, "");
      const workbook = file.name.toLowerCase().endsWith(".csv") ? XLSX.read(source, { type: "string", FS: ";", raw: true }) : XLSX.read(buffer, { type: "array", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: true });
      setRows(parsed.map((raw, index) => {
        const row = Object.fromEntries(Object.entries(raw).map(([key, value]) => [normalize(key), value]));
        const credor = String(row.credor ?? row.cod_credor ?? "").trim();
        const cliente = String(row.nome_devedor ?? row.devedor ?? row.nome ?? row.cliente ?? "").trim();
        const documento = String(row.cnpj_cpf ?? row.documento ?? row.cpf_cnpj ?? row.cpf ?? row.cnpj ?? "").trim();
        const emails = validEmails(row.email ?? row.e_mail);
        const motivo = !credorMap.has(credor) ? `Credor ${credor || "não informado"} não cadastrado` : !cliente ? "Devedor não informado" : !emails.length ? "E-mail ausente ou inválido" : "";
        return { linha: index + 2, credor, credorNome: credorMap.get(credor) ?? "—", cliente: cliente || "—", documento: documento || "—", email: emails.join("; ") || "—", status: motivo ? "invalido" : "apto", motivo };
      }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível ler o arquivo."); }
  }

  const aptos = rows.filter((item) => item.status === "apto").length;
  const invalidos = rows.length - aptos;
  const totalCredores = new Set(rows.filter((item) => item.credorNome !== "—").map((item) => item.credor)).size;

  return <form action={importarBaseRegua} className="regua-import-preview-form">
    <label className="regua-preview-file"><span>2. Planilha de carga</span><input accept=".xlsx,.xls,.csv" name="arquivo" type="file" required disabled={!canWrite} onChange={(event) => preview(event.target.files?.[0] ?? null)} /></label>
    {error ? <div className="suite-empty-block danger">{error}</div> : null}
    {rows.length ? <div className="regua-preview-wrap">
      <div className="regua-preview-summary"><article><span>Linhas</span><strong>{rows.length}</strong></article><article><span>Credores</span><strong>{totalCredores}</strong></article><article><span>Aptos</span><strong>{aptos}</strong></article><article><span>Inválidos</span><strong>{invalidos}</strong></article></div>
      <div className="regua-preview-table"><table><thead><tr><th>Linha</th><th>Credor</th><th>Devedor</th><th>Documento</th><th>E-mail</th><th>Validação</th></tr></thead><tbody>{rows.slice(0, 12).map((item) => <tr key={item.linha}><td>{item.linha}</td><td><strong>{item.credor}</strong><small>{item.credorNome}</small></td><td>{item.cliente}</td><td>{item.documento}</td><td>{item.email}</td><td><span className={`suite-pill ${item.status === "apto" ? "success" : "danger"}`}>{item.status}</span>{item.motivo ? <small>{item.motivo}</small> : null}</td></tr>)}</tbody></table></div>
      {rows.length > 12 ? <p className="regua-preview-note">Prévia das primeiras 12 linhas de {rows.length}.</p> : null}
      <div className="regua-preview-confirm"><p><strong>Confirme antes de importar.</strong><span>Será criado um lote exclusivo. Cada linha será preservada como um registro, com cobrança, credor e dados do devedor.</span></p><button className="button" type="submit" disabled={!canWrite || !arquivo || !aptos}>Confirmar e criar lote</button></div>
    </div> : <div className="suite-empty-block">Selecione a planilha para visualizar a prévia antes da importação.</div>}
  </form>;
}
