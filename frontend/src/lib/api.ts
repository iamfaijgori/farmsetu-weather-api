import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { PaginatedAPIResponse, RecordQuery, WeatherRecord } from '../types/weather';

/**
 * Resolve the API root. Vite exposes env vars on `import.meta.env`, not
 * `process.env` — the `VITE_` prefix is a Vite convention. The `process`
 * branch is a fallback for Next.js / CRA / Jest, where `import.meta.env`
 * may be undefined.
 */
function resolveBaseUrl(): string {
  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  const fromVite = viteEnv?.VITE_API_URL;
  const fromNode =
    typeof process !== 'undefined' ? process.env?.VITE_API_URL ?? process.env?.NEXT_PUBLIC_API_URL : undefined;

  return (fromVite ?? fromNode ?? 'http://localhost:8000/api/v1').replace(/\/$/, '');
}

export const API_BASE_URL = resolveBaseUrl();
export const RECORDS_PATH = '/records/';

/** Hard ceiling so a runaway `next` chain can never lock the browser up. */
export const MAX_PAGES = 40;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
  // Flip to `true` if the Django backend uses session auth rather than a token.
  withCredentials: false,
});

/** Turns an axios failure into something worth putting in front of a user. */
export function toReadableError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ detail?: string }>;

    if (err.code === 'ERR_CANCELED') return 'Request cancelled.';
    if (err.code === 'ECONNABORTED') return 'The request timed out. The API took longer than 15 seconds to respond.';
    if (!err.response) {
      return `Can't reach the API at ${API_BASE_URL}. Check that the Django server is running and that CORS allows this origin.`;
    }

    const { status } = err.response;
    if (status === 401 || status === 403) return 'Not authorised to read these records. Check your API credentials.';
    if (status === 404) return `No endpoint at ${API_BASE_URL}${RECORDS_PATH}. Check the API base URL.`;
    if (status >= 500) return 'The API returned a server error. Try again shortly.';

    return err.response.data?.detail ?? `Request failed with status ${status}.`;
  }

  return error instanceof Error ? error.message : 'Something went wrong loading weather records.';
}

/** Strips `undefined` so axios doesn't serialise `?region=undefined`. */
function cleanParams(query: RecordQuery): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== ''),
  ) as Record<string, string | number>;
}

/** Fetch a single page. */
export async function fetchRecordsPage(
  query: RecordQuery = {},
  signal?: AbortSignal,
): Promise<PaginatedAPIResponse> {
  const { data } = await apiClient.get<PaginatedAPIResponse>(RECORDS_PATH, {
    params: cleanParams({ page_size: 500, ordering: 'year', ...query }),
    signal,
  });
  return data;
}

/**
 * Walk the `next` links and return every matching record.
 *
 * The charts and heatmap aggregate across the whole result set, so partial
 * pages would render misleading numbers. If your dataset outgrows `MAX_PAGES`
 * worth of rows, add a server-side `/records/summary/` endpoint and read the
 * aggregates from there instead of pulling everything down.
 */
export async function fetchAllRecords(
  query: RecordQuery = {},
  signal?: AbortSignal,
): Promise<WeatherRecord[]> {
  const first = await fetchRecordsPage(query, signal);
  const records: WeatherRecord[] = [...first.results];

  let nextUrl = first.next;
  let page = 1;

  while (nextUrl && page < MAX_PAGES) {
    const { data } = await apiClient.get<PaginatedAPIResponse>(nextUrl, { signal });
    records.push(...data.results);
    nextUrl = data.next;
    page += 1;
  }

  if (nextUrl) {
    console.warn(
      `[weather-api] Stopped after ${MAX_PAGES} pages (${records.length} records). ` +
        'Narrow the filters or move aggregation server-side.',
    );
  }

  return records;
}
