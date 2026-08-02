import type { ReactNode } from 'react';

/**
 * The five summary tiles.
 *
 * In Figma each card's background is a flattened raster fill. Those exports
 * live on a short-lived localhost asset server, so they're reproduced here as
 * CSS gradients — same colours, no expiring URLs, and they scale cleanly. To
 * use the real exports instead, drop them in `/public` and swap `gradient`
 * for a `backgroundImage` on the wrapper.
 */
export type StatCardTone = 'chill' | 'warm' | 'violet' | 'amber' | 'deep';

const TONES: Record<StatCardTone, { gradient: string; label: string; value: string }> = {
  chill: {
    gradient: 'linear-gradient(135deg, #d3e6ff 0%, #e3dcff 100%)',
    label: 'text-[#1d293d]',
    value: 'text-[#1d293d]',
  },
  warm: {
    gradient: 'linear-gradient(135deg, #ffe3d0 0%, #ffd8e4 100%)',
    label: 'text-[#1d293d]',
    value: 'text-[#1d293d]',
  },
  violet: {
    gradient: 'linear-gradient(135deg, #7f22fe 0%, #4d179a 100%)',
    label: 'text-white/85',
    value: 'text-white',
  },
  amber: {
    gradient: 'linear-gradient(135deg, #fff2c2 0%, #ffe2a1 100%)',
    label: 'text-[#1d293d]',
    value: 'text-[#1d293d]',
  },
  deep: {
    gradient: 'linear-gradient(135deg, #1e40af 0%, #172554 100%)',
    label: 'text-white/85',
    value: 'text-white',
  },
};

export interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  tone: StatCardTone;
  /** Optional context line, e.g. "across 12 regions". */
  caption?: ReactNode;
}

export function StatCard({ label, value, unit, tone, caption }: StatCardProps) {
  const palette = TONES[tone];

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-6 py-5 transition-transform duration-200 will-change-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{ backgroundImage: palette.gradient }}
    >
      <p className={`text-[11px] font-semibold uppercase tracking-[0.88px] ${palette.label}`}>{label}</p>

      <p className={`mt-2 flex items-baseline gap-1.5 ${palette.value}`}>
        <span className="font-heading text-3xl font-bold leading-[30px] tabular-nums">{value}</span>
        <span className="text-lg font-medium leading-7">{unit}</span>
      </p>

      {caption ? <p className={`mt-1 text-[11px] ${palette.label}`}>{caption}</p> : null}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="h-[98px] animate-pulse rounded-2xl bg-white/70" aria-hidden="true" />
  );
}
