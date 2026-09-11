'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredPermission?: string;
};

export function ProtectedRoute({
  children,
  requiredPermission,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { usuario, loading, hasPermission } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!usuario) {
      router.replace('/login');
      return;
    }

    if (usuario.deveTrocarSenha && pathname !== '/trocar-senha') {
      router.replace('/trocar-senha');
      return;
    }

    if (
      usuario &&
      !usuario.deveTrocarSenha &&
      pathname === '/trocar-senha'
    ) {
      router.replace('/dashboard');
    }
  }, [loading, usuario, pathname, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!usuario) {
    return <LoadingScreen />;
  }

  if (usuario.deveTrocarSenha && pathname !== '/trocar-senha') {
    return <LoadingScreen />;
  }

  if (!usuario.deveTrocarSenha && pathname === '/trocar-senha') {
    return <LoadingScreen />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="grid min-h-[50vh] animate-fadeIn place-items-center px-6 py-16 text-center">
        <div className="max-w-md rounded-3xl border border-red-100 bg-red-50 p-8 text-red-700 shadow-soft dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200">
          <h1 className="text-2xl font-black">Acesso negado</h1>
          <p className="mt-3 text-sm font-semibold">
            Você não tem permissão para acessar este recurso.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}