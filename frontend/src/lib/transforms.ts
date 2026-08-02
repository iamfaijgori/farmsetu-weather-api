import type {
  HeatmapData,
  MetricKey,
  RegionYearRow,
  TimelinePoint,
  TimeRangeOption,
  WeatherCondition,
  WeatherRecord,
  WeatherSummary,
} from '../types/weather';

/* ------------------------------------------------------------------ *
 * Design tokens lifted from the Figma file (node 29:2)
 * ------------------------------------------------------------------ */

export const SERIES_COLORS = {
  temperature: '#8e51ff',
  rainfall: '#ffb900',
  sunshine: '#ff637e',
} as const;

/** Heatmap buckets, in the order they appear in the legend. */
export const HEAT_SCALE = [
  { label: '≤ 14', max: 14, background: '#ddd6ff', foreground: '#5d0ec0' },
  { label: '15–20', max: 20, background: '#c4b4ff', foreground: '#4d179a' },
  { label: '21–24', max: 24, background: '#a684ff', foreground: '#ffffff' },
  { label: '25–29', max: 29, background: '#8e51ff', foreground: '#ffffff' },
  { label: '≥ 30', max: Number.POSITIVE_INFINITY, background: '#7f22fe', foreground: '#ffffff' },
] as const;

export const EMPTY_CELL = { background: '#f8fafc', foreground: '#cbd5e1' } as const;

export function heatColor(value: number | null): { background: string; foreground: string } {
  if (value === null || Number.isNaN(value)) return EMPTY_CELL;
  return HEAT_SCALE.find((bucket) => value <= bucket.max) ?? HEAT_SCALE[HEAT_SCALE.length - 1];
}

/* ------------------------------------------------------------------ *
 * Parameter normalisation
 * ------------------------------------------------------------------ */

const PARAMETER_ALIASES: Record<string, MetricKey> = {
  tmin: 'tmin',
  'min temperature': 'tmin',
  tmax: 'tmax',
  'max temperature': 'tmax',
  tmean: 'tmean',
  tavg: 'tmean',
  'mean temperature': 'tmean',
  rainfall: 'rainfall',
  precipitation: 'rainfall',
  sunshine: 'sunshine',
  'sunshine hours': 'sunshine',
};

/** Maps a backend `parameter` string onto a column, tolerating case/spacing drift. */
export function normaliseParameter(parameter: string): MetricKey | null {
  return PARAMETER_ALIASES[parameter.trim().toLowerCase()] ?? null;
}

/* ------------------------------------------------------------------ *
 * Pivot: flat (region, parameter, year, value) → one row per region-year
 * ------------------------------------------------------------------ */

export function pivotRecords(records: WeatherRecord[]): RegionYearRow[] {
  const byRegionYear = new Map<string, RegionYearRow>();

  for (const record of records) {
    const key = `${record.region}::${record.year}`;
    let row = byRegionYear.get(key);

    if (!row) {
      row = {
        key,
        region: record.region,
        year: record.year,
        tmin: null,
        tmax: null,
        tmean: null,
        rainfall: null,
        sunshine: null,
      };
      byRegionYear.set(key, row);
    }

    const column = normaliseParameter(record.parameter);
    if (column && Number.isFinite(record.value)) {
      row[column] = record.value;
    }
  }

  return Array.from(byRegionYear.values())
    .map((row) => ({
      ...row,
      // Met Office publishes Tmean, but derive it if a region only has Tmin/Tmax.
      tmean: row.tmean ?? (row.tmin !== null && row.tmax !== null ? (row.tmin + row.tmax) / 2 : null),
    }))
    .sort((a, b) => b.year - a.year || a.region.localeCompare(b.region));
}

/* ------------------------------------------------------------------ *
 * Aggregation
 * ------------------------------------------------------------------ */

const present = (values: Array<number | null>): number[] => values.filter((v): v is number => v !== null);

const mean = (values: number[]): number | null =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null;

const sum = (values: number[]): number | null =>
  values.length ? values.reduce((total, v) => total + v, 0) : null;

export function computeSummary(rows: RegionYearRow[]): WeatherSummary {
  const mins = present(rows.map((r) => r.tmin));
  const maxes = present(rows.map((r) => r.tmax));

  return {
    minTemperature: mins.length ? Math.min(...mins) : null,
    maxTemperature: maxes.length ? Math.max(...maxes) : null,
    meanTemperature: mean(present(rows.map((r) => r.tmean))),
    sunshineHours: mean(present(rows.map((r) => r.sunshine))),
    totalRainfall: sum(present(rows.map((r) => r.rainfall))),
  };
}

