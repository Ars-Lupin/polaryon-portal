'use client';

import { useEffect, useState } from 'react';
import { ContentLoader } from '@/components/ContentLoader';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiFetch, ApiUnauthorizedError } from '@/lib/api';
import type { Empresa } from '@/types';

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await apiFetch<Empresa[]>('/empresas');
        setEmpresas(response);
      } catch (error) {
        if (error instanceof ApiUnauthorizedError) return;
        setErro(error instanceof Error ? error.message : 'Erro ao carregar empresas');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <ProtectedRoute requiredPermission="empresas.ler">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[var(--accent-readable)]">
            Controle de acesso
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-polar-950 dark:text-white">
            Empresas
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            Empresas disponíveis no portal.
          </p>
        </div>

        {erro && (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-600 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200">
            {erro}
          </div>
        )}

        {loading ? (
          <ContentLoader />
        ) : (
          <div className="grid animate-fadeIn gap-4 md:grid-cols-2 xl:grid-cols-3">
            {empresas.map((empresa) => (
              <article key={empresa.id} className="polaryon-card rounded-3xl p-6">
                <h2 className="text-xl font-black text-polar-950 dark:text-white">
                  {empresa.nome}
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                  {empresa.email || 'Sem e-mail cadastrado'}
                </p>

                <div className="mt-5 h-2 rounded-full bg-[var(--accent)]" />
              </article>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
