import {
  accessTypes as mockAccessTypes,
  apps as mockApps,
  users as mockUsers,
  wallets as mockWallets
} from "./mock-data";
import { corePermissions } from "./module-config";
import { createCoreSupabaseClient, getCoreSchemaName } from "./supabase";
import type { CoreAccessType, CoreApp, CoreAuditRow, CoreData, CoreUser, CoreWallet } from "./types";

type DbUser = {
  id: string;
  nome: string;
  email: string;
  status: string | null;
  tipo_acesso_id: string | null;
};

type DbAccessType = {
  id: string;
  nome: string;
  descricao: string | null;
  nivel: string | null;
  ativo: boolean | null;
};

type DbApp = {
  id: string;
  nome: string;
  namespace: string;
  descricao: string | null;
  status: string | null;
};

type DbWallet = {
  id: string;
  nome: string;
  codigo: string;
  app_origem_id: string | null;
  status: string | null;
};

type DbUserApp = {
  usuario_id: string;
  app_id: string;
};

type DbUserWallet = {
  usuario_id: string;
  carteira_id: string;
};

type DbPermission = {
  id: string;
  permission: string;
};

type DbAccessPermission = {
  tipo_acesso_id: string;
  permissao_id: string;
};

type DbAudit = {
  id: string;
  entidade: string;
  acao: string;
  created_at: string;
};

const pendingAuditRows: CoreAuditRow[] = [
  {
    id: "audit_plan_usuario",
    evento: "Criacao de usuario",
    origem: "Core",
    status: "Planejado"
  },
  {
    id: "audit_plan_apps",
    evento: "Alteracao de apps permitidos",
    origem: "Core",
    status: "Planejado"
  },
  {
    id: "audit_plan_carteiras",
    evento: "Alteracao de carteiras",
    origem: "Core",
    status: "Planejado"
  }
];

function normalizeStatus(value: string | null | undefined) {
  if (!value) {
    return "Ativo";
  }

  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");
}

function getMockCoreData(): CoreData {
  const appIdByShortName = new Map(mockApps.map((app) => [app.nome.replace("GKLI ", ""), app.id]));
  const walletIdByName = new Map(mockWallets.map((wallet) => [wallet.nome, wallet.id]));
  const accessTypeIdByName = new Map(mockAccessTypes.map((type) => [type.nome, type.id]));

  return {
    users: mockUsers.map((user) => ({
      ...user,
      tipoAcessoId: accessTypeIdByName.get(user.tipoAcesso),
      appIds: user.apps.map((app) => appIdByShortName.get(app)).filter((id): id is string => Boolean(id)),
      carteiraIds: user.carteiras
        .map((wallet) => walletIdByName.get(wallet))
        .filter((id): id is string => Boolean(id))
    })),
    accessTypes: mockAccessTypes.map((type) => ({
      ...type,
      permissions: corePermissions.filter((permission) =>
        type.nome === "Administrador" ? true : permission.endsWith(".read")
      )
    })),
    apps: mockApps,
    wallets: mockWallets,
    auditRows: pendingAuditRows,
    source: "mock"
  };
}

