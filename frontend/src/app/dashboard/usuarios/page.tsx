'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ContentLoader } from '@/components/ContentLoader';
import { DataTable } from '@/components/DataTable';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import type { UsuarioLista } from '@/types';

export default function UsuariosPage() {
  const { hasPermission } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioLista[] | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    apiFetch<UsuarioLista[]>('/usuarios')
      .then(setUsuarios)
      .catch((error) => {
        setErro(error instanceof Error ? error.message : 'Erro ao carregar usuários');
        setUsuarios([]);
      });
  }, []);

  return (
    <ProtectedRoute requiredPermission="usuarios.ler">
      {!usuarios ? (
        <ContentLoader />
      ) : (
        <div className="mx-auto flex max-w-7xl animate-fadeIn flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
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
                className="polaryon-accent-button rounded-2xl px-5 py-3 text-sm font-bold"
              >
                Cadastrar usuário
              </Link>
            )}
          </div>

          {erro && (
            <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-600 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200">
              {erro}
            </div>
          )}

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
        </div>
      )}
    </ProtectedRoute>
  );
}
