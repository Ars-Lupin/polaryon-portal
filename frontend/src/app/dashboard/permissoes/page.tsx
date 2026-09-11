'use client';

import { useEffect, useState } from 'react';
import { ContentLoader } from '@/components/ContentLoader';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiFetch, ApiUnauthorizedError } from '@/lib/api';
import type { Permissao } from '@/types';

export default function PermissoesPage() {
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await apiFetch<Permissao[]>('/permissoes');
        setPermissoes(response);
      } catch (error) {
        if (error instanceof ApiUnauthorizedError) return;
        setErro(error instanceof Error ? error.message : 'Erro ao carregar permissões');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <ProtectedRoute requiredPermission="permissoes.ler">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[var(--accent-readable)]">
            Controle de acesso
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-polar-950 dark:text-white">
            Permissões
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            Permissões disponíveis para controle de acesso do portal.
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
            {permissoes.map((permissao) => (
              <article key={permissao.id} className="polaryon-card rounded-3xl p-6">
                <h2 className="text-lg font-black text-polar-950 dark:text-white">
                  {permissao.nome}
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                  {permissao.descricao || 'Sem descrição'}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
