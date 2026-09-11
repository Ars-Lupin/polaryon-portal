'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ContentLoader } from '@/components/ContentLoader';
import { Pagination } from '@/components/Pagination';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiFetch, ApiUnauthorizedError } from '@/lib/api';
import type { Empresa, Paginated } from '@/types';

const PAGE_SIZE = 9;

export default function EmpresasPage() {
  const [resultado, setResultado] = useState<Paginated<Empresa> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    async function load() {
      setErro('');
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });

      if (debouncedSearch) {
        params.set('q', debouncedSearch);
      }

      try {
        const response = await apiFetch<Paginated<Empresa>>(`/empresas?${params.toString()}`);
        setResultado(response);
      } catch (error) {
        if (error instanceof ApiUnauthorizedError) return;
        setErro(error instanceof Error ? error.message : 'Erro ao carregar empresas');
        setResultado({
          data: [],
          total: 0,
          page,
          pageSize: PAGE_SIZE,
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [page, debouncedSearch]);

  const empresas = resultado?.data || [];

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

        <label className="relative block max-w-xl">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
            placeholder="Buscar por nome ou e-mail"
          />
        </label>

        {erro && (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-600 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200">
            {erro}
          </div>
        )}

        {loading ? (
          <ContentLoader />
        ) : (
          <>
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

            {resultado && (
              <Pagination
                page={resultado.page}
                pageSize={resultado.pageSize}
                total={resultado.total}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