/** One point per year, averaged across whichever regions are in scope. */
export function buildTimeline(rows: RegionYearRow[]): TimelinePoint[] {
  const byYear = new Map<number, RegionYearRow[]>();

  for (const row of rows) {
    const bucket = byYear.get(row.year);
    if (bucket) bucket.push(row);
    else byYear.set(row.year, [row]);
  }

  return Array.from(byYear.entries())
    .map(([year, yearRows]) => ({
      year,
      temperature: mean(present(yearRows.map((r) => r.tmean))),
      rainfall: mean(present(yearRows.map((r) => r.rainfall))),
      sunshine: mean(present(yearRows.map((r) => r.sunshine))),
    }))
    .sort((a, b) => a.year - b.year);
}

export function buildHeatmap(rows: RegionYearRow[], maxColumns = 12): HeatmapData {
  const columns = Array.from(new Set(rows.map((r) => r.year)))
    .sort((a, b) => a - b)
    .slice(-maxColumns);

  const regions = Array.from(new Set(rows.map((r) => r.region))).sort((a, b) => a.localeCompare(b));
  const lookup = new Map(rows.map((row) => [`${row.region}::${row.year}`, row]));

  return {
    columns,
    rows: regions.map((region) => ({
      region,
      cells: columns.map((year) => ({
        year,
        value: lookup.get(`${region}::${year}`)?.tmean ?? null,
      })),
    })),
  };
}

/* ------------------------------------------------------------------ *
 * Derived condition badge
 * ------------------------------------------------------------------ */

/**
 * The API has no `condition` field, so the badge is inferred from the
 * measurements. Thresholds are annual Met Office norms — retune them here
 * (rather than in the component) if your backend serves monthly data.
 */
export const CONDITION_THRESHOLDS = {
  frostyMaxTmin: 0, // °C — any region-year that froze
  rainyMinRainfall: 1200, // mm/year
  clearMinSunshine: 1500, // hours/year
};

export function deriveCondition(row: RegionYearRow): WeatherCondition {
  if (row.tmin !== null && row.tmin <= CONDITION_THRESHOLDS.frostyMaxTmin) {
    return { key: 'frosty', label: 'Frosty', emoji: '❄️' };
  }
  if (row.rainfall !== null && row.rainfall >= CONDITION_THRESHOLDS.rainyMinRainfall) {
    return { key: 'rainy', label: 'Rainy', emoji: '🌧️' };
  }
  if (row.sunshine !== null && row.sunshine >= CONDITION_THRESHOLDS.clearMinSunshine) {
    return { key: 'clear', label: 'Clear', emoji: '☀️' };
  }
  return { key: 'overcast', label: 'Overcast', emoji: '☁️' };
}

/* ------------------------------------------------------------------ *
 * Filtering
 * ------------------------------------------------------------------ */

export const TIME_RANGES: TimeRangeOption[] = [
  { id: '10y', label: 'Last 10 years', years: 10 },
  { id: '25y', label: 'Last 25 years', years: 25 },
  { id: '50y', label: 'Last 50 years', years: 50 },
  { id: 'all', label: 'All years', years: null },
];

export function filterByTimeRange(rows: RegionYearRow[], range: TimeRangeOption): RegionYearRow[] {
  if (range.years === null || rows.length === 0) return rows;

  const latest = Math.max(...rows.map((r) => r.year));
  const cutoff = latest - range.years + 1;
  return rows.filter((row) => row.year >= cutoff);
}

/* ------------------------------------------------------------------ *
 * Formatting & export
 * ------------------------------------------------------------------ */

export function formatValue(value: number | null, digits = 1): string {
  if (value === null || Number.isNaN(value)) return '—';
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatTemperature(value: number | null): string {
  return value === null ? '—' : `${formatValue(value)}°C`;
}

const CSV_COLUMNS: Array<[string, (row: RegionYearRow) => string]> = [
  ['Year', (r) => String(r.year)],
  ['Region', (r) => r.region],
  ['Min Temp (°C)', (r) => formatValue(r.tmin)],
  ['Max Temp (°C)', (r) => formatValue(r.tmax)],
  ['Mean Temp (°C)', (r) => formatValue(r.tmean)],
  ['Sunshine (hrs)', (r) => formatValue(r.sunshine)],
  ['Rainfall (mm)', (r) => formatValue(r.rainfall)],
  ['Condition', (r) => deriveCondition(r).label],
];

const escapeCsv = (cell: string): string => (/[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell);

export function toCsv(rows: RegionYearRow[]): string {
  const header = CSV_COLUMNS.map(([name]) => name).join(',');
  const body = rows.map((row) => CSV_COLUMNS.map(([, read]) => escapeCsv(read(row))).join(','));
  return [header, ...body].join('\n');
}

export function downloadCsv(rows: RegionYearRow[], filename = 'weather-records.csv'): void {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