export async function getCoreData(): Promise<CoreData> {
  const supabase = createCoreSupabaseClient();

  if (!supabase) {
    return getMockCoreData();
  }

  const db = supabase.schema(getCoreSchemaName());

  const [
    usersResult,
    accessTypesResult,
    appsResult,
    walletsResult,
    userAppsResult,
    userWalletsResult,
    permissionsResult,
    accessPermissionsResult,
    auditResult
  ] = await Promise.all([
    db.from("usuarios").select("id,nome,email,status,tipo_acesso_id").order("nome"),
    db.from("tipos_acesso").select("id,nome,descricao,nivel,ativo").order("nome"),
    db.from("apps").select("id,nome,namespace,descricao,status").order("nome"),
    db.from("carteiras").select("id,nome,codigo,app_origem_id,status").order("nome"),
    db.from("usuario_apps").select("usuario_id,app_id"),
    db.from("usuario_carteiras").select("usuario_id,carteira_id"),
    db.from("permissoes").select("id,permission").order("permission"),
    db.from("tipo_acesso_permissoes").select("tipo_acesso_id,permissao_id"),
    db.from("auditoria_eventos").select("id,entidade,acao,created_at").order("created_at", {
      ascending: false
    }).limit(20)
  ]);

  if (
    usersResult.error ||
    accessTypesResult.error ||
    appsResult.error ||
    walletsResult.error ||
    userAppsResult.error ||
    userWalletsResult.error ||
    permissionsResult.error ||
    accessPermissionsResult.error ||
    auditResult.error
  ) {
    return getMockCoreData();
  }

  const dbUsers = (usersResult.data ?? []) as DbUser[];
  const dbAccessTypes = (accessTypesResult.data ?? []) as DbAccessType[];
  const dbApps = (appsResult.data ?? []) as DbApp[];
  const dbWallets = (walletsResult.data ?? []) as DbWallet[];
  const dbUserApps = (userAppsResult.data ?? []) as DbUserApp[];
  const dbUserWallets = (userWalletsResult.data ?? []) as DbUserWallet[];
  const dbPermissions = (permissionsResult.data ?? []) as DbPermission[];
  const dbAccessPermissions = (accessPermissionsResult.data ?? []) as DbAccessPermission[];
  const dbAudits = (auditResult.data ?? []) as DbAudit[];

  const accessTypeById = new Map(dbAccessTypes.map((type) => [type.id, type]));
  const appById = new Map(dbApps.map((app) => [app.id, app]));
  const walletById = new Map(dbWallets.map((wallet) => [wallet.id, wallet]));
  const permissionById = new Map(dbPermissions.map((permission) => [permission.id, permission.permission]));

  const appIdsByUser = new Map<string, string[]>();
  const walletIdsByUser = new Map<string, string[]>();
  const userCountByAccessType = new Map<string, number>();
  const userCountByApp = new Map<string, number>();
  const userCountByWallet = new Map<string, number>();
  const permissionsByAccessType = new Map<string, string[]>();

  for (const link of dbUserApps) {
    appIdsByUser.set(link.usuario_id, [...(appIdsByUser.get(link.usuario_id) ?? []), link.app_id]);
    userCountByApp.set(link.app_id, (userCountByApp.get(link.app_id) ?? 0) + 1);
  }

  for (const link of dbUserWallets) {
    walletIdsByUser.set(link.usuario_id, [...(walletIdsByUser.get(link.usuario_id) ?? []), link.carteira_id]);
    userCountByWallet.set(link.carteira_id, (userCountByWallet.get(link.carteira_id) ?? 0) + 1);
  }

  for (const user of dbUsers) {
    if (user.tipo_acesso_id) {
      userCountByAccessType.set(
        user.tipo_acesso_id,
        (userCountByAccessType.get(user.tipo_acesso_id) ?? 0) + 1
      );
    }
  }

  for (const link of dbAccessPermissions) {
    const permission = permissionById.get(link.permissao_id);

    if (permission) {
      permissionsByAccessType.set(link.tipo_acesso_id, [
        ...(permissionsByAccessType.get(link.tipo_acesso_id) ?? []),
        permission
      ]);
    }
  }

  const users: CoreUser[] = dbUsers.map((user) => {
    const accessType = user.tipo_acesso_id ? accessTypeById.get(user.tipo_acesso_id) : null;
    const appNames = (appIdsByUser.get(user.id) ?? [])
      .map((appId) => appById.get(appId)?.nome.replace("GKLI ", ""))
      .filter((app): app is string => Boolean(app));
    const walletNames = (walletIdsByUser.get(user.id) ?? [])
      .map((walletId) => walletById.get(walletId)?.nome)
      .filter((wallet): wallet is string => Boolean(wallet));

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      status: normalizeStatus(user.status),
      tipoAcessoId: user.tipo_acesso_id ?? undefined,
      tipoAcesso: accessType?.nome ?? "Sem tipo",
      appIds: appIdsByUser.get(user.id) ?? [],
      apps: appNames,
      carteiraIds: walletIdsByUser.get(user.id) ?? [],
      carteiras: walletNames
    };
  });

  const accessTypes: CoreAccessType[] = dbAccessTypes.map((type) => ({
    id: type.id,
    nome: type.nome,
    descricao: type.descricao ?? "Sem descricao cadastrada.",
    nivel: normalizeStatus(type.nivel),
    usuarios: userCountByAccessType.get(type.id) ?? 0,
    permissions: permissionsByAccessType.get(type.id) ?? []
  }));

  const apps: CoreApp[] = dbApps.map((app) => ({
    id: app.id,
    nome: app.nome,
    namespace: app.namespace,
    status: normalizeStatus(app.status),
    usuarios: userCountByApp.get(app.id) ?? 0,
    descricao: app.descricao ?? "Sem descricao cadastrada."
  }));

  const wallets: CoreWallet[] = dbWallets.map((wallet) => ({
    id: wallet.id,
    nome: wallet.nome,
    codigo: wallet.codigo,
    appOrigem: wallet.app_origem_id ? appById.get(wallet.app_origem_id)?.nome ?? "Core" : "Core",
    usuarios: userCountByWallet.get(wallet.id) ?? 0,
    status: normalizeStatus(wallet.status)
  }));

  const auditRows: CoreAuditRow[] =
    dbAudits.length > 0
      ? dbAudits.map((audit) => ({
          id: audit.id,
          evento: audit.acao,
          origem: audit.entidade,
          status: "Registrado",
          createdAt: audit.created_at
        }))
      : pendingAuditRows;

  return {
    users,
    accessTypes,
    apps,
    wallets,
    auditRows,
    source: "supabase"
  };
}
