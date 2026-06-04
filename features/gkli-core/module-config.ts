import {
  AppWindow,
  BriefcaseBusiness,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  Users
} from "lucide-react";

export const coreSchemaName = "gkli_core";

export const corePermissions = [
  "gkli_core.admin",
  "gkli_core.usuarios.read",
  "gkli_core.usuarios.write",
  "gkli_core.acessos.read",
  "gkli_core.acessos.write",
  "gkli_core.apps.read",
  "gkli_core.apps.write",
  "gkli_core.carteiras.read",
  "gkli_core.carteiras.write"
] as const;

export const coreModules = [
  {
    title: "Cockpit",
    href: "/modulos/gkli-core",
    icon: LayoutDashboard,
    permission: "gkli_core.usuarios.read",
    group: "Governanca"
  },
  {
    title: "Usuarios",
    href: "/modulos/gkli-core/usuarios",
    icon: Users,
    permission: "gkli_core.usuarios.read",
    group: "Identidade"
  },
  {
    title: "Tipos de acesso",
    href: "/modulos/gkli-core/acessos",
    icon: ShieldCheck,
    permission: "gkli_core.acessos.read",
    group: "Identidade"
  },
  {
    title: "Apps permitidos",
    href: "/modulos/gkli-core/apps",
    icon: AppWindow,
    permission: "gkli_core.apps.read",
    group: "Permissoes"
  },
  {
    title: "Carteiras",
    href: "/modulos/gkli-core/carteiras",
    icon: BriefcaseBusiness,
    permission: "gkli_core.carteiras.read",
    group: "Permissoes"
  },
  {
    title: "Chaves e auditoria",
    href: "/modulos/gkli-core/auditoria",
    icon: KeyRound,
    permission: "gkli_core.admin",
    group: "Controle"
  }
];

export type CoreModule = (typeof coreModules)[number];
