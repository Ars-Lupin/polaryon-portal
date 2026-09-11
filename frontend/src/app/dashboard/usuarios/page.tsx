'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ContentLoader } from '@/components/ContentLoader';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Paginated, UsuarioLista } from '@/types';

const PAGE_SIZE = 10;

export default function UsuariosPage() {
  const { hasPermission } = useAuth();
  const [resultado, setResultado] = useState<Paginated<UsuarioLista> | null>(null);
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
        const response = await apiFetch<Paginated<UsuarioLista>>(`/usuarios?${params.toString()}`);
        setResultado(response);
      } catch (error) {
        setErro(error instanceof Error ? error.message : 'Erro ao carregar usuários');
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

  const usuarios = resultado?.data || [];

  return (
    <ProtectedRoute requiredPermission="usuarios.ler">
      {!resultado && loading ? (
        <ContentLoader />
      ) : (
        <div className="mx-auto flex max-w-7xl animate-fadeIn flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[var(--accent-readable)]">
                Controle de acesso
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-polar-950 dark:text-white">
                Lista de usuários
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                A lista mostra somente usuários vinculados à empresa do login atual.
              </p>
            </div>

            {hasPermission('usuarios.criar') && (
              <Link
                href="/dashboard/usuarios/novo"
                className="polaryon-accent-button inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold"
              >
                Cadastrar usuário
              </Link>
            )}
          </div>

          <label className="relative block max-w-xl">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
              placeholder="Buscar por nome, e-mail, usuário ou documento"
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
              <DataTable
                title="Usuários da empresa"
                rows={usuarios}
                columns={[
                  {
                    header: 'Nome',
                    render: (row) => (
                      <div>
                        <strong className="block text-polar-950 dark:text-white">
                          {row.nome}
                        </strong>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          @{row.usuario || '-'}
                        </span>
                      </div>
                    ),
                  },
                  {
                    header: 'E-mail',
                    render: (row) => row.email || '-',
                  },
                  {
                    header: 'Telefone',
                    render: (row) => row.telefone || '-',
                  },
                  {
                    header: 'CPF',
                    render: (row) => row.cpf || '-',
                  },
                  {
                    header: 'CNPJ',
                    render: (row) => row.cnpj || '-',
                  },
                  {
                    header: 'Papel',
                    render: (row) => (
                      <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent-readable)]">
                        {row.acesso}
                      </span>
                    ),
                  },
                  {
                    header: 'MFA',
                    render: (row) =>
                      row.mfaAtivo ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          Ativo
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          Inativo
                        </span>
                      ),
                  },
                ]}
              />

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
      )}
    </ProtectedRoute>
  );
}
