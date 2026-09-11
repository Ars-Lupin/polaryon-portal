'use client';

import { Bell, Check, Send, X } from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

export function NotificationBell() {
  const {
    permission,
    notificacoes,
    unreadCount,
    carregarNotificacoes,
    solicitarPermissao,
    criarNotificacaoTeste,
    enviarTeste,
    marcarComoLida,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);
  const [loadingReadId, setLoadingReadId] = useState<string | null>(null);

  const handleOpen = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      await carregarNotificacoes();
    }
  };

  const handleTest = async () => {
    setLoadingTest(true);

    try {
      if (permission === 'default') {
        await solicitarPermissao();
      }

      if (enviarTeste) {
        await enviarTeste();
      } else {
        await criarNotificacaoTeste();
      }

      await carregarNotificacoes();
    } finally {
      setLoadingTest(false);
    }
  };

  const handleMarcarComoLida = async (id: string) => {
    if (!id) return;

    setLoadingReadId(id);

    try {
      await marcarComoLida(id);
      await carregarNotificacoes();
    } finally {
      setLoadingReadId(null);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative grid h-11 w-11 place-items-center rounded-2xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
        title="Notificações"
        aria-label="Notificações"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-96 overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-white/10 dark:bg-slate-900 dark:text-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10">
            <div>
              <h3 className="text-sm font-extrabold">Notificações</h3>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {unreadCount} não lida(s)
              </p>

              {permission && (
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  Permissão: {permission}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          {permission !== 'granted' && permission !== 'unsupported' && (
            <div className="border-b border-slate-100 px-5 py-3 dark:border-white/10">
              <button
                type="button"
                onClick={solicitarPermissao}
                className="w-full rounded-2xl bg-cyan-50 px-4 py-2 text-xs font-bold text-polar-900 transition hover:bg-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-200 dark:hover:bg-cyan-950/70"
              >
                Liberar notificações no navegador
              </button>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Nenhuma notificação encontrada.
              </div>
            ) : (
              notificacoes.map((notificacao) => {
                const isLoadingRead = loadingReadId === notificacao.id;

                return (
                  <div
                    key={notificacao.id}
                    className={`border-b border-slate-100 px-5 py-4 last:border-b-0 dark:border-white/10 ${
                      notificacao.lida
                        ? 'bg-white dark:bg-slate-900'
                        : 'bg-cyan-50 dark:bg-cyan-950/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold">
                            {notificacao.titulo}
                          </h4>

                          {!notificacao.lida && (
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-500" />
                          )}
                        </div>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {notificacao.mensagem}
                        </p>

                        <p className="mt-2 text-xs text-slate-400">
                          {notificacao.data
                            ? new Date(notificacao.data).toLocaleString('pt-BR')
                            : ''}
                        </p>
                      </div>

                      {!notificacao.lida && (
                        <button
                          type="button"
                          onClick={() => handleMarcarComoLida(notificacao.id)}
                          disabled={isLoadingRead}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-polar-900 shadow-sm transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                          title="Marcar como lida"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-100 p-4 dark:border-white/10">
            <button
              type="button"
              onClick={handleTest}
              disabled={loadingTest}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-polar-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-polar-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={16} />
              {loadingTest ? 'Enviando...' : 'Enviar notificação de teste'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}