export type CoreUser = {
  id: string;
  nome: string;
  email: string;
  status: string;
  tipoAcessoId?: string;
  tipoAcesso: string;
  appIds: string[];
  apps: string[];
  carteiraIds: string[];
  carteiras: string[];
};

export type CoreAccessType = {
  id: string;
  nome: string;
  descricao: string;
  nivel: string;
  usuarios: number;
  permissions?: string[];
};

export type CoreApp = {
  id: string;
  nome: string;
  namespace: string;
  status: string;
  usuarios: number;
  descricao: string;
};

export type CoreWallet = {
  id: string;
  nome: string;
  codigo: string;
  appOrigem: string;
  usuarios: number;
  status: string;
};

export type CoreAuditRow = {
  id: string;
  evento: string;
  origem: string;
  status: string;
  createdAt?: string;
};

export type CoreData = {
  users: CoreUser[];
  accessTypes: CoreAccessType[];
  apps: CoreApp[];
  wallets: CoreWallet[];
  auditRows: CoreAuditRow[];
  source: "supabase" | "mock";
};
