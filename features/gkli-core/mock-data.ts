export const users = [
  {
    id: "usr_001",
    nome: "Mariana Lopes",
    email: "mariana.lopes@gkli.com.br",
    status: "Ativo",
    tipoAcesso: "Administrador",
    apps: ["COB", "Flex", "Core"],
    carteiras: ["Administradora Modelo", "Condominios RJ"]
  },
  {
    id: "usr_002",
    nome: "Rafael Nunes",
    email: "rafael.nunes@gkli.com.br",
    status: "Ativo",
    tipoAcesso: "Operacao",
    apps: ["COB", "Core"],
    carteiras: ["Condominios SP"]
  },
  {
    id: "usr_003",
    nome: "Bianca Prado",
    email: "bianca.prado@gkli.com.br",
    status: "Pendente",
    tipoAcesso: "Financeiro",
    apps: ["Flex"],
    carteiras: ["Pagamentos Flex"]
  }
];

export const accessTypes = [
  {
    id: "admin",
    nome: "Administrador",
    descricao: "Pode gerenciar usuarios, apps, carteiras e permissoes globais.",
    nivel: "Global",
    usuarios: 1
  },
  {
    id: "operacao",
    nome: "Operacao",
    descricao: "Acesso operacional aos apps habilitados e as carteiras vinculadas.",
    nivel: "Carteira",
    usuarios: 1
  },
  {
    id: "financeiro",
    nome: "Financeiro",
    descricao: "Permite rotinas financeiras dentro dos apps autorizados.",
    nivel: "Carteira",
    usuarios: 1
  }
];

export const apps = [
  {
    id: "gkli_cob",
    nome: "GKLI COB",
    namespace: "gkli_cob",
    status: "Ativo",
    usuarios: 2,
    descricao: "Cobranca, acordos, regua e mensageria."
  },
  {
    id: "gkli_flex",
    nome: "GKLI Flex",
    namespace: "gkli_flex",
    status: "Ativo",
    usuarios: 2,
    descricao: "Financeiro operacional light."
  },
  {
    id: "gkli_core",
    nome: "GKLI Core",
    namespace: "gkli_core",
    status: "Sistema",
    usuarios: 1,
    descricao: "Identidade, acessos, apps e carteiras."
  }
];

export const wallets = [
  {
    id: "cart_001",
    nome: "Administradora Modelo",
    codigo: "ADM-MODELO",
    appOrigem: "GKLI COB",
    usuarios: 1,
    status: "Ativa"
  },
  {
    id: "cart_002",
    nome: "Condominios RJ",
    codigo: "COB-RJ",
    appOrigem: "GKLI COB",
    usuarios: 1,
    status: "Ativa"
  },
  {
    id: "cart_003",
    nome: "Pagamentos Flex",
    codigo: "FLEX-PAG",
    appOrigem: "GKLI Flex",
    usuarios: 1,
    status: "Ativa"
  }
];

export const cockpitTasks = [
  {
    title: "Padronizar permissoes entre Core, COB e Flex",
    meta: "Permissoes devem nascer no Core e ser consumidas pelos apps.",
    status: "Arquitetura",
    tone: "blue"
  },
  {
    title: "Definir regra de carteira global",
    meta: "Admins podem enxergar tudo; usuarios comuns precisam de vinculo explicito.",
    status: "Critico",
    tone: "yellow"
  },
  {
    title: "Auditar vinculos pendentes",
    meta: "Usuarios sem app ou sem carteira devem aparecer como pendencia operacional.",
    status: "Pendente",
    tone: "red"
  }
];
