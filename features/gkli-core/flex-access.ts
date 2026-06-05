import { getCoreData } from "./repository";

export type FlexCoreAccessUser = {
  id: string;
  nome: string;
  email: string;
  status: string;
  tipoAcesso: string;
  apps: string[];
  carteiras: string[];
  canOpenFlex: boolean;
};

export type FlexCoreAccessRole = {
  id: string;
  nome: string;
  descricao: string;
  nivel: string;
  usuarios: number;
  permissions: string[];
};

export type FlexCoreAccessWallet = {
  id: string;
  nome: string;
  codigo: string;
  status: string;
};

export type FlexCoreAccessPayload = {
  source: "gkli_core";
  app: {
    id: string;
    nome: string;
    namespace: "gkli_flex";
    status: string;
  };
  users: FlexCoreAccessUser[];
  roles: FlexCoreAccessRole[];
  wallets: FlexCoreAccessWallet[];
};

const flexPermissionsByAccessType: Record<string, string[]> = {
  Administrador: ["gkli_flex.admin"],
  Operação: [
    "gkli_flex.importacoes.read",
    "gkli_flex.importacoes.write",
    "gkli_flex.financeiro.read",
    "gkli_flex.financeiro.write",
    "gkli_flex.pagamentos.read",
    "gkli_flex.pagamentos.write",
    "gkli_flex.fechamentos.read"
  ],
  Financeiro: [
    "gkli_flex.financeiro.read",
    "gkli_flex.financeiro.write",
    "gkli_flex.pagamentos.read",
    "gkli_flex.pagamentos.write"
  ]
};

export async function getFlexCoreAccessPayload(): Promise<FlexCoreAccessPayload> {
  const { accessTypes, apps, users, wallets } = await getCoreData();
  const flexApp = apps.find((app) => app.namespace === "gkli_flex");
  const flexUsers = users.filter((user) => user.apps.includes("Flex"));

  return {
    source: "gkli_core",
    app: {
      id: flexApp?.id ?? "gkli_flex",
      nome: flexApp?.nome ?? "GKLI Flex",
      namespace: "gkli_flex",
      status: flexApp?.status ?? "Ativo"
    },
    users: flexUsers.map((user) => ({
      id: user.id,
      nome: user.nome,
      email: user.email,
      status: user.status,
      tipoAcesso: user.tipoAcesso,
      apps: user.apps,
      carteiras: user.carteiras,
      canOpenFlex: user.apps.includes("Flex")
    })),
    roles: accessTypes.map((accessType) => ({
      id: accessType.id,
      nome: accessType.nome,
      descricao: accessType.descricao,
      nivel: accessType.nivel,
      usuarios: flexUsers.filter((user) => user.tipoAcesso === accessType.nome).length,
      permissions: accessType.permissions?.filter((permission) => permission.startsWith("gkli_flex.")) ??
        flexPermissionsByAccessType[accessType.nome] ??
        []
    })),
    wallets: wallets
      .filter((wallet) => wallet.appOrigem === "GKLI Flex")
      .map((wallet) => ({
        id: wallet.id,
        nome: wallet.nome,
        codigo: wallet.codigo,
        status: wallet.status
      }))
  };
}
