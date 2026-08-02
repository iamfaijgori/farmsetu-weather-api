import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useWeatherRecords } from '../../hooks/useWeatherRecords';
import {
  TIME_RANGES,
  buildHeatmap,
  buildTimeline,
  computeSummary,
  deriveCondition,
  filterByTimeRange,
  formatValue,
} from '../../lib/transforms';
import type { ConditionKey } from '../../types/weather';
import { ConditionsFilter } from './ConditionsFilter';
import { FilterSelect } from './FilterSelect';
import { RecordsTable } from './RecordsTable';
import { StatCard, StatCardSkeleton } from './StatCard';
import { TemperatureHeatmap } from './TemperatureHeatmap';
import { TimelineChart } from './TimelineChart';

const ALL_REGIONS = '__all__';

export interface WeatherDashboardProps {
  /** Optional server-side prefilter, e.g. `{ region: 'Scotland' }`. */
  initialQuery?: { region?: string; parameter?: string };
}

export function WeatherDashboard({ initialQuery = {} }: WeatherDashboardProps) {
  const { rows, regions, isLoading, error, refetch } = useWeatherRecords(initialQuery);

  const [region, setRegion] = useState(ALL_REGIONS);
  const [rangeId, setRangeId] = useState(TIME_RANGES[1].id);
  const [conditions, setConditions] = useState<ConditionKey[]>([]);

  const range = TIME_RANGES.find((option) => option.id === rangeId) ?? TIME_RANGES[1];

  const filtered = useMemo(() => {
    let next = region === ALL_REGIONS ? rows : rows.filter((row) => row.region === region);
    next = filterByTimeRange(next, range);
    if (conditions.length > 0) {
      next = next.filter((row) => conditions.includes(deriveCondition(row).key));
    }
    return next;
  }, [rows, region, range, conditions]);

  const summary = useMemo(() => computeSummary(filtered), [filtered]);
  const timeline = useMemo(() => buildTimeline(filtered), [filtered]);
  const heatmap = useMemo(() => buildHeatmap(filtered), [filtered]);

  const regionCount = region === ALL_REGIONS ? new Set(filtered.map((r) => r.region)).size : 1;
  const caption = filtered.length
    ? `${regionCount} region${regionCount === 1 ? '' : 's'} · ${range.label.toLowerCase()}`
    : undefined;

  return (
    <div className="min-h-screen bg-[#eff6ff] font-sans">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dbeafe] bg-white px-6 py-4 shadow-[0_1px_1.5px_rgba(0,0,0,0.06)] sm:px-8">
        <h1 className="font-heading text-xl font-bold tracking-[-0.5px] text-[#1e3a5f]">Weather Monitoring System</h1>

        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            label="Region"
            value={region}
            onChange={setRegion}
            disabled={isLoading || regions.length === 0}
            className="w-[140px]"
            options={[
              { value: ALL_REGIONS, label: 'All Regions' },
              ...regions.map((name) => ({ value: name, label: name })),
            ]}
          />

          <FilterSelect
            label="Time range"
            value={rangeId}
            onChange={setRangeId}
            disabled={isLoading}
            className="w-[160px]"
            options={TIME_RANGES.map((option) => ({ value: option.id, label: option.label }))}
          />

          <ConditionsFilter selected={conditions} onChange={setConditions} />
        </div>
      </header>

      <main className="mx-auto flex max-w-[1280px] flex-col gap-2 px-6 py-2 sm:px-8">
        {error && (
          <div
            role="alert"
            className="mt-2 flex flex-wrap items-center gap-3 rounded-2xl border border-[#fecaca] bg-[#fef2f2] px-5 py-4"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#dc2626]" aria-hidden="true" />
            <p className="flex-1 text-sm text-[#991b1b]">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="flex items-center gap-2 rounded-xl bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626]/40 focus-visible:ring-offset-2"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Try again
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-1 pt-2 md:grid-cols-3 xl:grid-cols-5">
          {isLoading ? (
            Array.from({ length: 5 }, (_, index) => <StatCardSkeleton key={index} />)
          ) : (
            <>
              <StatCard
                tone="chill"
                label="Min Temperature"
                value={formatValue(summary.minTemperature)}
                unit="°C"
                caption={caption}
              />
              <StatCard
                tone="warm"
                label="Max Temperature"
                value={formatValue(summary.maxTemperature)}
                unit="°C"
                caption={caption}
              />
              <StatCard
                tone="violet"
                label="Mean Temperature"
                value={formatValue(summary.meanTemperature)}
                unit="°C"
                caption={caption}
              />
              <StatCard
                tone="amber"
                label="Sunshine Hours"
                value={formatValue(summary.sunshineHours, 0)}
                unit="hrs"
                caption={caption}
              />
              <StatCard
                tone="deep"
                label="Total Rainfall"
                value={formatValue(summary.totalRainfall, 0)}
                unit="mm"
                caption={caption}
              />
            </>
          )}
        </div>

        <div className="pt-2">
          <TimelineChart data={timeline} isLoading={isLoading} />
        </div>

        <div className="pt-2">
          <TemperatureHeatmap data={heatmap} isLoading={isLoading} />
        </div>

        <div className="pb-8 pt-2">
          <RecordsTable rows={filtered} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}

export default WeatherDashboard;
