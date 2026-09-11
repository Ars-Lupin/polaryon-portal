'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/FormField';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiFetch } from '@/lib/api';
import type { Papel } from '@/types';

export default function NovoPapelPage() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErro('');
    setLoading(true);

    try {
      await apiFetch<Papel>('/papeis', {
        method: 'POST',
        body: JSON.stringify({
          nome,
          descricao,
        }),
      });

      router.push('/dashboard/papeis');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao cadastrar papel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredPermission="papeis.criar">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[var(--accent-readable)]">
            Controle de acesso
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-polar-950 dark:text-white">
            Cadastrar papel
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            Cadastre um novo papel de acesso.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="polaryon-card rounded-3xl p-6">
          <div className="grid gap-5">
            <FormField label="Nome do papel" value={nome} onChange={setNome} required />

            <FormField
              label="Descrição"
              value={descricao}
              onChange={setDescricao}
              placeholder="Ex: Acesso administrativo ao portal"
            />

            {erro && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200">
                {erro}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard/papeis')}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="polaryon-accent-button rounded-2xl px-5 py-3 text-sm font-bold disabled:opacity-60"
              >
                {loading ? 'Salvando...' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
