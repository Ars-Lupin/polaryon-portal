'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { AuroraBackground } from '@/components/AuroraBackground';
import { AuthCard } from '@/components/AuthCard';
import { FormField } from '@/components/FormField';
import { MfaVerificationCard } from '@/components/MfaVerificationCard';
import { SelectField } from '@/components/SelectField';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import type { AuthOptions, MfaSessionResponse } from '@/types';

function isMfaSession(response: unknown): response is MfaSessionResponse {
  return Boolean(
    response &&
      typeof response === 'object' &&
      'mfaRequired' in response &&
      'mfaSessionId' in response,
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [empresas, setEmpresas] = useState<AuthOptions['empresas']>([]);
  const [empresaId, setEmpresaId] = useState('');
  const [identificador, setIdentificador] = useState('admin_macroex');
  const [senha, setSenha] = useState('Admin@123456');
  const [mfaSession, setMfaSession] = useState<MfaSessionResponse | null>(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      const response = await apiFetch<AuthOptions>('/auth/options');
      setEmpresas(response.empresas);
      setEmpresaId((current) => current || response.empresas[0]?.id || '');
    }

    loadOptions().catch(() => setErro('Não foi possível carregar as empresas'));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const response = await login({
        empresaId,
        identificador,
        senha,
      });

      if (isMfaSession(response)) {
        setMfaSession(response);
        return;
      }

      router.replace('/dashboard');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground>
      <div className="absolute right-6 top-6 z-20">
        <ThemeToggle />
      </div>

      <div className="grid min-h-screen place-items-center px-6 py-10">
        <AuthCard
          title={mfaSession ? 'Verificação de segurança' : 'Portal de parceiros'}
          subtitle={
            mfaSession
              ? 'Escolha e confirme seu método de autenticação em duas etapas'
              : 'Entre informando a empresa vinculada ao seu acesso'
          }
        >
          {mfaSession ? (
            <MfaVerificationCard
              session={mfaSession}
              onSuccess={() => router.replace('/dashboard')}
              onCancel={() => {
                setMfaSession(null);
                setErro('');
              }}
            />
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <SelectField
                  label="Empresa"
                  value={empresaId}
                  onChange={setEmpresaId}
                  required
                  options={empresas.map((empresa) => ({
                    value: empresa.id,
                    label: empresa.nome,
                  }))}
                />

                <FormField
                  label="Usuário, e-mail, telefone, CPF ou CNPJ"
                  value={identificador}
                  onChange={setIdentificador}
                  required
                  placeholder="admin_macroex"
                />

                <FormField
                  label="Senha"
                  type="password"
                  value={senha}
                  onChange={setSenha}
                  required
                />

                {erro && (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-200">
                    {erro}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="polaryon-accent-button w-full rounded-2xl px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Validando...' : 'Entrar'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-300">
                Ainda não tem acesso?{' '}
                <Link
                  href="/cadastro"
                  className="font-bold hover:underline"
                  style={{ color: 'var(--accent-readable)' }}
                >
                  Cadastre-se
                </Link>
              </p>
            </>
          )}
        </AuthCard>
      </div>
    </AuroraBackground>
  );
}