import { CloudSun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ConditionKey } from '../../types/weather';

const CONDITIONS: Array<{ key: ConditionKey; label: string; emoji: string }> = [
  { key: 'clear', label: 'Clear', emoji: '☀️' },
  { key: 'rainy', label: 'Rainy', emoji: '🌧️' },
  { key: 'frosty', label: 'Frosty', emoji: '❄️' },
  { key: 'overcast', label: 'Overcast', emoji: '☁️' },
];

export interface ConditionsFilterProps {
  selected: ConditionKey[];
  onChange: (next: ConditionKey[]) => void;
}

/** The header's primary action: narrows every panel to the chosen conditions. */
export function ConditionsFilter({ selected, onChange }: ConditionsFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  function toggle(key: ConditionKey) {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 rounded-xl bg-[#2b7fff] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1d6ae0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b7fff]/40 focus-visible:ring-offset-2"
      >
        <CloudSun className="h-3.5 w-3.5" aria-hidden="true" />
        Conditions
        {selected.length > 0 && (
          <span className="rounded-full bg-white/25 px-1.5 text-[11px] font-semibold leading-4">
            {selected.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-[#e2e8f0] bg-white p-2 shadow-lg shadow-slate-900/5">
          <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.6px] text-[#90a1b9]">
            Filter by condition
          </p>

          {CONDITIONS.map((condition) => (
            <label
              key={condition.key}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[#45556c] hover:bg-[#f8fafc]"
            >
              <input
                type="checkbox"
                checked={selected.includes(condition.key)}
                onChange={() => toggle(condition.key)}
                className="h-3.5 w-3.5 accent-[#2b7fff]"
              />
              <span aria-hidden="true">{condition.emoji}</span>
              {condition.label}
            </label>
          ))}

          <button
            type="button"
            onClick={() => onChange([])}
            disabled={selected.length === 0}
            className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-[#2b7fff] hover:bg-[#eff6ff] disabled:cursor-not-allowed disabled:text-[#cbd5e1] disabled:hover:bg-transparent"
          >
            Show all conditions
          </button>
        </div>
      )}
    </div>
  );
}
