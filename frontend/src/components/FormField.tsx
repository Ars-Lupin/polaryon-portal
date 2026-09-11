'use client';

type FormFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
};

export function FormField({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700 transition-colors dark:text-slate-200">
        {label}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-polar-950 outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
      />
    </label>
  );
}