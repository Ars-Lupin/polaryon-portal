'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm font-bold text-polar-950 shadow-sm backdrop-blur transition hover:scale-[1.02] hover:bg-white dark:border-white/20 dark:bg-slate-900/80 dark:text-white dark:hover:bg-slate-800"
      title={isDark ? 'Trocar para tema claro' : 'Trocar para tema escuro'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      {isDark ? 'Claro' : 'Escuro'}
    </button>
  );
}