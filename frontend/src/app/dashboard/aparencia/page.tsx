'use client';

import { MonitorCog, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function AparenciaPage() {
  const { theme, setTheme } = useTheme();
  const { usuario } = useAuth();

  const options = [
    {
      id: 'light' as const,
      title: 'Tema claro',
      description: 'Interface clara para ambientes bem iluminados.',
      icon: Sun,
    },
    {
      id: 'dark' as const,
      title: 'Tema escuro',
      description: 'Interface escura com fundo mais confortável para uso prolongado.',
      icon: Moon,
    },
  ];

  return (
    <div className="mx-auto flex max-w-6xl animate-fadeIn flex-col gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[.2em] text-[var(--company-secondary)] dark:text-[var(--company-accent)]">
          Configurações
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-polar-950 dark:text-white">
          Aparência
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-300">
          Ajuste o tema visual do portal. As cores institucionais do cabeçalho,
          rodapé e destaques acompanham a empresa vinculada ao seu acesso.
        </p>
      </div>

      <div className="polaryon-card rounded-3xl p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-[var(--company-soft)] p-3 text-[var(--company-secondary)] dark:text-[var(--company-accent)]">
            <MonitorCog size={22} />
          </div>

          <div>
            <h2 className="text-xl font-black text-polar-950 dark:text-white">
              Preferência de tema
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-300">
              Empresa atual: <strong>{usuario?.empresa?.nome || 'Não identificada'}</strong>
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {options.map((option) => {
            const Icon = option.icon;
            const active = theme === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                className={`rounded-3xl border p-5 text-left transition ${
                  active
                    ? 'border-[var(--company-accent)] bg-[var(--company-soft)] ring-2 ring-[var(--company-ring)]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/70 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-2xl p-3 ${
                      active
                        ? 'bg-white/70 text-[var(--company-secondary)] dark:bg-slate-950/50 dark:text-[var(--company-accent)]'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <Icon size={22} />
                  </div>

                  <div>
                    <p className="text-lg font-black text-polar-950 dark:text-white">
                      {option.title}
                    </p>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                      {option.description}
                    </p>

                    {active && (
                      <p className="mt-3 text-xs font-black uppercase tracking-[.18em] text-[var(--company-secondary)] dark:text-[var(--company-accent)]">
                        Ativo agora
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
