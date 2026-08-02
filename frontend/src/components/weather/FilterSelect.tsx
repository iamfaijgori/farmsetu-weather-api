import { ChevronDown } from 'lucide-react';
import { useId } from 'react';

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectProps {
  /** Visually hidden, but read out by screen readers. */
  label: string;
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * A native `<select>` under a Figma-matched shell.
 *
 * Native beats a custom listbox here: keyboard behaviour, type-ahead and the
 * mobile wheel picker all come free, and the design is only styling the
 * closed state anyway.
 */
export function FilterSelect({ label, value, options, onChange, disabled, className = '' }: FilterSelectProps) {
  const id = useId();

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>

      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full cursor-pointer appearance-none rounded-xl border border-[#e2e8f0] bg-white py-2 pl-4 pr-9 text-sm font-medium text-[#45556c] outline-none transition-colors hover:border-[#cbd5e1] focus-visible:border-[#2b7fff] focus-visible:ring-2 focus-visible:ring-[#2b7fff]/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#45556c]"
        aria-hidden="true"
      />
    </div>
  );
}
