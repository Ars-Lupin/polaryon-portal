import { Building2, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import type { DashboardSummary } from '@/types';

const cards = [
  { key: 'usuarios', label: 'Usuários', icon: UsersRound },
  { key: 'empresas', label: 'Empresas', icon: Building2 },
  { key: 'papeis', label: 'Papéis', icon: UserRound },
  { key: 'permissoes', label: 'Permissões', icon: ShieldCheck },
] as const;

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  return (
    <section className="grid animate-fadeIn gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.key}
            className="rounded-3xl p-6 text-white shadow-soft"
            style={{
              background:
                'radial-gradient(circle at 15% 0%, rgba(255,255,255,0.16), transparent 55%), linear-gradient(135deg, var(--company-primary), var(--company-secondary))',
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-semibold text-white/75">{card.label}</p>
              <Icon size={22} className="text-cyan-200" />
            </div>
            <strong className="text-4xl font-extrabold tracking-tight">{summary[card.key]}</strong>
          </article>
        );
      })}
    </section>
  );
}
