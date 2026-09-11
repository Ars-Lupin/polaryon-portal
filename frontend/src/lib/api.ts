const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export type ApiError = {
  message?: string | string[];
  mensagem?: string;
  statusCode?: number;
};

export class ApiUnauthorizedError extends Error {
  constructor(message = 'Sessão expirada. Faça login novamente.') {
    super(message);
    this.name = 'ApiUnauthorizedError';
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('polaryon.token') : null;
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('polaryon.token');
      window.dispatchEvent(new Event('polaryon:unauthorized'));
    }

    const apiError = data as ApiError | null;
    const message = apiError?.mensagem || apiError?.message || 'Sessão expirada. Faça login novamente.';

    throw new ApiUnauthorizedError(Array.isArray(message) ? message.join(', ') : message);
  }

  if (!response.ok) {
    const apiError = data as ApiError | null;
    const message = apiError?.mensagem || apiError?.message || 'Erro inesperado';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return data as T;
}