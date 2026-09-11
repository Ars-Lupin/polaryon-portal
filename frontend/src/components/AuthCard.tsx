'use client';

import { Logo } from './Logo';

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <section className="polaryon-surface w-full max-w-[560px] rounded-[2rem] px-10 py-10 transition-colors">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-6 flex w-full justify-center">
          <Logo className="h-28 w-[360px] max-w-full" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-polar-950 dark:text-white">
          {title}
        </h1>

        <p className="mt-3 max-w-sm text-sm font-medium text-slate-600 dark:text-slate-300">
          {subtitle}
        </p>
      </div>

      {children}
    </section>
  );
}