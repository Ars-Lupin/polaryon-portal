'use client';

import { useEffect, useState } from 'react';
import { ContentLoader } from '@/components/ContentLoader';
import { SummaryCards } from '@/components/SummaryCards';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch, ApiUnauthorizedError } from '@/lib/api';
import type { DashboardSummary } from '@/types';

export default function DashboardPage() {
  const { usuario, loading } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (loading || !usuario) return;

    async function load() {
      try {
        const summaryResponse = await apiFetch<DashboardSummary>('/dashboard/summary');
        setSummary(summaryResponse);
      } catch (error) {
        if (error instanceof ApiUnauthorizedError) return;
        setErro(error instanceof Error ? error.message : 'Erro ao carregar dashboard');
      }
    }

    load();
  }, [loading, usuario]);

  return erro ? (
    <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-600 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200">
      {erro}
    </div>
  ) : !summary ? (
    <ContentLoader />
  ) : (
    <div className="mx-auto flex max-w-7xl animate-fadeIn flex-col gap-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[.2em] text-cyan-600">
          Polaryon
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-polar-950 dark:text-white">
          Dashboard
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-300">
          Esta tela mostra apenas o resumo da empresa vinculada ao login atual.
          As listas e cadastros ficam nos menus liberados para o papel do usuário.
        </p>

        <div className="polaryon-card mt-4 rounded-3xl p-5 text-sm text-[var(--text)]">
          <strong>Empresa atual:</strong> {usuario?.empresa.nome || summary.empresaAtual}
          <br />
          <strong>Papel:</strong> {usuario?.papel.nome}
          <br />
          <strong>Permissões:</strong>{' '}
          {usuario?.permissoes.join(', ') || 'Nenhuma permissão extra'}
        </div>
      </div>

      <SummaryCards summary={summary} />
    </div>
  );
}
