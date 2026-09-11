'use client';

import { useEffect, useState } from 'react';
import { AuthenticatorQrCard } from '@/components/AuthenticatorQrCard';
import { apiFetch } from '@/lib/api';
import type { AuthenticatorSetupResponse } from '@/types';

export default function SegurancaPage() {
  const [data, setData] = useState<AuthenticatorSetupResponse | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    apiFetch<AuthenticatorSetupResponse>('/auth/mfa/authenticator/setup')
      .then(setData)
      .catch((error) => {
        setErro(error instanceof Error ? error.message : 'Erro ao carregar QR Code');
      });
  }, []);

  return (
    <div className="mx-auto flex max-w-6xl animate-fadeIn flex-col gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[.2em] text-[var(--company-secondary)] dark:text-[var(--company-accent)]">
          Configurações
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-polar-950 dark:text-white">
          Segurança
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-300">
          Configure sua autenticação em duas etapas com aplicativo autenticador.
        </p>
      </div>

      {erro && (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-600 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200">
          {erro}
        </div>
      )}

      {data && <AuthenticatorQrCard data={data} />}
    </div>
  );
}
