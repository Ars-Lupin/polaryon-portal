export type CompanyKey = 'macroex' | 'actus' | 'kamell' | 'atmos' | 'tohatsu';

export function resolveCompanyKey(companyName?: string | null): CompanyKey {
  const value = String(companyName || '').trim().toLowerCase();

  if (value.includes('actus')) return 'actus';
  if (value.includes('kamell')) return 'kamell';
  if (value.includes('atmos')) return 'atmos';
  if (value.includes('tohatsu')) return 'tohatsu';

  return 'macroex';
}