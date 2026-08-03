import React from 'react';

interface HeatmapProps {
  selectedRegions: string[];
  timeRange: string;
  selectedCondition: string[]; // Now an array
  hasDataLoaded: boolean;
}

const SCALES: Record<string, any> = {
  temp: {
    label: 'Temperature (°C)',
    colors: ['bg-purple-200', 'bg-purple-300', 'bg-purple-400', 'bg-purple-500', 'bg-purple-600', 'bg-purple-700'],
    textColors: ['text-slate-800', 'text-slate-800', 'text-white', 'text-white', 'text-white', 'text-white'],
    ranges: [{ max: 5, label: '≤ 5' }, { max: 10, label: '6-10' }, { max: 15, label: '11-15' }, { max: 20, label: '16-20' }, { max: 25, label: '21-25' }, { max: 999, label: '≥ 26' }],
    getThresholdIndex: (val: number) => val <= 5 ? 0 : val <= 10 ? 1 : val <= 15 ? 2 : val <= 20 ? 3 : val <= 25 ? 4 : 5
  },
  rain: {
    label: 'Rainfall (mm)',
    colors: ['bg-blue-100', 'bg-blue-300', 'bg-blue-500', 'bg-blue-700', 'bg-slate-900'],
    textColors: ['text-slate-800', 'text-slate-800', 'text-white', 'text-white', 'text-white'],
    ranges: [{ max: 40, label: '≤ 40' }, { max: 80, label: '41-80' }, { max: 120, label: '81-120' }, { max: 160, label: '121-160' }, { max: 9999, label: '≥ 161' }],
    getThresholdIndex: (val: number) => val <= 40 ? 0 : val <= 80 ? 1 : val <= 120 ? 2 : val <= 160 ? 3 : 4
  },
  sun: {
    label: 'Sunshine (hrs)',
    colors: ['bg-amber-100', 'bg-amber-200', 'bg-amber-400', 'bg-amber-500', 'bg-orange-600'],
    textColors: ['text-slate-800', 'text-slate-800', 'text-slate-900', 'text-white', 'text-white'],
    ranges: [{ max: 50, label: '≤ 50' }, { max: 100, label: '51-100' }, { max: 150, label: '101-150' }, { max: 200, label: '151-200' }, { max: 9999, label: '≥ 201' }],
    getThresholdIndex: (val: number) => val <= 50 ? 0 : val <= 100 ? 1 : val <= 150 ? 2 : val <= 200 ? 3 : 4
  }
};

const COND_LABELS: Record<string, string> = { tmin: 'Min Temp', tmax: 'Max Temp', tmean: 'Mean Temp', sun: 'Sunshine', rain: 'Rainfall' };

export const Heatmap: React.FC<HeatmapProps> = ({
  selectedRegions,
  timeRange,
  selectedCondition,
  hasDataLoaded
}) => {
  const isMultiRegion = selectedRegions.length > 1;

  const columns = timeRange === 'monthly' ? ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    : timeRange === 'seasonal' ? ['WIN', 'SPR', 'SUM', 'AUT', 'ANN']
    : ['2020', '2021', '2022', '2023', '2024'];

  const generateMatrixData = () => {
    if (!hasDataLoaded || selectedCondition.length === 0) return [];
    
    if (isMultiRegion) {
      // RULE 2: Y-Axis = Regions. All rows use the single selected condition.
      const activeMetric = selectedCondition[0];
      const scaleType = activeMetric.includes('t') ? 'temp' : activeMetric === 'rain' ? 'rain' : 'sun';
      
      return selectedRegions.map((region, rIdx) => {
        const rowData = columns.map((col, cIdx) => {
          let base = scaleType === 'temp' ? 8 : scaleType === 'rain' ? 80 : 100;
          let variance = Math.sin(cIdx) * (scaleType === 'temp' ? 12 : 50);
          let value = Number((base + variance + (rIdx * 1.5)).toFixed(1));
          if (scaleType !== 'temp' && value < 0) value = Math.abs(value);
          return { value, scaleType };
        });
        return { rowLabel: region, data: rowData };
      });
    } else {
      // RULE 1: Y-Axis = Conditions. Each row uses its own specific scale.
      return selectedCondition.map((cond, rIdx) => {
        const scaleType = cond.includes('t') ? 'temp' : cond === 'rain' ? 'rain' : 'sun';
        const rowData = columns.map((col, cIdx) => {
          let base = scaleType === 'temp' ? 8 : scaleType === 'rain' ? 80 : 100;
          let variance = Math.sin(cIdx) * (scaleType === 'temp' ? 12 : 50);
          let value = Number((base + variance + (rIdx * 1.5)).toFixed(1));
          if (scaleType !== 'temp' && value < 0) value = Math.abs(value);
          return { value, scaleType };
        });
        return { rowLabel: COND_LABELS[cond], data: rowData };
      });
    }
  };

  const matrixData = generateMatrixData();
  
  // Determine which legends to render at the bottom based on active data
  const activeScaleKeys = Array.from(new Set(matrixData.flatMap(row => row.data.map(d => d.scaleType))));

  return (
    <section className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Distribution Heatmap</h2>
          <p className="text-sm text-slate-500 mt-1">
            {isMultiRegion 
              ? `Comparing ${COND_LABELS[selectedCondition[0]]} across multiple regions.`
              : `Comparing multiple conditions for ${selectedRegions[0]}.`}
          </p>
        </div>
      </div>

      {!hasDataLoaded ? (
        <div className="w-full h-48 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
          Load data to view heatmap distribution.
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-4">
          <div className="min-w-[700px]">
            
            <div className="flex mb-2">
              <div className="w-32 shrink-0"></div>
              {columns.map((col) => (
                <div key={col} className="flex-1 text-center text-[11px] font-semibold text-slate-400 tracking-wider">{col}</div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              {matrixData.map((row) => (
                <div key={row.rowLabel} className="flex items-center group">
                  <div className="w-32 shrink-0 text-sm font-medium text-slate-600 truncate pr-4 group-hover:text-blue-600 transition-colors">
                    {row.rowLabel}
                  </div>
                  
                  {row.data.map((cell, idx) => {
                    const currentScale = SCALES[cell.scaleType];
                    const colorIndex = currentScale.getThresholdIndex(cell.value);
                    const bgColor = currentScale.colors[colorIndex];
                    const textColor = currentScale.textColors[colorIndex];

                    return (
                      <div key={`${row.rowLabel}-${idx}`} className={`flex-1 mx-0.5 h-10 flex items-center justify-center rounded-md text-sm font-medium transition-all duration-300 hover:scale-[1.05] hover:shadow-md cursor-default ${bgColor} ${textColor}`} title={`${row.rowLabel} - ${columns[idx]}: ${cell.value}`}>
                        {cell.value}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Dynamic Legends */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4">
              {activeScaleKeys.map(scaleKey => {
                const scale = SCALES[scaleKey];
                return (
                  <div key={scaleKey} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-32 shrink-0">{scale.label}:</span>
                    <div className="flex flex-wrap gap-2">
                      {scale.ranges.map((range: any, idx: number) => (
                        <div key={idx} className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${scale.colors[idx]} ${scale.textColors[idx]}`}>
                          {range.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      )}
    </section>
  );
};