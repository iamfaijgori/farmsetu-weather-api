import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SERIES_COLORS, formatValue } from '../../lib/transforms';
import type { TimelinePoint } from '../../types/weather';

const SERIES = [
  { key: 'temperature', label: 'Temperature', color: SERIES_COLORS.temperature, unit: '°C', axis: 'left' as const },
  { key: 'rainfall', label: 'Rainfall', color: SERIES_COLORS.rainfall, unit: 'mm', axis: 'right' as const },
  { key: 'sunshine', label: 'Sunshine', color: SERIES_COLORS.sunshine, unit: 'hrs', axis: 'right' as const },
];

const AXIS_TICK = { fill: '#94a3b8', fontSize: 12 };

interface TooltipPayloadItem {
  dataKey?: string | number;
  value?: number | null;
}

function ChartTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string | number;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 shadow-lg shadow-slate-900/5">
      <p className="font-heading text-xs font-bold text-[#1e3a5f]">{label}</p>

      <ul className="mt-1 space-y-0.5">
        {SERIES.map((series) => {
          const point = payload.find((item) => item.dataKey === series.key);
          if (!point || point.value === null || point.value === undefined) return null;

          return (
            <li key={series.key} className="flex items-center gap-2 text-xs text-[#62748e]">
              <span className="h-0.5 w-3 rounded" style={{ backgroundColor: series.color }} aria-hidden="true" />
              {series.label}
              <span className="ml-auto font-semibold tabular-nums text-[#314158]">
                {formatValue(point.value)} {series.unit}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export interface TimelineChartProps {
  data: TimelinePoint[];
  isLoading?: boolean;
}

export function TimelineChart({ data, isLoading = false }: TimelineChartProps) {
  return (
    <section className="rounded-2xl border border-[#eff6ff] bg-white px-7 py-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-base font-bold text-[#1e3a5f]">Timeline Overview</h2>
          <p className="mt-0.5 text-xs text-[#90a1b9]">Annual temperature, rainfall &amp; sunshine trends</p>
        </div>

        <ul className="flex flex-wrap items-center gap-4">
          {SERIES.map((series) => (
            <li key={series.key} className="flex items-center gap-1.5 text-xs font-medium text-[#62748e]">
              <span className="h-0.5 w-3 rounded" style={{ backgroundColor: series.color }} aria-hidden="true" />
              {series.label}
            </li>
          ))}
        </ul>
      </header>

      <div className="mt-5 h-[260px]">
        {isLoading ? (
          <div className="h-full animate-pulse rounded-xl bg-[#f8fafc]" aria-hidden="true" />
        ) : data.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-[#90a1b9]">
            No records match these filters. Widen the region or year range.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />

              <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
              <YAxis
                yAxisId="left"
                tick={{ ...AXIS_TICK, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={44}
                unit="°"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ ...AXIS_TICK, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={48}
              />

              <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }} />

              {SERIES.map((series) => (
                <Line
                  key={series.key}
                  yAxisId={series.axis}
                  type="monotone"
                  dataKey={series.key}
                  name={series.label}
                  stroke={series.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
