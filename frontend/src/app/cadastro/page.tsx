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

export default function CadastroPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [empresas, setEmpresas] = useState<AuthOptions['empresas']>([]);
  const [empresaId, setEmpresaId] = useState('');
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
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
      const response = await register({
        empresaId,
        nome,
        usuario,
        telefone,
        cpf,
        cnpj,
        email,
        senha,
      });

      if (isMfaSession(response)) {
        setMfaSession(response);
        return;
      }

      router.replace('/dashboard');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao cadastrar');
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
          title={mfaSession ? 'Verificação de segurança' : 'Criar acesso'}
          subtitle={
            mfaSession
              ? 'Escolha e confirme seu método de autenticação em duas etapas'
              : 'O cadastro será vinculado à empresa selecionada'
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

                <FormField label="Nome" value={nome} onChange={setNome} required />

                <FormField
                  label="Usuário"
                  value={usuario}
                  onChange={setUsuario}
                  placeholder="ex: joao.silva"
                  required
                />

                <FormField
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  required
                />

                <FormField
                  label="Telefone"
                  value={telefone}
                  onChange={setTelefone}
                  placeholder="27999990000"
                />

                <FormField
                  label="CPF"
                  value={cpf}
                  onChange={setCpf}
                  placeholder="Somente números"
                />

                <FormField
                  label="CNPJ"
                  value={cnpj}
                  onChange={setCnpj}
                  placeholder="Somente números"
                />

                <FormField
                  label="Senha"
                  type="password"
                  value={senha}
                  onChange={setSenha}
                  required
                  placeholder="Mínimo 12 caracteres"
                />

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                  A senha deve ter pelo menos 12 caracteres, letra maiúscula,
                  letra minúscula, número e caractere especial.
                </div>

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
                  {loading ? 'Criando...' : 'Cadastrar'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-300">
                Já possui acesso?{' '}
                <Link
                  href="/login"
                  className="font-bold hover:underline"
                  style={{ color: 'var(--accent-readable)' }}
                >
                  Entrar
                </Link>
              </p>
            </>
          )}
        </AuthCard>
      </div>
    </AuroraBackground>
  );
}