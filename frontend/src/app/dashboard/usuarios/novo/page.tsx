'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/FormField';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SelectField } from '@/components/SelectField';
import { apiFetch, ApiUnauthorizedError } from '@/lib/api';
import type { Papel, UsuarioLista } from '@/types';

export default function NovoUsuarioPage() {
  const router = useRouter();

  const [papeis, setPapeis] = useState<Papel[]>([]);
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [senha, setSenha] = useState('');
  const [papelId, setPapelId] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadPapeis() {
      try {
        const response = await apiFetch<Papel[]>('/papeis');
        setPapeis(response);

        const papelRevenda =
          response.find((papel) => papel.nome.toLowerCase() === 'revenda') ||
          response[0];

        setPapelId((current) => current || papelRevenda?.id || '');
      } catch (error) {
        if (error instanceof ApiUnauthorizedError) return;
        setErro(error instanceof Error ? error.message : 'Erro ao carregar papéis');
      }
    }

    loadPapeis();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErro('');
    setLoading(true);

    try {
      await apiFetch<UsuarioLista>('/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          nome,
          usuario,
          email,
          telefone,
          cpf,
          cnpj,
          senha,
          papelId,
        }),
      });

      router.push('/dashboard/usuarios');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao cadastrar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredPermission="usuarios.criar">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[var(--accent-readable)]">
            Controle de acesso
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-polar-950 dark:text-white">
            Cadastrar usuário
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            O usuário será vinculado automaticamente à empresa logada.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="polaryon-card rounded-3xl p-6">
          <div className="grid gap-5">
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
              label="Senha inicial"
              type="password"
              value={senha}
              onChange={setSenha}
              required
              placeholder="Mínimo 12 caracteres"
            />

            <SelectField
              label="Papel"
              value={papelId}
              onChange={setPapelId}
              required
              options={papeis.map((papel) => ({
                value: papel.id,
                label: papel.nome,
              }))}
            />

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300">
              O usuário poderá entrar usando usuário, e-mail, telefone, CPF ou CNPJ.
              O nome é apenas informativo e não serve para login.
            </div>

            {erro && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200">
                {erro}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard/usuarios')}
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
