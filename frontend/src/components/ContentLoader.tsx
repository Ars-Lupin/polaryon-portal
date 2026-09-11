export function ContentLoader({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="grid min-h-[40vh] animate-fadeIn place-items-center py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[var(--surface-border)] border-t-[var(--accent-readable)]" />
        <p className="text-sm font-semibold text-[var(--text)] opacity-60">{label}</p>
      </div>
    </div>
  );
}
