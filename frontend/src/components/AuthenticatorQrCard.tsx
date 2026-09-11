'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Copy, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/Logo';
import type { AuthenticatorSetupResponse } from '@/types';

type AuthenticatorQrCardProps = {
  data: AuthenticatorSetupResponse;
};

export function AuthenticatorQrCard({ data }: AuthenticatorQrCardProps) {
  const qrRef = useRef<HTMLDivElement | null>(null);

  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    let active = true;

    async function generateQr() {
      try {
        setIsGenerating(true);

        const QRCodeStyling = (await import('qr-code-styling')).default;

        if (!qrRef.current || !active) return;

        qrRef.current.innerHTML = '';

        const qrCode = new QRCodeStyling({
          width: 340,
          height: 340,
          type: 'svg',
          data: data.otpauthUrl,
          margin: 10,

          qrOptions: {
            errorCorrectionLevel: 'H',
          },

          backgroundOptions: {
            color: '#ffffff',
          },

          dotsOptions: {
            type: 'dots',
            color: '#0b1530',
          },

          cornersSquareOptions: {
            type: 'extra-rounded',
            color: '#0b1530',
          },

          cornersDotOptions: {
            type: 'dot',
            color: '#0b1530',
          },
        });

        qrCode.append(qrRef.current);
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
      } finally {
        if (active) {
          setIsGenerating(false);
        }
      }
    }

    generateQr();

    return () => {
      active = false;
    };
  }, [data.otpauthUrl]);

  async function copySecret() {
    await navigator.clipboard.writeText(data.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-slate-900">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent-readable)]">
          <ShieldCheck size={22} />
        </div>

        <div>
          <h2 className="text-xl font-black text-polar-950 dark:text-white">
            Configurar aplicativo autenticador
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-300">
            Escaneie o QR Code no Google Authenticator, Microsoft Authenticator ou app compatível.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="flex justify-center">
          <div className="relative rounded-[34px] bg-white p-5 shadow-xl">
            <div className="relative h-[340px] w-[340px] overflow-hidden rounded-[22px] bg-white">
              <div
                ref={qrRef}
                className="flex h-[340px] w-[340px] items-center justify-center"
              />

              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[22px] bg-slate-100 text-sm text-slate-500">
                  Gerando QR Code...
                </div>
              )}

              {!isGenerating && (
                <div className="absolute left-1/2 top-1/2 flex h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[28px] border-[7px] border-white bg-[#050816] shadow-2xl">
                  <Logo compact className="h-[62px] w-[62px]" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--accent-readable)]">
              Emissor
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {data.issuer}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--accent-readable)]">
              Conta
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {data.accountName}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--accent-readable)]">
              Chave manual
            </p>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <code className="block flex-1 break-all rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                {data.secret}
              </code>

              <button
                type="button"
                onClick={copySecret}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
              >
                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100">
            <p className="font-bold">Como configurar</p>

            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Abra o Google Authenticator ou Microsoft Authenticator.</li>
              <li>Escolha adicionar nova conta.</li>
              <li>Escaneie o QR Code.</li>
              <li>Se preferir, use a chave manual acima.</li>
              <li>No próximo login, escolha “Aplicativo autenticador”.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}