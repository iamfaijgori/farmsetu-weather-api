import { HEAT_SCALE, formatValue, heatColor } from '../../lib/transforms';
import type { HeatmapData } from '../../types/weather';

export interface TemperatureHeatmapProps {
  data: HeatmapData;
  isLoading?: boolean;
}

export function TemperatureHeatmap({ data, isLoading = false }: TemperatureHeatmapProps) {
  const hasData = data.rows.length > 0 && data.columns.length > 0;

  return (
    <section className="rounded-2xl border border-[#eff6ff] bg-white px-7 py-6">
      <header>
        <h2 className="font-heading text-base font-bold text-[#1e3a5f]">Temperature Distribution Heatmap</h2>
        <p className="mt-0.5 text-xs text-[#90a1b9]">Mean temperature per region per year</p>
      </header>

      {isLoading ? (
        <div className="mt-5 h-[248px] animate-pulse rounded-xl bg-[#f8fafc]" aria-hidden="true" />
      ) : !hasData ? (
        <p className="mt-5 py-16 text-center text-sm text-[#90a1b9]">
          No mean-temperature records in range. Try a wider year range.
        </p>
      ) : (
        <div className="-mx-1 mt-5 overflow-x-auto px-1 pb-2">
          <table className="w-full min-w-[720px] border-separate border-spacing-2">
            <caption className="sr-only">Mean temperature in degrees Celsius, by region and year</caption>

            <thead>
              <tr>
                <th scope="col" className="w-[100px] p-0" />
                {data.columns.map((year) => (
                  <th
                    key={year}
                    scope="col"
                    className="p-0 text-center text-xs font-semibold uppercase tracking-[0.3px] text-[#90a1b9]"
                  >
                    {year}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.rows.map((row) => (
                <tr key={row.region}>
                  <th
                    scope="row"
                    className="w-[100px] whitespace-nowrap p-0 pr-3 text-left text-xs font-medium text-[#62748e]"
                  >
                    {row.region}
                  </th>

                  {row.cells.map((cell) => {
                    const { background, foreground } = heatColor(cell.value);

                    return (
                      <td key={cell.year} className="p-0">
                        <div
                          className="flex h-9 items-center justify-center rounded-md text-sm font-semibold tabular-nums"
                          style={{ backgroundColor: background, color: foreground }}
                          title={`${row.region} · ${cell.year}: ${formatValue(cell.value)}°C`}
                        >
                          {cell.value === null ? '·' : Math.round(cell.value)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="pr-1 text-xs text-[#90a1b9]">Scale:</span>
        {HEAT_SCALE.map((bucket) => (
          <span
            key={bucket.label}
            className="rounded-md px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: bucket.background, color: bucket.foreground }}
          >
            {bucket.label}
          </span>
        ))}
      </div>
    </section>
  );
}
