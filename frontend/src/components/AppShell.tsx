'use client';

import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  ChevronDown,
  Home,
  LogOut,
  Menu,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  ShieldCheck,
  UserCog,
  UserRound,
  UsersRound,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from './Logo';
import { NotificationBell } from './NotificationBell';

type MenuItem = {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  permission?: string;
};

type CompanyTheme = {
  key: string;
  label: string;
  primary: string;
  secondary: string;
  accent: string;
  soft: string;
  ring: string;
  footerText: string;
};

const menu: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Listar usuários',
    href: '/dashboard/usuarios',
    icon: UsersRound,
    permission: 'usuarios.ler',
  },
  {
    label: 'Cadastrar usuário',
    href: '/dashboard/usuarios/novo',
    icon: PlusCircle,
    permission: 'usuarios.criar',
  },
  {
    label: 'Listar empresas',
    href: '/dashboard/empresas',
    icon: Building2,
    permission: 'empresas.ler',
  },
  {
    label: 'Cadastrar empresa',
    href: '/dashboard/empresas/novo',
    icon: PlusCircle,
    permission: 'empresas.criar',
  },
  {
    label: 'Listar papéis',
    href: '/dashboard/papeis',
    icon: UserRound,
    permission: 'papeis.ler',
  },
  {
    label: 'Cadastrar papel',
    href: '/dashboard/papeis/novo',
    icon: PlusCircle,
    permission: 'papeis.criar',
  },
  {
    label: 'Permissões',
    href: '/dashboard/permissoes',
    icon: ShieldCheck,
    permission: 'permissoes.ler',
  },
];

const companyThemes: Record<string, CompanyTheme> = {
  macroex: {
    key: 'macroex',
    label: 'Macroex',
    primary: '#07005d',
    secondary: '#3441e8',
    accent: '#2f63e0',
    soft: '#e8eaff',
    ring: 'rgba(52, 65, 232, 0.34)',
    footerText: 'A parceria que importa',
  },
  actus: {
    key: 'actus',
    label: 'Actus',
    primary: '#164f67',
    secondary: '#1f6f91',
    accent: '#2d88ab',
    soft: '#e4f4f8',
    ring: 'rgba(31, 111, 145, 0.34)',
    footerText: 'Conexões inteligentes para parceiros',
  },
  kamell: {
    key: 'kamell',
    label: 'Kamell',
    primary: '#8d7609',
    secondary: '#f1c93b',
    accent: '#e6db6d',
    soft: '#fff8c9',
    ring: 'rgba(241, 201, 59, 0.38)',
    footerText: 'Criatividade que conecta marcas',
  },
  atmos: {
    key: 'atmos',
    label: 'Atmos',
    primary: '#8d4719',
    secondary: '#f47c2c',
    accent: '#ff995c',
    soft: '#fff0e6',
    ring: 'rgba(244, 124, 44, 0.34)',
    footerText: 'Energia, gestão e movimento',
  },
  tohatsu: {
    key: 'tohatsu',
    label: 'Tohatsu',
    primary: '#0b0d1f',
    secondary: '#171932',
    accent: '#202342',
    soft: '#f4f1f7',
    ring: 'rgba(23, 25, 50, 0.34)',
    footerText: 'Performance e confiança',
  },
  default: {
    key: 'default',
    label: 'Polaryon',
    primary: '#07111f',
    secondary: '#3441e8',
    accent: '#2f63e0',
    soft: '#e8eaff',
    ring: 'rgba(52, 65, 232, 0.34)',
    footerText: 'Portal de parceiros',
  },
};

