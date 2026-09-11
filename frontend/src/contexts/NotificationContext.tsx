'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { apiFetch, ApiUnauthorizedError } from '@/lib/api';
import type { Notificacao } from '@/types';
import { useAuth } from './AuthContext';

type UnreadResponse = {
  total: number;
};

type NotificationContextValue = {
  permission: NotificationPermission | 'unsupported';
  notificacoes: Notificacao[];
  unreadCount: number;

  carregarNotificacoes: () => Promise<void>;
  carregarNaoLidas: () => Promise<void>;

  solicitarPermissao: () => Promise<void>;

  criarNotificacaoTeste: () => Promise<void>;
  enviarTeste: () => Promise<void>;

  marcarComoLida: (id: string) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

const DISPLAYED_STORAGE_KEY = 'polaryon.notifications.displayed';
const NOTIFICATION_ICON = '/logo/polaryon-icon.svg';
const NOTIFICATION_SOUND = '/sounds/notification-water.wav';

function getNotificationId(notificacao: Notificacao) {
  return String((notificacao as any).id ?? (notificacao as any).ID_NOTIFICACAO ?? '');
}

function getNotificationTitulo(notificacao: Notificacao) {
  return String((notificacao as any).titulo ?? (notificacao as any).TITULO ?? 'Nova notificação');
}

function getNotificationMensagem(notificacao: Notificacao) {
  return String((notificacao as any).mensagem ?? (notificacao as any).MENSAGEM ?? '');
}

function isNotificacaoLida(notificacao: Notificacao) {
  const value = (notificacao as any).lida ?? (notificacao as any).LIDA;

  return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true';
}

function getDisplayedNotifications() {
  if (typeof window === 'undefined') return new Set<string>();

  try {
    const stored = localStorage.getItem(DISPLAYED_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];

    if (!Array.isArray(parsed)) return new Set<string>();

    return new Set(parsed.map(String));
  } catch {
    return new Set<string>();
  }
}

function saveDisplayedNotifications(displayed: Set<string>) {
  if (typeof window === 'undefined') return;

  const values = Array.from(displayed).slice(-80);
  localStorage.setItem(DISPLAYED_STORAGE_KEY, JSON.stringify(values));
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { usuario, loading } = useAuth();

  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }

    setPermission(Notification.permission);

    audioRef.current = new Audio(NOTIFICATION_SOUND);
    audioRef.current.preload = 'auto';

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Erro ao registrar service worker:', error);
      });
    }
  }, []);

  const playSound = useCallback(() => {
    audioRef.current?.play().catch(() => {
      // O navegador pode bloquear o áudio até o primeiro clique do usuário.
    });
  }, []);

  const solicitarPermissao = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  const showBrowserNotification = useCallback(
    async (notificacao: Notificacao) => {
      if (typeof window === 'undefined') return;
      if (!('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      const id = getNotificationId(notificacao);
      const titulo = getNotificationTitulo(notificacao);
      const mensagem = getNotificationMensagem(notificacao);

      try {
        const registration =
          'serviceWorker' in navigator
            ? await navigator.serviceWorker.ready.catch(() => null)
            : null;

        if (registration) {
          await registration.showNotification(titulo, {
            body: mensagem,
            icon: NOTIFICATION_ICON,
            badge: NOTIFICATION_ICON,
            tag: id || titulo,
            data: {
              url: '/dashboard',
              id,
            },
          });
        } else {
          const notification = new Notification(titulo, {
            body: mensagem,
            icon: NOTIFICATION_ICON,
            tag: id || titulo,
          });

          notification.onclick = () => {
            window.focus();
            window.location.href = '/dashboard';
          };
        }

        playSound();
      } catch (error) {
        console.error('Erro ao exibir notificação do navegador:', error);
      }
    },
    [playSound],
  );

  const exibirNovasNotificacoesNaoLidas = useCallback(
    async (lista: Notificacao[]) => {
      if (typeof window === 'undefined') return;

      const displayed = getDisplayedNotifications();

      const naoLidasNovas = lista.filter((item) => {
        const id = getNotificationId(item);

        if (!id) return false;
        if (isNotificacaoLida(item)) return false;

        return !displayed.has(id);
      });

      for (const notificacao of naoLidasNovas) {
        await showBrowserNotification(notificacao);

        const id = getNotificationId(notificacao);
        if (id) displayed.add(id);
      }

      saveDisplayedNotifications(displayed);
    },
    [showBrowserNotification],
  );

  const carregarNotificacoes = useCallback(async () => {
    if (!usuario) return;

    try {
      const response = await apiFetch<Notificacao[]>('/notifications');

      const lista = Array.isArray(response) ? response : [];
      const totalNaoLidas = lista.filter((item) => !isNotificacaoLida(item)).length;

      setNotificacoes(lista);
      setUnreadCount(totalNaoLidas);

      await exibirNovasNotificacoesNaoLidas(lista);
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) return;
      console.error('Erro ao carregar notificações:', error);
    }
  }, [usuario, exibirNovasNotificacoesNaoLidas]);

  const carregarNaoLidas = useCallback(async () => {
    if (!usuario) return;

    try {
      const response = await apiFetch<UnreadResponse | Notificacao[]>('/notifications/unread');

      if (Array.isArray(response)) {
        setUnreadCount(response.length);
        await exibirNovasNotificacoesNaoLidas(response);
        return;
      }

      setUnreadCount(Number(response?.total ?? 0));
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) return;
      console.error('Erro ao carregar notificações não lidas:', error);
    }
  }, [usuario, exibirNovasNotificacoesNaoLidas]);

  const criarNotificacaoTeste = useCallback(async () => {
    if (!usuario) return;

    try {
      await apiFetch('/notifications/test', {
        method: 'POST',
        body: JSON.stringify({
          titulo: 'Notificação de teste',
          mensagem: 'Esta é uma notificação do Portal Polaryon.',
        }),
      });

      await carregarNotificacoes();
      await carregarNaoLidas();

      if (typeof window !== 'undefined' && 'Notification' in window) {
        let currentPermission = Notification.permission;

        if (currentPermission === 'default') {
          currentPermission = await Notification.requestPermission();
          setPermission(currentPermission);
        }

        if (currentPermission === 'granted') {
          await showBrowserNotification({
            id: `teste-${Date.now()}`,
            titulo: 'Notificação de teste',
            mensagem: 'Esta é uma notificação do Portal Polaryon.',
            lida: false,
            data: new Date().toISOString(),
          } as Notificacao);
        }
      }
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) return;
      console.error('Erro ao criar notificação:', error);
    }
  }, [usuario, carregarNotificacoes, carregarNaoLidas, showBrowserNotification]);

  const enviarTeste = useCallback(async () => {
    await criarNotificacaoTeste();
  }, [criarNotificacaoTeste]);

  const marcarComoLida = useCallback(
    async (id: string) => {
      if (!usuario) return;

      try {
        await apiFetch(`/notifications/${id}/read`, {
          method: 'PATCH',
        });

        setNotificacoes((prev) =>
          prev.map((item) => {
            const itemId = getNotificationId(item);

            if (itemId !== id) return item;

            return {
              ...item,
              lida: true,
            };
          }),
        );

        setUnreadCount((prev) => Math.max(prev - 1, 0));

        await carregarNaoLidas();
      } catch (error) {
        if (error instanceof ApiUnauthorizedError) return;
        console.error('Erro ao marcar notificação como lida:', error);
      }
    },
    [usuario, carregarNaoLidas],
  );

  useEffect(() => {
    if (loading || !usuario) {
      setNotificacoes([]);
      setUnreadCount(0);
      return;
    }

    carregarNotificacoes();
    carregarNaoLidas();

    const interval = window.setInterval(() => {
      carregarNotificacoes();
      carregarNaoLidas();
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loading, usuario, carregarNotificacoes, carregarNaoLidas]);

  const value = useMemo(
    () => ({
      permission,
      notificacoes,
      unreadCount,

      carregarNotificacoes,
      carregarNaoLidas,

      solicitarPermissao,

      criarNotificacaoTeste,
      enviarTeste,

      marcarComoLida,
    }),
    [
      permission,
      notificacoes,
      unreadCount,
      carregarNotificacoes,
      carregarNaoLidas,
      solicitarPermissao,
      criarNotificacaoTeste,
      enviarTeste,
      marcarComoLida,
    ],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications precisa ser usado dentro de NotificationProvider');
  }

  return context;
}