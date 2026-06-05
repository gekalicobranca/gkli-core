import { getCoreData } from "./repository";

export type ColabCoreAccessUser = {
  id: string;
  nome: string;
  email: string;
  status: string;
  tipoAcesso: string;
  apps: string[];
  carteiras: string[];
  canOpenColab: boolean;
};

export type ColabCoreAccessRole = {
  id: string;
  nome: string;
  descricao: string;
  nivel: string;
  usuarios: number;
  permissions: string[];
};

export type ColabCoreAccessPayload = {
  source: "gkli_core";
  app: {
    id: string;
    nome: string;
    namespace: "gkli_colab";
    status: string;
  };
  users: ColabCoreAccessUser[];
  roles: ColabCoreAccessRole[];
};

const colabPermissionsByAccessType: Record<string, string[]> = {
  Administrador: ["gkli_colab.admin"],
  Operação: ["gkli_colab.dashboard.read", "gkli_colab.recibos.read"],
  Financeiro: ["gkli_colab.dashboard.read", "gkli_colab.pagamentos.read", "gkli_colab.recibos.read"]
};

export async function getColabCoreAccessPayload(): Promise<ColabCoreAccessPayload> {
  const { accessTypes, apps, users } = await getCoreData();
  const colabApp = apps.find((app) => app.namespace === "gkli_colab");
  const colabUsers = users.filter((user) => user.apps.includes("Colab"));

  return {
    source: "gkli_core",
    app: {
      id: colabApp?.id ?? "gkli_colab",
      nome: colabApp?.nome ?? "GKLI Colab",
      namespace: "gkli_colab",
      status: colabApp?.status ?? "Ativo"
    },
    users: colabUsers.map((user) => ({
      id: user.id,
      nome: user.nome,
      email: user.email,
      status: user.status,
      tipoAcesso: user.tipoAcesso,
      apps: user.apps,
      carteiras: user.carteiras,
      canOpenColab: user.apps.includes("Colab")
    })),
    roles: accessTypes.map((accessType) => ({
      id: accessType.id,
      nome: accessType.nome,
      descricao: accessType.descricao,
      nivel: accessType.nivel,
      usuarios: colabUsers.filter((user) => user.tipoAcesso === accessType.nome).length,
      permissions: accessType.permissions?.filter((permission) => permission.startsWith("gkli_colab.")) ??
        colabPermissionsByAccessType[accessType.nome] ??
        []
    }))
  };
}
