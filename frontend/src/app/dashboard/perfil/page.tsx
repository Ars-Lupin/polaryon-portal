'use client';

import { Building2, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function PerfilPage() {
  const { usuario } = useAuth();

  return (
    <div className="mx-auto flex max-w-6xl animate-fadeIn flex-col gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[.2em] text-[var(--company-secondary)] dark:text-[var(--company-accent)]">
          Configurações
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-polar-950 dark:text-white">
          Configuração de perfil
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-300">
          Consulte as informações do seu usuário, empresa vinculada e papel de acesso.
        </p>
      </div>

      <div className="polaryon-card rounded-3xl p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-[2rem] bg-[var(--company-soft)] text-[var(--company-secondary)] dark:text-[var(--company-accent)]">
            <UserRound size={42} />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-2xl font-black text-polar-950 dark:text-white">
              {usuario?.nome || 'Usuário'}
            </h2>

            <p className="mt-1 truncate text-sm font-semibold text-slate-500 dark:text-slate-300">
              {usuario?.email}
            </p>

            <div className="mt-4 inline-flex rounded-full bg-[var(--company-soft)] px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-[var(--company-secondary)] dark:text-[var(--company-accent)]">
              {usuario?.papel?.nome || 'Perfil'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="polaryon-card rounded-3xl p-5">
          <div className="mb-4 rounded-2xl bg-[var(--company-soft)] p-3 text-[var(--company-secondary)] dark:text-[var(--company-accent)] w-fit">
            <Mail size={22} />
          </div>

          <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400 dark:text-slate-500">
            E-mail
          </p>

          <p className="mt-2 break-all text-sm font-bold text-polar-950 dark:text-white">
            {usuario?.email || '-'}
          </p>
        </div>

        <div className="polaryon-card rounded-3xl p-5">
          <div className="mb-4 rounded-2xl bg-[var(--company-soft)] p-3 text-[var(--company-secondary)] dark:text-[var(--company-accent)] w-fit">
            <Building2 size={22} />
          </div>

          <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400 dark:text-slate-500">
            Empresa
          </p>

          <p className="mt-2 text-sm font-bold text-polar-950 dark:text-white">
            {usuario?.empresa?.nome || '-'}
          </p>
        </div>

        <div className="polaryon-card rounded-3xl p-5">
          <div className="mb-4 rounded-2xl bg-[var(--company-soft)] p-3 text-[var(--company-secondary)] dark:text-[var(--company-accent)] w-fit">
            <ShieldCheck size={22} />
          </div>

          <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400 dark:text-slate-500">
            Permissões
          </p>

          <p className="mt-2 text-sm font-bold text-polar-950 dark:text-white">
            {usuario?.permissoes?.length || 0} permissões
          </p>
        </div>
      </div>
    </div>
  );
}
