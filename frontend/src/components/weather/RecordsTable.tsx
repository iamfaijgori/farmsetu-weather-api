import { ArrowDown, ArrowUp, Download } from 'lucide-react';
import { useMemo, useState } from 'react';
import { deriveCondition, downloadCsv, formatTemperature, formatValue } from '../../lib/transforms';
import type { MetricKey, RegionYearRow } from '../../types/weather';

export const ROWS_PER_PAGE = 6;

type SortKey = 'year' | 'region' | MetricKey;
type SortDirection = 'asc' | 'desc';

interface Column {
  key: SortKey;
  label: string;
  align: 'left' | 'right';
  sortable: boolean;
}

const COLUMNS: Column[] = [
  { key: 'year', label: 'Year', align: 'left', sortable: true },
  { key: 'region', label: 'Region', align: 'left', sortable: true },
  { key: 'tmin', label: 'Min Temp', align: 'right', sortable: true },
  { key: 'tmax', label: 'Max Temp', align: 'right', sortable: true },
  { key: 'tmean', label: 'Mean Temp', align: 'right', sortable: true },
  { key: 'sunshine', label: 'Sunshine (hrs)', align: 'right', sortable: true },
  { key: 'rainfall', label: 'Rainfall (mm)', align: 'right', sortable: true },
];

function compare(a: RegionYearRow, b: RegionYearRow, key: SortKey): number {
  if (key === 'region') return a.region.localeCompare(b.region);
  if (key === 'year') return a.year - b.year;

  const left = a[key];
  const right = b[key];
  if (left === null && right === null) return 0;
  if (left === null) return 1; // nulls always sink
  if (right === null) return -1;
  return left - right;
}

/** Compact page list: 1 … current-1 current current+1 … last. */
function buildPageList(current: number, total: number): Array<number | 'gap'> {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  return sorted.flatMap((page, index) => {
    const previous = sorted[index - 1];
    return previous !== undefined && page - previous > 1 ? ['gap' as const, page] : [page];
  });
}

export interface RecordsTableProps {
  rows: RegionYearRow[];
  isLoading?: boolean;
}

export function RecordsTable({ rows, isLoading = false }: RecordsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('year');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => (sortDirection === 'asc' ? compare(a, b, sortKey) : compare(b, a, sortKey)));
    return copy;
  }, [rows, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ROWS_PER_PAGE;
  const visible = sorted.slice(start, start + ROWS_PER_PAGE);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection(key === 'region' ? 'asc' : 'desc');
    }
    setPage(1);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#eff6ff] bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1f5f9] px-7 py-5">
        <h2 className="font-heading text-base font-bold text-[#1e3a5f]">Detailed Weather Records</h2>

        <button
          type="button"
          onClick={() => downloadCsv(sorted)}
          disabled={sorted.length === 0}
          className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] px-4 py-2 text-sm font-medium text-[#45556c] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b7fff]/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Export
        </button>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="bg-[#f8fafc]">
              {COLUMNS.map((column) => {
                const isActive = column.key === sortKey;

                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className={`px-5 py-3 text-xs font-semibold uppercase tracking-[0.84px] text-[#90a1b9] ${
                      column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className={`inline-flex items-center gap-1 uppercase tracking-[0.84px] transition-colors hover:text-[#45556c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b7fff]/40 ${
                        isActive ? 'text-[#45556c]' : ''
                      }`}
                    >
                      {column.label}
                      {isActive &&
                        (sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <ArrowDown className="h-3 w-3" aria-hidden="true" />
                        ))}
                    </button>
                  </th>
                );
              })}
              <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.84px] text-[#90a1b9]">
                Condition
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading &&
              Array.from({ length: ROWS_PER_PAGE }, (_, index) => (
                <tr key={`skeleton-${index}`} className="border-t border-[#f8fafc]">
                  <td colSpan={COLUMNS.length + 1} className="px-5 py-4">
                    <div className="h-5 animate-pulse rounded bg-[#f1f5f9]" />
                  </td>
                </tr>
              ))}

            {!isLoading && visible.length === 0 && (
              <tr className="border-t border-[#f8fafc]">
                <td colSpan={COLUMNS.length + 1} className="px-5 py-14 text-center text-sm text-[#90a1b9]">
                  No records match these filters. Clear a filter to see more.
                </td>
              </tr>
            )}

            {!isLoading &&
              visible.map((row) => {
                const condition = deriveCondition(row);
                const isFreezing = row.tmin !== null && row.tmin <= 0;

                return (
                  <tr key={row.key} className="border-t border-[#f8fafc] transition-colors hover:bg-[#f8fafc]">
                    <td className="px-5 py-4 text-sm tabular-nums text-[#62748e]">{row.year}</td>
                    <td className="px-5 py-4 text-sm font-medium text-[#2b7fff]">{row.region}</td>
                    <td
                      className={`px-5 py-4 text-right text-sm font-semibold tabular-nums ${
                        isFreezing ? 'text-[#ff2056]' : 'text-[#314158]'
                      }`}
                    >
                      {formatTemperature(row.tmin)}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold tabular-nums text-[#314158]">
                      {formatTemperature(row.tmax)}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold tabular-nums text-[#314158]">
                      {formatTemperature(row.tmean)}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-medium tabular-nums text-[#fe9a00]">
                      {formatValue(row.sunshine)}
                    </td>
                    <td className="px-5 py-4 text-right text-sm tabular-nums text-[#62748e]">
                      {formatValue(row.rainfall)}
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[#45556c]">
                      <span className="flex items-center gap-1.5">
                        <span aria-hidden="true">{condition.emoji}</span>
                        {condition.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f1f5f9] px-7 py-3">
        <p className="text-xs text-[#90a1b9]">
          {sorted.length === 0
            ? 'No records'
            : `Showing ${start + 1}–${Math.min(start + ROWS_PER_PAGE, sorted.length)} of ${sorted.length} records`}
        </p>

        <nav aria-label="Records pagination" className="flex items-center gap-2">
          {buildPageList(safePage, totalPages).map((entry, index) =>
            entry === 'gap' ? (
              <span key={`gap-${index}`} className="grid h-7 w-7 place-items-center text-xs text-[#62748e]">
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                aria-current={entry === safePage ? 'page' : undefined}
                onClick={() => setPage(entry)}
                className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b7fff]/40 ${
                  entry === safePage ? 'bg-[#2b7fff] text-white' : 'text-[#62748e] hover:bg-[#f1f5f9]'
                }`}
              >
                {entry}
              </button>
            ),
          )}
        </nav>
      </footer>
    </section>
  );
}
