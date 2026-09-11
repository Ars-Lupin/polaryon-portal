'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiFetch } from '@/lib/api';
import type {
  AuthFlowResponse,
  AuthSuccessResponse,
  ChangePasswordRequiredPayload,
  LoginPayload,
  MfaChallengeResponse,
  RegisterPayload,
  RequestMfaPayload,
  Usuario,
  VerifyMfaPayload,
} from '@/types';

type AuthContextValue = {
  usuario: Usuario | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<AuthFlowResponse>;
  register: (payload: RegisterPayload) => Promise<AuthFlowResponse>;
  requestMfa: (payload: RequestMfaPayload) => Promise<MfaChallengeResponse>;
  verifyMfa: (payload: VerifyMfaPayload) => Promise<AuthSuccessResponse>;
  changePasswordRequired: (payload: ChangePasswordRequiredPayload) => Promise<AuthSuccessResponse>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isAuthSuccess(response: AuthFlowResponse): response is AuthSuccessResponse {
  return Boolean((response as AuthSuccessResponse).token);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const saveSession = useCallback((response: AuthSuccessResponse) => {
    localStorage.setItem('polaryon.token', response.token);
    setUsuario(response.usuario);
  }, []);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('polaryon.token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const me = await apiFetch<Usuario>('/auth/me');
      setUsuario(me);
    } catch {
      localStorage.removeItem('polaryon.token');
      localStorage.removeItem('polaryon.user');
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (payload: LoginPayload) => {
    const response = await apiFetch<AuthFlowResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (isAuthSuccess(response)) {
      saveSession(response);
    }

    return response;
  };

  const register = async (payload: RegisterPayload) => {
    const response = await apiFetch<AuthFlowResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (isAuthSuccess(response)) {
      saveSession(response);
    }

    return response;
  };

  const requestMfa = async (payload: RequestMfaPayload) => {
    return apiFetch<MfaChallengeResponse>('/auth/request-mfa', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  const verifyMfa = async (payload: VerifyMfaPayload) => {
    const response = await apiFetch<AuthSuccessResponse>('/auth/verify-mfa', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    saveSession(response);

    return response;
  };

  const changePasswordRequired = async (payload: ChangePasswordRequiredPayload) => {
    const response = await apiFetch<AuthSuccessResponse>('/auth/change-password-required', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    saveSession(response);

    return response;
  };

  const logout = () => {
    localStorage.removeItem('polaryon.token');
    localStorage.removeItem('polaryon.user');
    setUsuario(null);
  };

  const hasPermission = useCallback(
    (permission: string) => Boolean(usuario?.permissoes?.includes(permission)),
    [usuario],
  );

  const value = useMemo(
    () => ({
      usuario,
      loading,
      login,
      register,
      requestMfa,
      verifyMfa,
      changePasswordRequired,
      logout,
      hasPermission,
    }),
    [
      usuario,
      loading,
      hasPermission,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider');
  }

  return context;
}