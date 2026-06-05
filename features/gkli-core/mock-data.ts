export const users = [
  {
    id: "usr_001",
    nome: "Mariana Lopes",
    email: "mariana.lopes@gkli.com.br",
    status: "Ativo",
    tipoAcesso: "Administrador",
    apps: ["COB", "Flex", "Core", "Colab"],
    carteiras: ["Administradora Modelo", "Condomínios RJ"]
  },
  {
    id: "usr_002",
    nome: "Rafael Nunes",
    email: "rafael.nunes@gkli.com.br",
    status: "Ativo",
    tipoAcesso: "Operação",
    apps: ["COB", "Core", "Colab"],
    carteiras: ["Condomínios SP"]
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
    descricao: "Pode gerenciar usuários, apps, carteiras e permissões globais.",
    nivel: "Global",
    usuarios: 1
  },
  {
    id: "operacao",
    nome: "Operação",
    descricao: "Acesso operacional aos apps habilitados e às carteiras vinculadas.",
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
    descricao: "Cobrança, acordos, régua e mensageria."
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
  },
  {
    id: "gkli_colab",
    nome: "GKLI Colab",
    namespace: "gkli_colab",
    status: "Ativo",
    usuarios: 2,
    descricao: "Área do colaborador para pagamentos e recibos."
  }
];

export const platformApps = [
  {
    id: "gkli_core",
    nome: "GKLI Core",
    descricao: "Usuários, carteiras, perfis, apps e auditoria.",
    area: "Administração",
    status: "Operacional",
    href: "/modulos/gkli-core/cockpit"
  },
  {
    id: "gkli_cob",
    nome: "GKLI COB",
    descricao: "Cobrança, acordos, régua e mensageria.",
    area: "Cobrança",
    status: "Operacional",
    href: process.env.NEXT_PUBLIC_GKLI_COB_URL ?? "#"
  },
  {
    id: "gkli_flex",
    nome: "GKLI Flex",
    descricao: "Financeiro operacional, pagamentos e fechamentos.",
    area: "Financeiro",
    status: "Operacional",
    href: process.env.NEXT_PUBLIC_GKLI_FLEX_URL ?? "#"
  },
  {
    id: "gkli_colab",
    nome: "GKLI Colab",
    descricao: "Portal individual de colaboradores, pagamentos e recibos.",
    area: "Portal do colaborador",
    status: "Operacional",
    href: process.env.NEXT_PUBLIC_GKLI_COLAB_URL ?? "#"
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
    nome: "Condomínios RJ",
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
  },
  {
    id: "cart_004",
    nome: "Colaboradores GKLI",
    codigo: "COLAB-GKLI",
    appOrigem: "GKLI Colab",
    usuarios: 2,
    status: "Ativa"
  }
];

export const cockpitTasks = [
  {
    title: "Padronizar permissões entre Core, COB e Flex",
    meta: "Permissões devem nascer no Core e ser consumidas pelos apps.",
    status: "Arquitetura",
    tone: "blue"
  },
  {
    title: "Definir regra de carteira global",
    meta: "Admins podem enxergar tudo; usuários comuns precisam de vínculo explícito.",
    status: "Crítico",
    tone: "yellow"
  },
  {
    title: "Auditar vínculos pendentes",
    meta: "Usuários sem app ou sem carteira devem aparecer como pendência operacional.",
    status: "Pendente",
    tone: "red"
  }
];
