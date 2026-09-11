type Column<T> = {
  header: string;
  render: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  title: string;
  rows: T[];
  columns: Column<T>[];
};

export function DataTable<T>({ title, rows, columns }: DataTableProps<T>) {
  return (
    <section className="polaryon-card animate-fadeIn rounded-3xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-[var(--text)]">{title}</h2>
        <span className="rounded-full bg-[var(--company-soft)] px-3 py-1 text-xs font-bold text-[var(--accent-readable)]">
          {rows.length} registro(s)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-left text-sm">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  className="px-4 py-2 text-xs uppercase tracking-wide text-[var(--text)] opacity-50"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className="bg-black/[0.03] transition-colors hover:bg-[var(--company-soft)] dark:bg-white/[0.04]"
              >
                {columns.map((column) => (
                  <td key={column.header} className="px-4 py-3 first:rounded-l-2xl last:rounded-r-2xl">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
