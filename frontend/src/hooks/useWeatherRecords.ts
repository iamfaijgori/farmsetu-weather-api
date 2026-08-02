import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { fetchAllRecords, toReadableError } from '../lib/api';
import { pivotRecords } from '../lib/transforms';
import type { RecordQuery, RegionYearRow, WeatherRecord } from '../types/weather';

export interface UseWeatherRecordsResult {
  /** Raw rows exactly as the API returned them. */
  records: WeatherRecord[];
  /** Pivoted to one row per region-year — what the UI renders. */
  rows: RegionYearRow[];
  /** Every distinct region present, alphabetised. */
  regions: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Loads the full record set for a query and keeps it pivoted.
 *
 * Region and year filtering happen client-side so the charts can respond
 * without a round trip. Pass `query` only for filters you want the *server*
 * to apply (and remember to memoise it, or wrap it in a stable object —
 * the dependency below compares by serialised value to avoid that trap).
 */
export function useWeatherRecords(query: RecordQuery = {}): UseWeatherRecordsResult {
  const [records, setRecords] = useState<WeatherRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const queryKey = JSON.stringify(query);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setIsLoading(true);
    setError(null);

    fetchAllRecords(JSON.parse(queryKey) as RecordQuery, controller.signal)
      .then((data) => {
        if (active) setRecords(data);
      })
      .catch((err: unknown) => {
        if (!active || axios.isCancel(err)) return;
        setError(toReadableError(err));
        setRecords([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [queryKey, reloadToken]);

  const rows = useMemo(() => pivotRecords(records), [records]);

  const regions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.region))).sort((a, b) => a.localeCompare(b)),
    [rows],
  );

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  return { records, rows, regions, isLoading, error, refetch };
}
