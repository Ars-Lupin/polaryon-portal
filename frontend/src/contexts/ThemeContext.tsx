'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CompanyKey } from '@/lib/companyTheme';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  company: CompanyKey;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setCompany: (company: CompanyKey) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isValidTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

function isValidCompany(value: string | null): value is CompanyKey {
  return (
    value === 'macroex' ||
    value === 'actus' ||
    value === 'kamell' ||
    value === 'atmos' ||
    value === 'tohatsu'
  );
}

function applyTheme(theme: Theme, company: CompanyKey) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.company = company;

  document.body.dataset.theme = theme;
  document.body.dataset.company = company;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [company, setCompanyState] = useState<CompanyKey>('macroex');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('polaryon.theme');
    const savedCompany = localStorage.getItem('polaryon.company');

    const initialTheme: Theme = isValidTheme(savedTheme) ? savedTheme : 'light';
    const initialCompany: CompanyKey = isValidCompany(savedCompany) ? savedCompany : 'macroex';

    setThemeState(initialTheme);
    setCompanyState(initialCompany);
    applyTheme(initialTheme, initialCompany);
    setHydrated(true);
  }, []);

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme);
      localStorage.setItem('polaryon.theme', nextTheme);
      applyTheme(nextTheme, company);
    },
    [company],
  );

  const setCompany = useCallback(
    (nextCompany: CompanyKey) => {
      setCompanyState(nextCompany);
      localStorage.setItem('polaryon.company', nextCompany);
      applyTheme(theme, nextCompany);
    },
    [theme],
  );

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    setThemeState(nextTheme);
    localStorage.setItem('polaryon.theme', nextTheme);
    applyTheme(nextTheme, company);
  }, [theme, company]);

  const value = useMemo(
    () => ({
      theme,
      company,
      toggleTheme,
      setTheme,
      setCompany,
    }),
    [theme, company, toggleTheme, setTheme, setCompany],
  );

  if (!hydrated) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme precisa ser usado dentro de ThemeProvider');
  }

  return context;
}