function normalizeCompanyName(value?: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getCompanyTheme(companyName?: string) {
  const normalized = normalizeCompanyName(companyName);

  if (normalized.includes('macroex')) return companyThemes.macroex;
  if (normalized.includes('actus')) return companyThemes.actus;
  if (normalized.includes('kamell')) return companyThemes.kamell;
  if (normalized.includes('atmos')) return companyThemes.atmos;
  if (normalized.includes('tohatsu')) return companyThemes.tohatsu;

  return companyThemes.default;
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { usuario, logout, hasPermission } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('polaryon.sidebar.collapsed') === '1',
  );
  const [profileOpen, setProfileOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const companyTheme = useMemo(
    () => getCompanyTheme(usuario?.empresa?.nome),
    [usuario?.empresa?.nome],
  );

  const shellStyle = {
    '--company-primary': companyTheme.primary,
    '--company-secondary': companyTheme.secondary,
    '--company-accent': companyTheme.accent,
    '--company-soft': companyTheme.soft,
    '--company-ring': companyTheme.ring,
  } as CSSProperties;

  useEffect(() => {
    document.documentElement.setAttribute('data-company', companyTheme.key);
  }, [companyTheme.key]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!profileMenuRef.current) return;

      if (!profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem('polaryon.sidebar.collapsed', next ? '1' : '0');
      return next;
    });
  };

  const visibleMenu = menu.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  return (
    <div style={shellStyle} className="app-shell min-h-screen text-[var(--text)]">
      <header className="polaryon-header sticky top-0 z-40 border-b border-white/10 px-5 shadow-soft md:px-8">
        <div className="flex h-28 items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-5 md:gap-8">
            <button
              type="button"
              onClick={toggleSidebar}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
              title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen size={22} />
              ) : (
                <PanelLeftClose size={22} />
              )}
            </button>

            <div className="polaryon-brand-lock shrink-0">
              <Logo className="h-20 w-72 md:h-20 md:w-80" />
            </div>

            <div className="hidden min-w-0 md:block">
              <h1 className="truncate text-3xl font-extrabold tracking-tight text-white">
                Portal de parceiros
              </h1>

              <p className="mt-2 truncate text-sm font-bold uppercase tracking-[.2em] text-white/72">
                {usuario?.empresa?.nome || companyTheme.label}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />

            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                className="flex items-center gap-3 rounded-3xl border border-white/15 bg-white/10 p-2 pr-3 text-left text-white transition hover:bg-white/20"
              >
                <div className="grid h-12 w-12 place-items-center rounded-full border border-white/70 bg-white/10">
                  <UserRound size={25} />
                </div>

                <div className="hidden max-w-[180px] text-right sm:block">
                  <p className="truncate text-sm font-bold leading-tight">
                    {usuario?.nome || 'Usuário'}
                  </p>

                  <p className="truncate text-xs text-white/65">
                    {usuario?.papel?.nome || 'Perfil'}
                  </p>
                </div>

                <ChevronDown
                  size={18}
                  className={`transition ${profileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl border border-[var(--surface-border)] bg-[var(--surface)] text-[var(--text)] shadow-2xl backdrop-blur-xl">
                  <div className="border-b border-[var(--surface-border)] bg-black/5 p-4">
                    <p className="truncate text-sm font-black">
                      {usuario?.nome || 'Usuário'}
                    </p>

                    <p className="truncate text-xs opacity-70">
                      {usuario?.email || '-'}
                    </p>

                    <div className="mt-3 rounded-2xl bg-[var(--company-soft)] px-3 py-2 text-xs font-bold text-[var(--accent-readable)]">
                      {usuario?.empresa?.nome || companyTheme.label}
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/dashboard/perfil"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition hover:bg-black/5"
                    >
                      <UserCog size={18} />
                      Configuração de perfil
                    </Link>

                    <Link
                      href="/dashboard/seguranca"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition hover:bg-black/5"
                    >
                      <ShieldCheck size={18} />
                      Segurança
                    </Link>

                    <Link
                      href="/dashboard/aparencia"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition hover:bg-black/5"
                    >
                      <Palette size={18} />
                      Aparência
                    </Link>

                    <div className="my-2 border-t border-[var(--surface-border)]" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-red-500 transition hover:bg-red-500/10"
                    >
                      <LogOut size={18} />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-7rem)]">
        <aside
          className={`polaryon-sidebar sticky top-28 hidden h-[calc(100vh-7rem)] shrink-0 flex-col border-r transition-all duration-300 md:flex ${
            sidebarCollapsed ? 'w-24' : 'w-72'
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-[var(--surface-border)] px-5">
            {!sidebarCollapsed && (
              <div>
                <p className="text-xs font-black uppercase tracking-[.2em] text-[var(--accent-readable)]">
                  Menu
                </p>

                <p className="text-[11px] opacity-60">
                  Navegação principal
                </p>
              </div>
            )}

            {sidebarCollapsed && (
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--company-soft)] text-[var(--accent-readable)]">
                <Menu size={20} />
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {visibleMenu.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`polaryon-menu-item group flex w-full items-center rounded-2xl px-4 py-3 text-left text-sm font-bold ${
                    sidebarCollapsed ? 'justify-center gap-0' : 'gap-4'
                  } ${
                    active
                      ? 'polaryon-menu-active'
                      : 'text-[var(--text)] opacity-72 hover:bg-black/5 hover:opacity-100'
                  }`}
                >
                  <Icon size={20} className="shrink-0" />

                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[var(--surface-border)] p-3">
            <button
              onClick={handleLogout}
              type="button"
              title={sidebarCollapsed ? 'Sair' : undefined}
              className={`flex w-full items-center rounded-2xl px-4 py-3 text-sm font-bold text-red-500 transition hover:bg-red-500/10 ${
                sidebarCollapsed ? 'justify-center gap-0' : 'gap-4'
              }`}
            >
              <LogOut size={20} />

              {!sidebarCollapsed && <span>Sair</span>}
            </button>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 p-5 md:p-8">{children}</div>

          <footer className="polaryon-footer border-t border-white/10 px-8 py-8">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
              <div className="flex items-center gap-5">
                <div className="polaryon-brand-lock shrink-0">
                  <Logo className="h-16 w-56 md:h-18 md:w-64" />
                </div>

                <div className="hidden h-12 w-px bg-white/20 md:block" />

                <div>
                  <p className="text-base font-black text-white">
                    {usuario?.empresa?.nome || companyTheme.label}
                  </p>

                  <p className="mt-1 text-sm font-medium text-white/68">
                    {companyTheme.footerText}
                  </p>
                </div>
              </div>

              <p className="text-sm font-semibold uppercase tracking-[.22em] text-white/55">
                Polaryon Portal de Parceiros
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}