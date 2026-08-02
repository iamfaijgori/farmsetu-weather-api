/**
 * Domain types for the Met Office climate dashboard.
 *
 * `WeatherRecord` / `PaginatedAPIResponse` mirror the Django REST Framework
 * payload exactly. Everything below them is a *view model* derived on the
 * client — the API stays the single source of truth.
 */

/** Raw row as served by DRF from `/api/v1/records/`. */
export interface WeatherRecord {
  id: number;
  region: string; // e.g. "UK", "England", "Scotland"
  parameter: string; // e.g. "Tmax", "Tmin", "Tmean", "Rainfall", "Sunshine"
  year: number;
  value: number;
}

/** Standard DRF `PageNumberPagination` envelope. */
export interface PaginatedAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WeatherRecord[];
}

/** Query params accepted by the records endpoint. */
export interface RecordQuery {
  region?: string;
  parameter?: string;
  year_min?: number;
  year_max?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
}

/** The five parameters the dashboard knows how to render. */
export type MetricKey = 'tmin' | 'tmax' | 'tmean' | 'rainfall' | 'sunshine';

/**
 * One region-year, with the flat `parameter`/`value` pairs pivoted into
 * columns. This is what the table, heatmap and stat cards actually read.
 */
export interface RegionYearRow extends Record<MetricKey, number | null> {
  /** Stable React key — `${region}::${year}`. */
  key: string;
  region: string;
  year: number;
}

export type ConditionKey = 'clear' | 'rainy' | 'frosty' | 'overcast';

export interface WeatherCondition {
  key: ConditionKey;
  label: string;
  emoji: string;
}

/** Aggregate figures behind the five stat cards. */
export interface WeatherSummary {
  minTemperature: number | null;
  maxTemperature: number | null;
  meanTemperature: number | null;
  sunshineHours: number | null;
  totalRainfall: number | null;
}

/** One x-position on the timeline chart. */
export interface TimelinePoint {
  year: number;
  temperature: number | null;
  rainfall: number | null;
  sunshine: number | null;
}

/** Region-major matrix backing the heatmap. */
export interface HeatmapData {
  columns: number[];
  rows: Array<{
    region: string;
    cells: Array<{ year: number; value: number | null }>;
  }>;
}

export interface TimeRangeOption {
  id: string;
  label: string;
  /** Number of trailing years to keep, or `null` for everything. */
  years: number | null;
}
