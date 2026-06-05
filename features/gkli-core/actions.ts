"use server";

import { revalidatePath } from "next/cache";
import { createCoreSupabaseClient, getCoreSchemaName } from "./supabase";

const corePaths = [
  "/modulos/gkli-core",
  "/modulos/gkli-core/cockpit",
  "/modulos/gkli-core/usuarios",
  "/modulos/gkli-core/acessos",
  "/modulos/gkli-core/apps",
  "/modulos/gkli-core/carteiras",
  "/modulos/gkli-core/auditoria"
];

function getDb() {
  const supabase = createCoreSupabaseClient();

  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY nao configurada para operacoes do GKLI Core.");
  }

  return supabase.schema(getCoreSchemaName());
}

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getValues(formData: FormData, key: string) {
  return formData.getAll(key).map((value) => String(value)).filter(Boolean);
}

function revalidateCore() {
  for (const path of corePaths) {
    revalidatePath(path);
  }
}

async function auditEvent({
  acao,
  entidade,
  entidadeId,
  payload
}: {
  acao: string;
  entidade: string;
  entidadeId?: string;
  payload?: Record<string, unknown>;
}) {
  const db = getDb();

  await db.from("auditoria_eventos").insert({
    acao,
    entidade,
    entidade_id: entidadeId,
    payload: payload ?? {}
  });
}

async function replaceUserLinks({
  appIds,
  carteiraIds,
  usuarioId
}: {
  appIds: string[];
  carteiraIds: string[];
  usuarioId: string;
}) {
  const db = getDb();

  await Promise.all([
    db.from("usuario_apps").delete().eq("usuario_id", usuarioId),
    db.from("usuario_carteiras").delete().eq("usuario_id", usuarioId)
  ]);

  const appRows = appIds.map((appId) => ({
    app_id: appId,
    usuario_id: usuarioId
  }));
  const carteiraRows = carteiraIds.map((carteiraId) => ({
    carteira_id: carteiraId,
    usuario_id: usuarioId
  }));

  if (appRows.length > 0) {
    await db.from("usuario_apps").insert(appRows);
  }

  if (carteiraRows.length > 0) {
    await db.from("usuario_carteiras").insert(carteiraRows);
  }
}

export async function createUserAction(formData: FormData) {
  const db = getDb();
  const nome = getText(formData, "nome");
  const email = getText(formData, "email").toLowerCase();
  const status = getText(formData, "status") || "ativo";
  const tipoAcessoId = getText(formData, "tipo_acesso_id") || null;
  const appIds = getValues(formData, "app_ids");
  const carteiraIds = getValues(formData, "carteira_ids");

  if (!nome || !email) {
    throw new Error("Nome e email sao obrigatorios.");
  }

  const { data, error } = await db
    .from("usuarios")
    .insert({
      email,
      nome,
      status,
      tipo_acesso_id: tipoAcessoId
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await replaceUserLinks({
    appIds,
    carteiraIds,
    usuarioId: data.id
  });
  await auditEvent({
    acao: "usuario.criado",
    entidade: "usuarios",
    entidadeId: data.id,
    payload: { appIds, carteiraIds, email, nome, status, tipoAcessoId }
  });

  revalidateCore();
}

export async function updateUserAction(formData: FormData) {
  const db = getDb();
  const id = getText(formData, "id");
  const nome = getText(formData, "nome");
  const email = getText(formData, "email").toLowerCase();
  const status = getText(formData, "status") || "ativo";
  const tipoAcessoId = getText(formData, "tipo_acesso_id") || null;
  const appIds = getValues(formData, "app_ids");
  const carteiraIds = getValues(formData, "carteira_ids");

  if (!id || !nome || !email) {
    throw new Error("Usuario, nome e email sao obrigatorios.");
  }

  const { error } = await db
    .from("usuarios")
    .update({
      email,
      nome,
      status,
      tipo_acesso_id: tipoAcessoId,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await replaceUserLinks({
    appIds,
    carteiraIds,
    usuarioId: id
  });
  await auditEvent({
    acao: "usuario.atualizado",
    entidade: "usuarios",
    entidadeId: id,
    payload: { appIds, carteiraIds, email, nome, status, tipoAcessoId }
  });

  revalidateCore();
}

export async function deactivateUserAction(formData: FormData) {
  const db = getDb();
  const id = getText(formData, "id");

  if (!id) {
    throw new Error("Usuario obrigatorio.");
  }

  const { error } = await db
    .from("usuarios")
    .update({
      status: "inativo",
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await auditEvent({
    acao: "usuario.desativado",
    entidade: "usuarios",
    entidadeId: id
  });

  revalidateCore();
}

export async function createWalletAction(formData: FormData) {
  const db = getDb();
  const nome = getText(formData, "nome");
  const codigo = getText(formData, "codigo").toUpperCase();
  const appOrigemId = getText(formData, "app_origem_id") || null;
  const status = getText(formData, "status") || "ativa";

  if (!nome || !codigo) {
    throw new Error("Nome e codigo sao obrigatorios.");
  }

  const { data, error } = await db
    .from("carteiras")
    .insert({
      app_origem_id: appOrigemId,
      codigo,
      nome,
      status
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await auditEvent({
    acao: "carteira.criada",
    entidade: "carteiras",
    entidadeId: data.id,
    payload: { appOrigemId, codigo, nome, status }
  });

  revalidateCore();
}

export async function createAppAction(formData: FormData) {
  const db = getDb();
  const nome = getText(formData, "nome");
  const namespace = getText(formData, "namespace").toLowerCase();
  const descricao = getText(formData, "descricao");
  const status = getText(formData, "status") || "ativo";

  if (!nome || !namespace) {
    throw new Error("Nome e namespace sao obrigatorios.");
  }

  const { data, error } = await db
    .from("apps")
    .insert({
      descricao,
      namespace,
      nome,
      status
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await auditEvent({
    acao: "app.criado",
    entidade: "apps",
    entidadeId: data.id,
    payload: { descricao, namespace, nome, status }
  });

  revalidateCore();
}

export async function createAccessTypeAction(formData: FormData) {
  const db = getDb();
  const nome = getText(formData, "nome");
  const descricao = getText(formData, "descricao");
  const nivel = getText(formData, "nivel") || "carteira";
  const permissionNames = getValues(formData, "permissions");

  if (!nome) {
    throw new Error("Nome do tipo de acesso e obrigatorio.");
  }

  const { data, error } = await db
    .from("tipos_acesso")
    .insert({
      ativo: true,
      descricao,
      nivel,
      nome
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (permissionNames.length > 0) {
    const { data: permissions, error: permissionsError } = await db
      .from("permissoes")
      .select("id,permission")
      .in("permission", permissionNames);

    if (permissionsError) {
      throw new Error(permissionsError.message);
    }

    const rows = (permissions ?? []).map((permission) => ({
      permissao_id: permission.id,
      tipo_acesso_id: data.id
    }));

    if (rows.length > 0) {
      await db.from("tipo_acesso_permissoes").insert(rows);
    }
  }

  await auditEvent({
    acao: "tipo_acesso.criado",
    entidade: "tipos_acesso",
    entidadeId: data.id,
    payload: { descricao, nivel, nome, permissionNames }
  });

  revalidateCore();
}
