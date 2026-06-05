import Link from "next/link";
import { LogOut, UserCircle } from "lucide-react";
import { coreModules } from "./module-config";

type CoreShellProps = {
  activeHref: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function CoreShell({
  activeHref,
  title,
  description,
  children
}: CoreShellProps) {
  const groups = Array.from(new Set(coreModules.map((module) => module.group)));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/modulos/gkli-core">
          <span className="brand-mark">
            <img alt="GKLI Core" src="/gkit-icon.png" />
          </span>
          <span>
            <span className="brand-title">GKLI Core</span>
            <span className="brand-subtitle">Identidade e acessos</span>
          </span>
        </Link>

        <nav>
          {groups.map((group) => (
            <div key={group}>
              <div className="nav-group-label">{group}</div>
              {coreModules
                .filter((module) => module.group === group)
                .map((module) => {
                  const Icon = module.icon;
                  const isActive = activeHref === module.href;

                  return (
                    <Link
                      className={`nav-link${isActive ? " active" : ""}`}
                      href={module.href}
                      key={module.href}
                    >
                      <Icon size={17} />
                      <span>{module.title}</span>
                    </Link>
                  );
                })}
            </div>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-account" aria-label="Usuario logado">
            <span className="topbar-avatar">
              <UserCircle size={18} />
            </span>
            <span>
              <span className="topbar-user-name">Operador Core</span>
              <span className="topbar-user-email">sessao administrativa</span>
            </span>
          </div>
          <Link className="button secondary topbar-logout" href="/">
            <LogOut size={15} />
            Sair
          </Link>
        </header>
        <section className="content">{children}</section>
      </main>
    </div>
  );
}

type PageHeaderProps = {
  title: string;
  description: string;
  actions?: React.ReactNode;
  eyebrow?: string;
};

export function PageHeader({ title, description, actions, eyebrow }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        {eyebrow ? <div className="page-eyebrow">{eyebrow}</div> : null}
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {actions ? <div className="toolbar">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  note,
  children
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">{title}</div>
        {note ? <div className="panel-note">{note}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "blue"
}: {
  children: React.ReactNode;
  tone?: "blue" | "green" | "yellow" | "red";
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function InlineNotice({
  title,
  description,
  tone = "blue"
}: {
  title: string;
  description: string;
  tone?: "blue" | "green" | "yellow" | "red";
}) {
  return (
    <div className={`notice ${tone}`}>
      <div className="item-title">{title}</div>
      <div className="item-meta">{description}</div>
    </div>
  );
}
