'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Mail, ShieldCheck, Smartphone } from 'lucide-react';
import { FormField } from '@/components/FormField';
import { useAuth } from '@/contexts/AuthContext';
import type {
  MfaChallengeResponse,
  MfaMethod,
  MfaSessionResponse,
} from '@/types';

type MfaVerificationCardProps = {
  session: MfaSessionResponse;
  onSuccess: () => void;
  onCancel: () => void;
};

function getMethodIcon(method: MfaMethod) {
  if (method === 'EMAIL') return <Mail size={18} />;
  return <Smartphone size={18} />;
}

export function MfaVerificationCard({
  session,
  onSuccess,
  onCancel,
}: MfaVerificationCardProps) {
  const { requestMfa, verifyMfa } = useAuth();

  const [metodo, setMetodo] = useState<MfaMethod>(session.defaultMethod);
  const [challenge, setChallenge] = useState<MfaChallengeResponse | null>(null);
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedMethod = useMemo(
    () => session.methods.find((item) => item.metodo === metodo),
    [session.methods, metodo],
  );

  const handleRequestMfa = async () => {
    setErro('');
    setLoading(true);

    try {
      const response = await requestMfa({
        mfaSessionId: session.mfaSessionId,
        metodo,
      });

      setChallenge(response);
      setCodigo('');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao solicitar MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async (event: FormEvent) => {
    event.preventDefault();

    if (!challenge) {
      return;
    }

    setErro('');
    setLoading(true);

    try {
      await verifyMfa({
        challengeId: challenge.challengeId,
        codigo,
      });

      onSuccess();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao validar código');
    } finally {
      setLoading(false);
    }
  };

  if (challenge) {
    return (
      <div className="space-y-5">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-900/80">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent-readable)]">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2 className="text-lg font-black text-polar-950 dark:text-white">
                Confirmação em duas etapas
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                Método selecionado: <strong>{challenge.metodoLabel}</strong>
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Destino: {challenge.destino}
              </p>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {challenge.mensagem}
              </p>
            </div>
          </div>
        </div>

        {challenge.metodo === 'AUTHENTICATOR' && (
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100">
            <p className="font-bold">Aplicativo autenticador</p>

            <p className="mt-1">
              Abra o Google Authenticator, Microsoft Authenticator ou outro aplicativo
              compatível e informe o código atual.
            </p>
          </div>
        )}

        <form onSubmit={handleVerifyMfa} className="space-y-4">
          <FormField
            label="Código de 6 dígitos"
            value={codigo}
            onChange={setCodigo}
            placeholder="000000"
            required
          />

          {erro && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-200">
              {erro}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setChallenge(null);
                setCodigo('');
                setErro('');
              }}
              disabled={loading}
              className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Trocar método
            </button>

            <button
              type="submit"
              disabled={loading}
              className="polaryon-accent-button w-full rounded-2xl px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Validando...' : 'Validar código'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-900/80">
        <h2 className="text-lg font-black text-polar-950 dark:text-white">
          Escolha a verificação em duas etapas
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
          Por segurança, escolha como deseja confirmar sua identidade.
        </p>
      </div>

      <div className="grid gap-3">
        {session.methods.map((method) => {
          const active = method.metodo === metodo;

          return (
            <button
              key={method.metodo}
              type="button"
              onClick={() => setMetodo(method.metodo)}
              className={`flex items-center gap-3 rounded-3xl border px-4 py-4 text-left transition ${
                active
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-readable)]'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white/10'
              }`}
            >
              <div
                className={`rounded-2xl p-3 ${
                  active
                    ? 'bg-white/70 dark:bg-slate-950/40'
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {getMethodIcon(method.metodo)}
              </div>

              <div className="flex-1">
                <p className="font-black">{method.label}</p>
                <p className="mt-1 text-xs opacity-75">{method.destino}</p>
              </div>

              <div
                className={`h-4 w-4 rounded-full border ${
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent)]'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              />
            </button>
          );
        })}
      </div>

      {selectedMethod && (
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Método selecionado: <strong>{selectedMethod.label}</strong>
        </p>
      )}

      {erro && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {erro}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={handleRequestMfa}
          disabled={loading}
          className="polaryon-accent-button w-full rounded-2xl px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Solicitando...' : 'Continuar'}
        </button>
      </div>
    </div>
  );
}