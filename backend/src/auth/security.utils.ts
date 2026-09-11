import { MfaMethod } from './auth.types';

export function onlyDigits(value?: string | null) {
  return String(value || '').replace(/\D/g, '');
}

export function safeLower(value?: string | null) {
  return String(value || '').trim().toLowerCase();
}

export function normalizeIdentifier(value: string) {
  const raw = String(value || '').trim();
  const lower = raw.toLowerCase();
  const digits = onlyDigits(raw);

  if (raw.includes('@')) {
    return lower;
  }

  if (digits.length >= 8) {
    return digits;
  }

  return lower;
}

export function normalizeEmail(value?: string | null) {
  return safeLower(value);
}

export function normalizeUsuario(value?: string | null) {
  return safeLower(value);
}

export function normalizeTelefone(value?: string | null) {
  return onlyDigits(value);
}

export function normalizeCpf(value?: string | null) {
  return onlyDigits(value);
}

export function normalizeCnpj(value?: string | null) {
  return onlyDigits(value);
}

export function validateStrongPassword(password: string) {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('A senha deve ter pelo menos 12 caracteres');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter letra minúscula');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter letra maiúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('A senha deve conter número');
  }

  if (!/[!@#$%^&*()_\-+=\[\]{};:,.?/\\|~`]/.test(password)) {
    errors.push('A senha deve conter caractere especial');
  }

  const weakPasswords = [
    'admin@123',
    'admin123',
    'senha123',
    '12345678',
    '123456789',
    'password',
    'qwerty123',
  ];

  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push('A senha informada é muito comum');
  }

  return errors;
}

export function maskIdentifier(value: string) {
  const raw = String(value || '').trim();

  if (raw.includes('@')) {
    const [user, domain] = raw.split('@');
    return `${user.slice(0, 2)}***@${domain}`;
  }

  const digits = onlyDigits(raw);

  if (digits.length >= 11) {
    return `${digits.slice(0, 3)}***${digits.slice(-2)}`;
  }

  if (raw.length <= 3) {
    return '***';
  }

  return `${raw.slice(0, 2)}***${raw.slice(-1)}`;
}

export function parseMfaMethods(value?: string | null): MfaMethod[] {
  const allowed: MfaMethod[] = ['EMAIL', 'AUTHENTICATOR'];

  const methods = String(value || '')
    .split('|')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean) as MfaMethod[];

  const validMethods = methods.filter((method) => allowed.includes(method));

  return validMethods.length > 0 ? validMethods : ['EMAIL'];
}

export function normalizeMfaMethod(value?: string | null): MfaMethod {
  const method = String(value || '').trim().toUpperCase();

  if (method === 'AUTHENTICATOR') {
    return 'AUTHENTICATOR';
  }

  return 'EMAIL';
}