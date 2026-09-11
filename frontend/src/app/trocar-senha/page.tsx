'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, LogOut, ShieldCheck } from 'lucide-react';
import { AuroraBackground } from '@/components/AuroraBackground';
import { AuthCard } from '@/components/AuthCard';
import { FormField } from '@/components/FormField';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function TrocarSenhaPage() {
  const router = useRouter();
  const { usuario, changePasswordRequired, logout } = useAuth();

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setErro('');
    setLoading(true);

    try {
      await changePasswordRequired({
        senhaAtual,
        novaSenha,
        confirmarNovaSenha,
      });

      router.replace('/dashboard');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AuroraBackground>
        <div className="grid min-h-screen place-items-center px-6 py-10">
          <AuthCard
            title="Troca obrigatória de senha"
            subtitle="Por segurança, altere sua senha antes de acessar o portal"
          >
            <div className="mb-5 rounded-3xl border border-blue-100 bg-blue-50 p-5 text-blue-900 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white/70 p-3 text-blue-700 dark:bg-slate-950/40 dark:text-blue-200">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <p className="font-black">
                    Olá, {usuario?.nome || 'usuário'}
                  </p>

                  <p className="mt-1 text-sm">
                    Sua conta está marcada para troca de senha. Depois da alteração,
                    você será liberado para acessar o dashboard.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Senha atual"
                type="password"
                value={senhaAtual}
                onChange={setSenhaAtual}
                required
              />

              <FormField
                label="Nova senha"
                type="password"
                value={novaSenha}
                onChange={setNovaSenha}
                required
                placeholder="Mínimo 12 caracteres"
              />

              <FormField
                label="Confirmar nova senha"
                type="password"
                value={confirmarNovaSenha}
                onChange={setConfirmarNovaSenha}
                required
              />

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                A nova senha deve conter pelo menos 12 caracteres, letra maiúscula,
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
                className="polaryon-accent-button flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60"
              >
                <KeyRound size={18} />
                {loading ? 'Alterando...' : 'Alterar senha e entrar'}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <LogOut size={18} />
                Sair e voltar ao login
              </button>
            </form>
          </AuthCard>
        </div>
      </AuroraBackground>
    </ProtectedRoute>
  );
}